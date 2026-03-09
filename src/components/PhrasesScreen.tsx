import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Eye, X, ChevronDown, ChevronUp, Plus, Trash2, Volume2, Loader2, Filter, Download, ShieldAlert, Users, MessageSquare, HardHat } from 'lucide-react';
import { Language, Sector, languageData, CustomPhrase, Phrase } from '../data/phrases';
import { Subcategory, subcategoryPhrases, PhraseGroup } from '../data/subcategories';
import { loadCustomPhrases, addCustomPhrase, deleteCustomPhrase } from '../utils/storage';
import { playAudioFromGesture } from '../utils/speech';
import { exportPhrasesToCSV } from '../utils/exportToCSV';
import { supabase } from '../lib/supabase';

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

  const handlePlay = useCallback((text: string, key: string) => {
    setLoadingAudioKey(key);
    playAudioFromGesture(text, language);
    setTimeout(() => setLoadingAudioKey(null), 2500);
  }, [language]);

  const isChineseLang = language === 'mandarin' || language === 'cantonese';

  useEffect(() => {
    const testConnection = async () => {
      if (!supabase) {
        setDbStatus('error');
        return;
      }
      try {
        const { error } = await supabase.from('custom_phrases').select('count').limit(1);
        setDbStatus(error ? 'error' : 'connected');
      } catch {
        setDbStatus('error');
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    const loadPhrases = async () => {
      const loaded = await loadCustomPhrases(language, sector, subcategory);
      setCustomPhrases(loaded);
    };
    loadPhrases();
  }, [language, sector, subcategory]);

  useEffect(() => {
    if (!newEnglish.trim() || !showAddForm) {
      return;
    }

    const timer = setTimeout(async () => {
      await translateText(newEnglish);
    }, 1000);

    return () => clearTimeout(timer);
  }, [newEnglish, showAddForm, language]);

  const getLanguageCode = (lang: Language): string => {
    const codes: Record<Language, string> = {
      spanish: 'es',
      tagalog: 'tl',
      vietnamese: 'vi',
      mandarin: 'zh-CN',
      cantonese: 'zh-TW',
      hmong: 'hmn',
      korean: 'ko',
      arabic: 'ar',
    };
    return codes[lang];
  };

  const translateText = async (text: string) => {
    if (!text.trim()) return;

    setIsTranslating(true);
    try {
      const targetLang = getLanguageCode(language);
      const encodedText = encodeURIComponent(text);
      const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;

      const response = await fetch(url);
      const responseData = await response.json();

      if (responseData.responseData && responseData.responseData.translatedText) {
        setNewTranslation(responseData.responseData.translatedText);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const getDisplayTranslation = (phrase: Phrase): string => {
    if (!isChineseLang || !phrase.translations) return phrase.translation;
    if (chineseScript === 'simplified') {
      return phrase.translations.zh_simplified || phrase.translation;
    }
    return phrase.translations.zh_traditional || phrase.translation;
  };

  const getShowToLabel = () => {
    switch (sector) {
      case 'healthcare': return 'Show to Patient';
      case 'education': return 'Show to Student/Parent';
      case 'construction': return 'Show to Worker';
      default: return 'Show';
    }
  };

  const getResponseLabel = () => {
    switch (sector) {
      case 'healthcare': return 'Patient May Respond With';
      case 'education': return 'Student or Parent May Respond With';
      case 'construction': return 'Worker May Respond With';
      default: return 'Responses';
    }
  };

  const getFilteredGroups = (): PhraseGroup[] => {
    if (!vitalOnly) return phraseGroups;
    return phraseGroups.map(group => ({
      ...group,
      phrases: group.phrases.filter((p: Phrase) => p.isVital === true),
    })).filter(group => group.phrases.length > 0);
  };

  const getReviewMetadata = () => {
    const firstPhrase: Phrase | undefined = phraseGroups[0]?.phrases[0];
    return {
      reviewedBy: firstPhrase?.reviewedBy || DEFAULT_REVIEWED_BY,
      lastReviewed: firstPhrase?.lastReviewed || DEFAULT_LAST_REVIEWED,
      version: firstPhrase?.version || DEFAULT_VERSION,
    };
  };

  const handleShowTranslation = (translation: string) => {
    setFullscreenTranslation(translation);
  };

  const handleDismissFullscreen = () => {
    setFullscreenTranslation(null);
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedPhrases);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPhrases(newExpanded);
  };

  const handleAddCustomPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEnglish.trim() && newTranslation.trim()) {
      const newPhrase = await addCustomPhrase({
        english: newEnglish.trim(),
        translation: newTranslation.trim(),
        language,
        sector,
        subcategory,
      });
      if (newPhrase) {
        setCustomPhrases([newPhrase, ...customPhrases]);
        setNewEnglish('');
        setNewTranslation('');
        setShowAddForm(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
        handlePlay(newPhrase.translation, `custom-${newPhrase.id}`);
      }
    }
  };

  const handleDeleteCustomPhrase = async (id: string) => {
    const success = await deleteCustomPhrase(id);
    if (success) {
      setCustomPhrases(customPhrases.filter(p => p.id !== id));
    }
  };

  const handleExportCSV = () => {
    exportPhrasesToCSV(getFilteredGroups(), language, sector, subcategory);
  };

  const filteredGroups = getFilteredGroups();
  const meta = getReviewMetadata();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {dbStatus === 'error' && (
          <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
            Database connection failed. Custom phrases will not work. Check console for details.
          </div>
        )}
        {dbStatus === 'checking' && (
          <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm">
            Connecting to database...
          </div>
        )}
        <div className="sticky top-0 bg-white shadow-md z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Back</span>
            </button>
            <div className="flex items-start justify-between mt-3 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">{data.name} Phrases</h2>
                <p className="text-sm text-slate-600 mt-1 capitalize">{sector} Sector</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {isChineseLang && (
                  <div className="flex rounded-lg overflow-hidden border border-slate-300 text-sm font-medium">
                    <button
                      onClick={() => setChineseScript('traditional')}
                      className={`px-3 py-1.5 transition-colors ${chineseScript === 'traditional' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                      Traditional
                    </button>
                    <button
                      onClick={() => setChineseScript('simplified')}
                      className={`px-3 py-1.5 transition-colors border-l border-slate-300 ${chineseScript === 'simplified' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                      Simplified
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setVitalOnly(!vitalOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${vitalOnly ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  {vitalOnly ? 'Vital Only' : 'Show Vital Only'}
                </button>
                {onOpenConversation && (
                  <button
                    onClick={onOpenConversation}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-500 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Intake Mode
                  </button>
                )}
                {onOpenTalkTogether && (
                  <button
                    onClick={onOpenTalkTogether}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-500 bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Talk Together
                  </button>
                )}
                {onOpenJobSiteTalk && (
                  <button
                    onClick={onOpenJobSiteTalk}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-orange-500 bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                  >
                    <HardHat className="w-4 h-4" />
                    Job Site Talk
                  </button>
                )}
                {phraseGroups.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 pb-12">
          {phraseGroups.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center mb-8">
              <p className="text-lg text-yellow-900 mb-2">
                <strong>Content Coming Soon</strong>
              </p>
              <p className="text-yellow-800">
                Phrases for this language combination are currently being developed.
                Please check back soon or try Spanish which has complete coverage.
              </p>
              <p className="text-sm text-yellow-700 mt-4">
                <strong>Spanish is 100% complete:</strong> All Healthcare, Education, and Construction phrases available with 20 phrases per subcategory
              </p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center mb-8">
              <Filter className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <p className="text-lg text-blue-900 mb-2">
                <strong>No vital phrases in this category</strong>
              </p>
              <p className="text-blue-700 text-sm">
                No phrases have been marked as vital content in this subcategory yet.
              </p>
              <button
                onClick={() => setVitalOnly(false)}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Show all phrases
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-700 border-b-2 border-blue-500 pb-2">
                    {group.groupLabel}
                  </h3>
                  <div className="space-y-3">
                    {group.phrases.map((phrase, phraseIndex) => {
                      const phraseId = `${groupIndex}-${phraseIndex}`;
                      const isExpanded = expandedPhrases.has(phraseId);
                      const displayTranslation = getDisplayTranslation(phrase);
                      const isLoading = loadingAudioKey === phraseId;
                      return (
                        <div
                          key={phraseId}
                          className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border ${phrase.isVital ? 'border-red-200 ring-1 ring-red-300' : 'border-slate-100'}`}
                        >
                          {phrase.isVital && (
                            <div className="px-4 pt-3 pb-0 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Vital</span>
                            </div>
                          )}

                          {/* Main audio button */}
                          <button
                            onClick={() => handlePlay(displayTranslation, phraseId)}
                            disabled={isLoading}
                            className="w-full p-4 flex items-center gap-4 text-left group hover:bg-slate-50 rounded-t-2xl transition-colors"
                          >
                            <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl transition-colors
                              ${isLoading ? 'bg-blue-100' : 'bg-blue-600 group-hover:bg-blue-700'}`}
                            >
                              {isLoading
                                ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                : <Volume2 className="w-5 h-5 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-bold text-slate-800 leading-snug">{phrase.english}</p>
                              <p className="text-base font-semibold text-blue-600 mt-1 leading-snug">{displayTranslation}</p>
                            </div>
                          </button>

                          {/* Show to patient button for healthcare */}
                          {sector === 'healthcare' && (
                            <div className="px-4 pb-3 pt-0">
                              <button
                                onClick={() => handleShowTranslation(displayTranslation)}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                {getShowToLabel()}
                              </button>
                            </div>
                          )}

                          {/* Expand responses */}
                          <div className="border-t border-slate-100">
                            <button
                              onClick={() => toggleExpanded(phraseId)}
                              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-b-2xl"
                            >
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                {getResponseLabel()}
                              </span>
                              {isExpanded
                                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                                : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {phrase.responses.map((response, responseIndex) => {
                                  const rKey = `${phraseId}-r${responseIndex}`;
                                  return (
                                    <button
                                      key={responseIndex}
                                      onClick={() => handlePlay(response.translation, rKey)}
                                      disabled={loadingAudioKey === rKey}
                                      className="flex items-start gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 text-left transition-colors group"
                                    >
                                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {loadingAudioKey === rKey
                                          ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                          : <Volume2 className="w-4 h-4 text-blue-600" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-blue-700 leading-snug">{response.translation}</p>
                                        <p className="text-xs text-slate-500 italic mt-0.5">[{response.pronunciation}]</p>
                                        <p className="text-xs text-slate-600 mt-0.5">{response.english}</p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Custom Phrases</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Phrase
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddCustomPhrase} className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      English Phrase
                    </label>
                    <input
                      type="text"
                      value={newEnglish}
                      onChange={(e) => setNewEnglish(e.target.value)}
                      placeholder="Enter English phrase"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {data.name} Translation
                      {isTranslating && (
                        <span className="ml-2 text-xs text-blue-600 italic">Translating...</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={newTranslation}
                      onChange={(e) => setNewTranslation(e.target.value)}
                      placeholder="Translation will appear automatically"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Save Phrase
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewEnglish('');
                        setNewTranslation('');
                      }}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {customPhrases.length > 0 ? (
              <div className="space-y-3">
                {customPhrases.map((phrase) => (
                  <div
                    key={phrase.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-3 pr-3"
                  >
                    <button
                      onClick={() => handlePlay(phrase.translation, `custom-${phrase.id}`)}
                      disabled={loadingAudioKey === `custom-${phrase.id}`}
                      className="flex items-center gap-4 p-4 flex-1 text-left group hover:bg-slate-50 rounded-2xl transition-colors"
                    >
                      <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl transition-colors
                        ${loadingAudioKey === `custom-${phrase.id}` ? 'bg-blue-100' : 'bg-blue-600 group-hover:bg-blue-700'}`}
                      >
                        {loadingAudioKey === `custom-${phrase.id}`
                          ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          : <Volume2 className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-800 leading-snug">{phrase.english}</p>
                        <p className="text-base font-semibold text-blue-600 mt-1 leading-snug">{phrase.translation}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteCustomPhrase(phrase.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Delete phrase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-slate-500">
                  No custom phrases yet. Click "Add Phrase" to create your own translations.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900 text-center leading-relaxed">
              <strong>Disclaimer:</strong> This app is a communication aid only. For certified interpretation, contact your institutional interpreter service.
            </p>
          </div>

          {phraseGroups.length > 0 && (
            <div className="mt-4 p-3 bg-slate-100 border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-500 text-center">
                Content reviewed by <strong>{meta.reviewedBy}</strong> on {meta.lastReviewed} &nbsp;|&nbsp; Version {meta.version}
              </p>
            </div>
          )}
        </div>
      </div>

      {fullscreenTranslation && (
        <div
          className="fixed inset-0 bg-white z-50 flex items-center justify-center p-8 cursor-pointer"
          onClick={handleDismissFullscreen}
        >
          <div className="text-center">
            <button
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={handleDismissFullscreen}
            >
              <X className="w-12 h-12" />
            </button>
            <p className="text-5xl md:text-6xl lg:text-7xl font-bold text-blue-700 leading-relaxed px-4">
              {fullscreenTranslation}
            </p>
            <p className="text-xl text-slate-500 mt-8">Tap anywhere to dismiss</p>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Phrase saved successfully
        </div>
      )}
    </>
  );
}
