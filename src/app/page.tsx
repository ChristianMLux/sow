"use client";

import GameCanvas from './components/GameCanvas';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Seasons of War</h1>
      <GameCanvas />
    </main>
  );
}