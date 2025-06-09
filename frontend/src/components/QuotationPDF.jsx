import React from "react";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image
} from "@react-pdf/renderer";

Font.register({ family: 'Roboto', src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 12,
    fontFamily: "Roboto",
    backgroundColor: "#f8fafc"
  },
  headerBg: {
    backgroundColor: "#1a237e",
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    borderBottom: "4px solidrgb(0, 151, 245)"
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  companyInfo: {
    flexDirection: "column",
    color: "#fff",
    textAlign: "left",
    marginLeft: "auto"
  },
  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "left",
    marginLeft: "auto",
  },
  companyDetails: {
    fontSize: 11,
    color: "#e3e8f0",
    marginTop: 2,
    textAlign: "left",
    marginLeft: "auto",
  },
  quotationTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "left"
  },
  section: {
    margin: 32,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 8,
    borderBottom: "2px solid #e3e8f0",
    paddingBottom: 4
  },
  divider: {
    borderBottom: "1px solid #cbd5e1",
    marginVertical: 12
  },
  label: {
    fontWeight: "bold",
    color: "#374151"
  },
  table: {
    display: "table",
    width: "auto",
    marginVertical: 8
  },
  tableRow: {
    flexDirection: "row"
  },
  tableHeader: {
    backgroundColor: "#e3e8f0"
  },
  tableCell: {
    padding: 6,
    border: "1px solid #cbd5e1",
    flex: 1,
    fontSize: 11
  },
  tableCellRight: {
    textAlign: "right"
  },
  tableRowAlt: {
    backgroundColor: "#f1f5f9"
  },
  totalsBox: {
    marginTop: 12,
    backgroundColor: "#e3e8f0",
    padding: 12,
    borderRadius: 6,
    alignItems: "flex-end"
  },
  totalsText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1a237e"
  },
  terms: {
    marginTop: 16,
    fontSize: 11,
    color: "#374151"
  },
  footer: {
    marginTop: 32,
    padding: 16,
    borderTop: "2px solid #e3e8f0",
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center"
  },
  notesSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 4
  },
  noteItem: {
    marginBottom: 8,
    fontSize: 11,
    color: "#374151"
  },
  expirationDate: {
    color: "#dc2626",
    fontWeight: "bold",
    fontSize: 11,
    marginTop: 4
  }
});

const QuotationPDF = ({ quotation }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Modern Company Profile Header */}
      <View style={styles.headerBg}>
        <Image
          style={styles.logo}
          src={'/new brand.png'}
        />
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>R-Tech Solutions</Text>
          <Text style={styles.companyDetails}>123 Main Street, City, Country</Text>
          <Text style={styles.companyDetails}>Phone: +1 234 567 890</Text>
          <Text style={styles.companyDetails}>Email: info@rtechsolutions.com</Text>
          <Text style={styles.companyDetails}>www.rtechsolutions.com</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text>
          <Text style={styles.label}>Quotation ID: </Text>
          {quotation.Quatation_Id}
        </Text>
        <Text>
          <Text style={styles.label}>Created Date: </Text>
          {quotation.createdAt ? new Date(quotation.createdAt).toLocaleString() : ""}
        </Text>
        <Text>
          <Text style={styles.label}>Expiration Date: </Text>
          <Text style={styles.expirationDate}>
            {quotation.Expiration ? new Date(quotation.Expiration).toLocaleDateString() : ""}
          </Text>
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Text>Customer: {quotation.Customer}</Text>
        <Text>Email: {quotation.Email}</Text>
        <Text>Project: {quotation.Project}</Text>
        <Text>Created by: {quotation.CreatedBy}</Text>
        <Text>Pricelist: {quotation.Pricelist}</Text>
        <Text>Payment Terms: {quotation.PaymentTerms}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Lines</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Product</Text>
            <Text style={[styles.tableCell, styles.tableCellRight]}>Quantity</Text>
            <Text style={[styles.tableCell, styles.tableCellRight]}>Unit Price</Text>
            <Text style={[styles.tableCell, styles.tableCellRight]}>Taxes (%)</Text>
            <Text style={[styles.tableCell, styles.tableCellRight]}>Amount</Text>
          </View>
          {quotation.OrderLines && quotation.OrderLines.map((line, idx) => (
            <View style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]} key={idx}>
              <Text style={styles.tableCell}>{line.Product}</Text>
              <Text style={[styles.tableCell, styles.tableCellRight]}>{line.Quantity}</Text>
              <Text style={[styles.tableCell, styles.tableCellRight]}>Rs {line.UnitPrice?.toLocaleString()}</Text>
              <Text style={[styles.tableCell, styles.tableCellRight]}>{line.Taxes}%</Text>
              <Text style={[styles.tableCell, styles.tableCellRight]}>Rs {line.Amount?.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.totalsBox}>
          <Text style={styles.totalsText}>
            <Text style={styles.label}>Untaxed Amount: </Text>
            Rs {quotation.UntaxedAmount?.toLocaleString()}
          </Text>
          <Text style={styles.totalsText}>
            <Text style={styles.label}>Taxes: </Text>
            Rs {quotation.TaxesAmount?.toLocaleString()}
          </Text>
          <Text style={styles.totalsText}>
            <Text style={styles.label}>Total: </Text>
            Rs {quotation.Total?.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Notes Section */}
      {quotation.Notes && quotation.Notes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesSection}>
            {quotation.Notes.map((note, idx) => (
              <Text key={idx} style={styles.noteItem}>• {note.note}</Text>
            ))}
          </View>
        </View>
      )}

      {/* Sections */}
      {quotation.Sections && quotation.Sections.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sections</Text>
          <View style={styles.notesSection}>
            {quotation.Sections.map((section, idx) => (
              <Text key={idx} style={styles.noteItem}>• {section.sectionName}</Text>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <Text style={styles.terms}>{quotation.TermsConditions}</Text>
      </View>
      <Text style={styles.footer}>© {new Date().getFullYear()} R-Tech Solutions. All rights reserved. | Generated by R-Tech Solutions</Text>
    </Page>
  </Document>
);

export default QuotationPDF; 