import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// ── Font registration ───────────────────────────────────────────────────
// Devanagari font is used ONLY for the ₹ symbol.
// The rest of the invoice uses built-in Helvetica so that
// Latin characters such as INV-000011 always render correctly.

Font.register({
  family: "NotoSansDevanagari",
  src: "https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-devanagari@5.2.7/devanagari-400-normal.woff",
});

// ── Palette ──────────────────────────────────────────────────────────────

const COLOR = {
  ink: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  border: "#e6e9f0",
  borderSoft: "#f0f2f7",
  bgSoft: "#f8f9fc",
  accent: "#4f46e5",
  accentSoft: "#eef0fd",
};

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string; dot: string }
> = {
  paid: { bg: "#e7f7ef", color: "#0f7a4f", dot: "#22c55e" },
  active: { bg: "#e7f7ef", color: "#0f7a4f", dot: "#22c55e" },
  pending: { bg: "#fdf3e3", color: "#96660b", dot: "#f59e0b" },
  failed: { bg: "#fdecec", color: "#b3261e", dot: "#ef4444" },
  cancelled: { bg: "#f1f2f5", color: "#4b5361", dot: "#94a3b8" },
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 44,
    paddingHorizontal: 44,
    paddingBottom: 64,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: COLOR.body,
  },

  // ─── Header ───

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  logoContainer: {
    width: 100,
    marginBottom: 6,
  },

  logo: {
    width: "100%",
    height: "auto",
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  logoMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: COLOR.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  logoMarkText: {
    color: "#ffffff",
    fontSize: 12,
    fontFamily: "Helvetica",
  },

  brandName: {
    fontSize: 15,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    color: COLOR.ink,
  },

  brandTagline: {
    fontSize: 7.5,
    color: COLOR.faint,
    letterSpacing: 1,
    marginTop: 1,
  },

  invoiceTitleBlock: {
    alignItems: "flex-end",
  },

  invoiceLabel: {
    fontSize: 8,
    color: COLOR.faint,
    letterSpacing: 2.5,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    marginBottom: 5,
  },

  // IMPORTANT:
  // Helvetica supports INV-000011 perfectly.
  // Do NOT use the Devanagari font here.
  invoiceNumber: {
    fontSize: 15,
    fontFamily: "Helvetica",
    color: COLOR.ink,
    marginBottom: 4,
  },

  invoiceDate: {
    fontSize: 9,
    color: COLOR.muted,
    marginBottom: 8,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },

  statusText: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    letterSpacing: 0.6,
  },

  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
    marginBottom: 22,
  },

  // ─── Addresses ───

  addresses: {
    flexDirection: "row",
    marginBottom: 20,
  },

  addressBox: {
    width: "50%",
  },

  addressDivider: {
    width: 1,
    backgroundColor: COLOR.borderSoft,
    marginHorizontal: 20,
  },

  addressLabel: {
    fontSize: 7.5,
    color: COLOR.faint,
    letterSpacing: 1.2,
    marginBottom: 7,
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },

  addressName: {
    fontSize: 11,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    color: COLOR.ink,
    marginBottom: 3,
  },

  addressLine: {
    fontSize: 9,
    color: COLOR.muted,
    marginBottom: 2,
    lineHeight: 1.4,
  },

  // ─── Info card ───

  infoSection: {
    marginBottom: 20,
    backgroundColor: COLOR.bgSoft,
    borderRadius: 6,
    borderTopWidth: 2,
    borderTopColor: COLOR.accent,
    padding: 14,
  },

  infoTitle: {
    fontSize: 7.5,
    color: COLOR.faint,
    letterSpacing: 1.2,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    marginBottom: 9,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  infoItem: {
    width: "50%",
    marginBottom: 8,
    paddingRight: 10,
  },

  infoItemLabel: {
    fontSize: 7.5,
    color: COLOR.faint,
    letterSpacing: 0.4,
    marginBottom: 2,
  },

  infoItemValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    color: COLOR.ink,
  },

  // ─── Currency ───

  // Only ₹ uses this font.
  // This prevents the Devanagari font from affecting INV-000011
  // and other Latin characters.
  rupeeSymbol: {
    fontFamily: "NotoSansDevanagari",
  },

  // ─── Table ───

  table: {
    marginBottom: 16,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLOR.bgSoft,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },

  tableHeaderText: {
    fontSize: 7.5,
    color: COLOR.faint,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    letterSpacing: 0.8,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.borderSoft,
  },

  colDescription: {
    width: "65%",
    paddingRight: 12,
  },

  colAmount: {
    width: "35%",
    textAlign: "right",
  },

  itemTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    color: COLOR.ink,
    marginBottom: 3,
  },

  itemSub: {
    fontSize: 8,
    color: COLOR.faint,
    lineHeight: 1.4,
  },

  itemAmount: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    color: COLOR.ink,
  },

  // ─── Totals ───

  totalsWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
  },

  totalsBox: {
    width: "42%",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  totalLabel: {
    fontSize: 9,
    color: COLOR.muted,
  },

  totalValue: {
    fontSize: 9,
    color: COLOR.ink,
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: COLOR.ink,
  },

  grandTotalLabel: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    color: COLOR.ink,
    letterSpacing: 0.4,
  },

  grandTotalValue: {
    fontSize: 14,
    fontFamily: "Helvetica",
    fontWeight: "bold",
    color: COLOR.accent,
  },

  disclosure: {
    fontSize: 7.5,
    color: COLOR.faint,
    textAlign: "right",
    marginTop: 6,
    width: "42%",
    alignSelf: "flex-end",
    lineHeight: 1.4,
  },

  // ─── Footer ───

  footer: {
    position: "absolute",
    bottom: 34,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: COLOR.border,
    paddingTop: 12,
  },

  footerLeft: {
    fontSize: 7.5,
    color: COLOR.faint,
    lineHeight: 1.6,
    width: "75%",
  },

  footerRight: {
    fontSize: 7.5,
    color: COLOR.faint,
    textAlign: "right",
  },
});

