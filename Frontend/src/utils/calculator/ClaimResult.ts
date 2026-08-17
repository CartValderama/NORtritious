export interface ClaimConfigEntry {
  name: string;
  metText: string;
  notMetLines: string[];
}

// Exactly 7 claims in active use (mirrors CheckEfsaNutritionClaims in
// CalculatorService.cs) — energy, plain fibre (no increased/reduced
// variants), and sugar. The other claims (fat, protein, sodium, light/lite,
// plus the fibre variants) are recoverable from git history if that scope
// expands again.
export const CLAIMS_CONFIG: Record<string, ClaimConfigEntry> = {
  lowEnergy: {
    name: 'Lavt Energiinnhold',
    metText: 'Dette produktet inneholder høyst 40 kcal / 170 kJ per 100 g for næringsmidler i fast form, eller høyst 20 kcal / 80 kJ per 100 ml for næringsmidler i flytende form.',
    notMetLines: [
      'For faste næringsmidler, må energinivået være høyst 40 kcal / 170 kJ per 100 g.',
      'For flytende næringsmidler, må energinivået være høyst 20 kcal / 80 kJ per 100 ml.',
    ],
  },
  energyFree: {
    name: 'Energifri',
    metText: 'Dette produktet inneholder høyst 4 kcal / 17 kJ per 100 g.',
    notMetLines: [
      'Energinivået må være høyst 4 kcal / 17 kJ per 100 g.',
    ],
  },
  highFibre: {
    name: 'Høyt Fiberinnhold',
    metText: 'Dette produktet inneholder minst 6 g fiber per 100 g eller minst 3 g fiber per 100 kcal.',
    notMetLines: [
      'Kravet er minst 6 g fiber per 100 g, eller minst 3 g fiber per 100 kcal (husk å bruke kcal som energienhet).',
    ],
  },
  sourceOfFibre: {
    name: 'Kostfiberkilde',
    metText: 'Dette produktet inneholder minst 3 g kostfiber per 100 g, eller minst 1,5 g kostfiber per 100 kcal.',
    notMetLines: [
      'Kravet er minst 3 g kostfiber per 100 g, eller minst 1,5 g kostfiber per 100 kcal.',
    ],
  },
  lowSugars: {
    name: 'Lavt sukkerinnhold',
    metText: 'Dette produktet inneholder høyst 5 g sukkerarter per 100 g (fast form) eller høyst 2,5 g per 100 ml (flytende form).',
    notMetLines: [
      'For faste næringsmidler må sukkerinnholdet være høyst 5 g per 100 g.',
      'For flytende næringsmidler må sukkerinnholdet være høyst 2,5 g per 100 ml.',
    ],
  },
  sugarsFree: {
    name: 'Sukkerfri',
    metText: 'Dette produktet inneholder høyst 5 g sukkerarter per 100 g eller 100 ml.',
    notMetLines: [
      'Kravet er høyst 5 g sukkerarter per 100 g eller 100 ml.',
    ],
  },
  withNoAddedSugars: {
    name: 'Uten tilsatt sukker',
    metText: 'Dette produktet inneholder ingen tilsatte sukkerarter eller andre søtende ingredienser.',
    notMetLines: [
      'Produktet må ikke inneholde tilsatte mono- eller disakkarider eller andre næringsmidler brukt for søtningsformål.',
    ],
  },
};
