// Web build of the PDF export/share flow — Metro/react-native-web picks
// this over exportPdf.ts automatically on the web platform.
//
// expo-print's web shim ignores the html argument entirely and just calls
// window.print() on the current page, and expo-file-system's File/Paths API
// has no meaningful web target — neither is usable here. Instead this opens
// the same 'a4'-scale sheet HTML (the same one expo-print renders natively)
// in a new tab and triggers the browser's print dialog, mirroring exactly
// what the sibling web app's "Export PDF" does. There's no real filesystem
// PDF to hand to navigator.share on web, so Share uses the same print
// dialog — most mobile browsers expose their own Share sheet from within it
// once "Save as PDF" is chosen.

import type { Invoice } from '../lib/types';
import { buildSheetHtml, invoicePdfFileName } from './sheetHtml';

function printHtml(html: string): void {
  const win = window.open('', '_blank');
  if (!win) {
    throw new Error('Pop-up blocked — allow pop-ups for this site to export the PDF.');
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 300);
}

export async function exportInvoicePdf(invoice: Invoice): Promise<string> {
  printHtml(buildSheetHtml(invoice, 'a4'));
  return invoicePdfFileName(invoice);
}

export async function shareInvoicePdf(invoice: Invoice): Promise<void> {
  printHtml(buildSheetHtml(invoice, 'a4'));
}
