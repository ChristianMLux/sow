import { create } from 'zustand';
import { Building, BuildingCost, Barracks, Hospital } from '../models/buildings';

interface Character {
  name: string;
  avatar: string;
}

export type Faction = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

interface Resources {
  wood: number;
  stone: number;
  gold: number;
  food: number;
}

interface GameState {
  character: Character | null;
  faction: Faction | null;
  resources: Resources;
  buildings: Building[];
  soldiers: {
    total: number;
    wounded: number;
  };
  lastResourceUpdate: number;
  createCharacter: (character: Character) => void;
  selectFaction: (faction: Faction) => void;
  addBuilding: (building: Building) => void;
  removeBuilding: (building: Building) => void;
  upgradeBuilding: (building: Building) => void;
  updateResources: (newResources: Partial<Resources>) => void;
  produceResources: () => void;
  canAffordCost: (cost: BuildingCost) => boolean;
  recruitSoldiers: (count: number) => void;
  healSoldiers: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  character: null,
  faction: null,
  resources: { wood: 100, stone: 100, gold: 100, food: 100 },
  buildings: [],
  soldiers: {
    total: 0,
    wounded: 0,
  },
  lastResourceUpdate: Date.now(),
  createCharacter: (character) => set({ character }),
  selectFaction: (faction) => set({ faction }),
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
 produceResources: () => {
  const currentTime = Date.now();
  const state = get();
  const timeDiff = (currentTime - state.lastResourceUpdate) / 1000;

  let newResources = { ...state.resources };

  state.buildings.forEach(building => {
    if (building.produce) {
      const production = building.produce();
      Object.keys(production).forEach(resource => {
        if (resource in newResources) {
          newResources[resource as keyof Resources] += production[resource] * timeDiff;
        }
      });
    }
  });

  set({ resources: newResources, lastResourceUpdate: currentTime });
},
  canAffordCost: (cost: BuildingCost) => {
    const { resources } = get();
    return (
      resources.wood >= (cost.wood || 0) &&
      resources.stone >= (cost.stone || 0) &&
      resources.gold >= (cost.gold || 0) &&
      resources.food >= (cost.food || 0)
    );
  },
  recruitSoldiers: (count: number) => {
    const state = get();
    const barracks = state.buildings.find(b => b instanceof Barracks) as Barracks | undefined;
    
    if (barracks) {
      const cost = barracks.recruitCost(count);
      if (state.canAffordCost(cost)) {
        set((state) => ({
          resources: {
            ...state.resources,
            wood: state.resources.wood - (cost.wood || 0),
            gold: state.resources.gold - (cost.gold || 0),
            food: state.resources.food - (cost.food || 0),
          },
          soldiers: {
            ...state.soldiers,
            total: state.soldiers.total + count,
          }
        }));
      }
    }
  },
  healSoldiers: () => {
    const state = get();
    const hospitals = state.buildings.filter(b => b instanceof Hospital) as Hospital[];
    
    const totalHealingRate = hospitals.reduce((sum, hospital) => sum + hospital.heal(), 0) / 60; // per second
    const healedSoldiers = Math.min(state.soldiers.wounded, totalHealingRate);
    
    set((state) => ({
      soldiers: {
        ...state.soldiers,
        wounded: state.soldiers.wounded - healedSoldiers,
      }
    }));
  },
}));