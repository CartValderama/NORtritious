// Import statements for React and other modules/components
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Button, FormText, Container, Row, Col, Card, Popover, OverlayTrigger } from "react-bootstrap";
import axios from "axios";
//import Select from "react-select"; // import Select component
import "./css/Calculator.css";
import API_URL from "./apiConfig";
import * as ProductService from './products/ProductService';
import ProductButtons from "./ProductButtons";
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

import healthClaims from './healthClaims/health_claims.json';
import { ResultEfsaHealthClaims } from "./ResultEfsaClaims";

import selectOthers from "./healthClaims/selectOthers";
import selectVitamins from "./healthClaims/selectVitamins";
import selectMinerals from "./healthClaims/selectMinerals";
import selectMeetsReqs from "./healthClaims/selectMeetsReqs";

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

    const [selectedImage, setSelectedImage] = useState(null);

  /*
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    The following section is added for Health Claims, for now only two inputs (vitamins and minerals)
    Add types under selectVitamins and selectMinerals to add more inputs
    useEffects keep track of the selected item and updates the health claim description with corresponding claim.
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  */ 

  const [selectedMinerals, setSelectedMinerals] = useState([]); // for the "Minerals" selector
  const [selectedVitamins, setSelectedVitamins] = useState([]); // for the "Vitamins" selector
  const [selectedOthers, setSelectedOthers] = useState([]); // for the "Others" selector
  const [selectedMeetsReqs, setSelectedMeetsReqs] = useState([]); // for the "Meets requirements" checkbox
  //const [claimDescription, setClaimDescription] = useState(''); // for the health claim description
  const [vitaminClaims, setVitaminClaims] = useState([]); // for the health claim description
  const [mineralClaims, setMineralClaims] = useState([]); // for the health claim description
  const [otherClaims, setOtherClaims] = useState([]); // for the health claim description
  const [meetsReqsClaims, setMeetsReqsClaims] = useState([]); // for the health claim description
  
  const [hasLowSatFat, setHasLowSatFat] = useState(false); // for the health claim description
  const [hasLowSalt, setHasLowSalt] = useState(false); // for the health claim description
  const [hasSugarsFree, setHasSugarsFree] = useState(false); // for the health claim description
  const [hasLowSugar, setHasLowSugar] = useState(false); // for the health claim description
  const [hasHighFibre, setHasHighFibre] = useState(false); // for the health claim description
  const [showVitaminClaim, setShowVitaminClaim] = useState(false); // for the health claim description
  const [showMineralClaim, setShowMineralClaim] = useState(false); // for the health claim description
  const [showOtherClaim, setShowOtherClaim] = useState(false); // for the health claim description

  const [vitaminInputValues, setVitaminInputValues] = useState({}); // for the health claim description
  const [mineralInputValues, setMineralInputValues] = useState({}); // for the health claim description
  const [otherInputValues, setOtherInputValues] = useState({}); // for the health claim description
  const [meetsReqsInputValues, setMeetsReqsInputValues] = useState({}); // for the health claim description

  const [vitaminUnits, setVitaminUnits] = useState({}); // for the health claim description
  const [mineralUnits, setMineralUnits] = useState({}); // for the health claim description

  // Validates input for claims
  const validateInput = (value) => {
    const regex = /^\d*\.?\d*$/;
    return regex.test(value);
  };

  const handleVitaminChange = (selectedOptions) => {
    setSelectedVitamins(selectedOptions);
    // Resets vitamin input value when a new vitamin is selected
    //setVitaminInputValues({});
  };

  const handleMineralChange = (selectedOptions) => {
    setSelectedMinerals(selectedOptions);
    // Resets mineral input val when new one is selected
    //setMineralInputValues({});
  };

  const handleOtherChange = (selectedOptions) => {
    setSelectedOthers(selectedOptions);
    // Resets other input val when new one is selected
    //setOtherInputValues({});
  };

  
  // Checks if product meets requirements for high fibre claims
  const handleHighFibreClaims = (value) => {
    if (value === true) {
      setHasHighFibre(true);
    } else {
      console.log('Not high fibre:', value);
      setHasHighFibre(false);
      setSelectedMeetsReqs(prevstate => prevstate.filter(option => option.requirement !== 'high_fibre'));
    }
  };

  // Checks if product meets requirements for low sugar claims
  const handleLowSugarClaims = (value) => {
    if (value === true) {
      setHasLowSugar(true);
    } else {
      console.log('Not low sugar:', value);
      setHasLowSugar(false);
      setSelectedMeetsReqs(prevstate => prevstate.filter(option => option.requirement !== 'low_sugar'));
    }
  };

  // Checks if product meets requirements for sugar free claims
  const handleSugarsFreeClaims = (value) => {
    if (value === true) {
      setHasSugarsFree(true);
    } else {
      console.log('Not sugar free:', value);
      setHasSugarsFree(false);
      setSelectedMeetsReqs(prevstate => prevstate.filter(option => option.requirement !== 'sugars_free'));
    }
  };

  // Checks if product meets requirements for low salt claims and sets various states
  const handleLowSaltClaims = (value) => {
    if (value === true) {
      setHasLowSalt(true);
    } else {
      console.log('Not low salt:', value);
      setHasLowSalt(false);
      setSelectedMeetsReqs(prevstate => prevstate.filter(option => option.requirement !== 'low_salt'));
    }
  };

  // Checks if product meets requirements for low saturated fat claims
  const handleLowSatFatClaims = (value) => {
    if (value === true) {
      setHasLowSatFat(true);
    } else {
      console.log('Not low sat fat:', value);
      setHasLowSatFat(false);
      setSelectedMeetsReqs(prevstate => prevstate.filter(option => option.requirement !== 'low_saturated_fat'));
    }
  };

  const meetsMinimumRequirement = (other, value) => {
    const selectedOther = selectOthers.find(item => item.value === other);
    if (selectedOther && selectedOther.minimum !== undefined) {
      return parseFloat(value) >= selectedOther.minimum;
    }
    return 'Ikke nødvendig';
  };

  // Function to handle unit change for vitamins
  const handleVitaminUnitChange = (vitamin, unit) => {
    setVitaminUnits(prevUnits => ({
      ...prevUnits,
      [vitamin]: unit,
    }));
  };

  // Function to handle unit change for minerals
  const handleMineralUnitChange = (mineral, unit) => {
    setMineralUnits(prevUnits => ({
      ...prevUnits,
      [mineral]: unit,
    }));
  };

  // Handles the input change of selected vitamins
  const handleVitaminInputChange = (vitamin, value) => {
    if (validateInput(value)) {
      setVitaminInputValues(prevValues => ({
        ...prevValues,
        [vitamin]: value,
      }));
    }
  };
  // Handles the input change of selected minerals
  const handleMineralInputChange = (mineral, value) => {
    if (validateInput(value)) {
      setMineralInputValues(prevValues => ({
        ...prevValues,
        [mineral]: value,
      }));
    }
  };
  // Handles the input change of selected others
  const handleOtherInputChange = (other, value) => {
    if (validateInput(value)) {
      setOtherInputValues(prevValues => ({
        ...prevValues,
        [other]: value,
      }));
    }
  };
  // Handles the input change of selected meets requirements
  const handleMeetsReqsInputChange = (meetsReqs, value) => {
    if (validateInput(value)) {
      setMeetsReqsInputValues(prevValues => ({
        ...prevValues,
        [meetsReqs]: value,
      }));
    }
  };

  // Gets the claims descriptions for every selected vitamins, and sets the state variable
  useEffect(() => {
    const descriptions = selectedVitamins.map(option => getClaimDescription(option.value));
    setVitaminClaims(descriptions);
  }, [selectedVitamins, vitaminInputValues, vitaminUnits]);

  // Gets the claims descriptions for every selected minerals, and sets the state variable
  useEffect(() => {
    const descriptions = selectedMinerals.map(option => getClaimDescription(option.value));
    setMineralClaims(descriptions);
  }, [selectedMinerals, mineralInputValues, mineralUnits]);

  // Gets the claims descriptions for every selected other type, and sets the state variable
  useEffect(() => {
    const descriptions = selectedOthers.map(option => getClaimDescription(option.value));
    setOtherClaims(descriptions);
  }, [selectedOthers, otherInputValues]);

  // Gets the claims descriptions for every requirement met, and sets the state variable
  useEffect(() => {
    const descriptions = selectedMeetsReqs.map(option => getClaimDescription(option.value));
    setMeetsReqsClaims(descriptions);
  }, [selectedMeetsReqs, meetsReqsInputValues]);

  const getClaimDescription = (selectedItem) => {
    console.log('selectedItem:', selectedItem);
    // Itererer gjennom helsepåstander for å finne riktig påstand for valgt vitamin/mineral/andre og returnerer en toString
    for (const nutrient of healthClaims) {
      if (nutrient.nutrient === selectedItem) {
        const claims = nutrient.claims.map(claim => claim.claim).join('.\n');
        
        const vitaminInput = vitaminInputValues[selectedItem]; // Deler på 1000 for å få gram
        const mineralInput = mineralInputValues[selectedItem]; // Deler på 1000 for å få gram
        const otherInput = otherInputValues[selectedItem];
        const meetsReqsInput = meetsReqsInputValues[selectedItem];

        // Sjekker om inputverdien er satt, og setter den til 'ikke oppgitt' hvis den ikke er satt
        // Sjekker også om målingsverdier er satt, og konverterer til mg hvis enheten er mikrogram
        let inputValue = 'ikke oppgitt';
        const vitaminUnit = vitaminUnits[selectedItem] || 'mg';
        const convertedVitaminValue = vitaminUnit === 'µg' ? vitaminInput / 1000 : vitaminInput;
        const mineralUnit = mineralUnits[selectedItem] || 'mg';
        const convertedMineralValue = mineralUnit === 'µg' ? mineralInput / 1000 : mineralInput; 
        if (vitaminInput !== undefined){
          inputValue = convertedVitaminValue || 'ikke oppgitt';
        } else if (mineralInput !== undefined){
          inputValue = convertedMineralValue || 'ikke oppgitt';
        } else if (otherInput !== undefined){
          inputValue = otherInput || 'ikke oppgitt';
        } else if (meetsReqsInput !== undefined){
          inputValue = meetsReqsInput || 'ikke oppgitt';
        }
        if (inputValue !== 'ikke oppgitt' && inputValue !== ''){ //&& inputValue === ) {
          if (vitaminInput !== undefined || mineralInput !== undefined) {
            inputValue += ' mg';
          } else {
            inputValue += ' g';
          }
        }
        
        // Sjekker om inputverdien oppfyller kravet for helsepåstanden
        let meetsMinimum = `<em>Ved å velge dette næringsstoffet er man sikker at mengden oppfyller kravet som er vedlagt til forordning (EF) nr. 1924/2006.</em>`;
        if (otherInput !== undefined) {
          meetsMinimum = meetsMinimumRequirement(selectedItem, inputValue.replace(' g', '')) ? `<strong>Oppfyller gitt krav</strong>` : `<strong>Oppfyller ikke gitt krav</strong>`;
        }
        return `<strong>Mengde: ${inputValue}</strong>\n${meetsMinimum}\n${claims}`;
      }
    }
    return 'No claim found for the selected item.';
  };




  // Define state variables for the dropdown selectors
  const [selectsGroup, setSelectGroups] = useState(""); // for the "Group" selector

  const [selectsProduct, setSelectProduct] = useState(""); // for the "Product" selector

  const [selectsFragment, setSelectFragment] = useState(""); // for the "Fragment" selector
  const [selectsRation, setSelectRation] = useState(""); // for the "Ration" selector

  const [isCalculationCompleted, setIsCalculationCompleted] = useState(false); // Track if calculation is completed
  // State var for tracking if product has Nøkkelhullet label
  const [hasNokkelhullet, setHasNokkelhullet] = useState(false); // Track if product has Nøkkelhullet label
  const [hasEfsaNutrition, setHasEfsaNutrition] = useState(null); // Track if product has Efsa Nutrition label

  // Sets product object with default values
  const [product, setProduct] = useState({
    productId: 0,
    name: '',
    group: '',
    type: '',
    hasEfsaHealth: false,
    hasEfsaNutrition: false,
    hasNokkelhullet: false,
    imageUrl: 'placeholder.png',
    calories: 0,
    fat: 0,
    satFat: 0,
    carbs: 0,
    natSugar: 0,
    addedSugar: 0,
    fiber: 0,
    protein: 0,
    salt: 0,
  });
  

  const [nutrition, setNutrition] = useState({
    energikj: 0,
    energikcal: 0,
    fett: 0,
    mettede: 0,
    karbohydrat: 0,
    naturligSukker: 0,
    hvoravSukkerarter: 0,
    kostfiber: 0,
    protein: 0,
    salt: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };
  
  /*
  const handleNutrientChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: parseFloat(value),
    }));
  };
  */
  
  // Handles changes in nutrition to keep inputs up to date
  const handleNutritionChange = (updatedNutrition) => {
    setNutrition(updatedNutrition);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let imageUrl = "";
  
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);
  
      try {
        const response = await axios.post(
          `${API_URL}/api/products/upload-product-image`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data", },
            withCredentials: true,
          }
        );
  
        imageUrl = response.data.imageUrl; // Assume the server returns { imageUrl: "https://example.com/image.jpg" }
      } catch (error) {
        console.error("Image upload failed:", error.response?.data || error.message);
        alert("Feil ved opplasting av bilde.");
        return;
      }
    }
  
    // Format health claims
    const vitaminClaimDescriptions = vitaminClaims.map((description, index) =>
      `<strong>${selectedVitamins[index].label} Helsepåstand(er):</strong>\n${description}`
    ).join('\n');
    const mineralClaimDescriptions = mineralClaims.map((description, index) =>
      `<strong>${selectedMinerals[index].label} Helsepåstand(er):</strong>\n${description}`
    ).join('\n');
    const otherClaimDescriptions = otherClaims.map((description, index) =>
      `<strong>${selectedOthers[index].label} Helsepåstand(er):</strong>\n${description}`
    ).join('\n');
    const meetsReqsClaimDescriptions = meetsReqsClaims.map((description, index) =>
      `<strong>${selectedMeetsReqs[index].label} Oppfyllende Helsepåstand(er):</strong>\n${description}`
    ).join('\n');
  
    if (hasNokkelhullet) {
      product.hasNokkelhullet = true;
    }
  
    product.hasEfsaNutrition = hasEfsaNutrition;
    product.hasEfsaHealth = `${vitaminClaimDescriptions}\n${mineralClaimDescriptions}\n${otherClaimDescriptions}\n${meetsReqsClaimDescriptions}`;
  
    const calories = nutrition.energikcal !== '' ? nutrition.energikcal : nutrition.energikj;
  
    const updatedProduct = {
      ...product,
      group: `<strong>Matgruppe:</strong> ${selectsGroup}`,
      calories,
      fat: nutrition.fett,
      satFat: nutrition.mettede,
      carbs: nutrition.karbohydrat,
      natSugar: nutrition.naturligSukker,
      addedSugar: nutrition.hvoravSukkerarter,
      fiber: nutrition.kostfiber,
      protein: nutrition.protein,
      salt: nutrition.salt,
      imageUrl, // Attach uploaded image URL
    };
  
    try {
      await ProductService.createProduct(updatedProduct);
      alert("Resept er nå lagret for dette produktet!\nDu kan behandle produktet på produkt-siden.");
      window.location.reload();
    } catch (error) {
      console.error("Error saving product:", error.response ? error.response.data : error.message);
      alert("Noe gikk galt.\nReseptet er ikke lagret.\nSjekk at du er logget inn som matprodusent.");
  
      // **Delete orphaned image if product submission fails**
      if (imageUrl) {
        try {
          await axios.delete(`${API_URL}/api/products/delete-product-image`, {
            data: { imageUrl },
            withCredentials: true,
          });
        } catch (deleteError) {
          console.error("Failed to delete orphaned image:", deleteError.response?.data || deleteError.message);
        }
      }
  
      window.location.reload();
    }
  };
  
  // Define event handlers for when a selection is made in each dropdown
  const handlerGroup = (event) => {
    setSelectGroups(event.value); // update state variable for "Group" selector
  };

  const handlerProduct = (event) => {
    setSelectProduct(event.value); // update state variable for "Product" selector
    // update state variable for Product object, sets value to the label of the selected option
    setProduct((prevProduct) => ({  
      ...prevProduct,
      type: `<strong>Matkategori:</strong> ${event.label}`,
    }));
  };
  

  const handlerFragment = (event) => {
    setSelectFragment(event.value); // update state variable for "Fragment" selector
    // update state variable for Product object, sets value to the label of the selected option
    /*
    setProduct((prevProduct) => ({
      ...prevProduct,
      type: event.label,
    }));
    */
  };

  const handlerRation = (event) => {
    setSelectRation(event.value); // update state variable for "Ration" selector
    // update state variable for Product object, sets value to the label of the selected option
    setProduct((prevProduct) => ({
      ...prevProduct, 
      type: event.label,
    }));
  };

  const handleCalculationComplete = () => {
    setIsCalculationCompleted(true);
  };

  // Function that is called by category when the Nøkkelhullet is either checked or unchecked
  const handleHasNokkelhullet = (value) => {
    setHasNokkelhullet(value);
  };

  const handleEfsaNutrition = (value) => {
    setHasEfsaNutrition(value);
  };

  // Filter options based on the high fiber and low sugar requirements
  const filteredOptions = selectMeetsReqs.filter(option => {
    if (option.requirement === 'high_fibre' && hasHighFibre) {
      return true;
    }
    if (option.requirement === 'low_sugar' && hasLowSugar) {
      return true;
    }
    if (option.requirement === 'sugars_free' && hasSugarsFree) {
      return true;
    }
    if (option.requirement === 'low_salt' && hasLowSalt) {
      return true;
    }
    if (option.requirement === 'low_saturated_fat' && hasLowSatFat) {
      return true;
    }
    return false;
  });

  // For info link to the regulation
  const openInfoLink = () => {
    window.open('https://lovdata.no/dokument/SF/forskrift/2010-02-17-187/KAPITTEL_1#KAPITTEL_1', '_blank', 'noopener,noreferrer');
  };

  // Popover for lovdata
  const popover = (
    <Popover data-trigger="focus" tabindex="0" id="popover-basic" style={{ maxWidth: '300px', maxHeight: '400px' }}>
      <Popover.Header as="h2">EFSA Helsepåstander</Popover.Header>
      <Popover.Body>
        <strong>
          Du kan søke etter et bestemt næringsstoff i hvert felt ved å taste inn navnet. 
          <br/>For vitaminer og mineraler er mengden man oppgir frivillig. Det er forventet at matprodusent har kjennskap til at mengden oppfyller kravet for å kunne påstå at produktet inneholder en kilde til stoffet.
          <hr/>Klikk på informasjonsikonet for å se hvilke krav som må møtes i henhold til forordning (EF) nr. 1924/2006.
        </strong>
      </Popover.Body>
    </Popover>
  );



  // This component returns a form that allows users to input nutritional data for a food item.
  // It includes various fields for selecting the food name, food group, and food category.
  // The options for the fields change based on the selected food group.
  return (
    <form onSubmit={handleSubmit}>
      <div className="calculator">
    <div className="vstack gap-3 container">
          
      <div className="row">
        <div className="col-md-6">
          <h3>Legg inn næringsinnhold</h3>
          {/* Add a label for the food name input */}
          <label htmlFor="matnavn" className="form-label">
            <strong>Matvarenavn</strong>
          </label>

          {/* use Bootstrap classes to style the food name input */}
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              aria-describedby="matnavn"
              name="name"
              value={product.name}
              onChange={handleChange}
              placeholder="Product Name"
              
            />
          </div>

          {/* Display image preview only if an image is selected */}
          {selectedImage && (
            <div className="mb-3">
              <p>Valgt bilde:</p>
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Preview"
                className="img-thumbnail"
                width="150"
              />
            </div>
          )}

          <label htmlFor="image" className="form-label">
            <strong>Last opp profilbilde</strong>
          </label>
          <div className="input-group">
            <input
              type="file"
              className="form-control"
              id="image"
              name="image"
              accept="image/*"
              onChange={(e) =>
                setSelectedImage(e.target.files?.[0] || null)
              }
            />
          </div>

          {/* Add a label for the food group select input */}
          <label htmlFor="matgruppe" className="form-label">
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
              <label htmlFor="mat" className="form-label">
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
              <label htmlFor="mat" className="form-label">
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
              <label htmlFor="mat" className="form-label">
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
              <label htmlFor="mat" className="form-label">
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
              <label htmlFor="mat" className="form-label">
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
              <label htmlFor="mat" className="form-label">
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
              <label htmlFor="mat" className="form-label">
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
              <label htmlFor="mat" className="form-label">
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
              <label htmlFor="mat" className="form-label">
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
              <label htmlFor="mat" className="form-label">
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
              <label htmlFor="mat" className="form-label">
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
              <label htmlFor="matdivision" className="form-label">
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
              <label htmlFor="matdivision" className="form-label">
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
              <label htmlFor="matdivision" className="form-label">
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
              <label htmlFor="matration" className="form-label">
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
              <label htmlFor="matration" className="form-label">
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
              <label htmlFor="matration" className="form-label">
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
            Trykk på "beregn"-knappen for å se resultatet. Først må du sette
            ernæringsverdiene inne i ernæringskolonnen. Resultatet vises på
            høyre side. Hvis en "feil" oppstår, hold musepekeren over feilikonet
            i venstre kolonne for å se detaljene om den spesifikke feilen. 
            En kan legge til næringsstoffer som befinner seg i produktet, nederst i venstre kolonne. 
            Basert på valgte stoffer, vil EFSA Helsepåstander som tilhører bli generert. 
            Hvis visse EFSA Næringskrav treffes, vil det tilføyes ekstra påstander som bare er tilgjengelige dersom kravet til påstanden er oppfylt.

          </p>

          <ProductButtons showSubmitButton={isCalculationCompleted} onSubmit={handleSubmit} />

          {/* Render of claim descriptions */}
          {/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/}
          {/*    <ResultEfsaHealthClaims 
                vitaminClaims={vitaminClaims}
                mineralClaims={mineralClaims}
                selectedVitamins={selectedVitamins}
                selectedMinerals={selectedMinerals}
              />
          */}
          </div>


        {/* Spacer */}
        {/*<div style={{ padding: "5px" }}></div>*/}
       

        {/* Conditional rendering based on user selection */}
        <div>
        
          {/* Display default component if no group is selected */}
          {selectsGroup === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} 
            />
          }
          {/* Display default component if group is selected but no product is selected */}
          {selectsGroup === "grønnsaker, frukt, bær og nøtter" &&
            selectsProduct === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete}/>}
          {/* Display component for Kategori1 if group is selected as grønnsaker, frukt, bær og nøtter and Kategori1 is selected as product */}
          {selectsGroup === "grønnsaker, frukt, bær og nøtter" &&
            selectsProduct === "kategori 1" && 
            <Kategori1 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}
            /> 
          }
          {/* Display component for Kategori2 if group is selected as grønnsaker, frukt, bær og nøtter and Kategori2 is selected as product */}
          {selectsGroup === "grønnsaker, frukt, bær og nøtter" &&
            selectsProduct === "kategori 2" && <Kategori2 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {/* Display component for Kategori3 if group is selected as grønnsaker, frukt, bær og nøtter and Kategori3 is selected as product */}
          {selectsGroup === "grønnsaker, frukt, bær og nøtter" &&
            selectsProduct === "kategori 3" && <Kategori3 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}
            />
          }

          {/* Display default component if group is selected as mel, gryn og ris but no product is selected */}
          {selectsGroup === "mel, gryn og ris" && selectsProduct === "" && (
            <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete}/>
          )}
          {/* Display component for Kategori4 if group is selected as mel, gryn og ris and Kategori4 is selected as product */}
          {selectsGroup === "mel, gryn og ris" &&
            selectsProduct === "kategori 4" && <Kategori4 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for Kategori5 if group is selected as mel, gryn og ris and Kategori5 is selected as product */}
          {selectsGroup === "mel, gryn og ris" &&
            selectsProduct === "kategori 5" && <Kategori5 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for Kategori6 if group is selected as mel, gryn og ris and Kategori6 is selected as product */}
          {selectsGroup === "mel, gryn og ris" &&
            selectsProduct === "kategori 6" && <Kategori6 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {/* Display default component if group is selected as grøt, brød og pasta but no product is selected */}
          {selectsGroup === "grøt, brød og pasta" && selectsProduct === "" && (
            <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete}/>
          )}
          {/* Display component for kategori 7 if group is selected as grøt, brød og pasta and product is kategori 7 */}
          {selectsGroup === "grøt, brød og pasta" &&
            selectsProduct === "kategori 7" && <Kategori7 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for kategori 8a if group is selected as grøt, brød og pasta and product is kategori 8a */}
          {selectsGroup === "grøt, brød og pasta" &&
            selectsProduct === "kategori 8a" && <Kategori8a product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for kategori 8b if group is selected as grøt, brød og pasta and product is kategori 8b */}
          {selectsGroup === "grøt, brød og pasta" &&
            selectsProduct === "kategori 8b" && <Kategori8b product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for kategori 9 if group is selected as grøt, brød og pasta and product is kategori 9 */}
          {selectsGroup === "grøt, brød og pasta" &&
            selectsProduct === "kategori 9" && <Kategori9 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for kategori 10 if group is selected as grøt, brød og pasta and product is kategori 10 */}
          {selectsGroup === "grøt, brød og pasta" &&
            selectsProduct === "kategori 10" && <Kategori10 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}
            />
          }

          {/* Display default component if group is selected as melk kategori but no product is selected */}
          {selectsGroup === "melk kategori" && selectsProduct === "" && (
            <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete}/>
          )}
          {/* Display component for melk 11a if group is selected as melk kategori and product is melk 11a */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 11a" && <Melk11a product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for melk 11b if group is selected as melk kategori and product is melk 11b */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 11b" && <Melk11b product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for melk 12a if group is selected as melk kategori and product is melk 12a */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 12a" && <Melk12a product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for melk 12b if group is selected as melk kategori and product is melk 12b */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 12b" && <Melk12b product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for melk 13a if group is selected as melk kategori and product is melk 13a */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 13a" && <Melk13a product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for melk 13b if group is selected as melk kategori and product is melk 13b */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 13b" && <Melk13b product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for melk 14a if group is selected as melk kategori and product is melk 14a */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 14a" && <Melk14a product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for melk 14b if group is selected as melk kategori and product is melk 14b */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 14b" && <Melk14b product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for melk 15a if group is selected as melk kategori and product is melk 15a */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 15a" && <Melk15a product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {/* Display component for melk 15b if group is selected as melk kategori and product is melk 15b */}
          {selectsGroup === "melk kategori" &&
            selectsProduct === "melk 15b" && <Melk15b product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {/* Repeat the above conditional rendering code that renders a different component based on the user's selection of product category, group, and subcategory.  */}
          {selectsGroup === "ost og vegetabilske alternativer" &&
            selectsProduct === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete}/>}
          {selectsGroup === "ost og vegetabilske alternativer" &&
            selectsProduct === "kategori 16" && <Kategori16 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "ost og vegetabilske alternativer" &&
            selectsProduct === "kategori 17" && <Kategori17 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "ost og vegetabilske alternativer" &&
            selectsProduct === "kategori 18" && <Kategori18 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {selectsGroup === "matfett og oljer" && selectsProduct === "" && (
            <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} />
          )}
          {selectsGroup === "matfett og oljer" &&
            selectsProduct === "kategori 19" && <Kategori19 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "matfett og oljer" &&
            selectsProduct === "kategori 20" && <Kategori20 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} />}
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 21" && <Kategori21 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 22" &&
            selectsFragment === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} />}
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 22" &&
            selectsFragment === "kategori 22 a" && <Kategori22a product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 22" &&
            selectsFragment === "kategori 22 b" && <Kategori22b product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 22" &&
            selectsFragment === "kategori 22 c" && <Kategori22c product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "fiskerivarer og produkter av fiskerivarer" &&
            selectsProduct === "kategori 22" &&
            selectsFragment === "kategori 22 d" && <Kategori22d product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 23" && <Kategori23 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 a" &&
            selectsRation === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 a" &&
            selectsRation === "kategori 24 a 1" && <Kategori24a1 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 a" &&
            selectsRation === "kategori 24 a 2" && <Kategori24a2 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 b" &&
            selectsRation === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete}/>}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 b" &&
            selectsRation === "kategori 24 b 1" && <Kategori24b1 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 b" &&
            selectsRation === "kategori 24 b 2" && <Kategori24b2 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 b" &&
            selectsRation === "kategori 24 b 3" && <Kategori24b3 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 b" &&
            selectsRation === "kategori 24 b 4" && <Kategori24b4 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 c" &&
            selectsRation === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} />}
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 c" &&
            selectsRation === "kategori 24 c 1" && <Kategori24c1 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "kjøtt og produkter som inneholder kjøtt" &&
            selectsProduct === "kategori 24" &&
            selectsFragment === "kategori 24 c" &&
            selectsRation === "kategori 24 c 2" && <Kategori24c2 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {selectsGroup === "helt eller delvis vegetabilske produkter" &&
            selectsProduct === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} />}
          {selectsGroup === "helt eller delvis vegetabilske produkter" &&
            selectsProduct === "kategori 25" &&
            selectsFragment === "" && <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} />}
          {selectsGroup === "helt eller delvis vegetabilske produkter" &&
            selectsProduct === "kategori 25" &&
            selectsFragment === "kategori 25 a" && <Kategori25a product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "helt eller delvis vegetabilske produkter" &&
            selectsProduct === "kategori 25" &&
            selectsFragment === "kategori 25 b" && <Kategori25b product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {selectsGroup === "ferdigretter" && selectsProduct === "" && (
            <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete}/>
          )}
          {selectsGroup === "ferdigretter" &&
            selectsProduct === "kategori 26" && <Kategori26 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "ferdigretter" &&
            selectsProduct === "kategori 27" && <Kategori27 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "ferdigretter" &&
            selectsProduct === "kategori 28" && <Kategori28 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "ferdigretter" &&
            selectsProduct === "kategori 29" && <Kategori29 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "ferdigretter" &&
            selectsProduct === "kategori 30" && <Kategori30 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }

          {selectsGroup === "dressinger og sauser" && selectsProduct === "" && (
            <Kategori0 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} />
          )}
          {selectsGroup === "dressinger og sauser" &&
            selectsProduct === "kategori 31" && <Kategori31 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs}/>
          }
          {selectsGroup === "dressinger og sauser" &&
            selectsProduct === "kategori 32" && <Kategori32 product={product} onNutritionChange={handleNutritionChange} onCalculationComplete={handleCalculationComplete} hasNokkelhullet={handleHasNokkelhullet} hasEfsaNutrition={handleEfsaNutrition}
            vitaminClaims={vitaminClaims}
            mineralClaims={mineralClaims}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            otherClaims={otherClaims}
            selectedOthers={selectedOthers}
            hasHighFibre={handleHighFibreClaims}
            hasLowSugar={handleLowSugarClaims}
            hasSugarsFree={handleSugarsFreeClaims}
            hasLowSalt={handleLowSaltClaims}
            hasLowSatFat={handleLowSatFatClaims}
            meetsReqClaims={meetsReqsClaims}
            selectedMeetsReqs={selectedMeetsReqs} />
          }

          {/*{isCalculationCompleted && (
          <button type="submit">Save Product</button>
        )}*/}





        </div>

          {/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/}
          {/* These are added inputs for Health Claims */}
          <div className="col-md-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>

          <Container style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', marginTop: '10px', marginBottom: '10px', backgroundColor: '#f9f9f9', maxHeight: '1000px', overflowY: 'auto', overflowX: 'hidden' }}>
          <h4>
            <img 
              alt="EFSA Logo"
              className=""
              style={{ width: '35px', height: '35px', float: 'left' }}
              src={`${API_URL}/images/efsaLogo.png`}
            />
            &nbsp;EFSA Helsepåstander &nbsp;

            <OverlayTrigger data-trigger="hover" placement="right" overlay={popover}>
            <FontAwesomeIcon icon={faCircleInfo} onClick={openInfoLink} style={{ cursor: 'pointer', float: 'right', padding: '5px' }}/>     
            </OverlayTrigger>

          </h4>
          <hr/>
          <Row className="mb-3">
          <Col xs={12} md={6}>
            <label htmlFor="vitamins" className="form-label">
              <strong>Kilde til Vitaminer</strong>
            </label>
            <CustomSelect
              isMulti
              placeholder={<div>Velg Vitaminer</div>}
              className="form-select-md"
              onChange={handleVitaminChange}
              options={selectVitamins}
            />
            {selectedVitamins.map((vitamin) => (
              <div key={vitamin.value} className="mt-2">
                <label htmlFor={`vitamin-input-${vitamin.value}`} className="form-label">
                  Valgfri mengde {vitamin.label} 
                </label>
                <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id={`vitamin-input-${vitamin.value}`}
                  value={vitaminInputValues[vitamin.value] || ''}
                  onChange={(e) => handleVitaminInputChange(vitamin.value, e.target.value)}
                  placeholder={`${vitamin.label}`}
                />
                <select
                  className="form-select"
                  value={vitaminUnits[vitamin.value] || 'mg'}
                  onChange={(e) => handleVitaminUnitChange(vitamin.value, e.target.value)}
                  style={{flex: '0 0 25%'}}
                >
                  <option value="mg">mg</option>
                  <option value="µg">µg</option>
                </select>
                </div>
              </div>
            ))}
          </Col>
          <Col xs={12} md={6}>
            <label htmlFor="minerals" className="form-label">
              <strong>Kilde til Mineraler</strong>
            </label>
            <CustomSelect
              isMulti
              placeholder={<div>Velg Mineraler</div>}
              className="form-select-md"
              onChange={handleMineralChange}
              options={selectMinerals}
            />
            {selectedMinerals.map((mineral) => (
              <div key={mineral.value} className="mt-2">
                <label htmlFor={`mineral-input-${mineral.value}`} className="form-label">
                  Valgfri mengde {mineral.label}
                </label>
                <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id={`mineral-input-${mineral.value}`}
                  value={mineralInputValues[mineral.value] || ''}
                  onChange={(e) => handleMineralInputChange(mineral.value, e.target.value)}
                  placeholder={`${mineral.label}`}
                />
                <select
                  style={{flex: '0 0 25%'}}
                  className="form-select"
                  value={mineralUnits[mineral.value] || 'mg'}
                  onChange={(e) => handleMineralUnitChange(mineral.value, e.target.value)}
                >
                  <option value="mg">mg</option>
                  <option value="µg">µg</option>
                </select>
                </div>
              </div>
            ))}
          </Col>
        </Row>
        <br/>

        <Row className="mb-3" >
          <Col>
            <label htmlFor="others" className="form-label">
              <strong>Kilde til Annet</strong>
            </label>
            <CustomSelect
              isMulti
              placeholder={<div>Velg Andre</div>}
              className="form-select-md"
              onChange={handleOtherChange}
              options={selectOthers}
            />
            {selectedOthers.map((other) => (
              <div key={other.value} className="mt-2">
                <label htmlFor={`other-input-${other.value}`} className="form-label">
                  Mengde {other.label}
                </label>
                <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id={`other-input-${other.value}`}
                  value={otherInputValues[other.value] || ''}
                  onChange={(e) => handleOtherInputChange(other.value, e.target.value)}
                  placeholder={`${other.label}`}
                />
                <span className="input-group-text">g</span>
                
                </div>
              </div>
            ))}
          </Col>
        </Row>
        <br/>

        <Row className="mb-3">
          <Col>
            <label htmlFor="reqs" className="form-label">
              <strong>Møter EFSA Næringskrav</strong>
            </label>
            <CustomSelect
              isMulti
              placeholder={<div>Velg Muligheter</div>}
              className="form-select-md"
              onChange={setSelectedMeetsReqs}
              options={filteredOptions}
              value={selectedMeetsReqs}
            />
            {selectedMeetsReqs.map((meetsReqs) => (
              <div key={meetsReqs.value} className="mt-2">
                <label htmlFor={`meetsReqs-input-${meetsReqs.value}`} className="form-label">
                  Mengde {meetsReqs.label}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id={`meetsReqs-input-${meetsReqs.value}`}
                  value={meetsReqsInputValues[meetsReqs.value] || ''}
                  onChange={(e) => handleMeetsReqsInputChange(meetsReqs.value, e.target.value)}
                  placeholder={`${meetsReqs.label} (g)`}
                />
              </div>
            ))}
          </Col>
        </Row>
        </Container>
        </div>
        <div style={{padding: '200px'}}></div>


      </div>
    </div>
    </div>
    </form>

  );
};

export default Calculator;