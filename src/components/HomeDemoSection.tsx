import { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { Language } from '../data/phrases';
import { playAudioFromGesture } from '../utils/speech';

interface DemoPhrase {
  english: string;
  translations: Record<Language, string>;
}

interface DemoSituation {
  id: string;
  label: string;
  color: string;
  activeColor: string;
  phrases: DemoPhrase[];
}

const DEMO_LANGUAGES: { id: Language; label: string }[] = [
  { id: 'spanish', label: 'Spanish' },
  { id: 'mandarin', label: 'Mandarin' },
  { id: 'cantonese', label: 'Cantonese' },
  { id: 'vietnamese', label: 'Vietnamese' },
  { id: 'tagalog', label: 'Tagalog' },
];

const SITUATIONS: DemoSituation[] = [
  {
    id: 'classroom',
    label: 'Classroom',
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    activeColor: 'bg-blue-600 text-white border-blue-600',
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
        english: 'Open your book to page 10.',
        translations: {
          spanish: 'Abra su libro en la página 10.',
          mandarin: '请翻到第十页。',
          cantonese: '請翻到第十頁。',
          vietnamese: 'Mở sách đến trang 10.',
          tagalog: 'Buksan ang iyong libro sa pahina 10.',
          hmong: 'Qhib koj phau ntawv rau nplooj 10.',
          korean: '10쪽을 펴세요.',
          arabic: 'افتح كتابك على الصفحة 10.',
        },
      },
      {
        english: 'Please listen carefully.',
        translations: {
          spanish: 'Por favor escuche con atención.',
          mandarin: '请认真听。',
          cantonese: '請留心聽。',
          vietnamese: 'Xin hãy lắng nghe cẩn thận.',
          tagalog: 'Mangyaring makinig nang mabuti.',
          hmong: 'Thov mloog zoo.',
          korean: '주의 깊게 들어주세요.',
          arabic: 'من فضلك، استمع بعناية.',
        },
      },
      {
        english: 'Do you understand?',
        translations: {
          spanish: '¿Entiende?',
          mandarin: '你明白吗？',
          cantonese: '你明白嗎？',
          vietnamese: 'Bạn có hiểu không?',
          tagalog: 'Naiintindihan mo ba?',
          hmong: 'Puas to taub?',
          korean: '이해하시나요?',
          arabic: 'هل تفهم؟',
        },
      },
    ],
  },
  {
    id: 'medical',
    label: 'Medical',
    color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    activeColor: 'bg-green-600 text-white border-green-600',
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
      {
        english: 'Are you taking any medications?',
        translations: {
          spanish: '¿Está tomando algún medicamento?',
          mandarin: '你在服用任何药物吗？',
          cantonese: '你有冇食緊藥？',
          vietnamese: 'Bạn có đang dùng thuốc nào không?',
          tagalog: 'Umiinom ka ba ng anumang gamot?',
          hmong: 'Puas haus tshuaj?',
          korean: '복용 중인 약이 있나요?',
          arabic: 'هل تتناول أي أدوية؟',
        },
      },
      {
        english: 'We need to do blood tests.',
        translations: {
          spanish: 'Necesitamos hacer análisis de sangre.',
          mandarin: '我们需要做血液检查。',
          cantonese: '我哋需要驗血。',
          vietnamese: 'Chúng tôi cần xét nghiệm máu.',
          tagalog: 'Kailangan nating gumawa ng pagsusuri ng dugo.',
          hmong: 'Peb yuav tsum kuaj ntshav.',
          korean: '혈액 검사가 필요합니다.',
          arabic: 'نحتاج إلى إجراء فحوصات الدم.',
        },
      },
    ],
  },
  {
    id: 'safety',
    label: 'Safety',
    color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    activeColor: 'bg-orange-600 text-white border-orange-600',
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
        english: 'Stop work immediately.',
        translations: {
          spanish: 'Detenga el trabajo de inmediato.',
          mandarin: '立即停止工作。',
          cantonese: '即刻停止工作。',
          vietnamese: 'Dừng công việc ngay lập tức.',
          tagalog: 'Itigil agad ang trabaho.',
          hmong: 'Nres ua hauj lwm tam sim no.',
          korean: '즉시 작업을 중단하세요.',
          arabic: 'أوقف العمل فورًا.',
        },
      },
      {
        english: 'Put on your hard hat.',
        translations: {
          spanish: 'Póngase el casco.',
          mandarin: '戴好安全帽。',
          cantonese: '戴好安全帽。',
          vietnamese: 'Đội mũ bảo hộ.',
          tagalog: 'Isuot ang iyong hard hat.',
          hmong: 'Hnav koj lub kaus mom nyab xeeb.',
          korean: '안전모를 쓰세요.',
          arabic: 'ارتدِ الخوذة الصلبة.',
        },
      },
      {
        english: 'Is anyone injured?',
        translations: {
          spanish: '¿Hay alguien herido?',
          mandarin: '有人受伤吗？',
          cantonese: '有冇人受傷？',
          vietnamese: 'Có ai bị thương không?',
          tagalog: 'May nasaktan ba?',
          hmong: 'Puas muaj leej twg raug mob?',
          korean: '부상자가 있나요?',
          arabic: 'هل أصيب أحد؟',
        },
      },
    ],
  },
  {
    id: 'directions',
    label: 'Directions',
    color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
    activeColor: 'bg-sky-600 text-white border-sky-600',
    phrases: [
      {
        english: 'The office is on the second floor.',
        translations: {
          spanish: 'La oficina está en el segundo piso.',
          mandarin: '办公室在二楼。',
          cantonese: '辦公室喺二樓。',
          vietnamese: 'Văn phòng ở tầng hai.',
          tagalog: 'Ang opisina ay nasa ikalawang palapag.',
          hmong: 'Chav ua hauj lwm nyob saum ob txheej.',
          korean: '사무실은 2층에 있습니다.',
          arabic: 'المكتب في الطابق الثاني.',
        },
      },
      {
        english: 'Turn left at the corner.',
        translations: {
          spanish: 'Gire a la izquierda en la esquina.',
          mandarin: '在拐角处向左转。',
          cantonese: '喺轉角處向左轉。',
          vietnamese: 'Rẽ trái ở góc đường.',
          tagalog: 'Lumiko sa kaliwa sa kanto.',
          hmong: 'Tig rau sab laug ntawm kaum.',
          korean: '모퉁이에서 왼쪽으로 도세요.',
          arabic: 'اتجه يسارًا عند الزاوية.',
        },
      },
      {
        english: 'The bathroom is down the hall.',
        translations: {
          spanish: 'El baño está al final del pasillo.',
          mandarin: '洗手间在走廊尽头。',
          cantonese: '廁所喺走廊盡頭。',
          vietnamese: 'Phòng vệ sinh ở cuối hành lang.',
          tagalog: 'Ang banyo ay nasa dulo ng hallway.',
          hmong: 'Chav dej nyob hauv txoj kev.',
          korean: '화장실은 복도 끝에 있습니다.',
          arabic: 'الحمام في نهاية الممر.',
        },
      },
      {
        english: 'Wait at the front desk.',
        translations: {
          spanish: 'Espere en la recepción.',
          mandarin: '请在前台等候。',
          cantonese: '請喺前台等候。',
          vietnamese: 'Chờ tại quầy lễ tân.',
          tagalog: 'Maghintay sa front desk.',
          hmong: 'Tos ntawm rooj txais tos.',
          korean: '프런트 데스크에서 기다려 주세요.',
          arabic: 'انتظر عند مكتب الاستقبال.',
        },
      },
    ],
  },
  {
    id: 'help',
    label: 'Help / Services',
    color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
    activeColor: 'bg-teal-600 text-white border-teal-600',
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
        english: 'You can get free food here.',
        translations: {
          spanish: 'Aquí puede obtener comida gratis.',
          mandarin: '您可以在这里领取免费食物。',
          cantonese: '你可以喺呢度免費領取食物。',
          vietnamese: 'Bạn có thể nhận thức ăn miễn phí ở đây.',
          tagalog: 'Maaari kang makakuha ng libreng pagkain dito.',
          hmong: 'Koj tuaj yeem tau zaub mov dawb ntawm no.',
          korean: '여기서 무료 음식을 받을 수 있습니다.',
          arabic: 'يمكنك الحصول على طعام مجاني هنا.',
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
        english: 'Services are available at no cost.',
        translations: {
          spanish: 'Los servicios están disponibles sin costo.',
          mandarin: '这些服务是免费提供的。',
          cantonese: '這些服務免費提供。',
          vietnamese: 'Các dịch vụ được cung cấp miễn phí.',
          tagalog: 'Ang mga serbisyo ay available nang walang bayad.',
          hmong: 'Cov kev pab cuam muaj pub dawb.',
          korean: '서비스는 무료로 제공됩니다.',
          arabic: 'الخدمات متاحة مجانًا.',
        },
      },
    ],
  },
];

