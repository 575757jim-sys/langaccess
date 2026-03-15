import { Languages, Heart, GraduationCap, HardHat, Compass, Award, Users, FileText, MessageSquarePlus, RefreshCw, ChevronRight, Volume2, Zap, Shield, Smartphone, BookOpen, Globe, Wifi, Briefcase, CheckCircle, Tablet } from 'lucide-react';
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

const HERO_VALUE_STRIP = [
  { Icon: Wifi, label: 'Instant communication' },
  { Icon: Briefcase, label: 'Field-ready workflow' },
  { Icon: CheckCircle, label: 'Compliance-supportive' },
  { Icon: Tablet, label: 'Mobile-friendly' },
];

const SECTOR_CARDS = [
  { emoji: '🎓', title: 'Education', description: 'Teachers and school staff communicate clearly with students and parents across language barriers.', border: 'border-blue-100', accentBg: 'bg-blue-50', accentText: 'text-blue-500' },
  { emoji: '🏥', title: 'Healthcare', description: 'Nurses and medical staff ask essential intake questions and deliver instructions quickly and accurately.', border: 'border-green-100', accentBg: 'bg-green-50', accentText: 'text-green-500' },
  { emoji: '🦺', title: 'Construction', description: 'Supervisors deliver safety instructions and emergency directions to multilingual crews on-site.', border: 'border-orange-100', accentBg: 'bg-orange-50', accentText: 'text-orange-500' },
  { emoji: '🤝', title: 'Community Outreach', description: 'Outreach workers connect community members to shelters, food assistance, and vital services.', border: 'border-teal-100', accentBg: 'bg-teal-50', accentText: 'text-teal-500' },
];

const HOW_STEPS = [
  { step: '1', label: 'Choose your sector', desc: 'Select from Education, Healthcare, Construction, or Outreach.' },
  { step: '2', label: 'Select a situation', desc: 'Pick the communication scenario that matches your need.' },
  { step: '3', label: 'Tap a phrase to play', desc: 'Hear the audio translation instantly in the target language.' },
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
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="LangAccess — Frontline Language Access Platform"
        description="Instant language access for frontline workers. Communicate in Spanish, Mandarin, Cantonese, Tagalog, and Vietnamese. Built for teachers, healthcare workers, and construction supervisors."
        path="/"
        jsonLd={JSON_LD_WEB_APP}
      />

      {/* ── NAV ── */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
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
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Get Started Free
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
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

                <h1 className="font-extrabold leading-[1.06] tracking-tight text-white mb-8" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
                  Instant Communication<br className="hidden sm:block" />{' '}
                  With Non-English<br className="hidden sm:block" />{' '}
                  Speakers
                </h1>

                <p className="text-slate-200 text-xl leading-relaxed mb-5 max-w-lg">
                  LangAccess helps frontline workers communicate with non-English speakers in seconds using simple, situation-based phrases.
                </p>

                <p className="text-slate-400 text-base font-medium mb-5 max-w-lg">
                  Tap a situation &rarr; play the phrase &rarr; communicate instantly.
                </p>

                <p className="text-slate-300 text-base leading-relaxed mb-3 max-w-lg">
                  Instant language access tools for healthcare, education, construction, and community services.
                </p>

                <p className="text-slate-400 text-sm leading-relaxed mb-3 max-w-lg">
                  Use pre-built phrases, play instant translations, and bridge communication until a certified interpreter is available.
                </p>

                <p className="text-slate-500 text-xs leading-relaxed mb-8 max-w-lg">
                  Supports Title VI Civil Rights language access compliance and California LEP access standards. Not legal advice.
                </p>

                <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-3">
                  Built for Healthcare &middot; Education &middot; Construction &middot; Community Outreach
                </p>

                <div className="flex flex-wrap gap-x-5 gap-y-2 mb-10">
                  {HERO_VALUE_STRIP.map(({ Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                      <Icon className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={onGetStarted}
                    className="group inline-flex items-center justify-center gap-2.5 bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl shadow-teal-600/30 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] text-base min-h-[52px]"
                  >
                    Get Started Free
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-base hover:bg-white/8 min-h-[52px]"
                  >
                    See How It Works
                  </button>
                </div>
              </div>

              {/* Right — example phrase cards */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-sm space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Common frontline phrases</p>
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

        {/* ── HOW IT WORKS ── (moved up, directly after hero) */}
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

        <HomeDemoSection />

        <SituationPacks />

        {/* ── BUILT FOR FRONTLINE ── */}
        <section className="py-24 sm:py-28 bg-slate-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">Who it's for</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight">Built for Frontline Professionals</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">Every sector has unique communication needs. LangAccess is designed around real situations you face every day.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SECTOR_CARDS.map(({ emoji, title, description, border, accentBg, accentText }) => (
                <div
                  key={title}
                  className={`bg-white border-2 ${border} rounded-2xl p-7 flex items-start gap-5 shadow-sm hover:shadow-md transition-all duration-300`}
                >
                  <span
                    className="flex-shrink-0 select-none leading-none mt-0.5"
                    style={{ fontSize: '2rem', lineHeight: 1 }}
                    aria-hidden="true"
                  >
                    {emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg leading-snug mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{description}</p>
                    <span className={`text-xs font-medium ${accentText} opacity-70`}>View phrases →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MID-PAGE CTA ── */}
        <section className="py-24 bg-teal-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-teal-200 uppercase tracking-widest mb-3">Live demo</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">See LangAccess in Action</h2>
            <p className="text-teal-100 text-lg leading-relaxed mb-10 max-w-md mx-auto">Choose a language, select a situation, and hear the phrase instantly.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => onSelectSector('healthcare')}
                className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-teal-700 font-bold px-10 py-4 rounded-xl transition-all duration-200 shadow-xl text-base hover:scale-[1.02] active:scale-[0.98] min-h-[54px]"
              >
                Try the Demo
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.getElementById('situation-packs')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 text-teal-200 hover:text-white font-medium text-sm transition-colors min-h-[54px] px-4 underline underline-offset-4 decoration-teal-400/50 hover:decoration-white/70"
              >
                Browse Packs
              </button>
            </div>
          </div>
        </section>

        {/* ── LANGUAGES ── */}
        <section className="bg-slate-900" style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4">Coverage</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">Languages Supported</h2>
            <p className="text-teal-400 font-semibold text-base mb-3">Native-quality voice, text &amp; translation</p>
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

        {/* ── FINAL CTA ── */}
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
          <button onClick={onOpenAmbassadors} className="flex items-center gap-1.5 text-slate-400 hover:text-green-600 transition-colors text-xs">
            <Users className="w-3.5 h-3.5" />Ambassadors
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
    </div>
  );
}
