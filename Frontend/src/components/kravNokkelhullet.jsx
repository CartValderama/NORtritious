const kategorier = {
    'Kategori1': {
        fett: "tilsatt fett høyst 3 g/100 g",
        mettede: "tilsatt fett kan høyst inneholde 20 % mettet fett",
        sukkerarter: null,
        tilsattSukkerarter: "tilsatte sukkerarter høyst 1 g/100 g",
        kostfiber: null,
        salt: "salt høyst 0,5 g/100 g"
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
}

export { kategorier };