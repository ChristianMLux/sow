"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [app, setApp] = useState<PIXI.Application | null>(null);

  useEffect(() => {
    if (canvasRef.current && !app) {
      try {
        const newApp = new PIXI.Application({
          width: 800,
          height: 600,
          backgroundColor: 0x1099bb,
        });

        canvasRef.current.appendChild(newApp.view as HTMLCanvasElement);
        setApp(newApp);

        // Hier später Spiellogik implementieren
      } catch (error) {
        console.error("Error initializing PIXI application:", error);
      }
    }

    return () => {
      if (app) {
        try {
          app.stage.removeChildren();
          app.renderer.destroy();
        } catch (error) {
          console.error("Error cleaning up PIXI application:", error);
        } finally {
          setApp(null);
        }
      }
    };
  }, [app]);

  return <div ref={canvasRef} />;
};

export default GameCanvas;