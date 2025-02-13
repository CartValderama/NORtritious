// Import statements for React and other modules/components
import React, { useState } from "react";
//import Select from "react-select"; // import Select component
import "./css/Calculator.css";

//import { useApi } from './hooks/useApi';

import CustomSelect from "./CustomSelect";

// Importing all the different components used in the website
import HeaderCalculator from "./HeaderCalculator";

import Kategori0 from "./categories/cat1to10/Kategori0";
import Kategori1 from "./categories/cat1to10/Kategori1";
import Kategori2 from "./categories/cat1to10/Kategori2";
import Kategori3 from "./categories/cat1to10/Kategori3";
import Kategori4 from "./categories/cat1to10/Kategori4";
import Kategori5 from "./categories/cat1to10/Kategori5";
import Kategori6 from "./categories/cat1to10/Kategori6";
import Kategori7 from "./categories/cat1to10/Kategori7";
import Kategori8a from "./categories/cat1to10/Kategori8a";
import Kategori8b from "./categories/cat1to10/Kategori8b";
import Kategori9 from "./categories/cat1to10/Kategori9";
import Kategori10 from "./categories/cat1to10/Kategori10";


import Melk11a from "./categories/milk/Melk11a";
import Melk11b from "./categories/milk/Melk11b";
import Melk12a from "./categories/milk/Melk12a";
import Melk12b from "./categories/milk/Melk12b";
import Melk13a from "./categories/milk/Melk13a";
import Melk13b from "./categories/milk/Melk13b";
import Melk14a from "./categories/milk/Melk14a";
import Melk14b from "./categories/milk/Melk14b";
import Melk15a from "./categories/milk/Melk15a";
import Melk15b from "./categories/milk/Melk15b";

import Kategori16 from "./categories/cat16to23/Kategori16";
import Kategori17 from "./categories/cat16to23/Kategori17";
import Kategori18 from "./categories/cat16to23/Kategori18";
import Kategori19 from "./categories/cat16to23/Kategori19";
import Kategori20 from "./categories/cat16to23/Kategori20";
import Kategori21 from "./categories/cat16to23/Kategori21";
import Kategori22a from "./categories/cat16to23/Kategori22a";
import Kategori22b from "./categories/cat16to23/Kategori22b";
import Kategori22c from "./categories/cat16to23/Kategori22c";
import Kategori22d from "./categories/cat16to23/Kategori22d";
import Kategori23 from "./categories/cat16to23/Kategori23";

import Kategori24a1 from "./categories/category24/Kategori24a1";
import Kategori24a2 from "./categories/category24/Kategori24a2";
import Kategori24b1 from "./categories/category24/Kategori24b1";
import Kategori24b2 from "./categories/category24/Kategori24b2";
import Kategori24b3 from "./categories/category24/Kategori24b3";
import Kategori24b4 from "./categories/category24/Kategori24b4";
import Kategori24c1 from "./categories/category24/Kategori24c1";
import Kategori24c2 from "./categories/category24/Kategori24c2";

import Kategori25a from "./categories/cat25to32/Kategori25a";
import Kategori25b from "./categories/cat25to32/Kategori25b";
import Kategori26 from "./categories/cat25to32/Kategori26";
import Kategori27 from "./categories/cat25to32/Kategori27";
import Kategori28 from "./categories/cat25to32/Kategori28";
import Kategori29 from "./categories/cat25to32/Kategori29";
import Kategori30 from "./categories/cat25to32/Kategori30";
import Kategori31 from "./categories/cat25to32/Kategori31";
import Kategori32 from "./categories/cat25to32/Kategori32";

// This code defines the options for four selectors, one for food groups and one for food categories within those groups and one for the sub foodcategories within those categories and the same logic for the last selector.

