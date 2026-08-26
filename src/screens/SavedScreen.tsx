import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabParamList } from '../navigation/RootNavigator';
import { useInvoiceStore } from '../state/InvoiceStore';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { colors, fonts, radii } from '../lib/theme';
import { longDate, money } from '../lib/davistaLib';
import type { Invoice } from '../lib/types';

export function SavedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TabParamList>>();
  const store = useInvoiceStore();
  const { saved, toast, newInvoice, openInvoice, duplicateInvoice, deleteInvoice } = store;
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return saved;
    return saved.filter(
      (s) => s.clientName.toLowerCase().includes(q) || s.invoiceNo.toLowerCase().includes(q)
    );
  }, [saved, query]);

  const goToEditor = (inv?: Invoice) => {
    if (inv) openInvoice(inv);
    navigation.navigate('Invoice');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Saved</Text>
        </View>
        <Text style={styles.count}>{saved.length}</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            newInvoice();
            goToEditor();
          }}
        >
          <Plus color="#fff" size={20} strokeWidth={2} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Search color={colors.muted2} size={16} strokeWidth={1.8} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search guest or number"
          placeholderTextColor={colors.muted2}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {saved.length ? 'No matches.' : 'No saved invoices yet. Fill the invoice and press Save.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowTop}>
              <Text style={styles.invNo}>{item.invoiceNo}</Text>
              <Text style={styles.total}>{money(item.total)}</Text>
            </View>
            <View style={styles.rowMid}>
              <Text style={styles.guestName}>{item.clientName}</Text>
              <Text style={styles.dateLabel}>{item.checkIn ? longDate(item.checkIn) : 'no dates'}</Text>
            </View>
            <View style={styles.rowActions}>
              <Button title="Open" small flex={1} onPress={() => goToEditor(item)} />
              <Button title="Duplicate" small flex={1} onPress={() => { duplicateInvoice(item); goToEditor(); }} />
              <Pressable style={styles.deleteBtn} onPress={() => deleteInvoice(item.id)} hitSlop={8}>
                <Trash2 color={colors.danger} size={18} strokeWidth={1.8} />
              </Pressable>
            </View>
          </View>
        )}
      />
      <Toast message={toast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontFamily: fonts.sansExtrabold, fontStyle: 'italic', fontSize: 19, color: colors.text },
  count: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.primary, marginLeft: 8 },
  addBtn: {
    marginLeft: 'auto',
    width: 38,
    height: 38,
    borderRadius: radii.buttonSm + 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 18,
    marginBottom: 10,
    height: 44,
    borderRadius: radii.input,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  list: { paddingHorizontal: 18, paddingBottom: 24, gap: 10 },
  row: {
    padding: 13,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.listCard,
    gap: 7,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  invNo: { fontFamily: fonts.monoExtrabold, fontSize: 11, color: colors.primary },
  total: { fontFamily: fonts.monoExtrabold, fontSize: 13, color: colors.text },
  rowMid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  guestName: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.text },
  dateLabel: { fontFamily: fonts.monoMedium, fontSize: 10, color: colors.muted },
  rowActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  deleteBtn: {
    width: 44,
    height: 34,
    borderRadius: radii.buttonSm,
    borderWidth: 1,
    borderColor: '#F0D5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radii.listCard,
  },
  emptyText: { color: colors.muted, textAlign: 'center' },
});
