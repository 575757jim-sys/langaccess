import { useState } from 'react';
import { Languages, Heart, GraduationCap, HardHat, Compass, Award, Users, FileText, MessageSquarePlus, RefreshCw, ChevronRight, Volume2, Zap, Shield, Smartphone, BookOpen, Wifi, Briefcase, CheckCircle, Tablet, Menu, X, MapPin, Loader2, Building2, Warehouse, Hotel, Leaf } from 'lucide-react';
import { playAudioFromGesture } from '../utils/speech';
import { Sector } from '../data/phrases';
import SEO from './SEO';
import ToolkitDownload from './ToolkitDownload';
import PilotRequestModal from './PilotRequestModal';

const JSON_LD_WEB_APP = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'LangAccess',
  url: 'https://langaccess.org',
  description: 'Frontline language access platform for teachers, healthcare workers, construction supervisors, and community outreach teams.',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  inLanguage: ['en', 'es', 'tl', 'vi', 'zh'],
};

const MOCK_PHRASES = [
  { sector: 'Teacher', phrase: 'Please sit down', sectorColor: 'bg-blue-500' },
  { sector: 'Healthcare', phrase: 'Where does it hurt?', sectorColor: 'bg-green-500' },
  { sector: 'Construction', phrase: 'Wear your safety harness', sectorColor: 'bg-orange-500' },
  { sector: 'Outreach', phrase: 'The shelter opens at 6 PM', sectorColor: 'bg-teal-500' },
];

const VALUE_POINTS = [
  { Icon: Zap, label: 'Instant multilingual communication', desc: 'Phrases play in seconds' },
  { Icon: Shield, label: 'Built for frontline teams', desc: 'Sector-specific content' },
  { Icon: Smartphone, label: 'Mobile friendly', desc: 'Works on any device' },
  { Icon: BookOpen, label: 'Real-world service phrases', desc: 'Field-tested content' },
];

const HERO_VALUE_STRIP = [
  { Icon: Wifi, label: 'Instant communication' },
  { Icon: Briefcase, label: 'Field-ready workflow' },
  { Icon: CheckCircle, label: 'Compliance-supportive' },
  { Icon: Tablet, label: 'Mobile-friendly' },
];

const SECTOR_CARDS = [
  { emoji: '🎓', title: 'Education', description: 'Teachers communicate clearly with students and families across languages.', border: 'border-blue-100', accentBg: 'bg-blue-50', accentText: 'text-blue-500' },
  { emoji: '🏥', title: 'Healthcare', description: 'Medical staff deliver intake questions and instructions quickly and accurately.', border: 'border-green-100', accentBg: 'bg-green-50', accentText: 'text-green-500' },
  { emoji: '🦺', title: 'Construction', description: 'Supervisors deliver safety instructions to multilingual crews on-site.', border: 'border-orange-100', accentBg: 'bg-orange-50', accentText: 'text-orange-500' },
  { emoji: '🤝', title: 'Community Outreach', description: 'Outreach workers connect people to shelters, food, and vital services.', border: 'border-teal-100', accentBg: 'bg-teal-50', accentText: 'text-teal-500' },
];

const HOW_STEPS = [
  { step: '1', label: 'Choose your sector', desc: 'Pick Education, Healthcare, Construction, or Outreach.' },
  { step: '2', label: 'Select a situation', desc: 'Choose the scenario that matches your need.' },
  { step: '3', label: 'Tap a phrase to play', desc: 'Hear the translation instantly in any language.' },
];

const PHRASE_REQUEST_HREF = 'mailto:LangAccessInfo@gmail.com?subject=LangAccess%20Phrase%20Request&body=Sector:%0A%20Situation:%0A%20Phrase%20needed:%0A%20Language:%0A%20Optional%20context:';

