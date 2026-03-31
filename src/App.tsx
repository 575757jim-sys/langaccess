import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import LandingPage from './components/LandingPage';
import PhrasesScreen from './components/PhrasesScreen';
import SubcategorySelector from './components/SubcategorySelector';
import LanguageAccessPolicy from './components/LanguageAccessPolicy';
import CommunityNavigator from './components/CommunityNavigator';
import ConversationScreen from './components/ConversationScreen';
import TalkTogetherScreen from './components/TalkTogetherScreen';
import JobSiteTalkScreen from './components/JobSiteTalkScreen';
import CertificatesPage from './components/CertificatesPage';
import CertVerifyPage from './components/CertVerifyPage';
import AmbassadorsPage from './components/AmbassadorsPage';
import OrderCardsPage from './components/OrderCardsPage';
import PublicOrderPage from './components/PublicOrderPage';
import QRScanPage from './components/QRScanPage';
import PaymentSuccessPage from './components/PaymentSuccessPage';
import PaymentCancelPage from './components/PaymentCancelPage';
import UpdateToast from './components/UpdateToast';
import DebugOverlay from './components/DebugOverlay';
import InstallBanner from './components/InstallBanner';
import { Language, Sector } from './data/phrases';
import {
  Subcategory,
  healthcareSubcategories,
  educationSubcategories,
  constructionSubcategories,
  outreachSubcategories,
} from './data/subcategories';
import { initAudioUnlock } from './utils/speech';
import { useUpdateManager } from './hooks/useUpdateManager';

type AppView =
  | 'home'
  | 'sector-select'
  | 'subcategory'
  | 'language'
  | 'phrases'
  | 'policy'
  | 'community'
  | 'conversation'
  | 'talk-together'
  | 'job-site-talk'
  | 'certificates'
  | 'cert-verify'
  | 'ambassadors'
  | 'order-cards';

function getQRSlug(): string | null {
  const match = window.location.pathname.match(/^\/r\/([^/]+)/);
  return match ? match[1] : null;
}

function getHelpPath(): boolean {
  return window.location.pathname === '/help';
}

function getVerifyPath(): boolean {
  return window.location.pathname === '/verify';
}

function getOrderCardsPath(): boolean {
  return window.location.pathname === '/order-cards';
}

function getPublicOrderPath(): boolean {
  if (window.location.pathname !== '/order-cards') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('ref') || params.has('aid');
}

function getAmbassadorsPath(): boolean {
  return window.location.pathname === '/ambassadors' || window.location.pathname === '/ambassador';
}

function getCertificatesPath(): boolean {
  return window.location.pathname === '/certificates';
}

function getPaymentSuccessPath(): boolean {
  return window.location.pathname === '/success';
}

function getPaymentCancelPath(): boolean {
  return window.location.pathname === '/cancel';
}

