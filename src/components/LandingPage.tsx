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
  { step: '1', label: 'Choose your role', desc: 'Pick the role that matches your job.' },
  { step: '2', label: 'Select a situation', desc: 'Choose the scenario that fits your need.' },
  { step: '3', label: 'Tap to play translation', desc: 'Hear the translation instantly in any language.' },
];


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
              Built for teachers, healthcare workers, and frontline teams. <span className="text-white font-semibold">No sign-up needed. Use it instantly.</span>
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
        <section className="bg-gradient-to-b from-slate-900 to-slate-950 py-8 px-6">
          <div className="max-w-sm mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">Hear it yourself</p>
            <h2 className="text-lg font-extrabold text-white mb-5">One tap. Instant understanding.</h2>
            <p className="text-slate-400 text-xs mb-5">No typing. No guessing. Just tap.</p>

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

              {!demoPlayed && !demoPlaying && (
                <p className="text-teal-300 text-xs font-semibold uppercase tracking-widest mb-2">Tap to hear instantly</p>
              )}
              <button
                onClick={handleDemoPlay}
                disabled={demoPlaying}
                className={`group w-full flex items-center justify-center gap-3 font-bold text-xl py-5 px-6 rounded-xl transition-all duration-200 active:scale-[0.97] shadow-xl ${
                  demoPlayed
                    ? 'bg-teal-400 hover:bg-teal-300 text-white shadow-teal-400/50'
                    : 'bg-teal-400 hover:bg-teal-300 text-white shadow-teal-400/70 hover:scale-[1.02]'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
                style={!demoPlayed && !demoPlaying ? { animation: 'pulse-glow 2s ease-in-out infinite', boxShadow: '0 0 28px 6px rgba(45,212,191,0.55)' } : { boxShadow: '0 0 18px 2px rgba(45,212,191,0.35)' }}
              >
                {demoPlaying ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Playing…
                  </>
                ) : demoPlayed ? (
                  <>
                    <Volume2 className="w-8 h-8" />
                    Play Again
                  </>
                ) : (
                  <>
                    <Volume2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    Hear it instantly in another language
                  </>
                )}
              </button>

              <p className="mt-2.5 text-xs text-teal-400/70 font-medium tracking-wide">1 tap. Instant translation.</p>
              <p className="mt-1.5 text-xs text-slate-500">Example: A patient explains symptoms. A worker reports a safety issue.</p>
              <p className="mt-1.5 text-xs text-slate-600">Real TTS audio — no sign-up needed</p>
            </div>

            <p className="mt-5 text-sm font-medium text-teal-400/80 tracking-wide">Now choose your role</p>

            <p className="mt-2 text-xs text-slate-500">
              Works in Spanish, Tagalog, Vietnamese, Mandarin &amp; Cantonese
            </p>
          </div>
        </section>

        {/* ── ROLE SELECTION ── */}
        <section className="bg-slate-950 py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400 text-center mb-2">Get started instantly</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center tracking-tight mb-3">What do you do?</h2>
            <p className="text-slate-400 text-center text-sm mb-12">Choose your job to start communicating in seconds.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {[
                { icon: <Building2 className="w-6 h-6" />, label: 'Property Manager (Tenant Issues + Maintenance Requests)', desc: 'Fix issues, explain rules, and manage tenants.', sector: 'property-management' as Sector, accent: 'border-sky-500/60 hover:border-sky-400/90', iconBg: 'bg-sky-500/20 text-sky-300' },
                { icon: <HardHat className="w-6 h-6" />, label: 'Construction (Safety + Job Site Communication)', desc: 'Give safety instructions and guide your crew.', sector: 'construction' as Sector, accent: 'border-orange-500/60 hover:border-orange-400/90', iconBg: 'bg-orange-500/20 text-orange-300' },
                { icon: <Warehouse className="w-6 h-6" />, label: 'Warehouse (Operations + Safety Coordination)', desc: 'Direct tasks and avoid costly mistakes.', sector: 'warehouse' as Sector, accent: 'border-amber-500/60 hover:border-amber-400/90', iconBg: 'bg-amber-500/20 text-amber-300' },
                { icon: <Hotel className="w-6 h-6" />, label: 'Hospitality (Guest Issues + Service Requests)', desc: 'Help guests and resolve problems fast.', sector: 'hospitality' as Sector, accent: 'border-rose-500/60 hover:border-rose-400/90', iconBg: 'bg-rose-500/20 text-rose-300' },
                { icon: <Leaf className="w-6 h-6" />, label: 'Agriculture (Field Work + Crew Communication)', desc: 'Guide work and keep crews safe.', sector: 'agriculture' as Sector, accent: 'border-green-500/60 hover:border-green-400/90', iconBg: 'bg-green-500/20 text-green-300' },
              ].map(({ icon, label, desc, sector, accent, iconBg }) => (
                <button
                  key={label}
                  onClick={() => onSelectSector(sector)}
                  className={`group flex items-center gap-4 bg-white/[0.08] hover:bg-white/[0.14] border-2 ${accent} rounded-2xl px-6 py-6 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] shadow-md hover:shadow-lg`}
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${iconBg} transition-transform group-hover:scale-110`}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-base leading-tight mb-1">{label}</div>
                    <div className="text-slate-300 text-xs leading-snug mb-2">{desc}</div>
                    <div className="text-slate-400 text-[11px] font-medium">🎓 Certification Available</div>
                  </div>
                  <ChevronRight className="ml-auto flex-shrink-0 w-5 h-5 text-slate-400 group-hover:text-white transition-colors group-hover:translate-x-0.5 duration-200" />
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
                { icon: <GraduationCap className="w-5 h-5" />, label: 'Education (Student Support + Family Communication)', desc: 'Students & families', sector: 'education' as Sector, iconBg: 'bg-blue-500/20 text-blue-300' },
                { icon: <Heart className="w-5 h-5" />, label: 'Healthcare (Patient Care + Symptom Communication)', desc: 'Patients & care teams', sector: 'healthcare' as Sector, iconBg: 'bg-emerald-500/20 text-emerald-300' },
                { icon: <Compass className="w-5 h-5" />, label: 'Community Outreach (Connecting People to Local Resources)', desc: 'Shelter, food & services', sector: 'outreach' as Sector, iconBg: 'bg-teal-500/20 text-teal-300' },
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
                  <div className="text-slate-500 text-xs leading-snug mb-1">{desc}</div>
                  <div className="text-slate-500 text-[10px] font-medium">🎓 Certification Available</div>
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
                Need help right now?
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-3">
                Find nearby food, shelter, medical care, and essential services.
              </p>
              <p className="text-slate-500 text-xs mb-5">No apps. No logins. Works instantly.</p>
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
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight">Instant Translation for Your Team</h2>
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
              Includes pre-built phrase packs for Healthcare, Construction, Education, Property Management, Warehouse, Hospitality, Agriculture, and Community settings.
            </p>
          </div>
        </section>

        {/* ── TWO WAYS LANGACCESS WORKS ── */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">Platform Overview</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Two Ways LangAccess Works</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-3">Community Access</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Help people in need—fast. QR cards connect individuals to food, shelter, and essential services. Ambassadors verify and update local resources in real time.
                  </p>
                </div>
                <button
                  onClick={onOpenAmbassadors}
                  className="mt-auto inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm self-start"
                >
                  Become an Ambassador
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-3">Workplace Communication</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Support teams with instant multilingual phrases and meet compliance requirements. Built for construction, healthcare, property management, and more.
                  </p>
                </div>
                <button
                  onClick={onOpenCertificates}
                  className="mt-auto inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm self-start"
                >
                  Explore Certificates
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOR ORGANIZATIONS ── */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">Enterprise</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">For Organizations</h2>
            <p className="text-slate-500 text-base mb-8">Need more control? Customize what your QR codes show.</p>

            <ul className="flex flex-col items-center gap-3 mb-10">
              {[
                'Add your own contact numbers and instructions',
                'Update resources anytime without reprinting cards',
                'Support internal communication and compliance',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 max-w-md text-left">
                  <span className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-full bg-teal-100 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-teal-700" />
                  </span>
                  <span className="text-slate-600 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowPilotModal(true)}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              Learn More
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ── SOCIAL PROOF BAR ── */}
        <section className="w-full bg-slate-900 py-5">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-teal-500/80 text-xs font-medium leading-relaxed tracking-wide">
              Designed for compliance teams &nbsp;&middot;&nbsp; Supports Title VI and California LEP requirements &nbsp;&middot;&nbsp; Used across California
            </p>
            <p className="text-slate-500 text-xs font-medium mt-2 tracking-wide">
              Used by educators, healthcare staff, property managers, warehouse teams, hospitality staff, agricultural crews, construction teams, and community workers.
            </p>
          </div>
        </section>

        {/* ── INSTITUTIONAL PILOT CTA ── */}
        <section id="sector-select" className="py-24 bg-gradient-to-br from-teal-700 to-teal-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Certified for your organization</h2>
            <p className="text-teal-100/80 text-base mb-2">Serving multi-team organizations and compliance departments.</p>
            <p className="text-teal-100/60 text-sm mb-4">Reduce interpreter costs and improve compliance instantly.</p>
            <p className="text-teal-100/70 text-sm mb-3">Includes Language Access Certification for staff compliance.</p>
            <p className="text-teal-100/60 text-sm mb-6">🎓 Certification programs available: <a href="https://LangAccess.org/certificates" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-teal-200 hover:text-white transition-colors">LangAccess.org/certificates</a></p>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-10 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-300 inline-block"></span>
              Certified Workforce Ready
            </div>
            <button
              onClick={() => setShowPilotModal(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-teal-50 text-teal-700 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:scale-[1.02] active:scale-[0.98] text-base"
            >
              <Compass className="w-5 h-5" />
              Request Institutional Pilot
            </button>
            <p className="text-teal-100/70 text-sm font-semibold mt-5">Reduce interpreter costs and meet compliance requirements instantly.</p>
            <p className="text-teal-300/60 text-xs mt-2">For multi-team deployments, staff training, or compliance integration</p>
          </div>
        </section>

        <ToolkitDownload />

        {/* ── LANGUAGES ── */}
        <section className="bg-slate-900 py-24 sm:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4">Coverage</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Languages Supported</h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed mb-12">Available in five essential languages used across California workplaces and communities.</p>
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
