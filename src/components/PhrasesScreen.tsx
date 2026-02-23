import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, X, ChevronDown, ChevronUp, Plus, Trash2, Volume2 } from 'lucide-react';
import { Language, Sector, languageData, CustomPhrase } from '../data/phrases';
import { Subcategory, subcategoryPhrases } from '../data/subcategories';
import { loadCustomPhrases, addCustomPhrase, deleteCustomPhrase } from '../utils/storage';
import { speakText, isSpeechSupported } from '../utils/speech';

interface PhrasesScreenProps {
  language: Language;
  sector: Sector;
  subcategory: Subcategory;
  onBack: () => void;
}

export default function PhrasesScreen({ language, sector, subcategory, onBack }: PhrasesScreenProps) {
  const data = languageData[language];
  const phrases = subcategoryPhrases[subcategory]?.[language] || [];
  const [fullscreenTranslation, setFullscreenTranslation] = useState<string | null>(null);
  const [expandedPhrases, setExpandedPhrases] = useState<Set<number>>(new Set());
  const [customPhrases, setCustomPhrases] = useState<CustomPhrase[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEnglish, setNewEnglish] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const loadedPhrases = loadCustomPhrases();
    const filtered = loadedPhrases.filter(p => p.language === language && p.sector === sector && p.subcategory === subcategory);
    setCustomPhrases(filtered);
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
      cantonese: 'zh-TW'
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
      const data = await response.json();

      if (data.responseData && data.responseData.translatedText) {
        setNewTranslation(data.responseData.translatedText);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const getShowToLabel = () => {
    switch (sector) {
      case 'healthcare':
        return 'Show to Patient';
      case 'education':
        return 'Show to Student/Parent';
      case 'construction':
        return 'Show to Worker';
      default:
        return 'Show';
    }
  };

  const getResponseLabel = () => {
    switch (sector) {
      case 'healthcare':
        return 'Patient May Respond With';
      case 'education':
        return 'Student or Parent May Respond With';
      case 'construction':
        return 'Worker May Respond With';
      default:
        return 'Responses';
    }
  };

  const handleShowTranslation = (translation: string) => {
    setFullscreenTranslation(translation);
  };

  const handleDismissFullscreen = () => {
    setFullscreenTranslation(null);
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedPhrases);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPhrases(newExpanded);
  };

  const handleAddCustomPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEnglish.trim() && newTranslation.trim()) {
      const newPhrase = addCustomPhrase({
        english: newEnglish.trim(),
        translation: newTranslation.trim(),
        language,
        sector,
        subcategory,
      });
      setCustomPhrases([...customPhrases, newPhrase]);
      setNewEnglish('');
      setNewTranslation('');
      setShowAddForm(false);
    }
  };

  const handleDeleteCustomPhrase = (id: string) => {
    deleteCustomPhrase(id);
    setCustomPhrases(customPhrases.filter(p => p.id !== id));
  };

  const handleSpeak = (text: string) => {
    const success = speakText(text, language);
    if (!success) {
      console.warn('Speech synthesis not supported');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="sticky top-0 bg-white shadow-md z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Back</span>
            </button>
            <h2 className="text-3xl font-bold text-slate-800 mt-3">{data.name} Phrases</h2>
            <p className="text-sm text-slate-600 mt-1 capitalize">{sector} Sector</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 pb-12">
          <div className="space-y-6">
            {phrases.map((phrase, index) => {
              const isExpanded = expandedPhrases.has(index);
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="p-6 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">English</p>
                      <p className="text-2xl font-semibold text-slate-800 leading-relaxed">
                        {phrase.english}
                      </p>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <p className="text-sm font-medium text-slate-500 mb-1">{data.name}</p>
                      <div className="flex items-center gap-3">
                        <p className="text-2xl font-semibold text-blue-700 leading-relaxed flex-1">
                          {phrase.translation}
                        </p>
                        {isSpeechSupported() ? (
                          <button
                            onClick={() => handleSpeak(phrase.translation)}
                            className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Play audio"
                          >
                            <Volume2 className="w-6 h-6" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Audio unavailable</span>
                        )}
                      </div>
                    </div>
                    {sector === 'healthcare' && (
                      <div className="pt-2">
                        <button
                          onClick={() => handleShowTranslation(phrase.translation)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                          {getShowToLabel()}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200">
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="w-full px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {getResponseLabel()}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {phrase.responses.map((response, responseIndex) => (
                            <div
                              key={responseIndex}
                              className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                            >
                              <div className="flex items-start gap-2 mb-1">
                                <p className="text-lg font-semibold text-blue-700 flex-1">
                                  {response.translation}
                                </p>
                                {isSpeechSupported() ? (
                                  <button
                                    onClick={() => handleSpeak(response.translation)}
                                    className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                                    title="Play audio"
                                  >
                                    <Volume2 className="w-5 h-5" />
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">Unavailable</span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 italic mb-1">
                                [{response.pronunciation}]
                              </p>
                              <p className="text-sm text-slate-700">
                                {response.english}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

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
              <div className="space-y-4">
                {customPhrases.map((phrase) => (
                  <div
                    key={phrase.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">English</p>
                          <p className="text-2xl font-semibold text-slate-800 leading-relaxed">
                            {phrase.english}
                          </p>
                        </div>
                        <div className="border-t border-slate-200 pt-3">
                          <p className="text-sm font-medium text-slate-500 mb-1">{data.name}</p>
                          <div className="flex items-center gap-3">
                            <p className="text-2xl font-semibold text-blue-700 leading-relaxed flex-1">
                              {phrase.translation}
                            </p>
                            {isSpeechSupported() ? (
                              <button
                                onClick={() => handleSpeak(phrase.translation)}
                                className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Play audio"
                              >
                                <Volume2 className="w-6 h-6" />
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">Audio unavailable</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCustomPhrase(phrase.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete phrase"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
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
    </>
  );
}
