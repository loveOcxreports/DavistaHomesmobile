import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors, fonts, radii } from '../lib/theme';
import { Button } from './Button';

type Props = {
  label: string;
  value: string; // ISO yyyy-mm-dd, '' when unset
  onChange: (iso: string) => void;
};

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toDate(iso: string): Date {
  return iso ? new Date(iso + 'T00:00:00') : new Date();
}

export function DateField({ label, value, onChange }: Props) {
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(toDate(value));

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: toDate(value),
        mode: 'date',
        onChange: (event, selected) => {
          if (event.type === 'set' && selected) onChange(toIso(selected));
        },
      });
    } else {
      setDraft(toDate(value));
      setIosPickerOpen(true);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.control} onPress={open}>
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value || 'Select date'}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' && (
        <Modal visible={iosPickerOpen} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <DateTimePicker
                value={draft}
                mode="date"
                display="inline"
                onChange={(_, selected) => selected && setDraft(selected)}
              />
              <View style={styles.modalActions}>
                <Button title="Cancel" variant="ghost" flex={1} onPress={() => setIosPickerOpen(false)} />
                <Button
                  title="Done"
                  variant="gold"
                  flex={1}
                  onPress={() => {
                    onChange(toIso(draft));
                    setIosPickerOpen(false);
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, flexBasis: '45%', gap: 5 },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  control: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.input,
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  valueText: { fontSize: 16, color: colors.text },
  placeholderText: { fontSize: 16, color: colors.muted2 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radii.editorCard,
    borderTopRightRadius: radii.editorCard,
    padding: 16,
    gap: 12,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
});
