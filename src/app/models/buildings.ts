// src/models/buildings.ts
import { Graphics, Sprite, Texture } from 'pixi.js';

export interface BuildingCost {
  wood: number;
  stone: number;
  gold: number;
  food?: number;
}

const TILE_SIZE = 4;

export abstract class Building {
  level: number = 1;
  position: { x: number; y: number };
  faction: string;
  productionProgress: number = 0;
  productionTime: number = 60; // Sekunden für einen Produktionszyklus

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
  abstract getProductionRate(): { [key: string]: number };

  produce?(): { [key: string]: number };
  abstract getGraphics(): Graphics | Sprite;

  upgrade(): void {
    this.level++;
  }

  updateProduction(deltaTime: number) {
    this.productionProgress += deltaTime;
    if (this.productionProgress >= this.productionTime) {
      this.productionProgress = 0;
      return this.getProductionRate();
    }
    return null;
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
  
    produce(): { wood: number } {
      return { wood: 10 * this.level };
    }
    getProductionRate(): { [key: string]: number } {
      return { wood: 10 * this.level };
    }
  
    getGraphics(): Graphics {
      const graphics = new Graphics();
      graphics.beginFill(0x8B4513); // Brown color for Woodcutter
      graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
      graphics.endFill();
      return graphics;
    }
  }

  export class Quarry extends Building {
    get name(): string { return "Quarry"; }
    get description(): string { return "Produces stone over time"; }
    get buildCost(): BuildingCost { return { wood: 80, stone: 30, gold: 20 }; }
    get upgradeCost(): BuildingCost { 
      return { 
        wood: 80 * this.level, 
        stone: 30 * this.level, 
        gold: 20 * this.level 
      }; 
    }
    get buildTime(): number { return 90; } // seconds
    get upgradeTime(): number { return 90 * this.level; } // seconds
  
    produce(): { stone: number } {
      return { stone: 8 * this.level };
    }
    getProductionRate(): { [key: string]: number } {
      return { stone: 10 * this.level };
    }
  
    getGraphics(): Graphics {
      const graphics = new Graphics();
      graphics.beginFill(0x808080); // Gray color for Quarry
      graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
      graphics.endFill();
      return graphics;
    }
  }
  
  export class GoldMine extends Building {
    get name(): string { return "Gold Mine"; }
    get description(): string { return "Produces gold over time"; }
    get buildCost(): BuildingCost { return { wood: 100, stone: 100, gold: 50 }; }
    get upgradeCost(): BuildingCost { 
      return { 
        wood: 100 * this.level, 
        stone: 100 * this.level, 
        gold: 50 * this.level 
      }; 
    }
    get buildTime(): number { return 120; } // seconds
    get upgradeTime(): number { return 120 * this.level; } // seconds
  
    produce(): { gold: number } {
      return { gold: 5 * this.level };
    }
    getProductionRate(): { [key: string]: number } {
      return { stone: 10 * this.level };
    }
  
    getGraphics(): Graphics {
      const graphics = new Graphics();
      graphics.beginFill(0xFFD700); // Gold color for Gold Mine
      graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
      graphics.endFill();
      return graphics;
    }
  }
  
  export class Farm extends Building {
    get name(): string { return "Farm"; }
    get description(): string { return "Produces food over time"; }
    get buildCost(): BuildingCost { return { wood: 60, stone: 40, gold: 15 }; }
    get upgradeCost(): BuildingCost { 
      return { 
        wood: 60 * this.level, 
        stone: 40 * this.level, 
        gold: 15 * this.level 
      }; 
    }
    get buildTime(): number { return 75; } // seconds
    get upgradeTime(): number { return 75 * this.level; } // seconds
  
    produce(): { food: number } {
      return { food: 15 * this.level };
    }
    getProductionRate(): { [key: string]: number } {
      return { stone: 10 * this.level };
    }
  
    getGraphics(): Graphics {
      const graphics = new Graphics();
      graphics.beginFill(0x7CFC00); // Hellgrüne Farbe für Farm
      graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
      graphics.endFill();
      return graphics;
    }
  }
  
  export class Warehouse extends Building {
    get name(): string { return "Warehouse"; }
    get description(): string { return "Increases resource storage capacity"; }
    get buildCost(): BuildingCost { return { wood: 150, stone: 150, gold: 50 }; }
    get upgradeCost(): BuildingCost { 
      return { 
        wood: 150 * this.level, 
        stone: 150 * this.level, 
        gold: 50 * this.level 
      }; 
    }
    get buildTime(): number { return 100; } // seconds
    get upgradeTime(): number { return 100 * this.level; } // seconds
  
    produce(): { capacity: number } {
      return { capacity: 1000 * this.level };
    }
    getProductionRate(): { [key: string]: number } {
      return { stone: 10 * this.level };
    }
  
    getGraphics(): Graphics {
      const graphics = new Graphics();
      graphics.beginFill(0xA0522D); // Sienna color for Warehouse
      graphics.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
      graphics.endFill();
      return graphics;
    }
  }
  
  export class Hospital extends Building {
    get name(): string { return "Hospital"; }
    get description(): string { return "Heals wounded soldiers over time"; }
    get buildCost(): BuildingCost { return { wood: 80, stone: 60, gold: 30 }; }
    get upgradeCost(): BuildingCost { 
      return { 
        wood: 80 * this.level, 
        stone: 60 * this.level, 
        gold: 30 * this.level 
      }; 
    }
    get buildTime(): number { return 90; } // seconds
    get upgradeTime(): number { return 90 * this.level; } // seconds
  
    heal(): number {
      return 5 * this.level; // Heal 5 soldiers per minute per level
    }
  
    produce(): { healedSoldiers: number } {
      return { healedSoldiers: this.heal() / 60 }; // Convert to per second rate
    }
    getProductionRate(): { [key: string]: number } {
      return { healedSoldiers: 5 * this.level };
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
    get description(): string { return "Recruits soldiers"; }
    get buildCost(): BuildingCost { return { wood: 100, stone: 50, gold: 20 }; }
    get upgradeCost(): BuildingCost { 
      return { 
        wood: 100 * this.level, 
        stone: 50 * this.level, 
        gold: 20 * this.level 
      }; 
    }
    get buildTime(): number { return 120; } // seconds
    get upgradeTime(): number { return 120 * this.level; } // seconds
  
    recruitCost(count: number): BuildingCost {
      return {
        food: 10 * count,
        wood: 5 * count,
        stone: 0 * count,
        gold: 1 * count
      };
    }
  
    recruitTime(count: number): number {
      return 30 * count / this.level; // 30 seconds per soldier, reduced by barracks level
    }
  
    produce(): { [key: string]: number } {
      return {}; // Barracks doesn't produce anything automatically
    }
    getProductionRate(): { [key: string]: number } {
      return {}; // Barracks don't produce resources
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
    get buildCost(): BuildingCost { return { wood: 0, stone: 0, gold: 0 }; }
    get upgradeCost(): BuildingCost { 
      return { 
        wood: 100 * this.level, 
        stone: 100 * this.level, 
        gold: 100 * this.level 
      }; 
    }
    get buildTime(): number { return 0; }
    get upgradeTime(): number { return 300 * this.level; }
    getProductionRate(): { [key: string]: number } {
      return {}; // TownHall doesn't produce resources
    }
  
    getGraphics(): Sprite {
      const texture = Texture.from('/assets/townhall_1_transparent.png');
      const sprite = new Sprite(texture);
      sprite.width = TILE_SIZE * 8;
      sprite.height = TILE_SIZE * 8;
      return sprite;
    }
  }
