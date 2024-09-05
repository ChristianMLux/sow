// src/models/buildings.ts
import { Graphics, Sprite, Texture } from 'pixi.js';
export interface BuildingCost {
    wood: number;
    stone: number;
    gold: number;
  }
  const TILE_SIZE = 4;
  
  export abstract class Building {
    level: number = 1;
    position: { x: number; y: number };
    faction: string;
  
    constructor(x: number, y: number, faction: string) {
      this.position = { x, y };
      this.faction = faction;
    }
  
    abstract get name(): string;
    abstract get description(): string;
    abstract get buildCost(): BuildingCost;
    abstract get upgradeCost(): BuildingCost;
    abstract get buildTime(): number;
    abstract get upgradeTime(): number;
  
    abstract produce(): void;
    abstract getGraphics(): Graphics | Sprite;
  
    upgrade(): void {
      this.level++;
    }
  }
  
  export class Woodcutter extends Building {
    get name(): string { return "Woodcutter"; }
    get description(): string { return "Produces wood over time"; }
    get buildCost(): BuildingCost { return { wood: 50, stone: 20, gold: 10 }; }
    get upgradeCost(): BuildingCost { 
      return { 
        wood: 50 * this.level, 
        stone: 20 * this.level, 
        gold: 10 * this.level 
      }; 
    }
    get buildTime(): number { return 60; } // seconds
    get upgradeTime(): number { return 60 * this.level; } // seconds
  
    produce(): void {
      // Logic to produce wood based on level
    }
  
    
    getGraphics(): Graphics {
        const graphics = new Graphics();
        graphics.fill(0x8B4513); // Brown color for Woodcutter
        graphics.rect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.fill();
        return graphics;
      }
  }
  
  export class Hospital extends Building {
    get name(): string { return "Hospital"; }
    get description(): string { return "Heals Units over time"; }
    get buildCost(): BuildingCost { return { wood: 50, stone: 20, gold: 10 }; }
    get upgradeCost(): BuildingCost { 
      return { 
        wood: 50 * this.level, 
        stone: 20 * this.level, 
        gold: 10 * this.level 
      }; 
    }
    get buildTime(): number { return 60; } // seconds
    get upgradeTime(): number { return 60 * this.level; } // seconds
  
    produce(): void {
      // Logic to produce wood based on level
    }
  
    getGraphics(): Graphics {
        const graphics = new Graphics();
        graphics.beginFill(0xFFFFFF); // White color for Hospital
        graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.endFill();
        return graphics;
      }
  }

  export class Barracks extends Building {
    get name(): string { return "Barracks"; }
    get description(): string { return "Recrutes Units over time"; }
    get buildCost(): BuildingCost { return { wood: 50, stone: 20, gold: 10 }; }
    get upgradeCost(): BuildingCost { 
      return { 
        wood: 50 * this.level, 
        stone: 20 * this.level, 
        gold: 10 * this.level 
      }; 
    }
    get buildTime(): number { return 60; } // seconds
    get upgradeTime(): number { return 60 * this.level; } // seconds
  
    produce(): void {
      // Logic to produce wood based on level
    }
  
    getGraphics(): Graphics {
        const graphics = new Graphics();
        graphics.beginFill(0x8B0000); // Dark red color for Barracks
        graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        graphics.endFill();
        return graphics;
      }
  }

  export class TownHall extends Building {
    get name(): string { return "Town Hall"; }
    get description(): string { return "The center of your city"; }
    get buildCost(): BuildingCost { return { wood: 0, stone: 0, gold: 0 }; } // Cannot be built, only upgraded
    get upgradeCost(): BuildingCost { 
      return { 
        wood: 100 * this.level, 
        stone: 100 * this.level, 
        gold: 100 * this.level 
      }; 
    }
    get buildTime(): number { return 0; } // Instant
    get upgradeTime(): number { return 300 * this.level; } // 5 minutes * level
  
    produce(): void {
      // Town Hall doesn't produce resources
    }
    getGraphics(): Sprite {
        const texture = Texture.from('/assets/townhall_1_transparent.png');
        const sprite = new Sprite(texture);
        sprite.width = TILE_SIZE * 8;  // Adjust size as needed
        sprite.height = TILE_SIZE * 8; // Adjust size as needed
        return sprite;
      }
  }
 