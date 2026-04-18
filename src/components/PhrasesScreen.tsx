import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Eye, X, ChevronDown, ChevronUp, Plus, Trash2, Volume2, Loader2, Filter, Download, ShieldAlert, Users, MessageSquare, HardHat, Star, Maximize2, Mic, MicOff, Share2, Monitor, Award } from 'lucide-react';
import { Language, Sector, languageData, CustomPhrase, Phrase } from '../data/phrases';
import { Subcategory, subcategoryPhrases, outreachPhrases, hospitalityPhrases, warehousePhrases, propertyManagementPhrases, agriculturePhrases, PhraseGroup } from '../data/subcategories';
import { loadCustomPhrases, addCustomPhrase, deleteCustomPhrase } from '../utils/storage';
import { playAudioFromGesture } from '../utils/speech';
import { exportPhrasesToCSV } from '../utils/exportToCSV';
import { supabase } from '../lib/supabase';
import { logInteraction } from '../utils/interactionLog';
import { loadFavorites, addFavorite, removeFavorite, linkFavoritesToEmail, FavoritePhrase } from '../utils/favorites';
import { addExploredPhrase } from '../utils/educationMastery';
import { recordMasteryEvent } from '../utils/masteryTracking';
import PointAndSpeak from './PointAndSpeak';
import FavoritesPanel from './FavoritesPanel';
import ResponseModePanel from './ResponseModePanel';
import EmailCaptureModal from './EmailCaptureModal';
import ShowScreenOverlay from './ShowScreenOverlay';

const EMAIL_CAPTURED_KEY = 'langaccess_email_captured';
const EMAIL_MODAL_DISMISSED_KEY = 'langaccess_email_modal_dismissed';
const PHRASE_REQUEST_HREF = 'mailto:LangAccessInfo@gmail.com?subject=LangAccess%20Phrase%20Request&body=Sector:%0A%20Situation:%0A%20Phrase%20needed:%0A%20Language:%0A%20Optional%20context:';

const DEFAULT_REVIEWED_BY = 'LangAccess Editorial Review';
const DEFAULT_VERSION = '1.0';
const DEFAULT_LAST_REVIEWED = '2026-02-24';

interface PhrasesScreenProps {
  language: Language;
  sector: Sector;
  subcategory: Subcategory;
  onBack: () => void;
  onOpenConversation?: () => void;
  onOpenTalkTogether?: () => void;
  onOpenJobSiteTalk?: () => void;
  onOpenCertificates?: () => void;
}

interface PointAndSpeakData {
  english: string;
  translation: string;
}

