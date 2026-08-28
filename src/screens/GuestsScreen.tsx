import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabParamList } from '../navigation/RootNavigator';
import { useInvoiceStore } from '../state/InvoiceStore';
import { Button } from '../components/Button';
import { colors, fonts, radii } from '../lib/theme';
import type { Client } from '../lib/types';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

export function GuestsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TabParamList>>();
  const { clients, useClient } = useInvoiceStore();

  const onUse = (c: Client) => {
    useClient(c);
    navigation.navigate('Invoice');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Guests</Text>
        <Text style={styles.count}>{clients.length}</Text>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item, i) => item.name + i}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Guests are added to this book each time you save an invoice.</Text>
          </View>
        }
        ListFooterComponent={
          clients.length ? (
            <View style={styles.footerNote}>
              <Text style={styles.emptyText}>Guests are added to this book each time you save an invoice.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(item.name)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
              <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
            </View>
            <Button title="Use" small variant="gold" onPress={() => onUse(item)} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontFamily: fonts.sansExtrabold, fontStyle: 'italic', fontSize: 19, color: colors.text },
  count: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.primary },
  list: { paddingHorizontal: 18, paddingBottom: 24, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.listCard,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.canvasAlt,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.sansExtrabold, fontSize: 13, color: colors.primary },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.text },
  phone: { fontFamily: fonts.monoMedium, fontSize: 10.5, color: colors.text2 },
  email: { fontSize: 10.5, color: colors.muted },
  empty: {
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radii.listCard,
  },
  emptyText: { color: colors.muted, textAlign: 'center' },
  footerNote: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radii.listCard,
    marginTop: 4,
  },
});