const Calculator = () => {
  // The first selector is for food groups (matvaregruppe).
  const selectOption = [
    {
      value: "grønnsaker, frukt, bær og nøtter",
      label: "Grønnsaker, frukt, bær og nøtter",
    },
    {
      value: "mel, gryn og ris",
      label: "Mel, gryn og ris",
    },
    { value: "grøt, brød og pasta", label: "Grøt, brød og pasta" },
    {
      value: "melk kategori",
      label: "Melk, syrnede melkeprodukter og vegetabilske alternativer",
    },
    {
      value: "ost og vegetabilske alternativer",
      label: "Ost og vegetabilske alternativer",
    },
    {
      value: "matfett og oljer",
      label: "Matfett og oljer",
    },
    {
      value: "fiskerivarer og produkter av fiskerivarer",
      label: "Fiskerivarer og produkter av fiskerivarer",
    },
    {
      value: "kjøtt og produkter som inneholder kjøtt",
      label: "Kjøtt og produkter som inneholder kjøtt",
    },
    {
      value: "helt eller delvis vegetabilske produkter",
      label: "Helt eller delvis vegetabilske produkter",
    },
    {
      value: "ferdigretter",
      label: "Ferdigretter",
    },
    {
      value: "dressinger og sauser",
      label: "Dressinger og sauser",
    },
  ];

  // The second selector is for food categories (matkategori).

  const selectGrønnsaker = [
    {
      value: "kategori 1",
      label:
        "1. Grønnsaker, rotfrukter, belgvekster (unntatt peanøtter) og poteter. Produktene kan være foredlet. Uforedlede krydderurter omfattes også.",
    },
    {
      value: "kategori 2",
      label:
        "2. Frukt og bær som er uforedlet. Produktene kan likevel være varmebehandlet.",
    },
    {
      value: "kategori 3",
      label:
        "3. Nøtter og peanøtter som er uforedlet. Produktene kan likevel være varmebehandlet.",
    },
  ];

  const selectMel = [
    {
      value: "kategori 4",
      label:
        "4. Mel, gryn og flak av korn som inneholder 100 % fullkorn av korndelens tørrstoffinnhold. Kli og kim er unntatt fra kravet til fullkorn. Fullkornet kan helt eller delvis erstattes med grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) og rotfrukter for samme anvendelsesområde.",
    },
    {
      value: "kategori 5",
      label:
        "5. Ris som inneholder 100 % fullkorn av produktets tørrstoffinnhold.",
    },
    {
      value: "kategori 6",
      label:
        "6. Kornblandinger og frokostblandinger som inneholder minst 55 % fullkorn av produktets tørrstoffinnhold. Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse ved beregningen av fullkornsmengden. Glutenfrie kornblandinger og frokostkorn skal inneholde minst 20 % fullkorn av produktets tørrstoffinnhold.",
    },
  ];

  const selectGrøt = [
    {
      value: "kategori 7",
      label:
        "7. Grøt og grøtpulver (tilberedt ifølge produsentens anvisning) som inneholder minst 55 % fullkorn av produktets tørrstoffinnhold.Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse, ved beregningen av fullkornsmengden. Vilkårene gjelder for det spiseklare produktet.",
    },
    {
      value: "kategori 8a",
      label:
        "8. a) Brød og brødmikser hvor bare væske og eventuelt gjær skal tilsettes, og som inneholder minst 30 % fullkorn av produktets tørrstoffinnhold. Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse, ved beregningen av fullkornsmengden. Produkter i gruppe 8 b) omfattes ikke. Glutenfrie brød og brødmikser skal inneholde minst 10 % fullkorn av produktets tørrstoffinnhold. Vilkårene gjelder for det spiseklare produktet.",
    },
    {
      value: "kategori 8b",
      label:
        "8. b) Rugbrød og andre rugbaserte produkter samt brødmikser hvor bare væske og eventuelt gjær skal tilsettes, som inneholder minst 35 % fullkorn av produktets tørrstoffinnhold. I produktene skal minst 30 % av kornsortene være rug.Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse, ved beregningen av fullkornsmengden. Vilkårene gjelder for det spiseklare produktet.",
    },
    {
      value: "kategori 9",
      label:
        "9. Knekkebrød, skonroker og melmikser til slike produkter, hvor bare væske og eventuelt gjær skal tilsettes. Produktet skal inneholde minst 50 % fullkorn av produktets tørrstoffinnhold. Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse, ved beregningen av fullkornsmengden. Tilsvarende glutenfrie produkter skal inneholde minst 15 % fullkorn av produktets tørrstoffinnhold. Vilkårene gjelder for det spiseklare produktet.",
    },
    {
      value: "kategori 10",
      label:
        "10. Pasta (ikke fylt) Produktet skal inneholde minst 50 % fullkorn av produktets tørrstoffinnhold. Inneholder produktet grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter, medregnes ikke den andelen av produktet som utgjøres av disse, ved beregningen av fullkornsmengden. Glutenfri pasta (ikke fylt) har ikke krav til fullkorn. Vilkårene gjelder for produktets tørrstoffinnhold.",
    },
  ];
  const selectSyrnede = [
    {
      value: "melk 11a",
      label:
        "11. a) Melk og syrnede melkeprodukter som er beregnet til å drikke, uten tilsatt smak. Tilsvarende laktosefrie produkter og laktosefrie melkedrikker omfattes også.",
    },
    {
      value: "melk 11b",
      label:
        "11. b) Vegetabilske produkter med samme bruksområde som produkter i gruppe 11 a), uten tilsatt smak.",
    },
    {
      value: "melk 12a",
      label:
        "12. a) Syrnede melkeprodukter som ikke er beregnet til å drikke, uten tilsatt smak. Tilsvarende laktosefrie produkter omfattes også.",
    },
    {
      value: "melk 12b",
      label:
        "12. b) Vegetabilske produkter med samme bruksområde som produkter i gruppe 12 a), uten tilsatt smak.",
    },
    {
      value: "melk 13a",
      label:
        "13. a) (Ikke vegetabilske) Syrnede melkeprodukter som ikke er beregnet til å drikke, med tilsatt smak. Tilsvarende laktosefrie produkter omfattes også.",
    },
    {
      value: "melk 13b",
      label:
        "13. b) (Vegetabilske) Syrnede melkeprodukter som ikke er beregnet til å drikke, med tilsatt smak. Tilsvarende laktosefrie produkter omfattes også.",
    },
    {
      value: "melk 14a",
      label:
        "14. a) (Ikke vegetabilske) Produkter som består av en blanding av melk og fløte med samme bruksområde som fløte og tilsvarende syrnede produkter, uten tilsatt smak. Tilsvarende laktosefrie produkter omfattes også.",
    },
    {
      value: "melk 14b",
      label:
        "14. b) (Helt eller delvis vegetabilske) Produkter som består av en blanding av melk og fløte med samme bruksområde som fløte og tilsvarende syrnede produkter, uten tilsatt smak. Tilsvarende laktosefrie produkter omfattes også.",
    },
    {
      value: "melk 15a",
      label:
        "15. a) (Ikke vegetabilske) Produkter som består av en blanding av melk og fløte med samme bruksområde som fløte og tilsvarende syrnede produkter, med tilsatt smak. Tilsvarende laktosefrie produkter omfattes også.",
    },
    {
      value: "melk 15b",
      label:
        "15. b) (Helt eller delvis vegetabilske) Produkter som består av en blanding av melk og fløte med samme bruksområde som fløte og tilsvarende syrnede produkter, med tilsatt smak. Tilsvarende laktosefrie produkter omfattes også.",
    },
  ];

  const selectOst = [
    {
      value: "kategori 16",
      label:
        " 16. (Ikke vegetabilske) Oster, unntatt ferskoster og tilsvarende produkter. Produktene kan være tilsatt smak.",
    },
    {
      value: "kategori 17",
      label:
        "17. (Helt eller delvis vegetabilske) Oster, unntatt ferskoster og tilsvarende produkter. Produktene kan være tilsatt smak.",
    },
    {
      value: "kategori 18",
      label:
        "18. Ferskoster og tilsvarende produkter. Produktene kan være tilsatt smak.",
    },
  ];

  const selectMatfett = [
    {
      value: "kategori 19",
      label:
        "19. Matfett og matfettblandinger. Produktene kan være tilsatt smak.",
    },
    {
      value: "kategori 20",
      label:
        "20. Matoljer, flytende matfett og flytende matfettblandinger. Produktene kan være tilsatt smak.",
    },
  ];

  const selectFiskerivarer = [
    {
      value: "kategori 21",
      label:
        "21. Fiskerivarer og levende muslinger. Produktene kan være bearbeidede.",
    },
    {
      value: "kategori 22",
      label:
        "22. Produkter framstilt av minst 50 % foredlede fiskerivarer. Produktet kan inneholde saus eller lake. Prosentandelen og vilkårene gjelder for den delen av produktet som er beregnet til å spise. Produktet kan være panert, hvis tilberedningen ifølge produsentens anvisning, ikke tilfører produktet fett.",
    },
  ];

  const selectKjøtt = [
    {
      value: "kategori 23",
      label: "23. Kjøtt som er uforedlet.",
    },
    {
      value: "kategori 24",
      label:
        "24. Kjøtt og produkter som inneholder kjøtt. Minst 50 % av produktet skal være framstilt av kjøtt, korn (100 % fullkorn), grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter) eller rotfrukter. Innholdet av kjøtt skal likevel være minst 20 % av produktet. Dette gjelder ikke for leverpostei som skal inneholde minst 35 % kjøtt. Produktet kan inneholde saus eller lake. Prosentandelen og vilkårene gjelder for den delen av produktet som er beregnet til å spise. Produktet kan være panert, hvis tilberedningen ifølge produsentens anvisning, ikke tilfører produktet fett.",
    },
  ];

  const selectVegetabliske = [
    {
      value: "kategori 25",
      label:
        "25. Helt eller delvis vegetabilske produkter med samme anvendelsesområde som fiske- og kjøttprodukter i gruppene 22 og 24. Produktet skal bestå av minst 50 % korn (100 % fullkorn), grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller ikke-animalsk protein. Produktet skal ikke inneholde kjøtt eller fiskerivarer. Produktet kan inneholde saus eller lake. Prosentandelen og vilkårene gjelder for den delen av produktet som er beregnet til å spise. Produktet kan være panert, hvis tilberedningen ifølge produsentens anvisning, ikke tilfører produktet fett.",
    },
  ];

  const selectFerdig = [
    {
      value: "kategori 26",
      label:
        "26. Ferdigretter med grønnsaker, en proteindel og en karbohydratdel. Produkter med: – minst 28 g grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller frukt og bær per 100 g produkt, – en proteindel, og – en karbohydratdel, og som ikke er omfattet av gruppene 27, 28, 29, eller 30. Hvis rettens karbohydratdel inneholder korn, skal denne delen oppfylle kravet til fullkorn som er gitt i den relevante næringsmiddelgruppen. Hvis glutenfri pasta inngår i retten, gjelder kravet til kostfiber i gruppe 10.",
    },
    {
      value: "kategori 27",
      label:
        "27. Ferdigretter med grønnsaker og eventuelt en proteindel eller en karbohydratdel. Produkter med: – minst 50 g grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller frukt og bær per 100 g produkt, og eventuelt – en proteindel, eller – en karbohydratdel. Hvis retten inneholder en korndel, skal denne oppfylle kravet til fullkorn som er gitt i den relevante næringsmiddelgruppen. Hvis glutenfri pasta inngår, gjelder kravet til kostfiber i gruppe 10.",
    },
    {
      value: "kategori 28",
      label:
        "28. Piroger, pizzaer, vårruller, andre paier enn dessertpaier og lignende produkter. Produktet skal inneholde minst 28 g grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter, eller frukt og bær per 100 g produkt. Inneholder produktet en korndel, skal denne inneholde minst 30 % fullkorn beregnet ut fra korndelens tørrstoffinnhold. Inneholder produktet minst 50 % grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter, eller frukt og bær per 100 g produkt, skal produktets eventuelle korndel inneholde minst 15 % fullkorn beregnet ut fra korndelens tørrstoffinnhold. Er korndelen glutenfri, skal den inneholde minst 10 % fullkorn, beregnet ut fra korndelens tørrstoffinnhold.",
    },
    {
      value: "kategori 29",
      label:
        "29. Smørbrød, bagetter, wraps og lignende produkter. Produktet skal inneholde minst 25 g grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller frukt og bær per 100 g produkt. Inneholder produktet en korndel, skal denne inneholde minst 30 % fullkorn, beregnet ut fra korndelens tørrstoffinnhold. Inneholder produktet minst 50 % grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller frukt og bær per 100 g produkt, skal produktets eventuelle korndel inneholde minst 15 % fullkorn beregnet ut fra korndelens tørrstoffinnhold. Er korndelen glutenfri, skal den inneholde minst 10 % fullkorn, beregnet ut fra korndelens tørrstoffinnhold.",
    },
    {
      value: "kategori 30",
      label:
        "30. Supper. Produktet skal inneholde minst 35 g grønnsaker (unntatt poteter), belgvekster (unntatt peanøtter), rotfrukter eller frukt og bær per 100 g suppe. Inneholder produktet en korndel, skal denne oppfylle kravet til fullkorn som er gitt i den relevante næringsmiddelgruppen. Hvis glutenfri pasta inngår, gjelder kravet til kostfiber i gruppe 10.",
    },
  ];

  const selectDressinger = [
    {
      value: "kategori 31",
      label:
        "31. Dressinger av olje og eddik. Produktene kan være tilsatt smak.",
    },
    {
      value: "kategori 32",
      label:
        "32. Sauser til middagsretter (ferdige produkter og produkter tilberedt ifølge produsentens anvisning).",
    },
  ];

  const SelectSub22 = [
    {
      value: "kategori 22 a",
      label:
        "22. a) Produkter som verken omfattes som påleggsprodukter, skivet, røkt eller gravet fisk, eller kaviar og andre halvkonserver av fisk.",
    },
    {
      value: "kategori 22 b",
      label: "22. b) Påleggsprodukter, skivet.",
    },
    {
      value: "kategori 22 c",
      label: "22. c) Røkt eller gravet fisk.",
    },
    {
      value: "kategori 22 d",
      label: "22. d) Kaviar og andre halvkonserver av fisk.",
    },
  ];

  const SelectSub24 = [
    {
      value: "kategori 24 a",
      label:
        "24. a) Rå produkter av hele eller utskårne kjøttstykker som er overflatemarinert eller krydret.",
    },
    {
      value: "kategori 24 b",
      label:
        "24. b) Rå eller spiseklare produkter som inneholder kvernet kjøtt.",
    },

    {
      value: "kategori 24 c",
      label:
        "24. c) Spiseklare eller røkte produkter som inneholder helt eller utskåret kjøtt, og som ikke omfattes som rå produkter av hele eller utskårne kjøttstykker som er overflatemarinert eller krydret.",
    },
  ];

  const SelectSub25 = [
    {
      value: "kategori 25 a",
      label: "25. a) Skivede påleggsprodukter",
    },
    {
      value: "kategori 25 b",
      label: "25. b) For øvrige produkter ",
    },
  ];

  const SelectFragment24a = [
    {
      value: "kategori 24 a 2",
      label: "- for stikksaltede produkter likevel",
    },
    {
      value: "kategori 24 a 1",
      label: "- for øvrige produkter",
    },
  ];

  const SelectFragment24b = [
    {
      value: "kategori 24 b 2",
      label: "- for pølser likevel",
    },
    {
      value: "kategori 24 b 3",
      label: "- for påleggspølser likevel",
    },
    {
      value: "kategori 24 b 4",
      label: "- for karbonadedeig likevel",
    },
    {
      value: "kategori 24 b 1",
      label: "-for øvrige produkter",
    },
  ];

  const SelectFragment24c = [
    {
      value: "kategori 24 c 2",
      label: "- for påleggsprodukter likevel",
    },
    {
      value: "kategori 24 c 1",
      label: "- for øvrige produkter.",
    },
  ];

  // Define state variables for the dropdown selectors
  const [selectsGroup, setSelectGroups] = useState(""); // for the "Group" selector

  const [selectsProduct, setSelectProduct] = useState(""); // for the "Product" selector

  const [selectsFragment, setSelectFragment] = useState(""); // for the "Fragment" selector
  const [selectsRation, setSelectRation] = useState(""); // for the "Ration" selector

  // Define event handlers for when a selection is made in each dropdown
  const handlerGroup = (event) => {
    setSelectGroups(event.value); // update state variable for "Group" selector
  };

  const handlerProduct = (event) => {
    setSelectProduct(event.value); // update state variable for "Product" selector
  };

  const handlerFragment = (event) => {
    setSelectFragment(event.value); // update state variable for "Fragment" selector
  };

  const handlerRation = (event) => {
    setSelectRation(event.value); // update state variable for "Ration" selector
  };

  // This component returns a form that allows users to input nutritional data for a food item.
  // It includes various fields for selecting the food name, food group, and food category.
  // The options for the fields change based on the selected food group.
  return (
    // Use Bootstrap classes to style the form.
    <div className="vstack gap-3 container">
          
      <div className="row">
        <div className="col-md-6">
          <h3>Legg inn næringsinnhold</h3>
          {/* Add a label for the food name input */}
          <label for="matnavn" class="form-label">
            <strong>Matvarenavn</strong>
          </label>

          {/* use Bootstrap classes to style the food name input */}
          <div class="input-group mb-3">
            <input
              type="text"
              class="form-control"
              aria-describedby="matnavn"
            />
          </div>

          {/* Add a label for the food group select input */}
          <label for="matgruppe" class="form-label">
            <strong>Matvaregruppe</strong>
          </label>

          {/* Use the react-select component to style the food group select input and provide options */}
          <CustomSelect
            placeholder={<div>Velg matvaregruppe</div>}
            className="form-select-md mb-3"
            onChange={handlerGroup}
            options={selectOption}
          />

          {/* Use conditional rendering to show the food category select input based on the selected food group */}
          {selectsGroup === "grønnsaker, frukt, bær og nøtter" && (
            <div>
              <label for="mat" class="form-label">
                <strong>Matkategori</strong>
              </label>

              {/* Use the react-select component to style the food category select input and provide options for the selected food group */}
              <CustomSelect
                placeholder={<div>Velg mat</div>}
                className="form-select-md mb-3"
                onChange={handlerProduct}
                options={selectGrønnsaker}
              />
            </div>
          )}

          {/* Repeat the above conditional rendering for each food group, showing the relevant food category select input based on the selected food group */}
          {selectsGroup === "mel, gryn og ris" && (
            <div>
              <label for="mat" class="form-label">
                <strong>Matkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg mat</div>}
                className="form-select-md mb-3"
                onChange={handlerProduct}
                options={selectMel}
              />
            </div>
          )}
          {selectsGroup === "grøt, brød og pasta" && (
            <div>
              <label for="mat" class="form-label">
                <strong>Matkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg mat</div>}
                className="form-select-md mb-3"
                onChange={handlerProduct}
                options={selectGrøt}
              />
            </div>
          )}
          {selectsGroup === "melk kategori" && (
            <div>
              <label for="mat" class="form-label">
                <strong>Matkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg mat</div>}
                className="form-select-md mb-3"
                onChange={handlerProduct}
                options={selectSyrnede}
              />
            </div>
          )}
          {selectsGroup === "ost og vegetabilske alternativer" && (
            <div>
              <label for="mat" class="form-label">
                <strong>Matkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg mat</div>}
                className="form-select-md mb-3"
                onChange={handlerProduct}
                options={selectOst}
              />
            </div>
          )}
          {selectsGroup === "matfett og oljer" && (
            <div>
              <label for="mat" class="form-label">
                <strong>Matkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg mat</div>}
                className="form-select-md mb-3"
                onChange={handlerProduct}
                options={selectMatfett}
              />
            </div>
          )}
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" && (
            <div>
              <label for="mat" class="form-label">
                <strong>Matkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg mat</div>}
                className="form-select-md mb-3"
                onChange={handlerProduct}
                options={selectFiskerivarer}
              />
            </div>
          )}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" && (
            <div>
              <label for="mat" class="form-label">
                <strong>Matkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg mat</div>}
                className="form-select-md mb-3"
                onChange={handlerProduct}
                options={selectKjøtt}
              />
            </div>
          )}
          {selectsGroup === "helt eller delvis vegetabilske produkter" && (
            <div>
              <label for="mat" class="form-label">
                <strong>Matkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg mat</div>}
                className="form-select-md mb-3"
                onChange={handlerProduct}
                options={selectVegetabliske}
              />
            </div>
          )}
          {selectsGroup === "ferdigretter" && (
            <div>
              <label for="mat" class="form-label">
                <strong>Matkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg mat</div>}
                className="form-select-md mb-3"
                onChange={handlerProduct}
                options={selectFerdig}
              />
            </div>
          )}
          {selectsGroup === "dressinger og sauser" && (
            <div>
              <label for="mat" class="form-label">
                <strong>Matkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg mat</div>}
                className="form-select-md mb-3"
                onChange={handlerProduct}
                options={selectDressinger}
              />
            </div>
          )}
          {selectsProduct === "kategori 22" && (
            <div>
              <label for="matdivision" class="form-label">
                <strong>Undermatkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg undermatkategori</div>}
                className="form-select-md mb-3"
                onChange={handlerFragment}
                options={SelectSub22}
              />
            </div>
          )}
          {selectsProduct === "kategori 24" && (
            <div>
              <label for="matdivision" class="form-label">
                <strong>Undermatkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg undermatkategori</div>}
                className="form-select-md mb-3"
                onChange={handlerFragment}
                options={SelectSub24}
              />
            </div>
          )}
          {selectsProduct === "kategori 25" && (
            <div>
              <label for="matdivision" class="form-label">
                <strong>Undermatkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg undermatkategori</div>}
                className="form-select-md mb-3"
                onChange={handlerFragment}
                options={SelectSub25}
              />
            </div>
          )}
          {selectsFragment === "kategori 24 a" && (
            <div>
              <label for="matration" class="form-label">
                <strong>Undermatkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg undermatkategori</div>}
                className="form-select-md mb-3"
                onChange={handlerRation}
                options={SelectFragment24a}
              />
            </div>
          )}
          {selectsFragment === "kategori 24 b" && (
            <div>
              <label for="matration" class="form-label">
                <strong>Undermatkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg undermatkategori</div>}
                className="form-select-md mb-3"
                onChange={handlerRation}
                options={SelectFragment24b}
              />
            </div>
          )}
          {selectsFragment === "kategori 24 c" && (
            <div>
              <label for="matration" class="form-label">
                <strong>Undermatkategori</strong>
              </label>
              <CustomSelect
                placeholder={<div>Velg undermatkategori</div>}
                className="form-select-md mb-3"
                onChange={handlerRation}
                options={SelectFragment24c}
              />
            </div>
          )}
        </div>

        <div className="col-md-6" style={{ marginTop: '10px' }}>
          {/* Heading for the column */}
          <h3>Mulige ernærings- og helsepåstander</h3>

          {/* Description of what the user should do */}
          <p>
            Trykk på "søk"-knappen for å se resultatet. Først må du sette
            ernæringsverdiene inne i ernæringskolonnen. Resultatet vises på
            høyre side. Hvis en "feil" oppstår, hold musepekeren over feilikonet
            i venstre kolonne for å se detaljene om den spesifikke feilen.
          </p>
        </div>

        {/* Spacer */}
        <div style={{ padding: "5px" }}></div>

        {/* Conditional rendering based on user selection */}
        <div>
          {/* Display default component if no group is selected */}
          {selectsGroup === "" && <Kategori0 />}
          {/* Display default component if group is selected but no product is selected */}
          {selectsGroup === "grønnsaker, frukt, bær og nøtter" &&
            selectsProduct === "" && <Kategori0 />}
          {/* Display component for Kategori1 if group is selected as grønnsaker, frukt, bær og nøtter and Kategori1 is selected as product */}
          {selectsGroup === "grønnsaker, frukt, bær og nøtter" &&
            selectsProduct === "kategori 1" && <Kategori1 />}
          {/* Display component for Kategori2 if group is selected as grønnsaker, frukt, bær og nøtter and Kategori2 is selected as product */}
          {selectsGroup === "grønnsaker, frukt, bær og nøtter" &&
            selectsProduct === "kategori 2" && <Kategori2 />}

          {/* Display component for Kategori3 if group is selected as grønnsaker, frukt, bær og nøtter and Kategori3 is selected as product */}
          {selectsGroup === "grønnsaker, frukt, bær og nøtter" &&
            selectsProduct === "kategori 3" && <Kategori3 />}

          {/* Display default component if group is selected as mel, gryn og ris but no product is selected */}
          {selectsGroup === "mel, gryn og ris" && selectsProduct === "" && (
            <Kategori0 />
          )}
          {/* Display component for Kategori4 if group is selected as mel, gryn og ris and Kategori4 is selected as product */}
          {selectsGroup === "mel, gryn og ris" &&
            selectsProduct === "kategori 4" && <Kategori4 />}
          {/* Display component for Kategori5 if group is selected as mel, gryn og ris and Kategori5 is selected as product */}
          {selectsGroup === "mel, gryn og ris" &&
            selectsProduct === "kategori 5" && <Kategori5 />}
          {/* Display component for Kategori6 if group is selected as mel, gryn og ris and Kategori6 is selected as product */}
          {selectsGroup === "mel, gryn og ris" &&
            selectsProduct === "kategori 6" && <Kategori6 />}

          {/* Display default component if group is selected as grøt, brød og pasta but no product is selected */}
          {selectsGroup === "grøt, brød og pasta" && selectsProduct === "" && (
            <Kategori0 />
          )}
          {/* Display component for kategori 7 if group is selected as grøt, brød og pasta and product is kategori 7 */}
          {selectsGroup === "grøt, brød og pasta" &&
            selectsProduct === "kategori 7" && <Kategori7 />}
          {/* Display component for kategori 8a if group is selected as grøt, brød og pasta and product is kategori 8a */}
          {selectsGroup === "grøt, brød og pasta" &&
            selectsProduct === "kategori 8a" && <Kategori8a />}
          {/* Display component for kategori 8b if group is selected as grøt, brød og pasta and product is kategori 8b */}
          {selectsGroup === "grøt, brød og pasta" &&
            selectsProduct === "kategori 8b" && <Kategori8b />}
          {/* Display component for kategori 9 if group is selected as grøt, brød og pasta and product is kategori 9 */}
          {selectsGroup === "grøt, brød og pasta" &&
            selectsProduct === "kategori 9" && <Kategori9 />}
          {/* Display component for kategori 10 if group is selected as grøt, brød og pasta and product is kategori 10 */}
          {selectsGroup === "grøt, brød og pasta" &&
            selectsProduct === "kategori 10" && <Kategori10 />}

          {/* Display default component if group is selected as melk kategori but no product is selected */}
          {selectsGroup === "melk kategori" && selectsProduct === "" && (
            <Kategori0 />
          )}
          {/* Display component for melk 11a if group is selected as melk kategori and product is melk 11a */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 11a" && <Melk11a />}
          {/* Display component for melk 11b if group is selected as melk kategori and product is melk 11b */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 11b" && <Melk11b />}
          {/* Display component for melk 12a if group is selected as melk kategori and product is melk 12a */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 12a" && <Melk12a />}
          {/* Display component for melk 12b if group is selected as melk kategori and product is melk 12b */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 12b" && <Melk12b />}
          {/* Display component for melk 13a if group is selected as melk kategori and product is melk 13a */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 13a" && <Melk13a />}
          {/* Display component for melk 13b if group is selected as melk kategori and product is melk 13b */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 13b" && <Melk13b />}
          {/* Display component for melk 14a if group is selected as melk kategori and product is melk 14a */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 14a" && <Melk14a />}
          {/* Display component for melk 14b if group is selected as melk kategori and product is melk 14b */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 14b" && <Melk14b />}
          {/* Display component for melk 15a if group is selected as melk kategori and product is melk 15a */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 15a" && <Melk15a />}
          {/* Display component for melk 15b if group is selected as melk kategori and product is melk 15b */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 15b" && <Melk15b />}

          {/* Repeat the above conditional rendering code that renders a different component based on the user's selection of product category, group, and subcategory.  */}
          {selectsGroup === "ost og vegetabilske alternativer" &&
            selectsProduct === "" && <Kategori0 />}
          {selectsGroup === "ost og vegetabilske alternativer" &&
            selectsProduct === "kategori 16" && <Kategori16 />}
          {selectsGroup === "ost og vegetabilske alternativer" &&
            selectsProduct === "kategori 17" && <Kategori17 />}
          {selectsGroup === "ost og vegetabilske alternativer" &&
            selectsProduct === "kategori 18" && <Kategori18 />}

          {selectsGroup === "matfett og oljer" && selectsProduct === "" && (
            <Kategori0 />
          )}
          {selectsGroup === "matfett og oljer" &&
            selectsProduct === "kategori 19" && <Kategori19 />}
          {selectsGroup === "matfett og oljer" &&
            selectsProduct === "kategori 20" && <Kategori20 />}

          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "" && <Kategori0 />}
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 21" && <Kategori21 />}
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 22" &&
            selectsFragment === "" && <Kategori0 />}
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 22" &&
            selectsFragment === "kategori 22 a" && <Kategori22a />}
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 22" &&
            selectsFragment === "kategori 22 b" && <Kategori22b />}
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 22" &&
            selectsFragment === "kategori 22 c" && <Kategori22c />}
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 22" &&
            selectsFragment === "kategori 22 d" && <Kategori22d />}

          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "" && <Kategori0 />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 23" && <Kategori23 />}

          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "" && <Kategori0 />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 a" &&
            selectsRation === "" && <Kategori0 />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 a" &&
            selectsRation === "kategori 24 a 1" && <Kategori24a1 />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 a" &&
            selectsRation === "kategori 24 a 2" && <Kategori24a2 />}

          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 b" &&
            selectsRation === "" && <Kategori0 />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 b" &&
            selectsRation === "kategori 24 b 1" && <Kategori24b1 />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 b" &&
            selectsRation === "kategori 24 b 2" && <Kategori24b2 />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 b" &&
            selectsRation === "kategori 24 b 3" && <Kategori24b3 />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 b" &&
            selectsRation === "kategori 24 b 4" && <Kategori24b4 />}

          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 c" &&
            selectsRation === "" && <Kategori0 />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 c" &&
            selectsRation === "kategori 24 c 1" && <Kategori24c1 />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 c" &&
            selectsRation === "kategori 24 c 2" && <Kategori24c2 />}

          {selectsGroup === "helt eller delvis vegetabilske produkter" &&
            selectsProduct === "" && <Kategori0 />}
          {selectsGroup === "helt eller delvis vegetabilske produkter" &&
            selectsProduct === "kategori 25" &&
            selectsFragment === "" && <Kategori0 />}
          {selectsGroup === "helt eller delvis vegetabilske produkter" &&
            selectsProduct === "kategori 25" &&
            selectsFragment === "kategori 25 a" && <Kategori25a />}
          {selectsGroup === "helt eller delvis vegetabilske produkter" &&
            selectsProduct === "kategori 25" &&
            selectsFragment === "kategori 25 b" && <Kategori25b />}

          {selectsGroup === "ferdigretter" && selectsProduct === "" && (
            <Kategori0 />
          )}
          {selectsGroup === "ferdigretter" &&
            selectsProduct === "kategori 26" && <Kategori26 />}
          {selectsGroup === "ferdigretter" &&
            selectsProduct === "kategori 27" && <Kategori27 />}
          {selectsGroup === "ferdigretter" &&
            selectsProduct === "kategori 28" && <Kategori28 />}
          {selectsGroup === "ferdigretter" &&
            selectsProduct === "kategori 29" && <Kategori29 />}
          {selectsGroup === "ferdigretter" &&
            selectsProduct === "kategori 30" && <Kategori30 />}

          {selectsGroup === "dressinger og sauser" && selectsProduct === "" && (
            <Kategori0 />
          )}
          {selectsGroup === "dressinger og sauser" &&
            selectsProduct === "kategori 31" && <Kategori31 />}
          {selectsGroup === "dressinger og sauser" &&
            selectsProduct === "kategori 32" && <Kategori32 />}
        </div>
      </div>
    </div>
  );
};

export default Calculator;