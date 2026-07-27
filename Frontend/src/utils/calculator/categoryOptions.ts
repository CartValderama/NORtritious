export interface CategoryOption {
  value: string;
  label: string;
}

// Maps the dropdown selection values to the backend category keys (e.g. "Kategori1", "Melk11a")
const CATEGORY_KEY_MAP: Record<string, string> = {
  "kategori 1": "Kategori1",
  "kategori 2": "Kategori2",
  "kategori 3": "Kategori3",
  "kategori 4": "Kategori4",
  "kategori 5": "Kategori5",
  "kategori 6": "Kategori6",
  "kategori 7": "Kategori7",
  "kategori 8a": "Kategori8a",
  "kategori 8b": "Kategori8b",
  "kategori 9": "Kategori9",
  "kategori 10": "Kategori10",
  "melk 11a": "Melk11a",
  "melk 11b": "Melk11b",
  "melk 12a": "Melk12a",
  "melk 12b": "Melk12b",
  "melk 13a": "Melk13a",
  "melk 13b": "Melk13b",
  "melk 14a": "Melk14a",
  "melk 14b": "Melk14b",
  "melk 15a": "Melk15a",
  "melk 15b": "Melk15b",
  "kategori 16": "Kategori16",
  "kategori 17": "Kategori17",
  "kategori 18": "Kategori18",
  "kategori 19": "Kategori19",
  "kategori 20": "Kategori20",
  "kategori 21": "Kategori21",
  // cat 22 — resolved via selectsFragment
  "kategori 22 a": "Kategori22a",
  "kategori 22 b": "Kategori22b",
  "kategori 22 c": "Kategori22c",
  "kategori 22 d": "Kategori22d",
  "kategori 23": "Kategori23",
  // cat 24 — resolved via selectsRation (deepest level)
  "kategori 24 a 1": "Kategori24a1",
  "kategori 24 a 2": "Kategori24a2",
  "kategori 24 b 1": "Kategori24b1",
  "kategori 24 b 2": "Kategori24b2",
  "kategori 24 b 3": "Kategori24b3",
  "kategori 24 b 4": "Kategori24b4",
  "kategori 24 c 1": "Kategori24c1",
  "kategori 24 c 2": "Kategori24c2",
  // cat 25 — resolved via selectsFragment
  "kategori 25 a": "Kategori25a",
  "kategori 25 b": "Kategori25b",
  "kategori 26": "Kategori26",
  "kategori 27": "Kategori27",
  "kategori 28": "Kategori28",
  "kategori 29": "Kategori29",
  "kategori 30": "Kategori30",
  "kategori 31": "Kategori31",
  "kategori 32": "Kategori32",
};

// Returns the backend category key from the current dropdown selection state.
// Uses the most specific (deepest) value that resolves to a known category.
export function getCategoryKey(
  product: string,
  fragment: string,
  ration: string,
): string | null {
  return (
    CATEGORY_KEY_MAP[ration] ||
    CATEGORY_KEY_MAP[fragment] ||
    CATEGORY_KEY_MAP[product] ||
    null
  );
}

// ── Group options (level 1) ──────────────────────────────────────────────────
export const GROUP_OPTIONS: CategoryOption[] = [
  { value: "grønnsaker, frukt, bær og nøtter",                          label: "Grønnsaker, frukt, bær og nøtter" },
  { value: "mel, gryn og ris",                                           label: "Mel, gryn og ris" },
  { value: "grøt, brød og pasta",                                        label: "Grøt, brød og pasta" },
  { value: "melk kategori",                                              label: "Melk, syrnede melkeprodukter og vegetabilske alternativer" },
  { value: "ost og vegetabilske alternativer",                           label: "Ost og vegetabilske alternativer" },
  { value: "matfett og oljer",                                           label: "Matfett og oljer" },
  { value: "fiskerivarer og produkter av fiskerivarer",                  label: "Fiskerivarer og produkter av fiskerivarer" },
  { value: "kjøtt og produkter som inneholder kjøtt",                   label: "Kjøtt og produkter som inneholder kjøtt" },
  { value: "helt eller delvis vegetabilske produkter",                   label: "Helt eller delvis vegetabilske produkter" },
  { value: "ferdigretter",                                               label: "Ferdigretter" },
  { value: "dressinger og sauser",                                       label: "Dressinger og sauser" },
];

