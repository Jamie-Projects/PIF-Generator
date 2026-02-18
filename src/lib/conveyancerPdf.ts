import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ConveyancerSummary, RiskFlag } from './riskAnalysis';

export function generateConveyancerPdf(summary: ConveyancerSummary): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Conveyancer Summary Report', pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Risk Analysis — Property Information Form', pageWidth / 2, 36, { align: 'center' });

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(20, 41, pageWidth - 20, 41);

  // Property info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  let y = 50;

  doc.setFont('helvetica', 'bold');
  doc.text('Property:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(summary.propertyAddress || 'Not specified', 55, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Seller:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(summary.sellerName || 'Not specified', 55, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Generated:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(summary.generatedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }), 55, y);

  // Overview boxes
  y += 14;
  const boxWidth = (pageWidth - 60) / 3;
  const boxHeight = 22;

  // Red box
  doc.setFillColor(254, 226, 226);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(20, y, boxWidth, boxHeight, 3, 3, 'FD');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(String(summary.redFlags.length), 20 + boxWidth / 2, y + 12, { align: 'center' });
  doc.setFontSize(8);
  doc.text('RED FLAGS', 20 + boxWidth / 2, y + 18, { align: 'center' });

  // Amber box
  const amberX = 30 + boxWidth;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(amberX, y, boxWidth, boxHeight, 3, 3, 'FD');
  doc.setFontSize(18);
  doc.setTextColor(146, 64, 14);
  doc.text(String(summary.amberFlags.length), amberX + boxWidth / 2, y + 12, { align: 'center' });
  doc.setFontSize(8);
  doc.text('AMBER FLAGS', amberX + boxWidth / 2, y + 18, { align: 'center' });

  // Green box
  const greenX = 40 + boxWidth * 2;
  doc.setFillColor(209, 250, 229);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(greenX, y, boxWidth, boxHeight, 3, 3, 'FD');
  doc.setFontSize(18);
  doc.setTextColor(21, 128, 61);
  doc.text(String(summary.greenCount), greenX + boxWidth / 2, y + 12, { align: 'center' });
  doc.setFontSize(8);
  doc.text('CLEAR', greenX + boxWidth / 2, y + 18, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  y += boxHeight + 10;

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`${summary.totalChecked} risk factors assessed from the property information form data.`, 20, y);
  y += 10;

  // Red flags section
  if (summary.redFlags.length > 0) {
    y = renderFlagSection(doc, 'Red Flags — Immediate Attention Required', summary.redFlags, y, [185, 28, 28], [254, 226, 226]);
  }

  // Amber flags section
  if (summary.amberFlags.length > 0) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }
    y = renderFlagSection(doc, 'Amber Flags — Further Investigation Recommended', summary.amberFlags, y, [146, 64, 14], [254, 243, 199]);
  }

  // Green summary
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text('Clear Items', 20, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(
    `${summary.greenCount} items were assessed and raised no concerns based on the information provided.`,
    20, y
  );
  y += 12;

  // Disclaimer
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.setFont('helvetica', 'italic');
  const disclaimer = 'Disclaimer: This summary is auto-generated from the seller\'s Property Information Form responses. It is not legal advice. All flagged items should be independently verified by the buyer\'s conveyancer through appropriate searches, enquiries, and professional surveys.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 40);
  doc.text(disclaimerLines, 20, y);

  // Footer on each page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).getNumberOfPages?.() ?? (doc.internal as any).getNumberOfPages?.() ?? 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} | Conveyancer Summary Report | Generated by PIF Generator`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  return doc;
}

function renderFlagSection(
  doc: jsPDF,
  title: string,
  flags: RiskFlag[],
  startY: number,
  headerColor: [number, number, number],
  bgColor: [number, number, number]
): number {
  let y = startY;

  // Section header
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...headerColor);
  doc.text(title, 20, y);
  y += 4;

  const rows = flags.map(f => [
    f.section,
    f.summary,
    f.advice,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Section', 'Issue', 'Recommended Action']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: headerColor,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: bgColor,
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 'auto' },
    },
    margin: { left: 20, right: 20 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable.finalY + 12;
}
