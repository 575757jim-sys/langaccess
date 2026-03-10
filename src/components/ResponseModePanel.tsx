import { X } from 'lucide-react';
import { Language, Sector } from '../data/phrases';

interface ResponseModePanelProps {
  language: Language;
  sector: Sector;
  onResponse: (english: string) => void;
  onClose: () => void;
}

interface ResponseButton {
  key: string;
  english: string;
  color: string;
  translations: Record<Language, string>;
}

const BUTTONS: Record<Sector, ResponseButton[]> = {
  education: [
    {
      key: 'yes', english: 'Yes', color: 'bg-green-600 hover:bg-green-500 active:bg-green-700',
      translations: { spanish: 'Sí', tagalog: 'Oo', vietnamese: 'Có', mandarin: '是', cantonese: '係', hmong: 'Yog', korean: '예', arabic: 'نعم' },
    },
    {
      key: 'no', english: 'No', color: 'bg-red-600 hover:bg-red-500 active:bg-red-700',
      translations: { spanish: 'No', tagalog: 'Hindi', vietnamese: 'Không', mandarin: '否', cantonese: '唔係', hmong: 'Tsis yog', korean: '아니요', arabic: 'لا' },
    },
    {
      key: 'dontunderstand', english: "Don't Understand", color: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600',
      translations: { spanish: 'No entiendo', tagalog: 'Hindi ko naiintindihan', vietnamese: 'Không hiểu', mandarin: '我不明白', cantonese: '我唔明', hmong: 'Tsis to taub', korean: '이해 못 해요', arabic: 'لا أفهم' },
    },
    {
      key: 'thanks', english: 'Thank You', color: 'bg-teal-600 hover:bg-teal-500 active:bg-teal-700',
      translations: { spanish: 'Gracias', tagalog: 'Salamat', vietnamese: 'Cảm ơn', mandarin: '谢谢', cantonese: '多謝', hmong: 'Ua tsaug', korean: '감사합니다', arabic: 'شكراً' },
    },
    {
      key: 'needhelp', english: 'Need Help', color: 'bg-orange-500 hover:bg-orange-400 active:bg-orange-600',
      translations: { spanish: 'Necesito ayuda', tagalog: 'Kailangan ko ng tulong', vietnamese: 'Tôi cần giúp đỡ', mandarin: '我需要帮助', cantonese: '我需要幫助', hmong: 'Kuv xav tau kev pab', korean: '도움이 필요해요', arabic: 'أحتاج مساعدة' },
    },
    {
      key: 'teacher', english: 'Talk to Teacher', color: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700',
      translations: { spanish: 'Quiero hablar con el maestro', tagalog: 'Gusto kong makausap ang guro', vietnamese: 'Tôi muốn nói chuyện với giáo viên', mandarin: '我想和老师谈谈', cantonese: '我想同老師傾談', hmong: 'Kuv xav tham nrog xib fwb', korean: '선생님과 얘기하고 싶어요', arabic: 'أريد التحدث مع المعلم' },
    },
  ],
  healthcare: [
    {
      key: 'yes', english: 'Yes', color: 'bg-green-600 hover:bg-green-500 active:bg-green-700',
      translations: { spanish: 'Sí', tagalog: 'Oo', vietnamese: 'Có', mandarin: '是', cantonese: '係', hmong: 'Yog', korean: '예', arabic: 'نعم' },
    },
    {
      key: 'no', english: 'No', color: 'bg-red-600 hover:bg-red-500 active:bg-red-700',
      translations: { spanish: 'No', tagalog: 'Hindi', vietnamese: 'Không', mandarin: '否', cantonese: '唔係', hmong: 'Tsis yog', korean: '아니요', arabic: 'لا' },
    },
    {
      key: 'pain', english: 'Pain', color: 'bg-red-500 hover:bg-red-400 active:bg-red-600',
      translations: { spanish: 'Dolor', tagalog: 'Sakit', vietnamese: 'Đau', mandarin: '疼痛', cantonese: '痛', hmong: 'Mob', korean: '통증', arabic: 'ألم' },
    },
    {
      key: 'dizzy', english: 'Dizzy', color: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600',
      translations: { spanish: 'Mareo', tagalog: 'Nahihilo', vietnamese: 'Chóng mặt', mandarin: '头晕', cantonese: '頭暈', hmong: 'Ncov taub hau', korean: '어지러워요', arabic: 'دوخة' },
    },
    {
      key: 'help', english: 'Help', color: 'bg-orange-500 hover:bg-orange-400 active:bg-orange-600',
      translations: { spanish: 'Ayuda', tagalog: 'Tulong', vietnamese: 'Giúp đỡ', mandarin: '帮助', cantonese: '幫助', hmong: 'Pab', korean: '도움', arabic: 'مساعدة' },
    },
    {
      key: 'water', english: 'Water', color: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700',
      translations: { spanish: 'Agua', tagalog: 'Tubig', vietnamese: 'Nước', mandarin: '水', cantonese: '水', hmong: 'Dej', korean: '물', arabic: 'ماء' },
    },
  ],
  construction: [
    {
      key: 'yes', english: 'Yes', color: 'bg-green-600 hover:bg-green-500 active:bg-green-700',
      translations: { spanish: 'Sí', tagalog: 'Oo', vietnamese: 'Có', mandarin: '是', cantonese: '係', hmong: 'Yog', korean: '예', arabic: 'نعم' },
    },
    {
      key: 'no', english: 'No', color: 'bg-red-600 hover:bg-red-500 active:bg-red-700',
      translations: { spanish: 'No', tagalog: 'Hindi', vietnamese: 'Không', mandarin: '否', cantonese: '唔係', hmong: 'Tsis yog', korean: '아니요', arabic: 'لا' },
    },
    {
      key: 'problem', english: 'Problem', color: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600',
      translations: { spanish: 'Problema', tagalog: 'Problema', vietnamese: 'Vấn đề', mandarin: '问题', cantonese: '問題', hmong: 'Teeb meem', korean: '문제', arabic: 'مشكلة' },
    },
    {
      key: 'stop', english: 'Stop', color: 'bg-red-500 hover:bg-red-400 active:bg-red-600',
      translations: { spanish: 'Parar', tagalog: 'Tigil', vietnamese: 'Dừng lại', mandarin: '停止', cantonese: '停', hmong: 'Nres', korean: '멈춰요', arabic: 'توقف' },
    },
    {
      key: 'help', english: 'Help', color: 'bg-orange-500 hover:bg-orange-400 active:bg-orange-600',
      translations: { spanish: 'Ayuda', tagalog: 'Tulong', vietnamese: 'Giúp đỡ', mandarin: '帮助', cantonese: '幫助', hmong: 'Pab', korean: '도움', arabic: 'مساعدة' },
    },
    {
      key: 'danger', english: 'Danger', color: 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600',
      translations: { spanish: 'Peligro', tagalog: 'Panganib', vietnamese: 'Nguy hiểm', mandarin: '危险', cantonese: '危險', hmong: 'Kev phom sij', korean: '위험', arabic: 'خطر' },
    },
  ],
};

