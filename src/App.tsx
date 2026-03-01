import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import PhrasesScreen from './components/PhrasesScreen';
import SubcategorySelector from './components/SubcategorySelector';
import LanguageAccessPolicy from './components/LanguageAccessPolicy';
import CommunityNavigator from './components/CommunityNavigator';
import ConversationScreen from './components/ConversationScreen';
import TalkTogetherScreen from './components/TalkTogetherScreen';
import JobSiteTalkScreen from './components/JobSiteTalkScreen';
import CertificatesPage from './components/CertificatesPage';
import AmbassadorsPage from './components/AmbassadorsPage';
import UpdateToast from './components/UpdateToast';
import DebugOverlay from './components/DebugOverlay';
import { Language, Sector } from './data/phrases';
import {
  Subcategory,
  healthcareSubcategories,
  educationSubcategories,
  constructionSubcategories
} from './data/subcategories';
import { initAudioUnlock } from './utils/speech';
import { useUpdateManager } from './hooks/useUpdateManager';

type AppView =
  | 'home'
  | 'subcategory'
  | 'language'
  | 'phrases'
  | 'policy'
  | 'community'
  | 'conversation'
  | 'talk-together'
  | 'job-site-talk'
  | 'certificates'
  | 'ambassadors';

function App() {
  const [view, setView] = useState<AppView>('home');
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [toastDismissed, setToastDismissed] = useState(false);
  const [talkTogetherPending, setTalkTogetherPending] = useState(false);
  const [jobSiteTalkPending, setJobSiteTalkPending] = useState(false);

  const { updateAvailable, applyUpdate, checkForUpdates } = useUpdateManager();

  useEffect(() => {
    initAudioUnlock();
  }, []);

  useEffect(() => {
    if (updateAvailable) {
      setToastDismissed(false);
    }
  }, [updateAvailable]);

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
    if (talkTogetherPending) {
      setTalkTogetherPending(false);
      setView('talk-together');
    } else if (jobSiteTalkPending) {
      setJobSiteTalkPending(false);
      setView('job-site-talk');
    } else {
      setView('phrases');
    }
  };

  const handleBackFromPhrases = () => {
    setSelectedLanguage(null);
    setView('language');
  };

  const handleBackFromLanguage = () => {
    setSelectedSubcategory(null);
    setSelectedLanguage(null);
    setTalkTogetherPending(false);
    setJobSiteTalkPending(false);
    setView('subcategory');
  };

  const handleBackToHome = () => {
    setSelectedSector(null);
    setSelectedSubcategory(null);
    setSelectedLanguage(null);
    setTalkTogetherPending(false);
    setJobSiteTalkPending(false);
    setView('home');
  };

  const handleOpenConversation = () => {
    setView('conversation');
  };

  const handleOpenTalkTogether = () => {
    setTalkTogetherPending(true);
    setView('language');
  };

  const handleOpenJobSiteTalk = () => {
    setJobSiteTalkPending(true);
    setView('language');
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

  const showToast = updateAvailable && !toastDismissed;

  return (
    <>
      {view === 'certificates' && (
        <CertificatesPage onBack={() => setView('home')} />
      )}

      {view === 'ambassadors' && (
        <AmbassadorsPage onBack={() => setView('home')} />
      )}

      {view === 'policy' && (
        <LanguageAccessPolicy onBack={() => setView('home')} />
      )}

      {view === 'community' && (
        <CommunityNavigator onBack={() => setView('home')} />
      )}

      {view === 'conversation' && selectedLanguage && (
        <ConversationScreen
          language={selectedLanguage}
          onBack={() => setView('phrases')}
        />
      )}

      {view === 'talk-together' && selectedLanguage && (
        <TalkTogetherScreen
          language={selectedLanguage}
          onBack={() => setView('subcategory')}
        />
      )}

      {view === 'job-site-talk' && selectedLanguage && (
        <JobSiteTalkScreen
          language={selectedLanguage}
          onBack={() => setView('subcategory')}
        />
      )}

      {view === 'phrases' && selectedLanguage && selectedSector && selectedSubcategory && (
        <PhrasesScreen
          language={selectedLanguage}
          sector={selectedSector}
          subcategory={selectedSubcategory}
          onBack={handleBackFromPhrases}
          onOpenConversation={selectedSector === 'healthcare' ? handleOpenConversation : undefined}
          onOpenTalkTogether={selectedSector === 'education' ? () => setView('talk-together') : undefined}
          onOpenJobSiteTalk={selectedSector === 'construction' ? () => setView('job-site-talk') : undefined}
        />
      )}

      {view === 'language' && selectedSector && (selectedSubcategory || talkTogetherPending || jobSiteTalkPending) && (
        <HomeScreen
          selectedSector={selectedSector}
          selectedSubcategory={selectedSubcategory}
          onSelectSector={handleSelectSector}
          onSelectLanguage={handleSelectLanguage}
          onBackToSectorSelection={handleBackFromLanguage}
          onOpenPolicy={() => setView('policy')}
          onOpenCommunityNavigator={() => setView('community')}
          onOpenCertificates={() => setView('certificates')}
          onOpenAmbassadors={() => setView('ambassadors')}
          onCheckForUpdates={checkForUpdates}
        />
      )}

      {view === 'subcategory' && selectedSector && (
        <SubcategorySelector
          subcategories={getSubcategories()}
          sectorLabel={getSectorLabel()}
          onSelectSubcategory={handleSelectSubcategory}
          onBack={handleBackToHome}
          onOpenTalkTogether={selectedSector === 'education' ? handleOpenTalkTogether : undefined}
          onOpenJobSiteTalk={selectedSector === 'construction' ? handleOpenJobSiteTalk : undefined}
          selectedLanguage={selectedLanguage}
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
          onOpenCertificates={() => setView('certificates')}
          onOpenAmbassadors={() => setView('ambassadors')}
          onCheckForUpdates={checkForUpdates}
        />
      )}

      <UpdateToast
        visible={showToast}
        onRefresh={applyUpdate}
        onDismiss={() => setToastDismissed(true)}
      />

      <DebugOverlay />
    </>
  );
}

export default App;
