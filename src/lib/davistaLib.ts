// Davista Homes Invoice — shared business logic.
// Ported verbatim (same behavior) from the design prototype's script block
// and from the sibling web app's lib.js. Pure functions only — no RN imports —
// so this file is trivially unit-testable.

import type { Invoice, Line } from './types';

export const DEFAULT_ADDR = 'Apt 4 – 1 S D Dan-Iya Close, Guzape, Abuja';

export const DEFAULT_TERMS = [
  'Check-in is 2pm and Check-out is 12noon',
  'All properties and features of the apartment should be kept in the appropriate manner before leaving.',
  'A security deposit of N100,000.00 will be made (refundable if nothing is damaged)',
  'Light consumption is very expensive so we plead with guests to always switch appliances not in use.',
  'No Smoking in the Apartment – If you need to smoke, please make use of the balcony because smoking in the apartment attracts a fees of N50,000.00 (covers for deep cleaning)',
  'Parties are not allowed in the apartment or any form of loud noise that can disturb the neighborhood.',
  'Any damaged property or feature caused by the guest will be replaced by the guest or paid for.',
  'The payment for the apartment does not cover activities as guest is expected to pay separately for activities and games',
].join('\n');

export const DEFAULT_PAYMENT =
  'PAYMENT; Account No: 6503859987 | Bank: Providus Bank | Name: Ehichioya Osagie David';
export const DEFAULT_SIGN_NAME = 'Emmanuel Offei';
export const DEFAULT_SIGN_ROLE = 'Manager (08109233737) | blacklinksgh@gmail.com';
export const DEFAULT_LINE: Line = { desc: 'Payment for 3 Bedroom Apartment', unit: 1, nights: 1, price: 200000 };
export const FIRST_INVOICE_NO = 34749;

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function under1000(n: number): string {
  let s = '';
  if (n >= 100) {
    s += ONES[Math.floor(n / 100)] + ' Hundred';
    n %= 100;
    if (n) s += ' and ';
  }
  if (n >= 20) {
    s += TENS[Math.floor(n / 10)];
    if (n % 10) s += '-' + ONES[n % 10];
  } else if (n > 0) {
    s += ONES[n];
  }
  return s;
}

export function words(num: number): string {
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Naira';
  const groups: [number, string][] = [
    [1e9, 'Billion'],
    [1e6, 'Million'],
    [1e3, 'Thousand'],
  ];
  let rest = n;
  const out: string[] = [];
  for (const [v, label] of groups) {
    if (rest >= v) {
      out.push(under1000(Math.floor(rest / v)) + ' ' + label);
      rest %= v;
    }
  }
  if (rest) out.push(under1000(rest));
  let s = out.join(' ') + ' Naira';
  const kobo = Math.round((Math.abs(num) - n) * 100);
  if (kobo) s += ', ' + under1000(kobo) + ' Kobo';
  return s;
}

function ord(d: number): string {
  if (d % 100 >= 11 && d % 100 <= 13) return d + 'th';
  return d + ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10];
}

export function longDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  return ord(d) + ' ' + MONTHS[m - 1] + ' ' + y;
}

export function nightsBetween(a: string, b: string): number {
  if (!a || !b) return 0;
  const ms = new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime();
  return ms > 0 ? Math.round(ms / 86400000) : 0;
}

export function money(n: number | undefined): string {
  return 'N' + (Number(n) || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function pad10(n: number): string {
  return String(n).padStart(10, '0');
}

export function nextInvoiceNo(saved: Invoice[]): number {
  const nums = (saved || []).map((s) => parseInt(s.invoiceNo, 10)).filter((n) => !isNaN(n));
  return (nums.length ? Math.max.apply(null, nums) : FIRST_INVOICE_NO) + 1;
}

export function lineTotal(l: Line): number {
  return (Number(l.unit) || 0) * (Number(l.nights) || 0) * (Number(l.price) || 0);
}

export function grandTotal(f: Invoice): number {
  return (f.lines || []).reduce((sum, l) => sum + lineTotal(l), 0);
}

export function durationLabel(l: Line): string {
  const n = Number(l.nights) || 0;
  return n + (n === 1 ? ' Night' : ' Nights');
}

export function stayLine(f: Invoice): string {
  if (!f.checkIn && !f.checkOut) return '';
  return (
    'CheckIn: ' + f.inTime + ' – ' + longDate(f.checkIn) + ' – ' + longDate(f.checkOut) +
    ' (CheckOut: On or Before ' + f.outTime + ')'
  );
}

export function termsList(f: Invoice): string[] {
  return String(f.terms || '')
    .split('\n')
    .filter((t) => t.trim())
    .map((t) => t.trim());
}

export function blankInvoice(invoiceNo: string, opts?: { companyAddr?: string; terms?: string }): Invoice {
  return {
    id: 'inv_' + Date.now(),
    invoiceNo,
    companyAddr: opts?.companyAddr || DEFAULT_ADDR,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    checkIn: '',
    checkOut: '',
    inTime: '2pm',
    outTime: '12noon',
    lines: [{ ...DEFAULT_LINE }],
    terms: opts?.terms || DEFAULT_TERMS,
    payment: DEFAULT_PAYMENT,
    signName: DEFAULT_SIGN_NAME,
    signRole: DEFAULT_SIGN_ROLE,
    total: 0,
    savedAt: null,
  };
}