const LANGUAGES = [
  { label: 'Spanish', flag: '🇲🇽', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  { label: 'Tagalog', flag: '🇵🇭', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  { label: 'Vietnamese', flag: '🇻🇳', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  { label: 'Mandarin', flag: '🇨🇳', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  { label: 'Cantonese', flag: '🇹🇼', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
];

interface LandingPageProps {
  onSelectSector: (sector: Sector) => void;
  onGetStarted: () => void;
  onOpenPolicy?: () => void;
  onOpenCommunityNavigator?: () => void;
  onOpenCertificates?: () => void;
  onOpenAmbassadors?: () => void;
  onCheckForUpdates?: () => void;
}

export default function LandingPage({
  onSelectSector,
  onGetStarted,
  onOpenPolicy,
  onOpenCommunityNavigator,
  onOpenCertificates,
  onOpenAmbassadors,
  onCheckForUpdates,
}: LandingPageProps) {
  const [showPilotModal, setShowPilotModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoPlayed, setDemoPlayed] = useState(false);

  const handleDemoPlay = () => {
    if (demoPlaying) return;
    setDemoPlaying(true);
    playAudioFromGesture('¿Cuál es el problema?', 'spanish');
    setTimeout(() => {
      setDemoPlaying(false);
      setDemoPlayed(true);
    }, 3500);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="LangAccess — Frontline Language Access Platform"
        description="Instant language access for frontline workers. Communicate in Spanish, Mandarin, Cantonese, Tagalog, and Vietnamese. Built for teachers, healthcare workers, and construction supervisors."
        path="/"
        jsonLd={JSON_LD_WEB_APP}
      />

      {/* ── NAV ── */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
              <Languages className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">LangAccess</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {[
              { label: 'Get Help Near You', action: onOpenCommunityNavigator },
              { label: 'Help by Category', action: onOpenCommunityNavigator },
              { label: 'How It Works', action: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'Ambassador Brigade', action: onOpenAmbassadors },
              { label: 'Certificates', action: () => onOpenCertificates?.() },
              { label: 'For Institutions', action: () => document.getElementById('sectors')?.scrollIntoView({ behavior: 'smooth' }) },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors font-medium"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
              <button className="font-semibold text-slate-900 hover:text-teal-600 transition-colors">English</button>
              <span className="text-slate-300">|</span>
              <button className="hover:text-slate-700 transition-colors">Español</button>
              <span className="text-slate-300">|</span>
              <button className="hover:text-slate-700 transition-colors">中文</button>
              <span className="text-slate-300">|</span>
              <button className="hover:text-slate-700 transition-colors">Tagalog</button>
              <span className="text-slate-300">|</span>
              <button className="hover:text-slate-700 transition-colors">Tiếng Việt</button>
            </div>
            <button
              onClick={onGetStarted}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Get Started Free
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-1">
            {[
              { label: 'Get Help Near You', action: () => { onOpenCommunityNavigator?.(); closeMobileMenu(); } },
              { label: 'Help by Category', action: () => { onOpenCommunityNavigator?.(); closeMobileMenu(); } },
              { label: 'How It Works', action: () => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); closeMobileMenu(); } },
              { label: 'Ambassador Brigade', action: () => { onOpenAmbassadors?.(); closeMobileMenu(); } },
              { label: 'Certificates', action: () => { onOpenCertificates?.(); closeMobileMenu(); } },
              { label: 'For Institutions', action: () => { document.getElementById('sectors')?.scrollIntoView({ behavior: 'smooth' }); closeMobileMenu(); } },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => { onGetStarted(); closeMobileMenu(); }}
              className="mt-2 w-full flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Get Started Free
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-6 py-28 lg:py-36">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left — copy */}
              <div className="flex flex-col">
                <div className="inline-flex items-center self-start gap-2 bg-teal-500/15 border border-teal-400/25 text-teal-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-10">
                  <Languages className="w-3 h-3" />
                  Frontline Language Access Platform
                </div>

                <h1 className="font-extrabold leading-[1.06] tracking-tight text-white mb-6" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
                  Communicate Clearly.<br className="hidden sm:block" />{' '}
                  Find Help Fast.
                </h1>

                {/* Primary CTA - Most Prominent */}
                <div className="mb-4">
                  <button
                    onClick={onOpenCommunityNavigator}
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold px-12 py-6 rounded-xl transition-all duration-200 shadow-2xl shadow-green-600/40 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98] text-xl min-h-[72px]"
                  >
                    <span className="text-2xl">🚨</span>
                    Find Help Near You Now
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <p className="text-slate-400 text-xs mt-2 flex items-center gap-1.5 justify-center sm:justify-start">
                    <span>📍</span>
                    Uses your location to find nearby services
                  </p>
                </div>

                {/* Crisis Support - Subtle */}
                <div className="mb-8">
                  <p className="text-slate-400 text-xs text-center sm:text-left">
                    Need urgent mental health support? Call or text <span className="font-semibold text-slate-300">988</span>
                  </p>
                </div>
              </div>

              {/* Right — example phrase cards */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-sm space-y-3">
                  <p className="text-slate-400 text-sm mb-4 text-center">Tap a phrase to start instantly</p>
                  {MOCK_PHRASES.map((item) => {
                    const handleClick = () => {
                      if (item.sector === 'Teacher') {
                        onSelectSector('education');
                      } else if (item.sector === 'Healthcare') {
                        onSelectSector('healthcare');
                      } else if (item.sector === 'Construction') {
                        onSelectSector('construction');
                      } else if (item.sector === 'Outreach') {
                        onOpenCommunityNavigator?.();
                      }
                    };

                    return (
                      <button
                        key={item.phrase}
                        onClick={handleClick}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        <div className={`w-12 h-12 ${item.sectorColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <Volume2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.sector}</div>
                          <div className="text-white text-base font-semibold leading-snug">{item.phrase}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── INSTANT DEMO ── */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-950 py-14 px-6">
          <div className="max-w-md mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-4">Try it now</p>

            <div className="bg-white/5 border border-white/10 rounded-3xl px-8 py-10 backdrop-blur-sm shadow-2xl">
              <div className="mb-2">
                <span className="inline-block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">English</span>
                <p className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-2">
                  "What is the problem?"
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 mb-8 mt-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-slate-500 text-xs font-medium px-2">Spanish</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <p
                className={`text-2xl sm:text-3xl font-bold leading-snug transition-all duration-500 mb-6 ${
                  demoPlayed ? 'text-teal-300 opacity-100' : 'text-slate-500 opacity-60'
                }`}
              >
                ¿Cuál es el problema?
              </p>

              <p className="text-sm font-semibold text-teal-400 mb-3 tracking-wide">
                Tap to hear instantly
              </p>

              <button
                onClick={handleDemoPlay}
                disabled={demoPlaying}
                className={`group w-full flex items-center justify-center gap-3 font-bold text-xl py-6 px-8 rounded-2xl transition-all duration-200 active:scale-[0.97] shadow-2xl ${
                  demoPlayed
                    ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-teal-500/40'
                    : 'bg-teal-500 hover:bg-teal-400 text-white shadow-teal-500/50 hover:scale-[1.03] animate-pulse-subtle'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
                style={!demoPlayed && !demoPlaying ? { animation: 'pulse-glow 2s ease-in-out infinite' } : {}}
              >
                {demoPlaying ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Playing…
                  </>
                ) : demoPlayed ? (
                  <>
                    <Volume2 className="w-6 h-6" />
                    Play Again
                  </>
                ) : (
                  <>
                    <Volume2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Hear it in Spanish
                  </>
                )}
              </button>

              <p className="mt-3 text-xs text-slate-500">
                Real TTS audio — no sign-up needed
              </p>
            </div>

            <p className="mt-6 text-sm text-slate-400">
              Works in Spanish, Tagalog, Vietnamese, Mandarin &amp; Cantonese
            </p>
          </div>
        </section>

        {/* ── WHAT DO YOU DO ── */}
        <section className="bg-slate-950 py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400 text-center mb-2">Zero-click onboarding</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center tracking-tight mb-10">What do you do?</h2>

            {/* Primary role cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {[
                { icon: <Building2 className="w-6 h-6" />, label: 'Property Manager', desc: 'Maintenance requests, lease terms, inspections', sector: 'construction' as Sector, accent: 'border-sky-500/40 hover:border-sky-400/60', iconBg: 'bg-sky-500/20 text-sky-300' },
                { icon: <HardHat className="w-6 h-6" />, label: 'Construction', desc: 'Safety instructions for multilingual crews', sector: 'construction' as Sector, accent: 'border-orange-500/40 hover:border-orange-400/60', iconBg: 'bg-orange-500/20 text-orange-300' },
                { icon: <Warehouse className="w-6 h-6" />, label: 'Warehouse', desc: 'Shift briefings, safety protocols, task direction', sector: 'construction' as Sector, accent: 'border-amber-500/40 hover:border-amber-400/60', iconBg: 'bg-amber-500/20 text-amber-300' },
                { icon: <Hotel className="w-6 h-6" />, label: 'Hospitality', desc: 'Guest services, housekeeping, front desk', sector: 'outreach' as Sector, accent: 'border-rose-500/40 hover:border-rose-400/60', iconBg: 'bg-rose-500/20 text-rose-300' },
                { icon: <Leaf className="w-6 h-6" />, label: 'Agriculture', desc: 'Field operations, crop handling, safety rules', sector: 'construction' as Sector, accent: 'border-green-500/40 hover:border-green-400/60', iconBg: 'bg-green-500/20 text-green-300' },
              ].map(({ icon, label, desc, sector, accent, iconBg }) => (
                <button
                  key={label}
                  onClick={() => onSelectSector(sector)}
                  className={`group flex items-center gap-4 bg-white/5 hover:bg-white/10 border ${accent} rounded-2xl px-5 py-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} transition-transform group-hover:scale-110`}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-base leading-tight mb-0.5">{label}</div>
                    <div className="text-slate-400 text-xs leading-snug">{desc}</div>
                  </div>
                  <ChevronRight className="ml-auto flex-shrink-0 w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Also supports critical communication in</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            {/* Secondary roles */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <GraduationCap className="w-5 h-5" />, label: 'Education', desc: 'Students & families', sector: 'education' as Sector, iconBg: 'bg-blue-500/20 text-blue-300' },
                { icon: <Heart className="w-5 h-5" />, label: 'Healthcare', desc: 'Patients & care teams', sector: 'healthcare' as Sector, iconBg: 'bg-emerald-500/20 text-emerald-300' },
                { icon: <Compass className="w-5 h-5" />, label: 'Community Outreach', desc: 'Shelter, food & services', sector: 'outreach' as Sector, iconBg: 'bg-teal-500/20 text-teal-300' },
              ].map(({ icon, label, desc, sector, iconBg }) => (
                <button
                  key={label}
                  onClick={() => onSelectSector(sector)}
                  className="group flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-3 py-4 text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} transition-transform group-hover:scale-110`}>
                    {icon}
                  </div>
                  <div className="text-white font-semibold text-sm leading-tight">{label}</div>
                  <div className="text-slate-500 text-xs leading-snug">{desc}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMUNITY NAVIGATOR CTA ── */}
        <section className="bg-slate-900 border-t border-white/6 py-14 px-6">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Community Resources</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-2">
                Need help beyond communication?
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Find local resources for housing, food, healthcare, and transportation.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-6">
                {[
                  { icon: <Wifi className="w-3 h-3" />, label: 'Offline Ready' },
                  { icon: <Shield className="w-3 h-3" />, label: 'ID Vault' },
                  { icon: <Zap className="w-3 h-3" />, label: 'Fast Access' },
                ].map(({ icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 bg-white/8 border border-white/12 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    {icon}
                    {label}
                  </span>
                ))}
              </div>
              <button
                onClick={onOpenCommunityNavigator}
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-teal-900/40 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Compass className="w-4 h-4" />
                Open Community Navigator
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden sm:flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex-shrink-0">
              <MapPin className="w-10 h-10 text-teal-400 mb-1" />
              <span className="text-teal-300 text-xs font-semibold">Near You</span>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <section className="w-full border-y border-slate-200" style={{ backgroundColor: '#F5F5F5' }}>
          <div className="max-w-6xl mx-auto px-6" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest mr-1 flex-shrink-0">Trusted by:</span>
              {[
                { label: 'Healthcare', emoji: '🏥' },
                { label: 'Education', emoji: '🎓' },
                { label: 'Construction', emoji: '🦺' },
                { label: 'Community Organizations', emoji: '🤝' },
              ].map(({ label, emoji }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-3 py-2 rounded-full shadow-sm"
                >
                  <span>{emoji}</span>
                  {label}
                </span>
              ))}
              <span className="text-slate-400 text-xs font-medium ml-1 flex-shrink-0">across the Bay Area</span>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-24 sm:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">Simple to use</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight">How LangAccess Works</h2>
              <p className="text-slate-500 text-lg leading-relaxed">Three steps to clear communication with anyone on your team.</p>
            </div>

            <div className="relative grid sm:grid-cols-3 gap-10">
              <div className="hidden sm:block absolute top-8 left-[calc(16.666%+2rem)] right-[calc(16.666%+2rem)] h-px bg-slate-200" />
              {HOW_STEPS.map(({ step, label, desc }) => (
                <div key={step} className="flex flex-col items-center text-center gap-5">
                  <div className="relative w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-teal-600/25 z-10">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-3">{label}</h3>
                    <p className="text-slate-500 text-base leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-slate-500 text-base mt-12">
              Includes pre-built phrase packs for Healthcare, Construction, Education, and Community settings.
            </p>
          </div>
        </section>

        {/* ── VALUE BAND ── */}
        <section className="bg-slate-50 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
              {VALUE_POINTS.map(({ Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-snug">{label}</p>
                    <p className="text-sm text-slate-400 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BUILT FOR FRONTLINE ── */}
        <section id="sectors" className="py-24 sm:py-28 bg-slate-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">Who it's for</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight">Built for Frontline Professionals</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">Every sector has unique communication needs. LangAccess is designed around real situations you face every day.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SECTOR_CARDS.map(({ emoji, title, description, border, accentBg, accentText }) => {
                const sectorId = title.toLowerCase() as Sector;
                const isMainSector = ['education', 'healthcare', 'construction'].includes(sectorId);
                return (
                  <div
                    key={title}
                    id={`sector-${title.toLowerCase()}`}
                    className={`bg-white border-2 ${border} rounded-2xl p-7 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300`}
                  >
                    <div className="flex items-start gap-5">
                      <span
                        className="flex-shrink-0 select-none leading-none mt-0.5"
                        style={{ fontSize: '2rem', lineHeight: 1 }}
                        aria-hidden="true"
                      >
                        {emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg leading-snug mb-2">{title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                      </div>
                    </div>
                    {isMainSector ? (
                      <button
                        onClick={() => onSelectSector(sectorId)}
                        className={`w-full ${accentBg} ${accentText} hover:opacity-80 font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 text-sm`}
                      >
                        Start {title} →
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenCommunityNavigator?.()}
                        className={`w-full ${accentBg} ${accentText} hover:opacity-80 font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 text-sm`}
                      >
                        Explore Resources →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-16">
              <p style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                LangAccess in the Classroom
              </p>
              <img
                src="/education-demo.png"
                alt="LangAccess in the Classroom"
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  borderRadius: '16px',
                  display: 'block',
                  margin: '2rem auto',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
              />
              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
                Teachers use LangAccess to communicate instantly with Spanish, Tagalog, Vietnamese, Mandarin, and Cantonese speaking students and families. No interpreter needed. No app to download.
              </p>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF BAR ── */}
        <section className="w-full bg-slate-900 py-5">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-teal-500/80 text-xs font-medium leading-relaxed tracking-wide">
              Designed for compliance teams &nbsp;&middot;&nbsp; Supports Title VI and California LEP requirements &nbsp;&middot;&nbsp; Used in the Bay Area
            </p>
          </div>
        </section>

        {/* ── INSTITUTIONAL PILOT CTA ── */}
        <section id="sector-select" className="py-24 bg-gradient-to-br from-teal-700 to-teal-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Ready to communicate clearly?</h2>
            <p className="text-teal-100 mb-4 text-base">Select your sector to get started. No account needed, works instantly.</p>

            <a
              href={PHRASE_REQUEST_HREF}
              className="inline-flex items-center gap-1.5 text-teal-200 hover:text-white text-sm font-medium underline underline-offset-2 mb-10 transition-colors"
            >
              Missing a phrase? Tell us here
            </a>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
              <button
                onClick={() => onOpenCommunityNavigator?.()}
                className="flex items-center justify-center gap-2.5 border-2 border-white/35 hover:border-white/65 hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm min-h-[50px]"
              >
                <Users className="w-5 h-5" />
                Community Outreach
              </button>
              {[
                { id: 'education' as Sector, label: 'Education', Icon: GraduationCap },
                { id: 'healthcare' as Sector, label: 'Healthcare', Icon: Heart },
                { id: 'construction' as Sector, label: 'Construction', Icon: HardHat },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => onSelectSector(id)}
                  className="flex items-center justify-center gap-2.5 border-2 border-white/35 hover:border-white/65 hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm min-h-[50px]"
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/15">
              <p className="text-teal-200 text-xs font-semibold uppercase tracking-widest mb-4">For Institutions &amp; Organizations</p>
              <p className="text-teal-100/70 text-sm mb-5">Serving multi-team organizations and compliance departments.</p>
              <button
                onClick={() => setShowPilotModal(true)}
                className="inline-flex items-center gap-2 bg-white hover:bg-teal-50 text-teal-700 font-bold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-xl hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                <Compass className="w-4 h-4" />
                Request Institutional Pilot
              </button>
              <p className="text-teal-300/60 text-xs mt-3">For multi-team deployments, staff training, or compliance integration</p>
            </div>
          </div>
        </section>

        <ToolkitDownload />

        {/* ── LANGUAGES ── */}
        <section className="bg-slate-900" style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4">Coverage</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Languages Supported</h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed mb-12">Available in five languages spoken by over 2 million Bay Area residents.</p>
            <div className="flex flex-wrap justify-center gap-4" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
              {LANGUAGES.map(({ label, flag, bg, border, text }) => (
                <div
                  key={label}
                  className={`${bg} ${border} border-2 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md transition-transform duration-200 hover:-translate-y-1`}
                  style={{ width: '130px', height: '88px', padding: '0 1rem' }}
                >
                  <span className="text-2xl leading-none select-none" aria-hidden="true">{flag}</span>
                  <span className={`text-sm font-bold ${text} leading-tight`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-5 h-5 rounded-md bg-teal-600 flex items-center justify-center">
              <Languages className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-slate-700 text-xs">LangAccess</span>
          </div>
          <button onClick={onOpenPolicy} className="flex items-center gap-1.5 text-slate-400 hover:text-teal-600 transition-colors text-xs">
            <FileText className="w-3.5 h-3.5" />Language Access Policy
          </button>
          <button onClick={onOpenPolicy} className="flex items-center gap-1.5 text-slate-400 hover:text-teal-600 transition-colors text-xs">
            <MessageSquarePlus className="w-3.5 h-3.5" />Request a Language
          </button>
          <button onClick={onOpenCertificates} className="flex items-center gap-1.5 text-slate-400 hover:text-yellow-600 transition-colors text-xs">
            <Award className="w-3.5 h-3.5" />Certificates
          </button>
          <button onClick={onCheckForUpdates} className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-600 transition-colors text-xs">
            <RefreshCw className="w-3.5 h-3.5" />Check for Updates
          </button>
          <span className="text-slate-300 text-xs ml-2">California LEP Compliance Toolkit v1.0</span>
          <a
            href="mailto:LangAccessInfo@gmail.com"
            className="text-slate-400 hover:text-teal-600 transition-colors text-xs"
          >
            Questions? LangAccessInfo@gmail.com
          </a>
        </div>
      </footer>

      {showPilotModal && (
        <PilotRequestModal onClose={() => setShowPilotModal(false)} />
      )}
    </div>
  );
}
