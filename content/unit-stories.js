// Original B1 narratives aligned with the language covered in course units 8–10.
// The named people and personal experiences are fictional, including in the historical stories.
const I = (cue, form, feedback, alternatives = []) => ({ cue, answers: [{ form, tense: 'imperfect', feedback }, ...alternatives] });
const P = (cue, form, feedback, alternatives = []) => ({ cue, answers: [{ form, tense: 'preterite', feedback }, ...alternatives] });
const A = (form, tense, feedback) => ({ form, tense, feedback });
const E = (cue, form, tense, feedback, alternatives = []) => ({ cue, answers: [A(form, tense, feedback), ...alternatives] });
function unitStory(n, title, description, guide, theme, units, focus, text, gaps, extra, note, sources) {
  const prefix = 's' + n;
  const insertIds = value => value.replace(/\{\{(\d+)\}\}/g, (_, id) => '{{' + prefix + 'g' + id + '}}');
  return { id: 'story-' + n, title, description, guide, theme, level: 'Stretch', readingMinutes: 3, units, focus, wordRange: [140, 180],
    text: insertIds(text), gaps: gaps.map((gap, i) => ({ ...gap, id: prefix + 'g' + (i + 1) })),
    extra: { ...extra, text: extra.text.replace(/\{\{(\d+)\}\}/g, (_, id) => '{{' + prefix + 'e' + id + '}}'), gaps: extra.gaps.map((gap, i) => ({ ...gap, id: prefix + 'e' + (i + 1) })) },
    ...(note ? { note } : {}), ...(sources ? { sources } : {}) };
}

