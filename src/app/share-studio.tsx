import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import {
  requestPermissionsAsync,
  saveToLibraryAsync,
} from 'expo-media-library';
import { Download, Share2, X } from 'lucide-react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';
import { useAuraStore } from '@/store/useAuraStore';
import { AuraChip } from '@/components/ui/AuraChip';
import { AuraButton } from '@/components/ui/AuraButton';
import { AvatarView } from '@/components/profile/AvatarView';
import { calculateBestStreakAcrossHabits } from '@/utils/streak';

type CardFormat = '1:1' | '9:16';

const CARD_THEMES: {
  id: string;
  label: string;
  colors: [string, string, string];
  textColor: string;
}[] = [
  {
    id: 'midnight_aura',
    label: 'Midnight Aura',
    colors: ['#13131A', '#2B1F4D', '#4C1D95'],
    textColor: '#F8FAFC',
  },
  {
    id: 'electric_sage',
    label: 'Electric Sage',
    colors: ['#0D1F1A', '#115E59', '#064E3B'],
    textColor: '#ECFDF5',
  },
  {
    id: 'serene_blush',
    label: 'Serene Blush',
    colors: ['#FFF6F0', '#FDE2E4', '#E2D9F3'],
    textColor: '#1E1B18',
  },
  {
    id: 'sunset_glow',
    label: 'Golden Hour',
    colors: ['#2E1065', '#9D174D', '#F59E0B'],
    textColor: '#FFFBEB',
  },
];

const STICKERS = ['✨', '🌙', '🌿', '🔥', '💎', 'None'];
const BADGES = ['CONSISTENCY', 'SOFT LIFE', 'GLOW UP', 'MINDFUL'];

