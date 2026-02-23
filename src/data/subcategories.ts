import { Language, Phrase } from './phrases';

export type HealthcareSubcategory = 'physical-health' | 'mental-health' | 'dental-health' | 'emergency-crisis';
export type EducationSubcategory = 'safe-haven-immigration' | 'restorative-justice' | 'parent-communication' | 'special-needs';
export type ConstructionSubcategory = 'safety-osha' | 'injury-emergency' | 'general-worksite';

export type Subcategory = HealthcareSubcategory | EducationSubcategory | ConstructionSubcategory;

export interface SubcategoryInfo {
  id: Subcategory;
  label: string;
  sector: 'healthcare' | 'education' | 'construction';
}

export const healthcareSubcategories: SubcategoryInfo[] = [
  { id: 'physical-health', label: 'Physical Health', sector: 'healthcare' },
  { id: 'mental-health', label: 'Mental Health', sector: 'healthcare' },
  { id: 'dental-health', label: 'Dental Health', sector: 'healthcare' },
  { id: 'emergency-crisis', label: 'Emergency Crisis', sector: 'healthcare' }
];

export const educationSubcategories: SubcategoryInfo[] = [
  { id: 'safe-haven-immigration', label: 'Safe Haven and Immigration', sector: 'education' },
  { id: 'restorative-justice', label: 'Restorative Justice', sector: 'education' },
  { id: 'parent-communication', label: 'Parent Communication', sector: 'education' },
  { id: 'special-needs', label: 'Special Needs', sector: 'education' }
];

export const constructionSubcategories: SubcategoryInfo[] = [
  { id: 'safety-osha', label: 'Safety and OSHA', sector: 'construction' },
  { id: 'injury-emergency', label: 'Injury and Emergency', sector: 'construction' },
  { id: 'general-worksite', label: 'General Worksite', sector: 'construction' }
];

export const allSubcategories: SubcategoryInfo[] = [
  ...healthcareSubcategories,
  ...educationSubcategories,
  ...constructionSubcategories
];

export interface SubcategoryPhraseData {
  [key: string]: {
    [language in Language]: Phrase[];
  };
}