// ── Shared building blocks ──────────────────────────────────────────────

function BrandBlock({
  logoUrl,
  brandName,
  brandTagline,
}: {
  logoUrl?: string;
  brandName: string;
  brandTagline: string;
}) {
  return (
    <View>
      {logoUrl ? (
        <View style={styles.logoContainer}>
          <Image src={logoUrl} style={styles.logo} />
        </View>
      ) : (
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>
              {brandName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View>
            <Text style={styles.brandName}>{brandName}</Text>
          </View>
        </View>
      )}

      <Text style={styles.brandTagline}>{brandTagline}</Text>
    </View>
  );
}

function StatusBadge({
  statusKey,
  label,
}: {
  statusKey: string;
  label: string;
}) {
  const s = STATUS_STYLES[statusKey] ?? STATUS_STYLES.pending;

  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: s.dot,
          },
        ]}
      />

      <Text
        style={[
          styles.statusText,
          {
            color: s.color,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function InvoiceMeta({
  invoiceNumber,
  date,
  statusKey,
  statusLabel,
}: {
  invoiceNumber: string;
  date: string;
  statusKey: string;
  statusLabel: string;
}) {
  return (
    <View style={styles.invoiceTitleBlock}>
      <Text style={styles.invoiceLabel}>INVOICE</Text>

      {/* Helvetica handles the entire invoice number */}
      <Text style={styles.invoiceNumber}>#{invoiceNumber}</Text>

      <Text style={styles.invoiceDate}>{date}</Text>

      <StatusBadge statusKey={statusKey} label={statusLabel} />
    </View>
  );
}

// ── Currency helpers ────────────────────────────────────────────────────

// Formats only the numeric part.
// Example: 999 -> "999"
// Example: 10000 -> "10,000"
const fmtINRNumber = (n: number) => (Number(n) || 0).toLocaleString("en-IN");

// ── Subscription / plan invoice ─────────────────────────────────────────

interface SubscriptionInvoiceProps {
  subscription: {
    _id: any;
    plan: string; // "BASIC" | "PRO"
    billingCycle: string; // "MONTHLY" | "YEARLY"
    amount: number;
    currency?: string;
    status: string; // "PAID" | "PENDING" | "FAILED" | "CANCELLED"
    invoiceNumber?: string;
    startsAt: string | Date;
    expiresAt: string | Date;
    createdAt: string | Date;
    paymentMethod?: string;
    gstApplicable?: boolean;
    baseAmount?: number;
    gstAmount?: number;
  };

  organization: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string;
  };

  logoUrl?: string;
  brandName?: string;
  brandTagline?: string;
  supportEmail?: string;
}

const PLAN_LABEL: Record<string, string> = {
  BASIC: "Basic Plan",
  PRO: "Pro Plan",
};

export const SubscriptionInvoiceDocument = ({
  subscription,
  organization,
  logoUrl,
  brandName = "Clinicly",
  brandTagline = "CLINIC MANAGEMENT PLATFORM",
  supportEmail = "support@clinicly.com",
}: SubscriptionInvoiceProps) => {
  // ── Invoice number ───────────────────────────────────────────────────

  const invoiceNumber = String(
    subscription.invoiceNumber ||
      `INV-${
        subscription._id?.toString().slice(-8).toUpperCase() || "00000000"
      }`,
  );

  // ── Dates ─────────────────────────────────────────────────────────────

  const invoiceDate = new Date(subscription.createdAt).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const periodStart = new Date(subscription.startsAt).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const periodEnd = new Date(subscription.expiresAt).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  // ── Status ────────────────────────────────────────────────────────────

  let statusKey = "pending";
  let statusLabel = "Pending";

  if (subscription.status === "PAID") {
    statusKey = "paid";
    statusLabel = "Paid";
  } else if (subscription.status === "FAILED") {
    statusKey = "failed";
    statusLabel = "Failed";
  } else if (subscription.status === "CANCELLED") {
    statusKey = "cancelled";
    statusLabel = "Cancelled";
  }

  // ── Plan ──────────────────────────────────────────────────────────────

  const planLabel = PLAN_LABEL[subscription.plan] || subscription.plan;

  const cycleLabel =
    subscription.billingCycle === "YEARLY" ? "Yearly" : "Monthly";

  const showGst = !!subscription.gstApplicable;

  // ── Amount values ────────────────────────────────────────────────────

  const subtotalAmount = showGst
    ? (subscription.baseAmount ?? subscription.amount)
    : subscription.amount;

  const lineItemAmount = showGst
    ? (subscription.baseAmount ?? subscription.amount)
    : subscription.amount;

  return (
    <Document title={`Invoice ${invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <BrandBlock
            logoUrl={logoUrl}
            brandName={brandName}
            brandTagline={brandTagline}
          />

          <InvoiceMeta
            invoiceNumber={invoiceNumber}
            date={invoiceDate}
            statusKey={statusKey}
            statusLabel={statusLabel}
          />
        </View>

        <View style={styles.headerDivider} />

        {/* Addresses */}
        <View style={styles.addresses}>
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>BILLED TO</Text>

            <Text style={styles.addressName}>{organization.name}</Text>

            {organization.email && (
              <Text style={styles.addressLine}>{organization.email}</Text>
            )}

            {organization.phone && (
              <Text style={styles.addressLine}>{organization.phone}</Text>
            )}

            {organization.address && (
              <Text style={styles.addressLine}>{organization.address}</Text>
            )}

            {organization.gstin && (
              <Text style={styles.addressLine}>
                GSTIN: {organization.gstin}
              </Text>
            )}
          </View>

          <View style={styles.addressDivider} />

          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>FROM</Text>

            <Text style={styles.addressName}>{brandName} Technologies</Text>

            <Text style={styles.addressLine}>{supportEmail}</Text>
          </View>
        </View>

        {/* Subscription Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>SUBSCRIPTION DETAILS</Text>

          <View style={styles.infoGrid}>
            {/* Plan */}
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>Plan</Text>

              <Text style={styles.infoItemValue}>
                {planLabel} · <Text style={styles.rupeeSymbol}>₹</Text>
                {fmtINRNumber(subscription.amount)}/
                {subscription.billingCycle === "YEARLY" ? "yr" : "mo"}
              </Text>
            </View>

            {/* Billing Cycle */}
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>Billing Cycle</Text>

              <Text style={styles.infoItemValue}>{cycleLabel}</Text>
            </View>

            {/* Billing Period */}
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>Billing Period</Text>

              <Text style={styles.infoItemValue}>
                {periodStart} – {periodEnd}
              </Text>
            </View>

            {/* Payment Method */}
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>Payment Method</Text>

              <Text style={styles.infoItemValue}>
                {subscription.paymentMethod || "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.tableHeaderText,
                {
                  width: "65%",
                },
              ]}
            >
              DESCRIPTION
            </Text>

            <Text
              style={[
                styles.tableHeaderText,
                {
                  width: "35%",
                  textAlign: "right",
                },
              ]}
            >
              AMOUNT
            </Text>
          </View>

          {/* Table Row */}
          <View style={styles.tableRow}>
            <View style={styles.colDescription}>
              <Text style={styles.itemTitle}>{planLabel} Subscription</Text>

              <Text style={styles.itemSub}>
                {cycleLabel} billing · {periodStart} – {periodEnd}
              </Text>
            </View>

            <Text style={[styles.itemAmount, styles.colAmount]}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              {fmtINRNumber(lineItemAmount)}
            </Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsWrapper}>
          <View style={styles.totalsBox}>
            {/* Subtotal */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>

              <Text style={styles.totalValue}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                {fmtINRNumber(subtotalAmount)}
              </Text>
            </View>

            {/* GST */}
            {showGst && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>GST (18%)</Text>

                <Text style={styles.totalValue}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                  {fmtINRNumber(subscription.gstAmount ?? 0)}
                </Text>
              </View>
            )}

            {/* Grand Total */}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>
                {subscription.status === "PAID" ? "AMOUNT PAID" : "AMOUNT DUE"}
              </Text>

              <Text style={styles.grandTotalValue}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                {fmtINRNumber(subscription.amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* GST Disclosure */}
        {showGst && (
          <Text style={styles.disclosure}>
            Amount is inclusive of 18% GST, as applicable for customers in
            India.
          </Text>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>
            This invoice was generated automatically via {brandName}. For
            billing questions, contact our support team.
          </Text>

          <Text style={styles.footerRight}>{supportEmail}</Text>
        </View>
      </Page>
    </Document>
  );
};
