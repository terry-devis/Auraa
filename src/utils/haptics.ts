import * as Haptics from 'expo-haptics';

export async function triggerTapHaptic(enabled: boolean = true): Promise<void> {
  if (!enabled) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

export async function triggerCompletionHaptic(enabled: boolean = true): Promise<void> {
  if (!enabled) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}

export async function triggerUndoHaptic(enabled: boolean = true): Promise<void> {
  if (!enabled) return;
  try {
    await Haptics.selectionAsync();
  } catch {}
}

export async function triggerCelebrationHaptic(enabled: boolean = true): Promise<void> {
  if (!enabled) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }, 140);
  } catch {}
}
