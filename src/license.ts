const SLUG = 'comic-reference-sheet-board';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
export const CHECKOUT_URL = `https://api.sociobot.in/api/v1/products/${SLUG}/checkout`;

type Verdict = { valid: boolean; checkedAt: number };

export function captureLicense(): string | null {
  const url = new URL(location.href);
  const incoming = url.searchParams.get('license');
  if (incoming) {
    localStorage.setItem(TOKEN_KEY, incoming);
    url.searchParams.delete('license');
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }
  return incoming || localStorage.getItem(TOKEN_KEY);
}

export function cachedUnlock(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  try { return Boolean((JSON.parse(localStorage.getItem(VERDICT_KEY) || '') as Verdict).valid); }
  catch { return false; }
}

export async function verifyLicense(token: string, force = false): Promise<boolean> {
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as Verdict | null;
    if (!force && cached && Date.now() - cached.checkedAt < 86_400_000) return cached.valid;
  } catch { /* recheck malformed cache */ }
  const endpoint = `https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`;
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error('License service unavailable');
  const result = await response.json() as { valid: boolean };
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
  return result.valid;
}

export async function restoreLicense(token: string): Promise<boolean> {
  localStorage.setItem(TOKEN_KEY, token.trim());
  return verifyLicense(token.trim(), true);
}
