import { useState } from 'react';
import { Languages, Heart, GraduationCap, HardHat, Compass, Award, FileText, MessageSquarePlus, RefreshCw, ChevronRight, Volume2, Zap, Shield, Wifi, Menu, X, MapPin, Loader2, Building2, Warehouse, Hotel, Leaf } from 'lucide-react';
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

          <nav className="hidden sm:flex items-center gap-1">
            {[
              { label: 'Get Help Near You', action: onOpenCommunityNavigator },
              { label: 'How It Works', action: () => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'Ambassador Brigade', action: onOpenAmbassadors },
              { label: 'Certificates', action: () => onOpenCertificates?.() },
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

            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-1">
            {[
              { label: 'Get Help Near You', action: () => { onOpenCommunityNavigator?.(); closeMobileMenu(); } },
              { label: 'How It Works', action: () => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); closeMobileMenu(); } },
              { label: 'Ambassador Brigade', action: () => { onOpenAmbassadors?.(); closeMobileMenu(); } },
              { label: 'Certificates', action: () => { onOpenCertificates?.(); closeMobileMenu(); } },
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

          <div className="relative max-w-3xl mx-auto px-6 py-24 lg:py-32 text-center">
            <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-400/25 text-teal-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8">
              <Languages className="w-3 h-3" />
              Frontline Language Access Platform
            </div>

            <h1 className="font-extrabold leading-[1.06] tracking-tight text-white mb-5" style={{ fontSize: 'clamp(2rem, 6vw, 3.75rem)' }}>
              Communicate Clearly.<br />Find Help Fast.
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              Instant multilingual phrases for teachers, healthcare workers, and frontline teams. No sign-up needed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenCommunityNavigator}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-green-600/30 hover:scale-[1.02] active:scale-[0.98] text-base"
              >
                <MapPin className="w-5 h-5" />
                Find Help Near You
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={onGetStarted}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-base"
              >
                <Volume2 className="w-5 h-5" />
                Start Translating
              </button>
            </div>

            <p className="text-slate-500 text-xs mt-4">
              Need urgent mental health support? Call or text <span className="font-semibold text-slate-400">988</span>
            </p>
          </div>
        </section>

        {/* ── INSTANT DEMO ── */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-950 py-10 px-6">
          <div className="max-w-sm mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">Hear it yourself</p>
            <h2 className="text-lg font-extrabold text-white mb-5">Tap to play a real translation</h2>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-7 backdrop-blur-sm shadow-xl">
              <span className="inline-block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">English</span>
              <p className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight mb-3">
                "What is the problem?"
              </p>

              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-slate-500 text-xs font-medium px-2">Spanish</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <p className={`text-xl sm:text-2xl font-bold leading-snug transition-all duration-500 mb-5 ${
                demoPlayed ? 'text-teal-300 opacity-100' : 'text-slate-500 opacity-50'
              }`}>
                ¿Cuál es el problema?
              </p>

              <button
                onClick={handleDemoPlay}
                disabled={demoPlaying}
                className={`group w-full flex items-center justify-center gap-3 font-bold text-lg py-4 px-6 rounded-xl transition-all duration-200 active:scale-[0.97] shadow-lg ${
                  demoPlayed
                    ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-teal-500/40'
                    : 'bg-teal-500 hover:bg-teal-400 text-white shadow-teal-500/50 hover:scale-[1.02]'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
                style={!demoPlayed && !demoPlaying ? { animation: 'pulse-glow 2s ease-in-out infinite' } : {}}
              >
                {demoPlaying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Playing…
                  </>
                ) : demoPlayed ? (
                  <>
                    <Volume2 className="w-5 h-5" />
                    Play Again
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Hear it in Spanish
                  </>
                )}
              </button>

              <p className="mt-2.5 text-xs text-slate-500">Real TTS audio — no sign-up needed</p>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Works in Spanish, Tagalog, Vietnamese, Mandarin &amp; Cantonese
            </p>
          </div>
        </section>

        {/* ── ROLE SELECTION ── */}
        <section className="bg-slate-950 py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400 text-center mb-2">Get started instantly</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center tracking-tight mb-3">What do you do?</h2>
            <p className="text-slate-400 text-center text-base mb-12">Choose your role and start communicating in seconds.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
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
                  className={`group flex items-center gap-4 bg-white/[0.06] hover:bg-white/[0.11] border-2 ${accent} rounded-2xl px-5 py-5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} transition-transform group-hover:scale-110`}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-base leading-tight mb-1">{label}</div>
                    <div className="text-slate-400 text-xs leading-snug">{desc}</div>
                  </div>
                  <ChevronRight className="ml-auto flex-shrink-0 w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Also supports</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <GraduationCap className="w-5 h-5" />, label: 'Education', desc: 'Students & families', sector: 'education' as Sector, iconBg: 'bg-blue-500/20 text-blue-300' },
                { icon: <Heart className="w-5 h-5" />, label: 'Healthcare', desc: 'Patients & care teams', sector: 'healthcare' as Sector, iconBg: 'bg-emerald-500/20 text-emerald-300' },
                { icon: <Compass className="w-5 h-5" />, label: 'Community Outreach', desc: 'Shelter, food & services', sector: 'outreach' as Sector, iconBg: 'bg-teal-500/20 text-teal-300' },
              ].map(({ icon, label, desc, sector, iconBg }) => (
                <button
                  key={label}
                  onClick={() => onSelectSector(sector)}
                  className="group flex flex-col items-center gap-2.5 bg-white/[0.06] hover:bg-white/[0.11] border border-white/10 hover:border-white/25 rounded-xl px-3 py-5 text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.97]"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} transition-transform group-hover:scale-110`}>
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
          <div className="relative max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Ready for your organization?</h2>
            <p className="text-teal-100/80 text-base mb-10">Serving multi-team organizations and compliance departments.</p>
            <button
              onClick={() => setShowPilotModal(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-teal-50 text-teal-700 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:scale-[1.02] active:scale-[0.98] text-base"
            >
              <Compass className="w-5 h-5" />
              Request Institutional Pilot
            </button>
            <p className="text-teal-300/60 text-xs mt-4">For multi-team deployments, staff training, or compliance integration</p>
            <div className="mt-6">
              <a
                href={PHRASE_REQUEST_HREF}
                className="inline-flex items-center gap-1.5 text-teal-200 hover:text-white text-sm font-medium underline underline-offset-2 transition-colors"
              >
                Missing a phrase? Tell us here
              </a>
            </div>
          </div>
        </section>

        <ToolkitDownload />

        {/* ── LANGUAGES ── */}
        <section className="bg-slate-900 py-24 sm:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4">Coverage</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Languages Supported</h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed mb-12">Available in five languages spoken by over 2 million Bay Area residents.</p>
            <div className="flex flex-wrap justify-center gap-4">
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
