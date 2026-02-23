import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import PhrasesScreen from './components/PhrasesScreen';
import SubcategorySelector from './components/SubcategorySelector';
import { Language, Sector } from './data/phrases';
import {
  Subcategory,
  healthcareSubcategories,
  educationSubcategories,
  constructionSubcategories
} from './data/subcategories';

function App() {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const handleSelectSector = (sector: Sector) => {
    setSelectedSector(sector);
    setSelectedSubcategory(null);
  };

  const handleSelectSubcategory = (subcategory: string) => {
    setSelectedSubcategory(subcategory as Subcategory);
  };

  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleBackFromPhrases = () => {
    setSelectedLanguage(null);
  };

  const handleBackFromSubcategory = () => {
    setSelectedSubcategory(null);
    setSelectedLanguage(null);
  };

  const handleBackToSectorSelection = () => {
    setSelectedSector(null);
    setSelectedSubcategory(null);
    setSelectedLanguage(null);
  };

  const getSubcategories = () => {
    if (selectedSector === 'healthcare') return healthcareSubcategories;
    if (selectedSector === 'education') return educationSubcategories;
    if (selectedSector === 'construction') return constructionSubcategories;
    return [];
  };

  const getSectorLabel = () => {
    if (selectedSector === 'healthcare') return 'Healthcare';
    if (selectedSector === 'education') return 'Education';
    if (selectedSector === 'construction') return 'Construction';
    return '';
  };

  return (
    <>
      {selectedLanguage && selectedSector && selectedSubcategory ? (
        <PhrasesScreen
          language={selectedLanguage}
          sector={selectedSector}
          subcategory={selectedSubcategory}
          onBack={handleBackFromPhrases}
        />
      ) : selectedSector && selectedSubcategory ? (
        <HomeScreen
          selectedSector={selectedSector}
          selectedSubcategory={selectedSubcategory}
          onSelectSector={handleSelectSector}
          onSelectLanguage={handleSelectLanguage}
          onBackToSectorSelection={handleBackFromSubcategory}
        />
      ) : selectedSector ? (
        <SubcategorySelector
          subcategories={getSubcategories()}
          sectorLabel={getSectorLabel()}
          onSelectSubcategory={handleSelectSubcategory}
          onBack={handleBackToSectorSelection}
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
