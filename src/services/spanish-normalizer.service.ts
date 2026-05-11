export function normalizeSpanishText(messageText?: string): string {
  if (!messageText) {
    return "";
  }

  let text = messageText.toLowerCase().trim();

  // Remove accents
  text = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Common shorthand / typo normalization
  text = text
    .replace(/\bola\b/g, "hola")
    .replace(/\bbnas\b/g, "buenas")
    .replace(/\binfo\b/g, "informacion")
    .replace(/\bcam\b/g, "camaras")
    .replace(/\bprexio\b/g, "precio")
    .replace(/\bpresio\b/g, "precio")
    .replace(/\bprecioo\b/g, "precio")
    .replace(/\blomo\b/g, "como")
    .replace(/\binstalacoin\b/g, "instalacion")
    .replace(/\binstalasion\b/g, "instalacion")
    .replace(/\balambrica\b/g, "alambrica")
    .replace(/\balambricas\b/g, "alambricas")
    .replace(/\binlambricas\b/g, "inalambricas")
    .replace(/\binlambrica\b/g, "inalambrica")
    .replace(/\bpa casa\b/g, "para casa")
    .replace(/\bpa negocio\b/g, "para negocio")
    .replace(/\bpa\b/g, "para")
    .replace(/\bmui\b/g, "muy")
    .replace(/\bhse\b/g, "hace")
    .replace(/\bcer\b/g, "ver");

  // Normalize "k", "ke", "q" only in common contexts
  text = text
    .replace(/\bk precio\b/g, "que precio")
    .replace(/\bqe precio\b/g, "que precio")
    .replace(/\bq precio\b/g, "que precio")
    .replace(/\bke precio\b/g, "que precio")
    .replace(/\bk cuesta\b/g, "que cuesta")
    .replace(/\bq cuesta\b/g, "que cuesta")
    .replace(/\bke cuesta\b/g, "que cuesta")
    .replace(/\bkomo\b/g, "como")
    .replace(/\bben\b/g, "ven");

  // Remove duplicate spaces
  text = text.replace(/\s+/g, " ").trim();

  return text;
}