export default function PhrasesScreen({ language, sector, subcategory, onBack, onOpenConversation, onOpenTalkTogether, onOpenJobSiteTalk, onOpenCertificates }: PhrasesScreenProps) {
  const data = languageData[language];
  const allPhraseData = { ...subcategoryPhrases, ...outreachPhrases, ...hospitalityPhrases, ...warehousePhrases, ...propertyManagementPhrases, ...agriculturePhrases };
  const phraseGroups: PhraseGroup[] = allPhraseData[subcategory]?.[language] || [];

  const [fullscreenTranslation, setFullscreenTranslation] = useState<string | null>(null);
  const [expandedPhrases, setExpandedPhrases] = useState<Set<string>>(new Set());
  const [customPhrases, setCustomPhrases] = useState<CustomPhrase[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEnglish, setNewEnglish] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [vitalOnly, setVitalOnly] = useState(false);
  const [chineseScript, setChineseScript] = useState<'traditional' | 'simplified'>('traditional');
  const [loadingAudioKey, setLoadingAudioKey] = useState<string | null>(null);
  const [pointAndSpeak, setPointAndSpeak] = useState<PointAndSpeakData | null>(null);
  const [favorites, setFavorites] = useState<FavoritePhrase[]>([]);
  const [togglingFavKey, setTogglingFavKey] = useState<string | null>(null);
  const [showFavoritesPanel, setShowFavoritesPanel] = useState(false);
  const [responsePanelKey, setResponsePanelKey] = useState<string | null>(null);
  const [workerResponseToast, setWorkerResponseToast] = useState<string | null>(null);
  const [emailModalPending, setEmailModalPending] = useState<{ english: string; translation: string; key: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState(false);
  const [showScreen, setShowScreen] = useState<{ english: string; translation: string } | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const isChineseLang = language === 'mandarin' || language === 'cantonese';

  useEffect(() => {
    const testConnection = async () => {
      if (!supabase) { setDbStatus('error'); return; }
      try {
        const { error } = await supabase.from('custom_phrases').select('count').limit(1);
        setDbStatus(error ? 'error' : 'connected');
      } catch { setDbStatus('error'); }
    };
    testConnection();
  }, []);

  useEffect(() => {
    loadCustomPhrases(language, sector, subcategory).then(setCustomPhrases);
  }, [language, sector, subcategory]);

  useEffect(() => {
    loadFavorites().then(setFavorites);
  }, []);

  useEffect(() => {
    const toRecord: string[] = [];
    for (const group of phraseGroups) {
      for (const p of group.phrases) {
        const id = p.english;
        if (!id || seenMasteryRef.current.has(id)) continue;
        seenMasteryRef.current.add(id);
        toRecord.push(id);
      }
    }
    if (toRecord.length === 0) return;
    const timer = setTimeout(() => {
      toRecord.forEach(id => {
        recordMasteryEvent({ phraseId: id, level: 1, sector, language });
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [phraseGroups, sector, language]);

  useEffect(() => {
    if (!newEnglish.trim() || !showAddForm) return;
    const timer = setTimeout(() => translateText(newEnglish), 1000);
    return () => clearTimeout(timer);
  }, [newEnglish, showAddForm, language]);

  const getLanguageCode = (lang: Language): string => {
    const codes: Record<Language, string> = {
      spanish: 'es', tagalog: 'tl', vietnamese: 'vi',
      mandarin: 'zh-CN', cantonese: 'zh-TW', hmong: 'hmn', korean: 'ko', arabic: 'ar',
    };
    return codes[lang];
  };

  const translateText = async (text: string) => {
    if (!text.trim()) return;
    setIsTranslating(true);
    setTranslationError(false);
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${getLanguageCode(language)}`;
      const res = await fetch(url);
      const d = await res.json();
      if (d.responseData?.translatedText) {
        setNewTranslation(d.responseData.translatedText);
        setTranslationError(false);
      } else {
        setTranslationError(true);
      }
    } catch {
      setTranslationError(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const getDisplayTranslation = (phrase: Phrase): string => {
    if (!isChineseLang || !phrase.translations) return phrase.translation;
    if (chineseScript === 'simplified') return phrase.translations.zh_simplified || phrase.translation;
    return phrase.translations.zh_traditional || phrase.translation;
  };

  const getShowToLabel = () => {
    if (sector === 'healthcare') return 'Show to Patient';
    if (sector === 'education') return 'Show Translation';
    if (sector === 'construction') return 'Show to Worker';
    return 'Show';
  };

  const getResponseLabel = () => {
    if (sector === 'healthcare') return 'Patient May Respond With';
    if (sector === 'education') return 'Student or Parent May Respond With';
    if (sector === 'construction') return 'Worker May Respond With';
    return 'Responses';
  };

  const getGroupHelperText = (label: string): string | null => {
    const map: Record<string, string> = {
      'Notifying Parent of Incident': 'Use these phrases when contacting parents about student behavior or incidents.',
      'Daily Communication': 'Everyday phrases for communicating with students and families.',
      'Attendance and Tardiness': 'Use these when discussing attendance issues with parents.',
      'Academic Performance': 'Phrases for talking about grades, progress, and academic concerns.',
      'Meeting and Conferences': 'Use these to schedule or conduct parent-teacher meetings.',
      'Special Needs and Accommodations': 'Phrases for discussing special education services and accommodations.',
      'Behavior and Discipline': 'Use these when addressing behavioral issues with students or families.',
      'Emergency and Safety': 'Critical phrases for safety and emergency situations at school.',
      'Homework and Assignments': 'Phrases for explaining homework expectations to parents.',
      'Enrollment and Registration': 'Use these during the enrollment or registration process.',
      'Health and Medical': 'Phrases for health-related communications with parents.',
      'Parent Rights and Resources': 'Use these to inform parents of their rights and available resources.',
      'Pain Assessment': 'Use these to identify where and how much a patient is hurting.',
      'Medical History': 'Use these to gather background health information from the patient.',
      'Consent and Procedures': 'Use these when explaining procedures or asking for consent.',
      'Discharge Instructions': 'Use these when explaining post-visit care to a patient.',
      'Mental Health Check-In': 'Use these to open a conversation about emotional wellbeing.',
      'Safety Planning': 'Critical phrases for assessing and planning around safety risks.',
      'Dental Examination': 'Use these during routine dental checks or cleanings.',
      'Safety Instructions': 'Use these to communicate safety rules and requirements on site.',
      'OSHA Compliance': 'Phrases for discussing required safety standards and compliance.',
      'Injury Response': 'Use these immediately when a worker is hurt or needs medical attention.',
      'General Worksite': 'Everyday communication phrases for the job site.',
      'Shelter Intake': 'Use these when checking in guests at a shelter or intake facility.',
      'Food Assistance': 'Phrases for food distribution or pantry intake situations.',
      'Medical Help': 'Use these to assess or refer someone for medical care.',
      'Safety and Crisis': 'Critical phrases for assessing immediate danger or crisis situations.',
    };
    return map[label] ?? null;
  };

  const getFilteredGroups = (): PhraseGroup[] => {
    if (!vitalOnly) return phraseGroups;
    return phraseGroups
      .map(g => ({ ...g, phrases: g.phrases.filter((p: Phrase) => p.isVital === true) }))
      .filter(g => g.phrases.length > 0);
  };

  const getReviewMetadata = () => {
    const first = phraseGroups[0]?.phrases[0];
    return {
      reviewedBy: first?.reviewedBy || DEFAULT_REVIEWED_BY,
      lastReviewed: first?.lastReviewed || DEFAULT_LAST_REVIEWED,
      version: first?.version || DEFAULT_VERSION,
    };
  };

  const seenMasteryRef = useRef<Set<string>>(new Set());

  const handlePlay = useCallback((text: string, key: string, english?: string) => {
    setLoadingAudioKey(key);
    playAudioFromGesture(text, language);
    setTimeout(() => setLoadingAudioKey(null), 2500);
    logInteraction({
      language,
      sector,
      subcategory,
      phraseEnglish: english || text,
      phraseTranslation: text,
    });
    recordMasteryEvent({
      phraseId: english || text,
      level: 2,
      sector,
      language,
    });
    setResponsePanelKey(key);

    if (sector === 'education' && english) {
      addExploredPhrase(english);
    }
  }, [language, sector, subcategory]);

  const handleWorkerResponse = (english: string) => {
    setWorkerResponseToast(english);
    setTimeout(() => setWorkerResponseToast(null), 3500);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition as typeof globalThis.SpeechRecognition | undefined
      ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition as typeof globalThis.SpeechRecognition | undefined;
    if (!SpeechRecognition) {
      setVoiceError('Voice input not available');
      setTimeout(() => setVoiceError(null), 3000);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    setVoiceError(null);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setNewEnglish(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceError('Voice input not available');
      setTimeout(() => setVoiceError(null), 3000);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const isFav = (english: string): FavoritePhrase | undefined =>
    favorites.find(f => f.phraseEnglish === english && f.language === language);

  const doAddFavorite = async (phrase: { english: string; translation: string }, key: string) => {
    setTogglingFavKey(key);
    const added = await addFavorite({
      language,
      sector,
      subcategory,
      phraseEnglish: phrase.english,
      phraseTranslation: phrase.translation,
    });
    if (added) setFavorites(prev => [added, ...prev]);
    setTogglingFavKey(null);
  };

  const handleToggleFavorite = async (phrase: { english: string; translation: string }, key: string) => {
    const existing = isFav(phrase.english);
    if (existing) {
      setTogglingFavKey(key);
      await removeFavorite(existing.id);
      setFavorites(prev => prev.filter(f => f.id !== existing.id));
      setTogglingFavKey(null);
      return;
    }
    const emailCaptured = localStorage.getItem(EMAIL_CAPTURED_KEY);
    const modalDismissed = sessionStorage.getItem(EMAIL_MODAL_DISMISSED_KEY);
    if (!emailCaptured && !modalDismissed) {
      setEmailModalPending({ english: phrase.english, translation: phrase.translation, key });
      return;
    }
    await doAddFavorite(phrase, key);
  };

  const handleEmailSave = async (email: string) => {
    localStorage.setItem(EMAIL_CAPTURED_KEY, email);
    await linkFavoritesToEmail(email);
    setEmailModalPending(null);
    if (emailModalPending) await doAddFavorite(emailModalPending, emailModalPending.key);
  };

  const handleEmailDismiss = async () => {
    sessionStorage.setItem(EMAIL_MODAL_DISMISSED_KEY, '1');
    const pending = emailModalPending;
    setEmailModalPending(null);
    if (pending) await doAddFavorite(pending, pending.key);
  };

  const handleShare = async (english: string, translation: string) => {
    const text = `${translation}\n\n${english}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // user cancelled — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setShareToast('Phrase copied — paste into your message.');
        setTimeout(() => setShareToast(null), 3000);
      } catch {
        setShareToast('Unable to copy. Please copy manually.');
        setTimeout(() => setShareToast(null), 3000);
      }
    }
  };

  const toggleExpanded = (id: string) => {
    const s = new Set(expandedPhrases);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedPhrases(s);
  };

  const handleAddCustomPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnglish.trim() || !newTranslation.trim()) return;
    const newPhrase = await addCustomPhrase({ english: newEnglish.trim(), translation: newTranslation.trim(), language, sector, subcategory });
    if (newPhrase) {
      setCustomPhrases([newPhrase, ...customPhrases]);
      setNewEnglish(''); setNewTranslation(''); setShowAddForm(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      handlePlay(newPhrase.translation, `custom-${newPhrase.id}`, newPhrase.english);
    }
  };

  const handleDeleteCustomPhrase = async (id: string) => {
    if (await deleteCustomPhrase(id)) setCustomPhrases(customPhrases.filter(p => p.id !== id));
  };

  const filteredGroups = getFilteredGroups();
  const meta = getReviewMetadata();

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        {dbStatus === 'error' && (
          <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
            Database connection failed. Custom phrases will not work.
          </div>
        )}
        {dbStatus === 'checking' && (
          <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm">
            Connecting to database...
          </div>
        )}

        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <button onClick={onBack} aria-label="Go back" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors flex-shrink-0 p-1 -ml-1 rounded-lg hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-800 leading-tight truncate">{data.name} Phrases</h2>
                <p className="text-xs text-slate-400 mt-0.5 truncate capitalize">
                  {sector} <span className="mx-0.5">›</span> {subcategory.replace(/-/g, ' ')} <span className="mx-0.5">›</span> {data.name}
                </p>
              </div>
              <button
                onClick={() => setShowFavoritesPanel(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 text-yellow-700 text-xs font-semibold transition-colors flex-shrink-0"
              >
                <Star className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'fill-yellow-500 text-yellow-500' : 'text-yellow-500'}`} />
                {favorites.length > 0 ? `My Phrases (${favorites.length})` : 'My Phrases'}
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {isChineseLang && (
                <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs font-medium flex-shrink-0">
                  <button
                    onClick={() => setChineseScript('traditional')}
                    className={`px-3 py-2 transition-colors ${chineseScript === 'traditional' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}
                  >Traditional</button>
                  <button
                    onClick={() => setChineseScript('simplified')}
                    className={`px-3 py-2 border-l border-slate-200 transition-colors ${chineseScript === 'simplified' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}
                  >Simplified</button>
                </div>
              )}
              <button
                onClick={() => setVitalOnly(!vitalOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors flex-shrink-0 ${vitalOnly ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {vitalOnly ? 'Vital Only' : 'Vital'}
              </button>
              {onOpenConversation && (
                <button onClick={onOpenConversation} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-shrink-0">
                  <Users className="w-3.5 h-3.5" />Intake
                </button>
              )}
              {onOpenTalkTogether && (
                <button onClick={onOpenTalkTogether} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors flex-shrink-0">
                  <MessageSquare className="w-3.5 h-3.5" />Talk Together
                </button>
              )}
              {onOpenJobSiteTalk && (
                <button onClick={onOpenJobSiteTalk} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700 transition-colors flex-shrink-0">
                  <HardHat className="w-3.5 h-3.5" />Job Site
                </button>
              )}
              {phraseGroups.length > 0 && (
                <button onClick={() => exportPhrasesToCSV(getFilteredGroups(), language, sector, subcategory)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0">
                  <Download className="w-3.5 h-3.5" />CSV
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6 pb-12">
          {phraseGroups.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center mb-8">
              <p className="text-base text-yellow-900 mb-2 font-bold">Content Coming Soon</p>
              <p className="text-yellow-800 text-sm">Phrases for this language are being developed. Try Spanish for full coverage.</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center mb-8">
              <Filter className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <p className="text-base text-blue-900 font-bold mb-1">No vital phrases here</p>
              <button onClick={() => setVitalOnly(false)} className="text-sm text-blue-600 hover:underline">Show all phrases</button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                  <div className="border-b-2 border-blue-500 pb-2">
                    <h3 className="text-base font-bold text-slate-600 uppercase tracking-wide">
                      {group.groupLabel}
                    </h3>
                    {getGroupHelperText(group.groupLabel) && (
                      <p className="text-xs text-slate-400 mt-0.5">{getGroupHelperText(group.groupLabel)}</p>
                    )}
                  </div>
                  {group.phrases.map((phrase, phraseIndex) => {
                    const phraseId = `${groupIndex}-${phraseIndex}`;
                    const isExpanded = expandedPhrases.has(phraseId);
                    const displayTranslation = getDisplayTranslation(phrase);
                    const isLoading = loadingAudioKey === phraseId;
                    const favEntry = isFav(phrase.english);
                    const isFavorited = !!favEntry;
                    const isTogglingFav = togglingFavKey === phraseId;

                    return (
                      <div
                        key={phraseId}
                        className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border ${phrase.isVital ? 'border-red-200 ring-1 ring-red-200' : 'border-slate-100'}`}
                      >
                        {phrase.isVital && (
                          <div className="px-4 pt-3 pb-0 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Vital Phrase</span>
                          </div>
                        )}

                        {/* Main audio button row */}
                        <div className="flex items-stretch">
                          <button
                            onClick={() => handlePlay(displayTranslation, phraseId, phrase.english)}
                            disabled={isLoading}
                            className="flex items-center gap-4 p-5 flex-1 text-left group active:bg-slate-50 transition-colors min-w-0"
                          >
                            <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-150 shadow-sm
                              ${isLoading
                                ? 'bg-blue-100'
                                : 'bg-blue-600 group-hover:bg-blue-700 group-active:scale-95 shadow-blue-200'}`}>
                              {isLoading
                                ? <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                : <Volume2 className="w-6 h-6 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[17px] font-semibold text-slate-500 leading-snug mb-1">{phrase.english}</p>
                              <p className="text-xl font-bold text-slate-900 leading-tight">{displayTranslation}</p>
                            </div>
                          </button>

                          {/* Action buttons column */}
                          <div className="flex flex-col border-l border-slate-100 w-14">
                            <button
                              onClick={() => setPointAndSpeak({ english: phrase.english, translation: displayTranslation })}
                              className="flex-1 flex items-center justify-center hover:bg-blue-50 transition-colors rounded-tr-2xl group/ps"
                              aria-label="Point and Speak — show fullscreen"
                              title="Point & Speak"
                            >
                              <Maximize2 className="w-4 h-4 text-slate-300 group-hover/ps:text-blue-500 transition-colors" />
                            </button>
                            <button
                              onClick={() => handleToggleFavorite({ english: phrase.english, translation: displayTranslation }, phraseId)}
                              disabled={isTogglingFav}
                              className="flex-1 flex items-center justify-center hover:bg-yellow-50 transition-colors border-t border-slate-100 group/fav"
                              aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              {isTogglingFav
                                ? <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                                : <Star className={`w-4 h-4 transition-colors ${isFavorited ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300 group-hover/fav:text-yellow-400'}`} />}
                            </button>
                            <button
                              onClick={() => handleShare(phrase.english, displayTranslation)}
                              className="flex-1 flex items-center justify-center hover:bg-green-50 transition-colors border-t border-slate-100 group/share"
                              aria-label="Share phrase"
                              title="Share phrase"
                            >
                              <Share2 className="w-4 h-4 text-slate-300 group-hover/share:text-green-500 transition-colors" />
                            </button>
                          </div>
                        </div>

                        {/* Show to patient / Show Screen buttons */}
                        <div className="px-5 pb-4 pt-1 space-y-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPointAndSpeak({ english: phrase.english, translation: displayTranslation })}
                              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors active:scale-[0.98]"
                            >
                              <Eye className="w-4 h-4" />
                              {getShowToLabel()}
                            </button>
                            <button
                              onClick={() => setShowScreen({ english: phrase.english, translation: displayTranslation })}
                              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 px-4 py-3 rounded-xl text-sm font-semibold transition-colors active:scale-[0.98] flex-shrink-0"
                              aria-label="Show Screen Mode — display phrase in large text"
                              title="Show Screen Mode"
                            >
                              <Monitor className="w-4 h-4" />
                              Show Screen
                            </button>
                          </div>
                          {sector === 'education' && (
                            <button
                              onClick={() => handleShare(phrase.english, displayTranslation)}
                              className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 border border-blue-200 px-4 py-3 rounded-xl text-sm font-semibold transition-colors active:scale-[0.98]"
                              aria-label="Send this phrase to a parent"
                            >
                              <Share2 className="w-4 h-4" />
                              Send to Parent
                            </button>
                          )}
                          {responsePanelKey === phraseId && (
                            <ResponseModePanel
                              language={language}
                              sector={sector}
                              onResponse={handleWorkerResponse}
                              onClose={() => setResponsePanelKey(null)}
                            />
                          )}
                        </div>

                        {phrase.responses.length === 0 && (
                          <div className="border-t border-slate-100 px-5 py-2.5">
                            <span className="text-xs text-slate-400">See possible responses</span>
                          </div>
                        )}

                        {/* Quick Reply Buttons */}
                        {phrase.responses.length > 0 && (
                          <div className="border-t border-slate-100">
                            <button
                              onClick={() => toggleExpanded(phraseId)}
                              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                {getResponseLabel()}
                              </span>
                              {isExpanded
                                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                                : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-4 pt-1">
                                {/* Full response cards */}
                                <div className="space-y-2">
                                  {phrase.responses.map((response, rIdx) => {
                                    const rKey = `${phraseId}-r${rIdx}`;
                                    const isRLoading = loadingAudioKey === rKey;
                                    return (
                                      <button
                                        key={rIdx}
                                        onClick={() => handlePlay(response.translation, rKey, response.english)}
                                        disabled={isRLoading}
                                        className="w-full flex items-center gap-4 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl p-4 text-left transition-colors active:scale-[0.98]"
                                      >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isRLoading ? 'bg-blue-100' : 'bg-slate-700'}`}>
                                          {isRLoading
                                            ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                            : <Volume2 className="w-4 h-4 text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[13px] font-medium text-slate-500 leading-snug">{response.english}</p>
                                          <p className="text-base font-bold text-slate-900 leading-tight mt-0.5">{response.translation}</p>
                                          {response.pronunciation && (
                                            <p className="text-xs text-slate-400 italic mt-0.5">[{response.pronunciation}]</p>
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Custom Phrases */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Custom Phrases</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add phrases you use often.</p>
              </div>
              <button
                onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) { setNewEnglish(''); setNewTranslation(''); setTranslationError(false); } }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
              >
                <Plus className="w-4 h-4" />Add Phrase
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Can't find the phrase you need?{' '}
              <a href={PHRASE_REQUEST_HREF} className="text-blue-500 hover:underline font-medium">Request it here.</a>
              {' '}We use your suggestions to improve future phrase packs.
            </p>

            {showAddForm && (
              <form onSubmit={handleAddCustomPhrase} className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">English Phrase</label>
                  <div className="relative flex items-center gap-2">
                    <input
                      type="text" value={newEnglish} onChange={e => setNewEnglish(e.target.value)}
                      placeholder={isListening ? 'Listening...' : 'Enter English phrase'}
                      autoCapitalize="sentences"
                      autoCorrect="on"
                      spellCheck={true}
                      maxLength={300}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${isListening ? 'border-blue-400 bg-blue-50 placeholder:text-blue-500' : 'border-slate-300'}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={isListening}
                      aria-label={isListening ? 'Listening' : 'Speak phrase'}
                      className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${isListening ? 'bg-blue-100 border-blue-300 text-blue-600 animate-pulse' : 'bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                    >
                      {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                  </div>
                  {voiceError && (
                    <p className="mt-1 text-xs text-amber-600">{voiceError}</p>
                  )}
                  {isListening && (
                    <p className="mt-1 text-xs text-blue-600">Listening... speak your phrase now</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {data.name} Translation
                    {isTranslating && <span className="ml-2 text-xs text-blue-600 italic">Translating...</span>}
                  </label>
                  <input
                    type="text" value={newTranslation} onChange={e => { setNewTranslation(e.target.value); setTranslationError(false); }}
                    placeholder={translationError ? 'Enter translation manually' : 'Translation will appear automatically'}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={300}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${translationError ? 'border-amber-300 bg-amber-50' : 'border-slate-300'}`}
                    required
                  />
                  {translationError && (
                    <p className="mt-1 text-xs text-amber-600">Auto-translation unavailable — please enter the translation manually.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors">Save</button>
                  <button
                    type="button"
                    onClick={() => {
                      if ((newEnglish.trim() || newTranslation.trim()) && !window.confirm('Discard this phrase?')) return;
                      setShowAddForm(false);
                      setNewEnglish('');
                      setNewTranslation('');
                      setTranslationError(false);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {customPhrases.length > 0 ? (
              <div className="space-y-3">
                {customPhrases.map(phrase => (
                  <div key={phrase.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 pr-3">
                    <button
                      onClick={() => handlePlay(phrase.translation, `custom-${phrase.id}`, phrase.english)}
                      disabled={loadingAudioKey === `custom-${phrase.id}`}
                      className="flex items-center gap-4 p-4 flex-1 text-left group hover:bg-slate-50 rounded-2xl transition-colors"
                    >
                      <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl transition-colors ${loadingAudioKey === `custom-${phrase.id}` ? 'bg-blue-100' : 'bg-blue-600 group-hover:bg-blue-700'}`}>
                        {loadingAudioKey === `custom-${phrase.id}` ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin" /> : <Volume2 className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-800 leading-snug">{phrase.english}</p>
                        <p className="text-base font-semibold text-blue-600 mt-1 leading-snug">{phrase.translation}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setPointAndSpeak({ english: phrase.english, translation: phrase.translation })}
                      className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Point and Speak — show fullscreen"
                      title="Point & Speak"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomPhrase(phrase.id)}
                      className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete this phrase"
                      title="Delete phrase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <p className="text-slate-400 text-sm">No custom phrases yet. Click "Add Phrase" to create your own.</p>
              </div>
            )}
          </div>

          {/* Request a Phrase CTA */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">Missing a phrase?</p>
              <p className="text-xs text-blue-700 mt-0.5">
                <a href={PHRASE_REQUEST_HREF} className="underline underline-offset-2 hover:text-blue-900 transition-colors">Tell us here</a>
                {' '}— we use your suggestions to build future phrase packs.
              </p>
            </div>
            <a
              href={PHRASE_REQUEST_HREF}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4" />
              Request a Phrase
            </a>
          </div>

          {onOpenCertificates && (
            <div className="mt-4 flex items-center justify-between gap-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <Award className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p className="text-sm text-slate-600">Want to master this?</p>
              </div>
              <button
                onClick={onOpenCertificates}
                className="flex-shrink-0 text-xs font-semibold text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Start Certification
              </button>
            </div>
          )}

          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-900 text-center leading-relaxed">
              <strong>Disclaimer:</strong> This app is a communication aid only. For certified interpretation, contact your institutional interpreter service.
            </p>
            <p className="text-xs text-amber-700 text-center mt-2">
              Questions or feedback?{' '}
              <a href="mailto:LangAccessInfo@gmail.com" className="underline hover:text-amber-900 transition-colors">LangAccessInfo@gmail.com</a>
            </p>
          </div>

          {phraseGroups.length > 0 && (
            <div className="mt-3 p-3 bg-slate-100 rounded-xl">
              <p className="text-xs text-slate-500 text-center">
                Reviewed by <strong>{meta.reviewedBy}</strong> on {meta.lastReviewed} | v{meta.version}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legacy fullscreen (kept for compatibility) */}
      {fullscreenTranslation && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-8 cursor-pointer" onClick={() => setFullscreenTranslation(null)}>
          <button className="absolute top-6 right-6 text-slate-400 hover:text-slate-600" onClick={() => setFullscreenTranslation(null)}>
            <X className="w-12 h-12" />
          </button>
          <p className="text-5xl md:text-7xl font-bold text-blue-700 leading-relaxed text-center px-4">{fullscreenTranslation}</p>
        </div>
      )}

      {/* Point & Speak modal */}
      {pointAndSpeak && (
        <PointAndSpeak
          english={pointAndSpeak.english}
          translation={pointAndSpeak.translation}
          language={language}
          onClose={() => setPointAndSpeak(null)}
        />
      )}

      {/* Show Screen overlay */}
      {showScreen && (
        <ShowScreenOverlay
          english={showScreen.english}
          translation={showScreen.translation}
          language={language}
          onClose={() => setShowScreen(null)}
        />
      )}

      {showSuccessToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 text-sm font-medium">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Phrase saved successfully
        </div>
      )}

      {shareToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 text-sm font-medium whitespace-nowrap">
          <Share2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          {shareToast}
        </div>
      )}

      {workerResponseToast && (
        <div className="safe-bottom-fixed left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-1 min-w-[200px] text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">They responded</span>
          <span className="text-2xl font-black text-white">{workerResponseToast}</span>
        </div>
      )}

      {showFavoritesPanel && (
        <FavoritesPanel onClose={() => setShowFavoritesPanel(false)} />
      )}

      {emailModalPending && (
        <EmailCaptureModal
          sector={sector}
          phrase={emailModalPending.english}
          onSave={handleEmailSave}
          onDismiss={handleEmailDismiss}
        />
      )}
    </>
  );
}
