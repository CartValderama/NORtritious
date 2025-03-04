// Selector for health claims that need to meet specific requirements
// High_fibre, low_sugar, sugar_free, low_salt, low_sat_fat has been implemented,
// TODO: high_saturated_fat
const selectMeetsReqs = [
    {
        value: "Barley grain fibre",
        label: "Barley grain fibre (høy i fiber)",
        requirement: "high_fibre",
    },
    {
        value: "Oat grain fibre",
        label: "Oat grain fibre (høy i fiber)",
        requirement: "high_fibre",
    },
    {
        value: "Rye Fibre",
        label: "Rye Fibre (høy i fiber)",
        requirement: "high_fibre",
    },
    {
        value: "Sugar Beet Fibre",
        label: "Sugar Beet Fibre (høy i fiber)",
        requirement: "high_fibre",
    },
    {
        value: "Wheat Bran Fibre",
        label: "Wheat Bran Fibre (høy i fiber)",
        requirement: "high_fibre",
    },
    {
        value: "Beta-glucan",
        label: "Beta-glucan (lav sukkerinnhold)",
        requirement: "low_sugar",   
    },
    {
        value: "Sugar-Free Chewing Gum",
        label: "Sugar-Free Chewing Gum (fritt for sukkerinnhold)",
        requirement: "sugars_free",
    },
    {
        value: "Sugar-Free Chewing Gum with Carbamide",
        label: "Sugar-Free Chewing Gum with Carbamide (fritt for sukkerinnhold)",
        requirement: "sugars_free",
    },
    {
        value: "Foods with a low or reduced content of sodium",
        label: "Foods with a low or reduced content of sodium (lav/redusert saltinnhold)",
        requirement: "low_salt",
    },
    {
        value: "Foods with a low or reduced content of saturated fatty acids",
        label: "Foods with a low or reduced content of saturated fatty acids (lav/redusert innhold av mettet fett)",
        requirement: "low_saturated_fat",
    },
    {
        value: "Monounsaturated and/or polyunsaturated fatty acids",
        label: "Monounsaturated and/or polyunsaturated fatty acids (høy i mettet fett)",
        requirement: "high_saturated_fat",
    },
    {
        value: "Oleic acid",
        label: "Oleic acid (høy i mettet fett)",
        requirement: "high_saturated_fat",
    }
   
];
export default selectMeetsReqs;