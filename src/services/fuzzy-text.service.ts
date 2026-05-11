function normalizeBasic(text?: string): string {
  return (text || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function tokenize(text?: string): string[] {
  return normalizeBasic(text)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function levenshtein(a: string, b: string): number {
  const aa = normalizeBasic(a);
  const bb = normalizeBasic(b);

  const matrix: number[][] = Array.from({ length: aa.length + 1 }, () =>
    Array(bb.length + 1).fill(0)
  );

  for (let i = 0; i <= aa.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= bb.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= aa.length; i += 1) {
    for (let j = 1; j <= bb.length; j += 1) {
      const cost = aa[i - 1] === bb[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[aa.length][bb.length];
}

const SAFE_SHORT_FUZZY_TARGETS = new Set([
  "caro",
  "casa",
  "cable",
  "noche",
  "precio",
  "paquete",
  "instalacion"
]);

export function isFuzzyMatch(word: string, target: string, maxDistance = 1): boolean {
  const a = normalizeBasic(word);
  const b = normalizeBasic(target);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  const lengthGap = Math.abs(a.length - b.length);
  if (lengthGap > maxDistance) {
    return false;
  }

  const distance = levenshtein(a, b);

  if (a.length <= 4 || b.length <= 4) {
    if (!SAFE_SHORT_FUZZY_TARGETS.has(b)) {
      return false;
    }

    return distance === 1 && a[0] === b[0];
  }

  return distance <= maxDistance;
}

export function containsFuzzyWord(
  text: string | undefined,
  targets: string[],
  maxDistance = 1
): boolean {
  const words = tokenize(text);

  for (const word of words) {
    for (const target of targets) {
      if (isFuzzyMatch(word, target, maxDistance)) {
        return true;
      }
    }
  }

  return false;
}