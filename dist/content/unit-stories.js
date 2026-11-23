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
  unitStory(16, 'La excursión que cambió de ritmo', 'An uncomfortable moment on a walk calls for clear instructions and a change of plan.', 'scene', 'Health · a walk with friends', [8, 10], ['Physical states and emotions', 'Doler and body vocabulary', 'An activity in progress and a complete period', 'Affirmative tú and usted instructions'],
    `Un día de primavera, Clara y yo {{1}} caminando por un camino cerca del pueblo cuando ella me {{2}} parar. Le {{3}} los pies y {{4}} un poco [[mareada|dizzy: feeling unsteady or as if everything is moving]]. No teníamos prisa, pero Clara estaba enfadada consigo misma: quería llegar hasta el lago y le daba vergüenza cambiar el plan. Nos sentamos bajo un árbol, lejos del sol.

Mientras yo {{5}} agua en la mochila, un señor se acercó y nos {{6}} si necesitábamos ayuda. Clara le explicó el problema. Él {{7}} un banco a pocos metros y dijo: «Vayan despacio; el pueblo está muy cerca». Entonces mi amiga {{8}} ir a la plaza en vez de continuar la excursión. Allí {{9}} descansando media hora, hasta que llegó el autobús. Durante la espera {{10}} mucho menos calor. Poco después, Clara {{11}} al ver una foto de nuestros zapatos llenos de [[barro|mud: wet earth that sticks to shoes]]. Al volver a casa, yo {{12}} que el mejor recuerdo del día no era ningún paisaje, sino aquella conversación tranquila.`, [
      I('estar · Clara y yo · caminando is given', 'estábamos', 'Imperfect: estábamos caminando places the walk in progress at the moment Clara asks to stop.'),
      P('pedir · Clara', 'pidió', 'Preterite: her request changes the plan at that moment. Pedir changes e to i in the third person: pidió.'),
      I('doler · los pies · le is given', 'dolían', 'Imperfect: the sore feet describe her condition when she asks to stop. Los pies is plural, so use dolían.'),
      I('estar · Clara', 'estaba', 'Imperfect: being dizzy is part of her physical state at that point; estar describes how she feels.'),
      I('buscar · yo', 'buscaba', 'Imperfect: the search for water is already underway when the man approaches.'),
      P('preguntar · el señor', 'preguntó', 'Preterite: the question is a new event during the water search.'),
      P('señalar · el señor', 'señaló', 'Preterite: pointing out the bench is the man’s particular response to their explanation.'),
      P('decidir · Clara', 'decidió', 'Preterite: the decision replaces the original plan to continue to the lake.'),
      P('estar · Clara y yo · descansando is given', 'estuvimos', 'Preterite: estuvimos descansando presents the full half-hour rest, ending when the bus arrives. A progressive form can also describe a bounded episode.'),
      I('hacer · impersonal', 'hacía', 'Imperfect: the cooler conditions are described from inside the wait. Impersonal hacer stays singular.', [A('hizo', 'preterite', 'Preterite: hizo sums up the weather during the whole wait as a completed interval.')]),
      P('reírse · Clara', 'se rio', 'Preterite: seeing the muddy shoes produces a particular laugh and a change of mood. Include se; rio has no written accent.'),
      P('comprender · yo', 'comprendí', 'Preterite: the narrator reaches this understanding on returning home, rather than describing knowledge already held.')
    ], { title: 'Optional: advice to a friend and a visitor', text: 'A Clara le digo: «{{1}} la mochila aquí, junto al banco». Al señor le digo: «{{2}} usted por este camino hasta la plaza».', gaps: [
      E('poner · tú · affirmative imperative', 'pon', 'imperative', 'Pon is the irregular affirmative tú command of poner. It asks Clara to put the backpack in a specific place.'),
      E('seguir · usted · affirmative imperative', 'siga', 'imperative', 'Siga is the affirmative usted command: use the present-subjunctive form and the e → i change, keeping the g sound.')
    ] }),

  unitStory(17, 'Una voz en la radio', 'A family recording connects childhood routines with the way we communicate now.', 'habits', 'Childhood · communication then and now', [9, 10], ['Past and present time markers', 'Childhood habits and one occasion', 'Irregular preterite roots', 'Ya no and todavía'],
    `A finales de los años ochenta, mi padre {{1}} adolescente y {{2}} con sus abuelos. Por entonces no {{3}} internet en casa. Cada domingo, los tres {{4}} un programa de radio y comentaban las noticias durante la comida. Mi padre decía que su abuela siempre reconocía las canciones antes que el presentador.

El otro día {{5}} una [[cinta|tape: a strip of magnetic material used to record sound]] mientras ordenábamos un armario. La etiqueta decía «Domingo especial», pero nadie recordaba su contenido. Mi padre {{6}} una [[grabadora|tape recorder: a device for recording and playing sound]] antigua encima de la mesa y apretó un botón. Al principio solo se oía un ruido. Luego {{7}} la voz de su abuela: estaba contando cómo aprendió a leer de adulta. Él {{8}} sin palabras. Mientras la cinta {{9}} girando, nos explicó que apenas conservaba recuerdos de su voz. Durante veinte minutos, todos {{10}} escuchando sin mirar el móvil. Al terminar, mi padre {{11}} una copia para su hermana. Aquella noche le {{12}} un mensaje con el archivo. Hoy en día ya no usamos aquella grabadora, pero todavía escuchamos juntos la historia.`, [
      I('ser · mi padre', 'era', 'Imperfect: adolescence is the life stage from which the family’s routine is described.'),
      I('vivir · mi padre', 'vivía', 'Imperfect: living with his grandparents is his situation during that stage, before the particular discovery.'),
      I('haber · internet', 'había', 'Imperfect: the lack of home internet describes the period and explains the role of radio. Existential había is singular.'),
      I('escuchar · los tres', 'escuchaban', 'Imperfect: cada domingo presents a recurring family habit, rather than a counted set of programmes.'),
      P('encontrar · nosotros', 'encontramos', 'Preterite: finding this particular tape begins the recent episode introduced by el otro día.'),
      P('poner · mi padre', 'puso', 'Preterite: placing the recorder is one completed action in the sequence. Poner uses the irregular root pus-.'),
      P('sonar · la voz', 'sonó', 'Preterite: the voice becomes audible after the initial noise, creating the next event.'),
      P('quedarse · mi padre', 'se quedó', 'Preterite: quedarse sin palabras marks his reaction to hearing the voice. Include se.'),
      I('estar · la cinta · girando is given', 'estaba', 'Imperfect: estaba girando describes the tape in motion while the father explains its importance.'),
      P('estar · todos nosotros · escuchando is given', 'estuvimos', 'Preterite: estuvimos escuchando covers the whole twenty-minute listening session, from start to finish.'),
      P('hacer · mi padre', 'hizo', 'Preterite: making the copy is a new completed action after listening. Hacer has the form hizo, with z.'),
      P('enviar · nosotros', 'enviamos', 'Preterite: sending the message is located on that night as the final step in sharing the recording.')
    ], { title: 'Optional: what has stopped and what continues', text: 'Hoy {{1}} usamos la grabadora: está rota. Sin embargo, {{2}} escuchamos la copia digital cada domingo, como antes.', gaps: [
      E('no longer · time marker', 'ya no', 'narrative', 'Ya no expresses that using the old recorder has stopped. Todavía would contradict the following statement that it is broken.'),
      E('still · time marker', 'todavía', 'narrative', 'Todavía signals continuity: the family continues its Sunday listening habit, now using a digital copy.', [A('aún', 'narrative', 'Aún, with an accent, also means still here and expresses the same continuing Sunday habit.')])
    ] }),

  unitStory(18, 'El ensayo y la puerta cerrada', 'A neighbourhood play brings together memories, nerves and a practical solution.', 'duration', 'A community play · imagined local history', [8, 9, 10], ['Historical periods in a fictional project', 'Imperfect and preterite estar + gerund', 'Emotional changes', 'Affirmative commands with pronouns'],
    `Nuestro grupo de teatro {{1}} una obra sobre la vida del barrio a mediados del siglo XX. Las vecinas nos prestaban fotografías y una de ellas {{2}} historias de su juventud durante los ensayos. En aquella época, según sus recuerdos, casi todas las familias se conocían y los niños jugaban en la calle. Queríamos mostrar esa vida cotidiana, sin contar la vida de una sola familia.

El día de la función, nosotros {{3}} colocando las sillas cuando el director {{4}} una llamada: la puerta del [[almacén|storeroom: the room used to keep equipment and costumes]] estaba cerrada y nadie encontraba la llave. Allí {{5}} todos los [[trajes|costumes: the clothes worn to play the characters]]. Al principio él se {{6}} muy nervioso. Luego una compañera {{7}} una idea: usar nuestra ropa y explicar el cambio al público. Durante los siguientes cuarenta minutos {{8}} preparando la sala sin los trajes. Cuando los vecinos {{9}}, todo estaba listo. La narradora {{10}} el problema con una broma y el público {{11}}. Al terminar, una señora nos {{12}} otra función para sus nietos. ¡Qué alegría después de tantos nervios!`, [
      I('preparar · nuestro grupo', 'preparaba', 'Imperfect: preparing the play is the project already underway before the performance-day events.'),
      I('contar · una vecina', 'contaba', 'Imperfect: her stories recur during the rehearsals and supply background for the project.'),
      I('estar · nosotros · colocando is given', 'estábamos', 'Imperfect: estábamos colocando places chair-setting in progress when the call arrives.'),
      P('recibir · el director', 'recibió', 'Preterite: receiving the call introduces the practical problem during the preparations.'),
      I('estar · todos los trajes', 'estaban', 'Imperfect: estaban locates the costumes inside the locked storeroom. The plural subject is todos los trajes.'),
      P('poner · el director · se is given', 'puso', 'Preterite: se puso nervioso marks a change into a nervous state after the bad news. Poner uses pus-.'),
      P('tener · una compañera', 'tuvo', 'Preterite: tuvo una idea presents the idea arriving as a particular event, rather than a state of possession.'),
      P('estar · nosotros · preparando is given', 'estuvimos', 'Preterite: estuvimos preparando covers the full forty-minute period that follows the decision.'),
      P('llegar · los vecinos', 'llegaron', 'Preterite: their arrival is the point at which the completed preparations are assessed.'),
      P('explicar · la narradora', 'explicó', 'Preterite: the explanation is one action at the beginning of the performance.'),
      P('reírse · el público', 'se rio', 'Preterite: the audience’s laugh responds to the joke. Público is singular; include se, and write rio without an accent.'),
      P('pedir · una señora', 'pidió', 'Preterite: the request is a particular response after the play. The third-person preterite of pedir changes e to i.')
    ], { title: 'Optional: the director gives two instructions', text: 'A Ana, el director le dice: «{{1}} aquí y ayúdame con esta silla». Al grupo le dice: «{{2}} el programa al público cuando entre».', gaps: [
      E('venir · tú · affirmative imperative', 'ven', 'imperative', 'Ven is the irregular affirmative tú command: the director asks Ana to come towards him.'),
      E('dar + le · vosotros · affirmative imperative; le refers to el público', 'dadle', 'imperative', 'The vosotros command dad keeps its final d before le: dadle. The pronoun follows and attaches to the affirmative command.')
    ] }, 'The play, local memories, neighbourhood and characters are fictional. The date range belongs to their imagined project; this is not a record of a particular town.'),

  unitStory(19, 'Un domingo de noviembre de 1933', 'An imagined voter experiences a documented change in electoral rights.', 'narrative', 'History · women’s voting rights in Spain', [9, 10], ['Historical dates and rights vocabulary', 'A scene and a political event', 'Irregular preterite forms', 'Sequence markers'],
    `En noviembre de 1933, Isabel {{1}} veintisiete años y {{2}} en una tienda de Madrid. Por entonces, España era una [[república|republic: a state whose head is not a monarch]]. La Constitución de 1931 reconocía el derecho de las mujeres a votar. El 19 de noviembre {{3}} las primeras elecciones generales españolas con participación de votantes mujeres. Isabel iba a ejercer ese derecho por primera vez.

Aquella mañana {{4}} temprano de casa con su hermana. Mientras las dos {{5}} en la fila, Isabel le {{6}} cómo se sentía. Su hermana estaba contenta, pero también nerviosa. Delante de ellas, una señora {{7}} que las niñas de su infancia apenas iban a la escuela. Isabel {{8}} un poco de tristeza al escucharla. Cuando {{9}} su turno, mostró su documento y votó. Luego {{10}} a su hermana junto a la salida. Durante el regreso, las dos {{11}} hablando de lo que acababan de vivir. Al llegar, Isabel {{12}} la fecha en su cuaderno: quería recordar aquel domingo con todos sus detalles.`, [
      I('tener · Isabel', 'tenía', 'Imperfect: her age establishes her circumstances in November 1933; it is not an event in the voting sequence.'),
      I('trabajar · Isabel', 'trabajaba', 'Imperfect: her job belongs to the background of this imagined voter’s life.'),
      P('celebrarse · las elecciones', 'se celebraron', 'Preterite: the elections are a documented event on a specific date. Include se and use a plural verb.'),
      P('salir · Isabel', 'salió', 'Preterite: leaving home begins the personal sequence on that morning.'),
      I('esperar · las dos hermanas', 'esperaban', 'Imperfect: the wait is already in progress when Isabel asks about her sister’s feelings.'),
      P('preguntar · Isabel', 'preguntó', 'Preterite: the question is one conversational event during the wait.'),
      I('contar · una señora', 'contaba', 'Imperfect: her account is heard as it unfolds in the queue.', [A('contó', 'preterite', 'Preterite: contó presents her account as a whole intervention before Isabel’s emotional response.')]),
      P('sentir · Isabel', 'sintió', 'Preterite: the story produces a particular emotional reaction. The third-person preterite of sentir changes e to i.'),
      P('llegar · su turno', 'llegó', 'Preterite: her turn arriving changes the scene from waiting to voting.'),
      P('esperar · Isabel', 'esperó', 'Preterite: this reports a particular wait after her own vote, before the sisters go home together.'),
      P('estar · las dos hermanas · hablando is given', 'estuvieron', 'Preterite: estuvieron hablando presents their conversation over the return journey as a whole episode.', [A('estaban', 'imperfect', 'Imperfect: estaban hablando takes us inside the return journey and describes the conversation in progress along the way.')]),
      P('escribir · Isabel', 'escribió', 'Preterite: writing the date is the final action preserving the experience in her notebook.')
    ], { title: 'Optional: organising the retelling', text: '«Primero voté yo. {{1}}, votó mi hermana. {{2}} llegamos a casa y guardé el cuaderno». El primer marcador indica que pasó poco tiempo; el segundo introduce un momento posterior.', gaps: [
      E('immediately afterwards · narrative marker', 'poco después', 'narrative', 'Poco después places the sister’s vote a short time after Isabel’s. The cue asks specifically for that short interval.'),
      E('later · narrative marker', 'más tarde', 'narrative', 'Más tarde moves the account to the later arrival home without claiming it happened immediately after voting.', [A('luego', 'narrative', 'Luego also moves the account on to a later stage; it does not specify the length of the interval.'), A('después', 'narrative', 'Después also marks the next later stage in this retelling without specifying a short interval.')])
    ] }, 'Isabel, her sister and the woman in the queue are fictional. Spain’s 1931 Constitution recognised women’s voting rights. The general election of 19 November 1933 was the first Spanish general election in which women voted; this is not a claim that it was their first participation in every kind of vote.', [{ title: 'Congreso de los Diputados · First general election in which women voted, 1933', url: 'https://www.congreso.es/es/fotonoticias?_fotonoticias_fotonId=4889&_fotonoticias_mvcPath=detalle&p_p_id=fotonoticias&p_p_lifecycle=0&p_p_mode=view&p_p_state=normal' }]),

  unitStory(20, 'La noticia que cruzó la ciudad', 'A fictional family follows the opening of Berlin’s border crossings in November 1989.', 'narrative', 'History · Berlin, 9 November 1989', [9, 10], ['History and freedom of movement', 'A developing scene and a bounded wait', 'Discovering information with supe', 'Reactions and narrative markers'],
    `A finales de los años ochenta, Elena {{1}} en Berlín Occidental y {{2}} español a un grupo de adultos. La ciudad {{3}} dividida por un muro. El 9 de noviembre de 1989, ella {{4}} corrigiendo ejercicios cuando un amigo la {{5}} por teléfono: había noticias importantes sobre los viajes desde el este. Elena encendió la televisión y {{6}} que mucha gente se acercaba a los [[pasos fronterizos|border crossings: the places where people are allowed to cross a border]].

Su hermano, que vivía al otro lado, todavía {{7}} en casa. Hablaron unos minutos, pero ninguno sabía exactamente qué iba a pasar. Más tarde, las autoridades {{8}} los pasos de la ciudad. La frontera se abría aquella noche, aunque el muro no desapareció de golpe. Elena {{9}} a pie a un punto de encuentro y {{10}} esperando casi una hora, hasta que vio a su hermano. Al reconocerse, los dos {{11}} de alegría. Después {{12}} un paseo juntos. Años más tarde, Elena recordaba perfectamente el frío, los abrazos y su sorpresa al compartir por fin aquella calle.`, [
      I('vivir · Elena', 'vivía', 'Imperfect: her home in West Berlin is the situation from which the events are recalled.'),
      I('enseñar · Elena', 'enseñaba', 'Imperfect: teaching Spanish describes her work in that period, before the particular evening.'),
      I('estar · la ciudad', 'estaba', 'Imperfect: estaba dividida describes the city’s condition at that time. Estar works with this result-state participle.'),
      I('estar · Elena · corrigiendo is given', 'estaba', 'Imperfect: estaba corrigiendo places her work in progress when the telephone call interrupts it.'),
      P('llamar · un amigo', 'llamó', 'Preterite: the call introduces the news during Elena’s marking.'),
      P('saber · Elena', 'supo', 'Preterite: supo means she found out this information after turning on the television; it is a new discovery.'),
      I('estar · su hermano', 'estaba', 'Imperfect: his location at home is the situation at the time they speak; todavía marks its continuation.'),
      P('abrir · las autoridades', 'abrieron', 'Preterite: the openings that night are presented as historical events, rather than as the wall’s physical demolition.'),
      P('ir · Elena', 'fue', 'Preterite: walking to the meeting point is the next particular action. Ir and ser share these preterite forms.'),
      P('estar · Elena · esperando is given', 'estuvo', 'Preterite: estuvo esperando includes the entire wait, bounded by seeing her brother, even though waiting is a developing activity.'),
      P('llorar · los dos', 'lloraron', 'Preterite: crying is their particular reaction on recognising each other.'),
      P('dar · los dos', 'dieron', 'Preterite: taking the walk is the next completed shared experience after the reunion. Dar has dieron, without an accent.')
    ], { title: 'Optional: a sudden event and an explanation', text: 'Al contar su noche, Elena dice: «Yo corregía ejercicios tranquilamente y, {{1}}, sonó el teléfono. Mi amigo estaba muy emocionado. {{2}} tenía noticias de los pasos fronterizos».', gaps: [
      E('suddenly · narrative marker', 'de repente', 'narrative', 'De repente presents the call as an unexpected interruption to the quiet marking session.', [A('de pronto', 'narrative', 'De pronto also presents the call as a sudden, unexpected interruption.')]),
      E('it turns out that · narrative expression', 'resulta que', 'narrative', 'Resulta que introduces the explanation Elena gives now for her friend’s excitement then; the present form is natural in this retrospective storytelling.')
    ] }, 'Elena, her brother, friend and reunion are fictional. Berlin’s border crossings opened on the night of 9 November 1989. Opening the crossings and dismantling the wall were different processes; the story does not claim that the whole wall was demolished that night.', [{ title: 'Berlin city government · Opening and fall of the Berlin Wall', url: 'https://www.berlin.de/en/history/8482274-8619314-opening-and-fall-of-the-berlin-wall.en.html' }]),

  unitStory(21, 'El invento del cajón', 'An archive project uncovers a family invention and a surprising recording.', 'narrative', 'An imagined invention · family archive', [9, 10], ['Invention and archive vocabulary', 'Periods of life and time references', 'Progressive forms and interruptions', 'Irregular preterite sentir and dormir'],
    `El mes pasado, mis primos y yo {{1}} un pequeño archivo sobre nuestra familia para una exposición del barrio. En el cajón de un escritorio {{2}} un cuaderno de mi bisabuela, que {{3}} [[costurera|dressmaker: someone whose work is sewing clothes]]. A principios de los años sesenta, según sus notas, {{4}} trabajando en una máquina para cortar [[tela|fabric: material used to make clothes]] con menos esfuerzo. No sabíamos si su idea llegó a funcionar.

Una tarde, mientras nosotros {{5}} las páginas, mi primo {{6}} un dibujo de la máquina terminada. Entonces nuestra tía {{7}} una caja y sacó una cinta. Resulta que la bisabuela grabó allí una explicación para sus hijos. Durante la siguiente hora {{8}} escuchando y comparando la voz con los dibujos. Mi prima {{9}} mucha emoción al oír su nombre: la bisabuela la mencionaba cuando era un bebé. Después nos {{10}} otra cinta. En ella se escuchaba una canción, y su hijo pequeño se {{11}} al final, junto al micrófono. Aquel descubrimiento nos {{12}} ganas de seguir investigando. En la exposición decidimos separar las notas comprobables de nuestras propias preguntas.`, [
      I('preparar · mis primos y yo', 'preparábamos', 'Imperfect: the archive project is underway when the notebook is found; it establishes the setting for the discoveries.', [A('preparamos', 'preterite', 'Preterite: preparamos sums up last month’s archive project as a whole before recounting how its discoveries happened.')]),
      P('encontrar · nosotros', 'encontramos', 'Preterite: finding the notebook is a particular discovery within the project.'),
      I('ser · mi bisabuela', 'era', 'Imperfect: her occupation identifies her in the background account; professions use ser.'),
      I('estar · mi bisabuela · trabajando is given', 'estaba', 'Imperfect: the notes show her work on the machine in progress at that point in the sixties, without stating its completion.'),
      I('leer · nosotros', 'leíamos', 'Imperfect: the reading is already in progress when the cousin notices the drawing. Leíamos has a written accent.'),
      P('descubrir · mi primo', 'descubrió', 'Preterite: noticing the completed-machine drawing supplies a new piece of information.'),
      P('traer · nuestra tía', 'trajo', 'Preterite: bringing the box is the aunt’s next action in the sequence. Traer uses the irregular root traj-.'),
      P('estar · nosotros · escuchando is given', 'estuvimos', 'Preterite: estuvimos escuchando covers the full following hour spent studying the recording and drawings.'),
      P('sentir · mi prima', 'sintió', 'Preterite: hearing her name triggers a particular emotion. Sentir changes e to i in this third-person form.'),
      P('poner · nuestra tía · nos is given', 'puso', 'Preterite: playing a second tape advances the sequence. Puso uses pus-, and nos is already given.'),
      P('dormir · su hijo pequeño · se is given', 'durmió', 'Preterite: se durmió marks the child falling asleep at the end of the song. Dormir changes o to u here; se is already written.'),
      P('dar · aquel descubrimiento · nos is given', 'dio', 'Preterite: the discovery produces a new motivation at that moment. Dio has no written accent.')
    ], { title: 'Optional: two time references in a caption', text: 'El texto de la exposición contrasta el pasado con el presente: «{{1}}, la bisabuela trabajaba sola en su taller. {{2}}, sus dibujos están en nuestro archivo digital». Primero se sitúa la acción en el pasado y después se vuelve al presente.', gaps: [
      E('back then · period already introduced', 'por entonces', 'narrative', 'Por entonces returns to the previously introduced period of the bisabuela’s workshop.', [A('en aquella época', 'narrative', 'En aquella época also refers back to that earlier stage of her life.'), A('entonces', 'narrative', 'Entonces means at that time here, locating the workshop in the earlier period rather than marking the next event.')]),
      E('nowadays · present time marker', 'hoy en día', 'narrative', 'Hoy en día explicitly contrasts the current digital archive with her earlier workshop.', [A('actualmente', 'narrative', 'Actualmente also locates the drawings in the present, contrasting with the earlier period.'), A('ahora', 'narrative', 'Ahora also creates the intended present-time contrast in this caption.')])
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
