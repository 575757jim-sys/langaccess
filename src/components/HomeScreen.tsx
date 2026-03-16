import { useState, useEffect } from 'react';
import { Languages, Heart, GraduationCap, HardHat, ArrowLeft, FileText, MessageSquarePlus, Compass, RefreshCw, Award, Users, ChevronRight, Handshake, Star, HandHeart } from 'lucide-react';
import FavoritesPanel from './FavoritesPanel';
import { Language, Sector } from '../data/phrases';
import { Subcategory } from '../data/subcategories';
import { loadFavorites } from '../utils/favorites';
import ToolkitRequestSection from './ToolkitRequestSection';
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

const SECTOR_CARDS = [
  {
    id: 'education' as Sector,
    label: 'Education',
    description: 'Teachers and staff communicate instantly with students and families.',
    Icon: GraduationCap,
    iconBg: 'bg-blue-600',
    iconColor: 'text-white',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-blue-300',
    hoverShadow: 'hover:shadow-blue-100',
    tagBg: 'bg-blue-600',
    accentBg: 'bg-blue-50',
    accentText: 'text-blue-600',
    accentBorder: 'border-blue-100',
    gradientFrom: 'from-blue-50',
  },
  {
    id: 'healthcare' as Sector,
    label: 'Healthcare',
    description: 'Nurses and clinical staff ask essential questions clearly and quickly.',
    Icon: Heart,
    iconBg: 'bg-green-600',
    iconColor: 'text-white',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-green-300',
    hoverShadow: 'hover:shadow-green-100',
    tagBg: 'bg-green-600',
    accentBg: 'bg-green-50',
    accentText: 'text-green-600',
    accentBorder: 'border-green-100',
    gradientFrom: 'from-green-50',
  },
  {
    id: 'construction' as Sector,
    label: 'Construction',
    description: 'Supervisors deliver safety briefings to multilingual job site crews.',
    Icon: HardHat,
    iconBg: 'bg-orange-500',
    iconColor: 'text-white',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-orange-300',
    hoverShadow: 'hover:shadow-orange-100',
    tagBg: 'bg-orange-600',
    accentBg: 'bg-orange-50',
    accentText: 'text-orange-600',
    accentBorder: 'border-orange-100',
    gradientFrom: 'from-orange-50',
  },
  {
    id: 'outreach' as Sector,
    label: 'Community Outreach',
    description: 'Frontline workers connect with community members for shelter, food, and safety.',
    Icon: HandHeart,
    iconBg: 'bg-cyan-600',
    iconColor: 'text-white',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-cyan-300',
    hoverShadow: 'hover:shadow-cyan-100',
    tagBg: 'bg-cyan-600',
    accentBg: 'bg-cyan-50',
    accentText: 'text-cyan-600',
    accentBorder: 'border-cyan-100',
    gradientFrom: 'from-cyan-50',
  },
];

const LANGUAGES: { id: Language; label: string; activeClass: string; dotColor: string; abbr: string }[] = [
  { id: 'spanish', label: 'Spanish', activeClass: 'bg-red-600 text-white border-red-600', dotColor: 'bg-red-400', abbr: 'ES' },
  { id: 'mandarin', label: 'Mandarin', activeClass: 'bg-amber-500 text-white border-amber-500', dotColor: 'bg-amber-400', abbr: 'ZH' },
  { id: 'cantonese', label: 'Cantonese', activeClass: 'bg-orange-500 text-white border-orange-500', dotColor: 'bg-orange-400', abbr: 'YUE' },
  { id: 'vietnamese', label: 'Vietnamese', activeClass: 'bg-rose-700 text-white border-rose-700', dotColor: 'bg-rose-500', abbr: 'VI' },
  { id: 'tagalog', label: 'Tagalog', activeClass: 'bg-blue-600 text-white border-blue-600', dotColor: 'bg-blue-400', abbr: 'TL' },
];

