import React from "react";
import { useState, useEffect } from "react"; // import the useState and useeffect hook.
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons"; // import an icon.

import { faSave, faShare, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // import FontAwesomeIcon component.
import Tooltip from "@mui/material/Tooltip"; // import Tooltip component.
import keyholeLgog from "../../../img/circle-keyhole-logo.png"; // import an image
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"; // import an icon
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons"; // import an icon
import Select from "react-select"; // import Select component

import * as ProductService from "../../../products/ProductService";

// Imports for necessary claim check components, used in all categories 
import * as ResultComponents from "../../ResultComponents.jsx";
import * as Check from "../../NutritionClaimCheck.jsx"

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ResultEfsaFullfilled og notFullfilled må implementers 
import {ResultEfsaFulfilled, ResultEfsaHealthClaims, ResultEfsaNotFulfilled} from '../../ResultEfsaClaims.jsx'; // EFSA claims

import HealthClaimInputs from "../../../components/HealthClaimInputs"; // import HealthClaimInputs component

// This component is called Kategori2
const Kategori2 = ({   product, 
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
  meetsReqClaims, 
  selectedMeetsReqs,
  selectVitamins,
  selectMinerals,
  selectOthers,
  filteredOptions,
  vitaminInputValues,
  mineralInputValues,
  otherInputValues,
  meetsReqsInputValues,
  vitaminUnits,
  mineralUnits,  
  handleVitaminChange,
  handleMineralChange,
  handleOtherChange,
  handleVitaminInputChange,
  handleMineralInputChange,
  handleOtherInputChange,
  handleMeetsReqsInputChange,
  handleVitaminUnitChange,
  handleMineralUnitChange,
  setSelectedMeetsReqs,
  openInfoLink,
  popover  }) => {

  // State variables for showing results and empty result message
  const [showNokkelhulletResults, setShowNokkelhulletResults] = useState(null);
  const [showErnaeringsResults, setShowErnaeringsResults] = useState("");
  const [showHelsepåstander, setShowHelsepåstander] = useState(null);
  const [showEmptyResult, setShowEmptyResult] = useState(""); // initialize state variable for showing empty result message.

  //state variable to store the user's food type selection (solid or liquid) and the low sugars claim result
  const [foodType, setFoodType] = useState("");

  // state variables for nutrition claim check functions
  const [lowEnergy, setLowEnergy] = useState(null); 
  const [lowSugars, setLowSugars] = useState(null);
  const [sugarsFree, setSugarsFree] = useState(null);
  const [withNoAddedSugars, setWithNoAddedSugars] = useState(null);


  // State variable for tracking if the button is clicked
  const [buttonClicked, setButtonClicked] = useState(false);

  // useEffect hook for checking the conditions for the nutrition claims when button is clicked
  useEffect(() => {
    if (buttonClicked) {
      if (
        lowEnergy && 
        lowSugars &&
        withNoAddedSugars &&
        sugarsFree &&
        withNoAddedSugars 
        //containsNaturallyOccurringSugars &&
      ) {
        setShowErnaeringsResults("all");
      } else if (
        !lowEnergy &&
        !lowSugars &&
        !sugarsFree &&
        !withNoAddedSugars 
        //!containsNaturallyOccurringSugars &&
      ) {
        setShowErnaeringsResults("none");
      } else {
        setShowErnaeringsResults("some");
      }
    }
  }, [
    lowEnergy, 
    lowSugars,
    sugarsFree,
    withNoAddedSugars,
    //containsNaturallyOccurringSugars,
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

  // initialize State variables for handling input fields and validation errors
  const [energikj, setEnergikj] = useState(false);
  const [energikcal, setEnergikcal] = useState(false);

  const [fett, setFett] = useState(false);
  const [mettede, setMettede] = useState(false);
  const [karbohydrat, setKarbohydrat] = useState(false);
  const [naturligSukker, setNaturligSukker] = useState(false);

  const [hvoravSukkerarter, setHvoravSukkerarter] = useState(false);
  const [kostfiber, setKostfiber] = useState(false);
  const [protein, setProtein] = useState(false);
  const [salt, setSalt] = useState(false);

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
      }, [lowEnergy, lowSugars, sugarsFree, withNoAddedSugars]);
  

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
      nutrition.mettede !== "" &&
      nutrition.karbohydrat !== "" &&
      nutrition.naturligSukker !== "" &&
      nutrition.hvoravSukkerarter !== "" &&
      nutrition.kostfiber !== "" &&
      nutrition.protein !== "" &&
      nutrition.salt !== ""
    ) {
      // If all requirements are met, display the nutrition results
      setShowNokkelhulletResults(true);
      // Calls function from calculator, sets nokkelhullet to true
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
      setMettede(false);
      setKarbohydrat(false);
      setNaturligSukker(false);

      setHvoravSukkerarter(false);
      setKostfiber(false);
      setProtein(false);
      setSalt(false);

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
        setFett(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);
        setShowEmptyResult(true);
      } else {
        setFett(false);
      }

      if (nutrition.mettede === "" || nutrition.mettede < 0) {
        setMettede(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);
        setShowEmptyResult(true);
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

      if (
        nutrition.hvoravSukkerarter === "" ||
        nutrition.hvoravSukkerarter < 0
      ) {
        setHvoravSukkerarter(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);
        setShowEmptyResult(true);
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
        setSalt(true);
        setShowNokkelhulletResults(false);
        hasNokkelhullet(false);
        setShowEmptyResult(true);
      } else {
        setSalt(false);
      }
    }

    /*
    ----------------------------------------------------
    -- CLAIM CHECKS -- 
    ----------------------------------------------------
    */
    // Claim: "LOW ENERGY", "LOW SUGARS", "SUGARS-FREE", and "WITH NO ADDED SUGARS"
    setLowEnergy(Check.claimLowEnergy(nutrition.energikcal, nutrition.energikj, foodType, selectsPart))
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
                  {/* If either the energy (kJ) or energy (kcal) value is missing, an exclamation icon is displayed */}
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
                    {/* This dropdown allows the user to select the unit for energy */}
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
              <tr className={fett ? "alert-box" : null}>
                <th scope="row" className="table-font">
                  {fett ? (
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
              <tr className={mettede ? "alert-box" : null}>
                <th scope="row" className="table-font">
                  {mettede ? (
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
              <tr className={hvoravSukkerarter ? "alert-box" : null}>
                <th scope="row" className="table-font">
                  {hvoravSukkerarter ? (
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
              <tr className={salt ? "alert-box" : null}>
                <th scope="row" className="table-font">
                  {salt ? (
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
                <td>
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

        <HealthClaimInputs 
            selectVitamins={selectVitamins}
            selectMinerals={selectMinerals}
            selectOthers={selectOthers}
            filteredOptions={filteredOptions}
            selectedVitamins={selectedVitamins}
            selectedMinerals={selectedMinerals}
            selectedOthers={selectedOthers}
            selectedMeetsReqs={selectedMeetsReqs}
            vitaminInputValues={vitaminInputValues}
            mineralInputValues={mineralInputValues}
            otherInputValues={otherInputValues}
            meetsReqsInputValues={meetsReqsInputValues}
            vitaminUnits={vitaminUnits}
            mineralUnits={mineralUnits}
            handleVitaminChange={handleVitaminChange}
            handleMineralChange={handleMineralChange}
            handleOtherChange={handleOtherChange}
            handleVitaminInputChange={handleVitaminInputChange}
            handleMineralInputChange={handleMineralInputChange}
            handleOtherInputChange={handleOtherInputChange}
            handleMeetsReqsInputChange={handleMeetsReqsInputChange}
            handleVitaminUnitChange={handleVitaminUnitChange}
            handleMineralUnitChange={handleMineralUnitChange}
            setSelectedMeetsReqs={setSelectedMeetsReqs}
            openInfoLink={openInfoLink}
            popover={popover} />


        {/* Button that submits the form and calls the onClick function when clicked */}
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
        {/* container for "Nøkkelhullet" results  */}
        {showNokkelhulletResults && (
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
                <p>
                  Det er ingen vilkår som gjelder for å innfri nøkkelhullet for
                  denne matvaregruppen.
                </p>
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
        )}

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
                {showEmptyResult ? (
                  <p>** Obligatoriske næringsverdier kan ikke være tomme.</p>
                ) : null}
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

export default Kategori2;
