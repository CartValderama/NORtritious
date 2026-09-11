// Helsedirektoratets kostråd, as supplied by the client. Reference material only: nothing
// here feeds the calculation. Nøkkelhullet and the EFSA claims are labelling rules with
// numeric thresholds, whereas these are dietary advice about a whole diet over time, so they
// can't be checked against a single product's nutrition table. They are here because a user
// filling in that table is the one who wants them at hand.
//
// Kept verbatim rather than summarised: it is official guidance, and paraphrasing it in a
// compliance tool would invite someone to act on our wording instead of theirs.

export interface Kostrad {
  // The one-line version, from the "Kostrådene oppsummert" sheet.
  short: string;
  // The same advice as a heading, from the "Kostrådene - detaljer" sheet. Differs from
  // `short` mostly in punctuation, which is why both are kept instead of derived.
  title: string;
  detail: string;
}

export interface Matvaregruppe {
  group: string;
  advice: string;
}

// Not rendered at the moment: the dialog shows only MATVAREGRUPPER below. Kept because it is
// the client's own source material and the summary was pulled out for now, not dropped.
export const KOSTRAD: Kostrad[] = [
  {
    short: "Ha et variert kosthold, velg mest mat fra planteriket og spis med glede.",
    title: "Ha et variert kosthold, velg mest mat fra planteriket og spis med glede",
    detail:
      "Ved å spise i tråd med kostrådene, vil kostholdet være sunt og variert. Velg mest mat fra planteriket som grønnsaker, frukt og bær, fullkorn, bønner, linser og erter, og nøtter. Bruk planteoljer i matlaging. Spis med glede og sett av tid til måltidet. Et sunt og variert kosthold kan settes sammen på mange måter og tilpasses ulike kulturer, tradisjoner og livssyn. Det viktigste er at det er variert og består av mest mat fra planteriket. Det er plass til alle typer mat i et sunt og variert kosthold, men i ulike mengder. Noen matvarer bør spises hver dag, mens andre matvarer bør begrenses til noen ganger i uken eller sjeldnere. Det er anbefalt å begrense inntaket av bearbeidede matvarer med et høyt innhold av sukker, salt og mettet fett. Mat inneholder energi målt i kilokalorier eller kilojoule. Hvor mye energi hver enkelt trenger er avhengig av kroppsvekt, muskelmasse, alder, kjønn og aktivitetsnivå. Balanse mellom inntak og forbruk av energi er viktig for å unngå overvekt eller undervekt. Å være i aktivitet gjør det lettere å være i energibalanse. Velg planteoljer med umettet fett og myk margarin laget av disse, fremfor smør, smørblandinger, hard margarin og tropiske oljer som palme- og kokosolje. Det anbefales å spise 20–30 gram usaltede nøtter hver dag. Dette tilsvarer en liten håndfull. Det er også anbefalt å inkludere frø i kostholdet. Mat og måltider handler om mer enn næringsstoffer og om mer enn å bli mett. Det handler om å ta seg tid til måltidet og om måltidsglede. Mat er identitet, kultur, tradisjon og hygge. Gode måltidsfellesskap er viktig for mange, spesielt barn og unge.",
  },
  {
    short: "Frukt, bær eller grønnsaker bør være en del av alle måltider.",
    title: "Frukt, bær eller grønnsaker bør være en del av alle måltider",
    detail:
      "Frukt, bær eller grønnsaker bør spises til alle måltider, gjerne også som mellommåltid. Det er anbefalt å spise minst fem og helst åtte porsjoner hver dag. Varier mellom ulike typer frukt, bær og grønnsaker. Én porsjon er 100 gram, som tilsvarer omtrent én frukt eller en håndfull frukt, bær eller grønnsaker. Friske, hermetiske, frosne og varmebehandlede frukt, bær og grønnsaker inngår i mengdeanbefalingen. Tørket frukt inngår ikke i mengdeanbefalingen. Det er ikke en klar definisjon på porsjonsstørrelse for barn. En tommelfingerregel er at barnets håndfull utgjør én porsjon for et barn under 10 år. For å få til et variert inntak av frukt, bær og grønnsaker, kan omtrent halvparten være frukt og bær og halvparten grønnsaker. Selv om man ikke når anbefalingen på minst fem porsjoner frukt, bær og grønnsaker om dagen, vil enhver økning i inntaket være positivt for helsen. Inntil et halvt glass juice (1 dl) kan inngå som én porsjon dersom juicen er laget av 100 prosent frukt, bær eller grønnsaker. Dette gjelder ikke for nektar eller andre fruktdrikker tilsatt sukker eller søtstoff. Juice bør ikke drikkes utenom måltidene. Et høyt inntak av juice bør unngås. Inntaket av juice hos barn bør begrenses. Poteter hører med i et sunt og variert kosthold, men er ikke inkludert i mengdeanbefalingen for frukt, bær og grønnsaker. Begrens inntaket av bearbeidede potetprodukter tilsatt salt og fett, som pommes frites og potetchips. Begrens inntaket av produkter av frukt, bær og grønnsaker tilsatt sukker, som syltetøy og saft. Begrens inntaket av bearbeidede grønnsaksprodukter tilsatt mye salt og fett.",
  },
  {
    short:
      "La grovt brød eller andre fullkornsprodukter være en del av flere måltider hver dag.",
    title:
      "La grovt brød eller andre fullkornsprodukter være en del av flere måltider hver dag",
    detail:
      "Det er anbefalt å spise grovt brød, grovt knekkebrød, kornblandinger, gryn, fullkornspasta eller andre fullkornsprodukter som en del av minst to måltider hver dag. Anbefalt inntak er minst 90 gram fullkorn hver dag. Dette inkluderer også fullkorn i produkter. Fullkorn omfatter hele korn, gryn og sammalt mel. Fullkornsprodukter er produkter hvor fullkorn inngår, som grovt brød og knekkebrød, fullkornspasta, fullkornsris, fullkornsbulgur og andre grove kornprodukter. Velg brød, knekkebrød, kornblandinger, wraps og andre kornprodukter med høyt innhold av fullkorn og fiber og lavt innhold av fett, sukker og salt. Begrens bruken av frokostblandinger, kjeks og müslibarer med mye sukker, salt eller fett.",
  },
  {
    short:
      "Velg oftere fisk og sjømat, bønner og linser enn rødt kjøtt. Spis minst mulig bearbeidet kjøtt.",
    title:
      "Velg oftere fisk og sjømat, bønner og linser enn rødt kjøtt. Spis minst mulig bearbeidet kjøtt.",
    detail:
      "Velg fisk og sjømat til middag to til tre ganger i uken og gjerne som pålegg. Bruk bønner, linser og erter som middag eller som tilbehør. Fisk og sjømat, bønner, linser, erter, egg og rent kjøtt er gode kilder til flere viktige næringsstoffer. Begrens rødt kjøtt og spis minst mulig bearbeidede produkter av rødt og hvitt kjøtt. Anbefalt inntak av fisk er 300–450 gram hver uke. Minst 200 gram bør være fet fisk som laks, ørret, makrell og sild. Varier mellom disse og mager fisk som torsk, sei og hyse. Mengden gjelder spiseklart produkt. Fisk i fiskeprodukter som fiskekaker, fiskeboller, fiskegrateng og fiskepålegg, regnes også med i anbefalingen. Velg produkter med høy andel fisk og lite salt. Sjømat som skalldyr og skjell kan gjerne inngå i et sunt og variert kosthold, selv om det ikke inngår i mengdeanbefalingen for fisk. Velg gjerne belgfrukter som bønner, linser og erter til middag minst én gang i uken, og som tilbehør eller pålegg. Bearbeidede produkter av belgfrukter som vegetarburger, -pølser og falafel bør inneholde lite salt og fett. Rødt kjøtt kan inngå som en del av kostholdet, men bør begrenses til 350 gram per uke eller lavere. Mengden gjelder spiseklart produkt. Dette tilsvarer inntil to middager i uken og noe pålegg. Rødt kjøtt er kjøtt fra storfe, svin, sau og geit. Viltkjøtt er ikke inkludert i anbefalingen om rødt kjøtt. Ha et minimalt inntak av bearbeidede produkter av rødt kjøtt. Bearbeidede kjøttprodukter er produkter som er røkt, saltet eller konservert, som salami og annen spekemat, bacon og pølser. Karbonade- og kjøttdeig uten tilsatt salt og vann regnes ikke som bearbeidet kjøtt. Velg gjerne hvitt kjøtt fremfor rødt kjøtt. Hvitt kjøtt er kjøtt fra fjærkre som kylling, kalkun, and og høns. Ha et minimalt inntak av bearbeidede produkter av hvitt kjøtt, som nuggets og kyllingpølser. Egg kan inngå i et sunt og variert kosthold.",
  },
  {
    short:
      "Ha et daglig inntak av melk og meieriprodukter. Velg produkter med mindre fett.",
    title:
      "Ha et daglig inntak av melk og meieriprodukter. Velg produkter med mindre fett.",
    detail:
      "Det er anbefalt å drikke eller spise tre porsjoner melk eller meieriprodukter hver dag. Velg varianter med mindre fett. Melk og meieriprodukter er viktige kilder til kalsium og jod. Tre porsjoner tilsvarer omtrent fem dl melk eller meieriprodukter. Meieriprodukter inkluderer blant annet melk, yoghurt, kvarg, syrnet melk, ost, rømme og fløte. Begrens inntaket av meieriprodukter med mye mettet fett, som smør, fløte, fet ost, rømme og helmelk. For å bidra til å dekke behovet for jod bør to av porsjonene være melk, syrnet melk eller yoghurt. For å sikre inntaket av jod og kalsium, er det viktig å ha et daglig inntak av melk og meieriprodukter og samtidig et regelmessig inntak av henholdsvis hvit fisk, og mørkegrønne grønnsaker og belgfrukter. Hvis melk og meieriprodukter ikke inngår i kostholdet, kan plantedrikker bidra med mange av de samme næringsstoffene. Velg plantedrikker som er tilsatt kalsium, jod, riboflavin og vitamin B12.",
  },
  {
    short: "Godteri, snacks og søte bakevarer bør begrenses.",
    title: "Godteri, snacks og søte bakevarer bør begrenses",
    detail:
      "Det er anbefalt å begrense inntaket av godteri, sjokolade, snacks, chips, kjeks, is, søte pålegg, desserter og bakevarer som kaker og boller. I et variert og sunt kosthold er det rom for disse matvarene av og til, og i små mengder. Inntaket av godteri, snacks og søte bakevarer bør begrenses. Det er plass til noe av disse matvarene i kostholdet, men slike matvarer inneholder mye energi (kalorier) og lite næringsstoffer kroppen trenger, og kan ta opp plassen til sunn og næringsrik mat. Balanse mellom inntak og forbruk av energi er viktig for å unngå utvikling av overvekt. Barn under tre år bør ikke ha produkter med søtstoff. Det finnes et bredt utvalg av matvarer som kan inneholde søtstoff. Dette gjelder blant annet noen typer pastiller, tyggegummi, godteri, is, syltetøy, yoghurter og andre meieriprodukter.",
  },
  {
    short: "Drikk vann!",
    title: "Drikk vann!",
    detail:
      "Det er anbefalt å drikke vann når du er tørst, til måltider og ved fysisk aktivitet. Drikke med sukker, som brus, energidrikk, saft og iste, bør begrenses. Inntaket av alkohol bør være så lavt som mulig ut fra et helseperspektiv. Vann er den beste drikken for å slukke tørsten. Vann dekker væskebehovet uten å bidra med energi. Drikke med sukker, som brus, energidrikk, saft og iste, eller kaffe og te med mye tilsatt sukker bør begrenses. Drikke med søtstoff kan være et alternativ til drikke med sukker, men bør også begrenses. Hyppig inntak av drikke med sukker eller søtstoff mellom måltidene bør unngås. Barn under tre år bør ikke ha produkter med søtstoff. Barn og unge bør ikke drikke energidrikk fordi det inneholder mye koffein, og er i tillegg tilsatt sukker eller søtstoffer. For anbefaling om juice, se kostråd om frukt, bær og grønnsaker. Drikk minst mulig alkohol for helsens skyld. Barn, ungdom og gravide bør avstå helt fra alkohol. Et inntak av filtrert kaffe tilsvarende én til fire kopper per dag, samt te, kan inngå som en del av et sunt kosthold for voksne. Filtrert kaffe vil si kaffe som er filtrert med kaffefilter eller frysetørret kaffe (pulverkaffe). Ufiltrert kaffe er for eksempel kokekaffe og presskannekaffe. Drikkevarer med sukker eller alkohol inneholder energi (kalorier). Et høyt inntak kan føre til ubalanse mellom inntak og forbruk av energi. Energibalanse er viktig for å unngå utvikling av overvekt.",
  },
];