export default function HomeScreen({
  selectedSector,
  onSelectSector,
  onSelectLanguage,
  onBackToSectorSelection,
  onOpenPolicy,
  onOpenCommunityNavigator,
  onOpenCertificates,
  onOpenAmbassadors,
  onCheckForUpdates,
}: HomeScreenProps) {
  const [activeLanguage, setActiveLanguage] = useState<Language | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    loadFavorites().then(favs => setFavCount(favs.length));
  }, []);

  const sectorConfig = selectedSector ? SECTOR_CARDS.find(s => s.id === selectedSector) : null;

  const handleLanguageSelect = (langId: Language) => {
    setActiveLanguage(langId);
    onSelectLanguage(langId);
  };

  return (
    <>
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!selectedSector && (
        <SEO
          title="LangAccess — Multilingual Communication Aid"
          description="Free multilingual phrases for healthcare, education, and construction professionals. Spanish, Tagalog, Vietnamese, Mandarin, and more. California LEP compliant."
          path="/"
          jsonLd={JSON_LD_WEB_APP}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBackToSectorSelection}
            className="flex items-center justify-center w-9 h-9 -ml-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Languages className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <span className="text-lg font-bold text-slate-800 tracking-tight">LangAccess</span>
          {sectorConfig && (
            <>
              <span className="text-slate-300 text-lg font-light">/</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${sectorConfig.tagBg}`}>
                {sectorConfig.label}
              </span>
            </>
          )}
          <div className="flex-1" />
          <button
            onClick={() => setShowFavorites(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 text-yellow-700 text-xs font-semibold transition-colors flex-shrink-0"
          >
            <Star className={`w-3.5 h-3.5 ${favCount > 0 ? 'fill-yellow-500 text-yellow-500' : 'text-yellow-500'}`} />
            {favCount > 0 ? `My Phrases (${favCount})` : 'My Phrases'}
          </button>
        </div>

        {/* Language Selector Bar — only interactive when a sector is selected */}
        {selectedSector && (
          <div className="border-t border-slate-100 bg-slate-50/80">
            <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1 flex-shrink-0">
                Language:
              </span>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageSelect(lang.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap flex-shrink-0
                    ${activeLanguage === lang.id
                      ? `${lang.activeClass} shadow-sm`
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeLanguage === lang.id ? 'bg-white/60' : lang.dotColor}`} />
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {!selectedSector ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Select Your Sector</h1>
              <p className="text-slate-500 text-sm">Choose the environment where you work to see relevant phrases.</p>
            </div>

            {/* Sector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {SECTOR_CARDS.map(({ id, label, description, Icon, iconBg, iconColor, border, hoverBorder, accentBg, accentText, accentBorder }) => (
                <button
                  key={id}
                  onClick={() => onSelectSector(id)}
                  className={`group bg-white border ${border} ${hoverBorder} rounded-2xl text-left shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] flex flex-col overflow-hidden`}
                >
                  <div className="p-5 flex-1">
                    <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                      <Icon className={`w-7 h-7 ${iconColor}`} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 mb-2">{label}</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                  </div>
                  <div className={`${accentBg} border-t ${accentBorder} px-5 py-3 flex items-center justify-between`}>
                    <span className={`text-xs font-semibold ${accentText}`}>Tap to open phrases</span>
                    <ChevronRight className={`w-4 h-4 ${accentText} group-hover:translate-x-0.5 transition-transform`} />
                  </div>
                </button>
              ))}
            </div>

            {/* Community Outreach Card */}
            <div className="mb-8">
              <button
                onClick={onOpenPolicy}
                className="w-full bg-white border border-teal-200 hover:border-teal-300 rounded-2xl text-left shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden"
              >
                <div className="p-5 flex items-center gap-5">
                  <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Handshake className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-800 mb-1">Community Outreach</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">Language access policy and community communication resources.</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-teal-400 flex-shrink-0" />
                </div>
                <div className="bg-teal-50 border-t border-teal-100 px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-600">Tap to open phrases</span>
                  <ChevronRight className="w-4 h-4 text-teal-500" />
                </div>
              </button>
            </div>

            {/* Community Access */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">Community Access</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button
                onClick={onOpenCommunityNavigator}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] flex items-center gap-4 mb-4"
              >
                <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Compass className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-base">Community Navigator</div>
                  <div className="text-sm text-slate-300 mt-0.5">Find food, shelter, and services near you.</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={onOpenCertificates}
                  className="bg-white border border-slate-200 hover:border-yellow-300 rounded-xl p-4 flex items-center gap-3 text-left shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">Certificates</div>
                    <div className="text-xs text-slate-400 mt-0.5">Free first module</div>
                  </div>
                </button>

                <button
                  onClick={onOpenAmbassadors}
                  className="bg-white border border-slate-200 hover:border-green-300 rounded-xl p-4 flex items-center gap-3 text-left shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">Ambassadors</div>
                    <div className="text-xs text-slate-400 mt-0.5">Join the brigade</div>
                  </div>
                </button>

                <button
                  onClick={onOpenPolicy}
                  className="bg-white border border-slate-200 hover:border-teal-300 rounded-xl p-4 flex items-center gap-3 text-left shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Handshake className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">Outreach</div>
                    <div className="text-xs text-slate-400 mt-0.5">Language access policy</div>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Select Language</h2>
              <p className="text-slate-500 text-sm">Choose a language, or tap one in the bar above.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => {
                const isActive = activeLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageSelect(lang.id)}
                    className={`group flex items-center gap-4 p-5 rounded-2xl border-2 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] text-left
                      ${isActive
                        ? `border-transparent ${lang.activeClass}`
                        : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${isActive ? 'bg-white/20 text-white' : `bg-slate-100 text-slate-600`}`}
                    >
                      {lang.abbr}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-base ${isActive ? 'text-white' : 'text-slate-800'}`}>
                        {lang.label}
                      </div>
                      <div className={`text-xs mt-0.5 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                        Tap to select
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white/70' : 'text-slate-300 group-hover:text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </main>

      <ToolkitRequestSection />

      <footer className="border-t border-slate-200 bg-white py-4 px-6">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <button onClick={onOpenPolicy} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
            <FileText className="w-4 h-4" />
            Language Access Policy
          </button>
          <button onClick={onOpenPolicy} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
            <MessageSquarePlus className="w-4 h-4" />
            Request a Language
          </button>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <button onClick={onCheckForUpdates} className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Check for Updates
          </button>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-400">California LEP Compliance Toolkit v1.0</span>
        </div>
      </footer>
    </div>

    {showFavorites && (
      <FavoritesPanel onClose={() => {
        setShowFavorites(false);
        loadFavorites().then(favs => setFavCount(favs.length));
      }} />
    )}
    </>
  );
}
