export interface ClaimConfigEntry {
  name: string;
  metText: string;
  notMetLines: string[];
}

// Scoped to energy + fiber claims for now (mirrors CheckEfsaNutritionClaims in
// CalculatorService.cs). The other claims (fat, sugar, protein, sodium, light/lite)
// are recoverable from git history if that scope expands again.
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
    metText: 'Dette produktet inneholder høyst 4 kcal / 17 kJ per 100 ml.',
    notMetLines: [
      'Energinivået må være høyst 4 kcal / 17 kJ per 100 ml. Denne påstanden gjelder bare for næringsmidler i flytende form.',
    ],
  },
  highFibre: {
    name: 'Høyt Fiberinnhold',
    metText: 'Dette produktet inneholder minst 6 g fiber per 100 g eller minst 3 g fiber per 100 kcal.',
    notMetLines: [
      'Produktet må inneholde minst 6 g fiber per 100 g eller minst 3 g fiber per 100 kcal. *Husk å benytte kcal som enhet for energi.',
    ],
  },
  sourceOfFibre: {
    name: 'Kostfiberkilde',
    metText: 'Dette produktet inneholder minst 3 g kostfiber per 100 g, eller minst 1,5 g kostfiber per 100 kcal.',
    notMetLines: [
      'For å oppfylle kravet må produktet inneholde minst 3 g kostfiber per 100 g, eller minst 1,5 g kostfiber per 100 kcal.',
    ],
  },
  increasedHighFibre: {
    name: 'Økt innhold av høyt kostfiberinnhold',
    metText: 'Dette produktet inneholder minst 7,8 g kostfiber per 100 g, eller minst 3,9 g kostfiber per 100 kcal.',
    notMetLines: [
      'Produktet må inneholde minst 7,8 g kostfiber per 100 g, eller minst 3,9 g kostfiber per 100 kcal. *Husk å benytte kcal som enhet for energi.',
    ],
  },
  reducedHighFibre: {
    name: 'Redusert innhold av høyt kostfiberinnhold',
    metText: 'Dette produktet inneholder minst 4,2 g kostfiber per 100 g, eller minst 2,1 g kostfiber per 100 kcal.',
    notMetLines: [
      'Produktet må inneholde minst 4,2 g kostfiber per 100 g, eller minst 2,1 g kostfiber per 100 kcal. *Husk å benytte kcal som enhet for energi.',
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
  withNoAddedSugars: {
    name: 'Uten tilsatt sukker',
    metText: 'Dette produktet inneholder ingen tilsatte sukkerarter eller andre søtende ingredienser.',
    notMetLines: [
      'Produktet må ikke inneholde tilsatte mono- eller disakkarider eller andre næringsmidler brukt for søtningsformål.',
    ],
  },
};
