export interface PresetAvatar {
  id: string;
  label: string;
  emoji: string;
  gradient: [string, string];
}

export const PRESET_AVATARS: PresetAvatar[] = [
  { id: 'aura_moon', label: 'Midnight Moon', emoji: '🌙', gradient: ['#A78BFA', '#6366F1'] },
  { id: 'aura_sage', label: 'Sage Sprout', emoji: '🌿', gradient: ['#6EE7B7', '#10B981'] },
  { id: 'aura_blush', label: 'Blush Cloud', emoji: '🌸', gradient: ['#FDA4AF', '#F472B6'] },
  { id: 'aura_sparkle', label: 'Celestial', emoji: '✨', gradient: ['#CEBDFF', '#F472B6'] },
  { id: 'aura_sun', label: 'Golden Hour', emoji: '☀️', gradient: ['#FDE68A', '#F59E0B'] },
  { id: 'aura_ocean', label: 'Calm Tide', emoji: '🌊', gradient: ['#93C5FD', '#6EE7B7'] },
  { id: 'aura_crystal', label: 'Quartz', emoji: '🔮', gradient: ['#C4B5FD', '#EC4899'] },
  { id: 'aura_matcha', label: 'Matcha', emoji: '🍵', gradient: ['#CDE8D0', '#605982'] },
];
