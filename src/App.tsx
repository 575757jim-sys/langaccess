import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import PhrasesScreen from './components/PhrasesScreen';
import SubcategorySelector from './components/SubcategorySelector';
import LanguageAccessPolicy from './components/LanguageAccessPolicy';
import CommunityNavigator from './components/CommunityNavigator';
import { Language, Sector } from './data/phrases';
import {
  Subcategory,
  healthcareSubcategories,
  educationSubcategories,
  constructionSubcategories
} from './data/subcategories';
import { initAudioUnlock } from './utils/speech';

type AppView = 'home' | 'subcategory' | 'language' | 'phrases' | 'policy' | 'community';

function App() {
  const [view, setView] = useState<AppView>('home');

  useEffect(() => {
    initAudioUnlock();
  }, []);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const handleSelectSector = (sector: Sector) => {
    setSelectedSector(sector);
    setSelectedSubcategory(null);
    setView('subcategory');
  };

  const handleSelectSubcategory = (subcategory: string) => {
    setSelectedSubcategory(subcategory as Subcategory);
    setView('language');
  };

  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
    setView('phrases');
  };

  const handleBackFromPhrases = () => {
    setSelectedLanguage(null);
    setView('language');
  };

  const handleBackFromLanguage = () => {
    setSelectedSubcategory(null);
    setSelectedLanguage(null);
    setView('subcategory');
  };

  const handleBackToHome = () => {
    setSelectedSector(null);
    setSelectedSubcategory(null);
    setSelectedLanguage(null);
    setView('home');
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
      <audio id="global-audio-player" style={{ display: 'none' }} />

      {view === 'policy' && (
        <LanguageAccessPolicy onBack={() => setView('home')} />
      )}

      {view === 'community' && (
        <CommunityNavigator onBack={() => setView('home')} />
      )}

      {view === 'phrases' && selectedLanguage && selectedSector && selectedSubcategory && (
        <PhrasesScreen
          language={selectedLanguage}
          sector={selectedSector}
          subcategory={selectedSubcategory}
          onBack={handleBackFromPhrases}
        />
      )}

      {view === 'language' && selectedSector && selectedSubcategory && (
        <HomeScreen
          selectedSector={selectedSector}
          selectedSubcategory={selectedSubcategory}
          onSelectSector={handleSelectSector}
          onSelectLanguage={handleSelectLanguage}
          onBackToSectorSelection={handleBackFromLanguage}
          onOpenPolicy={() => setView('policy')}
          onOpenCommunityNavigator={() => setView('community')}
        />
      )}

      {view === 'subcategory' && selectedSector && (
        <SubcategorySelector
          subcategories={getSubcategories()}
          sectorLabel={getSectorLabel()}
          onSelectSubcategory={handleSelectSubcategory}
          onBack={handleBackToHome}
        />
      )}

      {view === 'home' && (
        <HomeScreen
          selectedSector={null}
          onSelectSector={handleSelectSector}
          onSelectLanguage={handleSelectLanguage}
          onBackToSectorSelection={handleBackToHome}
          onOpenPolicy={() => setView('policy')}
          onOpenCommunityNavigator={() => setView('community')}
        />
      )}
    </>
  );
}

export default App;
