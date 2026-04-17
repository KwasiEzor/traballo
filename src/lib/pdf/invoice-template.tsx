/**
 * Invoice PDF template using react-pdf
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Define types
interface InvoiceItem {
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  total: string;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  client: {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  items: InvoiceItem[];
  artisan: {
    businessName: string;
    ownerName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    vatNumber?: string | null;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 8,
  },
  col1: { width: "40%" },
  col2: { width: "15%", textAlign: "right" },
  col3: { width: "15%", textAlign: "right" },
  col4: { width: "15%", textAlign: "right" },
  col5: { width: "15%", textAlign: "right" },
  totals: {
    marginLeft: "auto",
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export function InvoicePDFTemplate({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FACTURE</Text>
            <Text>{data.invoiceNumber}</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={styles.label}>{data.artisan.businessName}</Text>
            <Text>{data.artisan.ownerName}</Text>
            {data.artisan.address && <Text>{data.artisan.address}</Text>}
            {data.artisan.email && <Text>{data.artisan.email}</Text>}
            {data.artisan.phone && <Text>{data.artisan.phone}</Text>}
            {data.artisan.vatNumber && (
              <Text>TVA: {data.artisan.vatNumber}</Text>
            )}
          </View>
        </View>

        {/* Client info */}
        <View style={styles.section}>
          <Text style={styles.label}>Facturé à:</Text>
          <Text>{data.client.name}</Text>
          {data.client.address && <Text>{data.client.address}</Text>}
          {data.client.email && <Text>{data.client.email}</Text>}
          {data.client.phone && <Text>{data.client.phone}</Text>}
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Date d'émission:</Text>
            <Text>
              {new Date(data.issueDate).toLocaleDateString("fr-FR")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>Date d'échéance:</Text>
            <Text>{new Date(data.dueDate).toLocaleDateString("fr-FR")}</Text>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Qté</Text>
            <Text style={styles.col3}>Prix HT</Text>
            <Text style={styles.col4}>TVA</Text>
            <Text style={styles.col5}>Total</Text>
          </View>
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>{item.unitPrice}€</Text>
              <Text style={styles.col4}>{item.taxRate}%</Text>
              <Text style={styles.col5}>{item.total}€</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Sous-total HT:</Text>
            <Text>{data.subtotal}€</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TVA:</Text>
            <Text>{data.taxAmount}€</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>Total TTC:</Text>
            <Text>{data.total}€</Text>
          </View>
        </View>

        {/* Footer */}
        <View
          style={{
            position: "absolute",
            bottom: 40,
            left: 40,
            right: 40,
            textAlign: "center",
            fontSize: 9,
            color: "#6b7280",
          }}
        >
          <Text>
            Merci de votre confiance. Paiement à effectuer avant le{" "}
            {new Date(data.dueDate).toLocaleDateString("fr-FR")}.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
