import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useInvoiceStore } from '../state/InvoiceStore';
import { buildSheetHtml } from '../pdf/sheetHtml';
import { exportInvoicePdf, shareInvoicePdf } from '../pdf/exportPdf';
import { Button } from '../components/Button';
import { HtmlSheetView } from '../components/HtmlSheetView';
import { colors, fonts, radii, shadows } from '../lib/theme';

export function PreviewScreen() {
  const navigation = useNavigation();
  const { f } = useInvoiceStore();
  const [busy, setBusy] = useState<'export' | 'share' | null>(null);

  const html = useMemo(() => buildSheetHtml(f, 'phone'), [f]);

  const onExport = async () => {
    setBusy('export');
    try {
      const path = await exportInvoicePdf(f);
      // On web the print dialog itself is the feedback — a JS alert would
      // just stack on top of it.
      if (Platform.OS !== 'web') Alert.alert('PDF exported', path);
    } catch (e) {
      Alert.alert('Export failed', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const onShare = async () => {
    setBusy('share');
    try {
      await shareInvoicePdf(f);
    } catch (e) {
      Alert.alert('Share failed', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <ChevronLeft color={colors.primary} size={22} strokeWidth={1.8} />
        </Pressable>
        <Text style={styles.title}>Preview</Text>
        <Text style={styles.meta}>A4 · 1 page</Text>
      </View>

      <View style={styles.canvas}>
        <View style={[styles.sheetCard, shadows.sheet]}>
          <HtmlSheetView html={html} />
        </View>
      </View>

      <View style={styles.actionBar}>
        <Button title="Share" variant="ghost" flex={1} onPress={onShare} disabled={busy !== null} />
        <Button title="Export PDF" variant="gold" flex={1} onPress={onExport} disabled={busy !== null} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvasAlt },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  title: { fontFamily: fonts.sansExtrabold, fontStyle: 'italic', fontSize: 17, color: colors.text },
  meta: { marginLeft: 'auto', fontFamily: fonts.monoBold, fontSize: 10, color: '#8A6F73' },
  canvas: { flex: 1, padding: 14 },
  sheetCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: radii.sheet,
    overflow: 'hidden',
  },
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.canvas,
  },
});
