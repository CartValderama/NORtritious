const kategorier = {
    'Kategori1': {
        fett: "tilsatt fett høyst 3 g/100 g",
        mettede: "tilsatt fett kan høyst inneholde 20 % mettet fett",
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 1 g/100 g",
        kostfiber: null,
        salt: "salt høyst 0,5 g/100 g"
    },
    'Kategori3': {
        fett: null,
        mettede: "mettede fettsyrer høyst 10 g/100 g",
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: null
    },
    'Kategori4': {
        fett: null,
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: "kostfiber minst 6 g/100 g",
        salt: null
    },
    'Kategori5': {
        fett: null,
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: "kostfiber minst 3 g/100 g",
        salt: null
    },
    'Kategori6': {
        fett: "fett høyst 8 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 13 g/100 g",
        tilsattSukkerarter: "hvorav tilsatte sukkerarter høyst 9 g/100 g",
        kostfiber: "kostfiber minst 6 g/100 g",
        salt: "salt høyst 1,0 g/100 g"
    },
    'Kategori7': {
        fett: "fett høyst 4 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: "kostfiber minst 1 g/100 g",
        salt: "salt høyst 0,3 g/100 g"
    },
    'Kategori8a': {
        fett: "fett høyst 7 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: "kostfiber minst 5 g/100 g",
        salt: "salt høyst 1,0 g/100 g"
    },
    'Kategori8b': {
        fett: "fett høyst 7 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: "kostfiber minst 6 g/100 g",
        salt: "salt høyst 1,2 g/100 g"
    },
    'Kategori9': {
        fett: "fett høyst 7 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: "kostfiber minst 6 g/100 g",
        salt: "salt høyst 1,3 g/100 g"
    },
    'Kategori10': {
        fett: null,
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: "kostfiber minst 6 g/100 g",
        salt: "salt høyst 0,1 g/100 g"
    },
    'Melk11a': {
        fett: "fett høyst 0,7 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: null
    },
    'Melk11b': {
        fett: "fett høyst 1,5 g/100 g",
        mettede: "mettede fettsyrer høyst 33 % av fett",
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 0,1 g/100 g"
    },
    'Melk12a': {
        fett: "fett høyst 1,5 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: null
    },
    'Melk12b': {
        fett: "fett høyst 1,5 g/100 g",
        mettede: "mettede fettsyrer høyst 33 % av fett",
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 0,1 g/100 g"
    },
    'Melk13a': {
        fett: "fett høyst 1,5 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 4 g/100 g",
        kostfiber: null,
        salt: null
    },
    'Melk13b': {
        fett: "fett høyst 1,5 g/100 g",
        mettede: "mettede fettsyrer høyst 33 % av fett",
        sukkerarter: "sukkerarter høyst 8 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 0,1 g/100 g"
    },
    'Melk14a': {
        fett: "fett høyst 5 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: null
    },
    'Melk14b': {
        fett: "fett høyst 5 g/100 g",
        mettede: "mettede fettsyrer høyst 33 % av fett",
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 0,3 g/100 g"
    },
    'Melk15a': {
        fett: "fett høyst 5 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 0,8 g/100 g"
    },
    'Melk15b': {
        fett: "fett høyst 5 g/100 g",
        mettede: "mettede fettsyrer høyst 33 % av fett",
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 0,8 g/100 g"
    },
    'Kategori16': {
        fett: "fett høyst 17 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 1,6 g/100 g"
    },
    'Kategori17': {
        fett: "fett høyst 17 g/100 g",
        mettede: "mettede fettsyrer høyst 20 % av fett",
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 1,5 g/100 g"
    },
    'Kategori18': {
        fett: "fett høyst 5 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 1 g/100 g",
        kostfiber: null,
        salt: "salt høyst 0,9 g/100 g"
    },
    'Kategori19': {
        fett: "fett høyst 80 g/100 g",
        mettede: "mettede fettsyrer høyst 33 % av fett",
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: null
    },
    'Kategori20': {
        fett: null,
        mettede: "mettede fettsyrer høyst 20 % av fett",
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 1,0 g/100 g"
    },
    'Kategori22a': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 1,5 g/100 g"
    },
    'Kategori22b': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 2,5 g/100 g"
    },
    'Kategori22c': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 3,0 g/100 g"
    },
    'Kategori22d': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 3,0 g/100 g"
    },
    'Kategori23': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: null
    },
    'Kategori24a1': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 3 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 1,0 g/100 g"
    },
    'Kategori24a2': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 3 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 0,5 g/100 g"
    },
    'Kategori24b1': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100g",
        kostfiber: null,
        salt: "salt høyst 1,7 g/100 g"
    },
    'Kategori24b2': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100g",
        kostfiber: null,
        salt: "salt høyst 2,0 g/100 g"
    },
    'Kategori24b3': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100g",
        kostfiber: null,
        salt: "salt høyst 2,2 g/100 g"
    },
    'Kategori24b4': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: "sukkerarter høyst 3 g/100 g",
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100g",
        kostfiber: null,
        salt: "salt høyst 1,0 g/100 g"
    },
    'Kategori24c1': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100g",
        kostfiber: null,
        salt: "salt høyst 2,0 g/100 g"
    },
    'Kategori24c2': {
        fett: "fett høyst 10 g/100 g",
        mettede: null,
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100g",
        kostfiber: null,
        salt: "salt høyst 2,5 g/100 g"
    },
    'Kategori26': {
        fett: null,
        mettede: "mettede fettsyrer høyst 1,8 g/100 g",
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100g",
        kostfiber: null,
        salt: "salt høyst 0,8 g/100 g"
    },
    'Kategori27': {
        fett: null,
        mettede: "mettede fettsyrer høyst 1,5 g/100 g",
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100g",
        kostfiber: null,
        salt: "salt høyst 0,8 g/100 g"
    },
    'Kategori28': {
        fett: null,
        mettede: "mettede fettsyrer høyst 2,0 g/100 g",
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100g",
        kostfiber: null,
        salt: "salt høyst 1,0 g/100 g"
    },
    'Kategori29': {
        fett: null,
        mettede: "mettede fettsyrer høyst 2,0 g/100 g",
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100g",
        kostfiber: null,
        salt: "salt høyst 0,9 g/100 g"
    },
    'Kategori30': {
        fett: null,
        mettede: "mettede fettsyrer høyst 1,5 g/100 g",
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100g",
        kostfiber: null,
        salt: "salt høyst 0,8 g/100 g"
    },
    'Kategori25a': {
        fett: "fett høyst 10 g/100 g",
        mettede: "mettede fettsyrer høyst 3,5 g/100 g",
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100 g",
        kostfiber: null,
        salt: "salt høyst 1,5 g/100 g"
    },
    'Kategori25b': {
        fett: "fett høyst 10 g/100 g",
        mettede: "mettede fettsyrer høyst 3,5 g/100 g",
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 3 g/100 g",
        kostfiber: null,
        salt: "salt høyst 1,0 g/100 g"
    },
    'Kategori31': {
        fett: null,
        mettede: "mettede fettsyrer høyst 20 % av fett",
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 0,8 g/100 g"
    },
    'Kategori32': {
        fett: "fett høyst 5 g/100 g",
        mettede: "mettede fettsyrer høyst 33 % av fett",
        sukkerarter: "sukkerarter høyst 5 g/100 g",
        tilsattSukkerarter: null,
        kostfiber: null,
        salt: "salt høyst 0,8 g/100 g"
    },
}