// ── Product options per group (level 2) ─────────────────────────────────────
export const PRODUCT_OPTIONS_BY_GROUP: Record<string, CategoryOption[]> = {
  "grønnsaker, frukt, bær og nøtter": [
    { value: "kategori 1", label: "1. Grønnsaker, rotfrukter, belgvekster (unntatt peanøtter) og poteter. Produktene kan være foredlet. Uforedlede krydderurter omfattes også." },
    { value: "kategori 2", label: "2. Frukt og bær som er uforedlet. Produktene kan likevel være varmebehandlet." },
    { value: "kategori 3", label: "3. Nøtter og peanøtter som er uforedlet. Produktene kan likevel være varmebehandlet." },
  ],
  "mel, gryn og ris": [
    { value: "kategori 4", label: "4. Mel, gryn og flak av korn som inneholder 100 % fullkorn av korndelens tørrstoffinnhold. Kli og kim er unntatt fra kravet til fullkorn. Fullkornet kan helt eller delvis erstattes med grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) og rotfrukter for samme anvendelsesområde." },
    { value: "kategori 5", label: "5. Ris som inneholder 100 % fullkorn av produktets tørrstoffinnhold." },
    { value: "kategori 6", label: "6. Kornblandinger og frokostblandinger som inneholder minst 55 % fullkorn av produktets tørrstoffinnhold. Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse ved beregningen av fullkornsmengden. Glutenfrie kornblandinger og frokostkorn skal inneholde minst 20 % fullkorn av produktets tørrstoffinnhold." },
  ],
  "grøt, brød og pasta": [
    { value: "kategori 7",  label: "7. Grøt og grøtpulver (tilberedt ifølge produsentens anvisning) som inneholder minst 55 % fullkorn av produktets tørrstoffinnhold. Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse, ved beregningen av fullkornsmengden. Vilkårene gjelder for det spiseklare produktet." },
    { value: "kategori 8a", label: "8. a) Brød og brødmikser hvor bare væske og eventuelt gjær skal tilsettes, og som inneholder minst 30 % fullkorn av produktets tørrstoffinnhold. Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse, ved beregningen av fullkornsmengden. Produkter i gruppe 8 b) omfattes ikke. Glutenfrie brød og brødmikser skal inneholde minst 10 % fullkorn av produktets tørrstoffinnhold. Vilkårene gjelder for det spiseklare produktet." },
    { value: "kategori 8b", label: "8. b) Rugbrød og andre rugbaserte produkter samt brødmikser hvor bare væske og eventuelt gjær skal tilsettes, som inneholder minst 35 % fullkorn av produktets tørrstoffinnhold. I produktene skal minst 30 % av kornsortene være rug. Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse, ved beregningen av fullkornsmengden. Vilkårene gjelder for det spiseklare produktet." },
    { value: "kategori 9",  label: "9. Knekkebrød, skonroker og melmikser til slike produkter, hvor bare væske og eventuelt gjær skal tilsettes. Produktet skal inneholde minst 50 % fullkorn av produktets tørrstoffinnhold. Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse, ved beregningen av fullkornsmengden. Tilsvarende glutenfrie produkter skal inneholde minst 15 % fullkorn av produktets tørrstoffinnhold. Vilkårene gjelder for det spiseklare produktet." },
    { value: "kategori 10", label: "10. Pasta (ikke fylt) Produktet skal inneholde minst 50 % fullkorn av produktets tørrstoffinnhold. Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse, ved beregningen av fullkornsmengden. Glutenfri pasta (ikke fylt) har ikke krav til fullkorn. Vilkårene gjelder for produktets tørrstoffinnhold." },
  ],
  "melk kategori": [
    { value: "melk 11a", label: "11. a) Melk og syrnede melkeprodukter som er beregnet til å drikke, uten tilsatt smak. Tilsvarende laktosefrie produkter og laktosefrie melkedrikker omfattes også." },
    { value: "melk 11b", label: "11. b) Vegetabilske produkter med samme bruksområde som produkter i gruppe 11 a), uten tilsatt smak." },
    { value: "melk 12a", label: "12. a) Syrnede melkeprodukter som ikke er beregnet til å drikke, uten tilsatt smak. Tilsvarende laktosefrie produkter omfattes også." },
    { value: "melk 12b", label: "12. b) Vegetabilske produkter med samme bruksområde som produkter i gruppe 12 a), uten tilsatt smak." },
    { value: "melk 13a", label: "13. a) (Ikke vegetabilske) Syrnede melkeprodukter som ikke er beregnet til å drikke, med tilsatt smak. Tilsvarende laktosefrie produkter omfattes også." },
    { value: "melk 13b", label: "13. b) (Vegetabilske) Syrnede melkeprodukter som ikke er beregnet til å drikke, med tilsatt smak. Tilsvarende laktosefrie produkter omfattes også." },
    { value: "melk 14a", label: "14. a) (Ikke vegetabilske) Produkter som består av en blanding av melk og fløte med samme bruksområde som fløte og tilsvarende syrnede produkter, uten tilsatt smak. Tilsvarende laktosefrie produkter omfattes også." },
    { value: "melk 14b", label: "14. b) (Helt eller delvis vegetabilske) Produkter som består av en blanding av melk og fløte med samme bruksområde som fløte og tilsvarende syrnede produkter, uten tilsatt smak. Tilsvarende laktosefrie produkter omfattes også." },
    { value: "melk 15a", label: "15. a) (Ikke vegetabilske) Produkter som består av en blanding av melk og fløte med samme bruksområde som fløte og tilsvarende syrnede produkter, med tilsatt smak. Tilsvarende laktosefrie produkter omfattes også." },
    { value: "melk 15b", label: "15. b) (Helt eller delvis vegetabilske) Produkter som består av en blanding av melk og fløte med samme bruksområde som fløte og tilsvarende syrnede produkter, med tilsatt smak. Tilsvarende laktosefrie produkter omfattes også." },
  ],
  "ost og vegetabilske alternativer": [
    { value: "kategori 16", label: "16. (Ikke vegetabilske) Oster, unntatt ferskoster og tilsvarende produkter. Produktene kan være tilsatt smak." },
    { value: "kategori 17", label: "17. (Helt eller delvis vegetabilske) Oster, unntatt ferskoster og tilsvarende produkter. Produktene kan være tilsatt smak." },
    { value: "kategori 18", label: "18. Ferskoster og tilsvarende produkter. Produktene kan være tilsatt smak." },
  ],
  "matfett og oljer": [
    { value: "kategori 19", label: "19. Matfett og matfettblandinger. Produktene kan være tilsatt smak." },
    { value: "kategori 20", label: "20. Matoljer, flytende matfett og flytende matfettblandinger. Produktene kan være tilsatt smak." },
  ],
  "fiskerivarer og produkter av fiskerivarer": [
    { value: "kategori 22 a", label: "22. a) Produkter som verken omfattes som påleggsprodukter, skivet, røkt eller gravet fisk, eller kaviar og andre halvkonserver av fisk." },
    { value: "kategori 22 b", label: "22. b) Påleggsprodukter, skivet." },
    { value: "kategori 22 c", label: "22. c) Røkt eller gravet fisk." },
    { value: "kategori 22 d", label: "22. d) Kaviar og andre halvkonserver av fisk." },
  ],
  "kjøtt og produkter som inneholder kjøtt": [
    { value: "kategori 23", label: "23. Kjøtt som er uforedlet." },
    { value: "kategori 24", label: "24. Kjøtt og produkter som inneholder kjøtt. Minst 50 % av produktet skal være framstilt av kjøtt, korn (100 % fullkorn), grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter. Innholdet av kjøtt skal likevel være minst 20 % av produktet. Dette gjelder ikke for leverpostei som skal inneholde minst 35 % kjøtt. Produktet kan inneholde saus eller lake. Prosentandelen og vilkårene gjelder for den delen av produktet som er beregnet til å spise. Produktet kan være panert, hvis tilberedningen ifølge produsentens anvisning, ikke tilfører produktet fett." },
  ],
  "helt eller delvis vegetabilske produkter": [
    { value: "kategori 25", label: "25. Helt eller delvis vegetabilske produkter med samme anvendelsesområde som fiske- og kjøttprodukter i gruppene 22 og 24. Produktet skal bestå av minst 50 % korn (100 % fullkorn), grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller ikke-animalsk protein. Produktet skal ikke inneholde kjøtt eller fiskerivarer. Produktet kan inneholde saus eller lake. Prosentandelen og vilkårene gjelder for den delen av produktet som er beregnet til å spise. Produktet kan være panert, hvis tilberedningen ifølge produsentens anvisning, ikke tilfører produktet fett." },
  ],
  "ferdigretter": [
    { value: "kategori 26", label: "26. Ferdigretter med grønnsaker, en proteindel og en karbohydratdel. Produkter med: – minst 28 g grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller frukt og bær per 100 g produkt, – en proteindel, og – en karbohydratdel, og som ikke er omfattet av gruppene 27, 28, 29, eller 30. Hvis rettens karbohydratdel inneholder korn, skal denne delen oppfylle kravet til fullkorn som er gitt i den relevante næringsmiddelgruppen. Hvis glutenfri pasta inngår i retten, gjelder kravet til kostfiber i gruppe 10." },
    { value: "kategori 27", label: "27. Ferdigretter med grønnsaker og eventuelt en proteindel eller en karbohydratdel. Produkter med: – minst 50 g grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller frukt og bær per 100 g produkt, og eventuelt – en proteindel, eller – en karbohydratdel. Hvis retten inneholder en korndel, skal denne oppfylle kravet til fullkorn som er gitt i den relevante næringsmiddelgruppen. Hvis glutenfri pasta inngår, gjelder kravet til kostfiber i gruppe 10." },
    { value: "kategori 28", label: "28. Piroger, pizzaer, vårruller, andre paier enn dessertpaier og lignende produkter. Produktet skal inneholde minst 28 g grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter, eller frukt og bær per 100 g produkt. Inneholder produktet en korndel, skal denne inneholde minst 30 % fullkorn beregnet ut fra korndelens tørrstoffinnhold. Inneholder produktet minst 50 % grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter, eller frukt og bær per 100 g produkt, skal produktets eventuelle korndel inneholde minst 15 % fullkorn beregnet ut fra korndelens tørrstoffinnhold. Er korndelen glutenfri, skal den inneholde minst 10 % fullkorn, beregnet ut fra korndelens tørrstoffinnhold." },
    { value: "kategori 29", label: "29. Smørbrød, bagetter, wraps og lignende produkter. Produktet skal inneholde minst 25 g grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller frukt og bær per 100 g produkt. Inneholder produktet en korndel, skal denne inneholde minst 30 % fullkorn, beregnet ut fra korndelens tørrstoffinnhold. Inneholder produktet minst 50 % grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller frukt og bær per 100 g produkt, skal produktets eventuelle korndel inneholde minst 15 % fullkorn beregnet ut fra korndelens tørrstoffinnhold. Er korndelen glutenfri, skal den inneholde minst 10 % fullkorn, beregnet ut fra korndelens tørrstoffinnhold." },
    { value: "kategori 30", label: "30. Supper. Produktet skal inneholde minst 35 g grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller frukt og bær per 100 g suppe. Inneholder produktet en korndel, skal denne oppfylle kravet til fullkorn som er gitt i den relevante næringsmiddelgruppen. Hvis glutenfri pasta inngår, gjelder kravet til kostfiber i gruppe 10." },
  ],
  "dressinger og sauser": [
    { value: "kategori 31", label: "31. Dressinger av olje og eddik. Produktene kan være tilsatt smak." },
    { value: "kategori 32", label: "32. Sauser til middagsretter (ferdige produkter og produkter tilberedt ifølge produsentens anvisning)." },
  ],
};

