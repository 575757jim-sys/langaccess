import { ArrowLeft } from 'lucide-react';
import { Language, languageData } from '../data/phrases';

interface PhrasesScreenProps {
  language: Language;
  onBack: () => void;
}

export default function PhrasesScreen({ language, onBack }: PhrasesScreenProps) {
  const data = languageData[language];

  return (
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
