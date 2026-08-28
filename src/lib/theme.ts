// Design tokens — see README.md "Design tokens" table in the design handoff.

export const colors = {
  primary: '#8C2F39',
  primaryDeep: '#6B2028',
  termsHeading: '#C0504D',
  canvas: '#FFFFFF',
  canvasAlt: '#F3E9EA',
  surfaceTint: '#FCF8F8',
  rowTint: '#FBF6F6',
  border: '#E6D8D9',
  borderSoft: '#EFE3E4',
  text: '#1A1416',
  text2: '#3A2C2F',
  muted: '#8A6F73',
  muted2: '#A08C90',
  danger: '#B91C1C',
  ok: '#16A34A',
  info: '#1D4ED8',
  violet: '#6D28D9',
  sheetInk1: '#111111',
  sheetInk2: '#374151',
  sheetInk3: '#4b5563',
  sheetInk4: '#6b7280',
  sheetLine1: '#e5e7eb',
  sheetLine2: '#eef0f3',
  sheetLine3: '#f4f5f7',
  sheetStrip1: '#fafbfc',
  sheetStrip2: '#f6f8fb',
};

export const dotColors = {
  guest: '#8C2F39',
  dates: '#1D4ED8',
  lines: '#16A34A',
  terms: '#6D28D9',
};

// Sora ships no italic cut in @expo-google-fonts — titles that call for
// "800 italic" use fontStyle: 'italic' on the ExtraBold weight, which the
// platform renders as a synthetic slant. The invoice sheet itself is HTML
// (WebView + PDF export), where real CSS italics apply regardless.
export const fonts = {
  sansRegular: 'Sora_500Medium',
  sansSemibold: 'Sora_600SemiBold',
  sansBold: 'Sora_700Bold',
  sansExtrabold: 'Sora_800ExtraBold',
  monoMedium: 'JetBrainsMono_500Medium',
  monoSemibold: 'JetBrainsMono_600SemiBold',
  monoBold: 'JetBrainsMono_700Bold',
  monoExtrabold: 'JetBrainsMono_800ExtraBold',
};

export const spacing = {
  xxs: 2, xs: 4, sm: 5, s: 7, ms: 8, m: 9, ml: 10, l: 11, xl: 12, xxl: 14, gutter: 18, hero: 22,
};

export const radii = {
  input: 9, buttonSm: 8, sheet: 6, lineBlock: 11, listCard: 12, editorCard: 14, logoChip: 10, full: 999,
};

export const shadows = {
  primaryButton: { shadowColor: '#8C2F39', shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  sheet: { shadowColor: '#5A1E26', shadowOpacity: 0.2, shadowRadius: 34, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  toast: { shadowColor: '#000', shadowOpacity: 0.38, shadowRadius: 26, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
};
