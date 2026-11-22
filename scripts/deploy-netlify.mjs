import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publishDirectory = path.join(root, 'dist');
const arguments_ = process.argv.slice(2);
if (arguments_.includes('--help')) {
  console.log('node scripts/deploy-netlify.mjs [--publish]\nSin --publish: revisa la configuración y los archivos, sin modificar Netlify.\nCon --publish: exige un repositorio limpio, ejecuta las comprobaciones y publica dist.');
  process.exit(0);
}
if (arguments_.some(argument => argument !== '--publish')) throw new Error('Opción desconocida. Utiliza --help.');
const publish = arguments_.includes('--publish');

function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function assertClean() {
  if (git('status', '--porcelain')) throw new Error('Guarda todos los cambios en un commit antes de publicar.');
}
async function readConfiguration() {
  let configuration;
  try { configuration = JSON.parse(await readFile(path.join(root, 'netlify-site.json'), 'utf8')); }
  catch { throw new Error('Falta netlify-site.json o no contiene JSON válido. Consulta el apartado de Netlify del README.'); }
  const siteId = configuration.siteId || configuration.siteID || configuration.id;
  if (typeof siteId !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(siteId)) {
    throw new Error('netlify-site.json debe incluir el identificador UUID del sitio en siteId.');
  }
  return { ...configuration, siteId };
}
async function collectFiles(directory, prefix = '') {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name, 'en'));
  for (const entry of entries) {
    if (entry.isSymbolicLink()) throw new Error('No se admiten enlaces simbólicos dentro de dist.');
    const relative = prefix + entry.name;
    if (/[#?\\]/.test(relative)) throw new Error('Ruta de publicación no válida: ' + relative);
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute, relative + '/'));
    else if (entry.isFile()) {
      const contents = await readFile(absolute);
      files.push({ path: '/' + relative, contents, digest: createHash('sha1').update(contents).digest('hex') });
    }
  }
  return files;
}
async function authenticationToken() {
  if (process.env.NETLIFY_AUTH_TOKEN) return process.env.NETLIFY_AUTH_TOKEN;
  const configurationPath = process.platform === 'win32'
    ? path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'netlify', 'Config', 'config.json')
    : path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'netlify', 'config.json');
  try {
    const configuration = JSON.parse(await readFile(configurationPath, 'utf8'));
    const token = configuration.users?.[configuration.userId]?.auth?.token;
    if (typeof token === 'string' && token) return token;
  } catch { /* Report a generic error without exposing local credentials. */ }
  throw new Error('Inicia sesión con Netlify CLI o configura NETLIFY_AUTH_TOKEN en el entorno.');
}

const configuration = await readConfiguration();
let files = await collectFiles(publishDirectory);
if (!files.some(file => file.path === '/index.html')) throw new Error('dist no contiene index.html.');
console.log('Sitio Netlify: ' + (configuration.name || configuration.siteId));
console.log('Directorio: dist · ' + files.length + ' archivos · ' + (files.reduce((sum, file) => sum + file.contents.length, 0) / 1024 / 1024).toFixed(2) + ' MiB');
if (!publish) {
  console.log('Revisión local terminada. No se ha consultado ni modificado Netlify. Para publicar: npm run deploy:netlify -- --publish');
  process.exit(0);
}

assertClean();
const commit = git('rev-parse', 'HEAD');
const tests = (await readdir(path.join(root, 'tests'))).filter(file => file.endsWith('.test.mjs')).sort().map(file => path.join('tests', file));
if (!tests.length) throw new Error('No se encontraron las pruebas del proyecto.');
for (const args of [['--test', ...tests], ['scripts/check-content.mjs'], ['scripts/check-interface.mjs']]) {
  execFileSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
}
assertClean();
if (git('rev-parse', 'HEAD') !== commit) throw new Error('El commit ha cambiado durante las comprobaciones. Repite la publicación.');
// Reload after the checks; this exact in-memory snapshot is sent to Netlify.
files = await collectFiles(publishDirectory);
const token = await authenticationToken();
async function request(endpoint, { method = 'GET', body, binary = false } = {}) {
  const response = await fetch('https://api.netlify.com/api/v1/' + endpoint, {
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json',
      'User-Agent': 'SPAN2001ManualDeploy/1.0',
      ...(body === undefined ? {} : { 'Content-Type': binary ? 'application/octet-stream' : 'application/json' }),
    },
    body: body === undefined ? undefined : binary ? body : JSON.stringify(body),
    redirect: 'error', signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error('Netlify devolvió HTTP ' + response.status + ' al ' + method + ' ' + endpoint.split('?')[0]);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
const site = await request('sites/' + encodeURIComponent(configuration.siteId));
if (site.id !== configuration.siteId) throw new Error('Netlify devolvió un sitio distinto del configurado.');
if (configuration.name && site.name !== configuration.name) throw new Error('El nombre de Netlify no coincide con netlify-site.json. Revisa el destino.');
console.log('Publicando el commit ' + commit.slice(0, 7) + ' en ' + site.name + '…');
const deploy = await request('sites/' + encodeURIComponent(configuration.siteId) + '/deploys', {
  method: 'POST', body: { files: Object.fromEntries(files.map(file => [file.path, file.digest])), draft: false, title: 'SPAN2001 ' + commit.slice(0, 7) },
});
if (!deploy?.id || !Array.isArray(deploy.required)) throw new Error('La respuesta de creación del despliegue no es válida.');
const byDigest = new Map(files.map(file => [file.digest, file]));
for (const digest of new Set(deploy.required)) {
  const file = byDigest.get(digest);
  if (!file) throw new Error('Netlify pidió un archivo que no pertenece a dist.');
  const encodedPath = file.path.slice(1).split('/').map(encodeURIComponent).join('/');
  await request('deploys/' + encodeURIComponent(deploy.id) + '/files/' + encodedPath, { method: 'PUT', body: file.contents, binary: true });
}
console.log('Archivos nuevos enviados: ' + new Set(deploy.required).size + '. Esperando la publicación…');
const deadline = Date.now() + 180000;
let previousState = '';
while (Date.now() < deadline) {
  const state = await request('deploys/' + encodeURIComponent(deploy.id));
  if (state.state !== previousState) console.log('Estado Netlify: ' + state.state);
  previousState = state.state;
  if (state.state === 'ready') {
    const publishedSite = await request('sites/' + encodeURIComponent(configuration.siteId));
    if (publishedSite.published_deploy?.id !== deploy.id) throw new Error('El despliegue está listo, pero no es la versión pública actual. Comprueba si el sitio tiene bloqueada la publicación.');
    console.log('Publicado: ' + (publishedSite.ssl_url || publishedSite.url || configuration.url));
    console.log('Despliegue: ' + (state.deploy_ssl_url || state.deploy_url || state.id));
    process.exit(0);
  }
  if (['error', 'failed', 'rejected', 'canceled'].includes(state.state)) throw new Error('El despliegue terminó con estado ' + state.state + '.');
  await new Promise(resolve => setTimeout(resolve, 2000));
}
throw new Error('El despliegue no terminó en tres minutos. Consulta el panel de Netlify antes de repetirlo.');
