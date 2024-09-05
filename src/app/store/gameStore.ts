import { create } from 'zustand';
import { Building } from '../models/buildings';

interface Character {
  name: string;
  avatar: string;
}

export type Faction = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

interface Resources {
  wood: number;
  stone: number;
  gold: number;
}

interface GameState {
  character: Character | null;
  faction: Faction | null;
  resources: Resources;
  buildings: Building[];
  createCharacter: (character: Character) => void;
  selectFaction: (faction: Faction) => void;
  addBuilding: (building: Building) => void;
  removeBuilding: (building: Building) => void;
  upgradeBuilding: (building: Building) => void;
  updateResources: (newResources: Partial<Resources>) => void;
}

export const useGameStore = create<GameState>((set) => ({
  character: null,
  faction: null,
  createCharacter: (character) => set({ character }),
  selectFaction: (faction) => set({ faction }),
  resources: { wood: 100, stone: 100, gold: 100 },
  buildings: [],
  addBuilding: (building) => set((state) => ({ buildings: [...state.buildings, building] })),
  removeBuilding: (building) => set((state) => ({ 
    buildings: state.buildings.filter(b => b !== building) 
  })),
  upgradeBuilding: (building) => set((state) => ({
    buildings: state.buildings.map(b => 
      b === building ? { ...b, level: b.level + 1 } as Building : b
    )
  })),
  updateResources: (newResources) => set((state) => ({
    resources: { ...state.resources, ...newResources }
  })),
}));