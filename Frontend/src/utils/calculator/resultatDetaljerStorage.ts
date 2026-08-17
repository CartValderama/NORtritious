// Transport for the old calculator's "Se full beskrivelse" link: the detail
// page opens in a new tab (no shared React state), so the just-computed
// result is written to localStorage right before navigating, keyed by a
// random per-session token, and read back on the detail page's mount.
// The token makes the link unguessable — /resultat-detaljer alone (no token)
// resolves to nothing, and a link copied from a previous session stops
// working once that session generates a new token (see NutritionResult.jsx's
// old-calculator variant, which clears the old token's entry when it rotates).
const PREFIX = "resultatDetaljer:";

// Plain 10-digit number (0–4294967295, crypto's Uint32 range) instead of a
// UUID string — same unguessable purpose, shorter/plainer URL.
export const generateResultToken = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    return crypto.getRandomValues(new Uint32Array(1))[0].toString();
  }
  return Math.floor(Math.random() * 4294967296).toString();
};

const keyFor = (token: string): string => `${PREFIX}${token}`;

export const saveResultatDetaljer = (token: string, data: unknown): void => {
  try {
    localStorage.setItem(keyFor(token), JSON.stringify(data));
  } catch {
    // localStorage unavailable (private browsing, quota) — the detail page
    // just falls back to its "no data" message.
  }
};

export const loadResultatDetaljer = <T,>(token: string): T | null => {
  try {
    const raw = localStorage.getItem(keyFor(token));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const clearResultatDetaljer = (token: string): void => {
  try {
    localStorage.removeItem(keyFor(token));
  } catch {
    // ignore
  }
};
