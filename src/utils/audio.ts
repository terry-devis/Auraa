import { createAudioPlayer } from 'expo-audio';
import { ChimeType } from '@/db/schema';

const SOUND_ASSETS: Record<ChimeType | 'celebration', number> = {
  celestial: require('@/assets/sounds/celestial_chime.wav'),
  woodblock: require('@/assets/sounds/woodblock_pop.wav'),
  soft_bell: require('@/assets/sounds/soft_bell.wav'),
  celebration: require('@/assets/sounds/celebration_crescendo.wav'),
};

export async function playAuraChime(
  chime: ChimeType | 'celebration',
  enabled: boolean = true
): Promise<void> {
  if (!enabled) return;
  try {
    const player = createAudioPlayer(SOUND_ASSETS[chime]);
    player.volume = 0.75;
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        player.remove();
      }
    });
    player.play();
  } catch {
    // Gracefully ignore audio errors on unsupported simulators
  }
}
