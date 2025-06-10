// QuotationPDF.jsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
  Svg,
  Path
} from "@react-pdf/renderer";


Font.register({ 
  family: "Roboto", 
  src: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf" 
});

// Custom bullet point component
const BulletPoint = () => (
  <Svg width="4" height="4" viewBox="0 0 4 4">
    <Path
      d="M2 0C0.895 0 0 0.895 0 2s0.895 2 2 2 2-0.895 2-2-0.895-2-2-2z"
      fill="#0ea5e9"
    />
  </Svg>
);

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
    color: "#1e293b",
    border: "2px solid #000000",
    position: "relative"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    borderBottom: "1px solid #000000",
    paddingBottom: 15
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain"
  },
  companyInfo: {
    textAlign: "right"
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 2
  },
  companyDetails: {
    color: "#4b5563",
    fontSize: 9,
    lineHeight: 1.3
  },
  quotationInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f8fafc",
    padding: 10,
    border: "1px solid #e2e8f0"
  },
  quotationInfoLeft: {
    flex: 1
  },
  quotationInfoRight: {
    flex: 1,
    alignItems: "flex-end"
  },
  infoLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 1
  },
  infoValue: {
    fontSize: 10,
    color: "#1e293b",
    fontWeight: "bold",
    marginBottom: 6
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
    borderBottom: "1px solid #000000",
    paddingBottom: 3
  },
  customerInfo: {
    marginBottom: 20,
    backgroundColor: "#f8fafc",
    padding: 10,
    border: "1px solid #e2e8f0"
  },
  customerTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 6
  },
  customerDetail: {
    fontSize: 10,
    color: "#475569",
    marginBottom: 3
  },
  table: {
    display: "table",
    width: "auto",
    marginTop: 8,
    marginBottom: 15
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 25,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid"
  },
  tableHeader: {
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#000000"
  },
  tableCell: {
    padding: 8,
    flex: 1,
    fontSize: 9
  },
  tableCellRight: {
    textAlign: "right"
  },
  tableCellHeader: {
    fontWeight: "bold",
    color: "#000000",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc"
  },
  tableRowLast: {
    borderBottomWidth: 0
  },
  tableCellProduct: {
    flex: 2,
    padding: 8,
    fontSize: 9
  },
  tableCellQuantity: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    textAlign: "right"
  },
  tableCellPrice: {
    flex: 1.5,
    padding: 8,
    fontSize: 9,
    textAlign: "right"
  },
  tableCellTax: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    textAlign: "right"
  },
  tableCellTotal: {
    flex: 1.5,
    padding: 8,
    fontSize: 9,
    textAlign: "right",
    fontWeight: "bold"
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  tableHeaderCellRight: {
    textAlign: "right"
  },
  totalsBox: {
    marginTop: 15,
    alignItems: "flex-end",
    backgroundColor: "#f8fafc",
    padding: 10,
    border: "1px solid #e2e8f0",
    width: "35%",
    alignSelf: "flex-end"
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 3
  },
  totalsLabel: {
    fontSize: 10,
    color: "#64748b"
  },
  totalsValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b"
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#000000",
    borderTopStyle: "solid",
    paddingTop: 3,
    marginTop: 3
  },
  notes: {
    marginTop: 20,
    backgroundColor: "#f8fafc",
    padding: 10,
    border: "1px solidrgb(0, 110, 254)"
  },
  noteItem: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-start"
  },
  bulletPoint: {
    marginRight: 6,
    marginTop: 3
  },
  noteText: {
    fontSize: 9,
    color: "#475569",
    flex: 1
  },
  terms: {
    marginTop: 20,
    backgroundColor: "#f8fafc",
    padding: 10,
    border: "1px solid #e2e8f0"
  },
  termsText: {
    fontSize: 9,
    color: "#475569",
    lineHeight: 1.3
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1px solid #000000",
    fontSize: 8,
    color: "#64748b",
    textAlign: "center"
  },
  footerText: {
    marginBottom: 3
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    fontSize: 50,
    color: "#f1f5f9",
    opacity: 0.1,
    fontWeight: "bold"
  }
});

