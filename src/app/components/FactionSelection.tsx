import React from 'react';
import { useGameStore } from '../store/gameStore';

export type Faction = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

const factions: Faction[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

const FactionSelection: React.FC = () => {
  const selectFaction = useGameStore(state => state.selectFaction);

  const handleFactionSelect = (faction: Faction) => {
    selectFaction(faction);
    // Hier könnten wir zur Spielkarte oder zum nächsten Schritt navigieren
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Choose Your Faction</h2>
      <div className="grid grid-cols-2 gap-4">
        {factions.map(faction => (
          <button
            key={faction}
            onClick={() => handleFactionSelect(faction)}
            className="p-4 border rounded hover:bg-gray-100 transition-colors"
          >
            {faction}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FactionSelection;