export const unitStories = [
  unitStory(16, 'La excursión que cambió de ritmo', 'An uncomfortable moment on a walk calls for clear instructions and a change of plan.', 'scene', 'Health · a walk with friends', [8, 10], ['Physical states and emotions', '{es}Doler{/es} and body vocabulary', 'An activity in progress and a complete period', 'Affirmative {es}tú{/es} and {es}usted{/es} instructions'],
    `Un día de primavera, Clara y yo {{1}} caminando por un camino cerca del pueblo cuando ella me {{2}} parar. Le {{3}} los pies y {{4}} un poco [[mareada|dizzy: feeling unsteady or as if everything is moving]]. No teníamos prisa, pero Clara estaba enfadada consigo misma: quería llegar hasta el lago y le daba vergüenza cambiar el plan. Nos sentamos bajo un árbol, lejos del sol.

Mientras yo {{5}} agua en la mochila, un señor se acercó y nos {{6}} si necesitábamos ayuda. Clara le explicó el problema. Él {{7}} un banco a pocos metros y dijo: «Vayan despacio; el pueblo está muy cerca». Entonces mi amiga {{8}} ir a la plaza en vez de continuar la excursión. Allí {{9}} descansando media hora, hasta que llegó el autobús. Durante la espera {{10}} mucho menos calor. Poco después, Clara {{11}} al ver una foto de nuestros zapatos llenos de [[barro|mud: wet earth that sticks to shoes]]. Al volver a casa, yo {{12}} que el mejor recuerdo del día no era ningún paisaje, sino aquella conversación tranquila.`, [
      I('{es}estar{/es} · {es}Clara y yo{/es} · {es}caminando{/es} is given', 'estábamos', 'Imperfect: {es}estábamos{/es} {es}caminando{/es} places the walk in progress at the moment Clara asks to stop.'),
      P('{es}pedir{/es} · {es}Clara{/es}', 'pidió', 'Preterite: her request changes the plan at that moment. {es}Pedir{/es} changes e to i in the third person: {es}pidió{/es}.'),
      I('{es}doler{/es} · {es}los pies{/es} · {es}le{/es} is given', 'dolían', 'Imperfect: the sore feet describe her condition when she asks to stop. {es}Los pies{/es} is plural, so use {es}dolían{/es}.'),
      I('{es}estar{/es} · {es}Clara{/es}', 'estaba', 'Imperfect: being dizzy is part of her physical state at that point; {es}estar{/es} describes how she feels.'),
      I('{es}buscar{/es} · {es}yo{/es}', 'buscaba', 'Imperfect: the search for water is already underway when the man approaches.'),
      P('{es}preguntar{/es} · {es}el señor{/es}', 'preguntó', 'Preterite: the question is a new event during the water search.'),
      P('{es}señalar{/es} · {es}el señor{/es}', 'señaló', 'Preterite: pointing out the bench is the man’s particular response to their explanation.'),
      P('{es}decidir{/es} · {es}Clara{/es}', 'decidió', 'Preterite: the decision replaces the original plan to continue to the lake.'),
      P('{es}estar{/es} · {es}Clara y yo{/es} · {es}descansando{/es} is given', 'estuvimos', 'Preterite: {es}estuvimos{/es} {es}descansando{/es} presents the full half-hour rest, ending when the bus arrives. A progressive form can also describe a bounded episode.'),
      I('{es}hacer{/es} · {es}impersonal{/es}', 'hacía', 'Imperfect: the cooler conditions are described from inside the wait. Impersonal {es}hacer{/es} stays singular.', [A('hizo', 'preterite', 'Preterite: {es}hizo{/es} sums up the weather during the whole wait as a completed interval.')]),
      P('{es}reírse{/es} · {es}Clara{/es}', 'se rio', 'Preterite: seeing the muddy shoes produces a particular laugh and a change of mood. Include {es}se{/es}; {es}rio{/es} has no written accent.'),
      P('{es}comprender{/es} · {es}yo{/es}', 'comprendí', 'Preterite: the narrator reaches this understanding on returning home, rather than describing knowledge already held.')
    ], { title: 'Optional: advice to a friend and a visitor', text: 'A Clara le digo: «{{1}} la mochila aquí, junto al banco». Al señor le digo: «{{2}} usted por este camino hasta la plaza».', gaps: [
      E('{es}poner{/es} · {es}tú{/es} · affirmative imperative', 'pon', 'imperative', '{es}Pon{/es} is the irregular affirmative {es}tú{/es} command of {es}poner{/es}. It asks Clara to put the backpack in a specific place.'),
      E('{es}seguir{/es} · {es}usted{/es} · affirmative imperative', 'siga', 'imperative', '{es}Siga{/es} is the affirmative {es}usted{/es} command: use the present-subjunctive form and the e → i change, keeping the g sound.')
    ] }),

  unitStory(17, 'Una voz en la radio', 'A family recording connects childhood routines with the way we communicate now.', 'habits', 'Childhood · communication then and now', [9, 10], ['Past and present time markers', 'Childhood habits and one occasion', 'Irregular preterite roots', '{es}Ya no{/es} and {es}todavía{/es}'],
    `A finales de los años ochenta, mi padre {{1}} adolescente y {{2}} con sus abuelos. Por entonces no {{3}} internet en casa. Cada domingo, los tres {{4}} un programa de radio y comentaban las noticias durante la comida. Mi padre decía que su abuela siempre reconocía las canciones antes que el presentador.

El otro día {{5}} una [[cinta|tape: a strip of magnetic material used to record sound]] mientras ordenábamos un armario. La etiqueta decía «Domingo especial», pero nadie recordaba su contenido. Mi padre {{6}} una [[grabadora|tape recorder: a device for recording and playing sound]] antigua encima de la mesa y apretó un botón. Al principio solo se oía un ruido. Luego {{7}} la voz de su abuela: estaba contando cómo aprendió a leer de adulta. Él {{8}} sin palabras. Mientras la cinta {{9}} girando, nos explicó que apenas conservaba recuerdos de su voz. Durante veinte minutos, todos {{10}} escuchando sin mirar el móvil. Al terminar, mi padre {{11}} una copia para su hermana. Aquella noche le {{12}} un mensaje con el archivo. Hoy en día ya no usamos aquella grabadora, pero todavía escuchamos juntos la historia.`, [
      I('{es}ser{/es} · {es}mi padre{/es}', 'era', 'Imperfect: adolescence is the life stage from which the family’s routine is described.'),
      I('{es}vivir{/es} · {es}mi padre{/es}', 'vivía', 'Imperfect: living with his grandparents is his situation during that stage, before the particular discovery.'),
      I('{es}haber{/es} · {es}internet{/es}', 'había', 'Imperfect: the lack of home internet describes the period and explains the role of radio. Existential {es}había{/es} is singular.'),
      I('{es}escuchar{/es} · {es}los tres{/es}', 'escuchaban', 'Imperfect: {es}cada domingo{/es} presents a recurring family habit, rather than a counted set of programmes.'),
      P('{es}encontrar{/es} · {es}nosotros{/es}', 'encontramos', 'Preterite: finding this particular tape begins the recent episode introduced by {es}el otro día{/es}.'),
      P('{es}poner{/es} · {es}mi padre{/es}', 'puso', 'Preterite: placing the recorder is one completed action in the sequence. {es}Poner{/es} uses the irregular root {es}pus-{/es}.'),
      P('{es}sonar{/es} · {es}la voz{/es}', 'sonó', 'Preterite: the voice becomes audible after the initial noise, creating the next event.'),
      P('{es}quedarse{/es} · {es}mi padre{/es}', 'se quedó', 'Preterite: {es}quedarse sin palabras{/es} marks his reaction to hearing the voice. Include {es}se{/es}.'),
      I('{es}estar{/es} · {es}la cinta{/es} · {es}girando{/es} is given', 'estaba', 'Imperfect: {es}estaba{/es} {es}girando{/es} describes the tape in motion while the father explains its importance.'),
      P('{es}estar{/es} · {es}todos nosotros{/es} · {es}escuchando{/es} is given', 'estuvimos', 'Preterite: {es}estuvimos{/es} {es}escuchando{/es} covers the whole twenty-minute listening session, from start to finish.'),
      P('{es}hacer{/es} · {es}mi padre{/es}', 'hizo', 'Preterite: making the copy is a new completed action after listening. {es}Hacer{/es} has the form {es}hizo{/es}, with z.'),
      P('{es}enviar{/es} · {es}nosotros{/es}', 'enviamos', 'Preterite: sending the message is located on that night as the final step in sharing the recording.')
    ], { title: 'Optional: what has stopped and what continues', text: 'Hoy {{1}} usamos la grabadora: está rota. Sin embargo, {{2}} escuchamos la copia digital cada domingo, como antes.', gaps: [
      E('no longer · time marker', 'ya no', 'narrative', '{es}Ya no{/es} expresses that using the old recorder has stopped. {es}Todavía{/es} would contradict the following statement that it is broken.'),
      E('still · time marker', 'todavía', 'narrative', '{es}Todavía{/es} signals continuity: the family continues its Sunday listening habit, now using a digital copy.', [A('aún', 'narrative', 'Aún, with an accent, also means still here and expresses the same continuing Sunday habit.')])
    ] }),

  unitStory(18, 'El ensayo y la puerta cerrada', 'A neighbourhood play brings together memories, nerves and a practical solution.', 'duration', 'A community play · imagined local history', [8, 9, 10], ['Historical periods in a fictional project', 'Imperfect and preterite {es}estar{/es} + gerund', 'Emotional changes', 'Affirmative commands with pronouns'],
    `Nuestro grupo de teatro {{1}} una obra sobre la vida del barrio a mediados del siglo XX. Las vecinas nos prestaban fotografías y una de ellas {{2}} historias de su juventud durante los ensayos. En aquella época, según sus recuerdos, casi todas las familias se conocían y los niños jugaban en la calle. Queríamos mostrar esa vida cotidiana, sin contar la vida de una sola familia.

El día de la función, nosotros {{3}} colocando las sillas cuando el director {{4}} una llamada: la puerta del [[almacén|storeroom: the room used to keep equipment and costumes]] estaba cerrada y nadie encontraba la llave. Allí {{5}} todos los [[trajes|costumes: the clothes worn to play the characters]]. Al principio él se {{6}} muy nervioso. Luego una compañera {{7}} una idea: usar nuestra ropa y explicar el cambio al público. Durante los siguientes cuarenta minutos {{8}} preparando la sala sin los trajes. Cuando los vecinos {{9}}, todo estaba listo. La narradora {{10}} el problema con una broma y el público {{11}}. Al terminar, una señora nos {{12}} otra función para sus nietos. ¡Qué alegría después de tantos nervios!`, [
      I('{es}preparar{/es} · {es}nuestro grupo{/es}', 'preparaba', 'Imperfect: preparing the play is the project already underway before the performance-day events.'),
      I('{es}contar{/es} · {es}una vecina{/es}', 'contaba', 'Imperfect: her stories recur during the rehearsals and supply background for the project.'),
      I('{es}estar{/es} · {es}nosotros{/es} · {es}colocando{/es} is given', 'estábamos', 'Imperfect: {es}estábamos{/es} {es}colocando{/es} places chair-setting in progress when the call arrives.'),
      P('{es}recibir{/es} · {es}el director{/es}', 'recibió', 'Preterite: receiving the call introduces the practical problem during the preparations.'),
      I('{es}estar{/es} · {es}todos los trajes{/es}', 'estaban', 'Imperfect: {es}estaban{/es} locates the costumes inside the locked storeroom. The plural subject is {es}todos los trajes{/es}.'),
      P('{es}poner{/es} · {es}el director{/es} · {es}se{/es} is given', 'puso', 'Preterite: {es}se puso nervioso{/es} marks a change into a nervous state after the bad news. {es}Poner{/es} uses {es}pus-{/es}.'),
      P('{es}tener{/es} · {es}una compañera{/es}', 'tuvo', 'Preterite: {es}tuvo una idea{/es} presents the idea arriving as a particular event, rather than a state of possession.'),
      P('{es}estar{/es} · {es}nosotros{/es} · {es}preparando{/es} is given', 'estuvimos', 'Preterite: {es}estuvimos{/es} {es}preparando{/es} covers the full forty-minute period that follows the decision.'),
      P('{es}llegar{/es} · {es}los vecinos{/es}', 'llegaron', 'Preterite: their arrival is the point at which the completed preparations are assessed.'),
      P('{es}explicar{/es} · {es}la narradora{/es}', 'explicó', 'Preterite: the explanation is one action at the beginning of the performance.'),
      P('{es}reírse{/es} · {es}el público{/es}', 'se rio', 'Preterite: the audience’s laugh responds to the joke. {es}Público{/es} is singular; include {es}se{/es}, and write {es}rio{/es} without an accent.'),
      P('{es}pedir{/es} · {es}una señora{/es}', 'pidió', 'Preterite: the request is a particular response after the play. The third-person preterite of {es}pedir{/es} changes e to i.')
    ], { title: 'Optional: the director gives two instructions', text: 'A Ana, el director le dice: «{{1}} aquí y ayúdame con esta silla». Al grupo le dice: «{{2}} el programa al público cuando entre».', gaps: [
      E('{es}venir{/es} · {es}tú{/es} · affirmative imperative', 'ven', 'imperative', '{es}Ven{/es} is the irregular affirmative {es}tú{/es} command: the director asks Ana to come towards him.'),
      E('{es}dar + le{/es} · {es}vosotros{/es} · affirmative imperative; {es}le{/es} refers to {es}el público{/es}', 'dadle', 'imperative', 'The {es}vosotros{/es} command {es}dad{/es} keeps its final d before {es}le{/es}: {es}dadle{/es}. The pronoun follows and attaches to the affirmative command.')
    ] }, 'The play, local memories, neighbourhood and characters are fictional. The date range belongs to their imagined project; this is not a record of a particular town.'),

  unitStory(19, 'Un domingo de noviembre de 1933', 'An imagined voter experiences a documented change in electoral rights.', 'narrative', 'History · women’s voting rights in Spain', [9, 10], ['Historical dates and rights vocabulary', 'A scene and a political event', 'Irregular preterite forms', 'Sequence markers'],
    `En noviembre de 1933, Isabel {{1}} veintisiete años y {{2}} en una tienda de Madrid. Por entonces, España era una [[república|republic: a state whose head is not a monarch]]. La Constitución de 1931 reconocía el derecho de las mujeres a votar. El 19 de noviembre {{3}} las primeras elecciones generales españolas con participación de votantes mujeres. Isabel iba a ejercer ese derecho por primera vez.

Aquella mañana {{4}} temprano de casa con su hermana. Mientras las dos {{5}} en la fila, Isabel le {{6}} cómo se sentía. Su hermana estaba contenta, pero también nerviosa. Delante de ellas, una señora {{7}} que las niñas de su infancia apenas iban a la escuela. Isabel {{8}} un poco de tristeza al escucharla. Cuando {{9}} su turno, mostró su documento y votó. Luego {{10}} a su hermana junto a la salida. Durante el regreso, las dos {{11}} hablando de lo que acababan de vivir. Al llegar, Isabel {{12}} la fecha en su cuaderno: quería recordar aquel domingo con todos sus detalles.`, [
      I('{es}tener{/es} · {es}Isabel{/es}', 'tenía', 'Imperfect: her age establishes her circumstances in November 1933; it is not an event in the voting sequence.'),
      I('{es}trabajar{/es} · {es}Isabel{/es}', 'trabajaba', 'Imperfect: her job belongs to the background of this imagined voter’s life.'),
      P('{es}celebrarse{/es} · {es}las elecciones{/es}', 'se celebraron', 'Preterite: the elections are a documented event on a specific date. Include {es}se{/es} and use a plural verb.'),
      P('{es}salir{/es} · {es}Isabel{/es}', 'salió', 'Preterite: leaving home begins the personal sequence on that morning.'),
      I('{es}esperar{/es} · {es}las dos hermanas{/es}', 'esperaban', 'Imperfect: the wait is already in progress when Isabel asks about her sister’s feelings.'),
      P('{es}preguntar{/es} · {es}Isabel{/es}', 'preguntó', 'Preterite: the question is one conversational event during the wait.'),
      I('{es}contar{/es} · {es}una señora{/es}', 'contaba', 'Imperfect: her account is heard as it unfolds in the queue.', [A('contó', 'preterite', 'Preterite: {es}contó{/es} presents her account as a whole intervention before Isabel’s emotional response.')]),
      P('{es}sentir{/es} · {es}Isabel{/es}', 'sintió', 'Preterite: the story produces a particular emotional reaction. The third-person preterite of {es}sentir{/es} changes e to i.'),
      P('{es}llegar{/es} · {es}su turno{/es}', 'llegó', 'Preterite: her turn arriving changes the scene from waiting to voting.'),
      P('{es}esperar{/es} · {es}Isabel{/es}', 'esperó', 'Preterite: this reports a particular wait after her own vote, before the sisters go home together.'),
      P('{es}estar{/es} · {es}las dos hermanas{/es} · {es}hablando{/es} is given', 'estuvieron', 'Preterite: {es}estuvieron{/es} {es}hablando{/es} presents their conversation over the return journey as a whole episode.', [A('estaban', 'imperfect', 'Imperfect: {es}estaban{/es} {es}hablando{/es} takes us inside the return journey and describes the conversation in progress along the way.')]),
      P('{es}escribir{/es} · {es}Isabel{/es}', 'escribió', 'Preterite: writing the date is the final action preserving the experience in her notebook.')
    ], { title: 'Optional: organising the retelling', text: '«Primero voté yo. {{1}}, votó mi hermana. {{2}} llegamos a casa y guardé el cuaderno». El primer marcador indica que pasó poco tiempo; el segundo introduce un momento posterior.', gaps: [
      E('immediately afterwards · narrative marker', 'poco después', 'narrative', '{es}Poco después{/es} places the sister’s vote a short time after Isabel’s. The cue asks specifically for that short interval.'),
      E('later · narrative marker', 'más tarde', 'narrative', '{es}Más tarde{/es} moves the account to the later arrival home without claiming it happened immediately after voting.', [A('luego', 'narrative', '{es}Luego{/es} also moves the account on to a later stage; it does not specify the length of the interval.'), A('después', 'narrative', 'Después also marks the next later stage in this retelling without specifying a short interval.')])
    ] }, 'Isabel, her sister and the woman in the queue are fictional. Spain’s 1931 Constitution recognised women’s voting rights. The general election of 19 November 1933 was the first Spanish general election in which women voted; this is not a claim that it was their first participation in every kind of vote.', [{ title: 'Congreso de los Diputados · First general election in which women voted, 1933', url: 'https://www.congreso.es/es/fotonoticias?_fotonoticias_fotonId=4889&_fotonoticias_mvcPath=detalle&p_p_id=fotonoticias&p_p_lifecycle=0&p_p_mode=view&p_p_state=normal' }]),

  unitStory(20, 'La noticia que cruzó la ciudad', 'A fictional family follows the opening of Berlin’s border crossings in November 1989.', 'narrative', 'History · Berlin, 9 November 1989', [9, 10], ['History and freedom of movement', 'A developing scene and a bounded wait', 'Discovering information with {es}supe{/es}', 'Reactions and narrative markers'],
    `A finales de los años ochenta, Elena {{1}} en Berlín Occidental y {{2}} español a un grupo de adultos. La ciudad {{3}} dividida por un muro. El 9 de noviembre de 1989, ella {{4}} corrigiendo ejercicios cuando un amigo la {{5}} por teléfono: había noticias importantes sobre los viajes desde el este. Elena encendió la televisión y {{6}} que mucha gente se acercaba a los [[pasos fronterizos|border crossings: the places where people are allowed to cross a border]].

Su hermano, que vivía al otro lado, todavía {{7}} en casa. Hablaron unos minutos, pero ninguno sabía exactamente qué iba a pasar. Más tarde, las autoridades {{8}} los pasos de la ciudad. La frontera se abría aquella noche, aunque el muro no desapareció de golpe. Elena {{9}} a pie a un punto de encuentro y {{10}} esperando casi una hora, hasta que vio a su hermano. Al reconocerse, los dos {{11}} de alegría. Después {{12}} un paseo juntos. Años más tarde, Elena recordaba perfectamente el frío, los abrazos y su sorpresa al compartir por fin aquella calle.`, [
      I('{es}vivir{/es} · {es}Elena{/es}', 'vivía', 'Imperfect: her home in West Berlin is the situation from which the events are recalled.'),
      I('{es}enseñar{/es} · {es}Elena{/es}', 'enseñaba', 'Imperfect: teaching Spanish describes her work in that period, before the particular evening.'),
      I('{es}estar{/es} · {es}la ciudad{/es}', 'estaba', 'Imperfect: {es}estaba dividida{/es} describes the city’s condition at that time. {es}Estar{/es} works with this result-state participle.'),
      I('{es}estar{/es} · {es}Elena{/es} · {es}corrigiendo{/es} is given', 'estaba', 'Imperfect: {es}estaba{/es} {es}corrigiendo{/es} places her work in progress when the telephone call interrupts it.'),
      P('{es}llamar{/es} · {es}un amigo{/es}', 'llamó', 'Preterite: the call introduces the news during Elena’s marking.'),
      P('{es}saber{/es} · {es}Elena{/es}', 'supo', 'Preterite: {es}supo{/es} means she found out this information after turning on the television; it is a new discovery.'),
      I('{es}estar{/es} · {es}su hermano{/es}', 'estaba', 'Imperfect: his location at home is the situation at the time they speak; {es}todavía{/es} marks its continuation.'),
      P('{es}abrir{/es} · {es}las autoridades{/es}', 'abrieron', 'Preterite: the openings that night are presented as historical events, rather than as the wall’s physical demolition.'),
      P('{es}ir{/es} · {es}Elena{/es}', 'fue', 'Preterite: walking to the meeting point is the next particular action. {es}Ir{/es} and {es}ser{/es} share these preterite forms.'),
      P('{es}estar{/es} · {es}Elena{/es} · {es}esperando{/es} is given', 'estuvo', 'Preterite: {es}estuvo{/es} {es}esperando{/es} includes the entire wait, bounded by seeing her brother, even though waiting is a developing activity.'),
      P('{es}llorar{/es} · {es}los dos{/es}', 'lloraron', 'Preterite: crying is their particular reaction on recognising each other.'),
      P('{es}dar{/es} · {es}los dos{/es}', 'dieron', 'Preterite: taking the walk is the next completed shared experience after the reunion. {es}Dar{/es} has {es}dieron{/es}, without an accent.')
    ], { title: 'Optional: a sudden event and an explanation', text: 'Al contar su noche, Elena dice: «Yo corregía ejercicios tranquilamente y, {{1}}, sonó el teléfono. Mi amigo estaba muy emocionado. {{2}} tenía noticias de los pasos fronterizos».', gaps: [
      E('suddenly · narrative marker', 'de repente', 'narrative', '{es}De repente{/es} presents the call as an unexpected interruption to the quiet marking session.', [A('de pronto', 'narrative', '{es}De pronto{/es} also presents the call as a sudden, unexpected interruption.')]),
      E('it turns out that · narrative expression', 'resulta que', 'narrative', '{es}Resulta que{/es} introduces the explanation Elena gives now for her friend’s excitement then; the present form is natural in this retrospective storytelling.')
    ] }, 'Elena, her brother, friend and reunion are fictional. Berlin’s border crossings opened on the night of 9 November 1989. Opening the crossings and dismantling the wall were different processes; the story does not claim that the whole wall was demolished that night.', [{ title: 'Berlin city government · Opening and fall of the Berlin Wall', url: 'https://www.berlin.de/en/history/8482274-8619314-opening-and-fall-of-the-berlin-wall.en.html' }]),

  unitStory(21, 'El invento del cajón', 'An archive project uncovers a family invention and a surprising recording.', 'narrative', 'An imagined invention · family archive', [9, 10], ['Invention and archive vocabulary', 'Periods of life and time references', 'Progressive forms and interruptions', 'Irregular preterite {es}sentir{/es} and {es}dormir{/es}'],
    `El mes pasado, mis primos y yo {{1}} un pequeño archivo sobre nuestra familia para una exposición del barrio. En el cajón de un escritorio {{2}} un cuaderno de mi bisabuela, que {{3}} [[costurera|dressmaker: someone whose work is sewing clothes]]. A principios de los años sesenta, según sus notas, {{4}} trabajando en una máquina para cortar [[tela|fabric: material used to make clothes]] con menos esfuerzo. No sabíamos si su idea llegó a funcionar.

Una tarde, mientras nosotros {{5}} las páginas, mi primo {{6}} un dibujo de la máquina terminada. Entonces nuestra tía {{7}} una caja y sacó una cinta. Resulta que la bisabuela grabó allí una explicación para sus hijos. Durante la siguiente hora {{8}} escuchando y comparando la voz con los dibujos. Mi prima {{9}} mucha emoción al oír su nombre: la bisabuela la mencionaba cuando era un bebé. Después nos {{10}} otra cinta. En ella se escuchaba una canción, y su hijo pequeño se {{11}} al final, junto al micrófono. Aquel descubrimiento nos {{12}} ganas de seguir investigando. En la exposición decidimos separar las notas comprobables de nuestras propias preguntas.`, [
      I('{es}preparar{/es} · {es}mis primos y yo{/es}', 'preparábamos', 'Imperfect: the archive project is underway when the notebook is found; it establishes the setting for the discoveries.', [A('preparamos', 'preterite', 'Preterite: {es}preparamos{/es} sums up last month’s archive project as a whole before recounting how its discoveries happened.')]),
      P('{es}encontrar{/es} · {es}nosotros{/es}', 'encontramos', 'Preterite: finding the notebook is a particular discovery within the project.'),
      I('{es}ser{/es} · {es}mi bisabuela{/es}', 'era', 'Imperfect: her occupation identifies her in the background account; professions use {es}ser{/es}.'),
      I('{es}estar{/es} · {es}mi bisabuela{/es} · {es}trabajando{/es} is given', 'estaba', 'Imperfect: the notes show her work on the machine in progress at that point in the sixties, without stating its completion.'),
      I('{es}leer{/es} · {es}nosotros{/es}', 'leíamos', 'Imperfect: the reading is already in progress when the cousin notices the drawing. {es}Leíamos{/es} has a written accent.'),
      P('{es}descubrir{/es} · {es}mi primo{/es}', 'descubrió', 'Preterite: noticing the completed-machine drawing supplies a new piece of information.'),
      P('{es}traer{/es} · {es}nuestra tía{/es}', 'trajo', 'Preterite: bringing the box is the aunt’s next action in the sequence. {es}Traer{/es} uses the irregular root {es}traj-{/es}.'),
      P('{es}estar{/es} · {es}nosotros{/es} · {es}escuchando{/es} is given', 'estuvimos', 'Preterite: {es}estuvimos{/es} {es}escuchando{/es} covers the full following hour spent studying the recording and drawings.'),
      P('{es}sentir{/es} · {es}mi prima{/es}', 'sintió', 'Preterite: hearing her name triggers a particular emotion. {es}Sentir{/es} changes e to i in this third-person form.'),
      P('{es}poner{/es} · {es}nuestra tía{/es} · {es}nos{/es} is given', 'puso', 'Preterite: playing a second tape advances the sequence. {es}Puso{/es} uses {es}pus-{/es}, and {es}nos{/es} is already given.'),
      P('{es}dormir{/es} · {es}su hijo pequeño{/es} · {es}se{/es} is given', 'durmió', 'Preterite: {es}se durmió{/es} marks the child falling asleep at the end of the song. {es}Dormir{/es} changes o to u here; {es}se{/es} is already written.'),
      P('{es}dar{/es} · {es}aquel descubrimiento{/es} · {es}nos{/es} is given', 'dio', 'Preterite: the discovery produces a new motivation at that moment. {es}Dio{/es} has no written accent.')
    ], { title: 'Optional: two time references in a caption', text: 'El texto de la exposición contrasta el pasado con el presente: «{{1}}, la bisabuela trabajaba sola en su taller. {{2}}, sus dibujos están en nuestro archivo digital». Primero se sitúa la acción en el pasado y después se vuelve al presente.', gaps: [
      E('back then · period already introduced', 'por entonces', 'narrative', '{es}Por entonces{/es} returns to the previously introduced period of the {es}bisabuela{/es}’s workshop.', [A('en aquella época', 'narrative', '{es}En aquella época{/es} also refers back to that earlier stage of her life.'), A('entonces', 'narrative', 'Entonces means at that time here, locating the workshop in the earlier period rather than marking the next event.')]),
      E('nowadays · present time marker', 'hoy en día', 'narrative', '{es}Hoy en día{/es} explicitly contrasts the current digital archive with her earlier workshop.', [A('actualmente', 'narrative', '{es}Actualmente{/es} also locates the drawings in the present, contrasting with the earlier period.'), A('ahora', 'narrative', 'Ahora also creates the intended present-time contrast in this caption.')])
    ] }, 'The family, notebook, invention and recordings are fictional. A date range gives context to this imagined archive; no claim is made about who historically invented a real machine.')
];

// A short choice list bounds the answer space for expressions with many synonyms.
// Conjugation gaps remain typed answers, including pronouns and written accents.
const markerOptions = {
  s17e1: ['todavía', 'ya no', 'por entonces'],
  s17e2: ['ya no', 'todavía', 'en aquella época'],
  s19e1: ['poco después', 'de repente', 'por entonces'],
  s19e2: ['todavía', 'más tarde', 'luego'],
  s20e1: ['más tarde', 'de repente', 'de pronto'],
  s20e2: ['resulta que', 'hoy en día', 'al principio'],
  s21e1: ['por entonces', 'en aquella época', 'hoy en día'],
  s21e2: ['en aquellos tiempos', 'hoy en día', 'actualmente']
};
for (const item of unitStories) {
  for (const gap of item.extra.gaps) {
    if (markerOptions[gap.id]) {
      gap.options = markerOptions[gap.id];
      gap.answers = gap.answers.filter(answer => gap.options.includes(answer.form));
    }
  }
}
