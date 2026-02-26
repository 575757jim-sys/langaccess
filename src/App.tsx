import { useState } from 'react';
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

type AppView = 'home' | 'subcategory' | 'language' | 'phrases' | 'policy' | 'community';

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [view, setView] = useState<AppView>('home');
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const handleEnter = () => {
    const player = document.getElementById('medical-audio-player') as HTMLAudioElement | null;
    if (player) {
      player.play().catch(() => {});
    }
    setUnlocked(true);
  };

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
      <audio id="medical-audio-player" preload="auto" style={{ display: 'none' }} />

      {!unlocked && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f4c81 100%)' }}
        >
          <div className="text-center px-8 max-w-sm">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">LangAccess</h1>
            <p className="text-blue-200 text-base mb-2">Medical Language Assistant</p>
            <p className="text-white/50 text-sm mb-10">Tap below to enable audio playback for all languages</p>
            <button
              onClick={handleEnter}
              className="w-full py-4 px-8 rounded-2xl text-lg font-semibold text-white transition-all duration-200 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 8px 32px rgba(37,99,235,0.5)' }}
            >
              Enter App
            </button>
            <p className="text-white/30 text-xs mt-4">Required for audio on iOS / Safari</p>
          </div>
        </div>
      )}

      {unlocked && (
        <>
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
      )}
    </>
  );
}

export default App;
