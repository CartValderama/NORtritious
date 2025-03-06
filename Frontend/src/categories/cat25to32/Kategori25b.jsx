import React from "react";
import { useState, useEffect } from "react"; // import the useState and useeffect hook.
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons"; // import an icon.
import { faBan } from "@fortawesome/free-solid-svg-icons";
import { faSave, faShare, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // import FontAwesomeIcon component.
import Tooltip from "@mui/material/Tooltip"; // import Tooltip component.
import keyholeLgog from "../../img/circle-keyhole-logo.png"; // import an image
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"; // import an icon
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons"; // import an icon
import Select from "react-select"; // import Select component

// Imports for necessary claim check components, used in all categories 
import * as ResultComponents from "../../ResultComponents.jsx";
import * as Check from "../../NutritionClaimCheck.jsx"
import * as ProductService from "../../products/ProductService";

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ResultEfsaFullfilled og notFullfilled må implementers 
import {ResultEfsaFulfilled, ResultEfsaHealthClaims, ResultEfsaNotFulfilled} from '../../ResultEfsaClaims.jsx'; // EFSA claims

const Kategori25b = ({ product, 
  handleNutrientChange, 
  onNutritionChange, 
  onCalculationComplete, 
  hasNokkelhullet, 
  hasEfsaNutrition, 
  vitaminClaims, 
  mineralClaims, 
  selectedVitamins, 
  selectedMinerals, 
  otherClaims, 
  selectedOthers, 
  hasLowSugar, 
  hasSugarsFree,
  hasLowSatFat, 
  meetsReqClaims, 
  selectedMeetsReqs }) => {
  // State variables for showing results and empty result message

  const [showNokkelhulletResults, setShowNokkelhulletResults] = useState(null);
  const [showErnaeringsResults, setShowErnaeringsResults] = useState("");
  const [showHelsepåstander, setShowHelsepåstander] = useState(null);
  const [showEmptyResult, setShowEmptyResult] = useState(""); // initialize state variable for showing empty result message.

  //state variable to store the user's food type selection (solid or liquid) and the low sugars claim result
  const [foodType, setFoodType] = useState("");
  // state variables for nutrition claim check functions 
  const [lowEnergy, setLowEnergy] = useState(null);
  const [lowFat, setLowFat] = useState(null);
  const [fatFree, setFatFree] = useState(null);
  const [lowSaturatedFat, setLowSaturatedFat] = useState(null);
  const [saturatedFatFree, setSaturatedFatFree ] = useState(null); 
  const [lowSugars, setLowSugars] = useState(null);
  const [sugarsFree, setSugarsFree] = useState(null);
  /**
   * Previously implemented, not touched. 
   */
  //state variable to track whether the product meets the WITH NO ADDED SUGARS claim or not
  const [withNoAddedSugars, setWithNoAddedSugars] = useState(null);
  //state variable to track whether the product meets the "CONTAINS NATURALLY OCCURRING SUGARS" claim or not
  //const [containsNaturallyOccurringSugars, setContainsNaturallyOccurringSugars,] = useState(null);

  // State variable for tracking if the button is clicked
  const [buttonClicked, setButtonClicked] = useState(false);

  // useEffect hook for checking the conditions for the nutrition claims when button is clicked
  useEffect(() => {
    if (buttonClicked) {
      if (
        lowSugars &&
        withNoAddedSugars &&
        //containsNaturallyOccurringSugars &&
        sugarsFree && 
        /**
         * -- ADDED --
         */
        lowEnergy &&
        lowFat &&
        fatFree &&
        lowSaturatedFat &&
        saturatedFatFree
      ) {
        setShowErnaeringsResults("all");
      } else if (
        !lowSugars &&
        !withNoAddedSugars &&
        //!containsNaturallyOccurringSugars &&
        !sugarsFree &&
        /**
         * -- ADDED --
         */
        !lowEnergy &&
        !lowFat &&
        !fatFree &&
        !lowSaturatedFat &&
        !saturatedFatFree
      ) {
        setShowErnaeringsResults("none");
      } else {
        setShowErnaeringsResults("some");
      }
    }
  }, [
    lowSugars,
    withNoAddedSugars,
    //containsNaturallyOccurringSugars,
    sugarsFree,
    /**
    * -- ADDED --
    */
    lowEnergy, 
    lowFat,
    fatFree,
    lowSaturatedFat, 
    saturatedFatFree,
    buttonClicked,
  ]);

  //state for controlling the buttons' visibility
  const [showButtons, setShowButtons] = useState(false);

  // State variables to control the visibility of the information sections
  const [infoNokkelhullet, setInfoNokkelhullet] = useState(false);
  const [infoErnaerings, setInfoErnaerings] = useState(false);
  const [infoHelsepåstander, setInfoHelsepåstander] = useState(false);

  // Function to show an information section based on the container parameter
  const onClickInfo = (container) => {
    if (container === "nokkelhullet") {
      setInfoNokkelhullet(true);
    } else if (container === "ernaerings") {
      setInfoErnaerings(true);
    } else if (container === "helsepåstander") {
      setInfoHelsepåstander(true);
    }
  };

  // Function to hide an information section based on the container parameter
  const onClickClose = (container) => {
    if (container === "nokkelhullet") {
      setInfoNokkelhullet(false);
    } else if (container === "ernaerings") {
      setInfoErnaerings(false);
    } else if (container === "helsepåstander") {
      setInfoHelsepåstander(false);
    }
  };

  // State variables for handling input fields and validation errors
  const [energikj, setEnergikj] = useState(false);
  const [energikcal, setEnergikcal] = useState(false);

  const [fett, setFett] = useState(false);
  const [fettNull, setFettNull] = useState(false);
  const [mettede, setMettede] = useState(false);
  const [mettedeNull, setMettedeNull] = useState(false);
  const [karbohydrat, setKarbohydrat] = useState(false);
  const [naturligSukker, setNaturligSukker] = useState(false);
  const [hvoravSukkerarter, setHvoravSukkerarter] = useState(false);
  const [hvoravSukkerarterNull, setHvoravSukkerarterNull] = useState(false);
  const [kostfiber, setKostfiber] = useState(false);
  const [protein, setProtein] = useState(false);
  const [salt, setSalt] = useState(false);
  const [saltNull, setSaltNull] = useState(false);
  // State variable for storing nutrition information entered by user
  const [nutrition, setNutrition] = useState({
    energikj: "",
    energikcal: "",
    fett: "",
    mettede: "",
    karbohydrat: "",
    naturligSukker: "",
    hvoravSukkerarter: "",
    kostfiber: "",
    protein: "",
    salt: "",
  });

  /*
  // Handler for updating nutrition state/state variable based on input field changes/input values
  const changeHandle = (event) => {
    console.log("changeHandle ===", event.target, event.target.value);
    setNutrition({
      ...nutrition,
      [event.target.name]: event.target.value,
    });
  };
  */
 // Handler for updating nutrition state based on input field changes
 const changeHandle = (event) => {
  const { name, value } = event.target;
  setNutrition((prevNutrition) => {
    const updatedNutrition = {
      ...prevNutrition,
      [name]: parseFloat(value),
    };   
   onNutritionChange(updatedNutrition);
    return updatedNutrition;
  });
};
    // Function to check all possible combinations of claims, 
    // based on the active claims and returns the string of claims
    const claims = [
      { name: 'Lavt Energiinnhold', value: lowEnergy },
      { name: 'Lavt Fettinnhold', value: lowFat },
      { name: 'Fritt for Fett', value: fatFree },
      { name: 'Lavt Mettet Fettinnhold', value: lowSaturatedFat },
      { name: 'Fritt for Mettet Fett', value: saturatedFatFree },
      { name: 'Lavt Sukkerinnhold', value: lowSugars },
      { name: 'Fritt for Sukker', value: sugarsFree },
      { name: 'Uten tilsatt Sukker', value: withNoAddedSugars },

    ];
  
    // Function to check all possible combinations of claims, based on the active claims
    const checkClaims = (claims) => {
      // Filters out the active claims based on the current combination
      const activeClaims = claims.filter(claim => claim.value).map(claim => claim.name);
      //console.log(`Active claims: ${activeClaims.join(', ')}`);
      // Calls the function to put all active claims the product meets, into the product object
      hasEfsaNutrition(activeClaims.join(', '));
    };
  
    // Use useEffect to run checkClaims whenever the state variables change
    useEffect(() => {
      checkClaims(claims);
    }, [lowEnergy, lowFat, fatFree, lowSaturatedFat, saturatedFatFree, lowSugars, sugarsFree, withNoAddedSugars]);


  // define function to handle form submission
  const onClick = (e) => {
    e.preventDefault();
    setButtonClicked(true);
    setShowHelsepåstander(true);
    setShowButtons(true);
        // Forteller kalkulatoren at "beregn" er trykket,
    //  og lagring av reseptet er nå mulig
    onCalculationComplete();

    console.log("onclick ===", selectsPart, nutrition);

    // Check if all required fields are filled out and within valid ranges
    // The if statement checks if all required inputs are non-empty and meet the nutritional requirements
    if (
      nutrition.fett !== "" &&
      nutrition.fett <= 10 &&
      nutrition.mettede !== "" &&
      nutrition.mettede <= 3.5 &&
      nutrition.karbohydrat !== "" &&
      nutrition.naturligSukker !== "" &&
      nutrition.hvoravSukkerarter !== "" &&
      nutrition.hvoravSukkerarter <= 3 &&
      nutrition.kostfiber !== "" &&
      nutrition.protein !== "" &&
      nutrition.salt !== "" &&
      nutrition.salt <= 1
    ) {
      // If all requirements are met, display the nutrition results
      setShowNokkelhulletResults(true);
      hasNokkelhullet(true);
      // Hide any empty result messages or error messages
      setShowEmptyResult(false);

      // Check if the user selected "energikj" and if nutrition input lable of "energikj" is not empty
      if (selectsPart === "energikj" && nutrition.energikj !== "") {
        setEnergikj(false);
      }

      // Check if the user selected "energikcal" and if nutrition input lable of "energikcal" is not empty
      if (selectsPart === "energikcal" && nutrition.energikcal !== "") {
        setEnergikcal(false);
      }
      // Reset all input validation errors
      setFett(false);
      setFettNull(false);
      setMettede(false);
      setMettedeNull(false);
      setKarbohydrat(false);
      setNaturligSukker(false);
      setHvoravSukkerarter(false);
      setHvoravSukkerarterNull(false);
      setKostfiber(false);
      setProtein(false);
      setSalt(false);
      setSaltNull(false);
      // If the user has not selected any nutrients, set errors accordingly
      // Check each nutrition value to see if it is missing or negative
      // show input validation errors if any input is missing or negative.
    } else {
      if (selectsPart === "energikj") {
        console.log("energikj ===", selectsPart, nutrition.energikj);
        if (nutrition.energikj === "" || nutrition.energikj < 0) {
          console.log("energikj ===", selectsPart, nutrition.energikj);
          setEnergikj(true);
          setShowNokkelhulletResults(false);
          hasNokkelhullet(false);
          setShowEmptyResult(true);
        } else {
          setEnergikj(false);
        }
      }

      if (selectsPart === "energikcal") {
        console.log("energikcal ===", selectsPart, nutrition.energikcal);
        if (nutrition.energikcal === "" || nutrition.energikcal < 0) {
          console.log("energikcal ===", selectsPart, nutrition.energikcal);
          setEnergikcal(true);
          setShowNokkelhulletResults(false);
          hasNokkelhullet(false);

          setShowEmptyResult(true);
        } else {
          setEnergikcal(false);
        }
      }

      // repeat for each nutrition value...
      if (nutrition.fett === "" || nutrition.fett < 0) {
        setFettNull(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

        setShowEmptyResult(true);
      } else {
        setFettNull(false);
      }
      if (nutrition.fett > 10) {
        setFett(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

      } else {
        setFett(false);
      }

      if (nutrition.mettede === "" || nutrition.mettede < 0) {
        setMettedeNull(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

        setShowEmptyResult(true);
      } else {
        setMettedeNull(false);
      }
      if (nutrition.mettede > 3.5) {
        setMettede(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

      } else {
        setMettede(false);
      }

      // Check if the 'karbohydrat' input is missing or negative, and display an error message if necessary
      if (nutrition.karbohydrat === "" || nutrition.karbohydrat < 0) {
        setKarbohydrat(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

        setShowEmptyResult(true);
      } else {
        setKarbohydrat(false);
      }

      if (nutrition.naturligSukker === "" || nutrition.naturligSukker < 0) {
        setNaturligSukker(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

        setShowEmptyResult(true);
      } else {
        setNaturligSukker(false);
      }

      // Check if the 'hvoravSukkerarter' input is missing, negative or above the maximum allowed value (1),
      // and display an error message if necessary
      if (
        nutrition.hvoravSukkerarter === "" ||
        nutrition.hvoravSukkerarter < 0
      ) {
        setHvoravSukkerarterNull(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

        setShowEmptyResult(true);
      } else {
        setHvoravSukkerarterNull(false);
      }
      if (nutrition.hvoravSukkerarter > 3) {
        setHvoravSukkerarter(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

      } else {
        setHvoravSukkerarter(false);
      }

      if (nutrition.kostfiber === "" || nutrition.kostfiber < 0) {
        setKostfiber(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

        setShowEmptyResult(true);
      } else {
        setKostfiber(false);
      }

      if (nutrition.protein === "" || nutrition.protein < 0) {
        setProtein(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

        setShowEmptyResult(true);
      } else {
        setProtein(false);
      }

      if (nutrition.salt === "" || nutrition.salt < 0) {
        setSaltNull(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

        setShowEmptyResult(true);
      } else {
        setSaltNull(false);
      }
      if (nutrition.salt > 1) {
        setSalt(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);

      } else {
        setSalt(false);
      }
    }

    /*
    ----------------------------------------------------
    -- CLAIM CHECKS -- 
    ----------------------------------------------------
    */
    // Claim: "LOW SUGARS", "SUGARS-FREE", "LOW ENERGY", "LOW FAT", "LOW SATURATED FAT", AND "SATURATED FAT-FREE"
    setLowEnergy(Check.claimLowEnergy(nutrition.energikcal, nutrition.energikj, foodType, selectsPart))
    setLowFat(Check.claimLowFat(foodType, nutrition.fett))
    setFatFree(Check.claimFatFree(nutrition.fett))
    setLowSaturatedFat(Check.claimLowSaturatedFat(foodType, selectsPart, nutrition.mettede, nutrition.energikcal, nutrition.energikj))
    setSaturatedFatFree(Check.claimSaturatedFatFree(nutrition.mettede))
    setLowSugars(Check.claimLowSugars(foodType, nutrition.naturligSukker, nutrition.hvoravSukkerarter))
    setSugarsFree(Check.claimSugarsFree(nutrition.naturligSukker, nutrition.hvoravSukkerarter))
    setWithNoAddedSugars(Check.ClaimWithNoAddedSugars(nutrition.karbohydrat, nutrition.hvoravSukkerarter))

        if (Check.claimLowSugars(foodType, nutrition.naturligSukker, nutrition.hvoravSukkerarter)) {
          hasLowSugar(true);
        } else {
          hasLowSugar(false);
        }
        if (Check.claimSugarsFree(nutrition.naturligSukker, nutrition.hvoravSukkerarter)) {
          hasSugarsFree(true);
        } else {
          hasSugarsFree(false);
        }
        if (Check.claimLowSaturatedFat(foodType, selectsPart, nutrition.mettede, nutrition.energikcal, nutrition.energikj)) {
          hasLowSatFat(true);
        } else {
          hasLowSatFat(false);
        }
    
  };

  // create an array of energy units to select from
  const selectUnit = [
    {
      value: "energikj", // This is the value that will be used in the code
      label: "(kj)", // This is the value that will be displayed to the user in the dropdown
    },
    {
      value: "energikcal",
      label: "(kcal)",
    },
  ];

  // Declare a state variable for the select dropdown.
  const [selectsPart, setSelectPart] = useState("");

  // A function to handle changes to the select dropdown energy unit
  const handlerPart = (event) => {
    const inputVal = document.getElementsByName(event.value); // Get the input elements with the name of the selected option
    console.log("handlerPart ===", event, nutrition, inputVal); // Log the selected option, current nutrition state, and input elements to the console
    setSelectPart(event.value); // Update the selectsPart state with the value of the selected option
  };

  //create an array of food types to select from
  const foodTypes = [
    {
      value: "solid",
      label: "Fast form",
    },
    {
      value: "liquid",
      label: "Flytende form",
    },
  ];

  return (
    <div className="row">
      {/* This div creates a column layout for the left side of the table */}
      <div className="col-md-6">
        {/* the selector (dropdown menu) for choosing the food type. */}
        <div className="form-group">
          <label htmlFor="foodType">Velg type matvare:</label>
          <Select
            className="form-control"
            id="foodType"
            options={foodTypes}
            onChange={(e) => setFoodType(e.value)} // update the onFoodTypeChange function to directly set the food type state
            placeholder="Velg type matvare"
          />
        </div>

        <h5>
          Næringsinnhold per 100{" "}
          {foodType === "solid" ? "g" : foodType === "liquid" ? "ml" : "g/ml"}
        </h5>

        {/* This div adds a light background color to the table */}
        <div className="bg-light">
          {/* This table shows the nutritional information */}
          <table className="table table-striped">
            {/* The table header */}
            <thead>
              <tr>
                <th scope="col" className="table-font">
                  Energi eller næringsstoff
                </th>
                <th scope="col" className="table-font">
                  Mengde
                </th>
              </tr>
            </thead>

            {/* The table body */}
            <tbody>
              {/* This row shows the energy content */}
              <tr className={(energikj, energikcal ? "alert-box" : null)}>
                <th scope="row" className="table-font">
                  {/* An icon with a tooltip to indicate missing values in energy parameters */}
                  {energikj && energikcal ? (
                    <Tooltip
                      title="Mangler verdi i energi (kJ/Kcal) parameter"
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon
                          className="alert-icon"
                          icon={faCircleExclamation}
                        />
                      </div>
                    </Tooltip>
                  ) : null}{" "}
                  {/* This div displays the energy label and unit */}
                  <div className="row">
                    <div className="col-md-3">
                      <label for="energiunit" class="form-label">
                        Energi
                      </label>
                    </div>
                    {/* A dropdown menu for selecting the energy unit */}
                    <div className="col-md-6">
                      <Select
                        placeholder={<div>Velg enhet</div>}
                        className="form-select-md mb-3"
                        options={selectUnit}
                        onChange={(e) => handlerPart(e)}
                      />
                    </div>
                  </div>
                </th>
                {/* An input field for entering the energy value */}
                <td>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name={selectsPart}
                    onChange={changeHandle}
                    className="form-control"
                  ></input>
                </td>
              </tr>

              {/* Additional rows for other nutrient selections */}
              {/* This row shows the fat content */}
              <tr
                className={
                  fett ? "alert-box" : null || fettNull ? "alert-box" : null
                }
              >
                <th scope="row" className="table-font">
                  {fett ? (
                    <Tooltip
                      title="Produktet innfrir ikke Nøkkelhullet på grunn av mengden fett. Mengden på fett må være lavere enn eller lik 10/ 100 g for å møte kravene for Nøkkelhullsmerking."
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon className="alert-icon" icon={faBan} />
                      </div>
                    </Tooltip>
                  ) : null}
                  {fettNull ? (
                    <Tooltip
                      title="Mangler verdi i fett parameter"
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon
                          className="alert-icon"
                          icon={faCircleExclamation}
                        />
                      </div>
                    </Tooltip>
                  ) : null}{" "}
                  Fett (g)
                </th>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="fett"
                    value={nutrition.fett}
                    onChange={changeHandle}
                    className="form-control"
                  ></input>
                </td>
              </tr>

              {/* This row shows the saturated fat content */}
              <tr
                className={
                  mettede
                    ? "alert-box"
                    : null || mettedeNull
                    ? "alert-box"
                    : null
                }
              >
                <th scope="row" className="table-font">
                  {mettede ? (
                    <Tooltip
                      title="Produktet innfrir ikke Nøkkelhullet på grunn av mengden mettede fettsyrer. Mengden på mettede fettsyrer må være lavere enn eller lik 3.5 / 100 g for å møte kravene for Nøkkelhullsmerking."
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon className="alert-icon" icon={faBan} />
                      </div>
                    </Tooltip>
                  ) : null}
                  {mettedeNull ? (
                    <Tooltip
                      title="Mangler verdi i mettede fettsyrer parameter"
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon
                          className="alert-icon"
                          icon={faCircleExclamation}
                        />
                      </div>
                    </Tooltip>
                  ) : null}{" "}
                  Mettede fettsyrer (g)
                </th>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="mettede"
                    value={nutrition.mettede}
                    onChange={changeHandle}
                    className="form-control"
                  ></input>
                </td>
              </tr>

              {/* This row shows the carbohydrate (total sugars)content */}
              <tr className={karbohydrat ? "alert-box" : null}>
                <th scope="row" className="table-font">
                  {/* If the "karbohydrat" value is missing, display an exclamation icon with a tooltip */}
                  {karbohydrat ? (
                    <Tooltip
                      title="Mangler verdi i karbohydrat parameter"
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon
                          className="alert-icon"
                          icon={faCircleExclamation}
                        />
                      </div>
                    </Tooltip>
                  ) : null}{" "}
                  Karbohydrat (g)
                </th>
                {/* Input field for "karbohydrat" value */}
                <td>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="karbohydrat"
                    value={nutrition.karbohydrat}
                    onChange={changeHandle}
                    className="form-control"
                  ></input>
                </td>
              </tr>

              {/* This row shows the natural occuring sugars content */}
              <tr className={naturligSukker ? "alert-box" : null}>
                <th scope="row" className="table-font">
                  {/* If the naturligSukker value is missing, display an exclamation icon with a tooltip */}
                  {naturligSukker ? (
                    <Tooltip
                      title="Mangler verdi i naturligSukker parameter"
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon
                          className="alert-icon"
                          icon={faCircleExclamation}
                        />
                      </div>
                    </Tooltip>
                  ) : null}{" "}
                  • Naturlig innhold av sukker (g)
                </th>
                {/* Input field for Naturlig innhold av sukker  value */}
                <td>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="naturligSukker"
                    value={nutrition.naturligSukker}
                    onChange={changeHandle}
                    className="form-control"
                  ></input>
                </td>
              </tr>

              {/* This row shows hvorav tilsatte sukkerarter (added sugars)content */}
              <tr
                className={
                  hvoravSukkerarter
                    ? "alert-box"
                    : null || hvoravSukkerarterNull
                    ? "alert-box"
                    : null
                }
              >
                <th scope="row" className="table-font">
                  {/* If the "hvoravSukkerarter" value is too high, display a ban icon with a tooltip */}
                  {hvoravSukkerarter ? (
                    <Tooltip
                      title="Produktet innfrir ikke Nøkkelhullet på grunn av mengden hvoravSukkerarter. Mengden på hvoravSukkerarter må være lavere enn eller lik 3 g/ 100 g for å møte kravene for Nøkkelhullsmerking."
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon className="alert-icon" icon={faBan} />
                      </div>
                    </Tooltip>
                  ) : null}
                  {/* If the "hvoravSukkerarter" value is missing, display an exclamation icon with a tooltip */}
                  {hvoravSukkerarterNull ? (
                    <Tooltip
                      title="Mangler verdi i hvorav sukkerarter parameter"
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon
                          className="alert-icon"
                          icon={faCircleExclamation}
                        />
                      </div>
                    </Tooltip>
                  ) : null}{" "}
                  • Hvorav tilsatte sukkerarter (g)
                </th>
                {/* Input field for "hvoravSukkerarter" value */}

                <td>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="hvoravSukkerarter"
                    value={nutrition.hvoravSukkerarter}
                    onChange={changeHandle}
                    className="form-control"
                  ></input>
                </td>
              </tr>

              {/* This row shows kostfiber content */}
              <tr className={kostfiber ? "alert-box" : null}>
                <th scope="row" className="table-font">
                  {kostfiber ? (
                    <Tooltip
                      title="Mangler verdi i kostfiber parameter"
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon
                          className="alert-icon"
                          icon={faCircleExclamation}
                        />
                      </div>
                    </Tooltip>
                  ) : null}{" "}
                  • Kostfiber (g)
                </th>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="kostfiber"
                    value={nutrition.kostfiber}
                    onChange={changeHandle}
                    className="form-control"
                  ></input>
                </td>
              </tr>

              {/* This row shows the protein content */}
              <tr className={protein ? "alert-box" : null}>
                <th scope="row" className="table-font">
                  {protein ? (
                    <Tooltip
                      title="Mangler verdi i protein parameter"
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon
                          className="alert-icon"
                          icon={faCircleExclamation}
                        />
                      </div>
                    </Tooltip>
                  ) : null}{" "}
                  Protein (g)
                </th>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="protein"
                    value={nutrition.protein}
                    onChange={changeHandle}
                    className="form-control"
                  ></input>
                </td>
              </tr>

              {/* This row shows salt content */}
              <tr
                className={
                  salt ? "alert-box" : null || saltNull ? "alert-box" : null
                }
              >
                <th scope="row" className="table-font">
                  {salt ? (
                    <Tooltip
                      title="Produktet innfrir ikke Nøkkelhullet på grunn av mengden salt. Mengden på salt må være lavere enn eller lik 1 / 100 g for å møte kravene for Nøkkelhullsmerking."
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon className="alert-icon" icon={faBan} />
                      </div>
                    </Tooltip>
                  ) : null}
                  {saltNull ? (
                    <Tooltip
                      title="Mangler verdi i salt parameter"
                      placement="right"
                      arrow
                    >
                      <div className="icon">
                        <FontAwesomeIcon
                          className="alert-icon"
                          icon={faCircleExclamation}
                        />
                      </div>
                    </Tooltip>
                  ) : null}{" "}
                  Salt (g)
                </th>
                <td colSpan="2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="salt"
                    value={nutrition.salt}
                    onChange={changeHandle}
                    className="form-control"
                  ></input>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Button that submits the form and calls the onClick function */}
        <div className="col-12 button-div">
          <button
            type="submit"
            className="btn btn-primary btn-lg button-search"
            onClick={onClick}
          >
            Beregn
          </button>
        </div>
      </div>

      <div className="col-md-6" style={{marginTop: "0px"}}>
        {/* positive results nøkkelhullet container" */}
        {showNokkelhulletResults ? (
          <div className="container nøkkelhullet-food-result-container">
            {/* An image with class "keyhole-logo" and alt text "keyhole logo" */}
            <img
              src={keyholeLgog}
              className="keyhole-logo img-fluid"
              alt="keyhole logo"
            />
            {/* A heading with text "Nøkkelhullet" */}
            <h5>Nøkkelhullet</h5>
            <div className="row">
              <div className="col-md-10">
                <p>Produktet innfrir Nøkkelhullet. </p>
              </div>
              <div className="col-md-2">
                {/* FontAwesome icon with event listener to show the "Nøkkelhullet" information section */}
                <FontAwesomeIcon
                  className="info-button"
                  icon={faCircleInfo}
                  onClick={() => onClickInfo("nokkelhullet")}
                />
              </div>
            </div>

            {infoNokkelhullet ? (
              // Information section for "Nøkkelhullet"
              <div className="container info-div row">
                <div className="col-md-10">
                  {/* A paragraph with a link to Lovdata's "Forskrift om frivillig merking a nœringsmidler med Nokkellhullet" */}
                  <p>
                    Les mer om hvilke krav det stilles for merking av
                    Nokkellhullet på Lovdatas "Forskrift om frivillig merking a
                    nœringsmidler med Nokkellhullet":
                    <a
                      href="https://lovdata.no/dokument/SF/forskrift/2015-02-18-139"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      lovdata.no
                    </a>
                  </p>
                </div>
                <div className="col-md-2">
                  {/* FontAwesome icon with event listener to hide the "Nøkkelhullet" information section */}
                  <FontAwesomeIcon
                    className="x-button"
                    icon={faXmarkCircle}
                    onClick={() => onClickClose("nokkelhullet")}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        {/*Negative results nøkkelhullet container" */}
        {showNokkelhulletResults === false && (
          <div className="container nøkkelhullet-food-negResult-container">
            {/* An image with class "keyhole-logo" and alt text "keyhole logo" */}
            <img
              src={keyholeLgog}
              className="keyhole-logo img-fluid"
              alt="keyhole logo"
            />
            {/* A heading with text "Nøkkelhullet" */}
            <h5>Nøkkelhullet</h5>
            <div className="row">
              <div className="col-md-10">
                <p>Produktet innfrir ikke Nøkkelhullet.</p>
                {showEmptyResult ? (
                  <p>** Obligatoriske næringsverdier kan ikke være tomme.</p>
                ) : null}

                {mettede ? (
                  <p>
                    ** Mettede fettsyrer verdien kan være høyst 3.5 g/100 g.
                  </p>
                ) : null}

                {fett ? (
                  <p>** Fett verdien kan være høyst 10 g/100 g.</p>
                ) : null}

                {hvoravSukkerarter ? (
                  <p>
                    ** Tilsatte sukkerarter verdien kan være høyst 3 g/100 g.
                  </p>
                ) : null}

                {salt ? <p>** Salt verdien kan være høyst 1 g/100 g.</p> : null}
              </div>
              <div className="col-md-2">
                <FontAwesomeIcon
                  className="info-button"
                  icon={faCircleInfo}
                  onClick={() => onClickInfo("nokkelhullet")}
                />
              </div>
            </div>
            {infoNokkelhullet ? (
              // Information section for "Nøkkelhullet"
              <div className="container info-div row">
                <div className="col-md-10">
                  <p>
                    Les mer om hvordan oppnå kriteriene på Lovdata’s Forskrift
                    om frivillig merking av næringsmidler med Nøkkelhullet:
                    <a
                      href="https://lovdata.no/dokument/SF/forskrift/2015-02-18-139"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      lovdata.no
                    </a>
                  </p>
                </div>
                <div className="col-md-2">
                  <FontAwesomeIcon
                    className="x-button"
                    icon={faXmarkCircle}
                    onClick={() => onClickClose("nokkelhullet")}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}
        {/* Spacer */}
        <div style={{ padding: "5px" }}></div>

        {/* container for ernæringspåstander results */}
        {buttonClicked && (
          <div
            className={`container ernæringspåstander-food-result-container-${showErnaeringsResults}`}
          >
            <h5>Ernæringspåstander</h5>
            <div className="row">
              <div className="col-md-10">
                {/* PRINTS WHETHER THE PRODUCT FULFILL THE REQUIREMENTS FOR THE APPLICABLE NUTRITION CLAIMS OR NOT */}
                <ResultComponents.ClaimLowEnergyResult lowEnergy={lowEnergy} />
                <ResultComponents.ClaimLowFatResult lowFat={lowFat} />
                <ResultComponents.ClaimFatFreeResult fatFree={fatFree}/>
                <ResultComponents.ClaimLowSaturatedFatResult lowSaturatedFat={lowSaturatedFat}/>
                <ResultComponents.ClaimSaturatedFatFreeResult saturatedFatFree={saturatedFatFree}/>
                <ResultComponents.ClaimLowSugarsResult lowSugars={lowSugars}/>
                <ResultComponents.ClaimSugarsFreeResult sugarsFree={sugarsFree} />
                <ResultComponents.ClaimWithNoAddedSugarsResult withNoAddedSugars={withNoAddedSugars}/>
              </div>
              <div className="col-md-2">
                <FontAwesomeIcon
                  className="info-button"
                  icon={faCircleInfo}
                  onClick={() => onClickInfo("ernaerings")}
                />
              </div>
            </div>
            {infoErnaerings ? (
              // Information section for "Ernæringspåstander"
              <div className="container info-div row">
                <div className="col-md-10">
                  <p>
                    Les mer om hvordan oppnå kriteriene på Lovdata’s Forskrift
                    om ernærings- og helsepåstander om næringsmidler:
                    <a
                      href="https://lovdata.no/dokument/SF/forskrift/2010-02-17-187/KAPITTEL_1#KAPITTEL_1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      lovdata.no
                    </a>
                  </p>
                </div>
                <div className="col-md-2">
                  <FontAwesomeIcon
                    className="x-button"
                    icon={faXmarkCircle}
                    onClick={() => onClickClose("ernaerings")}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Spacer */}
        <div style={{ padding: "5px" }}></div>
        {/* container for Helsepåstander results  */}
        
              <ResultEfsaHealthClaims
                  vitaminClaims={vitaminClaims}
                  mineralClaims={mineralClaims}
                  selectedVitamins={selectedVitamins}
                  selectedMinerals={selectedMinerals}
                  otherClaims={otherClaims}
                  selectedOthers={selectedOthers}
                  meetsReqClaims={meetsReqClaims}
                  selectedMeetsReqs={selectedMeetsReqs}

              />
            

        
      </div>
    </div>
  );
};

export default Kategori25b;
