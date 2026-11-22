import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bell, Camera, Clock, Share2, Sparkles } from 'lucide-react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { ThemePreference, fontFamilies } from '@/theme/tokens';
import { useAuraStore } from '@/store/useAuraStore';
import { ChimeType } from '@/db/schema';
import { AuraCard } from '@/components/ui/AuraCard';
import { AuraChip } from '@/components/ui/AuraChip';
import { AuraButton } from '@/components/ui/AuraButton';
import { AuraTimePickerModal } from '@/components/ui/AuraTimePickerModal';
import { AvatarView } from '@/components/profile/AvatarView';
import { AvatarPickerModal } from '@/components/profile/AvatarPickerModal';
import { playAuraChime } from '@/utils/audio';
import {
  cancelDailyAuraReminder,
  formatTime12h,
  scheduleDailyAuraReminder,
} from '@/utils/notifications';
import { calculateHabitStreak } from '@/utils/streak';

const THEMES: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'midnight', label: 'Midnight Glow' },
  { id: 'serene', label: 'Serene Glow' },
];

const CHIMES: { id: ChimeType; label: string }[] = [
  { id: 'celestial', label: 'Celestial' },
  { id: 'woodblock', label: 'Woodblock' },
  { id: 'soft_bell', label: 'Soft Bell' },
];

