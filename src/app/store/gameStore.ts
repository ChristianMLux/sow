import { create } from 'zustand';

interface Character {
  name: string;
  avatar: string;
}

export type Faction = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

interface GameState {
  character: Character | null;
  faction: Faction | null;
  createCharacter: (character: Character) => void;
  selectFaction: (faction: Faction) => void;
}

export const useGameStore = create<GameState>((set) => ({
  character: null,
  faction: null,
  createCharacter: (character) => set({ character }),
  selectFaction: (faction) => set({ faction }),
}));