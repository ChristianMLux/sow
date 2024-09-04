import { useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';

export const usePixiApp = (canvasRef: React.RefObject<HTMLCanvasElement>, width: number, height: number) => {
  const [app, setApp] = useState<Application | null>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    let isMounted = true;

    const createApp = async () => {
      if (canvasRef.current && !appRef.current) {
        const newApp = new Application();
        await newApp.init({
          width,
          height,
          backgroundColor: 0x1099bb,
          view: canvasRef.current,
          resizeTo: canvasRef.current,
        });

        if (isMounted) {
          appRef.current = newApp;
          setApp(newApp);
        }
      }
    };

    createApp();

    return () => {
      isMounted = false;
      if (appRef.current) {
        const currentApp = appRef.current;
        setTimeout(() => {
          if (currentApp && !currentApp.destroy) {
            currentApp.destroy();
          }
        }, 0);
        appRef.current = null;
        setApp(null);
      }
    };
  }, [canvasRef, width, height]);

  return app;
};