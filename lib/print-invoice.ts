import { Invoice, Organization } from "@/lib/mock-data";
import {
  formatFCFA,
  formatDate,
  getCurrencyLabel,
  getCurrencySymbol,
  isPartiallyPaid,
  organizationHeaderLines,
  paidAmountOf,
  remainingAmountOf,
} from "@/lib/utils";

/**
 * Generates official, clean A4 HTML markup for any invoice.
 * Strictly complies with GESFACTURE Notion Light / Flat Design system:
 * - Pure neutral colors (#171717, #737373, #a3a3a3, #fafaf9, #e5e5e5)
 * - Zero blue tints
 * - FCFA currency formatting without decimals
 * - 1px hairline borders
 * - Monogram [G] squircle brand mark
 */
export function generateInvoiceHtml(invoice: Invoice, org: Organization): string {
  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    {
      id: "item-default",
      description: "Prestation technologique & accompagnement numérique",
      quantity: 1,
      unitPrice: invoice.subtotal || Math.round(invoice.amount / 1.18),
      total: invoice.subtotal || Math.round(invoice.amount / 1.18),
    },
  ];

  const activeCurrency = invoice.currency || org.currency || "XOF";
  const currencySymbol = getCurrencySymbol(activeCurrency);

  const subtotal = invoice.subtotal || Math.round(invoice.amount / 1.18);
  const taxRate = invoice.taxRate !== undefined ? invoice.taxRate : 18;
  const taxAmount = invoice.taxAmount !== undefined ? invoice.taxAmount : (invoice.amount - subtotal);
  const totalAmount = invoice.amount;

  // Le sous-total enregistré est déjà remisé : on reconstitue le brut pour afficher la remise
  const discountPercent = invoice.discountPercent || 0;
  const grossSubtotal = items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
  const discountAmount = discountPercent > 0 ? Math.max(0, grossSubtotal - subtotal) : 0;

  const partial = isPartiallyPaid(invoice);

  const statusLabel = partial
    ? "PAYÉE EN PARTIE"
    : invoice.status === "payee"
      ? "PAYÉE"
      : invoice.status === "en_retard"
      ? "EN RETARD"
      : invoice.status === "brouillon"
      ? "BROUILLON"
      : "ENVOYÉE";

  const statusColor = partial
    ? "background: #f3faf5; color: #137333; border: 1px dashed #a8dab5;"
    : invoice.status === "payee"
      ? "background: #e6f4ea; color: #137333; border: 1px solid #ceead6;"
      : invoice.status === "en_retard"
      ? "background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf;"
      : invoice.status === "brouillon"
      ? "background: #f1f3f4; color: #5f6368; border: 1px solid #e0e0e0;"
      : "background: #fef7e0; color: #b06000; border: 1px solid #fce8b2;";

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 7px 10px; border-bottom: 1px solid #f0f0f0; color: #171717; font-weight: 500;">
          ${escapeHtml(item.description)}
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #f0f0f0; text-align: center; font-family: monospace; color: #525252;">
          ${item.quantity}
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #f0f0f0; text-align: right; font-family: monospace; color: #525252;">
          ${formatFCFA(item.unitPrice, activeCurrency)}
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #f0f0f0; text-align: right; font-family: monospace; font-weight: 700; color: #171717;">
          ${formatFCFA(item.total, activeCurrency)}
        </td>
      </tr>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Facture ${escapeHtml(invoice.number)} — ${escapeHtml(org.name)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    html, body {
      background: #ffffff;
      color: #171717;
      font-size: 11.5px;
      line-height: 1.35;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .invoice-container {
      width: 100%;
      max-width: 100%;
      padding: 6px 10px;
      box-sizing: border-box;
      page-break-inside: avoid !important;
      page-break-after: avoid !important;
      break-inside: avoid !important;
      break-after: avoid !important;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e5e5;
    }
    .brand-wrap {
      max-width: 60%;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #171717;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Georgia, serif;
      font-weight: bold;
      font-size: 18px;
      flex-shrink: 0;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #171717;
      line-height: 1.1;
    }
    .brand-legal {
      font-size: 11px;
      color: #737373;
      margin-top: 2px;
    }
    .company-details {
      margin-top: 6px;
      font-size: 10px;
      color: #737373;
      line-height: 1.35;
    }
    .inv-meta {
      text-align: right;
    }
    .inv-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #171717;
      line-height: 1;
    }
    .inv-num {
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
      color: #171717;
      margin-top: 4px;
    }
    .inv-currency {
      font-size: 10px;
      color: #737373;
      margin-top: 2px;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-top: 6px;
      ${statusColor}
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .info-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #737373;
      margin-bottom: 3px;
    }
    .client-name {
      font-size: 14px;
      font-weight: 700;
      color: #171717;
    }
    .client-detail {
      font-size: 11px;
      color: #525252;
      margin-top: 1px;
    }
    .dates-table {
      text-align: right;
      font-size: 11px;
    }
    .dates-table p {
      margin-bottom: 3px;
    }
    .dates-table .label {
      color: #737373;
    }
    .dates-table .val {
      font-weight: 600;
      color: #171717;
    }
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 11px;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      overflow: hidden;
    }
    table.items-table th {
      background: #fafaf9;
      border-bottom: 1px solid #e5e5e5;
      padding: 7px 10px;
      text-align: left;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #737373;
    }
    .totals-wrap {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }
    .totals-box {
      width: 290px;
      background: #fafaf9;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 11px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      color: #525252;
      margin-bottom: 4px;
    }
    .total-final {
      border-top: 1px solid #d4d4d4;
      padding-top: 6px;
      margin-top: 6px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-weight: 700;
      color: #171717;
    }
    .total-final .amount {
      font-size: 15px;
      font-weight: 800;
      font-family: monospace;
      color: #171717;
    }
    .legal-footer {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #e5e5e5;
      font-size: 10px;
      color: #737373;
      line-height: 1.35;
    }
    .sign-row {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #e5e5e5;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .signature-brand {
      font-family: Georgia, serif;
      font-style: italic;
      font-size: 14px;
      border-bottom: 1px solid #d4d4d4;
      padding-bottom: 2px;
      min-width: 120px;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Document Header -->
    <div class="header">
      <div class="brand-wrap">
        <div class="brand">
          <div class="logo">${escapeHtml(org.name.slice(0, 1) || "G")}</div>
          <div>
            <div class="brand-title">${escapeHtml(org.name)}</div>
            <div class="brand-legal">${escapeHtml(org.legalName)}</div>
          </div>
        </div>
        <div class="company-details">
          ${organizationHeaderLines(org).map(escapeHtml).join("<br />")}
        </div>
      </div>
      <div class="inv-meta">
        <div class="inv-title">FACTURE</div>
        <div class="inv-num">${escapeHtml(invoice.number)}</div>
        <div class="inv-currency">Devise : ${escapeHtml(getCurrencyLabel(activeCurrency))}</div>
        <div class="status-badge">${statusLabel}</div>
      </div>
    </div>

    <!-- Client & Dates -->
    <div class="info-grid">
      <div>
        <div class="info-label">Facturé à :</div>
        <div class="client-name">${escapeHtml(invoice.client.name)}</div>
        <div class="client-detail">${escapeHtml(invoice.client.email)}</div>
        ${
          invoice.client.address || invoice.client.city
            ? `<div class="client-detail">${escapeHtml(
                [invoice.client.address, invoice.client.city, invoice.client.country]
                  .filter(Boolean)
                  .join(", ")
              )}</div>`
            : ""
        }
        ${
          invoice.client.phone
            ? `<div class="client-detail" style="font-family: monospace;">${escapeHtml(invoice.client.phone)}</div>`
            : ""
        }
      </div>
      <div class="dates-table">
        <p><span class="label">Date d'émission : </span><span class="val">${formatDate(invoice.issueDate)}</span></p>
        <p><span class="label">Date d'échéance : </span><span class="val">${formatDate(invoice.dueDate)}</span></p>
        <p><span class="label">Mode de règlement : </span><span class="val">${escapeHtml(invoice.paymentMethod || "Wave")}</span></p>
      </div>
    </div>

    <!-- Line Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="width: 55px; text-align: center;">Qté</th>
          <th style="width: 130px; text-align: right;">Prix Unitaire HT</th>
          <th style="width: 140px; text-align: right;">Total HT (${escapeHtml(currencySymbol)})</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Totals Breakdown -->
    <div class="totals-wrap">
      <div class="totals-box">
        ${
          discountAmount > 0
            ? `<div class="totals-row">
          <span>Sous-total Brut HT :</span>
          <span style="font-family: monospace; font-weight: 600;">${formatFCFA(grossSubtotal, activeCurrency)}</span>
        </div>
        <div class="totals-row">
          <span>Remise (${discountPercent}%) :</span>
          <span style="font-family: monospace; font-weight: 600;">- ${formatFCFA(discountAmount, activeCurrency)}</span>
        </div>
        <div class="totals-row">
          <span>Total Net HT :</span>
          <span style="font-family: monospace; font-weight: 600;">${formatFCFA(subtotal, activeCurrency)}</span>
        </div>`
            : `<div class="totals-row">
          <span>Sous-total Brut HT :</span>
          <span style="font-family: monospace; font-weight: 600;">${formatFCFA(subtotal, activeCurrency)}</span>
        </div>`
        }
        <div class="totals-row">
          <span>TVA (${taxRate}%) :</span>
          <span style="font-family: monospace; font-weight: 600;">${formatFCFA(taxAmount, activeCurrency)}</span>
        </div>
        <div class="total-final">
          <span style="text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px;">TOTAL TTC NET :</span>
          <span class="amount">${formatFCFA(totalAmount, activeCurrency)}</span>
        </div>
        ${
          partial
            ? `<div class="totals-row" style="margin-top: 6px;">
          <span>Déjà réglé :</span>
          <span style="font-family: monospace; font-weight: 600;">${formatFCFA(paidAmountOf(invoice), activeCurrency)}</span>
        </div>
        <div class="totals-row" style="font-weight: 700; color: #171717;">
          <span>RESTE À PAYER :</span>
          <span style="font-family: monospace; font-weight: 800;">${formatFCFA(remainingAmountOf(invoice), activeCurrency)}</span>
        </div>`
            : ""
        }
      </div>
    </div>

    <!-- Notes & Conditions -->
    <div class="legal-footer">
      <strong>Conditions de règlement :</strong><br />
      ${escapeHtml(invoice.notes || `Paiement attendu sous ${org.paymentDelay ?? 15} jours. Tout retard donnera lieu à application des pénalités selon les normes OHADA.`)}
    </div>

    <!-- Signatures & Payment Details -->
    <div class="sign-row">
      <div>
        <div class="info-label">Règlement Direct</div>
        <div style="font-weight: 600; color: #171717;">${escapeHtml(invoice.paymentMethod || "Wave Business / Virement Bancaire")}</div>
        ${
          invoice.paymentMethod === "Wave" && org.waveNumber
            ? `<div style="font-size: 10px; color: #171717; font-family: monospace; font-weight: 600; margin-top: 2px;">Compte Wave : ${escapeHtml(org.waveNumber)}</div>`
            : invoice.paymentMethod === "Orange Money" && org.omNumber
            ? `<div style="font-size: 10px; color: #171717; font-family: monospace; font-weight: 600; margin-top: 2px;">Compte OM : ${escapeHtml(org.omNumber)}</div>`
            : (invoice.paymentMethod === "Virement Bancaire" || !invoice.paymentMethod) && (org.iban || org.bankName)
            ? `<div style="font-size: 10px; color: #171717; font-family: monospace; font-weight: 600; margin-top: 2px;">${escapeHtml(org.bankName ? org.bankName + " · " : "")}IBAN : ${escapeHtml(org.iban || "")}</div>`
            : org.waveNumber
            ? `<div style="font-size: 10px; color: #171717; font-family: monospace; font-weight: 600; margin-top: 2px;">Wave : ${escapeHtml(org.waveNumber)}</div>`
            : ""
        }
        ${
          org.phone || org.email
            ? `<div style="font-size: 10px; color: #737373; font-family: monospace;">Contact : ${escapeHtml(org.phone || org.email)}</div>`
            : ""
        }
      </div>
      <div>
        <div class="signature-brand">${escapeHtml(org.legalName || org.name)}</div>
        <div style="font-size: 9.5px; color: #737373; margin-top: 3px; text-align: right;">Direction Générale</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Isolated Invoice Printing:
 * Renders the invoice inside an invisible, isolated iframe and calls print() on that iframe.
 * ZERO modal, ZERO sidebar, ZERO navigation can ever bleed into the printout or PDF.
 */
export function printInvoice(invoice: Invoice, org: Organization): void {
  if (typeof window === "undefined") return;

  const html = generateInvoiceHtml(invoice, org);

  let iframe = document.getElementById("gesfacture-print-frame") as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "gesfacture-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0.01";
    iframe.style.border = "none";
    iframe.style.pointerEvents = "none";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);
  }

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    // Fallback: open clean print window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
    return;
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  // Wait for images/styles in iframe, then trigger print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      // In case iframe print is restricted, fallback to new tab
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
      }
    }
  }, 200);
}

