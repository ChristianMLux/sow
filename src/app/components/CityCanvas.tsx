import React, { useEffect, useRef } from 'react';
import { Graphics, Container, Text } from 'pixi.js';
import { usePixiApp } from '../hooks/usePixiApp';
import { useGameStore } from '../store/gameStore';

const CITY_SIZE = 128;
const TILE_SIZE = 4; // We'll use smaller tiles for the city

const CityCanvas: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const app = usePixiApp(canvasRef, CITY_SIZE * TILE_SIZE, CITY_SIZE * TILE_SIZE);
  const { faction } = useGameStore(state => ({ faction: state.faction }));

  useEffect(() => {
    if (app && faction) {
      const cityContainer = new Container();
      app.stage.addChild(cityContainer);

      // Draw city background
      for (let y = 0; y < CITY_SIZE; y++) {
        for (let x = 0; x < CITY_SIZE; x++) {
          const tile = new Graphics();
          tile.beginFill(getFactionGroundColor(faction, x, y));
          tile.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
          tile.endFill();
          tile.position.set(x * TILE_SIZE, y * TILE_SIZE);
          cityContainer.addChild(tile);
        }
      }

      // Draw city hall
      const cityHall = new Graphics();
      cityHall.beginFill(0x808080);
      cityHall.drawRect(0, 0, TILE_SIZE * 10, TILE_SIZE * 10);
      cityHall.endFill();
      cityHall.position.set((CITY_SIZE / 2 - 5) * TILE_SIZE, (CITY_SIZE / 2 - 5) * TILE_SIZE);
      cityContainer.addChild(cityHall);

      // Add exit button
      const exitButton = new Graphics();
      exitButton.beginFill(0xFF0000);
      exitButton.drawRect(0, 0, TILE_SIZE * 10, TILE_SIZE * 5);
      exitButton.endFill();
      exitButton.position.set(TILE_SIZE, TILE_SIZE);
      exitButton.eventMode = 'static';
      exitButton.on('pointerdown', onExit);
      cityContainer.addChild(exitButton);

      // Add "Exit" text to the button
      const exitText = new Text('Exit', {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xFFFFFF,
      });
      exitText.position.set(TILE_SIZE * 5, TILE_SIZE * 2.5);
      exitText.anchor.set(0.5);
      exitButton.addChild(exitText);

      return () => {
        cityContainer.destroy({ children: true });
      };
    }
  }, [app, faction, onExit]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'block', width: '100%', height: 'auto', maxWidth: `${CITY_SIZE * TILE_SIZE}px` }}
    />
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