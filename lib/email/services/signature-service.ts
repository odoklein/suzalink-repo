import sanitizeHtml from "sanitize-html";

export const MAX_EMAIL_SIGNATURE_LENGTH = 20_000;
export const EMAIL_SIGNATURE_MARKER = "data-suzalink-signature";

export class SignatureValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignatureValidationError";
  }
}

export function sanitizeEmailSignatureHtml(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") {
    throw new SignatureValidationError("La signature HTML doit être une chaîne de caractères");
  }
  if (value.length > MAX_EMAIL_SIGNATURE_LENGTH) {
    throw new SignatureValidationError("La signature dépasse la limite de 20 000 caractères");
  }

  const clean = sanitizeHtml(value, {
    allowedTags: [
      "p", "div", "br", "strong", "b", "em", "i", "u", "a", "span",
      "ul", "ol", "li",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto", "tel"],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  }).trim();

  return clean || null;
}

export function signatureHtmlToText(html: string | null | undefined): string | null {
  if (!html) return null;

  const withLineBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n")
    .replace(/<\/div\s*>/gi, "\n")
    .replace(/<\/li\s*>/gi, "\n");

  const text = sanitizeHtml(withLineBreaks, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text || null;
}

export function appendEmailSignatureHtml(
  bodyHtml: string | undefined,
  signatureHtml: string | null | undefined,
): string | undefined {
  if (!bodyHtml || !signatureHtml) return bodyHtml;
  if (bodyHtml.includes(EMAIL_SIGNATURE_MARKER) || bodyHtml.includes(signatureHtml)) {
    return bodyHtml;
  }

  return `${bodyHtml}<div ${EMAIL_SIGNATURE_MARKER}="true"><br><br>${signatureHtml}</div>`;
}

export function appendEmailSignatureText(
  bodyText: string | undefined,
  signature: string | null | undefined,
): string | undefined {
  if (!bodyText || !signature) return bodyText;
  if (bodyText.trimEnd().endsWith(signature.trim())) return bodyText;
  return `${bodyText}\n\n${signature}`;
}
