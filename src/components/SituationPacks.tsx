import { useState } from 'react';
import { Volume2, Loader2, ChevronDown, ChevronUp, Users, BookOpen, Stethoscope, HardHat } from 'lucide-react';
import { Language } from '../data/phrases';
import { playAudioFromGesture } from '../utils/speech';

interface PackPhrase {
  english: string;
  translations: Record<Language, string>;
}

interface SituationPack {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent: string;
  border: string;
  badgeClass: string;
  phrases: PackPhrase[];
}

const SITUATION_PACKS: SituationPack[] = [
  {
    id: 'outreach',
    title: 'Outreach Pack',
    description: 'Community services & shelter coordination',
    icon: Users,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    accent: 'bg-teal-50 border-teal-100',
    border: 'border-teal-100',
    badgeClass: 'bg-teal-100 text-teal-700',
    phrases: [
      {
        english: 'The shelter opens at 6 PM.',
        translations: {
          spanish: 'El refugio abre a las 6 de la tarde.',
          mandarin: '收容所下午六点开放。',
          cantonese: '庇護所下午六點開放。',
          vietnamese: 'Nơi trú ẩn mở cửa lúc 6 giờ tối.',
          tagalog: 'Ang shelter ay nagbubukas ng alas-sais ng gabi.',
          hmong: 'Lub tsev pab qhib thaum 6 teev tsaus ntuj.',
          korean: '대피소는 오후 6시에 문을 엽니다.',
          arabic: 'يفتح الملجأ الساعة السادسة مساءً.',
        },
      },
      {
        english: 'Food is served here.',
        translations: {
          spanish: 'Aquí se sirve comida.',
          mandarin: '这里提供食物。',
          cantonese: '呢度提供食物。',
          vietnamese: 'Thức ăn được phục vụ ở đây.',
          tagalog: 'May pagkain dito.',
          hmong: 'Zaub mov muab ntawm no.',
          korean: '여기에서 음식이 제공됩니다.',
          arabic: 'يتم تقديم الطعام هنا.',
        },
      },
      {
        english: 'Do you need medical help?',
        translations: {
          spanish: '¿Necesita ayuda médica?',
          mandarin: '您需要医疗帮助吗？',
          cantonese: '你需要醫療幫助嗎？',
          vietnamese: 'Bạn có cần trợ giúp y tế không?',
          tagalog: 'Kailangan mo ba ng tulong medikal?',
          hmong: 'Puas xav tau kev pab kho mob?',
          korean: '의료 도움이 필요하신가요?',
          arabic: 'هل تحتاج إلى مساعدة طبية؟',
        },
      },
      {
        english: 'Please wait here.',
        translations: {
          spanish: 'Por favor espere aquí.',
          mandarin: '请在这里等待。',
          cantonese: '請喺度等。',
          vietnamese: 'Xin hãy chờ ở đây.',
          tagalog: 'Mangyaring maghintay dito.',
          hmong: 'Thov tos ntawm no.',
          korean: '여기서 기다려 주세요.',
          arabic: 'من فضلك، انتظر هنا.',
        },
      },
    ],
  },
  {
    id: 'classroom',
    title: 'Classroom Pack',
    description: 'Student communication & classroom management',
    icon: BookOpen,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    accent: 'bg-blue-50 border-blue-100',
    border: 'border-blue-100',
    badgeClass: 'bg-blue-100 text-blue-700',
    phrases: [
      {
        english: 'Please sit down.',
        translations: {
          spanish: 'Por favor, siéntese.',
          mandarin: '请坐下。',
          cantonese: '請坐低。',
          vietnamese: 'Xin hãy ngồi xuống.',
          tagalog: 'Mangyaring umupo.',
          hmong: 'Thov zaum.',
          korean: '앉아 주세요.',
          arabic: 'من فضلك، اجلس.',
        },
      },
      {
        english: 'Line up here.',
        translations: {
          spanish: 'Fórmense aquí.',
          mandarin: '请在这里排队。',
          cantonese: '請喺度排隊。',
          vietnamese: 'Xếp hàng ở đây.',
          tagalog: 'Pumila dito.',
          hmong: 'Tuaj sab no.',
          korean: '여기 줄 서세요.',
          arabic: 'تصطف هنا.',
        },
      },
      {
        english: 'Open your book.',
        translations: {
          spanish: 'Abra su libro.',
          mandarin: '打开你的书。',
          cantonese: '打開你的書。',
          vietnamese: 'Mở sách ra.',
          tagalog: 'Buksan ang iyong libro.',
          hmong: 'Qhib koj phau ntawv.',
          korean: '책을 펴세요.',
          arabic: 'افتح كتابك.',
        },
      },
      {
        english: 'Call your parent.',
        translations: {
          spanish: 'Llame a su padre/madre.',
          mandarin: '请打电话给你的家长。',
          cantonese: '請打電話俾你屋企人。',
          vietnamese: 'Gọi cho bố hoặc mẹ của bạn.',
          tagalog: 'Tawagan ang iyong magulang.',
          hmong: 'Hu rau koj niam txiv.',
          korean: '부모님께 전화하세요.',
          arabic: 'اتصل بوالديك.',
        },
      },
    ],
  },
  {
    id: 'medical',
    title: 'Medical Intake Pack',
    description: 'Patient intake & triage communication',
    icon: Stethoscope,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    accent: 'bg-green-50 border-green-100',
    border: 'border-green-100',
    badgeClass: 'bg-green-100 text-green-700',
    phrases: [
      {
        english: 'Where does it hurt?',
        translations: {
          spanish: '¿Dónde le duele?',
          mandarin: '哪里疼？',
          cantonese: '邊度痛？',
          vietnamese: 'Bạn đau ở đâu?',
          tagalog: 'Saan ka masakit?',
          hmong: 'Mob qhov twg?',
          korean: '어디가 아프세요?',
          arabic: 'أين يؤلمك؟',
        },
      },
      {
        english: 'Do you have pain?',
        translations: {
          spanish: '¿Tiene dolor?',
          mandarin: '您有疼痛吗？',
          cantonese: '你有唔有痛？',
          vietnamese: 'Bạn có đau không?',
          tagalog: 'Mayroon ka bang sakit?',
          hmong: 'Puas mob?',
          korean: '통증이 있나요?',
          arabic: 'هل تشعر بألم؟',
        },
      },
      {
        english: 'Please sit here.',
        translations: {
          spanish: 'Por favor siéntese aquí.',
          mandarin: '请坐在这里。',
          cantonese: '請坐喺度。',
          vietnamese: 'Xin hãy ngồi đây.',
          tagalog: 'Mangyaring umupo dito.',
          hmong: 'Thov zaum ntawm no.',
          korean: '여기 앉아 주세요.',
          arabic: 'من فضلك، اجلس هنا.',
        },
      },
      {
        english: 'A doctor will see you soon.',
        translations: {
          spanish: 'Un médico lo atenderá pronto.',
          mandarin: '医生很快就会来看你。',
          cantonese: '醫生快啲嚟睇你。',
          vietnamese: 'Bác sĩ sẽ khám cho bạn ngay.',
          tagalog: 'Makikita ka ng doktor sa lalong madaling panahon.',
          hmong: 'Kws kho mob yuav pom koj sai sai.',
          korean: '곧 의사가 진료할 것입니다.',
          arabic: 'سيراك الطبيب قريبًا.',
        },
      },
    ],
  },
  {
    id: 'construction',
    title: 'Construction Safety Pack',
    description: 'Worksite safety & emergency instructions',
    icon: HardHat,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    accent: 'bg-orange-50 border-orange-100',
    border: 'border-orange-100',
    badgeClass: 'bg-orange-100 text-orange-700',
    phrases: [
      {
        english: 'Wear your safety harness.',
        translations: {
          spanish: 'Use su arnés de seguridad.',
          mandarin: '请系好安全带。',
          cantonese: '請戴好安全帶。',
          vietnamese: 'Hãy đeo dây an toàn.',
          tagalog: 'Isuot ang iyong safety harness.',
          hmong: 'Hnav koj lub kaus mom kev nyab xeeb.',
          korean: '안전 하네스를 착용하세요.',
          arabic: 'ارتدِ حزام الأمان الخاص بك.',
        },
      },
      {
        english: 'Turn off the power.',
        translations: {
          spanish: 'Apague la corriente.',
          mandarin: '关掉电源。',
          cantonese: '關掉電源。',
          vietnamese: 'Tắt nguồn điện.',
          tagalog: 'Patayin ang kuryente.',
          hmong: 'Tua lub hwj chim.',
          korean: '전원을 끄세요.',
          arabic: 'أوقف تشغيل الكهرباء.',
        },
      },
      {
        english: 'Watch your step.',
        translations: {
          spanish: 'Cuide donde pisa.',
          mandarin: '注意脚下。',
          cantonese: '小心腳下。',
          vietnamese: 'Coi chừng bước chân.',
          tagalog: 'Ingatan ang iyong hakbang.',
          hmong: 'Ceev faj koj ceg.',
          korean: '발밑을 조심하세요.',
          arabic: 'انتبه لخطواتك.',
        },
      },
      {
        english: 'Stop the machine.',
        translations: {
          spanish: 'Detenga la máquina.',
          mandarin: '停止机器。',
          cantonese: '停止機器。',
          vietnamese: 'Dừng máy lại.',
          tagalog: 'Itigil ang makina.',
          hmong: 'Nres lub tshuab.',
          korean: '기계를 멈추세요.',
          arabic: 'أوقف الآلة.',
        },
      },
    ],
  },
];

