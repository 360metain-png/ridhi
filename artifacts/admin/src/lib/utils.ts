import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toCSV(rows: Record<string, string | number>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

export function downloadCSV(filename: string, rows: Record<string, string | number>[]) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Dynamic import for PDF generation (only loads when needed)
export async function downloadPDF(filename: string, title: string, rows: Record<string, string | number>[]) {
  if (!rows.length) return;
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(123, 47, 190);
  doc.rect(0, 0, pageWidth, 48, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Ridhi", 28, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Admin Dashboard Report", 28 + doc.getTextWidth("Ridhi") + 10, 30);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 28, 74);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 28, 74, { align: "right" });

  // Table
  const headers = Object.keys(rows[0]);
  const body = rows.map((r) => headers.map((h) => String(r[h])));
  autoTable(doc, {
    head: [headers.map((h) => h.replace(/_/g, " ").toUpperCase())],
    body,
    startY: 88,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [123, 47, 190], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    margin: { left: 28, right: 28 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 28, doc.internal.pageSize.getHeight() - 18, { align: "right" });
    doc.text("Ridhi Admin Dashboard  Confidential", 28, doc.internal.pageSize.getHeight() - 18);
  }

  doc.save(filename);
}
