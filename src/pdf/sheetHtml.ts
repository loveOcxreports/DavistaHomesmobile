// Generates the invoice sheet as a standalone HTML document.
//
// Two scales, per the design handoff:
//  - 'phone'  — the in-app Preview screen (WebView), using the mobile
//               design's phone-scaled type sizes, fluid width.
//  - 'a4'     — expo-print PDF export, using the *desktop* scale (same
//               numbers as the sibling web app's .sheet CSS) so the
//               exported document matches the client's original invoice
//               at full resolution. The physical page comes from @page;
//               the sheet itself fills 100% of the printable width rather
//               than a hardcoded pixel width, which is what avoids
//               width/DPI mismatches between print engines.
//
// Content (wording, column order, terms/payment/signature text) reproduces
// the client's original invoice and must not be reworded or reordered.

import type { Invoice } from '../lib/types';
import { durationLabel, grandTotal, lineTotal, money, stayLine, termsList, words } from '../lib/davistaLib';

export type SheetScale = 'phone' | 'a4';

function esc(s: string | number | undefined | null): string {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const PHONE_STYLE = `
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { font: 12px/1.5 'Sora', -apple-system, sans-serif; color: #111; padding: 16px 14px 20px; }
  .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .title { font: italic 800 24px/1 'Sora', sans-serif; letter-spacing: .02em; color: #8C2F39; }
  .eyebrow { margin-top: 10px; font: 700 7.5px 'Sora', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #6b7280; }
  .invno { font: 800 12px 'JetBrains Mono', monospace; color: #111; }
  .company { text-align: right; }
  .company-name { font: 800 11px 'Sora', sans-serif; letter-spacing: .04em; color: #8C2F39; }
  .company-addr { max-width: 130px; color: #4b5563; font-size: 8.5px; margin-top: 3px; margin-left: auto; }
  .rule { height: 2.5px; background: #8C2F39; margin: 14px 0 12px; border-radius: 2px; }
  .billed-eyebrow { font: 700 7.5px 'Sora', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #6b7280; }
  .client-name { margin-top: 4px; font: 700 11.5px 'Sora', sans-serif; }
  .client-phone { color: #4b5563; font: 500 9.5px 'JetBrains Mono', monospace; }
  .client-email { color: #4b5563; font-size: 9.5px; }
  .table { margin-top: 14px; border: 1px solid #e5e7eb; border-radius: 5px; overflow: hidden; }
  .thead { display: grid; grid-template-columns: minmax(0,1fr) 30px minmax(52px,max-content) minmax(66px,max-content); background: #8C2F39; color: #fff; font: 700 7px 'Sora', sans-serif; letter-spacing: .08em; text-transform: uppercase; }
  .thead > div { padding: 8px 9px; }
  .thead .c { text-align: center; padding: 8px 4px; }
  .thead .r { text-align: right; white-space: nowrap; }
  .row { display: grid; grid-template-columns: minmax(0,1fr) 30px minmax(52px,max-content) minmax(66px,max-content); border-top: 1px solid #eef0f3; }
  .row > div { padding: 9px; font-size: 10px; }
  .c-unit, .c-dur { text-align: center; padding: 9px 4px; font: 600 9.5px 'JetBrains Mono', monospace; white-space: nowrap; }
  .c-price { text-align: right; font: 700 9.5px 'JetBrains Mono', monospace; white-space: nowrap; }
  .linetotal { display: grid; grid-template-columns: minmax(0,1fr) 30px minmax(52px,max-content) minmax(66px,max-content); border-top: 1px solid #f4f5f7; background: #fafbfc; }
  .lt-label { grid-column: 1 / span 3; padding: 7px 9px; font-size: 9px; color: #6b7280; }
  .lt-value { grid-column: 4; padding: 7px 9px; text-align: right; font: 700 9.5px 'JetBrains Mono', monospace; white-space: nowrap; }
  .stayline { margin-top: 11px; font-size: 9px; color: #374151; }
  .totals-wrap { margin-top: 14px; display: flex; justify-content: flex-end; }
  .totals { min-width: 180px; border-top: 2px solid #8C2F39; padding-top: 8px; text-align: right; }
  .totals-row { display: flex; align-items: baseline; justify-content: flex-end; gap: 10px; }
  .totals-label { font: 700 8px 'Sora', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #6b7280; }
  .totals-value { font: 800 15px 'JetBrains Mono', monospace; color: #8C2F39; }
  .totals-words { margin-top: 4px; font: italic 600 8.5px 'Sora', sans-serif; color: #4b5563; }
  .terms { margin-top: 20px; }
  .terms-heading { font: 700 9.5px 'Sora', sans-serif; color: #C0504D; }
  .terms ul { margin: 8px 0 0; padding-left: 16px; display: flex; flex-direction: column; gap: 5px; color: #374151; font-size: 8.5px; line-height: 1.45; }
  .payment { margin-top: 20px; padding: 11px 13px; background: #f6f8fb; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 9.5px; color: #111; }
  .sign { margin-top: 18px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
  .sign-name { font: 700 12.5px 'Sora', sans-serif; }
  .sign-role { color: #4b5563; font-size: 11.5px; }
`;

// Matches the sibling web app's .sheet CSS (davistahomesinvoices/styles.css)
// verbatim — the desktop scale ported from the design prototype.
const A4_STYLE = `
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { font: 12.5px/1.5 'Sora', -apple-system, sans-serif; color: #111; padding: 0; }
  .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
  .title { font: italic 800 34px/1 'Sora', sans-serif; letter-spacing: .02em; color: #8C2F39; }
  .eyebrow { margin-top: 10px; font: 700 9.5px 'Sora', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #6b7280; }
  .invno { font: 800 15px 'JetBrains Mono', monospace; color: #111; }
  .company { text-align: right; }
  .company-name { font: 800 15px 'Sora', sans-serif; letter-spacing: .04em; color: #8C2F39; }
  .company-addr { max-width: 250px; color: #4b5563; font-size: 11.5px; margin-top: 3px; margin-left: auto; }
  .rule { height: 3px; background: #8C2F39; margin: 20px 0 18px; border-radius: 2px; }
  .billed-eyebrow { font: 700 9.5px 'Sora', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #6b7280; }
  .client-name { margin-top: 4px; font: 700 14px 'Sora', sans-serif; }
  .client-phone { color: #4b5563; font: 500 12px 'JetBrains Mono', monospace; }
  .client-email { color: #4b5563; font-size: 12px; }
  .table { margin-top: 22px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
  .thead { display: grid; grid-template-columns: minmax(0,1fr) 44px minmax(78px,max-content) minmax(100px,max-content); background: #8C2F39; color: #fff; font: 700 9.5px 'Sora', sans-serif; letter-spacing: .1em; text-transform: uppercase; }
  .thead > div { padding: 9px 12px; }
  .thead .c { text-align: center; padding: 9px 6px; }
  .thead .r { text-align: right; white-space: nowrap; }
  .row { display: grid; grid-template-columns: minmax(0,1fr) 44px minmax(78px,max-content) minmax(100px,max-content); border-top: 1px solid #eef0f3; }
  .row > div { padding: 11px 12px; font-size: 12.5px; }
  .c-unit, .c-dur { text-align: center; padding: 11px 6px; font: 600 12px 'JetBrains Mono', monospace; white-space: nowrap; }
  .c-price { text-align: right; font: 700 12px 'JetBrains Mono', monospace; white-space: nowrap; }
  .linetotal { display: grid; grid-template-columns: minmax(0,1fr) 44px minmax(78px,max-content) minmax(100px,max-content); border-top: 1px solid #f4f5f7; background: #fafbfc; }
  .lt-label { grid-column: 1 / span 3; padding: 8px 12px; font-size: 11px; color: #6b7280; }
  .lt-value { grid-column: 4; padding: 8px 12px; text-align: right; font: 700 12px 'JetBrains Mono', monospace; white-space: nowrap; }
  .stayline { margin-top: 16px; font-size: 12px; color: #374151; }
  .totals-wrap { margin-top: 18px; display: flex; justify-content: flex-end; }
  .totals { min-width: 300px; border-top: 2px solid #8C2F39; padding-top: 10px; text-align: right; }
  .totals-row { display: flex; align-items: baseline; justify-content: flex-end; gap: 12px; }
  .totals-label { font: 700 11px 'Sora', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #6b7280; }
  .totals-value { font: 800 20px 'JetBrains Mono', monospace; color: #8C2F39; }
  .totals-words { margin-top: 4px; font: italic 600 11.5px 'Sora', sans-serif; color: #4b5563; }
  .terms { margin-top: 24px; }
  .terms-heading { font: 700 12px 'Sora', sans-serif; color: #C0504D; }
  .terms ul { margin: 8px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; color: #374151; font-size: 11.5px; line-height: 1.5; }
  .payment { margin-top: 24px; padding: 11px 13px; background: #f6f8fb; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 11.5px; color: #111; }
  .sign { margin-top: 22px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
  .sign-name { font: 700 12.5px 'Sora', sans-serif; }
  .sign-role { color: #4b5563; font-size: 11.5px; }
`;

export function buildSheetHtml(f: Invoice, scale: SheetScale = 'phone'): string {
  const total = grandTotal(f);
  const terms = termsList(f);

  const rowsHtml = f.lines
    .map((l) => {
      return `
        <div class="row">
          <div class="c-desc">${esc(l.desc)}</div>
          <div class="c-unit">${esc(l.unit)}</div>
          <div class="c-dur">${esc(durationLabel(l))}</div>
          <div class="c-price">${esc(money(l.price))}</div>
        </div>
        <div class="linetotal">
          <div class="lt-label">Line total</div>
          <div class="lt-value">${esc(money(lineTotal(l)))}</div>
        </div>`;
    })
    .join('');

  const termsHtml = terms.length
    ? `<div class="terms">
        <div class="terms-heading">Terms and Conditions;</div>
        <ul>${terms.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>`
    : '';

  const stay = stayLine(f);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${scale === 'a4' ? A4_STYLE : PHONE_STYLE}</style>
</head>
<body>
  <div class="head">
    <div>
      <div class="title">INVOICE</div>
      <div class="eyebrow">INVOICE NUMBER</div>
      <div class="invno">${esc(f.invoiceNo)}</div>
    </div>
    <div class="company">
      <div class="company-name">DAVISTA HOMES</div>
      <div class="company-addr">${esc(f.companyAddr)}</div>
    </div>
  </div>

  <div class="rule"></div>

  <div class="billed-eyebrow">BILLED TO</div>
  <div class="client-name">${esc(f.clientName)}</div>
  <div class="client-phone">${esc(f.clientPhone)}</div>
  <div class="client-email">${esc(f.clientEmail)}</div>

  <div class="table">
    <div class="thead">
      <div>DESCRIPTION</div><div class="c">UNIT</div><div class="c">DURATION</div><div class="r">UNIT PRICE (N)</div>
    </div>
    ${rowsHtml}
  </div>

  ${stay ? `<div class="stayline">${esc(stay)}</div>` : ''}

  <div class="totals-wrap">
    <div class="totals">
      <div class="totals-row">
        <span class="totals-label">Total;</span>
        <span class="totals-value">${esc(money(total))}</span>
      </div>
      <div class="totals-words">${esc(words(total))}</div>
    </div>
  </div>

  ${termsHtml}

  <div class="payment">${esc(f.payment)}</div>

  <div class="sign">
    <div class="sign-name">${esc(f.signName)}</div>
    <div class="sign-role">${esc(f.signRole)}</div>
  </div>
</body>
</html>`;
}

export function invoicePdfFileName(f: Invoice): string {
  const surname = (f.clientName.trim().split(/\s+/).pop() || 'Guest').replace(/[^a-zA-Z0-9-]/g, '');
  return `Davista-Invoice-${f.invoiceNo}-${surname}.pdf`;
}
