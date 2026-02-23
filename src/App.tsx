import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import PhrasesScreen from './components/PhrasesScreen';
import { Language } from './data/phrases';

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleBack = () => {
    setSelectedLanguage(null);
  };

  return (
    <>
      {selectedLanguage ? (
        <PhrasesScreen language={selectedLanguage} onBack={handleBack} />
      ) : (
        <HomeScreen onSelectLanguage={handleSelectLanguage} />
      )}
    </>
  );
}

export default App;
