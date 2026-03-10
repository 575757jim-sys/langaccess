import { X } from 'lucide-react';
import { Language } from '../data/phrases';

interface ResponseModePanelProps {
  language: Language;
  onResponse: (english: string) => void;
  onClose: () => void;
}

type ResponseKey = 'yes' | 'no' | 'help' | 'food' | 'medical' | 'shelter';

const RESPONSE_TRANSLATIONS: Record<Language, Record<ResponseKey, string>> = {
  spanish:  { yes: 'Sí', no: 'No', help: 'Ayuda', food: 'Comida', medical: 'Médico', shelter: 'Refugio' },
  tagalog:  { yes: 'Oo', no: 'Hindi', help: 'Tulong', food: 'Pagkain', medical: 'Medikal', shelter: 'Silungan' },
  vietnamese: { yes: 'Có', no: 'Không', help: 'Giúp đỡ', food: 'Thức ăn', medical: 'Y tế', shelter: 'Chỗ ở' },
  mandarin: { yes: '是', no: '否', help: '帮助', food: '食物', medical: '医疗', shelter: '庇护所' },
  cantonese: { yes: '係', no: '唔係', help: '幫助', food: '食物', medical: '醫療', shelter: '庇護所' },
  hmong:    { yes: 'Yog', no: 'Tsis yog', help: 'Pab', food: 'Zaub mov', medical: 'Kho mob', shelter: 'Tsev so' },
  korean:   { yes: '예', no: '아니요', help: '도움', food: '음식', medical: '의료', shelter: '쉼터' },
  arabic:   { yes: 'نعم', no: 'لا', help: 'مساعدة', food: 'طعام', medical: 'طبي', shelter: 'مأوى' },
};

const RESPONSE_KEYS: ResponseKey[] = ['yes', 'no', 'help', 'food', 'medical', 'shelter'];

const RESPONSE_COLORS: Record<ResponseKey, string> = {
  yes:     'bg-green-600 hover:bg-green-500 active:bg-green-700',
  no:      'bg-red-600 hover:bg-red-500 active:bg-red-700',
  help:    'bg-amber-500 hover:bg-amber-400 active:bg-amber-600',
  food:    'bg-orange-500 hover:bg-orange-400 active:bg-orange-600',
  medical: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700',
  shelter: 'bg-teal-600 hover:bg-teal-500 active:bg-teal-700',
};

const ENGLISH_LABELS: Record<ResponseKey, string> = {
  yes: 'Yes', no: 'No', help: 'Help', food: 'Food', medical: 'Medical', shelter: 'Shelter',
};

const isRtl = (lang: Language) => lang === 'arabic';

export default function ResponseModePanel({ language, onResponse, onClose }: ResponseModePanelProps) {
  const translations = RESPONSE_TRANSLATIONS[language];
  const rtl = isRtl(language);

  return (
    <div className="mt-3 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Let them respond</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 grid grid-cols-3 gap-2" dir={rtl ? 'rtl' : 'ltr'}>
        {RESPONSE_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => onResponse(ENGLISH_LABELS[key])}
            className={`${RESPONSE_COLORS[key]} text-white rounded-xl py-3.5 px-2 flex flex-col items-center justify-center gap-1 shadow-sm transition-all duration-150 active:scale-95`}
          >
            <span className="text-lg font-bold leading-none">{translations[key]}</span>
            <span className="text-[10px] font-semibold opacity-75 leading-none">{ENGLISH_LABELS[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
