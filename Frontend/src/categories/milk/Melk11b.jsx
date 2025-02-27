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
import CustomSelect from "../../CustomSelect.jsx";

import efsaLogo from "../../img/efsaLogo.png"; // import an image

import { ResultNokkelhulletFulfilled, ResultNokkelhulletNotFulfilled } from '../../ResultNokkelhullet.jsx';
import {ResultEfsaFulfilled, ResultEfsaNotFulfilled} from '../../ResultEfsaClaims.jsx'; // EFSA claims
import ProductButtons from "../../ProductButtons";

// Imports for necessary claim check components, used in all categories 
import * as Check from "../../NutritionClaimCheck.jsx"
import * as ResultComponents from "../../ResultComponents.jsx";
import ErrorEfsaClaims from "../../errorMessages.jsx";
import ErrorMessageBox from "../../errorMessages.jsx";
import * as ProductService from "../../products/ProductService";

// This component is called Kategori1
const Melk11b  = ({ product, handleNutrientChange, onNutritionChange, onCalculationComplete, hasNokkelhullet, hasEfsaNutrition }) => {

  // State variables for showing results and empty result message
  const [showNokkelhulletResults, setShowNokkelhulletResults] = useState(null);
  const [showErnaeringsResults, setShowErnaeringsResults] = useState("");
  const [showHelsepåstander, setShowHelsepåstander] = useState(null);
  const [showEmptyResult, setShowEmptyResult] = useState(""); // initialize state variable for showing empty result message.

  //state variable to store the user's food type selection (solid or liquid)
  const [foodType, setFoodType] = useState("");

  // state variables for nutrition claim check functions 
  const [lowEnergy, setLowEnergy] = useState(null);
  const [lowFat, setLowFat] = useState(null);
  const [fatFree, setFatFree] = useState(null);
  const [lowSaturatedFat, setLowSaturatedFat] = useState(null);
  const [saturatedFatFree, setSaturatedFatFree ] = useState(null); 
  const [lowSugars, setLowSugars] = useState(null);
  const [sugarsFree, setSugarsFree] = useState(null);
  const [withNoAddedSugars, setWithNoAddedSugars] = useState(null);
  //const [containsNaturallyOccurringSugars, setContainsNaturallyOccurringSugars,] = useState(null);

  const [showResults, setShowResults] = useState("")
  const [buttonClicked, setButtonClicked] = useState(false);
  // State variable for tracking if the button is clicked
  useEffect(() => {
    if (buttonClicked) {
      // Check if any of the inputs are empty (falsy). If any are empty, set to false, else true.
      const isEveryInputFilled = [
        nutrition.fett,
      nutrition.mettede,
      nutrition.karbohydrat,
      nutrition.naturligSukker,
      nutrition.hvoravSukkerarter,
      nutrition.kostfiber,
      nutrition.protein,
      nutrition.salt

        // containsNaturallyOccurringSugars, // Uncomment if this condition is also to be checked
      ].every(condition => condition); // `every` returns true only if all conditions are truthy
  
      setShowResults(isEveryInputFilled); // True if all inputs are filled, false if any is empty
  
      // Optionally, reset `buttonClicked` to false here if you want the useEffect to act once per button click
      // setButtonClicked(false);
    }
  }, [
    buttonClicked, 
    lowEnergy, 
    lowFat, 
    fatFree, 
    lowSaturatedFat, 
    saturatedFatFree, 
    lowSugars, 
    sugarsFree, 
    withNoAddedSugars,
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

  // initialize State variables for handling input fields and validation errors
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

  // initialize State variable for storing nutrition information entered by user/input values
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
    setShowButtons(true);
    // Forteller kalkulatoren at "beregn" er trykket,
    //  og lagring av reseptet er nå mulig
    onCalculationComplete();

    console.log("onclick ===", selectsPart, nutrition);

    // Check if all required fields are filled out and within valid ranges
    // The if statement checks if all required inputs are non-empty and meet the nutritional requirements
    if (
      nutrition.fett !== "" &&
      nutrition.fett <= 3 &&
      nutrition.mettede !== "" &&
      nutrition.mettede <= 0.6 &&
      nutrition.karbohydrat !== "" &&
      nutrition.naturligSukker !== "" &&
      nutrition.hvoravSukkerarter !== "" &&
      nutrition.hvoravSukkerarter <= 1 &&
      nutrition.kostfiber !== "" &&
      nutrition.protein !== "" &&
      nutrition.salt !== "" &&
      nutrition.salt <= 0.5
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

      // If any inputs are missing or do not meet the requirements, show appropriate error messages
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
      if (nutrition.fett > 3) {
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
      if (nutrition.mettede > 0.6) {
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
      if (nutrition.hvoravSukkerarter > 1) {
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
      if (nutrition.salt > 0.5) {
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
    // Claim:  "LOW ENERGY", "LOW FAT", "FAT-FREE", "LOW SATURATED FAT", "SATURATED FAT-FREE", "LOW SUGARS", "SUGARS-FREE", AND "WITH NO ADDED SUGARS"
    setLowEnergy(Check.claimLowEnergy(nutrition.energikcal, nutrition.energikj, foodType, selectsPart))
    setLowFat(Check.claimLowFat(foodType, nutrition.fett))
    setFatFree(Check.claimFatFree(nutrition.fett))
    setLowSaturatedFat(Check.claimLowSaturatedFat(foodType, selectsPart, nutrition.mettede, nutrition.energikcal, nutrition.energikj))
    setSaturatedFatFree(Check.claimSaturatedFatFree(nutrition.mettede))
    setLowSugars(Check.claimLowSugars(foodType, nutrition.naturligSukker, nutrition.hvoravSukkerarter))
    setSugarsFree(Check.claimSugarsFree(nutrition.naturligSukker, nutrition.hvoravSukkerarter))
    setWithNoAddedSugars(Check.ClaimWithNoAddedSugars(nutrition.karbohydrat, nutrition.hvoravSukkerarter))

    // Check the condition for the "WITH NO ADDED SUGARS" nutrition claim
    /*if (nutrition.hvoravSukkerarter === "0" && nutrition.karbohydrat > 0) {
      setWithNoAddedSugars(true);
    } else {
      setWithNoAddedSugars(false);
    }*/


    /*console.log("RESULT:")
    console.log("Low sugars: ", lowSugars)
    console.log("Sugars free: ", sugarsFree)
    console.log("Low energy: ", lowEnergy)
    console.log("Low fat: ", lowFat)
    console.log("Fat free: ", fatFree)
    console.log("Low saturated fat: ", lowSaturatedFat)
    console.log("Saturated fat free: ", saturatedFatFree)*/


  


    // Check the condition for the "CONTAINS NATURALLY OCCURRING SUGARS" nutrition claim
    //if (nutrition.hvoravSukkerarter === "0" && nutrition.karbohydrat > 0) {
    //  setContainsNaturallyOccurringSugars(true);
    //} else {
    //  setContainsNaturallyOccurringSugars(false);
    //}
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
          <CustomSelect
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
              <tr>
                <th scope="row" className="table-font">
                  {/* If either the energy (kJ) or energy (kcal) value is missing, an exclamation icon is displayed */}
                  
                  {/* This div displays the energy label and unit */}
                  <div className="row">
                    <div className="col-md-3">
                      <label for="energiunit" class="form-label">
                        Energi
                      </label>
                    </div>
                    {/* This dropdown allows the user to select the unit for energy */}
                    <div className="col-md-6">
                      <CustomSelect
                        placeholder={<div>Velg enhet</div>}
                        className="form-select-md mb-3"
                        options={selectUnit}
                        onChange={(e) => handlerPart(e)}
                      />
                    </div>
                  </div>
                </th>
                {/* This column allows the user to input the energy value in input field*/}
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
                      title="Produktet innfrir ikke Nøkkelhullet på grunn av mengden fett. Mengden på fett må være lavere enn eller lik 3/ 100 g for å møte kravene for Nøkkelhullsmerking."
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
                      title="Produktet innfrir ikke Nøkkelhullet på grunn av mengden mettede fettsyrer. Mengden på mettede fettsyrer må være lavere enn eller lik 0.6 / 100 g for å møte kravene for Nøkkelhullsmerking."
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
                {/* This column allows the user to input the saturated fat value */}
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
                      title="Produktet innfrir ikke Nøkkelhullet på grunn av mengden hvoravSukkerarter. Mengden på hvoravSukkerarter må være lavere enn eller lik 1 g/ 100 g for å møte kravene for Nøkkelhullsmerking."
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
                  {/* If kostfiber is missing, show a exclamation icon */}
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
                  {/* Input field for kostfiber */}
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
                  {/* If the protein value is missing, an exclamation icon is displayed */}
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
                {/* This column allows the user to input the protein value */}
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
                  {/* If salt is missing, show a exclamation icon */}
                  {salt ? (
                    <Tooltip
                      title="Produktet innfrir ikke Nøkkelhullet på grunn av mengden salt. Mengden på salt må være lavere enn eller lik 0.5 / 100 g for å møte kravene for Nøkkelhullsmerking."
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
                {/* Input field for salt */}
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

        {/* Button that submits the form and calls the onClick function when clicked */}
        <div className="col-12 button-div">
        <button
            type="submit"
            className="btn btn-primary btn-lg button-search"
            onClick={onClick}
          >
            Beregn
          </button>
        <button
                type='button'
                className="btn btn-primary btn-lg button-search"
                onClick={() => window.location.reload()}
              >
                Nullstill
              </button>
          
        </div>
      {/* A simple button for adding a new product, which reloads the page on click */}  
      </div>        
      
  <div className="col-md-6">
  {buttonClicked && !showResults && <ErrorMessageBox />}

  {/* Spacer */}
  <div style={{ padding: "5px" }}></div>

  {/* Positive results nøkkelhullet container */}
  {buttonClicked && showResults && showNokkelhulletResults ? (
    <div style={{ backgroundColor: '#daecd8' }}>
    <ResultNokkelhulletFulfilled className="container nøkkelhullet-food-result-container">

    </ResultNokkelhulletFulfilled>
    </div>
    
  ) : null}

  {/* Negative results nøkkelhullet container */}
  {buttonClicked && !showNokkelhulletResults && showResults && (
    <div style={{ backgroundColor: '#f3b7b7' }}>
    <ResultNokkelhulletNotFulfilled 
      fett={fett} setFett={setFett}
      mettede={mettede} setMettede={setMettede}
      hvoravSukkerarter={hvoravSukkerarter} setHvoravSukkerarter={setHvoravSukkerarter}
      salt={salt} setSalt={setSalt}>
    </ResultNokkelhulletNotFulfilled>
    </div>
  )}

  {/* Spacer */}
  <div style={{ padding: "5px" }}></div>

  {/* Container for ernæringspåstander result - fulfilled */}
  {buttonClicked && showResults && (lowEnergy || lowFat || fatFree || lowSaturatedFat || saturatedFatFree || lowSugars || sugarsFree || withNoAddedSugars) ? (
    <div className={`container ernæringspåstander-food-result-container-${showErnaeringsResults ? 'true' : 'false'}`}
         style={{ backgroundColor: '#daecd8' }}>
      <ResultEfsaFulfilled
        lowEnergy={lowEnergy}
        lowFat={lowFat}
        fatFree={fatFree}
        lowSaturatedFat={lowSaturatedFat}
        saturatedFatFree={saturatedFatFree}
        lowSugars={lowSugars}
        sugarsFree={sugarsFree}
        withNoAddedSugars={withNoAddedSugars}>
      </ResultEfsaFulfilled>
    </div>
  ) : null}

  {/* Spacer */}
  <div style={{ padding: "5px" }}></div>

  {/* Container for ernæringspåstander results - Not fulfilled */}
  {buttonClicked && showResults && (!lowEnergy || !lowFat || !fatFree || !lowSaturatedFat || !saturatedFatFree || !lowSugars || !sugarsFree || !withNoAddedSugars) ? (
    <div className={`container ernæringspåstander-food-result-container-${showErnaeringsResults}`}
    style={{ backgroundColor: '#f3b7b7' }}
        >
      <ResultEfsaNotFulfilled
        lowEnergy={lowEnergy}
        lowFat={lowFat}
        fatFree={fatFree}
        lowSaturatedFat={lowSaturatedFat}
        saturatedFatFree={saturatedFatFree}
        lowSugars={lowSugars}
        sugarsFree={sugarsFree}
        withNoAddedSugars={withNoAddedSugars}>
      </ResultEfsaNotFulfilled>
    </div>
  ) : null}

  {/* Spacer */}
  <div style={{ padding: "5px" }}></div>

  {/* Show "Product Buttons" */}
  {/*{buttonClicked && showResults && (<ProductButtons />)}*/}
</div>

      
    </div>
  );
};

export default Melk11b;