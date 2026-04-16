import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Award, Lock, CheckCircle, ChevronRight, Download, BookOpen, Star, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { CERT_TRACKS, CERT_PRICE, CertProgress, TrackId } from '../data/certificateData';
import { supabase } from '../lib/supabase';
import {
  loadLocalProgress,
  saveLocalProgress,
  loadProgressFromSupabase,
  saveModuleResult,
  saveCertificateRecord,
  isTrackComplete,
  generateCertId,
} from '../utils/certPersistence';
import CertQuizEngine from './CertQuizEngine';
import SEO from './SEO';
import { getSessionId } from '../utils/sessionId';

interface Props {
  onBack: () => void;
  onVerify?: () => void;
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

export default function CertificatesPage({ onBack, onVerify }: Props) {
  const [progress, setProgress] = useState<CertProgress>(loadLocalProgress);
  const [activeQuiz, setActiveQuiz] = useState<QuizState>(null);
  const [namePrompt, setNamePrompt] = useState<NamePromptState>(null);
  const [nameInput, setNameInput] = useState('');
  const [expandedTrack, setExpandedTrack] = useState<TrackId | null>(null);
  const [certGenerated, setCertGenerated] = useState<TrackId | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);

  const trackRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    loadProgressFromSupabase().then(remote => {
      if (Object.keys(remote.moduleScores || {}).length > 0 || Object.keys(remote.certIds || {}).length > 0) {
        setProgress(prev => {
          const merged: CertProgress = {
            userName: remote.userName || prev.userName,
            purchased: { ...prev.purchased, ...(remote.purchased || {}) } as Record<TrackId, boolean>,
            moduleScores: { ...prev.moduleScores, ...(remote.moduleScores || {}) },
            completedModules: { ...prev.completedModules, ...(remote.completedModules || {}) },
            certIds: { ...prev.certIds, ...(remote.certIds || {}) } as Record<TrackId, string>,
          };
          saveLocalProgress(merged);
          return merged;
        });
      }
    });
  }, []);

  useEffect(() => {
    saveLocalProgress(progress);
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

  const handleQuizComplete = async (score: number, passed: boolean) => {
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

    await saveModuleResult(progress.userName, trackId, moduleId, score, passed);

    const trackDone = await isTrackComplete(trackId, updated);
    if (passed && trackDone && !updated.certIds[trackId]) {
      const certId = generateCertId();
      updated.certIds = { ...updated.certIds, [trackId]: certId };
      const track = CERT_TRACKS.find(t => t.id === trackId);
      if (track) {
        await saveCertificateRecord(progress.userName, trackId, track.title, certId);
      }
    }

    setProgress(updated);
  };

  const handleQuizClose = () => {
    setActiveQuiz(null);
  };

  const [enrolling, setEnrolling] = useState<TrackId | null>(null);
  const [enrollError, setEnrollError] = useState<TrackId | null>(null);
  const [enrollDebug, setEnrollDebug] = useState<TrackId | null>(null);

  const handleEnroll = async (trackId: TrackId) => {
    setEnrolling(trackId);
    setEnrollError(null);
    setEnrollDebug(trackId);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const appSessionId = getSessionId();

      console.log("Payment button clicked — track:", trackId, "appSessionId:", appSessionId);

      const res = await fetch(`${supabaseUrl}/functions/v1/create-cert-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          trackId,
          price: CERT_PRICE,
          sessionId: appSessionId,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Checkout failed: ${errText}`);
      }

      const data = await res.json();
      console.log("Checkout URL returned from backend:", data?.url);

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setEnrollError(trackId);
    } finally {
      setEnrolling(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackParam = params.get('track') as TrackId | null;
    const isEnrolled = params.get('enrolled') === '1';

    console.log("Certificates page: detected URL params — track:", trackParam, "enrolled:", isEnrolled);

    const openTrack = (id: TrackId, delay = 150) => {
      setExpandedTrack(id);
      console.log("Certificates page: enrolled track selected:", id);
      setTimeout(() => {
        const el = trackRefs.current[id];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, delay);
    };

    const validTrackParam = trackParam && CERT_TRACKS.find(t => t.id === trackParam) ? trackParam : null;

    const applyVerifiedPurchase = (trackToUnlock: TrackId) => {
      console.log('[CertificatesPage] unlock decision: GRANTED for track:', trackToUnlock);
      setProgress(prev => {
        const updated: CertProgress = {
          ...prev,
          purchased: { ...prev.purchased, [trackToUnlock]: true },
        };
        saveLocalProgress(updated);
        return updated;
      });
      openTrack(trackToUnlock, 300);
    };

    const lookupPurchaseByTrack = (trackToCheck: TrackId) => {
      console.log('[CertificatesPage] selected track:', trackToCheck);
      console.log('[CertificatesPage] purchase lookup query: track_id =', trackToCheck);
      supabase
        .from('certificate_purchases')
        .select('track_id')
        .eq('track_id', trackToCheck)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          console.log('[CertificatesPage] purchase lookup result:', data);
          const found = !!data?.track_id;
          console.log('[CertificatesPage] unlock decision:', found ? 'GRANTED' : 'DENIED (no purchase record)');
          if (found) {
            applyVerifiedPurchase(trackToCheck);
          } else {
            openTrack(trackToCheck, 300);
          }
        })
        .catch((err) => {
          console.log('[CertificatesPage] purchase lookup error:', err);
          openTrack(trackToCheck, 300);
        });
    };

    if (isEnrolled && validTrackParam) {
      lookupPurchaseByTrack(validTrackParam);
    } else if (validTrackParam) {
      openTrack(validTrackParam);
    } else {
      loadProgressFromSupabase().then(remote => {
        const purchasedTracks = Object.keys(remote.purchased || {}).filter(
          k => (remote.purchased as Record<string, boolean>)[k]
        ) as TrackId[];
        if (purchasedTracks.length > 0) {
          const fallbackTrack = purchasedTracks[0];
          console.log("Certificates page: no URL params — Supabase fallback track:", fallbackTrack);
          setProgress(prev => {
            const updated: CertProgress = {
              ...prev,
              purchased: { ...prev.purchased, ...(remote.purchased || {}) } as Record<TrackId, boolean>,
            };
            saveLocalProgress(updated);
            return updated;
          });
          openTrack(fallbackTrack, 300);
        }
      });
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
    doc.text('Verify at langaccess.org/verify | hello@langaccess.org | California LEP Compliance Toolkit', W / 2, 395, { align: 'center' });

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
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Certificate Program</h1>
              <p className="text-xs text-slate-500">Professional Spanish Communication</p>
            </div>
          </div>
          {onVerify && (
            <button
              onClick={onVerify}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-400 transition-colors border border-white/10 hover:border-green-500/30 rounded-lg px-3 py-2"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verify Certificate
            </button>
          )}
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

        <div className="max-w-[680px] mx-auto px-0 py-10">
          <p className="text-green-400 text-xs font-semibold tracking-widest uppercase mb-3">
            Why Compliance Certification Matters
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
            See what Title VI compliance looks like in practice.
          </h2>
          <div className="w-full rounded-xl overflow-hidden">
            <iframe
              width="100%"
              style={{ aspectRatio: '16/9', borderRadius: '12px', display: 'block' }}
              src="https://www.youtube.com/embed/K4IN9bEHw80"
              title="LangAccess Compliance Certification"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="mt-4 text-slate-500 text-xs leading-relaxed">
            LangAccess generates audit-ready compliance records that demonstrate your organization meets Title VI language access obligations.
          </p>
        </div>

        {showRecovery && (
          <div className="mb-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
            <p className="text-amber-300 font-semibold text-sm mb-1">Enrollment confirmation pending</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your payment was received but we couldn't automatically verify which track you purchased. Your track will unlock automatically once our payment system finishes processing — this usually takes a few seconds. If your access isn't restored after refreshing, email us at{' '}
              <a href="mailto:hello@langaccess.org" className="text-amber-300 underline">hello@langaccess.org</a>{' '}
              with your payment confirmation and we'll unlock it for you right away.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {CERT_TRACKS.map((track) => {
            const purchased = !!progress.purchased[track.id];
            const completed = CERT_TRACKS.find(t => t.id === track.id)?.modules.every(
              m => !!progress.completedModules[`${track.id}-${m.id}`]
            );
            const certId = progress.certIds[track.id];
            const isExpanded = expandedTrack === track.id;
            const completedCount = track.modules.filter(
              m => !!progress.completedModules[`${track.id}-${m.id}`]
            ).length;

            return (
              <div
                key={track.id}
                ref={el => { trackRefs.current[track.id] = el; }}
                className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden flex flex-col hover:border-white/20 transition-colors"
              >
                <div className={`bg-gradient-to-br ${track.color} p-6`}>
                  <div className="text-4xl mb-3">{track.icon}</div>
                  <h2 className="text-xl font-bold text-white">{track.title}</h2>
                  <p className="text-white/70 text-sm mt-1 leading-relaxed">{track.description}</p>
                  <p className="text-green-300 text-xs mt-2">50 unique questions across 5 workplace modules. Pass at 80% to earn your certificate.</p>
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
                          <div>
                            <button
                              onClick={() => handleEnroll(track.id)}
                              disabled={enrolling === track.id}
                              className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${track.color} text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                              {enrolling === track.id ? 'Redirecting…' : `Enroll — $${CERT_PRICE}`}
                            </button>
                            {enrollDebug === track.id && !enrollError && (
                              <p className="text-center text-green-600 text-xs font-medium mt-1.5">
                                New checkout handler active
                              </p>
                            )}
                            {enrollError === track.id && (
                              <p className="text-center text-red-400 text-xs mt-1.5">
                                Checkout unavailable. Try again or email <a href="mailto:hello@langaccess.org" className="underline">hello@langaccess.org</a>.
                              </p>
                            )}
                            <p className="text-center text-slate-500 text-xs mt-1.5">Less than one hour of interpreter fees</p>
                            <p className="text-center text-slate-600 text-[10px] leading-snug mt-1">Required under Title VI of the Civil Rights Act for organizations receiving federal funding.</p>
                          </div>
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
              { label: '5 Modules', desc: 'Each track includes 5 focused modules covering real workplace scenarios.', highlight: false },
              { label: 'Instant Certificate', desc: 'Pass all modules and download your PDF certificate immediately.', highlight: false },
              { label: 'Verifiable Records', desc: 'Every certificate is stored in our database and verifiable at langaccess.org/verify.', highlight: true },
            ].map(item => (
              <div key={item.label} className={`text-left p-4 rounded-xl border ${item.highlight ? 'bg-green-500/5 border-green-500/20' : 'bg-white/3 border-white/5'}`}>
                {item.highlight ? (
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-400 font-bold text-base">{item.label}</p>
                  </div>
                ) : (
                  <p className="text-green-400 font-bold mb-1">{item.label}</p>
                )}
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