const LANGUAGES: { id: Language; label: string; short: string }[] = [
  { id: 'spanish', label: 'Spanish', short: 'ES' },
  { id: 'mandarin', label: 'Mandarin', short: 'ZH' },
  { id: 'cantonese', label: 'Cantonese', short: 'YUE' },
  { id: 'vietnamese', label: 'Vietnamese', short: 'VI' },
  { id: 'tagalog', label: 'Tagalog', short: 'TL' },
];

interface PackCardProps {
  pack: SituationPack;
  selectedLanguage: Language;
}

function PackCard({ pack, selectedLanguage }: PackCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const Icon = pack.icon;

  function handlePlay(phrase: PackPhrase, index: number, e: React.MouseEvent) {
    e.stopPropagation();
    const key = `${pack.id}-${index}`;
    const text = phrase.translations[selectedLanguage];
    if (!text) return;
    setLoadingKey(key);
    playAudioFromGesture(text, selectedLanguage);
    setTimeout(() => setLoadingKey(null), 2500);
  }

  return (
    <div
      className={`bg-white border ${pack.border} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
    >
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full text-left p-5 flex items-center gap-4"
        aria-expanded={isOpen}
      >
        <div className={`w-11 h-11 ${pack.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${pack.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm leading-snug">{pack.title}</p>
          <p className="text-slate-500 text-xs mt-0.5 leading-snug">{pack.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${pack.badgeClass}`}>
            {pack.phrases.length} phrases
          </span>
          <div className="text-slate-400">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className={`px-5 pb-5 border-t ${pack.border}`}>
          <div className="pt-4 grid sm:grid-cols-2 gap-2.5">
            {pack.phrases.map((phrase, i) => {
              const key = `${pack.id}-${i}`;
              const isLoading = loadingKey === key;
              const translation = phrase.translations[selectedLanguage];

              return (
                <button
                  key={key}
                  onClick={(e) => handlePlay(phrase, i, e)}
                  disabled={isLoading}
                  className="group w-full text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 flex items-center gap-3 transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                >
                  <div className={`w-8 h-8 ${pack.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150`}>
                    {isLoading ? (
                      <Loader2 className={`w-3.5 h-3.5 ${pack.iconColor} animate-spin`} />
                    ) : (
                      <Volume2 className={`w-3.5 h-3.5 ${pack.iconColor}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-xs font-semibold leading-snug">{phrase.english}</p>
                    <p className="text-slate-500 text-xs leading-snug mt-0.5 truncate">{translation}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SituationPacks() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('spanish');

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-100" id="situation-packs">
      <div className="max-w-4xl mx-auto px-6">

        <div className="text-center mb-10">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Ready-to-use</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Quick Situation Packs
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            Tap a pack to expand it, then tap any phrase to hear the audio in your chosen language.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {LANGUAGES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSelectedLanguage(id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150 ${
                selectedLanguage === id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {SITUATION_PACKS.map((pack) => (
            <PackCard key={pack.id} pack={pack} selectedLanguage={selectedLanguage} />
          ))}
        </div>
      </div>
    </section>
  );
}
