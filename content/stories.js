import { unitStories } from './unit-stories.js';

const I = (cue, form, feedback, alternatives = []) => ({ cue, answers: [{ form, tense: 'imperfect', feedback }, ...alternatives] });
const P = (cue, form, feedback, alternatives = []) => ({ cue, answers: [{ form, tense: 'preterite', feedback }, ...alternatives] });
const A = (form, tense, feedback) => ({ form, tense, feedback });
function story(n, title, description, guide, theme, text, gaps, extra, note, sources) {
  const prefix = 's' + String(n).padStart(2, '0');
  const label = 'story-' + String(n).padStart(2, '0');
  return { id: label, title, description, level: n <= 5 ? 'Start' : n <= 10 ? 'Build' : 'Stretch', guide, theme, readingMinutes: n <= 5 ? 2 : 3,
    text: text.replace(/\{\{(\d+)\}\}/g, (_, id) => '{{' + prefix + 'g' + id + '}}'),
    gaps: gaps.map((gap, i) => ({ ...gap, id: prefix + 'g' + (i + 1) })),
    ...(extra ? { extra: { ...extra, text: extra.text.replace(/\{\{(\d+)\}\}/g, (_, id) => '{{' + prefix + 'e' + id + '}}'), gaps: extra.gaps.map((gap, i) => ({ ...gap, id: prefix + 'e' + (i + 1) })) } } : {}),
    ...(note ? { note } : {}), ...(sources ? { sources } : {}) };
}
const extraGap = (cue, form, tense, feedback, alternatives = []) => ({ cue, answers: [A(form, tense, feedback), ...alternatives] });

