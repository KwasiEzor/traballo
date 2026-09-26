/** How the client pays: bank transfer to the artisan's IBAN. */
export type PaymentDetails = { iban: string; reference: string };

const IBAN = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;

/**
 * Transfer details for an invoice e-mail, or null when the artisan has no
 * plausible IBAN. Shape check only (country, check digits, length): the
 * artisan typed it in their profile. The reference is the invoice number.
 */
export function paymentDetails({
  iban,
  invoiceNumber,
}: {
  iban: string | null;
  invoiceNumber: string;
}): PaymentDetails | null {
  const compact = (iban ?? "").replace(/\s+/g, "").toUpperCase();
  if (!IBAN.test(compact)) return null;
  return {
    iban: compact.replace(/(.{4})/g, "$1 ").trim(),
    reference: invoiceNumber,
  };
}
