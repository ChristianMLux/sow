'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Graphics, Container, Text } from 'pixi.js';
import { usePixiApp } from '../hooks/usePixiApp';
import { useGameStore } from '../store/gameStore';
import CityCanvas from './CityCanvas';

const TILE_SIZE = 32;
const MAP_WIDTH = 30;
const MAP_HEIGHT = 22;

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const app = usePixiApp(canvasRef, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
  const { faction, character } = useGameStore(state => ({ faction: state.faction, character: state.character }));
  const [showCityPrompt, setShowCityPrompt] = useState(false);
  const [inCity, setInCity] = useState(false);

  useEffect(() => {
    if (app && faction && character) {
      const map = new Container();
      const playerContainer = new Container();
      app.stage.addChild(map);
      app.stage.addChild(playerContainer);

      // Generate map based on faction
      for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          const tile = new Graphics();
          tile.beginFill(getFactionColor(faction, x, y));
          tile.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
          tile.endFill();
          tile.position.set(x * TILE_SIZE, y * TILE_SIZE);
          map.addChild(tile);

          // Add trees and rocks randomly
          if (Math.random() < 0.1) {
            const object = new Graphics();
            if (Math.random() < 0.5) {
              // Tree
              object.beginFill(0x228B22);
              object.drawCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
            } else {
              // Rock
              object.beginFill(0x808080);
              object.drawRect(TILE_SIZE / 4, TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2);
            }
            object.endFill();
            object.position.set(x * TILE_SIZE, y * TILE_SIZE);
            map.addChild(object);
          }
        }
      }

      // Place initial city
      const cityPosition = getInitialCityPosition(faction);
      const city = createCityGraphics();
      city.position.set(cityPosition.x * TILE_SIZE, cityPosition.y * TILE_SIZE);
      map.addChild(city);

      // Add city name
      const cityName = new Text('Capital', {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0x000000,
        align: 'center'
      });
      cityName.anchor.set(0.5, 1);
      cityName.position.set(TILE_SIZE / 2, -5);
      city.addChild(cityName);

      // Add player
      const player = new Graphics();
      player.beginFill(0xFF0000);
      player.drawCircle(0, 0, TILE_SIZE / 2);
      player.endFill();
      player.position.set(cityPosition.x * TILE_SIZE + TILE_SIZE / 2, cityPosition.y * TILE_SIZE + TILE_SIZE / 2);
      playerContainer.addChild(player);

      // Add name plate
      const namePlate = new Text(character.name, {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xFFFFFF,
        align: 'center'
      });
      namePlate.anchor.set(0.5, 1);
      namePlate.position.set(0, -TILE_SIZE / 2);
      player.addChild(namePlate);

      const handleKeyDown = (e: KeyboardEvent) => {
        const oldX = player.x;
        const oldY = player.y;

        switch (e.key) {
          case 'ArrowUp':
            if (player.y > TILE_SIZE / 2) player.y -= TILE_SIZE;
            break;
          case 'ArrowDown':
            if (player.y < (MAP_HEIGHT - 0.5) * TILE_SIZE) player.y += TILE_SIZE;
            break;
          case 'ArrowLeft':
            if (player.x > TILE_SIZE / 2) player.x -= TILE_SIZE;
            break;
          case 'ArrowRight':
            if (player.x < (MAP_WIDTH - 0.5) * TILE_SIZE) player.x += TILE_SIZE;
            break;
        }

        // Check if player is on the city tile
        const cityTileX = cityPosition.x * TILE_SIZE + TILE_SIZE / 2;
        const cityTileY = cityPosition.y * TILE_SIZE + TILE_SIZE / 2;

        if (player.x === cityTileX && player.y === cityTileY) {
          setShowCityPrompt(true);
        } else {
          setShowCityPrompt(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        map.destroy({ children: true });
        playerContainer.destroy({ children: true });
      };
    }
  }, [app, faction, character]);

  const handleEnterCity = () => {
    setInCity(true);
    setShowCityPrompt(false);
  };

  const handleExitCity = () => {
    setInCity(false);
  };

  const handleStayOutside = () => {
    setShowCityPrompt(false);
  };

  if (inCity) {
    return <CityCanvas onExit={handleExitCity} />;
  }

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block', width: '100%', height: 'auto', maxWidth: `${MAP_WIDTH * TILE_SIZE}px` }}
      />
      {showCityPrompt && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow-lg">
          <p className="mb-4">You have reached the city. Do you want to enter?</p>
          <div className="flex justify-between">
            <button onClick={handleEnterCity} className="bg-blue-500 text-white px-4 py-2 rounded">
              Enter City
            </button>
            <button onClick={handleStayOutside} className="bg-gray-300 text-black px-4 py-2 rounded">
              Stay Outside
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const getFactionColor = (faction: string, x: number, y: number): number => {
  const baseColors = {
    Spring: 0x90EE90,
    Summer: 0xFFD700,
    Autumn: 0xD2691E,
    Winter: 0xF0F8FF,
  };
  const baseColor = baseColors[faction as keyof typeof baseColors];
  
  // Add more variation
  const variation = (Math.sin(x * 0.1) + Math.cos(y * 0.1)) * 0x20;
  return baseColor + Math.floor(variation);
};

const getInitialCityPosition = (faction: string) => {
  switch (faction) {
    case 'Spring': return { x: 2, y: 2 };
    case 'Summer': return { x: MAP_WIDTH - 3, y: 2 };
    case 'Autumn': return { x: 2, y: MAP_HEIGHT - 3 };
    case 'Winter': return { x: MAP_WIDTH - 3, y: MAP_HEIGHT - 3 };
    default: return { x: Math.floor(MAP_WIDTH / 2), y: Math.floor(MAP_HEIGHT / 2) };
  }
};

const createCityGraphics = () => {
  const city = new Graphics();
  city.beginFill(0x808080); // Gray base
  city.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
  city.endFill();

  // Add some details to make it look more like a city
  city.lineStyle(1, 0x000000);
  
  // Walls
  city.drawRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
  
  // Towers
  city.beginFill(0x606060);
  city.drawRect(0, 0, 6, 6);
  city.drawRect(TILE_SIZE - 6, 0, 6, 6);
  city.drawRect(0, TILE_SIZE - 6, 6, 6);
  city.drawRect(TILE_SIZE - 6, TILE_SIZE - 6, 6, 6);
  city.endFill();

  // Gate
  city.beginFill(0x8B4513);
  city.drawRect(TILE_SIZE / 2 - 3, TILE_SIZE - 8, 6, 8);
  city.endFill();

  return city;
};

export default GameCanvas;