import { create } from "zustand";

// Just whether the Kostrådene dialog is showing. Its own store rather than a field on
// calculatorFormStore because it isn't form state: it survives Nullstill, a category change
// and loading a product, none of which have any bearing on a reference dialog being open.
//
// A store rather than local state because two unrelated places open it (the settings menu in
// NutritionForm, the word "kostrådene" in CalculatorInstructions) while the dialog itself is
// rendered once, at the page level.
interface KostradeneStore {
  showKostradene: boolean;
  openKostradene: () => void;
  closeKostradene: () => void;
}

export const useKostradeneStore = create<KostradeneStore>((set) => ({
  showKostradene: false,
  openKostradene: () => set({ showKostradene: true }),
  closeKostradene: () => set({ showKostradene: false }),
}));