// Numeric thresholds per category — mirrors backend NokkelhulletThresholds.
// maxFat, maxSatFat, maxTotalSugars, maxAddedSugars, maxSalt: upper limits (fail if value EXCEEDS)
// minFibre: lower limit (fail if value is BELOW)
// dynamicSatFatFraction: saturated fat must be <= fat * fraction
export const nokkelhulletThresholds = {
    'Kategori1':    { maxFat: 3,    dynamicSatFatFraction: 0.2,  maxAddedSugars: 1,  maxSalt: 0.5 },
    'Kategori3':    { maxSatFat: 10 },
    'Kategori4':    { minFibre: 6 },
    'Kategori5':    { minFibre: 3 },
    'Kategori6':    { maxFat: 8,    maxTotalSugars: 13, maxAddedSugars: 9,  minFibre: 6,  maxSalt: 1.0 },
    'Kategori7':    { maxFat: 4,    maxTotalSugars: 5,                      minFibre: 1,  maxSalt: 0.3 },
    'Kategori8a':   { maxFat: 7,    maxTotalSugars: 5,                      minFibre: 5,  maxSalt: 1.0 },
    'Kategori8b':   { maxFat: 7,    maxTotalSugars: 5,                      minFibre: 6,  maxSalt: 1.2 },
    'Kategori9':    { maxFat: 7,    maxTotalSugars: 5,                      minFibre: 6,  maxSalt: 1.3 },
    'Kategori10':   {                                                        minFibre: 6,  maxSalt: 0.1 },
    'Melk11a':      { maxFat: 0.7 },
    'Melk11b':      { maxFat: 1.5,  dynamicSatFatFraction: 0.33, maxTotalSugars: 5,            maxSalt: 0.1 },
    'Melk12a':      { maxFat: 1.5 },
    'Melk12b':      { maxFat: 1.5,  dynamicSatFatFraction: 0.33, maxTotalSugars: 5,            maxSalt: 0.1 },
    'Melk13a':      { maxFat: 1.5,  maxAddedSugars: 4 },
    'Melk13b':      { maxFat: 1.5,  dynamicSatFatFraction: 0.33, maxTotalSugars: 8,            maxSalt: 0.1 },
    'Melk14a':      { maxFat: 5 },
    'Melk14b':      { maxFat: 5,    dynamicSatFatFraction: 0.33, maxTotalSugars: 5,            maxSalt: 0.3 },
    'Melk15a':      { maxFat: 5,    maxTotalSugars: 5,                                         maxSalt: 0.8 },
    'Melk15b':      { maxFat: 5,    dynamicSatFatFraction: 0.33, maxTotalSugars: 5,            maxSalt: 0.8 },
    'Kategori16':   { maxFat: 17,                                                              maxSalt: 1.6 },
    'Kategori17':   { maxFat: 17,   dynamicSatFatFraction: 0.2,                               maxSalt: 1.5 },
    'Kategori18':   { maxFat: 5,    maxAddedSugars: 1,                                        maxSalt: 0.9 },
    'Kategori19':   { maxFat: 80,   dynamicSatFatFraction: 0.33 },
    'Kategori20':   {               dynamicSatFatFraction: 0.2,                               maxSalt: 1.0 },
    'Kategori22a':  { maxFat: 10,   maxTotalSugars: 5,                                        maxSalt: 1.5 },
    'Kategori22b':  { maxFat: 10,   maxTotalSugars: 5,                                        maxSalt: 2.5 },
    'Kategori22c':  { maxFat: 10,   maxTotalSugars: 5,                                        maxSalt: 3.0 },
    'Kategori22d':  { maxFat: 10,   maxTotalSugars: 5,                                        maxSalt: 3.0 },
    'Kategori23':   { maxFat: 10 },
    'Kategori24a1': { maxFat: 10,   maxTotalSugars: 3,                                        maxSalt: 1.0 },
    'Kategori24a2': { maxFat: 10,   maxTotalSugars: 3,                                        maxSalt: 0.5 },
    'Kategori24b1': { maxFat: 10,   maxAddedSugars: 3,                                        maxSalt: 1.7 },
    'Kategori24b2': { maxFat: 10,   maxAddedSugars: 3,                                        maxSalt: 2.0 },
    'Kategori24b3': { maxFat: 10,   maxAddedSugars: 3,                                        maxSalt: 2.2 },
    'Kategori24b4': { maxFat: 10,   maxTotalSugars: 3, maxAddedSugars: 3,                     maxSalt: 1.0 },
    'Kategori24c1': { maxFat: 10,   maxAddedSugars: 3,                                        maxSalt: 2.0 },
    'Kategori24c2': { maxFat: 10,   maxAddedSugars: 3,                                        maxSalt: 2.5 },
    'Kategori25a':  { maxFat: 10,   maxSatFat: 3.5,    maxAddedSugars: 3,                     maxSalt: 1.5 },
    'Kategori25b':  { maxFat: 10,   maxSatFat: 3.5,    maxAddedSugars: 3,                     maxSalt: 1.0 },
    'Kategori26':   {               maxSatFat: 1.8,    maxAddedSugars: 3,                     maxSalt: 0.8 },
    'Kategori27':   {               maxSatFat: 1.5,    maxAddedSugars: 3,                     maxSalt: 0.8 },
    'Kategori28':   {               maxSatFat: 2.0,    maxAddedSugars: 3,                     maxSalt: 1.0 },
    'Kategori29':   {               maxSatFat: 2.0,    maxAddedSugars: 3,                     maxSalt: 0.9 },
    'Kategori30':   {               maxSatFat: 1.5,    maxAddedSugars: 3,                     maxSalt: 0.8 },
    'Kategori31':   {               dynamicSatFatFraction: 0.2,  maxTotalSugars: 5,           maxSalt: 0.8 },
    'Kategori32':   { maxFat: 5,    dynamicSatFatFraction: 0.33, maxTotalSugars: 5,           maxSalt: 0.8 },
};

export { kategorier };