interface HomeDemoSectionProps {
  defaultLanguage?: Language;
}

export default function HomeDemoSection({ defaultLanguage = 'spanish' }: HomeDemoSectionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(defaultLanguage);
  const [selectedSituation, setSelectedSituation] = useState<string>('classroom');
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const situation = SITUATIONS.find((s) => s.id === selectedSituation) ?? SITUATIONS[0];

  function handlePlay(phrase: DemoPhrase, index: number) {
    const key = `${selectedSituation}-${index}`;
    const text = phrase.translations[selectedLanguage];
    if (!text) return;
    setLoadingKey(key);
    playAudioFromGesture(text, selectedLanguage);
    setTimeout(() => setLoadingKey(null), 2500);
  }

  return (
    <section className="py-20 bg-white border-b border-slate-100" id="demo">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Interactive Demo</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Try LangAccess Instantly
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            Choose a language, choose a situation, then tap a phrase.
          </p>
        </div>

        {/* Step 1: Language */}
        <div className="mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Step 1 — Language
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_LANGUAGES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedLanguage(id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150 ${
                  selectedLanguage === id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Situation */}
        <div className="mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Step 2 — Situation
          </p>
          <div className="flex flex-wrap gap-2">
            {SITUATIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSituation(s.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150 ${
                  selectedSituation === s.id ? s.activeColor + ' shadow-md' : s.color
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Phrases */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Step 3 — Tap a phrase to hear it
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {situation.phrases.map((phrase, i) => {
              const key = `${selectedSituation}-${i}`;
              const isLoading = loadingKey === key;
              const translation = phrase.translations[selectedLanguage];

              return (
                <button
                  key={key}
                  onClick={() => handlePlay(phrase, i)}
                  disabled={isLoading}
                  className="group w-full text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl p-4 flex items-center gap-4 transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center flex-shrink-0 transition-colors duration-150">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-blue-600 group-hover:text-white animate-spin transition-colors duration-150" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors duration-150" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-sm font-semibold leading-snug mb-0.5 truncate">
                      {phrase.english}
                    </p>
                    <p className="text-slate-500 text-xs leading-snug truncate">
                      {translation}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Audio plays using real TTS — the same phrases used in the full app.
          </p>
        </div>
      </div>
    </section>
  );
}
