import React from "react";
import { View, Text, StyleSheet, Pressable, Platform, Share } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

export interface InvoiceData {
  invoiceNo: string;
  date: string;
  type: "ad_payment" | "withdrawal";
  userName: string;
  userId: string;
  description: string;
  baseAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  platformFee?: number;
  netAmount?: number;
  gstin: string;
  hsnCode: string;
  sacCode: string;
}

export function GstInvoice({ invoice, onClose }: { invoice: InvoiceData; onClose: () => void }) {
  const colors = useColors();

  const downloadInvoice = async () => {
    const text = `
KRILO DIGITECH PVT LTD
GST Invoice

Invoice No: ${invoice.invoiceNo}
Date: ${invoice.date}
GSTIN: 33AAMCK0376J1ZD

SELLER:
Krilo Digitech Pvt Ltd
P.NO.10 & 11-F-3, Subash Nagar, 200 Feet Ring Rd,
Madhavaram, Ponniammanmedu, Chennai, Tamil Nadu 600099.

BILL TO:
${invoice.userName}
User ID: ${invoice.userId}

Description: ${invoice.description}

----------------------------------------
Base Amount:       ₹${invoice.baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
GST (${invoice.gstRate}%):       ₹${invoice.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
${invoice.platformFee ? `Platform Fee:      ₹${invoice.platformFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
` : ""}
${invoice.netAmount ? `Net Amount:        ₹${invoice.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
` : ""}
----------------------------------------
TOTAL:             ₹${invoice.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}

HSN Code: ${invoice.hsnCode}
SAC Code: ${invoice.sacCode}

This is a computer-generated invoice and does not require a signature.
For queries: accounts@krilodigitech.com
`.trim();

    if (Platform.OS === "web") {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Ridhi_Invoice_${invoice.invoiceNo}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      await Share.share({
        message: text,
        title: `Ridhi Invoice ${invoice.invoiceNo}`,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.invoiceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>KRILO DIGITECH PVT LTD</Text>
          <Text style={styles.headerSub}>GST Invoice</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Invoice No</Text>
            <Text style={[styles.value, { color: colors.foreground }]}>{invoice.invoiceNo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Date</Text>
            <Text style={[styles.value, { color: colors.foreground }]}>{invoice.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>GSTIN</Text>
            <Text style={[styles.value, { color: colors.foreground }]}>33AAMCK0376J1ZD</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Seller Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Seller</Text>
          <Text style={[styles.billText, { color: colors.foreground }]}>Krilo Digitech Pvt Ltd</Text>
          <Text style={[styles.billText, { color: colors.mutedForeground }]}>
            P.NO.10 & 11-F-3, Subash Nagar, 200 Feet Ring Rd,
          </Text>
          <Text style={[styles.billText, { color: colors.mutedForeground }]}>
            Madhavaram, Ponniammanmedu, Chennai, Tamil Nadu 600099.
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Billed To */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Billed To</Text>
          <Text style={[styles.billText, { color: colors.foreground }]}>{invoice.userName}</Text>
          <Text style={[styles.billText, { color: colors.mutedForeground }]}>User ID: {invoice.userId}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
          <Text style={[styles.billText, { color: colors.foreground }]}>{invoice.description}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Cost Breakdown */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Base Amount</Text>
            <Text style={[styles.value, { color: colors.foreground }]}>₹{invoice.baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>GST ({invoice.gstRate}%)</Text>
            <Text style={[styles.value, { color: "#F59E0B" }]}>₹{invoice.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          </View>
          {invoice.platformFee != null && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Platform Fee</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>₹{invoice.platformFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
            </View>
          )}
          {invoice.netAmount != null && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Net Payable</Text>
              <Text style={[styles.value, { color: "#22C55E" }]}>₹{invoice.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>TOTAL</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>₹{invoice.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Codes */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>HSN Code</Text>
            <Text style={[styles.value, { color: colors.foreground }]}>{invoice.hsnCode}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>SAC Code</Text>
            <Text style={[styles.value, { color: colors.foreground }]}>{invoice.sacCode}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          This is a computer-generated invoice and does not require a signature.
          For queries: accounts@krilodigitech.com
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={downloadInvoice}
            style={[styles.downloadBtn, { backgroundColor: colors.primary }]}>
            <Feather name="download" size={16} color="#fff" />
            <Text style={styles.downloadBtnText}>Download Invoice</Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
            <Text style={[styles.closeBtnText, { color: colors.foreground }]}>Close</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  invoiceCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  header: { padding: 16, alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  section: { padding: 14 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  label: { fontSize: 13, fontFamily: "Inter_400Regular" },
  value: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  billText: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 2 },
  divider: { height: 1 },
  totalLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  totalValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  footer: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center", padding: 14, paddingTop: 0 },
  actions: { flexDirection: "row", gap: 10, padding: 14, paddingTop: 0 },
  downloadBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12 },
  downloadBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  closeBtn: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12 },
  closeBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
