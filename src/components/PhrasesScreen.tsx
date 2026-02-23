import { useState } from 'react';
import { ArrowLeft, Eye, X } from 'lucide-react';
import { Language, Sector, languageData } from '../data/phrases';

interface PhrasesScreenProps {
  language: Language;
  sector: Sector;
  onBack: () => void;
}

export default function PhrasesScreen({ language, sector, onBack }: PhrasesScreenProps) {
  const data = languageData[language];
  const [fullscreenTranslation, setFullscreenTranslation] = useState<string | null>(null);

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

  const handleShowTranslation = (translation: string) => {
    setFullscreenTranslation(translation);
  };

  const handleDismissFullscreen = () => {
    setFullscreenTranslation(null);
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
            {data.phrases.map((phrase, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">English</p>
                    <p className="text-2xl font-semibold text-slate-800 leading-relaxed">
                      {phrase.english}
                    </p>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-sm font-medium text-slate-500 mb-1">{data.name}</p>
                    <p className="text-2xl font-semibold text-blue-700 leading-relaxed">
                      {phrase.translation}
                    </p>
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
              </div>
            ))}
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