export const subcategoryPhrases: SubcategoryPhraseData = {
  'physical-health': {
    spanish: [
      {
        english: 'Where does it hurt?',
        translation: '¿Dónde le duele?',
        responses: [
          { translation: 'La cabeza', pronunciation: 'lah kah-BEH-sah', english: 'The head' },
          { translation: 'El pecho', pronunciation: 'el PEH-choh', english: 'The chest' },
          { translation: 'El estómago', pronunciation: 'el es-TOH-mah-goh', english: 'The stomach' },
          { translation: 'La espalda', pronunciation: 'lah es-PAHL-dah', english: 'The back' },
          { translation: 'La pierna', pronunciation: 'lah pee-EHR-nah', english: 'The leg' },
          { translation: 'El brazo', pronunciation: 'el BRAH-soh', english: 'The arm' }
        ]
      },
      {
        english: 'Do you have any allergies?',
        translation: '¿Tiene alergias?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Penicilina', pronunciation: 'peh-nee-see-LEE-nah', english: 'Penicillin' },
          { translation: 'Maní', pronunciation: 'mah-NEE', english: 'Peanuts' },
          { translation: 'No sé', pronunciation: 'noh seh', english: "I don't know" },
          { translation: 'Mariscos', pronunciation: 'mah-REES-kohs', english: 'Seafood' }
        ]
      },
      {
        english: 'Are you taking any medications?',
        translation: '¿Está tomando algún medicamento?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Para la diabetes', pronunciation: 'PAH-rah lah dee-ah-BEH-tees', english: 'For diabetes' },
          { translation: 'Para el corazón', pronunciation: 'PAH-rah el koh-rah-SOHN', english: 'For the heart' },
          { translation: 'No recuerdo', pronunciation: 'noh reh-KWEHR-doh', english: "I don't remember" },
          { translation: 'Aspirina', pronunciation: 'ahs-pee-REE-nah', english: 'Aspirin' }
        ]
      }
    ],
    tagalog: [
      { english: 'Where does it hurt?', translation: 'Saan ka masakit?', responses: [{ translation: 'Ulo', pronunciation: 'OO-loh', english: 'Head' }, { translation: 'Dibdib', pronunciation: 'deeb-DEEB', english: 'Chest' }, { translation: 'Tiyan', pronunciation: 'tee-YAHN', english: 'Stomach' }] },
      { english: 'Do you have any allergies?', translation: 'Mayroon ka bang allergy?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Wala', pronunciation: 'wah-LAH', english: 'No' }] }
    ],
    vietnamese: [
      { english: 'Where does it hurt?', translation: 'Đau ở đâu?', responses: [{ translation: 'Đầu', pronunciation: 'dow', english: 'Head' }, { translation: 'Ngực', pronunciation: 'ngooc', english: 'Chest' }] },
      { english: 'Do you have any allergies?', translation: 'Bạn có dị ứng gì không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }] }
    ],
    mandarin: [
      { english: 'Where does it hurt?', translation: '哪里痛？(Nǎlǐ tòng?)', responses: [{ translation: '头', pronunciation: 'Tóu', english: 'Head' }, { translation: '胸部', pronunciation: 'Xiōngbù', english: 'Chest' }] },
      { english: 'Do you have any allergies?', translation: '你有过敏吗？(Nǐ yǒu guòmǐn ma?)', responses: [{ translation: '有', pronunciation: 'Yǒu', english: 'Yes' }, { translation: '没有', pronunciation: 'Méiyǒu', english: 'No' }] }
    ],
    cantonese: [
      { english: 'Where does it hurt?', translation: '邊度痛？(Bīn douh tung?)', responses: [{ translation: '頭', pronunciation: 'Tàuh', english: 'Head' }, { translation: '胸口', pronunciation: 'Hūng háu', english: 'Chest' }] },
      { english: 'Do you have any allergies?', translation: '你有冇敏感？(Néih yáuh móuh mán gám?)', responses: [{ translation: '有', pronunciation: 'Yáuh', english: 'Yes' }, { translation: '冇', pronunciation: 'Móuh', english: 'No' }] }
    ]
  },
  'mental-health': {
    spanish: [
      {
        english: 'How are you feeling today?',
        translation: '¿Cómo se siente hoy?',
        responses: [
          { translation: 'Bien', pronunciation: 'bee-EHN', english: 'Good' },
          { translation: 'Mal', pronunciation: 'mahl', english: 'Bad' },
          { translation: 'Triste', pronunciation: 'TREES-teh', english: 'Sad' },
          { translation: 'Ansioso', pronunciation: 'ahn-see-OH-soh', english: 'Anxious' },
          { translation: 'Cansado', pronunciation: 'kahn-SAH-doh', english: 'Tired' },
          { translation: 'Enojado', pronunciation: 'eh-noh-HAH-doh', english: 'Angry' }
        ]
      },
      {
        english: 'Are you having thoughts of hurting yourself?',
        translation: '¿Tiene pensamientos de hacerse daño?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'A veces', pronunciation: 'ah BEH-ses', english: 'Sometimes' },
          { translation: 'No quiero hablar', pronunciation: 'noh kee-EH-roh ah-BLAHR', english: "I don't want to talk" }
        ]
      }
    ],
    tagalog: [
      { english: 'How are you feeling today?', translation: 'Kumusta ang pakiramdam mo ngayon?', responses: [{ translation: 'Mabuti', pronunciation: 'mah-BOO-tee', english: 'Good' }, { translation: 'Masama', pronunciation: 'mah-sah-MAH', english: 'Bad' }] }
    ],
    vietnamese: [
      { english: 'How are you feeling today?', translation: 'Hôm nay bạn cảm thấy thế nào?', responses: [{ translation: 'Tốt', pronunciation: 'toht', english: 'Good' }, { translation: 'Không tốt', pronunciation: 'kohng toht', english: 'Not good' }] }
    ],
    mandarin: [
      { english: 'How are you feeling today?', translation: '你今天感觉怎么样？(Nǐ jīntiān gǎnjué zěnmeyàng?)', responses: [{ translation: '好', pronunciation: 'Hǎo', english: 'Good' }, { translation: '不好', pronunciation: 'Bù hǎo', english: 'Not good' }] }
    ],
    cantonese: [
      { english: 'How are you feeling today?', translation: '你今日感覺點？(Néih gām yaht gám gok dím?)', responses: [{ translation: '好', pronunciation: 'Hóu', english: 'Good' }, { translation: '唔好', pronunciation: 'M̀h hóu', english: 'Not good' }] }
    ]
  },
  'dental-health': {
    spanish: [
      {
        english: 'Do you have tooth pain?',
        translation: '¿Tiene dolor de dientes?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Mucho', pronunciation: 'MOO-choh', english: 'A lot' },
          { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' }
        ]
      },
      {
        english: 'When did you last see a dentist?',
        translation: '¿Cuándo fue la última vez que vio a un dentista?',
        responses: [
          { translation: 'Hace un mes', pronunciation: 'AH-seh oon mehs', english: 'A month ago' },
          { translation: 'Hace un año', pronunciation: 'AH-seh oon AH-nyoh', english: 'A year ago' },
          { translation: 'No recuerdo', pronunciation: 'noh reh-KWEHR-doh', english: "I don't remember" }
        ]
      }
    ],
    tagalog: [
      { english: 'Do you have tooth pain?', translation: 'Masakit ba ang ngipin mo?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Hindi', pronunciation: 'heen-DEE', english: 'No' }] }
    ],
    vietnamese: [
      { english: 'Do you have tooth pain?', translation: 'Bạn có đau răng không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }] }
    ],
    mandarin: [
      { english: 'Do you have tooth pain?', translation: '你牙痛吗？(Nǐ yá tòng ma?)', responses: [{ translation: '痛', pronunciation: 'Tòng', english: 'Yes' }, { translation: '不痛', pronunciation: 'Bù tòng', english: 'No' }] }
    ],
    cantonese: [
      { english: 'Do you have tooth pain?', translation: '你牙痛唔痛？(Néih ngàh tung m̀h tung?)', responses: [{ translation: '痛', pronunciation: 'Tung', english: 'Yes' }, { translation: '唔痛', pronunciation: 'M̀h tung', english: 'No' }] }
    ]
  },
  'emergency-crisis': {
    spanish: [
      {
        english: 'Can you breathe?',
        translation: '¿Puede respirar?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Difícil', pronunciation: 'dee-FEE-seel', english: 'Difficult' }
        ]
      },
      {
        english: 'Are you bleeding?',
        translation: '¿Está sangrando?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Mucho', pronunciation: 'MOO-choh', english: 'A lot' }
        ]
      }
    ],
    tagalog: [
      { english: 'Can you breathe?', translation: 'Makahinga ka ba?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Hindi', pronunciation: 'heen-DEE', english: 'No' }] }
    ],
    vietnamese: [
      { english: 'Can you breathe?', translation: 'Bạn có thở được không?', responses: [{ translation: 'Được', pronunciation: 'dook', english: 'Yes' }, { translation: 'Không được', pronunciation: 'kohng dook', english: 'No' }] }
    ],
    mandarin: [
      { english: 'Can you breathe?', translation: '你能呼吸吗？(Nǐ néng hūxī ma?)', responses: [{ translation: '能', pronunciation: 'Néng', english: 'Yes' }, { translation: '不能', pronunciation: 'Bù néng', english: 'No' }] }
    ],
    cantonese: [
      { english: 'Can you breathe?', translation: '你可唔可以呼吸？(Néih hó m̀h hó yíh fū kāp?)', responses: [{ translation: '可以', pronunciation: 'Hó yíh', english: 'Yes' }, { translation: '唔可以', pronunciation: 'M̀h hó yíh', english: 'No' }] }
    ]
  },
  'safe-haven-immigration': {
    spanish: [
      {
        english: 'Do you need a safe place to stay?',
        translation: '¿Necesita un lugar seguro para quedarse?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Por favor', pronunciation: 'pohr fah-BOHR', english: 'Please' }
        ]
      },
      {
        english: 'Do you have immigration documents?',
        translation: '¿Tiene documentos de inmigración?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'En casa', pronunciation: 'en KAH-sah', english: 'At home' }
        ]
      }
    ],
    tagalog: [
      { english: 'Do you need a safe place to stay?', translation: 'Kailangan mo ba ng ligtas na lugar?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Hindi', pronunciation: 'heen-DEE', english: 'No' }] }
    ],
    vietnamese: [
      { english: 'Do you need a safe place to stay?', translation: 'Bạn có cần nơi an toàn để ở không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }] }
    ],
    mandarin: [
      { english: 'Do you need a safe place to stay?', translation: '你需要安全的住处吗？(Nǐ xūyào ānquán de zhùchù ma?)', responses: [{ translation: '需要', pronunciation: 'Xūyào', english: 'Yes' }, { translation: '不需要', pronunciation: 'Bù xūyào', english: 'No' }] }
    ],
    cantonese: [
      { english: 'Do you need a safe place to stay?', translation: '你需唔需要一個安全嘅地方住？(Néih sēui m̀h sēui yiu yāt go ōn chyùhn ge deih fōng jyuh?)', responses: [{ translation: '需要', pronunciation: 'Sēui yiu', english: 'Yes' }, { translation: '唔需要', pronunciation: 'M̀h sēui yiu', english: 'No' }] }
    ]
  },
  'restorative-justice': {
    spanish: [
      {
        english: 'Would you like to talk about what happened?',
        translation: '¿Quiere hablar sobre lo que pasó?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Más tarde', pronunciation: 'mahs TAHR-deh', english: 'Later' }
        ]
      },
      {
        english: 'How can we help make this right?',
        translation: '¿Cómo podemos ayudar a resolver esto?',
        responses: [
          { translation: 'No sé', pronunciation: 'noh seh', english: "I don't know" },
          { translation: 'Necesito tiempo', pronunciation: 'neh-seh-SEE-toh tee-EHM-poh', english: 'I need time' }
        ]
      }
    ],
    tagalog: [
      { english: 'Would you like to talk about what happened?', translation: 'Gusto mo bang pag-usapan ang nangyari?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Hindi', pronunciation: 'heen-DEE', english: 'No' }] }
    ],
    vietnamese: [
      { english: 'Would you like to talk about what happened?', translation: 'Bạn có muốn nói về chuyện đã xảy ra không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }] }
    ],
    mandarin: [
      { english: 'Would you like to talk about what happened?', translation: '你想谈谈发生了什么吗？(Nǐ xiǎng tántan fāshēngle shénme ma?)', responses: [{ translation: '想', pronunciation: 'Xiǎng', english: 'Yes' }, { translation: '不想', pronunciation: 'Bù xiǎng', english: 'No' }] }
    ],
    cantonese: [
      { english: 'Would you like to talk about what happened?', translation: '你想唔想講下發生咗乜嘢事？(Néih séung m̀h séung góng hah faat sāng jó māt yéh sih?)', responses: [{ translation: '想', pronunciation: 'Séung', english: 'Yes' }, { translation: '唔想', pronunciation: 'M̀h séung', english: 'No' }] }
    ]
  },
  'parent-communication': {
    spanish: [
      {
        english: 'Your child is doing well in school',
        translation: 'Su hijo está yendo bien en la escuela',
        responses: [
          { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
          { translation: 'Me alegro', pronunciation: 'meh ah-LEH-groh', english: "I'm glad" },
          { translation: '¿En qué materias?', pronunciation: 'en keh mah-TEH-ree-ahs', english: 'In which subjects?' }
        ]
      },
      {
        english: 'Can we schedule a meeting?',
        translation: '¿Podemos programar una reunión?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'Cuándo', pronunciation: 'KWAHN-doh', english: 'When' },
          { translation: 'Qué día', pronunciation: 'keh DEE-ah', english: 'What day' }
        ]
      }
    ],
    tagalog: [
      { english: 'Your child is doing well in school', translation: 'Mabuti ang performance ng anak mo sa eskwela', responses: [{ translation: 'Salamat', pronunciation: 'sah-lah-MAHT', english: 'Thank you' }] }
    ],
    vietnamese: [
      { english: 'Your child is doing well in school', translation: 'Con bạn học tốt ở trường', responses: [{ translation: 'Cảm ơn', pronunciation: 'gahm uhn', english: 'Thank you' }] }
    ],
    mandarin: [
      { english: 'Your child is doing well in school', translation: '您的孩子在学校表现很好 (Nín de háizi zài xuéxiào biǎoxiàn hěn hǎo)', responses: [{ translation: '谢谢', pronunciation: 'Xièxiè', english: 'Thank you' }] }
    ],
    cantonese: [
      { english: 'Your child is doing well in school', translation: '你個仔女喺學校表現得好好 (Néih go jái néui hái hohk haauh bíu yìhn dāk hóu hóu)', responses: [{ translation: '多謝', pronunciation: 'Dō jeh', english: 'Thank you' }] }
    ]
  },
  'special-needs': {
    spanish: [
      {
        english: 'Does your child have an IEP?',
        translation: '¿Su hijo tiene un IEP?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'No sé', pronunciation: 'noh seh', english: "I don't know" }
        ]
      },
      {
        english: 'What accommodations does your child need?',
        translation: '¿Qué adaptaciones necesita su hijo?',
        responses: [
          { translation: 'Tiempo extra', pronunciation: 'tee-EHM-poh EX-trah', english: 'Extra time' },
          { translation: 'Ayuda para leer', pronunciation: 'ah-YOO-dah PAH-rah leh-EHR', english: 'Reading help' }
        ]
      }
    ],
    tagalog: [
      { english: 'Does your child have an IEP?', translation: 'May IEP ba ang anak mo?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Wala', pronunciation: 'wah-LAH', english: 'No' }] }
    ],
    vietnamese: [
      { english: 'Does your child have an IEP?', translation: 'Con bạn có IEP không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }] }
    ],
    mandarin: [
      { english: 'Does your child have an IEP?', translation: '您的孩子有IEP吗？(Nín de háizi yǒu IEP ma?)', responses: [{ translation: '有', pronunciation: 'Yǒu', english: 'Yes' }, { translation: '没有', pronunciation: 'Méiyǒu', english: 'No' }] }
    ],
    cantonese: [
      { english: 'Does your child have an IEP?', translation: '你個仔女有冇IEP？(Néih go jái néui yáuh móuh IEP?)', responses: [{ translation: '有', pronunciation: 'Yáuh', english: 'Yes' }, { translation: '冇', pronunciation: 'Móuh', english: 'No' }] }
    ]
  },
  'safety-osha': {
    spanish: [
      {
        english: 'Please wear your safety equipment',
        translation: 'Por favor use su equipo de seguridad',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
          { translation: 'Dónde está', pronunciation: 'DOHN-deh es-TAH', english: 'Where is it' }
        ]
      },
      {
        english: 'This area is dangerous',
        translation: 'Esta área es peligrosa',
        responses: [
          { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
          { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' }
        ]
      }
    ],
    tagalog: [
      { english: 'Please wear your safety equipment', translation: 'Pakisuot ang iyong safety equipment', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' }] }
    ],
    vietnamese: [
      { english: 'Please wear your safety equipment', translation: 'Vui lòng đeo thiết bị an toàn', responses: [{ translation: 'Được', pronunciation: 'dook', english: 'Yes' }, { translation: 'Vâng', pronunciation: 'vung', english: 'Okay' }] }
    ],
    mandarin: [
      { english: 'Please wear your safety equipment', translation: '请穿戴安全装备 (Qǐng chuāndài ānquán zhuāngbèi)', responses: [{ translation: '好的', pronunciation: 'Hǎo de', english: 'Yes' }, { translation: '明白', pronunciation: 'Míngbái', english: 'Understood' }] }
    ],
    cantonese: [
      { english: 'Please wear your safety equipment', translation: '請戴好安全裝備 (Chéng daai hóu ōn chyùhn jōng beih)', responses: [{ translation: '好', pronunciation: 'Hóu', english: 'Yes' }, { translation: '明白', pronunciation: 'Mìhng baahk', english: 'Understood' }] }
    ]
  },
  'injury-emergency': {
    spanish: [
      {
        english: 'Are you injured?',
        translation: '¿Está herido?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' }
        ]
      },
      {
        english: 'Stay still, help is coming',
        translation: 'Quédese quieto, viene ayuda',
        responses: [
          { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
          { translation: 'Me duele', pronunciation: 'meh DWEH-leh', english: 'It hurts' }
        ]
      }
    ],
    tagalog: [
      { english: 'Are you injured?', translation: 'May sugat ka ba?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Wala', pronunciation: 'wah-LAH', english: 'No' }] }
    ],
    vietnamese: [
      { english: 'Are you injured?', translation: 'Bạn có bị thương không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }] }
    ],
    mandarin: [
      { english: 'Are you injured?', translation: '你受伤了吗？(Nǐ shòushāngle ma?)', responses: [{ translation: '受伤了', pronunciation: 'Shòushāngle', english: 'Yes' }, { translation: '没有', pronunciation: 'Méiyǒu', english: 'No' }] }
    ],
    cantonese: [
      { english: 'Are you injured?', translation: '你有冇受傷？(Néih yáuh móuh sauh sēung?)', responses: [{ translation: '有', pronunciation: 'Yáuh', english: 'Yes' }, { translation: '冇', pronunciation: 'Móuh', english: 'No' }] }
    ]
  },
  'general-worksite': {
    spanish: [
      {
        english: 'What time does work start?',
        translation: '¿A qué hora empieza el trabajo?',
        responses: [
          { translation: 'A las siete', pronunciation: 'ah lahs see-EH-teh', english: 'At seven' },
          { translation: 'A las ocho', pronunciation: 'ah lahs OH-choh', english: 'At eight' },
          { translation: 'No sé', pronunciation: 'noh seh', english: "I don't know" }
        ]
      },
      {
        english: 'Where are the tools?',
        translation: '¿Dónde están las herramientas?',
        responses: [
          { translation: 'En el camión', pronunciation: 'en el kah-mee-OHN', english: 'In the truck' },
          { translation: 'Allá', pronunciation: 'ah-YAH', english: 'Over there' }
        ]
      }
    ],
    tagalog: [
      { english: 'What time does work start?', translation: 'Anong oras magsisimula ang trabaho?', responses: [{ translation: 'Alas siyete', pronunciation: 'AH-lahs see-YEH-teh', english: 'At seven' }] }
    ],
    vietnamese: [
      { english: 'What time does work start?', translation: 'Mấy giờ bắt đầu làm việc?', responses: [{ translation: 'Bảy giờ', pronunciation: 'bai zuh', english: 'Seven o\'clock' }] }
    ],
    mandarin: [
      { english: 'What time does work start?', translation: '几点开始工作？(Jǐ diǎn kāishǐ gōngzuò?)', responses: [{ translation: '七点', pronunciation: 'Qī diǎn', english: 'Seven o\'clock' }] }
    ],
    cantonese: [
      { english: 'What time does work start?', translation: '幾點開始做嘢？(Géi dím hōi chí jouh yéh?)', responses: [{ translation: '七點', pronunciation: 'Chāt dím', english: 'Seven o\'clock' }] }
    ]
  }
};
