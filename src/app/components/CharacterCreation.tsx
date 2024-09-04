import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface Character {
  name: string;
  avatar: string; // Dies könnte später eine Bild-URL oder ein Index sein
}

const CharacterCreation: React.FC = () => {
  const [character, setCharacter] = useState<Character>({ name: '', avatar: '' });
  const createCharacter = useGameStore(state => state.createCharacter);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacter({ ...character, name: e.target.value });
  };

  const handleAvatarChange = (avatar: string) => {
    setCharacter({ ...character, avatar });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCharacter(character);
    // Hier könnten wir zur Fraktionsauswahl navigieren
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Create Your Character</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">Name:</label>
          <input
            type="text"
            id="name"
            value={character.name}
            onChange={handleNameChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <p className="mb-2">Choose your avatar:</p>
          {/* Hier könnten wir Avataroptionen hinzufügen */}
          <button
            type="button"
            onClick={() => handleAvatarChange('avatar1')}
            className="mr-2 p-2 border rounded"
          >
            Avatar 1
          </button>
          <button
            type="button"
            onClick={() => handleAvatarChange('avatar2')}
            className="mr-2 p-2 border rounded"
          >
            Avatar 2
          </button>
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Character
        </button>
      </form>
    </div>
  );
};

export default CharacterCreation;