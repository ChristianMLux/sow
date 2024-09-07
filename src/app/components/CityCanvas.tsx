import React, { useEffect, useRef, useState } from 'react';
import { Container, Graphics, Sprite, Texture, Assets, Text } from 'pixi.js';
import { usePixiApp } from '../hooks/usePixiApp';
import { useGameStore } from '../store/gameStore';
import { Building, Woodcutter, Quarry, GoldMine, Farm, Warehouse, Barracks, Hospital, TownHall } from '../models/buildings';

const CITY_SIZE = 128;
const TILE_SIZE = 4;

type BuildingType = 'Woodcutter' | 'Quarry' | 'GoldMine' | 'Farm' | 'Warehouse' | 'Barracks' | 'Hospital';

const BUILDING_ICONS: Record<BuildingType, string> = {
  Woodcutter: '🪓',
  Quarry: '⛏️',
  GoldMine: '💰',
  Farm: '🌾',
  Warehouse: '🏭',
  Barracks: '⚔️',
  Hospital: '🏥'
};

const CityCanvas: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const app = usePixiApp(canvasRef, CITY_SIZE * TILE_SIZE, CITY_SIZE * TILE_SIZE);
  const [cityContainer, setCityContainer] = useState<Container | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [placingBuilding, setPlacingBuilding] = useState<Building | null>(null);
  const [placementPosition, setPlacementPosition] = useState({ x: CITY_SIZE / 4, y: CITY_SIZE / 4 });
  const [isPlacingBuilding, setIsPlacingBuilding] = useState(false);

  const { 
    faction, 
    buildings, 
    addBuilding, 
    removeBuilding, 
    upgradeBuilding,
    resources,
    updateResources,
    produceResources,
    canAffordCost,
    recruitSoldiers,
    healSoldiers,
    soldiers
  } = useGameStore(state => ({
    faction: state.faction,
    buildings: state.buildings,
    addBuilding: state.addBuilding,
    removeBuilding: state.removeBuilding,
    upgradeBuilding: state.upgradeBuilding,
    resources: state.resources,
    updateResources: state.updateResources,
    produceResources: state.produceResources,
    canAffordCost: state.canAffordCost,
    recruitSoldiers: state.recruitSoldiers,
    healSoldiers: state.healSoldiers,
    soldiers: state.soldiers
  }));

  const [selectedExistingBuilding, setSelectedExistingBuilding] = useState<Building | null>(null);
  const [recruitmentCount, setRecruitmentCount] = useState<number>(1);

  useEffect(() => {
    const loadAssets = async () => {
      await Assets.load('/assets/townhall_1_transparent.png');
      setAssetsLoaded(true);
    };

    loadAssets();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      produceResources();
      healSoldiers();
    }, 1000);

    return () => clearInterval(interval);
  }, [produceResources, healSoldiers]);

  useEffect(() => {
    if (app && faction && assetsLoaded) {
      const container = new Container();
      app.stage.addChild(container);
      setCityContainer(container);

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

      if (!buildings.some(building => building instanceof TownHall)) {
        const townHall = new TownHall(CITY_SIZE / 2 - 2, CITY_SIZE / 2 - 2, faction);
        addBuilding(townHall);
      }

      return () => {
        app.stage.removeChild(container);
        container.destroy({ children: true });
      };
    }
  }, [app, faction, assetsLoaded]);

  useEffect(() => {
    if (cityContainer) {
      cityContainer.removeChildren();

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

      buildings.forEach(building => {
        const buildingGraphics = building.getGraphics();
        buildingGraphics.position.set(
          building.position.x * TILE_SIZE, 
          building.position.y * TILE_SIZE
        );
        buildingGraphics.eventMode = 'static';
        buildingGraphics.on('pointerdown', () => {
          setSelectedExistingBuilding(building);
        });
        cityContainer.addChild(buildingGraphics);
      });
    }
  }, [buildings, cityContainer, faction]);

  const drawPlacementIcon = () => {
    if (cityContainer && isPlacingBuilding && placingBuilding) {
      cityContainer.children.forEach((child) => {
        if (child.name === 'placementIcon') {
          cityContainer.removeChild(child);
        }
      });

      const icon = new Text(BUILDING_ICONS[placingBuilding.name as BuildingType], {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xFFFFFF
      });
      icon.name = 'placementIcon';
      icon.position.set(placementPosition.x * TILE_SIZE, placementPosition.y * TILE_SIZE);
      cityContainer.addChild(icon);
    }
  };

  useEffect(() => {
    drawPlacementIcon();
  }, [isPlacingBuilding, placementPosition, cityContainer, placingBuilding]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlacingBuilding) {
        let newPosition = { ...placementPosition };
        switch (e.key) {
          case 'ArrowUp':
            newPosition.y = Math.max(0, newPosition.y - 1);
            break;
          case 'ArrowDown':
            newPosition.y = Math.min(CITY_SIZE - 1, newPosition.y + 1);
            break;
          case 'ArrowLeft':
            newPosition.x = Math.max(0, newPosition.x - 1);
            break;
          case 'ArrowRight':
            newPosition.x = Math.min(CITY_SIZE - 1, newPosition.x + 1);
            break;
          case 'Enter':
            handleConfirmPlacement();
            return;
          case 'Escape':
            setIsPlacingBuilding(false);
            setPlacingBuilding(null);
            return;
        }
        setPlacementPosition(newPosition);
        drawPlacementIcon();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlacingBuilding, placementPosition]);

  const handleBuildBuilding = (buildingType: BuildingType) => {
    if (!faction) return;
  
    let newBuilding: Building;
    switch (buildingType) {
      case 'Woodcutter':
        newBuilding = new Woodcutter(0, 0, faction);
        break;
      case 'Quarry': 
        newBuilding = new Quarry(0, 0, faction);
        break;
      case 'GoldMine': 
        newBuilding = new GoldMine(0, 0, faction);
        break;
      case 'Farm':
        newBuilding = new Farm(0, 0, faction);
        break;
      case 'Warehouse':
        newBuilding = new Warehouse(0, 0, faction);
        break;
      case 'Barracks':
        newBuilding = new Barracks(0, 0, faction);
        break;
      case 'Hospital':
        newBuilding = new Hospital(0, 0, faction);
        break;
      default:
        return;
    }

    setPlacingBuilding(newBuilding);
    setIsPlacingBuilding(true);
    setPlacementPosition({ x: CITY_SIZE / 4, y: CITY_SIZE / 4 });
    drawPlacementIcon();
  };

  const handleConfirmPlacement = () => {
    if (placingBuilding && canAffordCost(placingBuilding.buildCost)) {
      placingBuilding.position = { 
        x: placementPosition.x, 
        y: placementPosition.y 
      };
      addBuilding(placingBuilding);
      updateResources({
        wood: resources.wood - placingBuilding.buildCost.wood,
        stone: resources.stone - placingBuilding.buildCost.stone,
        gold: resources.gold - placingBuilding.buildCost.gold
      });
      setPlacingBuilding(null);
      setIsPlacingBuilding(false);
    }
  };
  const handleUpgrade = () => {
    if (selectedExistingBuilding) {
      if (canAffordCost(selectedExistingBuilding.upgradeCost)) {
        upgradeBuilding(selectedExistingBuilding);
        updateResources({
          wood: resources.wood - selectedExistingBuilding.upgradeCost.wood,
          stone: resources.stone - selectedExistingBuilding.upgradeCost.stone!,
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

  const handleRecruitSoldiers = () => {
    recruitSoldiers(recruitmentCount);
  };

  const updateBuildingGraphics = (building: Building) => {
    if (cityContainer) {
      const buildingGraphics = cityContainer.children.find(
        child => child.name === `building-${building.name}`
      ) as Container;
  
      if (buildingGraphics) {
        const progressBar = buildingGraphics.getChildByName('progressBar') as Graphics;
        if (!progressBar) {
          const newProgressBar = new Graphics();
          newProgressBar.name = 'progressBar';
          buildingGraphics.addChild(newProgressBar);
        }
  
        progressBar.clear();
        progressBar.beginFill(0x00FF00);
        progressBar.drawRect(0, TILE_SIZE, TILE_SIZE * (building.productionProgress / building.productionTime), 2);
        progressBar.endFill();
      }
    }
  };

  return (
    <div className="city-canvas">
      <div className="resource-bar">
        <span>Wood: {Math.floor(resources.wood)}</span>
        <span>Stone: {Math.floor(resources.stone)}</span>
        <span>Gold: {Math.floor(resources.gold)}</span>
        <span>Food: {Math.floor(resources.food)}</span>
        <span>Soldiers: {soldiers.total} (Wounded: {soldiers.wounded})</span>
      </div>
      <div className="building-options grid grid-cols-4 gap-4">
        {Object.entries(BUILDING_ICONS).map(([type, icon]) => (
          <button
            key={type}
            onClick={() => handleBuildBuilding(type as BuildingType)}
            className="flex flex-col items-center justify-center p-2 border rounded"
          >
            <span className="text-2xl mb-1">{icon}</span>
            <span>{type}</span>
          </button>
        ))}
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
          {selectedExistingBuilding instanceof Barracks && (
            <div>
              <input 
                type="number" 
                value={recruitmentCount} 
                onChange={(e) => setRecruitmentCount(Math.max(1, parseInt(e.target.value)))}
                min="1"
              />
              <button onClick={handleRecruitSoldiers}>Recruit Soldiers</button>
            </div>
          )}
        </div>
      )}
      {isPlacingBuilding && (
        <div className="placement-instructions">
          <p>Use arrow keys to move, Enter to place, Escape to cancel</p>
          <p>Position: ({placementPosition.x}, {placementPosition.y})</p>
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
  
  const variation = (Math.sin(x * 0.1) + Math.cos(y * 0.1)) * 0x10;
  return baseColor + Math.floor(variation);
};

export default CityCanvas;