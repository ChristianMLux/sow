'use client';

import React, { useEffect, useRef } from 'react';
import { Graphics, Container } from 'pixi.js';
import { usePixiApp } from '../hooks/usePixiApp';

const TILE_SIZE = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const app = usePixiApp(canvasRef, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

  useEffect(() => {
    if (app) {
      const map = new Container();
      app.stage.addChild(map);

      for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          const tile = new Graphics();
          tile.fill(Math.random() > 0.7 ? 0x228B22 : 0x8B4513);
          tile.rect(0, 0, TILE_SIZE, TILE_SIZE);
          tile.fill();
          tile.position.set(x * TILE_SIZE, y * TILE_SIZE);
          map.addChild(tile);
        }
      }

      const player = new Graphics();
      player.fill(0xFF0000);
      player.circle(0, 0, TILE_SIZE / 2);
      player.fill();
      player.position.set(TILE_SIZE / 2, TILE_SIZE / 2);
      app.stage.addChild(player);

      const handleKeyDown = (e: KeyboardEvent) => {
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
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        map.destroy({ children: true });
        player.destroy();
      };
    }
  }, [app]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'block', width: '100%', height: 'auto', maxWidth: `${MAP_WIDTH * TILE_SIZE}px` }}
    />
  );
};

export default GameCanvas;