import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Camera, Check, X } from 'lucide-react-native';
import { PRESET_AVATARS } from '@/constants/avatars';
import { AvatarType } from '@/db/schema';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';
import { pickAndOptimizeAvatar } from '@/utils/imageOptimizer';
import { AvatarView } from './AvatarView';
import { AuraButton } from '@/components/ui/AuraButton';

interface AvatarPickerModalProps {
  visible: boolean;
  currentType: AvatarType;
  currentValue: string;
  onSelect: (type: AvatarType, value: string) => void;
  onClose: () => void;
}

export function AvatarPickerModal({
  visible,
  currentType,
  currentValue,
  onSelect,
  onClose,
}: AvatarPickerModalProps) {
  const { theme } = useAuraTheme();
  const [optimizing, setOptimizing] = useState(false);

  const handleUploadPhoto = async () => {
    setOptimizing(true);
    try {
      const picked = await pickAndOptimizeAvatar();
      if (picked) {
        onSelect('custom', picked.uri);
        onClose();
      } else {
        Alert.alert(
          'Photo Access',
          'No photo selected or gallery permission was denied.'
        );
      }
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surfaceContainer,
              borderColor: theme.colors.cardBorder,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              Choose Your Aura Avatar
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={22} color={theme.colors.onSurface} />
            </Pressable>
          </View>

          <View style={styles.previewRow}>
            <AvatarView
              avatarType={currentType}
              avatarValue={currentValue}
              size={76}
            />
            <View style={styles.uploadCol}>
              <AuraButton
                label="Upload Photo (1:1 Crop)"
                variant="secondary"
                loading={optimizing}
                onPress={handleUploadPhoto}
                icon={<Camera size={17} color={theme.colors.onSurface} />}
              />
              <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                Auto-cropped to 1:1 and optimized to 512×512px
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
            OR PICK A PRE-BUILT AVATAR
          </Text>

          <ScrollView contentContainerStyle={styles.grid}>
            {PRESET_AVATARS.map((item) => {
              const selected =
                currentType === 'preset' && currentValue === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    onSelect('preset', item.id);
                    onClose();
                  }}
                  style={[
                    styles.presetTile,
                    {
                      backgroundColor: theme.colors.surfaceLow,
                      borderColor: selected
                        ? theme.colors.primary
                        : theme.colors.cardBorder,
                    },
                  ]}
                >
                  <AvatarView avatarType="preset" avatarValue={item.id} size={52} />
                  <Text
                    numberOfLines={1}
                    style={[styles.presetName, { color: theme.colors.onSurface }]}
                  >
                    {item.label}
                  </Text>
                  {selected && (
                    <View
                      style={[
                        styles.checkBadge,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <Check
                        size={11}
                        strokeWidth={3}
                        color={theme.isDark ? '#0D0D14' : theme.colors.onPrimary}
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 20, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 22,
    maxHeight: '80%',
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: 19,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  uploadCol: {
    flex: 1,
    gap: 6,
  },
  hint: {
    fontFamily: fontFamilies.regular,
    fontSize: 11,
  },
  sectionLabel: {
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 18,
  },
  presetTile: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  presetName: {
    fontFamily: fontFamilies.medium,
    fontSize: 13,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