// Component
const QuotationPDF = ({ quotation }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Watermark */}
      <Text style={styles.watermark}>QUOTATION</Text>

      {/* Header */}
      <View style={styles.header}>
        <Image style={styles.logo} src={"/new brand.png"} />
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>R-Tech Solutions</Text>
          <Text style={styles.companyDetails}>
            123 Main Street, City, Country{"\n"}
            Phone: +1 234 567 890{"\n"}
            Email: info@rtechsolutions.com{"\n"}
            www.rtechsolutions.com
          </Text>
        </View>
      </View>

      {/* Quotation Info */}
      <View style={styles.quotationInfo}>
        <View style={styles.quotationInfoLeft}>
          <Text style={styles.infoLabel}>Quotation ID</Text>
          <Text style={styles.infoValue}>{quotation.Reference}</Text>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{new Date(quotation.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.quotationInfoRight}>
          <Text style={styles.infoLabel}>Expiration Date</Text>
          <Text style={styles.infoValue}>{new Date(quotation.Expiration).toLocaleDateString()}</Text>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>{quotation.Status || "Draft"}</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.customerInfo}>
        <Text style={styles.customerTitle}>Customer Information</Text>
        <Text style={styles.customerDetail}>Customer: {quotation.Customer}</Text>
        <Text style={styles.customerDetail}>Email: {quotation.Email}</Text>
        <Text style={styles.customerDetail}>Project: {quotation.Project}</Text>
      </View>

      {/* Sections */}
      {quotation.Sections && quotation.Sections.length > 0 && (
        <View style={styles.notes}>
          <Text style={styles.sectionTitle}>Sections</Text>
          {quotation.Sections.map((section, idx) => (
            <View key={idx} style={styles.noteItem}>
              <View style={styles.bulletPoint}>
                <BulletPoint />
              </View>
              <Text style={styles.noteText}>{section.sectionName}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Items Table */}
      <Text style={styles.sectionTitle}>Quotation Items</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableHeaderCell, styles.tableCellProduct]}>Description</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellQuantity, styles.tableHeaderCellRight]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellPrice, styles.tableHeaderCellRight]}>Unit Price</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellTax, styles.tableHeaderCellRight]}>Tax</Text>
          <Text style={[styles.tableHeaderCell, styles.tableCellTotal, styles.tableHeaderCellRight]}>Total</Text>
        </View>
        {quotation.OrderLines && quotation.OrderLines.map((line, idx) => (
          <View 
            style={[
              styles.tableRow, 
              idx % 2 === 1 && styles.tableRowAlt,
              idx === quotation.OrderLines.length - 1 && styles.tableRowLast
            ]} 
            key={idx}
          >
            <Text style={styles.tableCellProduct}>{line.Product}</Text>
            <Text style={styles.tableCellQuantity}>{line.Quantity}</Text>
            <Text style={styles.tableCellPrice}>Rs {line.UnitPrice?.toLocaleString()}</Text>
            <Text style={styles.tableCellTax}>{line.Taxes}%</Text>
            <Text style={styles.tableCellTotal}>Rs {line.Amount?.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsBox}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Untaxed Amount:</Text>
          <Text style={styles.totalsValue}>Rs {quotation.UntaxedAmount?.toLocaleString()}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Tax Amount:</Text>
          <Text style={styles.totalsValue}>Rs {quotation.TaxesAmount?.toLocaleString()}</Text>
        </View>
        <View style={[styles.totalsRow, styles.grandTotal]}>
          <Text style={styles.totalsLabel}>Grand Total:</Text>
          <Text style={styles.totalsValue}>Rs {quotation.Total?.toLocaleString()}</Text>
        </View>
      </View>

      {/* Notes */}
      {quotation.Notes && quotation.Notes.length > 0 && (
        <View style={styles.notes}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {quotation.Notes.map((note, idx) => (
            <View key={idx} style={styles.noteItem}>
              <View style={styles.bulletPoint}>
                <BulletPoint />
              </View>
              <Text style={styles.noteText}>{note.note}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Terms */}
      <View style={styles.terms}>
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <Text style={styles.termsText}>{quotation.TermsConditions}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} R-Tech Solutions. All rights reserved.</Text>
        <Text style={styles.footerText}>This is a computer-generated document. No signature is required.</Text>
      </View>
    </Page>
  </Document>
);

export default QuotationPDF;
