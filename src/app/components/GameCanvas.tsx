import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const app = new PIXI.Application({
        width: 800,
        height: 600,
        backgroundColor: 0x1099bb,
      });

      canvasRef.current.appendChild(app.view as unknown as Node);

      //TODO: Add game logic

      return () => {
        app.destroy(true);
      };
    }
  }, []);

  return <div ref={canvasRef} />;
};

export default GameCanvas;