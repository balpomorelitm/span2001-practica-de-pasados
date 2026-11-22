const A = (form, tense, feedback) => ({ form, tense, feedback });
const G = (id, cue, answers, options, wrongAnswers = []) => ({ id, cue, answers, ...(options ? { options } : {}), wrongAnswers });
const Q = (id, text, ...gaps) => ({ id, text, gaps });
const I = (form, feedback) => A(form, 'imperfect', feedback);
const P = (form, feedback) => A(form, 'preterite', feedback);
const single = (prefix, rows) => rows.map(([text, cue, form, tense, feedback, wrongAnswers], i) => Q(prefix + 'i' + (i + 1), text.replace('___', '{{' + prefix + 'g' + (i + 1) + '}}'), G(prefix + 'g' + (i + 1), cue, [A(form, tense, feedback)], undefined, wrongAnswers || [])));
const W = (form, kind, feedback) => ({ form, kind, feedback });

export const exercises = [
  {
    id: 'scene-readings', title: 'Una escena, dos lecturas', description: 'Read the same kind of situation through two different lenses.', level: 'Start', guide: 'perspective',
    instruction: 'Choose the interpretation expressed by the quoted verb. Focus on viewpoint: a situation viewed from within, or an event presented as a whole.',
    items: [
      ['«Cuando Inés cruzaba la plaza, oyó una voz». ¿Qué expresa «cruzaba»?', 'El cruce se presenta en desarrollo.', 'El cruce se presenta como una acción completa.', 'imperfect', 'Imperfect: cruzaba places us inside the crossing when Inés hears the voice. It does not present the whole crossing or say whether she stopped.'],
      ['«Inés cruzó la plaza y entró en la farmacia». ¿Qué expresa «cruzó»?', 'El cruce se presenta como una acción completa.', 'El cruce se presenta en desarrollo.', 'preterite', 'Preterite: cruzó presents the crossing as a complete event followed by entering the pharmacy.'],
      ['«A las ocho, Leo preparaba la cena». ¿Qué expresa «preparaba»?', 'Vemos la preparación desde dentro.', 'Se resume toda la preparación.', 'imperfect', 'Imperfect: preparaba shows the cooking in progress at eight, without telling us when it ended.'],
      ['«Leo preparó la cena en veinte minutos». ¿Qué expresa «preparó»?', 'Se resume toda la preparación.', 'Vemos la preparación desde dentro.', 'preterite', 'Preterite: preparó packages the preparation as a whole. Twenty minutes measures that complete process.'],
      ['«De niña, Eva jugaba en este patio». ¿Qué expresa «jugaba»?', 'Una costumbre de aquella etapa.', 'Una ocasión concreta y completa.', 'imperfect', 'Imperfect: jugaba describes a childhood habit, viewed from inside that period without counting a complete series.'],
      ['«El sábado, Eva jugó un partido en este patio». ¿Qué expresa «jugó»?', 'Una ocasión concreta y completa.', 'Una costumbre de aquella etapa.', 'preterite', 'Preterite: jugó presents this particular match as a complete event, rather than a childhood routine.'],
      ['«La sala era pequeña y tenía dos ventanas». ¿Qué expresa «era»?', 'Una característica de la sala dentro de la escena.', 'Una valoración de una actividad completa.', 'imperfect', 'Imperfect: era sketches a characteristic of the room as background. It does not imply the room still exists today.'],
      ['«La reunión fue breve y terminó a las seis». ¿Qué expresa «fue»?', 'Una valoración de la reunión completa.', 'Una descripción desde dentro de la reunión.', 'preterite', 'Preterite: fue evaluates the complete meeting as brief, looking back over the episode.']
    ].map(([text, correct, other, tense, feedback], i) => Q('e01i' + i, text + '\n\n{{e01g' + i + '}}', G('e01g' + i, 'Choose the interpretation', [A(correct, tense, feedback)], i % 2 ? [other, correct] : [correct, other])))
  },
  {
    id: 'verb-warmup', title: 'Calentamiento verbal', description: 'Practise regular endings and essential irregular forms.', level: 'Start', guide: 'forms',
    instruction: 'Write the conjugated verb. The cue gives you the subject and tense, so this round focuses on form. Include accents.',
    items: single('e02', [
      ['Ayer, a las diez, Marta ___ la cena; aún tenía las verduras en la mano.', 'preparar · ella · imperfecto', 'preparaba', 'imperfect', 'Imperfect: preparaba shows Marta cooking at ten. The ending -aba agrees with ella.', [W('preparó','tense','Preparó presents the preparation as a whole. This cue asks for cooking in progress: preparaba.'),W('preparabas','person','Preparabas belongs to tú. Marta is ella: preparaba.')]],
      ['Ayer Marta ___ tres platos y los puso en la mesa.', 'preparar · ella · indefinido', 'preparó', 'preterite', 'Preterite: preparó presents the preparation as a complete event before putting the dishes on the table.', [W('preparaba','tense','Preparaba looks inside the preparation. The requested completed-event form is preparó.'),W('preparé','person','Preparé means I prepared. Marta requires preparó.')]],
      ['De pequeños, nosotros ___ al río casi todos los domingos.', 'ir · nosotros · imperfecto', 'íbamos', 'imperfect', 'Imperfect: íbamos describes a childhood routine. Ir is irregular: iba, ibas, iba, íbamos, ibais, iban.', [W('fuimos','tense','Fuimos presents a trip or series as a whole. The cue asks for a childhood routine: íbamos.'),W('iban','person','Iban belongs to ellos, ellas or ustedes. Nosotros requires íbamos.')]],
      ['El domingo pasado nosotros ___ al río, comimos allí y volvimos por la tarde.', 'ir · nosotros · indefinido', 'fuimos', 'preterite', 'Preterite: fuimos is the first complete event in one outing. Ir and ser share these preterite forms.', [W('íbamos','tense','Íbamos would describe a journey from inside or a habit. This cue requests a complete outing: fuimos.'),W('fueron','person','Fueron is third-person plural. Nosotros takes fuimos.')]],
      ['En esta foto, tú ___ unos ocho años.', 'tener · tú · imperfecto', 'tenías', 'imperfect', 'Imperfect: tenías supplies your age within the photographed scene.', [W('tuviste','tense','Tuviste bounds a state or episode. This cue asks for age within the scene: tenías.'),W('tenía','person','Tenía fits yo, él or ella. Tú requires tenías.')]],
      ['Al abrir la caja, yo ___ una sorpresa enorme.', 'tener · yo · indefinido', 'tuve', 'preterite', 'Preterite: tuve una sorpresa presents the surprise as an event on opening the box.', [W('tenía','tense','Tenía describes a state from within. The requested event form is tuve.'),W('tuvo','person','Tuvo is él, ella or usted. Yo requires tuve.')]],
      ['Antes, vosotros ___ un cuento juntos cada noche.', 'leer · vosotros · imperfecto', 'leíais', 'imperfect', 'Imperfect: leíais describes a nightly habit. Keep the written accent on í.', [W('leísteis','tense','Leísteis presents a complete reading event. This cue asks for the nightly routine: leíais.'),W('leíamos','person','Leíamos belongs to nosotros. Vosotros requires leíais.')]],
      ['Anoche vosotros ___ el cuento entero y cerrasteis el libro.', 'leer · vosotros · indefinido', 'leísteis', 'preterite', 'Preterite: leísteis presents reading the entire story as complete before closing the book.', [W('leíais','tense','Leíais looks inside the reading. The requested completed form is leísteis.'),W('leyeron','person','Leyeron is third-person plural. Vosotros requires leísteis.')]],
      ['Nuestro guía ___ muy amable y sabía mucho del barrio.', 'ser · él · imperfecto', 'era', 'imperfect', 'Imperfect: era gives a descriptive portrait of the guide as part of the scene.', [W('fue','tense','Fue can evaluate a bounded encounter. The requested descriptive portrait uses era.'),W('eran','person','Eran is plural. Nuestro guía is singular: era.')]],
      ['En conjunto, la visita ___ muy interesante: aprendimos mucho.', 'ser · ella · indefinido', 'fue', 'preterite', 'Preterite: fue gives an overall evaluation of the complete visit.', [W('era','tense','Era would place us inside the visit. This cue asks for an overall evaluation: fue.'),W('fueron','person','Fueron is plural. La visita requires fue.')]],
      ['Desde la cama, yo ___ la lluvia mientras intentaba dormir.', 'oír · yo · imperfecto', 'oía', 'imperfect', 'Imperfect: oía describes hearing rain as an ongoing part of the bedtime scene.', [W('oí','tense','Oí presents hearing as an event. The requested background form is oía.'),W('oías','person','Oías belongs to tú. Yo requires oía.')]],
      ['De pronto, yo ___ un golpe y abrí los ojos.', 'oír · yo · indefinido', 'oí', 'preterite', 'Preterite: oí introduces the sound as an event moving the account forward.', [W('oía','tense','Oía gives an ongoing background view. The cue requests the sound as an event: oí.'),W('oyó','person','Oyó belongs to él, ella or usted. Yo takes oí.')]]
    ])
  },
  {
    id: 'process', title: 'Dentro del proceso o después', description: 'Compare a moment inside an action with a complete step in a sequence.', level: 'Start', guide: 'scene',
    instruction: 'Conjugate for the viewpoint stated in each sentence. Compare the two versions of each situation; the duration of the action is not the deciding factor.',
    items: single('e03', [
      ['En pleno descenso, yo ___ las escaleras cuando sonó mi móvil; todavía me quedaban dos pisos.', 'bajar · yo', 'bajaba', 'imperfect', 'Imperfect: bajaba catches you partway down. The remaining floors make the inside viewpoint explicit.'],
      ['Esta es la secuencia completa: yo ___ las escaleras, llegué al portal y abrí la puerta.', 'bajar · yo', 'bajé', 'preterite', 'Preterite: bajé presents the whole descent as a completed step before reaching the entrance.'],
      ['La foto muestra un momento de la cena: mis primos ___ y tenían los platos delante.', 'cenar · ellos', 'cenaban', 'imperfect', 'Imperfect: cenaban shows the meal in progress in the photograph, rather than the whole dinner.'],
      ['El resumen de la noche es sencillo: mis primos ___, recogieron la mesa y se acostaron.', 'cenar · ellos', 'cenaron', 'preterite', 'Preterite: cenaron packages dinner as a complete event in the evening’s sequence.'],
      ['Todavía estabais girando la llave: vosotros ___ la puerta cuando se apagó la luz.', 'abrir · vosotros', 'abríais', 'imperfect', 'Imperfect: abríais shows the opening from within; you were still turning the key.'],
      ['Por fin, vosotros ___ la puerta del todo y entrasteis en el piso.', 'abrir · vosotros', 'abristeis', 'preterite', 'Preterite: abristeis presents the opening as achieved, followed by entering the flat.'],
      ['Vimos el tren en plena salida: ___ lentamente de la estación, con los últimos vagones junto al andén.', 'salir · él', 'salía', 'imperfect', 'Imperfect: salía shows departure unfolding with some carriages still beside the platform.'],
      ['El registro resume toda la salida: el tren ___ a las seis y llegó a Toledo a las siete.', 'salir · él', 'salió', 'preterite', 'Preterite: salió records the departure as a complete event, followed by arrival.']
    ])
  },
  {
    id: 'duration', title: '¿Qué pasaba? ¿Cuánto duró?', description: 'Separate a whole time interval from a moment inside that interval.', level: 'Build', guide: 'duration',
    instruction: 'Write the verb for the requested view. Compare a total interval with a situation at a reference moment. Do not choose by duration alone.',
    items: single('e04', [
      ['Periodo completo: Marta ___ en Granada desde mayo hasta agosto y después regresó a casa.', 'estar · ella', 'estuvo', 'preterite', 'Preterite: estuvo presents Marta’s entire stay, including its boundaries. Months can form one whole episode.'],
      ['Vista desde dentro: en junio Marta ___ en Granada; desde allí me llamaba por las noches.', 'estar · ella', 'estaba', 'imperfect', 'Imperfect: estaba locates Marta inside the June scene, rather than measuring the complete stay.'],
      ['Periodo completo: el museo ___ cerrado seis años; finalmente volvió a abrir en 2023.', 'permanecer · él', 'permaneció', 'preterite', 'Preterite: permaneció covers the whole six-year closure, ending with reopening. Length does not require the imperfect.'],
      ['Vista desde dentro: cuando visité la ciudad en 2020, el museo ___ cerrado por las obras.', 'permanecer · él', 'permanecía', 'imperfect', 'Imperfect: permanecía describes the museum’s condition at the time of the visit, not the whole closure.'],
      ['Recuento completo: ayer yo ___ exactamente diez minutos en el jardín y luego guardé las herramientas.', 'trabajar · yo', 'trabajé', 'preterite', 'Preterite: trabajé measures a complete ten-minute session before putting the tools away.'],
      ['Vista desde dentro: cuando llegaste, yo ___ en el jardín y aún tenía las herramientas en la mano.', 'trabajar · yo', 'trabajaba', 'imperfect', 'Imperfect: trabajaba shows work in progress at your arrival, regardless of its actual duration.'],
      ['Intervalo completo: el semáforo ___ rojo diez segundos y después cambió a verde.', 'estar · él', 'estuvo', 'preterite', 'Preterite: estuvo presents the entire red-light interval, ending when the light turns green.'],
      ['Un instante de ese intervalo: en la foto, el semáforo ___ rojo y una mujer esperaba para cruzar.', 'estar · él', 'estaba', 'imperfect', 'Imperfect: estaba describes the light at the photographed instant. Even a short situation can be viewed from within.']
    ])
  },
  {
    id: 'descriptions', title: '¿Cómo era? ¿Cómo fue?', description: 'Describe people and places, then evaluate complete experiences.', level: 'Build', guide: 'description',
    instruction: 'Express the requested reading: a portrait within a scene or an overall evaluation. Another tense may be grammatical in a different account, but here the prompt tells you which viewpoint to practise.',
    items: single('e05', [
      ['Retrato de una persona: mi primera profesora ___ paciente y muy divertida.', 'ser · ella', 'era', 'imperfect', 'Imperfect: era gives a descriptive portrait of her character. Fue could evaluate behaviour in a bounded episode, a different requested reading.'],
      ['Balance de un episodio completo: su última clase ___ muy divertida y aprendimos mucho.', 'ser · ella', 'fue', 'preterite', 'Preterite: fue evaluates the whole final lesson. Era would place the reader within the lesson, changing the viewpoint.'],
      ['Descripción de un lugar: el pueblo ___ pequeño y tenía una plaza con árboles.', 'ser · él', 'era', 'imperfect', 'Imperfect: era establishes the village’s size as background, alongside its square.'],
      ['Valoración de la experiencia completa: el viaje al pueblo ___ largo, pero mereció la pena.', 'ser · él', 'fue', 'preterite', 'Preterite: fue looks back over the complete journey and evaluates its length.'],
      ['Retrato dentro de una escena: el día de la foto, mi hermano ___ nervioso y no sabía dónde mirar.', 'estar · él', 'estaba', 'imperfect', 'Imperfect: estaba describes his emotional state within the photographed scene.'],
      ['Resumen de todo el periodo: mi hermano ___ nervioso durante el examen entero y se relajó al salir.', 'estar · él', 'estuvo', 'preterite', 'Preterite: estuvo sums up the state across the complete exam, before he relaxed on leaving.'],
      ['Descripción del alojamiento: el hotel ___ [[acogedor|welcoming and comfortable]] y sus ventanas daban al río.', 'ser · él', 'era', 'imperfect', 'Imperfect: era describes a quality of the hotel in the remembered scene.'],
      ['Balance de la estancia completa: aquellos tres días en el hotel ___ maravillosos; descansamos de verdad.', 'ser · ellos', 'fueron', 'preterite', 'Preterite: fueron evaluates the complete stay. The plural subject aquellos tres días requires fueron.']
    ])
  },
  {
    id: 'habits', title: 'Costumbres y ocasiones', description: 'Distinguish an open habitual picture from a bounded count or occasion.', level: 'Build', guide: 'habits',
    instruction: 'Use the requested view: a routine inside a past period, or a whole occasion or closed series. Siempre and cada día do not determine the tense on their own.',
    items: single('e06', [
      ['Costumbre de aquella etapa: de pequeños, nosotros ___ a los abuelos los domingos.', 'visitar · nosotros', 'visitábamos', 'imperfect', 'Imperfect: visitábamos paints the visits as a childhood routine without counting the complete series.'],
      ['Recuento cerrado: el verano pasado nosotros ___ a los abuelos cinco veces en total.', 'visitar · nosotros', 'visitamos', 'preterite', 'Preterite: visitamos presents five visits as a closed total. Repetition can also be viewed as a whole.'],
      ['Costumbre: antes, mi padre siempre ___ junto a la ventana para leer.', 'sentarse · él', 'se sentaba', 'imperfect', 'Imperfect: se sentaba describes his usual choice of seat in that period. Include the reflexive pronoun se.'],
      ['Una ocasión concreta: aquella noche mi padre ___ junto a la ventana, abrió el libro y empezó a leer.', 'sentarse · él', 'se sentó', 'preterite', 'Preterite: se sentó is one completed step in that night’s sequence; the pronoun remains se.'],
      ['Costumbre: de pequeña, Ana ___ a la piscina cada miércoles después de clase.', 'ir · ella', 'iba', 'imperfect', 'Imperfect: iba presents the Wednesday visits as a routine within childhood.'],
      ['Recuento completo: en 2022 Ana ___ a la piscina solo tres veces en todo el año.', 'ir · ella', 'fue', 'preterite', 'Preterite: fue sums up three visits over a closed year. The repeated visits form a bounded series.'],
      ['Horario habitual: en aquella época, la tienda ___ a las ocho todos los días.', 'cerrar · ella', 'cerraba', 'imperfect', 'Imperfect: cerraba presents eight o’clock as the usual closing time in that period.'],
      ['Resumen de una semana completa: por las obras, la tienda ___ temprano los seis días y recuperó su horario el lunes siguiente.', 'cerrar · ella', 'cerró', 'preterite', 'Preterite: cerró treats the six closures as a completed series before the normal timetable returned.']
    ])
  },
  {
    id: 'background', title: 'Una historia necesita fondo', description: 'Build a station story by adding descriptive background.', level: 'Build', guide: 'narrative',
    instruction: 'Read the six parts in order. Choose the sentence that adds background already in place. The other option introduces a new event: it may be grammatical, but it does not fulfil the requested background role.',
    items: [
      ['El sábado fui a la estación para recoger a mi hermana. Al salir de casa miré el termómetro: dos grados. ___ . Me abroché el abrigo hasta arriba.', 'Hacía mucho frío', 'Llegó el autobús', 'Imperfect: hacía describes weather already surrounding the departure. Llegó would add a new event rather than the requested background.'],
      ['Entré en la estación y vi a muchas personas delante de la ventanilla. ___ . Decidí consultar el panel antes de comprar nada.', 'Había una cola muy larga', 'Una viajera compró un billete', 'Imperfect: había describes the queue already there on entry, rather than a new purchase. Existential había remains singular.'],
      ['En el panel leí que el tren llegaba veinte minutos tarde. No necesitaba correr. ___ . Entré en la cafetería.', 'Tenía tiempo para un café', 'Pedí un café con leche', 'Imperfect: tenía describes the available time explaining the decision. Pedí would be a new action, rather than the background reason.'],
      ['Dentro de la cafetería miré al camarero. ___ . Esperé mi turno sin llamarlo.', 'El camarero atendía a otra persona', 'El camarero terminó su trabajo', 'Imperfect: atendía shows service already in progress. Terminó would move the story to a new completed stage.'],
      ['Por fin fui al andén. Reconocí a mi hermana desde lejos. ___ . Agité la mano para saludarla.', 'Llevaba su abrigo amarillo', 'Se quitó el abrigo', 'Imperfect: llevaba describes what she is wearing at that moment. Se quitó introduces a change instead.'],
      ['Mi hermana me abrazó y señaló a sus dos acompañantes. ___ . Los saludé y salimos juntos de la estación.', 'Eran sus compañeros de piso', 'Se presentaron con una sonrisa', 'Imperfect: eran identifies the companions as background. Se presentaron would add an action to the sequence.']
    ].map(([text, correct, other, feedback], i) => Q('e07i' + i, text.replace('___','{{e07g' + i + '}}'), G('e07g' + i, 'Add the background', [I(correct, feedback)], i % 2 ? [other, correct] : [correct, other])))
  },
  {
    id: 'surprises', title: 'Cuatro pequeñas sorpresas', description: 'Bring setting and events together in four short anecdotes.', level: 'Stretch', guide: 'narrative',
    instruction: 'Complete all four anecdotes. Read the whole context to distinguish the scene from what happens within it. Include reflexive pronouns where needed.',
    items: [
      Q('e08i1', 'El ascensor de mi bloque {{e08g1}} viejo y hacía mucho ruido. Una mañana, por primera vez, yo {{e08g2}} una voz que decía «¡Buenos días!» dentro del ascensor. Al abrirse la puerta, vi a mi vecino: {{e08g3}} un loro en el hombro. De repente, los dos {{e08g4}} a reír.',
        G('e08g1','ser · él',[I('era','Imperfect: era establishes the lift’s age as background before the surprising event.')]),
        G('e08g2','oír · yo',[P('oí','Preterite: oí introduces the unexpected greeting as a new event that morning.')]),
        G('e08g3','llevar · él',[I('llevaba','Imperfect: llevaba describes the parrot on the neighbour’s shoulder when the door opens.')]),
        G('e08g4','ponerse · nosotros',[P('nos pusimos','Preterite: nos pusimos a reír marks the start of the shared laughter. Include nos.')])
      ),
      Q('e08i2', 'Mi hermana y yo {{e08g5}} el autobús cuando nuestro padre nos {{e08g6}} un mensaje: «Comprad siete limones y un sombrero». Nosotras no {{e08g7}} nada, porque solo íbamos a la biblioteca. Al llamarlo, {{e08g8}} el error: el mensaje era para su grupo de teatro.',
        G('e08g5','esperar · nosotras',[I('esperábamos','Imperfect: esperábamos sets up the waiting already in progress when the message arrives.')]),
        G('e08g6','mandar · él',[P('mandó','Preterite: mandó introduces the particular message received during the wait.')]),
        G('e08g7','entender · nosotras',[I('entendíamos','Imperfect: entendíamos describes your lack of understanding at that point, before the call resolves it.')]),
        G('e08g8','descubrir · nosotras',[P('descubrimos','Preterite: descubrimos marks the moment the call reveals the mistake.')])
      ),
      Q('e08i3', 'En la tienda de mi abuela, el gato siempre {{e08g9}} cerca de la caja. Un día, una clienta {{e08g10}} su bolsa para guardar el pan. Dentro {{e08g11}} el gato, muy cómodo entre una bufanda y un periódico. Al verlo, la clienta {{e08g12}} sin palabras durante unos segundos y después soltó una [[carcajada|a loud burst of laughter]].',
        G('e08g9','dormir · él',[I('dormía','Imperfect: dormía describes the cat’s usual habit, providing background for the unusual day.')]),
        G('e08g10','abrir · ella',[P('abrió','Preterite: abrió is the particular bag-opening event that leads to discovery.')]),
        G('e08g11','estar · él',[I('estaba','Imperfect: estaba shows the cat’s location on discovery, rather than narrating how it got there.')]),
        G('e08g12','quedarse · ella',[P('se quedó','Preterite: se quedó marks her change into speechlessness, followed by laughter.')])
      ),
      Q('e08i4', 'Mientras Sara {{e08g13}} en la biblioteca, nosotros {{e08g14}} una pequeña fiesta en su piso. Ella no {{e08g15}} ninguna sorpresa: pensaba cenar sola y ver una película. Cuando llegó y vio la mesa preparada, {{e08g16}} una sonrisa enorme y nos abrazó uno por uno.',
        G('e08g13','trabajar · ella',[I('trabajaba','Imperfect: trabajaba supplies the ongoing library activity during which the preparations take place.')]),
        G('e08g14','preparar · nosotros',[P('preparamos','Preterite: preparamos presents the preparations as a complete accomplishment while Sara is away.'),I('preparábamos','Imperfect: preparábamos shows preparations in progress alongside Sara’s work. The later scene tells us they were eventually completed.')]),
        G('e08g15','esperar · ella',[I('esperaba','Imperfect: esperaba describes Sara’s expectations before arrival, as background to her surprise.')]),
        G('e08g16','mostrar · ella',[P('mostró','Preterite: mostró presents the smile as a new reaction to the prepared table, followed by the hugs.')])
      )
    ]
  },
  {
    id: 'alternatives', title: 'Dos opciones posibles', description: 'Explore contexts where both tenses work, with different meanings.', level: 'Stretch', guide: 'meaning',
    instruction: 'Every gap accepts an imperfect and a preterite form. Choose the meaning you want to express and conjugate accurately. Both earn full credit; feedback explains your chosen reading.',
    items: [
      ['Cuando abrí el sobre, yo ___ la verdad.', 'saber · yo', 'sabía', 'Imperfect: sabía means you already knew the truth when you opened the envelope. The opening is a reference moment for existing knowledge.', 'supe', 'Preterite: supe presents finding out the truth as an event on opening the envelope. The change into knowing is central.'],
      ['En aquella reunión, yo ___ a Daniel, pero apenas hablamos.', 'conocer · yo', 'conocía', 'Imperfect: conocía means you already knew Daniel at the time of the gathering.', 'conocí', 'Preterite: conocí presents meeting Daniel for the first time at that gathering.'],
      ['Cuando Ana llegó, yo ___ hablar con ella.', 'querer · yo', 'quería', 'Imperfect: quería describes your wish at Ana’s arrival without saying whether you acted on it.', 'quise', 'Preterite: quise presents a wish or decision to speak as a bounded reaction to her arrival. It does not guarantee a conversation.'],
      ['Aquel verano yo ___ mucho trabajo.', 'tener · yo', 'tenía', 'Imperfect: tenía describes the workload from inside the summer, perhaps as background to another event.', 'tuve', 'Preterite: tuve sums up the workload across that summer as a whole. A long state can also have this view.'],
      ['El domingo ___ mucho.', 'llover · impersonal', 'llovía', 'Imperfect: llovía places us inside the rainy Sunday scene, against which another event could occur.', 'llovió', 'Preterite: llovió reports the rain over Sunday as a bounded episode, without claiming it was brief.'],
      ['En la fiesta, Marta ___ muy nerviosa.', 'estar · ella', 'estaba', 'Imperfect: estaba describes Marta’s state as observed or recalled within the party scene.', 'estuvo', 'Preterite: estuvo sums up her nervousness over the relevant party interval. Both readings are supported by this open context.']
    ].map(([text, cue, imp, impFeedback, pret, pretFeedback], i) => Q('e09i' + i, text.replace('___','{{e09g' + i + '}}'), G('e09g' + i, cue, [I(imp,impFeedback),P(pret,pretFeedback)])))
  },
  {
    id: 'writing', kind: 'writing', title: 'Ahora cuenta tú', description: 'Write your own sentences, then assess form and viewpoint separately.', level: 'Stretch', guide: 'narrative',
    instruction: 'Write a complete Spanish sentence, then compare it with models. Different wording and word order are welcome. Award one point for the target verb form and one for the requested viewpoint. This is a self-assessed score, not automatic sentence grading.',
    items: [
      { id:'e10i1',text:'Describe tu calle de la infancia. Usa ser en imperfecto para presentar una característica.',model:'Mi calle era tranquila y estrecha.',variants:['La calle de mi infancia era muy tranquila.','De pequeño, mi calle era bastante ruidosa.'],target:'era',formFeedback:'Check era, the singular imperfect of ser. Adjectives, subject placement and other wording may differ.',meaningFeedback:'Award this point if you describe the street within a remembered childhood scene, rather than evaluate one complete visit.',guide:'description' },
      { id:'e10i2',text:'Cuenta una excursión terminada del sábado pasado. Usa ir con vosotros.',model:'El sábado pasado fuisteis a la montaña.',variants:['Vosotros fuisteis al lago el sábado pasado.','El sábado pasado fuisteis de excursión al bosque.'],target:'fuisteis',formFeedback:'Check fuisteis, the vosotros preterite of ir. Fuiste and fueron change the subject.',meaningFeedback:'Award this point if the outing is presented as a complete event. The destination can be different.',guide:'perspective' },
      { id:'e10i3',text:'Completa «Cuando sonó el timbre, yo…». Usa estudiar en imperfecto para mostrar la actividad en desarrollo.',model:'Cuando sonó el timbre, yo estudiaba en mi habitación.',variants:['Yo estudiaba español cuando sonó el timbre.','Cuando sonó el timbre, estudiaba para un examen.'],target:'estudiaba',formFeedback:'Check estudiaba for yo. The pronoun yo is optional because the prompt identifies the subject.',meaningFeedback:'Award this point if studying was already in progress when the doorbell rang. Either clause may come first.',guide:'scene' },
      { id:'e10i4',text:'Escribe una acción concreta de ayer con poner y el sujeto yo.',model:'Ayer puse las llaves encima de la mesa.',variants:['Puse un libro en la mochila ayer.','Ayer puse la mesa para la cena.'],target:'puse',formFeedback:'Check puse, the irregular yo preterite of poner. Poní and pusé are not correct.',meaningFeedback:'Award this point if putting or setting something is presented as a complete event. Ayer alone does not require this tense.',guide:'forms' },
      { id:'e10i5',text:'Expresa el momento de descubrir una noticia. Usa saber con yo y una perspectiva de acontecimiento.',model:'Al abrir el mensaje, supe la noticia.',variants:['Supe la noticia al leer el periódico.','Por fin supe la verdad.'],target:'supe',formFeedback:'Check supe, the irregular yo preterite of saber. Sabía is grammatical but expresses a different viewpoint.',meaningFeedback:'Award this point if you mean finding out or coming to know. Sabía describes knowledge already held.',guide:'meaning' },
      { id:'e10i6',text:'Describe una costumbre de otra época. Usa leer con vosotros en imperfecto.',model:'Antes leíais un cuento cada noche.',variants:['De pequeños, vosotros leíais en el jardín.','En aquella época leíais juntos después de cenar.'],target:'leíais',formFeedback:'Check leíais, including í. Leíamos changes the subject; leísteis changes the tense.',meaningFeedback:'Award this point if you describe a routine from inside a past period, rather than a closed count of readings.',guide:'habits' }
    ]
  }
];
