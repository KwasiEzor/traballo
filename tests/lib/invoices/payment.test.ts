import { describe, expect, it } from "vitest";
import { paymentDetails } from "@/lib/invoices/payment";

describe("paymentDetails", () => {
  it("groups the IBAN by four and uses the invoice number as reference", () => {
    expect(
      paymentDetails({ iban: "fr76 3000 6000 0112 3456 7890 189", invoiceNumber: "F-2026-0042" })
    ).toEqual({ iban: "FR76 3000 6000 0112 3456 7890 189", reference: "F-2026-0042" });
    expect(
      paymentDetails({ iban: "BE68539007547034", invoiceNumber: "F-1" })?.iban
    ).toBe("BE68 5390 0754 7034");
  });

  it("gives nothing without a plausible IBAN", () => {
    expect(paymentDetails({ iban: null, invoiceNumber: "F-1" })).toBeNull();
    expect(paymentDetails({ iban: "", invoiceNumber: "F-1" })).toBeNull();
    expect(paymentDetails({ iban: "pas un iban", invoiceNumber: "F-1" })).toBeNull();
    expect(paymentDetails({ iban: "FR76<script>", invoiceNumber: "F-1" })).toBeNull();
  });
});
