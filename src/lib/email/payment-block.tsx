import * as React from "react";
import { Text } from "@react-email/components";
import { EMAIL_BRAND as B } from "./brand";
import type { PaymentDetails } from "@/lib/invoices/payment";

/** Bank-transfer details, for e-mails sent to the artisan's client. */
export function PaymentBlock({ payment }: { payment: PaymentDetails }) {
  return (
    <Text style={style}>
      <strong>Règlement par virement</strong>
      <br />
      IBAN : {payment.iban}
      <br />
      Référence : {payment.reference}
    </Text>
  );
}

const style: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "22px",
  color: B.body,
  backgroundColor: B.page,
  border: `1px solid ${B.border}`,
  borderRadius: "10px",
  padding: "12px 16px",
  margin: "0 0 16px",
};
