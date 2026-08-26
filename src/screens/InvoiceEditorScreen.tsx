import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useInvoiceStore } from '../state/InvoiceStore';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { DateField } from '../components/DateField';
import { Button } from '../components/Button';
import { SwipeableRow } from '../components/SwipeableRow';
import { Toast } from '../components/Toast';
import { colors, dotColors, fonts, radii } from '../lib/theme';
import { durationLabel, grandTotal, lineTotal, money, nightsBetween } from '../lib/davistaLib';

export function InvoiceEditorScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const store = useInvoiceStore();
  const { f, toast, updateField, updateLine, addLine, removeLine, useDatesForLine, saveInvoice } = store;
  const [editingNo, setEditingNo] = useState(false);

  if (!store.ready) return null;

  const autoNights = nightsBetween(f.checkIn, f.checkOut);
  const total = grandTotal(f);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={styles.logoChip}>
            <Text style={styles.logoChipText}>DH</Text>
          </View>
          <View>
            {editingNo ? (
              <TextInput
                style={styles.invoiceNoInput}
                value={f.invoiceNo}
                autoFocus
                onChangeText={(v) => updateField('invoiceNo', v)}
                onBlur={() => setEditingNo(false)}
                onSubmitEditing={() => setEditingNo(false)}
              />
            ) : (
              <Text style={styles.eyebrow} onPress={() => setEditingNo(true)}>
                INVOICE · {f.invoiceNo}
              </Text>
            )}
            <Text style={styles.title}>New invoice</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Card title="Guest" dotColor={dotColors.guest}>
            <View style={styles.grid}>
              <Field label="Billed to" placeholder="Guest name" value={f.clientName} onChangeText={(v) => updateField('clientName', v)} spanFull />
              <Field label="Phone" placeholder="08030408640" keyboardType="phone-pad" value={f.clientPhone} onChangeText={(v) => updateField('clientPhone', v)} />
              <Field label="Email" placeholder="guest@email.com" keyboardType="email-address" autoCapitalize="none" value={f.clientEmail} onChangeText={(v) => updateField('clientEmail', v)} />
              <Field label="Property address" value={f.companyAddr} onChangeText={(v) => updateField('companyAddr', v)} spanFull />
            </View>
          </Card>

          <Card
            title="Stay dates"
            dotColor={dotColors.dates}
            readout={autoNights ? `${autoNights} ${autoNights === 1 ? 'night' : 'nights'}` : '—'}
          >
            <View style={styles.gridDates}>
              <DateField label="Check-in" value={f.checkIn} onChange={(v) => updateField('checkIn', v)} />
              <DateField label="Check-out" value={f.checkOut} onChange={(v) => updateField('checkOut', v)} />
              <Field label="Check-in time" placeholder="2pm" value={f.inTime} onChangeText={(v) => updateField('inTime', v)} />
              <Field label="Check-out time" placeholder="12noon" value={f.outTime} onChangeText={(v) => updateField('outTime', v)} />
            </View>
          </Card>

          <Card title="Line items" dotColor={dotColors.lines} readout={money(total)} readoutBig>
            <View style={{ gap: 12 }}>
              {f.lines.map((l, i) => (
                <SwipeableRow key={i} onDelete={() => removeLine(i)}>
                  <View style={styles.lineRow}>
                    <Field
                      label="Description"
                      placeholder="Payment for 3 Bedroom Apartment"
                      value={l.desc}
                      onChangeText={(v) => updateLine(i, { desc: v })}
                      spanFull
                    />
                    <View style={styles.lineFieldsRow}>
                      <NumberField label="Unit" value={l.unit} onChangeValue={(v) => updateLine(i, { unit: v })} />
                      <NumberField label="Nights" value={l.nights} onChangeValue={(v) => updateLine(i, { nights: v })} />
                      <NumberField label="Price" value={l.price} onChangeValue={(v) => updateLine(i, { price: v })} />
                    </View>
                    <View style={styles.lineFoot}>
                      <Text style={styles.lineFootLabel}>{durationLabel(l)} · Line total</Text>
                      <Text style={styles.lineFootValue}>{money(lineTotal(l))}</Text>
                    </View>
                    <Text style={styles.useDatesLink} onPress={() => useDatesForLine(i)}>
                      Use dates
                    </Text>
                  </View>
                </SwipeableRow>
              ))}
              <Button title="+ Add line" variant="ghost" onPress={addLine} style={styles.addLineBtn} />
            </View>
          </Card>

          <Card title="Terms & payment" dotColor={dotColors.terms}>
            <View style={{ gap: 12 }}>
              <View>
                <Text style={styles.textareaLabel}>Terms and conditions — one per line</Text>
                <TextInput
                  style={styles.textarea}
                  value={f.terms}
                  onChangeText={(v) => updateField('terms', v)}
                  multiline
                  numberOfLines={9}
                  textAlignVertical="top"
                />
                <View style={styles.termsActions}>
                  <Button title="Save as my default" small onPress={store.saveTermsAsDefault} />
                  <Button title="Reset to default" small variant="ghost" onPress={store.resetTermsToDefault} />
                </View>
              </View>
              <Field label="Payment line" value={f.payment} onChangeText={(v) => updateField('payment', v)} spanFull />
              <View style={styles.grid}>
                <Field label="Signed by" value={f.signName} onChangeText={(v) => updateField('signName', v)} />
                <Field label="Signatory line" value={f.signRole} onChangeText={(v) => updateField('signRole', v)} />
              </View>
            </View>
          </Card>
        </ScrollView>

        <View style={styles.actionBar}>
          <Button title="Save" flex={1} onPress={saveInvoice} />
          <Button title="Preview →" flex={1.35} variant="gold" onPress={() => navigation.navigate('Preview')} />
        </View>
      </KeyboardAvoidingView>
      <Toast message={toast} />
    </SafeAreaView>
  );
}

