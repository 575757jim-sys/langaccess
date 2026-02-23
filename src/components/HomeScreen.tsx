import { Languages } from 'lucide-react';
import { Language } from '../data/phrases';

interface HomeScreenProps {
  onSelectLanguage: (language: Language) => void;
}

export default function HomeScreen({ onSelectLanguage }: HomeScreenProps) {
  const languages: { id: Language; label: string; color: string }[] = [
    { id: 'spanish', label: 'Spanish', color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'tagalog', label: 'Tagalog', color: 'bg-green-600 hover:bg-green-700' },
    { id: 'vietnamese', label: 'Vietnamese', color: 'bg-red-600 hover:bg-red-700' },
    { id: 'mandarin', label: 'Mandarin', color: 'bg-orange-600 hover:bg-orange-700' },
    { id: 'cantonese', label: 'Cantonese', color: 'bg-teal-600 hover:bg-teal-700' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Languages className="w-16 h-16 text-slate-700" />
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-3">LangAccess</h1>
          <p className="text-xl text-slate-600">Healthcare Communication Aid</p>
        </div>

        <div className="w-full space-y-4">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => onSelectLanguage(lang.id)}
              className={`w-full ${lang.color} text-white rounded-2xl py-6 px-8 text-2xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
