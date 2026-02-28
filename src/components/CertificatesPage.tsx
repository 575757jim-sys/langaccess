import { useState, useEffect } from 'react';
import { ArrowLeft, Award, Lock, CheckCircle, ChevronRight, Download, BookOpen, Star } from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  CERT_TRACKS,
  CERT_PRICE,
  loadProgress,
  saveProgress,
  generateCertId,
  isTrackComplete,
  CertProgress,
  TrackId,
} from '../data/certificateData';
import CertQuizEngine from './CertQuizEngine';
import SEO from './SEO';

interface Props {
  onBack: () => void;
}

const JSON_LD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the LangAccess Certificate Program?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The LangAccess Certificate Program offers professional Spanish communication certificates for healthcare, education, construction, social services, and mental health workers. Each track includes 5 modules and a quiz-based assessment.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I earn a certificate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Complete all 5 modules in a track by passing each quiz with 80% or higher. The first module in every track is free. Full track access costs $39.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the certificates recognized by employers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LangAccess certificates demonstrate professional Spanish communication readiness and are designed to supplement institutional interpreter services in compliance with California LEP law.',
      },
    },
  ],
};

type QuizState = { trackId: TrackId; moduleId: number } | null;
type NamePromptState = { trackId: TrackId } | null;

export default function CertificatesPage({ onBack }: Props) {
  const [progress, setProgress] = useState<CertProgress>(loadProgress);
  const [activeQuiz, setActiveQuiz] = useState<QuizState>(null);
  const [namePrompt, setNamePrompt] = useState<NamePromptState>(null);
  const [nameInput, setNameInput] = useState('');
  const [expandedTrack, setExpandedTrack] = useState<TrackId | null>(null);
  const [certGenerated, setCertGenerated] = useState<TrackId | null>(null);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleStartModule = (trackId: TrackId, moduleId: number) => {
    if (!progress.userName) {
      setNamePrompt({ trackId });
      return;
    }
    setActiveQuiz({ trackId, moduleId });
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !namePrompt) return;
    const updated = { ...progress, userName: nameInput.trim() };
    setProgress(updated);
    setNamePrompt(null);
    setActiveQuiz({ trackId: namePrompt.trackId, moduleId: 1 });
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    if (!activeQuiz) return;
    const { trackId, moduleId } = activeQuiz;
    const key = `${trackId}-${moduleId}`;
    const updated: CertProgress = {
      ...progress,
      moduleScores: { ...progress.moduleScores, [key]: score },
      completedModules: {
        ...progress.completedModules,
        ...(passed ? { [key]: true } : {}),
      },
    };
    if (passed && isTrackComplete(trackId, updated) && !updated.certIds[trackId]) {
      updated.certIds = { ...updated.certIds, [trackId]: generateCertId() };
    }
    setProgress(updated);
  };

  const handleQuizClose = () => {
    setActiveQuiz(null);
  };

  const handleEnroll = (trackId: TrackId) => {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
    if (!stripeKey) {
      alert('Stripe is not yet configured. Contact hello@langaccess.org to enroll.');
      return;
    }
    const redirectUrl = window.location.href + `?enrolled=${trackId}`;
    window.location.href = `https://buy.stripe.com/langaccess-cert?client_reference_id=${trackId}&success_url=${encodeURIComponent(redirectUrl)}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const enrolled = params.get('enrolled') as TrackId | null;
    if (enrolled && CERT_TRACKS.find(t => t.id === enrolled)) {
      const updated: CertProgress = {
        ...progress,
        purchased: { ...progress.purchased, [enrolled]: true },
      };
      setProgress(updated);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const generatePDF = (trackId: TrackId) => {
    const track = CERT_TRACKS.find(t => t.id === trackId);
    if (!track) return;
    const certId = progress.certIds[trackId] || generateCertId();
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const name = progress.userName || 'Certificate Recipient';

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, W, H, 'F');

    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(3);
    doc.rect(24, 24, W - 48, H - 48, 'S');
    doc.setLineWidth(1);
    doc.rect(30, 30, W - 60, H - 60, 'S');

    doc.setTextColor(34, 197, 94);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('LANGACCESS', W / 2, 72, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text('Professional Spanish Communication', W / 2, 130, { align: 'center' });
    doc.setFontSize(32);
    doc.setTextColor(34, 197, 94);
    doc.text('Readiness Certificate', W / 2, 170, { align: 'center' });

    doc.setTextColor(160, 170, 185);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('This certifies that', W / 2, 215, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text(name, W / 2, 260, { align: 'center' });

    doc.setTextColor(160, 170, 185);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`has successfully completed the ${track.title} Track`, W / 2, 295, { align: 'center' });
    doc.text('of the LangAccess Professional Spanish Communication Program', W / 2, 315, { align: 'center' });

    doc.setTextColor(34, 197, 94);
    doc.setFontSize(10);
    doc.text(`Issued: ${date}`, W / 2 - 80, 365, { align: 'center' });
    doc.text(`Certificate ID: ${certId}`, W / 2 + 80, 365, { align: 'center' });

    doc.setTextColor(100, 110, 130);
    doc.setFontSize(8);
    doc.text('langaccess.org | hello@langaccess.org | California LEP Compliance Toolkit', W / 2, 395, { align: 'center' });

    doc.save(`LangAccess-Certificate-${track.title.replace(/\s+/g, '-')}-${certId}.pdf`);
    setCertGenerated(trackId);
    setTimeout(() => setCertGenerated(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <SEO
        title="Spanish Communication Certificates | LangAccess"
        description="Earn a professional Spanish communication certificate for healthcare, education, construction, and more. First module free. $39 for full track access."
        path="/certificates"
        jsonLd={JSON_LD_FAQ}
      />

      <div className="sticky top-0 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Certificate Program</h1>
            <p className="text-xs text-slate-500">Professional Spanish Communication</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 text-green-400 text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            First Module Free in Every Track
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Earn Your Professional<br />
            <span className="text-green-400">Spanish Communication</span> Certificate
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Built by frontline workers, for frontline workers. LangAccess certificates are the only Spanish communication
            credentials designed for California LEP compliance settings.
          </p>
          <div className="mt-8 bg-[#111827] rounded-2xl p-6 max-w-xl mx-auto border border-white/5">
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "I started LangAccess after watching a nurse guess at a patient's pain level because no one spoke Spanish.
              I built these certificates so that never happens to your patients, your students, or your workers again."
            </p>
            <p className="text-green-400 text-sm font-semibold mt-3">— LangAccess Founder</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {CERT_TRACKS.map((track) => {
            const purchased = !!progress.purchased[track.id];
            const completed = isTrackComplete(track.id, progress);
            const certId = progress.certIds[track.id];
            const isExpanded = expandedTrack === track.id;
            const completedCount = track.modules.filter(
              m => !!progress.completedModules[`${track.id}-${m.id}`]
            ).length;

            return (
              <div
                key={track.id}
                className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden flex flex-col hover:border-white/20 transition-colors"
              >
                <div className={`bg-gradient-to-br ${track.color} p-6`}>
                  <div className="text-4xl mb-3">{track.icon}</div>
                  <h2 className="text-xl font-bold text-white">{track.title}</h2>
                  <p className="text-white/70 text-sm mt-1 leading-relaxed">{track.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <span className="text-white/80">5 modules</span>
                    <span className="text-white/80">${CERT_PRICE} full access</span>
                  </div>
                  {!purchased && (
                    <span className="inline-block mt-3 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      First Module Free
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500">{completedCount}/5 modules complete</span>
                    <div className="flex gap-1">
                      {track.modules.map(m => (
                        <div
                          key={m.id}
                          className={`w-4 h-4 rounded-full border ${
                            progress.completedModules[`${track.id}-${m.id}`]
                              ? 'bg-green-500 border-green-500'
                              : 'bg-transparent border-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
                    className="w-full flex items-center justify-between text-sm text-slate-400 hover:text-white transition-colors mb-3 py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      View Modules
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="space-y-2 mb-4">
                      {track.modules.map((mod, idx) => {
                        const key = `${track.id}-${mod.id}`;
                        const modComplete = !!progress.completedModules[key];
                        const isLocked = !purchased && idx > 0;
                        const score = progress.moduleScores[key];

                        return (
                          <div
                            key={mod.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                          >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                              modComplete ? 'bg-green-500/20 text-green-400' : isLocked ? 'bg-white/5 text-slate-600' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {modComplete ? <CheckCircle className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${isLocked ? 'text-slate-600' : 'text-slate-200'}`}>
                                {mod.title}
                              </p>
                              {score !== undefined && (
                                <p className={`text-xs ${score >= 0.8 ? 'text-green-400' : 'text-red-400'}`}>
                                  {Math.round(score * 100)}%
                                </p>
                              )}
                            </div>
                            {!isLocked && (
                              <button
                                onClick={() => handleStartModule(track.id, mod.id)}
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors flex-shrink-0 ${
                                  modComplete
                                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                    : 'bg-blue-600 text-white hover:bg-blue-500'
                                }`}
                              >
                                {modComplete ? 'Retake' : 'Start'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-auto space-y-2">
                    {completed && certId ? (
                      <button
                        onClick={() => generatePDF(track.id)}
                        className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {certGenerated === track.id ? 'Downloaded!' : 'Download Certificate'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartModule(track.id, 1)}
                          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-colors"
                        >
                          Start Free Module
                        </button>
                        {!purchased && (
                          <button
                            onClick={() => handleEnroll(track.id)}
                            className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${track.color} text-white font-semibold text-sm transition-opacity hover:opacity-90`}
                          >
                            Enroll — ${CERT_PRICE}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#111827] rounded-2xl p-8 border border-white/5 text-center mb-8">
          <Award className="w-10 h-10 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {[
              { label: '5 Modules', desc: 'Each track includes 5 focused modules covering real workplace scenarios.' },
              { label: 'Instant Certificate', desc: 'Pass all modules and download your PDF certificate immediately.' },
              { label: 'Lifetime Access', desc: 'Retake any module any time. Progress is saved to your device.' },
            ].map(item => (
              <div key={item.label} className="text-left p-4 bg-white/3 rounded-xl border border-white/5">
                <p className="text-green-400 font-bold mb-1">{item.label}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {namePrompt && (
        <div className="fixed inset-0 bg-[#0a0f1e]/95 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleNameSubmit} className="bg-[#111827] rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">What's your name?</h2>
            <p className="text-slate-400 text-sm mb-6">Your name will appear on your certificate.</p>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Full name"
              required
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 mb-4 text-sm"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setNamePrompt(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      )}

      {activeQuiz && (() => {
        const track = CERT_TRACKS.find(t => t.id === activeQuiz.trackId);
        const module = track?.modules.find(m => m.id === activeQuiz.moduleId);
        if (!track || !module) return null;
        return (
          <CertQuizEngine
            module={module}
            trackTitle={track.title}
            onComplete={handleQuizComplete}
            onClose={handleQuizClose}
          />
        );
      })()}
    </div>
  );
}
