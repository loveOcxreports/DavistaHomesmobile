import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Invoice } from '../lib/types';
import { buildSheetHtml, invoicePdfFileName } from './sheetHtml';

// A4 at 72dpi = 595 x 842 pt.
const A4_WIDTH = 595;
const A4_HEIGHT = 842;

async function renderPdf(invoice: Invoice): Promise<string> {
  const html = buildSheetHtml(invoice, 'a4');
  const { uri } = await Print.printToFileAsync({ html, width: A4_WIDTH, height: A4_HEIGHT });
  const source = new File(uri);
  const dest = new File(Paths.cache, invoicePdfFileName(invoice));
  if (dest.exists) dest.delete();
  await source.copy(dest);
  return dest.uri;
}

export async function exportInvoicePdf(invoice: Invoice): Promise<string> {
  return renderPdf(invoice);
}

export async function shareInvoicePdf(invoice: Invoice): Promise<void> {
  const path = await renderPdf(invoice);
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(path, {
    mimeType: 'application/pdf',
    dialogTitle: invoicePdfFileName(invoice),
    UTI: 'com.adobe.pdf',
  });
}
