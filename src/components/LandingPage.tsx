import { Languages, Heart, GraduationCap, HardHat, Compass, Award, Users, FileText, MessageSquarePlus, RefreshCw, ChevronRight, Volume2, Zap, Shield, Smartphone, BookOpen } from 'lucide-react';
import { Sector } from '../data/phrases';
import SEO from './SEO';
import HomeDemoSection from './HomeDemoSection';
import SituationPacks from './SituationPacks';

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

const SECTOR_CARDS = [
  { Icon: GraduationCap, title: 'Education', description: 'Teachers and school staff communicate with students and parents.', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', border: 'border-blue-100', accentBg: 'bg-blue-50' },
  { Icon: Heart, title: 'Healthcare', description: 'Nurses and medical staff ask essential questions quickly.', iconBg: 'bg-green-100', iconColor: 'text-green-600', border: 'border-green-100', accentBg: 'bg-green-50' },
  { Icon: HardHat, title: 'Construction', description: 'Supervisors give safety instructions to multilingual crews.', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', border: 'border-orange-100', accentBg: 'bg-orange-50' },
  { Icon: Compass, title: 'Community Outreach', description: 'Workers connect people to shelters, food, and services.', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', border: 'border-teal-100', accentBg: 'bg-teal-50' },
];

const HOW_STEPS = [
  { step: '1', label: 'Choose your sector', desc: 'Select from Education, Healthcare, Construction, or Outreach.' },
  { step: '2', label: 'Select a situation', desc: 'Pick the communication scenario that matches your need.' },
  { step: '3', label: 'Tap a phrase to play', desc: 'Hear the audio translation instantly in the target language.' },
];

const LANGUAGES = [
  { label: 'Spanish', abbr: 'ES', pill: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Mandarin', abbr: 'ZH', pill: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: 'Cantonese', abbr: 'YUE', pill: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Tagalog', abbr: 'TL', pill: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Vietnamese', abbr: 'VI', pill: 'bg-green-100 text-green-700 border-green-200' },
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
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="LangAccess — Frontline Language Access Platform"
        description="Instant language access for frontline workers. Communicate in Spanish, Mandarin, Cantonese, Tagalog, and Vietnamese. Built for teachers, healthcare workers, and construction supervisors."
        path="/"
        jsonLd={JSON_LD_WEB_APP}
      />

      {/* Nav */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Languages className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">LangAccess</span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {[
              { label: 'Community', action: onOpenCommunityNavigator },
              { label: 'Certificates', action: onOpenCertificates },
              { label: 'Ambassadors', action: onOpenAmbassadors },
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
          <button
            onClick={onGetStarted}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Get Started
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
          {/* Subtle grid texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
          {/* Glow blobs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-14 items-center">

              {/* Left — copy */}
              <div className="flex flex-col">
                <div className="inline-flex items-center self-start gap-2 bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-7">
                  <Languages className="w-3 h-3" />
                  Frontline Language Access Platform
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.1] tracking-tight text-white mb-5">
                  Instant Communication<br className="hidden sm:block" />{' '}
                  With Non-English<br className="hidden sm:block" />{' '}
                  Speakers
                </h1>

                <p className="text-slate-300 text-lg leading-relaxed mb-3 max-w-lg">
                  LangAccess helps frontline workers communicate with non-English speakers in seconds using simple, situation-based phrases.
                </p>

                <p className="text-slate-400 text-sm font-medium mb-4 max-w-lg">
                  Tap a situation &rarr; play the phrase &rarr; communicate instantly.
                </p>

                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {['Spanish', 'Mandarin', 'Cantonese', 'Vietnamese', 'Tagalog'].map((lang, i) => (
                    <span key={lang} className="flex items-center gap-1.5">
                      <span className="text-slate-200 text-sm font-semibold">{lang}</span>
                      {i < 4 && <span className="text-slate-600 text-sm">•</span>}
                    </span>
                  ))}
                </div>

                <p className="text-slate-400 text-sm leading-relaxed mb-9 max-w-md">
                  Built for teachers, healthcare workers, outreach teams, and construction supervisors.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onGetStarted}
                    className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] text-base"
                  >
                    Get Started
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 border border-white/20 text-white font-semibold px-7 py-4 rounded-xl transition-all duration-200 text-base"
                  >
                    See How It Works
                  </button>
                </div>
              </div>

              {/* Right — Example phrase cards */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-sm space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Common frontline phrases</p>
                  {MOCK_PHRASES.map((item) => (
                    <div
                      key={item.phrase}
                      className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 transition-colors"
                    >
                      <div className={`w-12 h-12 ${item.sectorColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Volume2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.sector}</div>
                        <div className="text-white text-base font-semibold leading-snug">{item.phrase}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUE BAND ── */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUE_POINTS.map(({ Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-snug">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <HomeDemoSection />

        <SituationPacks />

        {/* ── BUILT FOR FRONTLINE ── */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Who it's for</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Built for Frontline Professionals</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-[1.05rem] leading-relaxed">Every sector has unique communication needs. LangAccess is designed around real situations you face every day.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SECTOR_CARDS.map(({ Icon, title, description, iconBg, iconColor, border, accentBg }) => (
                <div
                  key={title}
                  className={`bg-white border ${border} rounded-2xl p-6 flex flex-col gap-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-base mb-2.5">{title}</h3>
                    <p className="text-slate-500 text-[0.9375rem] leading-relaxed">{description}</p>
                  </div>
                  <div className={`${accentBg} rounded-lg px-3 py-1.5`}>
                    <p className={`text-xs font-semibold ${iconColor}`}>View phrases →</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MID-PAGE CTA ── */}
        <section className="py-16 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">Live demo</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">See LangAccess in Action</h2>
            <p className="text-blue-100 text-[1.05rem] leading-relaxed mb-9 max-w-md mx-auto">Choose a language, select a situation, and hear the phrase instantly.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onSelectSector('healthcare')}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-7 py-4 rounded-xl transition-all duration-200 hover:bg-blue-50 shadow-lg text-base hover:scale-[1.02] active:scale-[0.98]"
              >
                Try the Demo
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.getElementById('situation-packs')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-7 py-4 rounded-xl transition-all duration-200 text-base hover:scale-[1.02] active:scale-[0.98]"
              >
                Choose Your Sector
              </button>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Simple to use</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">How LangAccess Works</h2>
              <p className="text-slate-500 text-[1.05rem] leading-relaxed">Three steps to clear communication with anyone on your team.</p>
            </div>

            <div className="relative grid sm:grid-cols-3 gap-10">
              {/* Connector line on desktop */}
              <div className="hidden sm:block absolute top-7 left-[calc(16.666%+1.75rem)] right-[calc(16.666%+1.75rem)] h-px bg-slate-200" />

              {HOW_STEPS.map(({ step, label, desc }) => (
                <div key={step} className="flex flex-col items-center text-center gap-4">
                  <div className="relative w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-blue-600/25 z-10">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-2.5">{label}</h3>
                    <p className="text-slate-500 text-[0.9375rem] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LANGUAGES ── */}
        <section className="py-20 bg-slate-900">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Coverage</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Languages Supported</h2>
            <p className="text-slate-400 mb-12 text-base max-w-lg mx-auto">Audio phrase translations available in five languages used across California communities.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {LANGUAGES.map(({ label, abbr, pill }) => (
                <span
                  key={label}
                  className={`${pill} border font-bold text-sm px-5 py-2.5 rounded-full inline-flex items-center gap-2 shadow-sm`}
                >
                  <span className="text-[10px] font-black opacity-50 tracking-wider">{abbr}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section id="sector-select" className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Ready to communicate clearly?</h2>
            <p className="text-blue-100 mb-10 text-base">Select your sector to get started. No account needed, works instantly.</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
              <button
                onClick={() => onOpenCommunityNavigator?.()}
                className="flex items-center justify-center gap-2.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm shadow-sm"
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
                  className="flex items-center justify-center gap-2.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm shadow-sm"
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
              <Languages className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-slate-700 text-xs">LangAccess</span>
          </div>
          <button onClick={onOpenPolicy} className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors text-xs">
            <FileText className="w-3.5 h-3.5" />Language Access Policy
          </button>
          <button onClick={onOpenPolicy} className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors text-xs">
            <MessageSquarePlus className="w-3.5 h-3.5" />Request a Language
          </button>
          <button onClick={onOpenCertificates} className="flex items-center gap-1.5 text-slate-400 hover:text-yellow-600 transition-colors text-xs">
            <Award className="w-3.5 h-3.5" />Certificates
          </button>
          <button onClick={onOpenAmbassadors} className="flex items-center gap-1.5 text-slate-400 hover:text-green-600 transition-colors text-xs">
            <Users className="w-3.5 h-3.5" />Ambassadors
          </button>
          <button onClick={onCheckForUpdates} className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-600 transition-colors text-xs">
            <RefreshCw className="w-3.5 h-3.5" />Check for Updates
          </button>
          <span className="text-slate-300 text-xs ml-2">California LEP Compliance Toolkit v1.0</span>
        </div>
      </footer>
    </div>
  );
}
