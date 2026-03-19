import { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language } from '../data/phrases';

interface Props {
  slug: string;
  onSelectLanguage: (language: Language) => void;
}

const LANGUAGES: { id: Language; label: string; activeClass: string; abbr: string }[] = [
  { id: 'spanish', label: 'Spanish', activeClass: 'bg-red-600 text-white border-red-600', abbr: 'ES' },
  { id: 'tagalog', label: 'Tagalog', activeClass: 'bg-blue-600 text-white border-blue-600', abbr: 'TL' },
  { id: 'vietnamese', label: 'Vietnamese', activeClass: 'bg-rose-700 text-white border-rose-700', abbr: 'VI' },
  { id: 'mandarin', label: 'Mandarin', activeClass: 'bg-amber-500 text-white border-amber-500', abbr: 'ZH' },
  { id: 'cantonese', label: 'Cantonese', activeClass: 'bg-orange-500 text-white border-orange-500', abbr: 'YUE' },
];

export default function QRScanPage({ slug, onSelectLanguage }: Props) {
  useEffect(() => {
    supabase
      .from('qr_scans')
      .insert({ qr_slug: slug, scanned_at: new Date().toISOString() })
      .then(() => {});
  }, [slug]);

  const handleLanguageSelect = (_language: Language) => {
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-green-600 text-sm font-semibold tracking-wide uppercase mb-3">
            LangAccess
          </p>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Choose your language
          </h1>
          <p className="text-slate-400 text-sm">
            Elige tu idioma · Piliin ang iyong wika
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageSelect(lang.id)}
              className="group flex items-center gap-4 p-5 rounded-2xl border-2 bg-white border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] text-left"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-slate-100 text-slate-600">
                {lang.abbr}
              </div>
              <div className="flex-1">
                <div className="font-bold text-base text-slate-800">
                  {lang.label}
                </div>
                <div className="text-xs mt-0.5 text-slate-400">
                  Tap to select
                </div>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0 text-slate-300 group-hover:text-slate-400" />
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-300 mt-10">
          Powered by LangAccess · langaccess.org
        </p>
      </div>
    </div>
  );
}
