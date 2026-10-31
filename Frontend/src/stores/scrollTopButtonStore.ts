import { create } from "zustand";

// Whether the calculator's scroll-to-top button is currently on screen.
//
// A store rather than local state for the same reason as the Kostrådene dialog: the button is
// owned by NutritionForm, while the thing that has to react to it, the toast container, is
// rendered once at the app level. Both sit in the same fixed corner, so the notice is lifted
// clear only while the button is actually there, and drops back to the corner when it goes.
interface ScrollTopButtonStore {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const useScrollTopButtonStore = create<ScrollTopButtonStore>((set) => ({
  visible: false,
  setVisible: (visible) => set({ visible }),
}));
