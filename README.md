# SPAN2001 · Práctica de pasados

Recurso de práctica B1: guía visual de ocho capítulos, diez bloques de ejercicios y quince historias originales. Interfaz y ayuda en inglés; textos, estímulos y ejemplos en español. Variedad de referencia: España.

## Abrir la versión local

Necesitas Node.js 20 o posterior. No hay dependencias ni instalación de paquetes.

Haz doble clic en **Abrir SPAN2001.cmd**, o ejecuta desde esta carpeta:

```powershell
npm run dev
```

Abre la dirección que aparece en la consola, normalmente **http://localhost:4173/**. Mantén la consola abierta mientras revisas la web. Ctrl+C detiene el servidor. Si el puerto está ocupado, se utiliza otro disponible y se muestra su dirección.

Es necesario servir la carpeta mediante HTTP: abrir `dist/index.html` directamente con `file://` bloquea las importaciones de módulos en algunos navegadores. El sitio no necesita conexión a internet para funcionar; los enlaces bibliográficos sí.

## Qué incluye

- Guía de perspectiva, escenas, duración, descripción, hábitos, narración, cambios de significado y conjugaciones; cuatro diagramas interactivos.
- Nueve bloques con 80 respuestas automáticas y un bloque con seis frases de autoevaluación guiada.
- Quince relatos graduados: cinco de 70–100 palabras y ocho huecos; cinco de 100–140 y diez huecos; cinco de 140–180 y doce huecos. Total: 150 huecos principales.
- Diez respuestas adicionales opcionales, separadas de la nota de los relatos. Practican presente, perfecto compuesto, imperativos afirmativos y una perífrasis de futuro.
- Feedback contextual para cada respuesta y para cada lectura alternativa autorizada.
- Glosas en inglés mediante ratón, enfoque de teclado o toque; Escape permite cerrarlas. Diseño adaptable y movimiento reducido.

## Corrección y progreso

Una respuesta correcta vale 1 punto; un error exclusivamente de tilde vale 0,5. Mayúsculas, espacios y Unicode equivalente no causan errores. Se mantiene la diferencia entre ñ y n, y entre ü y u. Cada alternativa válida se declara y explica de forma individual: no se acepta automáticamente «el otro tiempo».

Se puede comprobar cualquier número de respuestas, incluso ninguna. Los huecos vacíos cuentan como errores de 0 puntos y reciben su explicación; la nota siempre usa el total de la actividad. La primera nota permanece; los siguientes intentos se muestran como revisión. Las soluciones se desbloquean tras la primera comprobación y nunca sobrescriben esa nota. Los retos opcionales tienen su propio registro. Todas las lecturas alternativas admitidas aparecen visibles en el feedback, sin desplegables.

El progreso distingue una comprobación parcial de una actividad completada: para completar una actividad automática hay que responder todos los huecos y comprobarlos. La escritura se completa al escribir las seis frases y compararlas con los modelos; su puntuación sigue siendo autoevaluada. Una actividad ya completada conserva ese reconocimiento al revisar después las respuestas.

Veinte medallas se desbloquean mediante avisos y se reúnen en «Progress». Premian primeras actividades, grupos de historias, comparación de modelos, revisiones con 100% y retos opcionales. El porcentaje principal corresponde a los diez bloques y quince historias; exactitud y retos opcionales se muestran aparte. Al completar esas 25 actividades se obtiene **Listo para la prueba de progreso 2**. Las medallas indican práctica completada, no una calificación de dominio.

Las frases completas no se comparan con una cadena exacta ni se envían a una IA. El alumno compara modelos y variantes y se asigna un punto por forma y otro por perspectiva. La nota se identifica como **Self-assessed score**. Editar una frase elimina su autoevaluación anterior.

El navegador guarda las respuestas y notas en `localStorage`, bajo `perspectiva.progress.v1`. No hay cuentas, envío de respuestas ni seguimiento docente. El progreso no se sincroniza entre dispositivos; si el almacenamiento está bloqueado, la práctica sigue disponible durante esa visita. «Progress» permite borrar el registro de esta colección en ese navegador.

## Archivos y mantenimiento

- `dist/content/guide.js`: explicaciones, tablas y enlaces a la práctica.
- `dist/content/exercises.js`: bloques, modelos de escritura y respuestas.
- `dist/content/stories.js`: relatos, glosas, ampliaciones y fuentes históricas.
- `dist/engine.js`: corrección y puntuación independientes del navegador.
- `dist/achievements.js` y `dist/achievements.css`: criterios, cálculo y presentación de las veinte medallas.
- `dist/app.js`, `dist/styles.css`, `dist/institutional.css`, `dist/visuals.js`: interacción, interfaz y diagramas de la guía.
- `dist/assets/illustrations/`: veintidós ilustraciones originales generadas: portada, quince relatos y seis escenas de la guía, con caricaturas didácticas y fondo blanco.
- `assets/source-illustrations/` y `assets/illustration-prompts.json`: láminas originales, prompts y correspondencia de recortes.
- `dist/assets/achievements/`: veinte medallas PNG con transparencia alfa real, extraídas de una sola lámina generada. `assets/achievement-prompts.json` conserva el prompt; `scripts/crop-achievements.ps1` repite los recortes.
- `dist/assets/branding/hku-logo.jpg`: identidad original de HKU, sin redibujar. Fuente: https://www.hku.hk/en/about-hku/university-identity/basic-specifications .

