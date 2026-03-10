import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Eye, X, ChevronDown, ChevronUp, Plus, Trash2, Volume2, Loader2, Filter, Download, ShieldAlert, Users, MessageSquare, HardHat, Star, Maximize2 } from 'lucide-react';
import { Language, Sector, languageData, CustomPhrase, Phrase } from '../data/phrases';
import { Subcategory, subcategoryPhrases, PhraseGroup } from '../data/subcategories';
import { loadCustomPhrases, addCustomPhrase, deleteCustomPhrase } from '../utils/storage';
import { playAudioFromGesture } from '../utils/speech';
import { exportPhrasesToCSV } from '../utils/exportToCSV';
import { supabase } from '../lib/supabase';
import { logInteraction } from '../utils/interactionLog';
import { loadFavorites, addFavorite, removeFavorite, FavoritePhrase } from '../utils/favorites';
import PointAndSpeak from './PointAndSpeak';
import FavoritesPanel from './FavoritesPanel';
import ResponseModePanel from './ResponseModePanel';

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
}

interface PointAndSpeakData {
  english: string;
  translation: string;
}

export default function PhrasesScreen({ language, sector, subcategory, onBack, onOpenConversation, onOpenTalkTogether, onOpenJobSiteTalk }: PhrasesScreenProps) {
  const data = languageData[language];
  const phraseGroups: PhraseGroup[] = subcategoryPhrases[subcategory]?.[language] || [];

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
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${getLanguageCode(language)}`;
      const res = await fetch(url);
      const d = await res.json();
      if (d.responseData?.translatedText) setNewTranslation(d.responseData.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
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
    if (sector === 'education') return 'Show to Student/Parent';
    if (sector === 'construction') return 'Show to Worker';
    return 'Show';
  };

  const getResponseLabel = () => {
    if (sector === 'healthcare') return 'Patient May Respond With';
    if (sector === 'education') return 'Student or Parent May Respond With';
    if (sector === 'construction') return 'Worker May Respond With';
    return 'Responses';
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
    setResponsePanelKey(key);
  }, [language, sector, subcategory]);

  const handleWorkerResponse = (english: string) => {
    setWorkerResponseToast(english);
    setTimeout(() => setWorkerResponseToast(null), 3500);
  };

  const isFav = (english: string): FavoritePhrase | undefined =>
    favorites.find(f => f.phraseEnglish === english && f.language === language);

  const handleToggleFavorite = async (phrase: { english: string; translation: string }, key: string) => {
    setTogglingFavKey(key);
    const existing = isFav(phrase.english);
    if (existing) {
      await removeFavorite(existing.id);
      setFavorites(prev => prev.filter(f => f.id !== existing.id));
    } else {
      const added = await addFavorite({
        language,
        sector,
        subcategory,
        phraseEnglish: phrase.english,
        phraseTranslation: phrase.translation,
      });
      if (added) setFavorites(prev => [added, ...prev]);
    }
    setTogglingFavKey(null);
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
              <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors flex-shrink-0 p-1 -ml-1 rounded-lg hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-800 leading-tight truncate">{data.name} Phrases</h2>
                <p className="text-xs text-slate-400 capitalize mt-0.5 truncate">{sector} · {subcategory.replace(/-/g, ' ')}</p>
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
                  <h3 className="text-base font-bold text-slate-600 border-b-2 border-blue-500 pb-2 uppercase tracking-wide">
                    {group.groupLabel}
                  </h3>
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
                              <p className="text-[15px] font-semibold text-slate-500 leading-snug mb-1">{phrase.english}</p>
                              <p className="text-xl font-bold text-slate-900 leading-tight">{displayTranslation}</p>
                            </div>
                          </button>

                          {/* Action buttons column */}
                          <div className="flex flex-col border-l border-slate-100 w-14">
                            <button
                              onClick={() => setPointAndSpeak({ english: phrase.english, translation: displayTranslation })}
                              className="flex-1 flex items-center justify-center hover:bg-blue-50 transition-colors rounded-tr-2xl group/ps"
                              title="Point & Speak"
                            >
                              <Maximize2 className="w-4 h-4 text-slate-300 group-hover/ps:text-blue-500 transition-colors" />
                            </button>
                            <button
                              onClick={() => handleToggleFavorite({ english: phrase.english, translation: displayTranslation }, phraseId)}
                              disabled={isTogglingFav}
                              className="flex-1 flex items-center justify-center hover:bg-yellow-50 transition-colors border-t border-slate-100 group/fav"
                              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              {isTogglingFav
                                ? <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                                : <Star className={`w-4 h-4 transition-colors ${isFavorited ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300 group-hover/fav:text-yellow-400'}`} />}
                            </button>
                          </div>
                        </div>

                        {/* Show to patient button */}
                        <div className="px-5 pb-4 pt-1 space-y-2">
                          <button
                            onClick={() => setPointAndSpeak({ english: phrase.english, translation: displayTranslation })}
                            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors active:scale-[0.98]"
                          >
                            <Eye className="w-4 h-4" />
                            {getShowToLabel()}
                          </button>
                          {responsePanelKey === phraseId && (
                            <ResponseModePanel
                              language={language}
                              sector={sector}
                              onResponse={handleWorkerResponse}
                              onClose={() => setResponsePanelKey(null)}
                            />
                          )}
                        </div>

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Custom Phrases</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />Add Phrase
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddCustomPhrase} className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">English Phrase</label>
                  <input
                    type="text" value={newEnglish} onChange={e => setNewEnglish(e.target.value)}
                    placeholder="Enter English phrase"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {data.name} Translation
                    {isTranslating && <span className="ml-2 text-xs text-blue-600 italic">Translating...</span>}
                  </label>
                  <input
                    type="text" value={newTranslation} onChange={e => setNewTranslation(e.target.value)}
                    placeholder="Translation will appear automatically"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors">Save</button>
                  <button type="button" onClick={() => { setShowAddForm(false); setNewEnglish(''); setNewTranslation(''); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-semibold transition-colors">Cancel</button>
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
                      title="Point & Speak"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomPhrase(phrase.id)}
                      className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-900 text-center leading-relaxed">
              <strong>Disclaimer:</strong> This app is a communication aid only. For certified interpretation, contact your institutional interpreter service.
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

      {showSuccessToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 text-sm font-medium">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Phrase saved successfully
        </div>
      )}

      {workerResponseToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex flex-col items-center gap-1 min-w-[200px] text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">They responded</span>
          <span className="text-2xl font-black text-white">{workerResponseToast}</span>
        </div>
      )}

      {showFavoritesPanel && (
        <FavoritesPanel onClose={() => setShowFavoritesPanel(false)} />
      )}
    </>
  );
}
