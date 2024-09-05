// src/components/CityCanvas.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { usePixiApp } from '../hooks/usePixiApp';
import { useGameStore } from '../store/gameStore';
import { Building, Woodcutter, Barracks, Hospital, TownHall } from '../models/buildings';

const CITY_SIZE = 128;
const TILE_SIZE = 4;

type BuildingType = 'Woodcutter' | 'Barracks' | 'Hospital';

const CityCanvas: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const app = usePixiApp(canvasRef, CITY_SIZE * TILE_SIZE, CITY_SIZE * TILE_SIZE);
  const [cityContainer, setCityContainer] = useState<Container | null>(null);

  const { 
    faction, 
    buildings, 
    addBuilding, 
    removeBuilding, 
    upgradeBuilding,
    resources,
    updateResources 
  } = useGameStore(state => ({
    faction: state.faction,
    buildings: state.buildings,
    addBuilding: state.addBuilding,
    removeBuilding: state.removeBuilding,
    upgradeBuilding: state.upgradeBuilding,
    resources: state.resources,
    updateResources: state.updateResources
  }));

  const [selectedExistingBuilding, setSelectedExistingBuilding] = useState<Building | null>(null);

  useEffect(() => {
    if (app && faction) {
      const container = new Container();
      app.stage.addChild(container);
      setCityContainer(container);

      // Draw city background
      for (let y = 0; y < CITY_SIZE; y++) {
        for (let x = 0; x < CITY_SIZE; x++) {
          const tile = new Graphics();
          tile.beginFill(getFactionGroundColor(faction, x, y));
          tile.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
          tile.endFill();
          tile.position.set(x * TILE_SIZE, y * TILE_SIZE);
          container.addChild(tile);
        }
      }

      // Add TownHall if it doesn't exist
      if (!buildings.some(building => building instanceof TownHall)) {
        const townHall = new TownHall(CITY_SIZE / 2, CITY_SIZE / 2, faction);
        addBuilding(townHall);
      }

      return () => {
        app.stage.removeChild(container);
        container.destroy({ children: true });
      };
    }
  }, [app, faction]);

  useEffect(() => {
    if (cityContainer) {
      // Clear existing buildings
      cityContainer.removeChildren();

      // Redraw background
      for (let y = 0; y < CITY_SIZE; y++) {
        for (let x = 0; x < CITY_SIZE; x++) {
          const tile = new Graphics();
          tile.beginFill(getFactionGroundColor(faction!, x, y));
          tile.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
          tile.endFill();
          tile.position.set(x * TILE_SIZE, y * TILE_SIZE);
          cityContainer.addChild(tile);
        }
      }

      // Draw buildings
      buildings.forEach(building => {
        const buildingGraphics = building.getGraphics();
        buildingGraphics.position.set(building.position.x * TILE_SIZE, building.position.y * TILE_SIZE);
        buildingGraphics.eventMode = 'static';
        buildingGraphics.on('pointerdown', () => {
          setSelectedExistingBuilding(building);
        });
        cityContainer.addChild(buildingGraphics);
      });
    }
  }, [buildings, cityContainer, faction]);

  const handleBuildBuilding = (buildingType: BuildingType) => {
    if (!faction) return;

    let newBuilding: Building;
    const x = CITY_SIZE / 4; // Fixed X position
    const y = CITY_SIZE / 4; // Fixed Y position

    switch (buildingType) {
      case 'Woodcutter':
        newBuilding = new Woodcutter(x, y, faction);
        break;
      case 'Barracks':
        newBuilding = new Barracks(x, y, faction);
        break;
      case 'Hospital':
        newBuilding = new Hospital(x, y, faction);
        break;
      default:
        return;
    }

    if (canAffordBuilding(newBuilding.buildCost)) {
      addBuilding(newBuilding);
      updateResources({
        wood: resources.wood - newBuilding.buildCost.wood,
        stone: resources.stone - newBuilding.buildCost.stone,
        gold: resources.gold - newBuilding.buildCost.gold
      });
    } else {
      console.log("Not enough resources to build");
    }
  };

  const canAffordBuilding = (cost: { wood: number, stone: number, gold: number }) => {
    return resources.wood >= cost.wood && 
           resources.stone >= cost.stone && 
           resources.gold >= cost.gold;
  };

  const handleUpgrade = () => {
    if (selectedExistingBuilding) {
      if (canAffordBuilding(selectedExistingBuilding.upgradeCost)) {
        upgradeBuilding(selectedExistingBuilding);
        updateResources({
          wood: resources.wood - selectedExistingBuilding.upgradeCost.wood,
          stone: resources.stone - selectedExistingBuilding.upgradeCost.stone,
          gold: resources.gold - selectedExistingBuilding.upgradeCost.gold
        });
      } else {
        console.log("Not enough resources to upgrade");
      }
    }
  };

  const handleRemove = () => {
    if (selectedExistingBuilding && !(selectedExistingBuilding instanceof TownHall)) {
      removeBuilding(selectedExistingBuilding);
      setSelectedExistingBuilding(null);
    } else {
      console.log("Cannot remove TownHall");
    }
  };

  return (
    <div className="city-canvas">
      <div className="resource-bar">
        <span>Wood: {resources.wood}</span>
        <span>Stone: {resources.stone}</span>
        <span>Gold: {resources.gold}</span>
      </div>
      <div className="building-options">
        <button onClick={() => handleBuildBuilding('Woodcutter')}>Build Woodcutter</button>
        <button onClick={() => handleBuildBuilding('Barracks')}>Build Barracks</button>
        <button onClick={() => handleBuildBuilding('Hospital')}>Build Hospital</button>
      </div>
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block', width: '100%', height: 'auto', maxWidth: `${CITY_SIZE * TILE_SIZE}px` }}
      />
      {selectedExistingBuilding && (
        <div className="building-actions">
          <p>{selectedExistingBuilding.name} (Level {selectedExistingBuilding.level})</p>
          <button onClick={handleUpgrade}>Upgrade</button>
          {!(selectedExistingBuilding instanceof TownHall) && (
            <button onClick={handleRemove}>Remove</button>
          )}
        </div>
      )}
      <button onClick={onExit}>Exit City</button>
    </div>
  );
};

const getFactionGroundColor = (faction: string, x: number, y: number): number => {
  const baseColors = {
    Spring: 0x90EE90,
    Summer: 0x32CD32,
    Autumn: 0xD2691E,
    Winter: 0xFFFAFA,
  };
  const baseColor = baseColors[faction as keyof typeof baseColors];
  
  // Add subtle variation
  const variation = (Math.sin(x * 0.1) + Math.cos(y * 0.1)) * 0x10;
  return baseColor + Math.floor(variation);
};

export default CityCanvas;