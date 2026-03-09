import { Languages, Heart, GraduationCap, HardHat, Compass, Award, Users, FileText, MessageSquarePlus, RefreshCw, ChevronRight, Volume2 } from 'lucide-react';
import { Sector } from '../data/phrases';
import SEO from './SEO';

const JSON_LD_WEB_APP = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'LangAccess',
  url: 'https://langaccess.org',
  description: 'Frontline language access platform for teachers, healthcare workers, construction supervisors, and community outreach teams.',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  inLanguage: ['en', 'es', 'tl', 'vi', 'zh'],
};

const EXAMPLE_PHRASES = [
  { sector: 'Teacher', phrase: 'Please sit down', color: 'bg-green-50 border-green-200', tag: 'bg-green-100 text-green-700' },
  { sector: 'Healthcare', phrase: 'Where does it hurt?', color: 'bg-blue-50 border-blue-200', tag: 'bg-blue-100 text-blue-700' },
  { sector: 'Construction', phrase: 'Wear your safety harness', color: 'bg-orange-50 border-orange-200', tag: 'bg-orange-100 text-orange-700' },
  { sector: 'Outreach', phrase: 'The shelter opens at 6 PM', color: 'bg-teal-50 border-teal-200', tag: 'bg-teal-100 text-teal-700' },
];

const SECTOR_CARDS = [
  {
    Icon: GraduationCap,
    title: 'Education',
    description: 'Teachers and school staff communicate with students and parents.',
    iconColor: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
  {
    Icon: Heart,
    title: 'Healthcare',
    description: 'Nurses and medical staff ask essential questions quickly.',
    iconColor: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    Icon: HardHat,
    title: 'Construction',
    description: 'Supervisors give safety instructions to multilingual crews.',
    iconColor: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    Icon: Compass,
    title: 'Community Outreach',
    description: 'Workers connect people to shelters, food, and services.',
    iconColor: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
];

const HOW_STEPS = [
  { step: '1', label: 'Choose your sector', desc: 'Select from Education, Healthcare, Construction, or Outreach.' },
  { step: '2', label: 'Select a situation', desc: 'Pick the communication scenario that matches your need.' },
  { step: '3', label: 'Tap a phrase to play', desc: 'Hear the audio translation instantly in the target language.' },
];

const LANGUAGES = [
  { label: 'Spanish', flag: 'ES', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Mandarin', flag: 'ZH', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: 'Cantonese', flag: 'YUE', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Tagalog', flag: 'TL', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Vietnamese', flag: 'VI', color: 'bg-green-100 text-green-700 border-green-200' },
];

interface LandingPageProps {
  onSelectSector: (sector: Sector) => void;
  onOpenPolicy?: () => void;
  onOpenCommunityNavigator?: () => void;
  onOpenCertificates?: () => void;
  onOpenAmbassadors?: () => void;
  onCheckForUpdates?: () => void;
}

export default function LandingPage({
  onSelectSector,
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
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Languages className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-slate-800 tracking-tight">LangAccess</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-500">
            <button onClick={onOpenCommunityNavigator} className="hover:text-slate-800 transition-colors">Community</button>
            <button onClick={onOpenCertificates} className="hover:text-slate-800 transition-colors">Certificates</button>
            <button onClick={onOpenAmbassadors} className="hover:text-slate-800 transition-colors">Ambassadors</button>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                  <Languages className="w-3.5 h-3.5" />
                  Frontline Language Access Platform
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5 tracking-tight">
                  Instant Language Access for Frontline Workers
                </h1>
                <p className="text-slate-300 text-lg leading-relaxed mb-3">
                  Communicate instantly with limited-English speakers in Spanish, Mandarin, Cantonese, Tagalog, and Vietnamese.
                </p>
                <p className="text-slate-400 text-sm mb-8">
                  Designed for teachers, healthcare workers, construction supervisors, and community outreach teams.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button
                    onClick={() => onSelectSector('healthcare')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Start Using LangAccess
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    See How It Works
                  </button>
                </div>
                <p className="text-slate-500 text-xs">Built for real-world communication situations.</p>
              </div>

              {/* Phone mock */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="w-72 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm font-semibold">LangAccess</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                    </div>
                    <div className="p-4 space-y-3 bg-slate-850">
                      <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">Example Phrases</p>
                      {EXAMPLE_PHRASES.map((item) => (
                        <div
                          key={item.sector}
                          className={`${item.color} border rounded-xl p-3 flex items-center justify-between`}
                        >
                          <div>
                            <span className={`${item.tag} text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full`}>
                              {item.sector}
                            </span>
                            <p className="text-slate-700 text-sm font-medium mt-1.5 leading-snug">{item.phrase}</p>
                          </div>
                          <div className="w-8 h-8 flex items-center justify-center bg-white/70 rounded-full flex-shrink-0 ml-2">
                            <Volume2 className="w-4 h-4 text-slate-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl" />
                  <div className="absolute -top-3 -left-3 w-20 h-20 bg-teal-400/15 rounded-full blur-2xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Frontline Professionals */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Built for Frontline Professionals</h2>
              <p className="text-slate-500 max-w-xl mx-auto">Every sector has unique communication needs. LangAccess is designed around real situations you face every day.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SECTOR_CARDS.map(({ Icon, title, description, iconColor, bg, border }) => (
                <div
                  key={title}
                  className={`${bg} border ${border} rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base mb-1.5">{title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">How LangAccess Works</h2>
              <p className="text-slate-500">Three simple steps to clear communication.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              {HOW_STEPS.map(({ step, label, desc }) => (
                <div key={step} className="flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-600/20">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base mb-1">{label}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                  {step !== '3' && (
                    <div className="hidden sm:block absolute" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Languages */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-3">Languages Supported</h2>
            <p className="text-slate-400 mb-10">Audio phrase translations available in five languages used across California communities.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {LANGUAGES.map(({ label, flag, color }) => (
                <span
                  key={label}
                  className={`${color} border font-semibold text-sm px-5 py-2.5 rounded-full flex items-center gap-2`}
                >
                  <span className="text-xs font-bold opacity-60">{flag}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-blue-600">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to communicate clearly?</h2>
            <p className="text-blue-100 mb-8">Select your sector to get started. No sign-up required.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {[
                { id: 'education' as Sector, label: 'Education', Icon: GraduationCap },
                { id: 'healthcare' as Sector, label: 'Healthcare', Icon: Heart },
                { id: 'construction' as Sector, label: 'Construction', Icon: HardHat },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => onSelectSector(id)}
                  className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <button onClick={onOpenPolicy} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
            <FileText className="w-4 h-4" />
            Language Access Policy
          </button>
          <button onClick={onOpenPolicy} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
            <MessageSquarePlus className="w-4 h-4" />
            Request a Language
          </button>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <button onClick={onOpenCertificates} className="flex items-center gap-1.5 text-slate-500 hover:text-yellow-600 transition-colors">
            <Award className="w-4 h-4" />
            Certificates
          </button>
          <button onClick={onOpenAmbassadors} className="flex items-center gap-1.5 text-slate-500 hover:text-green-600 transition-colors">
            <Users className="w-4 h-4" />
            Ambassadors
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
  );
}
