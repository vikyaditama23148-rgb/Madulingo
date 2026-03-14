// XP needed for a given level
export function xpForLevel(level: number): number {
  return level * level * 100
}

// Current level from XP
export function levelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

// XP progress within current level (0-100)
export function xpProgress(xp: number): number {
  const level = levelFromXP(xp)
  const currentLevelXP = xpForLevel(level - 1)
  const nextLevelXP = xpForLevel(level)
  return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
}

// XP needed to reach next level
export function xpToNextLevel(xp: number): number {
  const level = levelFromXP(xp)
  return xpForLevel(level) - xp
}

// Level title names
export function getLevelTitle(level: number): string {
  const titles = [
    'Pemula',        // 1
    'Pelajar',       // 2
    'Santri',        // 3
    'Pengenal',      // 4
    'Ahli Bahasa',   // 5
    'Duta Budaya',   // 6
    'Empu Madura',   // 7
    'Penjaga Tradisi', // 8
    'Maestro',       // 9
    'Legenda Madura', // 10+
  ]
  return titles[Math.min(level - 1, titles.length - 1)]
}

// District unlock level requirements
export const DISTRICT_REQUIREMENTS = {
  Bangkalan: 1,
  Sampang: 3,
  Pamekasan: 5,
  Sumenep: 8,
}

// District colors and descriptions
export const DISTRICTS = [
  {
    name: 'Bangkalan',
    color: '#E11D48',
    emoji: '🌅',
    tagline: 'Pintu Gerbang Madura',
    requiredLevel: 1,
  },
  {
    name: 'Sampang',
    color: '#7C3AED',
    emoji: '🎭',
    tagline: 'Tanah Seni & Budaya',
    requiredLevel: 3,
  },
  {
    name: 'Pamekasan',
    color: '#0EA5E9',
    emoji: '👑',
    tagline: 'Kota Batik & Keraton',
    requiredLevel: 5,
  },
  {
    name: 'Sumenep',
    color: '#FACC15',
    emoji: '🏛️',
    tagline: 'Pusaka Budaya Tertinggi',
    requiredLevel: 8,
  },
]
