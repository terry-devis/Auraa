import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Camera, Moon, Sun } from 'lucide-react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';
import { useAuraStore } from '@/store/useAuraStore';
import { AvatarType } from '@/db/schema';
import { AuraButton } from '@/components/ui/AuraButton';
import { AuraChip } from '@/components/ui/AuraChip';
import { AvatarView } from '@/components/profile/AvatarView';
import { AvatarPickerModal } from '@/components/profile/AvatarPickerModal';

const VIBES = [
  'Soft Minimalist',
  'Night Owl',
  'Mindful Creator',
  'Glow Getter',
  'Slow Living',
];

export default function ProfileSetupScreen() {
  const { theme, themeName, toggleTheme } = useAuraTheme();
  const { profile, updateProfile } = useAuraStore();

  const [displayName, setDisplayName] = useState(
    profile?.displayName && profile.displayName !== 'Aura Explorer'
      ? profile.displayName
      : ''
  );
  const [auraVibe, setAuraVibe] = useState(profile?.auraVibe ?? 'Soft Minimalist');
  const [avatarType, setAvatarType] = useState<AvatarType>(
    profile?.avatarType ?? 'preset'
  );
  const [avatarValue, setAvatarValue] = useState(
    profile?.avatarValue ?? 'aura_moon'
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleContinue = async () => {
    await updateProfile({
      displayName: displayName.trim() || 'Aura Explorer',
      auraVibe,
      avatarType,
      avatarValue,
    });
    router.push('/(onboarding)/ritual-selection');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          <Text style={[styles.stepBadge, { color: theme.colors.secondary }]}>
            STEP 1 OF 3
          </Text>
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.themeBtn,
              {
                backgroundColor: theme.colors.surfaceContainer,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            {themeName === 'midnight' ? (
              <Sun size={16} color={theme.colors.primary} />
            ) : (
              <Moon size={16} color={theme.colors.primary} />
            )}
          </Pressable>
        </View>

        <View style={styles.heroText}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Craft your aura identity ✨
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Personalize your sanctuary with an avatar and vibe that feels like you.
          </Text>
        </View>

        <View style={styles.avatarSection}>
          <Pressable onPress={() => setPickerOpen(true)} style={styles.avatarWrap}>
            <AvatarView
              avatarType={avatarType}
              avatarValue={avatarValue}
              size={104}
            />
            <View
              style={[
                styles.cameraBadge,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.background,
                },
              ]}
            >
              <Camera
                size={15}
                color={theme.isDark ? '#0D0D14' : theme.colors.onPrimary}
              />
            </View>
          </Pressable>
          <Text style={[styles.avatarHint, { color: theme.colors.onSurfaceVariant }]}>
            Tap to pick an avatar or upload a 1:1 photo
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            WHAT SHOULD WE CALL YOU?
          </Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your first name or nickname"
            placeholderTextColor={theme.colors.outline}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceContainer,
                color: theme.colors.onSurface,
                borderColor: theme.colors.cardBorder,
                borderRadius: theme.radius.card,
              },
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            CHOOSE YOUR AURA VIBE
          </Text>
          <View style={styles.chipWrap}>
            {VIBES.map((vibe) => (
              <AuraChip
                key={vibe}
                label={vibe}
                selected={auraVibe === vibe}
                onPress={() => setAuraVibe(vibe)}
              />
            ))}
          </View>
        </View>

        <AuraButton
          label="Continue to Rituals"
          onPress={handleContinue}
          style={styles.cta}
        />
      </ScrollView>

      <AvatarPickerModal
        visible={pickerOpen}
        currentType={avatarType}
        currentValue={avatarValue}
        onSelect={(type, value) => {
          setAvatarType(type);
          setAvatarValue(value);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 22, gap: 24, paddingBottom: 40 },
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
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { gap: 8 },
  title: { fontFamily: fontFamilies.bold, fontSize: 30, lineHeight: 38 },
  subtitle: { fontFamily: fontFamilies.regular, fontSize: 15, lineHeight: 22 },
  avatarSection: { alignItems: 'center', gap: 10 },
  avatarWrap: { position: 'relative' },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: { fontFamily: fontFamilies.medium, fontSize: 12 },
  section: { gap: 10 },
  label: { fontFamily: fontFamilies.semibold, fontSize: 11, letterSpacing: 1 },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontFamily: fontFamilies.medium,
    fontSize: 15,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cta: { marginTop: 8 },
});
