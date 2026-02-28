import { useState } from 'react';
import { Languages, Heart, GraduationCap, HardHat, ArrowLeft, FileText, MessageSquarePlus, Compass, RefreshCw, Volume2, Award, Users } from 'lucide-react';
import { Language, Sector } from '../data/phrases';
import { Subcategory } from '../data/subcategories';
import SEO from './SEO';

const JSON_LD_WEB_APP = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'LangAccess',
  url: 'https://langaccess.org',
  description: 'Multilingual communication aid for healthcare, education, and construction professionals. Includes Spanish, Tagalog, Vietnamese, Mandarin, Cantonese, and more.',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  inLanguage: ['en', 'es', 'tl', 'vi', 'zh', 'ko', 'ar', 'hmn'],
};

interface HomeScreenProps {
  selectedSector: Sector | null;
  selectedSubcategory?: Subcategory | null;
  onSelectSector: (sector: Sector) => void;
  onSelectLanguage: (language: Language) => void;
  onBackToSectorSelection: () => void;
  onOpenPolicy?: () => void;
  onOpenCommunityNavigator?: () => void;
  onOpenCertificates?: () => void;
  onOpenAmbassadors?: () => void;
  onCheckForUpdates?: () => void;
}

export default function HomeScreen({
  selectedSector,
  onSelectSector,
  onSelectLanguage,
  onBackToSectorSelection,
  onOpenPolicy,
  onOpenCommunityNavigator,
  onOpenCertificates,
  onOpenAmbassadors,
  onCheckForUpdates
}: HomeScreenProps) {
  const [audioUnlocked, setAudioUnlocked] = useState(false);

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

  const handleUnlockAudio = () => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        ctx.resume().catch(() => {});
      }
      const a = new Audio();
      a.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsgU291bmQgRWZmZWN0cyBMaWJyYXJ5//uQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAABAAABIADMzMzM//uQxAADwAABpAAAACAAADSAAAAE';
      a.volume = 0;
      a.play().catch(() => {});
    } catch {
    }
    setAudioUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {!selectedSector && (
        <SEO
          title="LangAccess — Multilingual Communication Aid"
          description="Free multilingual phrases for healthcare, education, and construction professionals. Spanish, Tagalog, Vietnamese, Mandarin, and more. California LEP compliant."
          path="/"
          jsonLd={JSON_LD_WEB_APP}
        />
      )}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Languages className="w-16 h-16 text-slate-700" />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-3">LangAccess</h1>
          <p className="text-xl text-slate-600">
            {selectedSector ? `${getSectorLabel(selectedSector)} Communication Aid` : 'Communication Aid'}
          </p>

          {!selectedSector && (
            <div className="mt-5">
              {!audioUnlocked ? (
                <button
                  onClick={handleUnlockAudio}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-200 text-base"
                >
                  <Volume2 className="w-5 h-5" />
                  Tap to Enable Audio
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium px-5 py-2.5 rounded-xl text-sm">
                  <Volume2 className="w-4 h-4" />
                  Audio Enabled
                </div>
              )}
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

            <div className="pt-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-300" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">Community Access</span>
                <div className="flex-1 h-px bg-slate-300" />
              </div>
              <button
                onClick={onOpenCommunityNavigator}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-2xl py-5 px-8 shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4 mb-3"
              >
                <Compass className="w-8 h-8 text-amber-400" />
                <div className="text-left">
                  <div className="text-2xl font-semibold">Community Navigator</div>
                  <div className="text-sm text-slate-300 font-normal mt-0.5">Find food, shelter, and services near you.</div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onOpenCertificates}
                  className="bg-slate-700 hover:bg-slate-600 text-white rounded-2xl py-4 px-5 shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  <Award className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-base font-semibold">Certificates</div>
                    <div className="text-xs text-slate-400 font-normal">Free first module</div>
                  </div>
                </button>
                <button
                  onClick={onOpenAmbassadors}
                  className="bg-slate-700 hover:bg-slate-600 text-white rounded-2xl py-4 px-5 shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  <Users className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-base font-semibold">Ambassadors</div>
                    <div className="text-xs text-slate-400 font-normal">Join the brigade</div>
                  </div>
                </button>
              </div>
            </div>
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

      <footer className="border-t border-slate-200 bg-white py-4 px-6">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <button
            onClick={onOpenPolicy}
            className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Language Access Policy
          </button>
          <button
            onClick={onOpenPolicy}
            className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Request a Language
          </button>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <button
            onClick={onOpenCertificates}
            className="flex items-center gap-1.5 text-slate-500 hover:text-yellow-600 transition-colors"
          >
            <Award className="w-4 h-4" />
            Certificates
          </button>
          <button
            onClick={onOpenAmbassadors}
            className="flex items-center gap-1.5 text-slate-500 hover:text-green-600 transition-colors"
          >
            <Users className="w-4 h-4" />
            Ambassadors
          </button>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <button
            onClick={onCheckForUpdates}
            className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Check for Updates
          </button>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-400">California LEP Compliance Toolkit v1.0</span>
        </div>
      </footer>
    </div>
  );
}
