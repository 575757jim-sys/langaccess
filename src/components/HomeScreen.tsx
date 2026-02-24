import { useState } from 'react';
import { Languages, Heart, GraduationCap, HardHat, ArrowLeft, Volume2 } from 'lucide-react';
import { Language, Sector } from '../data/phrases';
import { Subcategory } from '../data/subcategories';

interface HomeScreenProps {
  selectedSector: Sector | null;
  selectedSubcategory?: Subcategory | null;
  onSelectSector: (sector: Sector) => void;
  onSelectLanguage: (language: Language) => void;
  onBackToSectorSelection: () => void;
}

export default function HomeScreen({
  selectedSector,
  selectedSubcategory,
  onSelectSector,
  onSelectLanguage,
  onBackToSectorSelection
}: HomeScreenProps) {
  const [audioEnabled, setAudioEnabled] = useState(false);

  const handleEnableAudio = () => {
    console.log('🎵 User requesting audio initialization...');

    if ('speechSynthesis' in window) {
      // Cancel and reset
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      // Trigger empty utterance to initialize engine
      const init = new SpeechSynthesisUtterance('');
      init.volume = 0.01;
      init.rate = 1;
      init.pitch = 1;

      init.onstart = () => {
        console.log('✅ Audio engine initialized successfully');
        setAudioEnabled(true);

        // Load voices
        const voices = window.speechSynthesis.getVoices();
        console.log(`📢 ${voices.length} voices available after initialization`);
      };

      init.onerror = (e) => {
        console.error('❌ Audio initialization error:', e.error);
      };

      window.speechSynthesis.speak(init);

      // Fallback in case onstart doesn't fire
      setTimeout(() => {
        if (!audioEnabled) {
          console.log('✅ Audio enabled (fallback)');
          setAudioEnabled(true);
        }
      }, 500);
    }
  };
  const sectors = [
    { id: 'healthcare' as Sector, label: 'Healthcare', Icon: Heart, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'education' as Sector, label: 'Education', Icon: GraduationCap, color: 'bg-green-600 hover:bg-green-700' },
    { id: 'construction' as Sector, label: 'Construction', Icon: HardHat, color: 'bg-orange-600 hover:bg-orange-700' }
  ];

  const languages: { id: Language; label: string; color: string }[] = [
    { id: 'spanish', label: 'Spanish', color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'tagalog', label: 'Tagalog', color: 'bg-green-600 hover:bg-green-700' },
    { id: 'vietnamese', label: 'Vietnamese', color: 'bg-red-600 hover:bg-red-700' },
    { id: 'mandarin', label: 'Mandarin', color: 'bg-orange-600 hover:bg-orange-700' },
    { id: 'cantonese', label: 'Cantonese', color: 'bg-teal-600 hover:bg-teal-700' }
  ];

  const getSectorLabel = (sectorId: Sector) => {
    return sectors.find(s => s.id === sectorId)?.label || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Languages className="w-16 h-16 text-slate-700" />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-3">LangAccess</h1>
          <p className="text-xl text-slate-600">
            {selectedSector ? `${getSectorLabel(selectedSector)} Communication Aid` : 'Communication Aid'}
          </p>

          {!audioEnabled && 'speechSynthesis' in window && (
            <button
              onClick={handleEnableAudio}
              className="mt-6 inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <Volume2 className="w-6 h-6" />
              Enable Audio
            </button>
          )}

          {audioEnabled && (
            <div className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-xl text-sm font-medium">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              Audio Enabled
            </div>
          )}
        </div>

        {!selectedSector ? (
          <div className="w-full space-y-4">
            <h2 className="text-2xl font-semibold text-slate-700 text-center mb-6">Select Your Sector</h2>
            {sectors.map((sector) => {
              const Icon = sector.Icon;
              return (
                <button
                  key={sector.id}
                  onClick={() => onSelectSector(sector.id)}
                  className={`w-full ${sector.color} text-white rounded-2xl py-6 px-8 text-2xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4`}
                >
                  <Icon className="w-8 h-8" />
                  {sector.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="w-full">
            <button
              onClick={onBackToSectorSelection}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-lg font-medium">Change Sector</span>
            </button>
            <h2 className="text-2xl font-semibold text-slate-700 text-center mb-6">Select Language</h2>
            <div className="space-y-4">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => onSelectLanguage(lang.id)}
                  className={`w-full ${lang.color} text-white rounded-2xl py-6 px-8 text-2xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