export const stories = [
  story(1, 'El ruido del rellano', 'A frightening noise has a surprisingly small explanation.', 'scene', 'A fright',
    `El martes pasado {{1}} casi medianoche y yo {{2}} solo en casa. Leía una revista cuando {{3}} un golpe en el [[rellano|landing: the space outside a flat, between flights of stairs]]. Un momento después {{4}} pasos muy lentos. {{5}} tanto miedo que apagué la luz y me acerqué a la puerta sin hacer ruido.

Al final, la {{6}} un poco y {{7}} a mi vecina con una caja enorme. Dentro había un gato, que {{8}} a [[maullar|meow: make the sound a cat makes]] al verme. ¡El misterioso visitante solo quería salir!`, [
      I('{es}ser{/es} · {es}la hora{/es}','era','Imperfect: the time establishes the scene; it is not another event in the sequence.'),
      I('{es}estar{/es} · {es}yo{/es}','estaba','Imperfect: being alone is the situation already in place when the narrator hears the noise.'),
      P('{es}sonar{/es} · {es}un golpe{/es}','sonó','Preterite: the bang is a new event during the reading and starts the action.'),
      P('{es}oír{/es} · {es}yo{/es}','oí','Preterite: the narrator presents hearing the footsteps as the next event after the bang. Remember the accent in {es}oí{/es}.',[A('oía','imperfect','Imperfect: {es}oía{/es} describes the footsteps being heard at that later moment, opening a close-up of the frightening scene.')]),
      I('{es}tener{/es} · {es}yo{/es}','tenía','Imperfect: fear is described from inside the experience and explains turning off the light.',[A('tuve','preterite','Preterite: {es}tuve{/es} presents the fear as a whole reaction to the footsteps, with turning off the light as its consequence.')]),
      P('{es}abrir{/es} · {es}yo{/es}','abrí','Preterite: opening the door advances the story; the door is now partly open.'),
      P('{es}ver{/es} · {es}yo{/es}','vi','Preterite: seeing the neighbour is the discovery resolving the mystery. {es}Vi{/es} has no written accent.'),
      P('{es}empezar{/es} · {es}el gato{/es}','empezó','Preterite: the cat starts meowing at a particular moment, when it sees the narrator.')
    ]),
  story(2, 'Una llamada inesperada', 'Good news interrupts an ordinary Saturday lunch.', 'scene', 'Joy',
    `El sábado, mientras yo {{1}} preparando la comida, mi móvil {{2}}. {{3}} mi hermana, que {{4}} en otra ciudad por su trabajo. Hablábamos casi todos los días, pero aquella vez su voz {{5}} diferente. Me dijo: «¡Ya tengo las llaves de mi nueva casa!».

Entonces yo {{6}} la cuchara sobre la mesa y {{7}} a llorar de alegría. Mi hermana {{8}} y prometió invitarme a cenar. Aquella tarde buscamos juntas unos muebles por internet y elegimos un sofá amarillo.`, [
      I('{es}estar{/es} · {es}yo{/es} · {es}preparando{/es} is given','estaba','Imperfect: {es}estaba preparando{/es} places the cooking in progress when the phone rings. Conjugate {es}estar{/es}; {es}preparando{/es} stays unchanged.'),
      P('{es}sonar{/es} · {es}mi móvil{/es}','sonó','Preterite: the phone rings as a new event during the cooking.'),
      I('{es}ser{/es} · {es}la persona que llamaba{/es}','era','Imperfect: this identifies the caller, supplying information about the situation rather than a new action.'),
      I('{es}vivir{/es} · {es}mi hermana{/es}','vivía','Imperfect: her life in another city is background relevant at the time of the call.'),
      I('{es}parecer{/es} · {es}su voz{/es}','parecía','Imperfect: the narrator describes the voice while listening, before explaining why it sounds different.',[A('pareció','preterite','Preterite: {es}pareció{/es} presents the impression made by the voice as a particular perception on this call.')]),
      P('{es}dejar{/es} · {es}yo{/es}','dejé','Preterite: putting down the spoon is the first visible reaction to the news.'),
      P('{es}empezar{/es} · {es}yo{/es}','empecé','Preterite: starting to cry marks a change caused by the news. {es}Empezar{/es} changes z to c in {es}empecé{/es}.'),
      P('{es}reírse{/es} · {es}mi hermana{/es}','se rio','Preterite: her laugh is the next reaction in the exchange. Include {es}se{/es}. The current spelling {es}rio{/es} has no written accent.',[A('se reía','imperfect','Imperfect: {es}se reía{/es} describes her laughter as ongoing during the conversation and the promise, rather than presenting one laugh as the next event. Include {es}se{/es}.')])
    ]),
  story(3, 'La foto imposible', 'One dog makes a serious family photograph impossible.', 'narrative', 'Laughter',
    `En la fiesta de mi primo, todos {{1}} una foto seria para la abuela. Mi tío {{2}} una cámara con [[temporizador|self-timer: a camera setting that takes a photograph after a short wait]] y la {{3}} encima de una silla. Mientras nosotros {{4}} esperando frente a la pared, el perro {{5}} con un calcetín en la boca.

Mi prima {{6}} quitárselo, pero perdió el equilibrio y se sentó. En ese momento la cámara {{7}} la foto. Cuando la vimos, nos {{8}} riendo durante cinco minutos. Ahora está en casa de la abuela.`, [
      I('{es}querer{/es} · {es}todos nosotros{/es}','queríamos','Imperfect: wanting a serious photo is the group’s intention before the unexpected events.',[A('quisimos','preterite','Preterite: {es}quisimos{/es} presents wanting or deciding on the serious photograph as a particular group intention at the party.')]),
      I('{es}tener{/es} · {es}mi tío{/es}','tenía','Imperfect: possession of the camera explains the setup, rather than a new acquisition.'),
      P('{es}poner{/es} · {es}mi tío{/es}','puso','Preterite: placing the camera on the chair is a completed preparation.'),
      I('{es}estar{/es} · {es}nosotros{/es} · {es}esperando{/es} is given','estábamos','Imperfect: {es}estábamos esperando{/es} presents the waiting from inside the activity when the dog enters. The accent in {es}estábamos{/es} is required.'),
      P('{es}entrar{/es} · {es}el perro{/es}','entró','Preterite: the dog’s entrance changes the scene and moves the story forward.'),
      P('{es}intentar{/es} · {es}mi prima{/es}','intentó','Preterite: her attempt to take the sock is one episode followed by losing her balance.',[A('intentaba','imperfect','Imperfect: {es}intentaba{/es} places us inside her attempt to take the sock; losing her balance then changes the situation.')]),
      P('{es}hacer{/es} · {es}la cámara{/es}','hizo','Preterite: the photograph is taken at the particular moment when the cousin is on the floor.'),
      P('{es}estar{/es} · {es}nosotros{/es} · {es}nos{/es} and {es}riendo{/es} are given','estuvimos','Preterite: {es}nos estuvimos riendo{/es} presents the full five-minute episode of laughter. {es}Estar{/es} + gerund does not force the imperfect; the whole period is bounded.')
    ]),
  story(4, 'Un regalo con historia', 'A small birthday present leaves someone speechless.', 'description', 'A meaningful gift',
    `Mi cumpleaños {{1}} un lunes y yo no esperaba ninguna sorpresa. Como cada lunes, mis amigos {{2}} hasta tarde, así que cené con mis padres. Al terminar, mi madre me {{3}} una caja pequeña. Dentro {{4}} un reloj antiguo.

Yo lo {{5}} enseguida: pertenecía a mi abuelo. Durante años, él lo {{6}} todos los días, incluso para ir al mercado. Mi padre lo reparó en secreto y me contó la historia. Yo me {{7}} sin palabras y los {{8}} a los dos.`, [
      I('{es}ser{/es} · {es}mi cumpleaños{/es}','era','Imperfect: the weekday sets the scene and explains expecting an ordinary evening.',[A('fue','preterite','Preterite: {es}fue{/es} presents that birthday as a particular occasion and states the day it fell on. Both views fit here.')]),
      I('{es}trabajar{/es} · {es}mis amigos{/es}','trabajaban','Imperfect: como cada lunes presents the recurring work schedule explaining why the friends are unavailable.',[A('trabajaron','preterite','Preterite: {es}trabajaron{/es} presents that Monday’s work as a complete period until late, while como cada lunes compares it with their usual routine.')]),
      P('{es}entregar{/es} · {es}mi madre{/es}','entregó','Preterite: handing over the box is the event introducing the surprise.'),
      I('{es}haber{/es} · {es}un reloj{/es}','había','Imperfect: this describes the box’s contents on discovery. Existential {es}había{/es} stays singular.'),
      P('{es}reconocer{/es} · {es}yo{/es}','reconocí','Preterite: recognising the watch is a new discovery at that moment.'),
      I('{es}llevar{/es} · {es}mi abuelo{/es}','llevaba','Imperfect: {es}todos los días{/es} recalls a repeated habit from within those years.',[A('llevó','preterite','Preterite: {es}llevó{/es} sums up the grandfather’s daily use of the watch across those years as a complete stage.')]),
      P('{es}quedar{/es} · {es}yo{/es} · {es}me{/es} is already given','quedé','Preterite: {es}quedarse sin palabras{/es} marks the change in the narrator’s reaction.'),
      P('{es}abrazar{/es} · {es}yo{/es}','abracé','Preterite: hugging the parents is the final action. {es}Abrazar{/es} changes z to c in {es}abracé{/es}.')
    ]),
  story(5, 'El paraguas que volvió', 'A lost umbrella returns in an unexpected way.', 'scene', 'Something strange',
    `Una tarde de otoño yo {{1}} de la biblioteca con mucha prisa. {{2}} y las calles {{3}} casi vacías. En la parada del autobús {{4}} mi paraguas rojo al lado de un banco. Cuando llegué a casa, lo recordé, pero ya era tarde para volver.

Dos días después, mientras {{5}} pan, una niña me {{6}} el brazo. {{7}} mi paraguas y una nota con mi nombre. Su padre trabajaba en la biblioteca y {{8}} mi nombre en una tarjeta que encontró en la [[funda|cover: the protective sleeve around the umbrella]].`, [
      P('{es}salir{/es} · {es}yo{/es}','salí','Preterite: leaving the library is the first event of this afternoon.',[A('salía','imperfect','Imperfect: {es}salía{/es} opens the story with the departure in progress, rather than presenting it as a complete step.')]),
      I('{es}llover{/es} · {es}impersonal{/es}','llovía','Imperfect: the rain describes the weather surrounding the departure and forgotten umbrella.',[A('llovió','preterite','Preterite: {es}llovió{/es} sums up the rainfall over that afternoon before returning to the umbrella episode.')]),
      I('{es}estar{/es} · {es}las calles{/es}','estaban','Imperfect: the nearly empty streets form part of the scene at that moment.'),
      P('{es}dejar{/es} · {es}yo{/es}','dejé','Preterite: leaving the umbrella at the stop is the action causing the problem.'),
      I('{es}comprar{/es} · {es}yo{/es}','compraba','Imperfect: buying bread is in progress when the girl touches the narrator’s arm.'),
      P('{es}tocar{/es} · {es}una niña{/es}','tocó','Preterite: the touch begins the encounter during the shopping.'),
      I('{es}llevar{/es} · {es}la niña{/es}','llevaba','Imperfect: this describes what the girl is carrying when the narrator notices her.'),
      P('{es}reconocer{/es} · {es}su padre{/es}','reconoció','Preterite: recognising the name is the discovery enabling the return of the umbrella.')
    ]),
  story(6, 'Los veranos de mi barrio', 'A summer routine becomes a neighbourhood cinema.', 'habits', 'Childhood',
    `A principios de los años 2000, cuando {{1}} pequeños, mi hermana y yo {{2}} los veranos en casa de nuestra tía. La casa {{3}} un patio con una fuente y siempre {{4}} a pan tostado por la mañana. Cada tarde, los niños del barrio y yo {{5}} allí mientras los adultos hablaban en la puerta. Una pelota era suficiente.

Un verano, el ayuntamiento {{6}} nuestra calle durante una semana para arreglar las [[tuberías|pipes: the tubes carrying water under the street]]. Al principio nos enfadamos, pero una vecina {{7}} organizar un cine en su garaje. Nosotros {{8}} una sábana blanca y todos los vecinos {{9}} sillas. Aquella semana {{10}} cuatro películas y descubrimos otra forma de estar juntos. Hoy en día ya no hacemos cine allí, pero todavía nos reunimos en el patio.`, [
      I('{es}ser{/es} · {es}mi hermana y yo{/es}','éramos','Imperfect: childhood is the period from inside which the summer routines are recalled.'),
      I('{es}pasar{/es} · {es}mi hermana y yo{/es}','pasábamos','Imperfect: los veranos presents a recurring arrangement, rather than counting all visits.'),
      I('{es}tener{/es} · {es}la casa{/es}','tenía','Imperfect: the patio is a characteristic of the house in the remembered scene.'),
      I('{es}oler{/es} · {es}la casa{/es}','olía','Imperfect: the recurring morning smell belongs to the summer routine.'),
      I('{es}jugar{/es} · {es}los niños y yo{/es}','jugábamos','Imperfect: cada tarde introduces a repeated activity within neighbourhood life. The subject includes {es}yo{/es}, so use {es}nosotros{/es}.'),
      P('{es}cerrar{/es} · {es}el ayuntamiento{/es}','cerró','Preterite: the one-week closure is a complete episode rather than a moment inside the closure.'),
      P('{es}proponer{/es} · {es}una vecina{/es}','propuso','Preterite: the proposal changes the children’s plans and starts the cinema project.'),
      P('{es}colgar{/es} · {es}nosotros{/es}','colgamos','Preterite: hanging the sheet is one completed preparation for the cinema.'),
      P('{es}traer{/es} · {es}todos los vecinos{/es}','trajeron','Preterite: bringing chairs is a completed preparation. The stem is {es}traj-{/es}, with -eron in the plural.'),
      P('{es}ver{/es} · {es}nosotros{/es}','vimos','Preterite: four films form a counted complete series within one week. Repetition also permits a whole-event view.')
    ]),
  story(7, 'Un picnic bajo la lluvia', 'Bad weather changes the plan, but not the afternoon.', 'duration', 'Friends and weather',
    `El domingo pasado, mis amigos y yo {{1}} a un parque junto al río. Al llegar, el sol {{2}} y apenas {{3}} nubes. Marta {{4}} una tortilla enorme y nosotros teníamos hambre. Extendimos una manta bajo un árbol y sacamos los platos. Mientras Pablo {{5}} cortando el pan, una gota {{6}} sobre su mano. Miramos al cielo: una nube negra tapaba ya el sol.

La lluvia {{7}} de repente y todos {{8}} hacia un pequeño [[cobertizo|shelter: a simple roofed structure offering protection from the rain]]. Como el espacio {{9}} muy pequeño, nos sentamos muy juntos y compartimos la tortilla allí. Al final {{10}} hablando y escuchando la lluvia durante dos horas. No fue el picnic que imaginábamos, pero todavía lo recordamos con cariño.`, [
      P('{es}ir{/es} · {es}mis amigos y yo{/es}','fuimos','Preterite: the trip to the park is introduced as one outing last Sunday.'),
      I('{es}brillar{/es} · {es}el sol{/es}','brillaba','Imperfect: sunshine is the weather the group encounters on arrival, before the change.'),
      I('{es}haber{/es} · {es}nubes{/es}','había','Imperfect: the lack of clouds describes the initial sky. Existential {es}había{/es} remains singular.'),
      I('{es}llevar{/es} · {es}Marta{/es}','llevaba','Imperfect: this describes what Marta has with her at the picnic.',[A('llevó','preterite','Preterite: {es}llevó{/es} reports bringing the tortilla as Marta’s completed contribution to the picnic.')]),
      I('{es}estar{/es} · {es}Pablo{/es} · {es}cortando{/es} is given','estaba','Imperfect: {es}estaba{/es} {es}cortando{/es} shows the bread-cutting in progress at the moment the drop falls. Only {es}estar{/es} changes; {es}cortando{/es} is already supplied.'),
      P('{es}caer{/es} · {es}una gota{/es}','cayó','Preterite: the drop falls as a new event during the bread-cutting.'),
      P('{es}empezar{/es} · {es}la lluvia{/es}','empezó','Preterite: the onset of rain starts a new phase of the afternoon.'),
      P('{es}correr{/es} · {es}todos nosotros{/es}','corrimos','Preterite: running to shelter is presented as the group’s complete response.'),
      I('{es}ser{/es} · {es}el espacio{/es}','era','Imperfect: the shelter’s size explains why everyone sits close together.'),
      P('{es}estar{/es} · {es}nosotros{/es} · {es}hablando{/es} is given','estuvimos','Preterite: {es}estuvimos{/es} {es}hablando{/es} includes the whole two-hour conversation. It bounds the time spent talking, without suggesting that all possible conversation was finished.')
    ]),
  story(8, 'La maleta equivocada', 'Two similar suitcases nearly disrupt a theatre performance.', 'narrative', 'Travel confusion',
    `El otro día {{1}} a Sevilla para visitar a una amiga. En la estación {{2}} mucha gente y yo {{3}} bastante cansada después del viaje. Al bajar del tren, {{4}} una maleta azul que parecía la mía. Mi amiga me esperaba junto a la salida y fuimos directamente a su casa.

Más tarde, cuando {{5}} la maleta, me quedé mirando el contenido: solo {{6}} [[disfraces|costumes: clothes used to dress as a character or animal]] de animales y zapatos enormes. Mientras yo {{7}} buscando una etiqueta con un nombre, mi teléfono {{8}}. Resulta que un hombre muy amable {{9}} mi maleta. Era actor y aquella noche participaba en una obra infantil. Nos encontramos en una cafetería y {{10}} las maletas. ¡Qué alivio! El león llegó a tiempo al teatro.`, [
      P('{es}llegar{/es} · {es}yo{/es}','llegué','Preterite: arrival in Seville begins this visit. {es}Llegar{/es} changes g to gu before {es}é{/es}.'),
      I('{es}haber{/es} · {es}mucha gente{/es}','había','Imperfect: the crowd belongs to the station scene on arrival.'),
      I('{es}estar{/es} · {es}yo{/es}','estaba','Imperfect: tiredness is the narrator’s condition when collecting the luggage.'),
      P('{es}coger{/es} · {es}yo{/es}','cogí','Preterite: picking up the wrong suitcase is the action creating the problem.'),
      P('{es}abrir{/es} · {es}yo{/es}','abrí','Preterite: opening the suitcase leads to the discovery and advances the narrative.'),
      I('{es}contener{/es} · {es}la maleta{/es}','contenía','Imperfect: this describes the contents visible inside the opened suitcase.'),
      I('{es}estar{/es} · {es}yo{/es} · {es}buscando{/es} is given','estaba','Imperfect: {es}estaba{/es} {es}buscando{/es} describes the ongoing label search interrupted by the call. The gerund {es}buscando{/es} is already written.'),
      P('{es}sonar{/es} · {es}mi teléfono{/es}','sonó','Preterite: the ring introduces an event during the search.'),
      I('{es}tener{/es} · {es}un hombre{/es}','tenía','Imperfect: {es}resulta que{/es} reveals the existing situation behind the mix-up: the man already has her suitcase. A revelation marker does not automatically require the preterite.'),
      P('{es}cambiar{/es} · {es}nosotros{/es}','cambiamos','Preterite: exchanging the suitcases completes the solution to the mix-up.')
    ]),
  story(9, 'Mi primer día de trabajo', 'A nervous bookseller mistakes a familiar visitor for a customer.', 'meaning', 'A new job',
    `Mi primer día en la librería {{1}} a las nueve. La dueña {{2}} una mujer tranquila que conocía todos los libros. Mientras ella me {{3}} cómo funcionaba la caja, yo {{4}} notas en una libreta. Me daba miedo equivocarme delante de un cliente, así que repasé cada paso varias veces.

A media mañana {{5}} un señor con un paquete. Yo {{6}} que quería devolver algo y le pedí el [[tique|receipt: the document showing what a customer bought and paid]]. El hombre me {{7}} sorprendido: no {{8}} una compra, sino mi almuerzo. ¡Era mi padre! Los clientes {{9}} y yo también. Después de aquel momento, la tensión desapareció y {{10}} atender al siguiente cliente con más confianza.`, [
      P('{es}empezar{/es} · {es}mi primer día{/es}','empezó','Preterite: the beginning of the first day is located at nine o’clock.'),
      I('{es}ser{/es} · {es}la dueña{/es}','era','Imperfect: the owner’s personality supplies background to the first day.'),
      I('{es}explicar{/es} · {es}ella{/es}','explicaba','Imperfect: the explanation unfolds alongside the note-taking.'),
      I('{es}tomar{/es} · {es}yo{/es}','tomaba','Imperfect: note-taking is viewed in progress alongside the explanation.',[A('tomé','preterite','Preterite: {es}tomé{/es} sums up the note-taking accomplished during the owner’s explanation.')]),
      P('{es}entrar{/es} · {es}un señor{/es}','entró','Preterite: the visitor’s entrance begins the next episode.'),
      P('{es}pensar{/es} · {es}yo{/es}','pensé','Preterite: the thought is the narrator’s immediate conclusion on seeing the package.',[A('pensaba','imperfect','Imperfect: {es}pensaba{/es} describes the belief held while asking for a receipt; the discovery then corrects it.')]),
      P('{es}mirar{/es} · {es}el hombre{/es}','miró','Preterite: the surprised look is a reaction to the request for a receipt.',[A('miraba','imperfect','Imperfect: {es}miraba{/es} pauses on the father’s surprised look as the narrator realises what he is carrying.')]),
      I('{es}traer{/es} · {es}el hombre{/es}','traía','Imperfect: this clarifies what the visitor is carrying at that moment.',[A('trajo','preterite','Preterite: {es}trajo{/es} sums up his completed delivery: he brought lunch, rather than a returned purchase.')]),
      P('{es}reírse{/es} · {es}los clientes{/es}','se rieron','Preterite: the laughter is the customers’ reaction to the discovery. Include {es}se{/es}.'),
      P('{es}poder{/es} · {es}yo{/es}','pude','Preterite: the narrator did manage to serve the next customer. This reports the successful occasion.',[A('podía','imperfect','Imperfect: {es}podía{/es} describes the ability and confidence the narrator now had; it does not explicitly report the next customer’s service as completed.')])
    ]),
  story(10, 'La noche sin luz', 'A power cut gives neighbours a reason to meet.', 'scene', 'Neighbours',
    `El jueves por la noche, mi compañero de piso y yo {{1}} preparando la cena cuando {{2}} todas las luces. Al principio {{3}} que el problema era solo nuestro, pero desde la ventana vimos que la calle también {{4}} a oscuras. Buscamos una [[linterna|torch: a portable electric light; flashlight in American English]] en el armario y bajamos al portal.

Allí {{5}} con varios vecinos. Una señora {{6}} unas velas y un niño {{7}} contando historias de fantasmas para asustar a su hermano. Mientras los demás {{8}} esperando noticias, nosotros repartimos el pan y el queso que llevábamos para cenar. La luz {{9}} una hora después. Aquella noche no {{10}} el horno, pero conocimos por fin a la gente del edificio.`, [
      I('{es}estar{/es} · {es}mi compañero y yo{/es}','estábamos','Imperfect: {es}estábamos{/es} {es}preparando{/es} places meal preparation in progress at the power cut.'),
      P('{es}apagarse{/es} · {es}todas las luces{/es}','se apagaron','Preterite: the lights go out as a new event during cooking. Include {es}se{/es} and the plural ending.'),
      P('{es}creer{/es} · {es}nosotros{/es}','creímos','Preterite: this presents the initial conclusion as a reaction to the lights going out.',[A('creíamos','imperfect','Imperfect: {es}creíamos{/es} describes the belief held before looking outside and discovering the wider problem.')]),
      I('{es}estar{/es} · {es}la calle{/es}','estaba','Imperfect: darkness is the street’s condition when the flatmates look outside.'),
      P('{es}encontrarse{/es} · {es}nosotros{/es}','nos encontramos','Preterite: meeting the neighbours is the next event after going downstairs. Include {es}nos{/es}.'),
      I('{es}tener{/es} · {es}una señora{/es}','tenía','Imperfect: the candles are something the neighbour has with her in the scene.'),
      I('{es}estar{/es} · {es}un niño{/es} · {es}contando{/es} is given','estaba','Imperfect: {es}estaba{/es} {es}contando{/es} takes us inside the boy’s storytelling as part of the gathering.',[A('estuvo','preterite','Preterite: {es}estuvo{/es} {es}contando{/es} sums up the time he spent telling ghost stories as a complete contribution to the gathering; {es}contando{/es} remains unchanged.')]),
      I('{es}estar{/es} · {es}los demás{/es} · {es}esperando{/es} is given','estaban','Imperfect: {es}estaban{/es} {es}esperando{/es} places the wait for news in progress while the flatmates share their food.'),
      P('{es}volver{/es} · {es}la luz{/es}','volvió','Preterite: electricity returning ends the episode without power.'),
      P('{es}usar{/es} · {es}nosotros{/es}','usamos','Preterite: the narrator looks back at the whole evening and reports no oven use during it.')
    ]),
  story(11, 'La receta de la abuela', 'A recipe brings back the sounds and smells of childhood.', 'habits', 'Family memories',
    `De pequeña, yo {{1}} muchos sábados en casa de mi abuela. Su cocina {{2}} en el centro de la casa y siempre {{3}} alguien sentado junto a la mesa. Ella no usaba libros de cocina: {{4}} las recetas de memoria. Mientras {{5}} la [[masa|dough: the mixture used to make the tart]], me contaba historias del pueblo. Yo escuchaba y limpiaba las manzanas, aunque casi siempre me comía algún trozo.

El mes pasado {{6}} su viejo cuaderno dentro de una caja. Entre las páginas {{7}} una receta de tarta con una nota para mí. Aquella tarde {{8}} hacerla. Primero {{9}} que comprar harina; después seguí los pasos con mucho cuidado. Al sacar la tarta del horno, el olor me {{10}} inmediatamente aquellos sábados. Mi hermano vino a probarla y dijo que {{11}} deliciosa. Al terminar, los dos {{12}} a nuestra abuela para contarle el resultado. Ella se rio y explicó que su ingrediente secreto era poner música mientras cocinaba.`, [
      I('{es}pasar{/es} · {es}yo{/es}','pasaba','Imperfect: many Saturdays describes the childhood routine, without counting a completed series.'),
      I('{es}estar{/es} · {es}su cocina{/es}','estaba','Imperfect: {es}estaba{/es} locates the kitchen in the centre of the house as part of the childhood setting.'),
      I('{es}haber{/es} · {es}alguien{/es}','había','Imperfect: the usual scene around the kitchen table is being recalled.'),
      I('{es}saber{/es} · {es}mi abuela{/es}','sabía','Imperfect: the grandmother already possesses the knowledge; this is not when she learns the recipes.'),
      I('{es}preparar{/es} · {es}mi abuela{/es}','preparaba','Imperfect: dough-making is the ongoing activity during which the childhood stories unfold.'),
      P('{es}encontrar{/es} · {es}yo{/es}','encontré','Preterite: finding the notebook is a discovery last month, shifting out of the childhood routine.'),
      P('{es}aparecer{/es} · {es}una receta{/es}','apareció','Preterite: the recipe comes to light as a discovery while looking through the notebook.',[A('aparecía','imperfect','Imperfect: {es}aparecía{/es} describes the recipe as visible among the pages, rather than focusing on the discovery.')]),
      P('{es}decidir{/es} · {es}yo{/es}','decidí','Preterite: the decision starts that afternoon’s baking episode.'),
      P('{es}tener{/es} · {es}yo{/es}','tuve','Preterite: {es}tuve que comprar{/es} reports a particular obligation dealt with on this occasion. {es}Comprar{/es} stays unchanged.',[A('tenía','imperfect','Imperfect: {es}tenía que comprar{/es} presents the required purchase as a task still pending at that point, before following the recipe.')]),
      P('{es}recordar{/es} · {es}el olor{/es}','recordó','Preterite: the smell triggers a particular memory when the tart comes out of the oven.'),
      I('{es}estar{/es} · {es}la tarta{/es}','estaba','Imperfect: the brother describes the taste as experienced during the tasting.',[A('estuvo','preterite','Preterite: {es}estuvo{/es} evaluates the tasting as a complete experience, a natural reading especially in several American varieties.')]),
      P('{es}llamar{/es} · {es}mi hermano y yo{/es}','llamamos','Preterite: the call is the final shared action after tasting the tart.')
    ], { title: 'Optional: two affirmative {es}tú{/es} instructions', text: 'Mi abuela me lo recuerda a menudo: «Ahora {{1}} la tarta despacio y {{2}} un poco para tu hermano».', gaps: [extraGap('{es}cortar{/es} · {es}tú{/es} · affirmative imperative','corta','imperative','Affirmative {es}tú{/es} imperative: the grandmother gives a direct instruction to cut the tart.'),extraGap('{es}guardar{/es} · {es}tú{/es} · affirmative imperative','guarda','imperative','Affirmative {es}tú{/es} imperative: the second instruction asks the listener to save some tart.')] }),
  story(12, 'El tren y la despedida', 'A familiar friendship enters a new phase at a railway station.', 'narrative', 'A goodbye',
    `Mi mejor amiga y yo {{1}} en el mismo barrio desde pequeñas. Cada mañana {{2}} juntas a clase y por las tardes estudiábamos en la biblioteca. Sin embargo, el año pasado ella consiguió un trabajo en otra ciudad y {{3}} que [[mudarse|move home: go to live in a different house or city]]. El día de su viaje, yo la {{4}} a la estación con una bolsa de bocadillos para el camino.

La estación {{5}} llena y los altavoces anunciaban salidas sin parar. Mientras nosotras {{6}} el [[andén|platform: the area beside the railway track where passengers board]], su hermano {{7}} para despedirse. Ella contestó y empezó a caminar más despacio. Yo {{8}} que aquel adiós no era fácil, así que intenté hablar de sus nuevos planes. Cuando el tren {{9}}, nos abrazamos sin decir nada. Mi amiga {{10}} al vagón y yo {{11}} hasta que el tren desapareció. Durante el regreso a casa {{12}} mucho en nuestra amistad. Dos semanas después nos vimos por videollamada: la distancia cambiaba nuestras rutinas, pero no nuestras ganas de hablar.`, [
      I('{es}vivir{/es} · {es}mi amiga y yo{/es}','vivíamos','Imperfect: sharing a neighbourhood is the existing situation introducing the friendship.'),
      I('{es}ir{/es} · {es}mi amiga y yo{/es}','íbamos','Imperfect: {es}cada mañana{/es} presents the school journey as a daily routine. {es}Íbamos{/es} needs an accent.'),
      P('{es}tener{/es} · {es}ella{/es}','tuvo','Preterite: {es}tuvo que mudarse{/es} presents a particular obligation arising from the new job.',[A('tenía','imperfect','Imperfect: {es}tenía que mudarse{/es} presents the move as an obligation pending at that point in the story.')]),
      P('{es}acompañar{/es} · {es}yo{/es}','acompañé','Preterite: accompanying her to the station is a particular action on departure day.'),
      I('{es}estar{/es} · {es}la estación{/es}','estaba','Imperfect: the crowded station supplies the setting for the goodbye.'),
      I('{es}buscar{/es} · {es}nosotras{/es}','buscábamos','Imperfect: the platform search is in progress when the brother phones.'),
      P('{es}llamar{/es} · {es}su hermano{/es}','llamó','Preterite: the call is a new event during the platform search.'),
      I('{es}saber{/es} · {es}yo{/es}','sabía','Imperfect: existing understanding of the difficult goodbye explains the attempt to discuss future plans.',[A('supe','preterite','Preterite: {es}supe{/es} presents the narrator realising the goodbye is difficult at this moment, prompting the change of subject.')]),
      P('{es}llegar{/es} · {es}el tren{/es}','llegó','Preterite: arrival marks the point at which the goodbye becomes immediate.'),
      P('{es}subir{/es} · {es}mi amiga{/es}','subió','Preterite: boarding advances the sequence beyond the embrace.'),
      P('{es}esperar{/es} · {es}yo{/es}','esperé','Preterite: the whole wait is bounded by the train disappearing.'),
      P('{es}pensar{/es} · {es}yo{/es}','pensé','Preterite: this sums up reflection during the completed journey home.',[A('pensaba','imperfect','Imperfect: {es}pensaba{/es} places us inside the journey and describes the thoughts occupying the narrator along the way.')])
    ], { title: 'Optional: present routines and {es}ir a{/es} + infinitive', text: 'Ahora nos {{1}} por videollamada cada domingo y las dos {{2}} a hacer una visita pronto.', gaps: [extraGap('{es}ver{/es} · {es}nosotras{/es} · present · {es}nos{/es} is already given','vemos','present','Present: {es}ahora{/es} and {es}cada domingo{/es} describe the current routine; {es}nos{/es} is already written.'),extraGap('{es}ir{/es} · {es}nosotras{/es} · present','vamos','present','Present in {es}ir a{/es} + infinitive: {es}vamos a hacer{/es} expresses the friends’ current plan for a future visit.')] }),
  story(13, 'Lo que cuenta el museo', 'An old station reveals an unexpected local story.', 'duration', 'A local museum',
    `El museo de nuestro pueblo {{1}} una antigua estación de tren. Yo pasaba por delante casi todos los días, pero nunca entraba. Un sábado de noviembre {{2}} visitarlo con mi sobrino. En la entrada nos {{3}} una guía que {{4}} una carpeta llena de fotografías. Nos explicó que la estación conectaba antes varios pueblos de la zona y que muchas familias dependían del [[ferrocarril|railway: the train service and its tracks]].

Mientras ella {{5}}, mi sobrino {{6}} una maleta abierta detrás de un cristal. Dentro {{7}} cartas, una manta y una taza de metal. Según el cartel, a principios del siglo XX, aquellos objetos pertenecían a una maestra que llegó al pueblo para abrir una escuela y mejorar el acceso a la [[educación|education: learning and teaching, especially at school]]. Durante veinte años, la mujer {{8}} clase en una sala muy pequeña. En una foto {{9}} [[rodeada|surrounded: with people all around her]] de niños, todos muy serios. Entonces mi sobrino {{10}} por qué nadie sonreía. La guía {{11}} y explicó que las personas [[posaban|posed: stayed in a particular position for a photograph]] de otra manera. Al salir, yo {{12}} la antigua estación con más curiosidad.`, [
      I('{es}ocupar{/es} · {es}el museo{/es}','ocupaba','Imperfect: the old station is the museum’s location at the time of the visit, setting the scene.'),
      P('{es}decidir{/es} · {es}yo{/es}','decidí','Preterite: this decision breaks the routine of passing without entering.'),
      P('{es}recibir{/es} · {es}una guía{/es}','recibió','Preterite: the welcome is the next event on entering the museum.'),
      I('{es}llevar{/es} · {es}una guía{/es}','llevaba','Imperfect: the folder is something the guide is carrying when they meet.'),
      I('{es}hablar{/es} · {es}ella{/es}','hablaba','Imperfect: the explanation is in progress when the suitcase is noticed.'),
      P('{es}descubrir{/es} · {es}mi sobrino{/es}','descubrió','Preterite: noticing the suitcase is a discovery during the explanation.'),
      I('{es}haber{/es} · {es}varios objetos{/es}','había','Imperfect: this describes the displayed contents. Existential {es}había{/es} stays singular.'),
      P('{es}dar{/es} · {es}la maestra{/es}','dio','Preterite: the full twenty-year teaching period is presented as a completed part of her life. {es}Dio{/es} has no accent.'),
      I('{es}aparecer{/es} · {es}la maestra{/es}','aparecía','Imperfect: this describes the image of the teacher in the photograph, not an event of arriving.'),
      P('{es}preguntar{/es} · {es}mi sobrino{/es}','preguntó','Preterite: the question is a particular reaction to the serious faces.'),
      P('{es}sonreír{/es} · {es}la guía{/es}','sonrió','Preterite: the guide’s smile responds to that question.'),
      P('{es}mirar{/es} · {es}yo{/es}','miré','Preterite: this final look is a particular action on leaving the museum.')
    ], { title: 'Optional: an opening time and a visitor instruction', text: 'Hoy el museo {{1}} sus puertas a las diez. Si vienes, {{2}} las fotos antiguas antes de salir.', gaps: [extraGap('{es}abrir{/es} · {es}el museo{/es} · present indicative','abre','present','Present: the sentence gives today’s opening time as visitor information.'),extraGap('{es}mirar{/es} · {es}tú{/es} · affirmative imperative','mira','imperative','Affirmative {es}tú{/es} imperative: a recommendation to look at the photographs during the visit.')] }, 'The museum, teacher and objects are fictional. This story interprets an imagined museum display rather than documenting a particular local history.'),
  story(14, 'La llegada a la Luna, desde el salón', 'A fictional child watches a documented event in July 1969.', 'narrative', 'History · Apollo 11',
    `En julio de 1969, Clara {{1}} doce años y {{2}} con sus padres en Madrid. En su casa no {{3}} televisión, así que la familia {{4}} al salón de unos vecinos para seguir la misión Apolo 11. El cuarto {{5}} lleno de sillas y todos hablaban a la vez. Mientras el presentador {{6}} la misión, Clara intentaba imaginar la distancia entre la Tierra y la Luna.

El [[módulo lunar|lunar module: the spacecraft section that landed on the Moon]] {{7}} a la superficie el 20 de julio. Para ver los primeros pasos, los vecinos {{8}} que esperar hasta la [[madrugada|early hours: the part of the night after midnight and before dawn]] del día 21 en España. Cuando Neil Armstrong {{9}} del módulo, nadie {{10}} nada durante unos segundos. Clara {{11}} a su madre, que sonreía con los ojos muy abiertos. Al terminar la transmisión, la niña {{12}} una nave en su cuaderno. Años después todavía recordaba el silencio del salón y aquella sensación de estar viendo algo que antes solo aparecía en los cuentos.`, [
      I('{es}tener{/es} · {es}Clara{/es}','tenía','Imperfect: her age is background at the time of the Moon landing.'),
      I('{es}vivir{/es} · {es}Clara{/es}','vivía','Imperfect: living with her parents is Clara’s situation in this remembered period.'),
      I('{es}haber{/es} · {es}televisión{/es}','había','Imperfect: the absence of a television explains watching at the neighbours’ home.'),
      P('{es}ir{/es} · {es}la familia{/es}','fue','Preterite: going to the neighbours’ home is a particular action to watch the mission.'),
      I('{es}estar{/es} · {es}el cuarto{/es}','estaba','Imperfect: the chairs describe the room’s arrangement when the family arrives.'),
      I('{es}explicar{/es} · {es}el presentador{/es}','explicaba','Imperfect: the explanation unfolds while Clara imagines the distance.'),
      P('{es}llegar{/es} · {es}el módulo lunar{/es}','llegó','Preterite: the landing is presented as a dated historical event on 20 July.'),
      P('{es}tener{/es} · {es}los vecinos{/es}','tuvieron','Preterite: {es}tuvieron que esperar{/es} presents the required wait as a whole, ending with the first steps.',[A('tenían','imperfect','Imperfect: {es}tenían que esperar{/es} describes the wait as still required after landing, before the first steps.')]),
      P('{es}bajar{/es} · {es}Neil Armstrong{/es}','bajó','Preterite: descending from the module marks the event linked to the room falling silent.'),
      P('{es}decir{/es} · {es}nadie{/es}','dijo','Preterite: the whole several-second interval is presented as containing no speech. Nadie takes a singular verb.'),
      P('{es}mirar{/es} · {es}Clara{/es}','miró','Preterite: the glance at her mother is a particular action during the broadcast.',[A('miraba','imperfect','Imperfect: {es}miraba{/es} describes Clara looking at her mother during the silent moment, rather than presenting one particular glance.')]),
      P('{es}dibujar{/es} · {es}la niña{/es}','dibujó','Preterite: drawing the spacecraft is the next action after the transmission.')
    ], { title: 'Optional: a recent event and a present understanding', text: 'Esta semana, Clara {{1}} una entrevista sobre aquella noche. «Ahora {{2}} mejor la historia de mi familia», dice su nieto.', gaps: [extraGap('{es}grabar{/es} · {es}Clara{/es} · recent event','ha grabado','perfect','Present perfect: this week is treated as a current frame connecting the interview with now.',[A('grabó','preterite','Preterite: the interview is viewed as a completed event this week, a natural regional alternative.')]),extraGap('{es}entender{/es} · {es}yo{/es} · present indicative','entiendo','present','Present: the grandson describes his understanding now, after hearing the interview.')] }, 'Clara, her family and the neighbours are fictional. Apollo 11 landed on 20 July 1969 at 20:17 UTC; Armstrong’s first step was on 21 July at 02:56 UTC, in the early hours in Spain.', [{ title:'NASA · Apollo 11 mission timeline',url:'https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_11i_Timeline.htm' }]),
  story(15, 'Un barrio en junio de 1977', 'A fictional shopkeeper experiences Spain’s general election of 1977.', 'scene', 'History · Spain’s transition',
    `En junio de 1977, Carmen {{1}} en una pequeña tienda de Madrid. Cada mañana {{2}} a las nueve y colocaba el pan junto a la puerta. Por entonces, los vecinos {{3}} mucho de democracia y [[libertad de expresión|freedom of expression: the right to express opinions]], aunque no todos pensaban igual. Carmen {{4}} treinta años y era la primera vez que participaba en unas elecciones generales. En su familia se mezclaban la ilusión y los nervios.

El 15 de junio {{5}} de casa temprano para votar. En la calle {{6}} carteles de distintos [[partidos|political parties: organised groups competing in the election]] y una fila de personas esperaba ante el [[colegio electoral|polling station: the place where people vote, often a school building]]. Mientras Carmen {{7}} avanzando lentamente, un vecino le {{8}} que llevaba décadas esperando aquel momento. Ella escuchó sin interrumpir. Al entrar, {{9}} su [[mesa|polling table: the assigned desk where a voter’s identity is checked]] y {{10}} su documento de identidad. Después de votar, {{11}} a la tienda y {{12}} la fecha en un calendario. Aquella noche cenó con su madre y escucharon las noticias. Para Carmen, aquel día formaba parte de un cambio que todavía estaba aprendiendo a entender.`, [
      I('{es}trabajar{/es} · {es}Carmen{/es}','trabajaba','Imperfect: her job is background about life at this point in the democratic transition.',[A('trabajó','preterite','Preterite: {es}trabajó{/es} presents her work in the shop during June 1977 as a complete period, before the narrative describes its daily routines.')]),
      I('{es}abrir{/es} · {es}Carmen{/es}','abría','Imperfect: {es}cada mañana{/es} presents opening the shop as a daily routine.'),
      I('{es}hablar{/es} · {es}los vecinos{/es}','hablaban','Imperfect: {es}por entonces{/es} recalls political conversations as a recurring feature of neighbourhood life.'),
      I('{es}tener{/es} · {es}Carmen{/es}','tenía','Imperfect: her age describes her circumstances at election time.'),
      P('{es}salir{/es} · {es}Carmen{/es}','salió','Preterite: leaving home begins the events on election day.'),
      I('{es}haber{/es} · {es}carteles{/es}','había','Imperfect: the posters belong to the street scene. Existential {es}había{/es} stays singular.'),
      I('{es}estar{/es} · {es}Carmen{/es} · {es}avanzando{/es} is given','estaba','Imperfect: {es}estaba{/es} {es}avanzando{/es} places her slow movement through the queue in progress when the neighbour speaks; {es}avanzando{/es} is already written.'),
      P('{es}contar{/es} · {es}un vecino{/es}','contó','Preterite: the remark is a particular conversational event during the wait.',[A('contaba','imperfect','Imperfect: {es}contaba{/es} presents the neighbour’s story as unfolding alongside Carmen’s movement through the queue.')]),
      P('{es}buscar{/es} · {es}Carmen{/es}','buscó','Preterite: looking for the assigned desk is the first narrated step inside. {es}Buscar{/es} describes the search, not automatically finding it.'),
      P('{es}mostrar{/es} · {es}Carmen{/es}','mostró','Preterite: showing her identity document is the next completed step.'),
      P('{es}volver{/es} · {es}Carmen{/es}','volvió','Preterite: returning to the shop follows voting in the sequence.'),
      P('{es}anotar{/es} · {es}Carmen{/es}','anotó','Preterite: writing down the date is a particular action marking the day’s importance.')
    ], { title: 'Optional: a diary connecting past and present', text: 'En su diario, Carmen escribe: «Hoy {{1}} por primera vez. Ahora {{2}} que mi voz también cuenta».', gaps: [extraGap('{es}votar{/es} · {es}yo{/es} · completed event today','he votado','perfect','Present perfect: Carmen connects today’s vote with her present feelings, a common choice in Spain.',[A('voté','preterite','Preterite: Carmen presents the vote as a completed event today, a natural regional alternative.')]),extraGap('{es}saber{/es} · {es}yo{/es} · present indicative','sé','present','Present: this is what Carmen knows now. The accent distinguishes {es}sé{/es} from the pronoun {es}se{/es}.')] }, 'Carmen, her family and the neighbour are fictional. The general election of 15 June 1977 was Spain’s first democratic general election since 1936. The personal experience is imagined within that documented event.', [{ title:'Congreso de los Diputados · 15 June 1977 and the Constitution', url:'https://blog.congreso.es/15-de-junio-de-1977-linea-de-salida-hacia-la-constitucion/' }]),
  ...unitStories
];

