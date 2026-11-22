import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bell, ChevronLeft, Clock, Volume2 } from 'lucide-react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';
import { useAuraStore } from '@/store/useAuraStore';
import { ChimeType } from '@/db/schema';
import { AuraButton } from '@/components/ui/AuraButton';
import { AuraCard } from '@/components/ui/AuraCard';
import { AuraTimePickerModal } from '@/components/ui/AuraTimePickerModal';
import { playAuraChime } from '@/utils/audio';
import {
  cancelDailyAuraReminder,
  formatTime12h,
  scheduleDailyAuraReminder,
} from '@/utils/notifications';

const CHIMES: { id: ChimeType; label: string; desc: string }[] = [
  { id: 'celestial', label: 'Celestial Chime', desc: 'Soft harmonic bell chord' },
  { id: 'woodblock', label: 'Woodblock Pop', desc: 'Warm organic wooden tap' },
  { id: 'soft_bell', label: 'Soft Bell', desc: 'Gentle sanctuary resonance' },
];

export default function RemindersSoundscapesScreen() {
  const { theme } = useAuraTheme();
  const { updateProfile } = useAuraStore();

  const [selectedChime, setSelectedChime] = useState<ChimeType>('celestial');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const handleSelectChime = (chime: ChimeType) => {
    setSelectedChime(chime);
    playAuraChime(chime, true);
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      if (reminderEnabled) {
        const [h, m] = reminderTime.split(':').map(Number);
        await scheduleDailyAuraReminder(h, m);
      } else {
        await cancelDailyAuraReminder();
      }
      await updateProfile({
        selectedChime,
        soundEnabled,
        hapticsEnabled,
        dailyReminderEnabled: reminderEnabled,
        dailyReminderTime: reminderTime,
        onboardingCompleted: true,
      });
      router.replace('/(tabs)');
    } finally {
      setFinishing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <ChevronLeft size={24} color={theme.colors.onSurface} />
          </Pressable>
          <Text style={[styles.stepBadge, { color: theme.colors.secondary }]}>
            STEP 3 OF 3
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.heroText}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Gentle Reminders & Sanctuary Audio 🕊️
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Tap a chime to preview your completion soundscape and set your daily check-in.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            COMPLETION CHIME
          </Text>
          {CHIMES.map((chime) => {
            const active = selectedChime === chime.id;
            return (
              <Pressable key={chime.id} onPress={() => handleSelectChime(chime.id)}>
                <AuraCard variant={active ? 'completed' : 'default'} padding="md">
                  <View style={styles.row}>
                    <Volume2
                      size={20}
                      color={active ? theme.colors.secondary : theme.colors.onSurfaceVariant}
                    />
                    <View style={styles.info}>
                      <Text style={[styles.chimeTitle, { color: theme.colors.onSurface }]}>
                        {chime.label}
                      </Text>
                      <Text
                        style={[styles.chimeDesc, { color: theme.colors.onSurfaceVariant }]}
                      >
                        {chime.desc}
                      </Text>
                    </View>
                  </View>
                </AuraCard>
              </Pressable>
            );
          })}
        </View>

        <AuraCard padding="md">
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: theme.colors.onSurface }]}>
              Sound Effects
            </Text>
            <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: theme.colors.onSurface }]}>
              Tactile Haptics
            </Text>
            <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={styles.bellRow}>
              <Bell size={16} color={theme.colors.primary} />
              <Text style={[styles.toggleLabel, { color: theme.colors.onSurface }]}>
                Daily Check-In Reminder
              </Text>
            </View>
            <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
          </View>

          {reminderEnabled && (
            <Pressable
              onPress={() => setTimePickerOpen(true)}
              style={[styles.timeBtn, { backgroundColor: theme.colors.surfaceLow }]}
            >
              <View style={styles.bellRow}>
                <Clock size={16} color={theme.colors.secondary} />
                <Text
                  style={[styles.timeLabel, { color: theme.colors.onSurfaceVariant }]}
                >
                  Daily Check-In Time
                </Text>
              </View>
              <Text style={[styles.timeValue, { color: theme.colors.primary }]}>
                {formatTime12h(reminderTime)}
              </Text>
            </Pressable>
          )}
        </AuraCard>

        <AuraButton
          label="Enter Sanctuary ✨"
          onPress={handleFinish}
          loading={finishing}
        />
      </ScrollView>

      <AuraTimePickerModal
        visible={timePickerOpen}
        initialTime={reminderTime}
        title="Daily Check-In Time"
        onConfirm={setReminderTime}
        onClose={() => setTimePickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 22, gap: 22, paddingBottom: 40 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBadge: {
    fontFamily: fontFamilies.bold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  heroText: { gap: 8 },
  title: { fontFamily: fontFamilies.bold, fontSize: 26, lineHeight: 34 },
  subtitle: { fontFamily: fontFamilies.regular, fontSize: 15, lineHeight: 22 },
  section: { gap: 10 },
  label: { fontFamily: fontFamilies.semibold, fontSize: 11, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1, gap: 2 },
  chimeTitle: { fontFamily: fontFamilies.semibold, fontSize: 15 },
  chimeDesc: { fontFamily: fontFamilies.regular, fontSize: 12 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  bellRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontFamily: fontFamilies.medium, fontSize: 15 },
  divider: { height: 1, opacity: 0.08, backgroundColor: '#948e9d', marginVertical: 6 },
  timeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  timeLabel: { fontFamily: fontFamilies.medium, fontSize: 13 },
  timeValue: { fontFamily: fontFamilies.bold, fontSize: 15 },
});