const OUTREACH_BUTTONS: ResponseButton[] = [
  {
    key: 'yes', english: 'Yes', color: 'bg-green-600 hover:bg-green-500 active:bg-green-700',
    translations: { spanish: 'Sí', tagalog: 'Oo', vietnamese: 'Có', mandarin: '是', cantonese: '係', hmong: 'Yog', korean: '예', arabic: 'نعم' },
  },
  {
    key: 'no', english: 'No', color: 'bg-red-600 hover:bg-red-500 active:bg-red-700',
    translations: { spanish: 'No', tagalog: 'Hindi', vietnamese: 'Không', mandarin: '否', cantonese: '唔係', hmong: 'Tsis yog', korean: '아니요', arabic: 'لا' },
  },
  {
    key: 'help', english: 'Help', color: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600',
    translations: { spanish: 'Ayuda', tagalog: 'Tulong', vietnamese: 'Giúp đỡ', mandarin: '帮助', cantonese: '幫助', hmong: 'Pab', korean: '도움', arabic: 'مساعدة' },
  },
  {
    key: 'food', english: 'Food', color: 'bg-orange-500 hover:bg-orange-400 active:bg-orange-600',
    translations: { spanish: 'Comida', tagalog: 'Pagkain', vietnamese: 'Thức ăn', mandarin: '食物', cantonese: '食物', hmong: 'Zaub mov', korean: '음식', arabic: 'طعام' },
  },
  {
    key: 'medical', english: 'Medical', color: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700',
    translations: { spanish: 'Médico', tagalog: 'Medikal', vietnamese: 'Y tế', mandarin: '医疗', cantonese: '醫療', hmong: 'Kho mob', korean: '의료', arabic: 'طبي' },
  },
  {
    key: 'shelter', english: 'Shelter', color: 'bg-teal-600 hover:bg-teal-500 active:bg-teal-700',
    translations: { spanish: 'Refugio', tagalog: 'Silungan', vietnamese: 'Chỗ ở', mandarin: '庇护所', cantonese: '庇護所', hmong: 'Tsev so', korean: '쉼터', arabic: 'مأوى' },
  },
];

const isRtl = (lang: Language) => lang === 'arabic';

export default function ResponseModePanel({ language, sector, onResponse, onClose }: ResponseModePanelProps) {
  const buttons = BUTTONS[sector] ?? OUTREACH_BUTTONS;
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
        {buttons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => onResponse(btn.english)}
            className={`${btn.color} text-white rounded-xl py-3.5 px-2 flex flex-col items-center justify-center gap-1 shadow-sm transition-all duration-150 active:scale-95`}
          >
            <span className="text-lg font-bold leading-none">{btn.translations[language]}</span>
            <span className="text-[10px] font-semibold opacity-75 leading-none">{btn.english}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