const courseAlignment = {
  'story-01': { units: [8, 10], focus: ['Fear and physical reactions', 'Background and sudden events'] },
  'story-02': { units: [10], focus: ['{es}Estar{/es} + gerund in the imperfect', 'Joy and emotional reactions'] },
  'story-03': { units: [10], focus: ['{es}Estaba{/es} and {es}estuvo{/es} + gerund', 'A complete episode of laughter'] },
  'story-04': { units: [9, 10], focus: ['Family habits and a particular gift', '{es}Quedarse sin palabras{/es}'] },
  'story-05': { units: [10], focus: ['Weather as background', 'An activity interrupted by an event'] },
  'story-06': { units: [9, 10], focus: ['Childhood and historical-period markers', 'Past habits and a counted series', '{es}Ya no{/es} and {es}todavía{/es} + present'] },
  'story-07': { units: [10], focus: ['{es}Estaba{/es} and {es}estuvo{/es} + gerund', 'An interruption and a whole two-hour period'] },
  'story-08': { units: [10], focus: ['Narrative sequence and {es}resulta que{/es}', '{es}Estar{/es} + gerund in the imperfect', 'An expression of relief'] },
  'story-09': { units: [8, 10], focus: ['Nervousness and emotional reactions', 'Thinking and managing to do something'] },
  'story-10': { units: [10], focus: ['{es}Estar{/es} + gerund and simultaneous activities', 'A sudden event and a delayed outcome'] },
  'story-11': { units: [8, 9, 10], focus: ['Childhood routines', '{es}Estar{/es} for location and taste', 'Affirmative {es}tú{/es} instructions'] },
  'story-12': { units: [9, 10], focus: ['Old routines and a particular goodbye', 'Emotional background', 'Present routines and plans'] },
  'story-13': { units: [9, 10], focus: ['A historical-period marker and education vocabulary', 'A whole period and a scene', 'A fictional museum account'] },
  'story-14': { units: [9, 10], focus: ['A dated historical event', 'A scene and a sequence', 'Fiction within documented history'] },
  'story-15': { units: [9, 10], focus: ['Democracy and freedom-of-expression vocabulary', '{es}Estar{/es} + gerund during an event', 'History and personal experience'] }
};
for (const item of stories) {
  if (courseAlignment[item.id]) Object.assign(item, courseAlignment[item.id]);
}