export const MATVAREGRUPPER: Matvaregruppe[] = [
  {
    group: "Belgfrukter",
    advice:
      "Velg gjerne belgfrukter som bønner, linser og erter til middag minst én gang i uken, og som tilbehør eller pålegg.",
  },
  { group: "Egg", advice: "Egg kan inngå i et sunt og variert kosthold" },
  {
    group: "Fisk",
    advice:
      "Anbefalt mengde fisk er 300–450 gram hver uke. Hvor minst 200 gram bør være fet fisk",
  },
  {
    group: "Frukt, bær, grønnsaker",
    advice: "500–800 gram daglig. Halvparten kan være grønnsaker.",
  },
  { group: "Fullkorn", advice: "Minst 90 gram daglig" },
  { group: "Godteri, snacks og søte bakevarer", advice: "Begrens" },
  {
    group: "Hvitt kjøtt",
    advice:
      "Velg gjerne hvitt kjøtt fremfor rødt kjøtt. Spis minst mulig bearbeidet kjøtt",
  },
  // "Jus" rather than the source sheet's "juice": the Norwegian spelling. Not "saft", which
  // the kostråd treat as a separate, sugar-added thing to limit.
  {
    group: "Jus",
    advice: "Inntil 1 dl jus kan regnes som en porsjon frukt eller grønt",
  },
  {
    group: "Koffein",
    advice: "Én til fire kopper kaffe per dag kan inngå for voksne",
  },
  {
    group: "Melk og meieriprodukter",
    advice: "3 porsjoner daglig, tilsvarende 5 dl melk eller meieriprodukter",
  },
  { group: "Nøtter og frø", advice: "20-30 gram usaltede nøtter daglig" },
  { group: "Planteoljer", advice: "Bruk planteoljer i matlaging" },
  { group: "Potet", advice: "Poteter hører med i et sunt og variert kosthold" },
  {
    group: "Rødt kjøtt",
    advice: "Inntil 350 gram i uken. Spis minst mulig bearbeidet kjøtt",
  },
  { group: "Vann", advice: "Drikk vann" },
  { group: "Alkohol", advice: "Drikk minst mulig alkohol for helsens skyld" },
];