export default function ShareStudioScreen() {
  const { theme } = useAuraTheme();
  const { profile, habits, logs } = useAuraStore();
  const shotRef = useRef<React.ComponentRef<typeof ViewShot>>(null);

  const [format, setFormat] = useState<CardFormat>('1:1');
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [sticker, setSticker] = useState('✨');
  const [badge, setBadge] = useState('CONSISTENCY');
  const [exporting, setExporting] = useState(false);

  const bestStreak = useMemo(
    () => calculateBestStreakAcrossHabits(habits, logs),
    [habits, logs]
  );

  const captureCard = async (): Promise<string | null> => {
    if (!shotRef.current?.capture) return null;
    const uri = await shotRef.current.capture();
    return uri;
  };

  const handleShare = async () => {
    setExporting(true);
    try {
      const uri = await captureCard();
      if (!uri) return;
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Auraa Card ✨',
        });
      } else {
        Alert.alert('Sharing unavailable', 'Sharing is not supported on this device.');
      }
    } finally {
      setExporting(false);
    }
  };

  const handleSaveToGallery = async () => {
    setExporting(true);
    try {
      const perm = await requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo library access to save your card.');
        return;
      }
      const uri = await captureCard();
      if (!uri) return;
      await saveToLibraryAsync(uri);
      Alert.alert('Saved ✨', 'Your Auraa card has been saved to your gallery.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Card Studio
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <X size={22} color={theme.colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Format Toggle */}
        <View style={styles.formatRow}>
          <AuraChip
            label="1:1 Square Post"
            selected={format === '1:1'}
            onPress={() => setFormat('1:1')}
          />
          <AuraChip
            label="9:16 Story"
            selected={format === '9:16'}
            onPress={() => setFormat('9:16')}
          />
        </View>

        {/* Live Card Canvas */}
        <View style={styles.canvasWrap}>
          <ViewShot
            ref={shotRef}
            options={{ format: 'png', quality: 1 }}
            style={[
              styles.shotFrame,
              format === '1:1' ? styles.ratioSquare : styles.ratioStory,
            ]}
          >
            <LinearGradient
              colors={selectedTheme.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <View style={styles.badgePill}>
                  <Text style={[styles.badgeText, { color: selectedTheme.textColor }]}>
                    {badge}
                  </Text>
                </View>
                {sticker !== 'None' && <Text style={styles.sticker}>{sticker}</Text>}
              </View>

              <View style={styles.cardCenter}>
                <AvatarView
                  avatarType={profile?.avatarType ?? 'preset'}
                  avatarValue={profile?.avatarValue ?? 'aura_moon'}
                  size={format === '1:1' ? 68 : 80}
                />
                <Text style={[styles.cardName, { color: selectedTheme.textColor }]}>
                  {profile?.displayName ?? 'Aura Explorer'}
                </Text>
                <Text
                  style={[
                    styles.cardVibe,
                    { color: selectedTheme.textColor, opacity: 0.78 },
                  ]}
                >
                  {profile?.auraVibe ?? 'Soft Minimalist'}
                </Text>
              </View>

              <View style={styles.cardStats}>
                <View style={styles.statBox}>
                  <Text style={[styles.statVal, { color: selectedTheme.textColor }]}>
                    {bestStreak}d
                  </Text>
                  <Text
                    style={[
                      styles.statLbl,
                      { color: selectedTheme.textColor, opacity: 0.75 },
                    ]}
                  >
                    BEST STREAK
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statVal, { color: selectedTheme.textColor }]}>
                    {logs.length}
                  </Text>
                  <Text
                    style={[
                      styles.statLbl,
                      { color: selectedTheme.textColor, opacity: 0.75 },
                    ]}
                  >
                    RITUALS DONE
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.watermark,
                  { color: selectedTheme.textColor, opacity: 0.55 },
                ]}
              >
                AURAA • DAILY SANCTUARY
              </Text>
            </LinearGradient>
          </ViewShot>
        </View>

        {/* Theme Selector */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            AURA THEME
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {CARD_THEMES.map((ct) => (
              <AuraChip
                key={ct.id}
                label={ct.label}
                selected={selectedTheme.id === ct.id}
                onPress={() => setSelectedTheme(ct)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Sticker Selector */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            STICKER
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {STICKERS.map((s) => (
              <AuraChip
                key={s}
                label={s}
                selected={sticker === s}
                onPress={() => setSticker(s)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Badge Selector */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            BADGE
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {BADGES.map((b) => (
              <AuraChip
                key={b}
                label={b}
                selected={badge === b}
                onPress={() => setBadge(b)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Export Actions */}
        <View style={styles.exportRow}>
          <AuraButton
            label="Save PNG"
            variant="secondary"
            loading={exporting}
            onPress={handleSaveToGallery}
            style={styles.exportBtn}
            icon={<Download size={17} color={theme.colors.onSurface} />}
          />
          <AuraButton
            label="Share Card"
            loading={exporting}
            onPress={handleShare}
            style={styles.exportBtn}
            icon={
              <Share2
                size={17}
                color={theme.isDark ? '#0D0D14' : theme.colors.onPrimary}
              />
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontFamily: fontFamilies.bold, fontSize: 22 },
  container: { padding: 20, gap: 18, paddingBottom: 40 },
  formatRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  canvasWrap: { alignItems: 'center' },
  shotFrame: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  ratioSquare: { width: 290, height: 290 },
  ratioStory: { width: 230, height: 408 },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  badgeText: { fontFamily: fontFamilies.bold, fontSize: 10, letterSpacing: 1 },
  sticker: { fontSize: 22 },
  cardCenter: { alignItems: 'center', gap: 6 },
  cardName: { fontFamily: fontFamilies.bold, fontSize: 20, marginTop: 4 },
  cardVibe: { fontFamily: fontFamilies.medium, fontSize: 12 },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  statBox: { alignItems: 'center', gap: 2 },
  statVal: { fontFamily: fontFamilies.bold, fontSize: 18 },
  statLbl: { fontFamily: fontFamilies.semibold, fontSize: 9, letterSpacing: 0.8 },
  watermark: {
    textAlign: 'center',
    fontFamily: fontFamilies.semibold,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  section: { gap: 8 },
  label: { fontFamily: fontFamilies.semibold, fontSize: 11, letterSpacing: 1 },
  chipRow: { gap: 8 },
  exportRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  exportBtn: { flex: 1 },
});
