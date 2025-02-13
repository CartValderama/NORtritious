/* -----------------------------------------------
--- CLAIM FUNCTIONS ---  
--------------------------------------------------*/
// Claim: 1. Low energy
export const claimLowEnergy = function(energyKcal, energyKj, foodType, energyUnit) {
    if (energyUnit === "energikcal"){
        return helpLowEnergyKcal(energyKcal, foodType)
    } 
    else {
        return helpLowEnergyKj(energyKj, foodType)
    }   
}

// Claim: 2. Energy reduced -> !! Not able to implement !! 

// Claim: 3. Energy free 
export const claimEnergyFree = function(energyKcal, energyKj, energyUnit) {
    if (energyUnit === "energikcal") {
        return helpEnergyFreeKcal(energyKcal)
    }
    else {
        return helpEnergyFreeKj(energyKj)
    }
}

// Clam: 4. Low fat
export const claimLowFat = function(foodType, fat) {
    if (foodType === "solid"){
        if (fat <= 3){
            return true
        }
        else {
            return false 
        }
    }
    else {
        if (fat <= 1.5) {
            return true
        }
        else {
            return false 
        }
    }
}

// Claim: 5. Fat-free
export const claimFatFree = function(fat) {
    if (fat <= 0.5){
        return true
    }
    else {
        return false 
    }
}

// Claim: 6. Low saturated fat 
export const claimLowSaturatedFat = function(foodType, energyUnit, saturatedFat, energyKcal, energyKj){
    //const tenPercentEnergy = energy * 0.9
    const saturatedFatKcal = saturatedFat * 9 
    const saturatedFatKj = saturatedFat * 38

    if (energyUnit === "energikcal"){
        return helpLowSaturatedFat(foodType, saturatedFat, saturatedFatKcal, (energyKcal*0.9))
    }
    else {
        return helpLowSaturatedFat(foodType, saturatedFat, saturatedFatKj, (energyKj*0.9))
    }
}

// Claim: 7. Saturated fat-free
export const claimSaturatedFatFree = function(saturaredFat){
    if (saturaredFat <= 0.1) {
        return true 
    }
    else{
        return false 
    }
}

// Claim: 8. Low sugars 
export const claimLowSugars = function(foodType, naturalSugars, addedSugars){
    const sugars = parseFloat(naturalSugars) + parseFloat(addedSugars)
    if (foodType === "solid" && sugars <= 5) {
        return true;
    } else if (foodType === "liquid" && sugars <= 2.5) {
        return true;
    }
    return false;
}

// Claim: 9. Sugars-free
export const claimSugarsFree = function(naturalSugars, addedSugars){
    const sugars = parseFloat(naturalSugars) + parseFloat(addedSugars)
    if (sugars <= 0.5){
        return true
    }
    else {
        return false 
    }
}

// Claim: 10. With no added sugars
export const ClaimWithNoAddedSugars = function(carbohydrate, addedSugars){
    if (carbohydrate > 0 && addedSugars ==="0"){
        return true
    }
    else {
        return false
    }
}

// Claim: 18: High Fibre
export const claimHighFibre = function(kostfiber, fibreUnit, energyUnit){
    if (fibreUnit === "g" && energyUnit === "kcal"){
        if (kostfiber >= 6){
            return true
        } else if (kostfiber >= 3){
            return true;
        }
        return false
    }
}

//Claim: 19: Proteinsource
export const claimSourceOfProtein = function(energy){
    if (energy >= 12){
        return true;
    }else 
        return false;
}

// Claim 23.1: Reduced [Fat]
export const claimReducedFat = function(fat){
    if(fat >= (3 - (fat * 0.3))){ return true }
    else { return false }
}

// Claim 23.2 reduced [saturatedFat]
export const claimReducedSaturatedFat = function(saturaredFat){
    if (saturaredFat <= (1.5 - (saturaredFat * 0.3))) { return true }
    else { return false }
}

// Claim 23.2 reduced [salt]
export const claimReducedSalt = function(salt){
    if (salt <= (0.2 - (salt * 0.25))) { return true }
    else { return false }
}


/* ----------------------------------------------
--- HELP FUNCTIONS --- 
----------------------------------------------*/
// Claim: Low energy
function helpLowEnergyKcal(energy, foodType) {
    console.log("ENERGI: ", energy)
    if (foodType === "liquid") {
        if (energy <= 20){ 
            return true 
        }
        else { 
            return false 
        }
    }
    else {
        if (energy <= 40){
            return true
        }
        else {
            return false
        }
    }
}

function helpLowEnergyKj(energy, foodType){
    if (foodType === "liquid") {
        if (energy <= 80){ 
            return true 
        }
        else { 
            return false 
        }
    }
    else {
        if (energy <= 170){
            return true
        }
        else {
            return false
        }
    }
}

// Claim: Energy free
function helpEnergyFreeKcal(energy){
    if (energy <= 4){ 
        return true 
    }
    else { 
        return false 
    }
}

function helpEnergyFreeKj(energy){
    if (energy <= 17){ 
        return true 
    }
    else { 
        return false 
    }
}

// Claim: Low saturated fat 
function helpLowSaturatedFat(foodType, saturatedFat, saturatedFatEnergy, tenPercentEnergy){
    if(foodType === "solid"){
        if (saturatedFat <= 1.5 && saturatedFatEnergy <= tenPercentEnergy){
            return true
        }
        else {
            return false
        }
    }
    else {
        if (saturatedFat <= 0.75 && saturatedFatEnergy <= tenPercentEnergy) {
            return true
        }
        else {
            return false 
        }
    }
}