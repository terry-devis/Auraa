import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { File, Paths } from 'expo-file-system';

const AVATAR_SIZE = 512;
const AVATAR_QUALITY = 0.8;
const AVATAR_FILENAME = 'auraa_profile_avatar.jpg';

export interface PickedAvatarResult {
  uri: string;
  width: number;
  height: number;
}

/**
 * WhatsApp-style profile picture picker:
 * 1. Opens gallery with a fixed 1:1 square crop area.
 * 2. Standardizes output to 512x512 JPEG at 80% quality.
 * 3. Persists to app documentDirectory, replacing any previous upload.
 */
export async function pickAndOptimizeAvatar(): Promise<PickedAvatarResult | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const sourceUri = result.assets[0].uri;

  const manipulated = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: AVATAR_SIZE, height: AVATAR_SIZE } }],
    {
      compress: AVATAR_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  const destFile = new File(Paths.document, AVATAR_FILENAME);
  if (destFile.exists) {
    destFile.delete();
  }

  const sourceFile = new File(manipulated.uri);
  sourceFile.copy(destFile);

  return {
    uri: `${destFile.uri}?t=${Date.now()}`,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  };
}
