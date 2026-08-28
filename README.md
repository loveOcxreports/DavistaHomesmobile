# Davista Invoice — Mobile

Native iOS/Android app (Expo, React Native, TypeScript) for **Davista Homes**
staff to build a guest invoice on their phone and export/share it as a PDF.
Same product and data model as the sibling web app
(`davistahomesinvoices`) — see that repo's design handoff README for the
full spec this implements.

## Stack

Expo (managed workflow) + React Navigation (bottom tabs + a pushed Preview
screen) + AsyncStorage + `expo-print`/`expo-sharing` for PDF export.

## Getting started

```
npm install
npm run ios      # or: npm run android
```

## Project layout

```
App.tsx                      entry: font loading, providers, navigator
src/
  lib/
    types.ts                 Invoice / Line / Client types
    davistaLib.ts             pure business logic — ported verbatim from the
                              design prototype: words(), longDate(),
                              nightsBetween(), money(), totals, auto-numbering
    theme.ts                  design tokens (colors, fonts, spacing, radii)
    storage.ts                AsyncStorage read/write, versioned keys
    useAppFonts.ts             Sora / JetBrains Mono loader
  state/
    InvoiceStore.tsx           app state (React context) + all actions
                              (save/new/duplicate/delete invoice, guest book,
                              terms defaults) — the single data-access layer,
                              so swapping storage for a backend later only
                              touches this file
  navigation/
    RootNavigator.tsx          bottom tabs (Invoice/Saved/Guests) + Preview
                              pushed on top, per the "Preview is a pushed
                              screen, not a tab" spec
  screens/
    InvoiceEditorScreen.tsx    the editor (default tab)
    PreviewScreen.tsx          live A4 preview (WebView) + Share/Export PDF
    SavedScreen.tsx            saved invoices, search, open/duplicate/delete
    GuestsScreen.tsx           guest book, "Use" fills the editor
  components/                  Field, DateField, Card, Button, Toast,
                              SwipeableRow (swipe-to-delete on line items)
  pdf/
    sheetHtml.ts                generates the invoice sheet as an HTML string
                              — the single source of truth for both the
                              in-app Preview (WebView) and the exported PDF
    exportPdf.ts                expo-print + expo-sharing wiring
```

## The invoice sheet — two scales, one generator

`sheetHtml.ts` renders the same markup at two CSS scales:

- **`'phone'`** — the mobile design's phone-scaled type sizes, used by the
  in-app Preview screen's WebView.
- **`'a4'`** — the *desktop* scale (identical numbers to the web app's
  `.sheet` CSS), used only for `expo-print` PDF export, so the exported
  document matches the client's original invoice at full resolution. The
  physical page size/margins come from `@page { size: A4; margin: 14mm }`;
  the sheet itself fills 100% of the printable width rather than a
  hardcoded pixel width, which avoids width/DPI mismatches across print
  engines.

Content (wording, column order, terms/payment/signature text) reproduces
the client's original invoice verbatim and must not be reworded or
reordered — see `INVOICE - Godwin New.pdf` in the design handoff.

## Verified without a device

This sandbox has no iOS/Android simulator, so verification here was:

- `npx tsc --noEmit` — clean, zero errors, across the whole app.
- `npx expo export --platform ios` and `--platform android` — both bundle
  successfully (2800+ modules resolved, all font/icon assets packaged).
- `npx expo config` — confirms `app.json` resolves to a valid config.
- The `sheetHtml.ts` generator (pure, no RN imports) was extracted and
  rendered standalone through headless Chromium at both scales, and the
  `'a4'` output was diffed against the client's original invoice PDF for
  content fidelity, and against a headless-Chromium print of the sibling
  web app for scale fidelity.

None of this replaces running the app on an actual device/simulator before
shipping — do that next, particularly: the native date picker on both
platforms, swipe-to-delete gesture feel, the keyboard-avoiding action bar,
and the real `expo-print` → `expo-sharing` → WhatsApp/email flow.

## Data & persistence

AsyncStorage, offline-first, no backend — same keys as the web app:

| Key | Holds |
|---|---|
| `davista_invoices_v1` | Saved invoices |
| `davista_clients_v1` | Guest book |
| `davista_terms_v1` | Default terms & conditions |
| `davista_addr_v1` | Last-used property address |
