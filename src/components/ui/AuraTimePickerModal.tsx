import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronUp, X } from 'lucide-react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';
import { AuraButton } from './AuraButton';
import { AuraChip } from './AuraChip';

interface AuraTimePickerModalProps {
  visible: boolean;
  initialTime?: string | null; // "HH:mm"
  title?: string;
  onConfirm: (time24: string) => void;
  onClose: () => void;
}

const PRESETS = [
  { label: '7:30 AM', value: '07:30' },
  { label: '12:30 PM', value: '12:30' },
  { label: '6:00 PM', value: '18:00' },
  { label: '9:30 PM', value: '21:30' },
];

function parseInitial(t?: string | null) {
  const [hStr, mStr] = (t || '08:30').split(':');
  const h24 = Number(hStr);
  const m = Number(mStr);
  const safeH24 = Number.isNaN(h24) ? 8 : h24;
  const safeM = Number.isNaN(m) ? 30 : m;
  return {
    hour12: safeH24 % 12 === 0 ? 12 : safeH24 % 12,
    minute: safeM,
    isPM: safeH24 >= 12,
  };
}

export function AuraTimePickerModal({
  visible,
  initialTime = '08:30',
  title = 'Set Reminder Time',
  onConfirm,
  onClose,
}: AuraTimePickerModalProps) {
  if (!visible) return null;

  return (
    <AuraTimePickerContent
      key={initialTime ?? '08:30'}
      initialTime={initialTime}
      title={title}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

function AuraTimePickerContent({
  initialTime,
  title,
  onConfirm,
  onClose,
}: Omit<AuraTimePickerModalProps, 'visible'>) {
  const { theme } = useAuraTheme();
  const initial = parseInitial(initialTime);

  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(initial.minute);
  const [isPM, setIsPM] = useState(initial.isPM);

  const stepHour = (delta: number) => {
    setHour12((prev) => {
      const next = ((prev - 1 + delta + 12) % 12) + 1;
      return next;
    });
  };

  const stepMinute = (delta: number) => {
    setMinute((prev) => (prev + delta + 60) % 60);
  };

  const applyPreset = (val: string) => {
    const parsed = parseInitial(val);
    setHour12(parsed.hour12);
    setMinute(parsed.minute);
    setIsPM(parsed.isPM);
  };

  const handleSave = () => {
    let h24 = hour12 % 12;
    if (isPM) h24 += 12;
    const formatted = `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onConfirm(formatted);
    onClose();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.card,
            theme.shadows.glow,
            {
              backgroundColor: theme.colors.surfaceContainer,
              borderColor: theme.colors.cardBorder,
              borderRadius: theme.radius.xl,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              {title}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color={theme.colors.onSurface} />
            </Pressable>
          </View>

          {/* Hour : Minute : AM/PM Wheel */}
          <View style={styles.pickerRow}>
            <View style={styles.col}>
              <Pressable onPress={() => stepHour(1)} hitSlop={8} style={styles.arrowBtn}>
                <ChevronUp size={22} color={theme.colors.primary} />
              </Pressable>
              <View
                style={[
                  styles.digitBox,
                  { backgroundColor: theme.colors.surfaceLow },
                ]}
              >
                <Text style={[styles.digitText, { color: theme.colors.onSurface }]}>
                  {String(hour12).padStart(2, '0')}
                </Text>
              </View>
              <Pressable onPress={() => stepHour(-1)} hitSlop={8} style={styles.arrowBtn}>
                <ChevronDown size={22} color={theme.colors.primary} />
              </Pressable>
            </View>

            <Text style={[styles.colon, { color: theme.colors.onSurfaceVariant }]}>
              :
            </Text>

            <View style={styles.col}>
              <Pressable onPress={() => stepMinute(5)} hitSlop={8} style={styles.arrowBtn}>
                <ChevronUp size={22} color={theme.colors.primary} />
              </Pressable>
              <View
                style={[
                  styles.digitBox,
                  { backgroundColor: theme.colors.surfaceLow },
                ]}
              >
                <Text style={[styles.digitText, { color: theme.colors.onSurface }]}>
                  {String(minute).padStart(2, '0')}
                </Text>
              </View>
              <Pressable onPress={() => stepMinute(-5)} hitSlop={8} style={styles.arrowBtn}>
                <ChevronDown size={22} color={theme.colors.primary} />
              </Pressable>
            </View>

            <View style={styles.ampmCol}>
              <Pressable
                onPress={() => setIsPM(false)}
                style={[
                  styles.ampmBtn,
                  {
                    backgroundColor: !isPM
                      ? theme.colors.primary
                      : theme.colors.surfaceLow,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.ampmText,
                    {
                      color: !isPM
                        ? theme.isDark
                          ? '#0D0D14'
                          : theme.colors.onPrimary
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  AM
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setIsPM(true)}
                style={[
                  styles.ampmBtn,
                  {
                    backgroundColor: isPM
                      ? theme.colors.primary
                      : theme.colors.surfaceLow,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.ampmText,
                    {
                      color: isPM
                        ? theme.isDark
                          ? '#0D0D14'
                          : theme.colors.onPrimary
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  PM
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetRow}>
            {PRESETS.map((p) => (
              <AuraChip
                key={p.value}
                label={p.label}
                onPress={() => applyPreset(p.value)}
              />
            ))}
          </View>

          <AuraButton label="Set Time" onPress={handleSave} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 20, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    padding: 22,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontFamily: fontFamilies.bold, fontSize: 18 },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  col: { alignItems: 'center', gap: 6 },
  arrowBtn: { padding: 6 },
  digitBox: {
    width: 68,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: { fontFamily: fontFamilies.bold, fontSize: 28 },
  colon: { fontFamily: fontFamilies.bold, fontSize: 28, marginBottom: 4 },
  ampmCol: { gap: 8, marginLeft: 6 },
  ampmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  ampmText: { fontFamily: fontFamilies.bold, fontSize: 13 },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
});
