"use client";

import { useGameStore } from './store/gameStore';
import CharacterCreation from './components/CharacterCreation';
import FactionSelection from './components/FactionSelection';
import GameCanvas from './components/GameCanvas';

export default function Home() {
  const character = useGameStore(state => state.character);
  const faction = useGameStore(state => state.faction);

  let content;
  if (!character) {
    content = <CharacterCreation />;
  } else if (!faction) {
    content = <FactionSelection />;
  } else {
    content = <GameCanvas />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Seasons of War</h1>
      {content}
    </main>
  );
}