function NumberField({
  label,
  value,
  onChangeValue,
}: {
  label: string;
  value: number;
  onChangeValue: (v: number) => void;
}) {
  return (
    <View style={styles.numberField}>
      <Text style={styles.numberLabel}>{label}</Text>
      <TextInput
        style={styles.numberInput}
        keyboardType="decimal-pad"
        value={String(value)}
        onChangeText={(v) => onChangeValue(Number(v) || 0)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  logoChip: {
    width: 36,
    height: 36,
    borderRadius: radii.logoChip,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoChipText: { color: '#fff', fontFamily: fonts.sansExtrabold, fontSize: 13 },
  eyebrow: {
    fontFamily: fonts.sansBold,
    fontSize: 8.5,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: '#8A6F73',
  },
  invoiceNoInput: {
    fontFamily: fonts.monoBold,
    fontSize: 11,
    color: colors.primary,
    padding: 0,
    minWidth: 140,
  },
  title: { fontFamily: fonts.sansExtrabold, fontStyle: 'italic', fontSize: 17, color: colors.text, marginTop: 2 },
  body: { padding: 18, gap: 12, paddingBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridDates: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  lineRow: {
    padding: 11,
    backgroundColor: colors.rowTint,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.lineBlock,
    gap: 10,
  },
  lineFieldsRow: { flexDirection: 'row', gap: 8 },
  numberField: { flex: 1, gap: 4 },
  numberLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 8.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
    textAlign: 'center',
  },
  numberInput: {
    height: 40,
    borderRadius: radii.buttonSm,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    textAlign: 'center',
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.text,
  },
  lineFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  lineFootLabel: { fontFamily: fonts.sansSemibold, fontSize: 10.5, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  lineFootValue: { fontFamily: fonts.monoExtrabold, fontSize: 12.5, color: colors.text },
  useDatesLink: { fontFamily: fonts.sansBold, fontSize: 11.5, color: colors.primary },
  addLineBtn: { height: 44, borderStyle: 'dashed' },
  textareaLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 5,
  },
  textarea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.input,
    backgroundColor: colors.surfaceTint,
    padding: 12,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },
  termsActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
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