Identidad de la interfaz: SPAN2001, Departamento de Español de la Universidad de Hong Kong. Elaborado por Pablo Torrado. Enlace del programa: https://spanish.hku.hk/ . Verde principal HKU: `#024638`.

Los huecos se escriben como `{{id}}`; las glosas, como `[[palabra|contextual English explanation]]`. Cada forma aceptada incluye su tiempo y su explicación. Los cambios que invaliden notas anteriores requieren una migración: `contentRevisions` en `engine.js` permite renovar una actividad conservando las demás. La revisión 2 de «La receta de la abuela» elimina únicamente la respuesta de la cocina y renueva su nota para practicar «Su cocina estaba en el centro de la casa»; conserva sus otras respuestas y el resto del progreso. Para cambios globales incompatibles se puede incrementar `CONTENT_VERSION` y la versión de la clave de almacenamiento.

## Verificación

```powershell
npm test
npm run check
npm run check:ui
```

Las pruebas verifican normalización, crédito parcial, ñ, alternativas, diagnósticos, formas compuestas, intentos incompletos y vacíos, conservación de la primera nota, revisión, migraciones, persistencia, autoevaluación y los veinte criterios de medallas. El validador comprueba conteos, extensiones, enlaces a capítulos, IDs, correspondencia de huecos, glosas y cobertura individual de feedback.

`check:ui` renderiza las 43 rutas, verifica enlaces relativos y firmas de imágenes, y comprueba los ocho estados de los cuatro diagramas interactivos. También simula las comprobaciones parciales y vacías, la revisión completa posterior, la conservación de notas y las alternativas visibles; verifica las veinte medallas en progreso. Las veintidós ilustraciones web ocupan aproximadamente 2,39 MB en total. El calendario conserva sus dos estados SVG originales. Se conservan los PNG y todos los prompts; la lámina de la guía se editó para dar margen a los recortes. El script `scripts/crop-illustrations.ps1` permite repetir todos los recortes desde las láminas guardadas.

La validación de plantillas y de interacciones simuladas no sustituye una inspección visual en móvil y escritorio. Todas las imágenes finales se han inspeccionado para revisar el estilo, los objetos y los márgenes de recorte.

Para una revisión docente, conviene probar «Dos opciones posibles», leer las respuestas alternativas de los relatos y revisar los dos textos históricos. Los personajes son ficticios; las fechas se apoyan en NASA y Congreso de los Diputados. La guía enlaza a RAE–ASALE y su explicación del aspecto.

## Publicación en Netlify

Web: https://span2001-practica-de-pasados.netlify.app/ . Netlify publica únicamente `dist`; el proyecto editable, las láminas y los prompts permanecen en GitHub. `netlify.toml` declara el directorio y las comprobaciones para una posible conexión futura del repositorio. La publicación actual es manual mediante la API de Netlify, sin enlazar automáticamente GitHub.

`netlify-site.json` conserva el identificador público del sitio, su nombre y URL; no contiene credenciales. Para revisar el destino y los archivos sin consultar ni modificar Netlify:

```powershell
npm run deploy:netlify
```

Después de guardar todos los cambios en un commit, publica con:

```powershell
npm run deploy:netlify -- --publish
```

El script exige un repositorio limpio, ejecuta las pruebas y los dos validadores, reutiliza la sesión local de Netlify CLI o `NETLIFY_AUTH_TOKEN`, y envía un inventario SHA-1 de `dist` a la [API oficial de Netlify](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/#file-digest-method). Solo sube los archivos nuevos y espera a que el despliegue figure como la versión pública. No imprime ni guarda tokens. Si se utiliza otro equipo, inicia sesión con Netlify CLI o configura el token en el entorno; no lo añadas al repositorio.

Las rutas son enlaces por hash, por lo que no necesitan una redirección global. El progreso se guarda por dominio en el navegador: las notas de GitHub Pages y Netlify son independientes.

## Publicación en GitHub Pages

Web: https://balpomorelitm.github.io/span2001-practica-de-pasados/ . Repositorio: https://github.com/balpomorelitm/span2001-practica-de-pasados . La rama `main` guarda el proyecto editable; la rama `gh-pages` contiene únicamente `dist`. Las imágenes de trabajo y los prompts quedan fuera del directorio publicado. Se mantienen los enlaces por hash y el corrector funciona en el navegador sin servicios de IA.

Después de comprobar y guardar los cambios en `main`, ejecuta `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy-pages.ps1 -Publish`. Consulta `.github/PAGES.md` para los detalles. Las versiones anteriores de las ilustraciones se conservan solo localmente en `.qa/`, excluida del repositorio.