function AppInner() {
  const qrSlug = getQRSlug();
  const isHelpPath = getHelpPath();
  const isVerifyPath = getVerifyPath();
  const isOrderCardsPath = getOrderCardsPath();
  const isAmbassadorsPath = getAmbassadorsPath();
  const isCertificatesPath = getCertificatesPath();
  const [view, setView] = useState<AppView>(
    isHelpPath ? 'community' : isOrderCardsPath ? 'order-cards' : isVerifyPath ? 'cert-verify' : isAmbassadorsPath ? 'ambassadors' : isCertificatesPath ? 'certificates' : 'home'
  );
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
    setView('sector-select');
  };

  const handleBackToLanding = () => {
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
    if (selectedSector === 'outreach') return outreachSubcategories;
    return [];
  };

  const getSectorLabel = () => {
    if (selectedSector === 'healthcare') return 'Healthcare';
    if (selectedSector === 'education') return 'Education';
    if (selectedSector === 'construction') return 'Construction';
    if (selectedSector === 'outreach') return 'Community Outreach';
    return '';
  };

  const showToast = updateAvailable && !toastDismissed;

  useEffect(() => {
    // Skip validation for standalone pages
    if (view === 'community' || view === 'policy' || view === 'certificates' || view === 'cert-verify' || view === 'ambassadors' || view === 'order-cards') {
      return;
    }

    if (view === 'conversation' && !selectedLanguage) {
      setView('language');
    } else if (view === 'talk-together' && !selectedLanguage) {
      setTalkTogetherPending(true);
      setView('language');
    } else if (view === 'job-site-talk' && !selectedLanguage) {
      setJobSiteTalkPending(true);
      setView('language');
    } else if (view === 'phrases' && (!selectedLanguage || !selectedSector || !selectedSubcategory)) {
      if (selectedSector && selectedSubcategory) {
        setView('language');
      } else if (selectedSector) {
        setView('subcategory');
      } else {
        setView('sector-select');
      }
    } else if (view === 'language' && !selectedSector) {
      setView('sector-select');
    } else if (view === 'language' && !selectedSubcategory && !talkTogetherPending && !jobSiteTalkPending) {
      setView('subcategory');
    } else if (view === 'subcategory' && !selectedSector) {
      setView('sector-select');
    }
  }, [view, selectedLanguage, selectedSector, selectedSubcategory, talkTogetherPending, jobSiteTalkPending]);

  const renderView = () => {
    if (view === 'cert-verify') {
      return <CertVerifyPage onBack={() => setView('certificates')} />;
    }

    if (view === 'certificates') {
      return <CertificatesPage onBack={() => setView('home')} onVerify={() => setView('cert-verify')} />;
    }

    if (view === 'ambassadors') {
      return <AmbassadorsPage onBack={() => setView('home')} onOrderCards={() => setView('order-cards')} />;
    }

    if (view === 'order-cards') {
      return <OrderCardsPage onBack={() => setView('home')} onGateBack={() => setView('ambassadors')} />;
    }

    if (view === 'policy') {
      return <LanguageAccessPolicy onBack={() => setView('home')} />;
    }

    if (view === 'community') {
      return <CommunityNavigator onBack={() => setView('home')} />;
    }

    if (view === 'conversation' && selectedLanguage) {
      return (
        <ConversationScreen
          language={selectedLanguage}
          onBack={() => setView('phrases')}
        />
      );
    }

    if (view === 'talk-together' && selectedLanguage) {
      return (
        <TalkTogetherScreen
          language={selectedLanguage}
          onBack={() => setView('subcategory')}
        />
      );
    }

    if (view === 'job-site-talk' && selectedLanguage) {
      return (
        <JobSiteTalkScreen
          language={selectedLanguage}
          onBack={() => setView('subcategory')}
        />
      );
    }

    if (view === 'phrases' && selectedLanguage && selectedSector && selectedSubcategory) {
      return (
        <PhrasesScreen
          language={selectedLanguage}
          sector={selectedSector}
          subcategory={selectedSubcategory}
          onBack={handleBackFromPhrases}
          onOpenConversation={selectedSector === 'healthcare' ? handleOpenConversation : undefined}
          onOpenTalkTogether={selectedSector === 'education' ? () => setView('talk-together') : undefined}
          onOpenJobSiteTalk={selectedSector === 'construction' ? () => setView('job-site-talk') : undefined}
        />
      );
    }

    if (view === 'language' && selectedSector && (selectedSubcategory || talkTogetherPending || jobSiteTalkPending)) {
      return (
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
      );
    }

    if (view === 'subcategory' && selectedSector) {
      return (
        <SubcategorySelector
          subcategories={getSubcategories()}
          sectorLabel={getSectorLabel()}
          onSelectSubcategory={handleSelectSubcategory}
          onBack={handleBackToHome}
          onOpenTalkTogether={selectedSector === 'education' ? handleOpenTalkTogether : undefined}
          onOpenJobSiteTalk={selectedSector === 'construction' ? handleOpenJobSiteTalk : undefined}
          selectedLanguage={selectedLanguage}
        />
      );
    }

    if (view === 'sector-select') {
      return (
        <HomeScreen
          selectedSector={null}
          onSelectSector={handleSelectSector}
          onSelectLanguage={handleSelectLanguage}
          onBackToSectorSelection={handleBackToLanding}
          onOpenPolicy={() => setView('policy')}
          onOpenCommunityNavigator={() => setView('community')}
          onOpenCertificates={() => setView('certificates')}
          onOpenAmbassadors={() => setView('ambassadors')}
          onCheckForUpdates={checkForUpdates}
        />
      );
    }

    return (
      <LandingPage
        onSelectSector={handleSelectSector}
        onGetStarted={() => setView('sector-select')}
        onOpenPolicy={() => setView('policy')}
        onOpenCommunityNavigator={() => setView('community')}
        onOpenCertificates={() => setView('certificates')}
        onOpenAmbassadors={() => setView('ambassadors')}
        onCheckForUpdates={checkForUpdates}
      />
    );
  };

  if (qrSlug) {
    return (
      <QRScanPage
        slug={qrSlug}
        onSelectLanguage={() => {}}
      />
    );
  }

  return (
    <>
      {renderView()}

      <UpdateToast
        visible={showToast}
        onRefresh={applyUpdate}
        onDismiss={() => setToastDismissed(true)}
      />

      <DebugOverlay />
      <InstallBanner />
    </>
  );
}

function App() {
  if (getPaymentSuccessPath()) {
    return <PaymentSuccessPage />;
  }

  if (getPaymentCancelPath()) {
    return <PaymentCancelPage />;
  }

  if (getPublicOrderPath()) {
    return <PublicOrderPage />;
  }

  return <AppInner />;
}

export default App;
