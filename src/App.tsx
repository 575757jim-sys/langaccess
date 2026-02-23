import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import PhrasesScreen from './components/PhrasesScreen';
import { Language, Sector } from './data/phrases';

function App() {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const handleSelectSector = (sector: Sector) => {
    setSelectedSector(sector);
  };

  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleBack = () => {
    setSelectedLanguage(null);
  };

  const handleBackToSectorSelection = () => {
    setSelectedSector(null);
    setSelectedLanguage(null);
  };

  return (
    <>
      {selectedLanguage && selectedSector ? (
        <PhrasesScreen
          language={selectedLanguage}
          sector={selectedSector}
          onBack={handleBack}
        />
      ) : (
        <HomeScreen
          selectedSector={selectedSector}
          onSelectSector={handleSelectSector}
          onSelectLanguage={handleSelectLanguage}
          onBackToSectorSelection={handleBackToSectorSelection}
        />
      )}
    </>
  );
}

export default App;