// ── Sub-category options for categories that require a second level (level 3) ─
export const FRAGMENT_OPTIONS: Record<string, CategoryOption[]> = {
  "kategori 24": [
    { value: "kategori 24 a", label: "24. a) Rå produkter av hele eller utskårne kjøttstykker som er overflatemarinert eller krydret." },
    { value: "kategori 24 b", label: "24. b) Rå eller spiseklare produkter som inneholder kvernet kjøtt." },
    { value: "kategori 24 c", label: "24. c) Spiseklare eller røkte produkter som inneholder helt eller utskåret kjøtt, og som ikke omfattes som rå produkter av hele eller utskårne kjøttstykker som er overflatemarinert eller krydret." },
  ],
  "kategori 25": [
    { value: "kategori 25 a", label: "25. a) Skivede påleggsprodukter" },
    { value: "kategori 25 b", label: "25. b) For øvrige produkter" },
  ],
};

// ── Ration options for category 24 sub-categories (level 4) ─────────────────
export const RATION_OPTIONS: Record<string, CategoryOption[]> = {
  "kategori 24 a": [
    { value: "kategori 24 a 2", label: "- for stikksaltede produkter likevel" },
    { value: "kategori 24 a 1", label: "- for øvrige produkter" },
  ],
  "kategori 24 b": [
    { value: "kategori 24 b 2", label: "- for pølser likevel" },
    { value: "kategori 24 b 3", label: "- for påleggspølser likevel" },
    { value: "kategori 24 b 4", label: "- for karbonadedeig likevel" },
    { value: "kategori 24 b 1", label: "- for øvrige produkter" },
  ],
  "kategori 24 c": [
    { value: "kategori 24 c 2", label: "- for påleggsprodukter likevel" },
    { value: "kategori 24 c 1", label: "- for øvrige produkter." },
  ],
};