export default function ProfileScreen() {
  const { theme, preference, setPreference } = useAuraTheme();
  const { profile, habits, logs, updateProfile } = useAuraStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const bestStreak = useMemo(() => {
    let max = 0;
    for (const h of habits) {
      const s = calculateHabitStreak(h.id, logs);
      if (s > max) max = s;
    }
    return max;
  }, [habits, logs]);

  const handleChimeChange = (chime: ChimeType) => {
    updateProfile({ selectedChime: chime });
    playAuraChime(chime, true);
  };

  const handleToggleDailyReminder = async (enabled: boolean) => {
    await updateProfile({ dailyReminderEnabled: enabled });
    if (enabled) {
      const [h, m] = (profile?.dailyReminderTime ?? '20:00')
        .split(':')
        .map(Number);
      await scheduleDailyAuraReminder(h, m);
    } else {
      await cancelDailyAuraReminder();
    }
  };

  const handleConfirmDailyTime = async (time24: string) => {
    await updateProfile({
      dailyReminderEnabled: true,
      dailyReminderTime: time24,
    });
    const [h, m] = time24.split(':').map(Number);
    await scheduleDailyAuraReminder(h, m);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: theme.colors.onSurfaceVariant }]}>
          YOUR SANCTUARY
        </Text>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Profile & Preferences
        </Text>

        {/* Identity Card */}
        <AuraCard>
          <View style={styles.profileRow}>
            <Pressable onPress={() => setPickerOpen(true)} style={styles.avatarWrap}>
              <AvatarView
                avatarType={profile?.avatarType ?? 'preset'}
                avatarValue={profile?.avatarValue ?? 'aura_moon'}
                size={72}
              />
              <View
                style={[
                  styles.camBadge,
                  {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.surfaceContainer,
                  },
                ]}
              >
                <Camera
                  size={12}
                  color={theme.isDark ? '#0D0D14' : theme.colors.onPrimary}
                />
              </View>
            </Pressable>

            <View style={styles.profileInfo}>
              <Text style={[styles.displayName, { color: theme.colors.onSurface }]}>
                {profile?.displayName ?? 'Aura Explorer'}
              </Text>
              <Text style={[styles.vibeText, { color: theme.colors.secondary }]}>
                {profile?.auraVibe ?? 'Soft Minimalist'} ✨
              </Text>
              <Text style={[styles.statsLine, { color: theme.colors.onSurfaceVariant }]}>
                {logs.length} check-ins • {bestStreak}d best streak
              </Text>
            </View>
          </View>
        </AuraCard>

        {/* Card Studio CTA */}
        <AuraCard variant="elevated">
          <View style={styles.studioBanner}>
            <View style={styles.studioInfo}>
              <View style={styles.studioTitleRow}>
                <Sparkles size={16} color={theme.colors.primary} />
                <Text style={[styles.studioTitle, { color: theme.colors.onSurface }]}>
                  Share Your Aura Card
                </Text>
              </View>
              <Text style={[styles.studioSub, { color: theme.colors.onSurfaceVariant }]}>
                Customize a 1:1 post or 9:16 story with stickers, themes & streak stats.
              </Text>
            </View>
            <AuraButton
              label="Open Card Studio"
              onPress={() => router.push('/share-studio')}
              icon={
                <Share2
                  size={17}
                  color={theme.isDark ? '#0D0D14' : theme.colors.onPrimary}
                />
              }
            />
          </View>
        </AuraCard>

        {/* Theme Mode */}
        <AuraCard>
          <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
            AURA THEME
          </Text>
          <View style={styles.chipWrap}>
            {THEMES.map((t) => (
              <AuraChip
                key={t.id}
                label={t.label}
                selected={preference === t.id}
                onPress={() => setPreference(t.id)}
              />
            ))}
          </View>

          <Text
            style={[
              styles.sectionLabel,
              { color: theme.colors.onSurfaceVariant, marginTop: 18 },
            ]}
          >
            COMPLETION CHIME
          </Text>
          <View style={styles.chipWrap}>
            {CHIMES.map((c) => (
              <AuraChip
                key={c.id}
                label={c.label}
                selected={(profile?.selectedChime ?? 'celestial') === c.id}
                onPress={() => handleChimeChange(c.id)}
              />
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: theme.colors.onSurface }]}>
              Sound Effects
            </Text>
            <Switch
              value={profile?.soundEnabled ?? true}
              onValueChange={(v) => updateProfile({ soundEnabled: v })}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: theme.colors.onSurface }]}>
              Tactile Haptics
            </Text>
            <Switch
              value={profile?.hapticsEnabled ?? true}
              onValueChange={(v) => updateProfile({ hapticsEnabled: v })}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.bellRow}>
              <Bell size={16} color={theme.colors.primary} />
              <Text style={[styles.toggleLabel, { color: theme.colors.onSurface }]}>
                Daily Check-In Reminder
              </Text>
            </View>
            <Switch
              value={profile?.dailyReminderEnabled ?? true}
              onValueChange={handleToggleDailyReminder}
            />
          </View>

          {(profile?.dailyReminderEnabled ?? true) && (
            <Pressable
              onPress={() => setTimePickerOpen(true)}
              style={[styles.timeBtn, { backgroundColor: theme.colors.surfaceLow }]}
            >
              <View style={styles.bellRow}>
                <Clock size={16} color={theme.colors.secondary} />
                <Text
                  style={[styles.timeLabel, { color: theme.colors.onSurfaceVariant }]}
                >
                  Reminder Time
                </Text>
              </View>
              <Text style={[styles.timeValue, { color: theme.colors.primary }]}>
                {formatTime12h(profile?.dailyReminderTime ?? '20:00')}
              </Text>
            </Pressable>
          )}
        </AuraCard>
      </ScrollView>

      <AvatarPickerModal
        visible={pickerOpen}
        currentType={profile?.avatarType ?? 'preset'}
        currentValue={profile?.avatarValue ?? 'aura_moon'}
        onSelect={(avatarType, avatarValue) =>
          updateProfile({ avatarType, avatarValue })
        }
        onClose={() => setPickerOpen(false)}
      />

      <AuraTimePickerModal
        visible={timePickerOpen}
        initialTime={profile?.dailyReminderTime ?? '20:00'}
        title="Daily Check-In Time"
        onConfirm={handleConfirmDailyTime}
        onClose={() => setTimePickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  eyebrow: { fontFamily: fontFamilies.semibold, fontSize: 11, letterSpacing: 1.2 },
  title: { fontFamily: fontFamilies.bold, fontSize: 28 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap: { position: 'relative' },
  camBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1, gap: 3 },
  displayName: { fontFamily: fontFamilies.bold, fontSize: 20 },
  vibeText: { fontFamily: fontFamilies.semibold, fontSize: 13 },
  statsLine: { fontFamily: fontFamilies.regular, fontSize: 12 },
  studioBanner: { gap: 14 },
  studioInfo: { gap: 4 },
  studioTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  studioTitle: { fontFamily: fontFamilies.bold, fontSize: 17 },
  studioSub: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 19 },
  sectionLabel: {
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 10,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  divider: {
    height: 1,
    backgroundColor: '#948e9d',
    opacity: 0.14,
    marginVertical: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  bellRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontFamily: fontFamilies.medium, fontSize: 15 },
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