/**
 * Download Invoice directly as a PDF file (.pdf) saved to the client's desktop / computer.
 * Uses high-resolution html2canvas and jsPDF inside an isolated headless iframe.
 */
export async function downloadInvoicePdf(invoice: Invoice, org: Organization): Promise<void> {
  if (typeof window === "undefined") return;

  const html = generateInvoiceHtml(invoice, org);

  // Create isolated headless iframe
  const iframe = document.createElement("iframe");
  iframe.id = "gesfacture-pdf-export-frame";
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "794px"; // Standard A4 width at 96 DPI
  iframe.style.height = "1123px"; // Standard A4 height at 96 DPI
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error("Could not access iframe document");

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Small delay to ensure CSS and fonts are rendered
    await new Promise((res) => setTimeout(res, 350));

    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    const targetEl = (iframeDoc.querySelector(".invoice-container") as HTMLElement) || iframeDoc.body;

    const canvas = await html2canvas(targetEl, {
      scale: 2, // High resolution (300 DPI equivalent)
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    // JPEG plutôt que PNG : PDF ~10x plus léger (envoi par email / WhatsApp), fond blanc donc sans perte visible
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 6; // 6mm margin
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    // Smart single-page auto-fit:
    // If the invoice is 1-page length or slightly larger (up to 340mm), scale it proportionally to fit 100% on ONE single page!
    // This completely eradicates the empty/blank second page issue.
    const maxSinglePageHeight = pageHeight - margin * 2;
    if (contentHeight <= maxSinglePageHeight + 50) {
      const scale = contentHeight > maxSinglePageHeight ? maxSinglePageHeight / contentHeight : 1;
      const finalWidth = contentWidth * scale;
      const finalHeight = contentHeight * scale;
      const xOffset = margin + (contentWidth - finalWidth) / 2;
      const yOffset = margin;

      pdf.addImage(imgData, "JPEG", xOffset, yOffset, finalWidth, finalHeight);
    } else {
      // Extensive multi-page invoices with dozens of items
      let heightLeft = contentHeight;
      let position = margin;

      pdf.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight);
      heightLeft -= maxSinglePageHeight;

      // Only add a new page if remaining content is significant (> 25mm), never for leftover padding!
      while (heightLeft > 25) {
        position = heightLeft - contentHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", margin, position, contentWidth, contentHeight);
        heightLeft -= maxSinglePageHeight;
      }
    }

    pdf.save(`Facture-${invoice.number}.pdf`);
  } catch (err) {
    console.error("PDF generation error, falling back to standard print:", err);
    printInvoice(invoice, org);
  } finally {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Download Invoice as an HTML/Document file directly to client disk.
 */
export function downloadInvoiceDocument(invoice: Invoice, org: Organization): void {
  if (typeof window === "undefined") return;

  const html = generateInvoiceHtml(invoice, org);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Facture-${invoice.number}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
