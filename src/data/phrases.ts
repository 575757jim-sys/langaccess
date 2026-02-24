export type Language = 'spanish' | 'tagalog' | 'vietnamese' | 'mandarin' | 'cantonese';
export type Sector = 'healthcare' | 'education' | 'construction';

export interface Response {
  translation: string;
  pronunciation: string;
  english: string;
}

export interface ChineseTranslations {
  zh_traditional?: string;
  zh_simplified?: string;
}

export interface Phrase {
  english: string;
  translation: string;
  translations?: ChineseTranslations;
  responses: Response[];
  reviewedBy?: string;
  lastReviewed?: string;
  version?: string;
  isVital?: boolean;
}

export interface CustomPhrase {
  id: string;
  english: string;
  translation: string;
  language: Language;
  sector: Sector;
  subcategory?: string;
  createdAt: number;
}

export interface LanguageData {
  name: string;
  phrases: Phrase[];
}

export interface SectorInfo {
  id: Sector;
  label: string;
  icon: string;
  color: string;
  showToLabel: string;
}

export const languageData: Record<Language, LanguageData> = {
  spanish: {
    name: 'Spanish',
    phrases: [
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
      },
      {
        english: 'When did the pain start?',
        translation: '¿Cuándo comenzó el dolor?',
        responses: [
          { translation: 'Hoy', pronunciation: 'oy', english: 'Today' },
          { translation: 'Ayer', pronunciation: 'ah-YEHR', english: 'Yesterday' },
          { translation: 'Esta mañana', pronunciation: 'EHS-tah mah-NYAH-nah', english: 'This morning' },
          { translation: 'Anoche', pronunciation: 'ah-NOH-cheh', english: 'Last night' },
          { translation: 'Hace una semana', pronunciation: 'AH-seh OO-nah seh-MAH-nah', english: 'A week ago' },
          { translation: 'No sé', pronunciation: 'noh seh', english: "I don't know" }
        ]
      },
      {
        english: 'Do you have a fever?',
        translation: '¿Tiene fiebre?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Sí, alta', pronunciation: 'see, AHL-tah', english: 'Yes, high' },
          { translation: 'No estoy seguro', pronunciation: 'noh es-TOY seh-GOO-roh', english: 'Not sure' },
          { translation: 'Caliente', pronunciation: 'kah-lee-EHN-teh', english: 'Hot' },
          { translation: 'Frío', pronunciation: 'FREE-oh', english: 'Cold' }
        ]
      },
      {
        english: 'Have you been vomiting?',
        translation: '¿Ha estado vomitando?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' },
          { translation: 'Mucho', pronunciation: 'MOO-choh', english: 'A lot' },
          { translation: 'Esta mañana', pronunciation: 'EHS-tah mah-NYAH-nah', english: 'This morning' },
          { translation: 'Con sangre', pronunciation: 'kohn SAHN-greh', english: 'With blood' }
        ]
      },
      {
        english: 'Can you breathe normally?',
        translation: '¿Puede respirar normalmente?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Difícil', pronunciation: 'dee-FEE-seel', english: 'Difficult' },
          { translation: 'Sin aliento', pronunciation: 'seen ah-lee-EHN-toh', english: 'Short of breath' },
          { translation: 'A veces', pronunciation: 'ah BEH-ses', english: 'Sometimes' },
          { translation: 'Duele', pronunciation: 'DWEH-leh', english: 'Painful' }
        ]
      },
      {
        english: 'Are you dizzy?',
        translation: '¿Está mareado?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' },
          { translation: 'Mucho', pronunciation: 'MOO-choh', english: 'Very' },
          { translation: 'Todo da vueltas', pronunciation: 'TOH-doh dah VWEL-tahs', english: 'Spinning' },
          { translation: 'A veces', pronunciation: 'ah BEH-ses', english: 'Sometimes' }
        ]
      },
      {
        english: 'Do you need an interpreter?',
        translation: '¿Necesita un intérprete?',
        responses: [
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: 'No', pronunciation: 'noh', english: 'No' },
          { translation: 'Sí, por favor', pronunciation: 'see, pohr fah-BOHR', english: 'Yes, please' },
          { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
          { translation: 'No hablo inglés', pronunciation: 'noh AH-bloh een-GLEHS', english: "I don't speak English" },
          { translation: 'Un poco de inglés', pronunciation: 'oon POH-koh deh een-GLEHS', english: 'A little English' }
        ]
      },
      {
        english: 'Please sign here',
        translation: 'Por favor firme aquí',
        responses: [
          { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
          { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
          { translation: '¿Dónde?', pronunciation: 'DOHN-deh', english: 'Where?' },
          { translation: 'No entiendo', pronunciation: 'noh en-tee-EHN-doh', english: "I don't understand" },
          { translation: '¿Qué es esto?', pronunciation: 'keh es EHS-toh', english: 'What is this?' },
          { translation: 'Necesito ayuda', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah', english: 'I need help' }
        ]
      }
    ]
  },
  tagalog: {
    name: 'Tagalog',
    phrases: [
      { english: 'Where does it hurt?', translation: 'Saan ka masakit?', responses: [{ translation: 'Ulo', pronunciation: 'OO-loh', english: 'Head' }, { translation: 'Dibdib', pronunciation: 'deeb-DEEB', english: 'Chest' }, { translation: 'Tiyan', pronunciation: 'tee-YAHN', english: 'Stomach' }, { translation: 'Likod', pronunciation: 'LEE-kohd', english: 'Back' }, { translation: 'Binti', pronunciation: 'been-TEE', english: 'Leg' }, { translation: 'Braso', pronunciation: 'BRAH-soh', english: 'Arm' }] },
      { english: 'Do you have any allergies?', translation: 'Mayroon ka bang allergy?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Wala', pronunciation: 'wah-LAH', english: 'No' }, { translation: 'Penicillin', pronunciation: 'peh-nee-SEE-leen', english: 'Penicillin' }, { translation: 'Mani', pronunciation: 'mah-NEE', english: 'Peanuts' }, { translation: 'Hindi ko alam', pronunciation: 'heen-DEE koh ah-LAHM', english: "I don't know" }, { translation: 'Seafood', pronunciation: 'SEE-food', english: 'Seafood' }] },
      { english: 'Are you taking any medications?', translation: 'Umiinom ka ba ng gamot?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Hindi', pronunciation: 'heen-DEE', english: 'No' }, { translation: 'Para sa diabetes', pronunciation: 'PAH-rah sah dee-ah-BEH-tehs', english: 'For diabetes' }, { translation: 'Para sa puso', pronunciation: 'PAH-rah sah POO-soh', english: 'For the heart' }, { translation: 'Hindi ko matandaan', pronunciation: 'heen-DEE koh mah-tahn-DAH-ahn', english: "I don't remember" }, { translation: 'Aspirin', pronunciation: 'ahs-pee-REEN', english: 'Aspirin' }] },
      { english: 'When did the pain start?', translation: 'Kailan nagsimula ang sakit?', responses: [{ translation: 'Ngayon', pronunciation: 'ngah-YOHN', english: 'Today' }, { translation: 'Kahapon', pronunciation: 'kah-hah-POHN', english: 'Yesterday' }, { translation: 'Ngayong umaga', pronunciation: 'ngah-YOHNG oo-MAH-gah', english: 'This morning' }, { translation: 'Kagabi', pronunciation: 'kah-gah-BEE', english: 'Last night' }, { translation: 'Isang linggo na', pronunciation: 'ee-SAHNG leeng-GOH nah', english: 'A week ago' }, { translation: 'Hindi ko alam', pronunciation: 'heen-DEE koh ah-LAHM', english: "I don't know" }] },
      { english: 'Do you have a fever?', translation: 'May lagnat ka ba?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Wala', pronunciation: 'wah-LAH', english: 'No' }, { translation: 'Oo, mataas', pronunciation: 'oh-OH, mah-tah-AHS', english: 'Yes, high' }, { translation: 'Hindi sigurado', pronunciation: 'heen-DEE see-goo-RAH-doh', english: 'Not sure' }, { translation: 'Mainit', pronunciation: 'mah-ee-NEET', english: 'Hot' }, { translation: 'Malamig', pronunciation: 'mah-lah-MEEG', english: 'Cold' }] },
      { english: 'Have you been vomiting?', translation: 'Nagsusuka ka ba?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Hindi', pronunciation: 'heen-DEE', english: 'No' }, { translation: 'Kaunti', pronunciation: 'kah-oon-TEE', english: 'A little' }, { translation: 'Marami', pronunciation: 'mah-rah-MEE', english: 'A lot' }, { translation: 'Ngayong umaga', pronunciation: 'ngah-YOHNG oo-MAH-gah', english: 'This morning' }, { translation: 'May dugo', pronunciation: 'my DOO-goh', english: 'With blood' }] },
      { english: 'Can you breathe normally?', translation: 'Makahinga ka ba ng normal?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Hindi', pronunciation: 'heen-DEE', english: 'No' }, { translation: 'Mahirap', pronunciation: 'mah-hee-RAHP', english: 'Difficult' }, { translation: 'Maikli ang hininga', pronunciation: 'mah-eek-LEE ahng hee-NEE-ngah', english: 'Short of breath' }, { translation: 'Minsan', pronunciation: 'meen-SAHN', english: 'Sometimes' }, { translation: 'Masakit', pronunciation: 'mah-sah-KEET', english: 'Painful' }] },
      { english: 'Are you dizzy?', translation: 'Nahihilo ka ba?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Hindi', pronunciation: 'heen-DEE', english: 'No' }, { translation: 'Kaunti', pronunciation: 'kah-oon-TEE', english: 'A little' }, { translation: 'Sobra', pronunciation: 'SOH-brah', english: 'Very' }, { translation: 'Umiikot', pronunciation: 'oo-mee-ee-KOHT', english: 'Spinning' }, { translation: 'Minsan', pronunciation: 'meen-SAHN', english: 'Sometimes' }] },
      { english: 'Do you need an interpreter?', translation: 'Kailangan mo ba ng interpreter?', responses: [{ translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Hindi', pronunciation: 'heen-DEE', english: 'No' }, { translation: 'Oo, pakiusap', pronunciation: 'oh-OH, pah-kee-OO-sahp', english: 'Yes, please' }, { translation: 'Salamat', pronunciation: 'sah-lah-MAHT', english: 'Thank you' }, { translation: 'Hindi ako marunong mag-English', pronunciation: 'heen-DEE ah-KOH mah-roo-NOHNG mahg ENG-gleesh', english: "I don't speak English" }, { translation: 'Kaunting English', pronunciation: 'kah-oon-TEENG ENG-gleesh', english: 'A little English' }] },
      { english: 'Please sign here', translation: 'Paki-sign dito', responses: [{ translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' }, { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }, { translation: 'Saan?', pronunciation: 'sah-AHN', english: 'Where?' }, { translation: 'Hindi ko naiintindihan', pronunciation: 'heen-DEE koh nah-een-teen-dee-HAHN', english: "I don't understand" }, { translation: 'Ano ito?', pronunciation: 'ah-NOH ee-TOH', english: 'What is this?' }, { translation: 'Kailangan ko ng tulong', pronunciation: 'kah-ee-LAH-ngahn koh nahng too-LOHNG', english: 'I need help' }] }
    ]
  },
  vietnamese: {
    name: 'Vietnamese',
    phrases: [
      { english: 'Where does it hurt?', translation: 'Đau ở đâu?', responses: [{ translation: 'Đầu', pronunciation: 'dow', english: 'Head' }, { translation: 'Ngực', pronunciation: 'ngooc', english: 'Chest' }, { translation: 'Bụng', pronunciation: 'boong', english: 'Stomach' }, { translation: 'Lưng', pronunciation: 'loong', english: 'Back' }, { translation: 'Chân', pronunciation: 'chun', english: 'Leg' }, { translation: 'Cánh tay', pronunciation: 'gahn tay', english: 'Arm' }] },
      { english: 'Do you have any allergies?', translation: 'Bạn có dị ứng gì không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }, { translation: 'Penicillin', pronunciation: 'peh-nee-see-leen', english: 'Penicillin' }, { translation: 'Đậu phộng', pronunciation: 'dow fohng', english: 'Peanuts' }, { translation: 'Tôi không biết', pronunciation: 'toy kohng bee-et', english: "I don't know" }, { translation: 'Hải sản', pronunciation: 'hai sahn', english: 'Seafood' }] },
      { english: 'Are you taking any medications?', translation: 'Bạn có đang uống thuốc gì không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }, { translation: 'Cho bệnh tiểu đường', pronunciation: 'cho benh tee-ow doo-ong', english: 'For diabetes' }, { translation: 'Cho tim', pronunciation: 'cho teem', english: 'For the heart' }, { translation: 'Tôi không nhớ', pronunciation: 'toy kohng nyo', english: "I don't remember" }, { translation: 'Aspirin', pronunciation: 'ah-spee-reen', english: 'Aspirin' }] },
      { english: 'When did the pain start?', translation: 'Khi nào bắt đầu đau?', responses: [{ translation: 'Hôm nay', pronunciation: 'hohm nay', english: 'Today' }, { translation: 'Hôm qua', pronunciation: 'hohm gwah', english: 'Yesterday' }, { translation: 'Sáng nay', pronunciation: 'sahng nay', english: 'This morning' }, { translation: 'Đêm qua', pronunciation: 'dem gwah', english: 'Last night' }, { translation: 'Một tuần trước', pronunciation: 'moht too-un trook', english: 'A week ago' }, { translation: 'Tôi không biết', pronunciation: 'toy kohng bee-et', english: "I don't know" }] },
      { english: 'Do you have a fever?', translation: 'Bạn có bị sốt không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }, { translation: 'Có, cao', pronunciation: 'gaw, gao', english: 'Yes, high' }, { translation: 'Không chắc', pronunciation: 'kohng chak', english: 'Not sure' }, { translation: 'Nóng', pronunciation: 'nawng', english: 'Hot' }, { translation: 'Lạnh', pronunciation: 'lahn', english: 'Cold' }] },
      { english: 'Have you been vomiting?', translation: 'Bạn có bị nôn không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }, { translation: 'Một chút', pronunciation: 'moht choot', english: 'A little' }, { translation: 'Nhiều', pronunciation: 'nyew', english: 'A lot' }, { translation: 'Sáng nay', pronunciation: 'sahng nay', english: 'This morning' }, { translation: 'Có máu', pronunciation: 'gaw mow', english: 'With blood' }] },
      { english: 'Can you breathe normally?', translation: 'Bạn có thở bình thường không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }, { translation: 'Khó khăn', pronunciation: 'kaw kun', english: 'Difficult' }, { translation: 'Khó thở', pronunciation: 'kaw tuh', english: 'Short of breath' }, { translation: 'Thỉnh thoảng', pronunciation: 'thin toh-ahng', english: 'Sometimes' }, { translation: 'Đau', pronunciation: 'dow', english: 'Painful' }] },
      { english: 'Are you dizzy?', translation: 'Bạn có bị chóng mặt không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }, { translation: 'Một chút', pronunciation: 'moht choot', english: 'A little' }, { translation: 'Rất', pronunciation: 'rut', english: 'Very' }, { translation: 'Quay cuồng', pronunciation: 'gway goong', english: 'Spinning' }, { translation: 'Thỉnh thoảng', pronunciation: 'thin toh-ahng', english: 'Sometimes' }] },
      { english: 'Do you need an interpreter?', translation: 'Bạn có cần thông dịch viên không?', responses: [{ translation: 'Có', pronunciation: 'gaw', english: 'Yes' }, { translation: 'Không', pronunciation: 'kohng', english: 'No' }, { translation: 'Có, làm ơn', pronunciation: 'gaw, lahm uhn', english: 'Yes, please' }, { translation: 'Cảm ơn', pronunciation: 'gahm uhn', english: 'Thank you' }, { translation: 'Tôi không nói tiếng Anh', pronunciation: 'toy kohng noy tee-eng ahng', english: "I don't speak English" }, { translation: 'Một chút tiếng Anh', pronunciation: 'moht choot tee-eng ahng', english: 'A little English' }] },
      { english: 'Please sign here', translation: 'Xin vui lòng ký tên ở đây', responses: [{ translation: 'Được', pronunciation: 'dook', english: 'Okay' }, { translation: 'Vâng', pronunciation: 'vung', english: 'Yes' }, { translation: 'Ở đâu?', pronunciation: 'uh dow', english: 'Where?' }, { translation: 'Tôi không hiểu', pronunciation: 'toy kohng hee-ew', english: "I don't understand" }, { translation: 'Cái này là gì?', pronunciation: 'gai nay lah zee', english: 'What is this?' }, { translation: 'Tôi cần giúp đỡ', pronunciation: 'toy gun yoop duh', english: 'I need help' }] }
    ]
  },
  mandarin: {
    name: 'Mandarin',
    phrases: [
      { english: 'Where does it hurt?', translation: '哪里痛？(Nǎlǐ tòng?)', responses: [{ translation: '头', pronunciation: 'Tóu', english: 'Head' }, { translation: '胸部', pronunciation: 'Xiōngbù', english: 'Chest' }, { translation: '肚子', pronunciation: 'Dùzi', english: 'Stomach' }, { translation: '背部', pronunciation: 'Bèibù', english: 'Back' }, { translation: '腿', pronunciation: 'Tuǐ', english: 'Leg' }, { translation: '手臂', pronunciation: 'Shǒubì', english: 'Arm' }] },
      { english: 'Do you have any allergies?', translation: '你有过敏吗？(Nǐ yǒu guòmǐn ma?)', responses: [{ translation: '有', pronunciation: 'Yǒu', english: 'Yes' }, { translation: '没有', pronunciation: 'Méiyǒu', english: 'No' }, { translation: '青霉素', pronunciation: 'Qīngméisù', english: 'Penicillin' }, { translation: '花生', pronunciation: 'Huāshēng', english: 'Peanuts' }, { translation: '我不知道', pronunciation: 'Wǒ bù zhīdào', english: "I don't know" }, { translation: '海鲜', pronunciation: 'Hǎixiān', english: 'Seafood' }] },
      { english: 'Are you taking any medications?', translation: '你在服用什么药物吗？(Nǐ zài fúyòng shénme yàowù ma?)', responses: [{ translation: '有', pronunciation: 'Yǒu', english: 'Yes' }, { translation: '没有', pronunciation: 'Méiyǒu', english: 'No' }, { translation: '糖尿病药', pronunciation: 'Tángniàobìng yào', english: 'Diabetes medicine' }, { translation: '心脏药', pronunciation: 'Xīnzàng yào', english: 'Heart medicine' }, { translation: '我忘了', pronunciation: 'Wǒ wàngle', english: "I forgot" }, { translation: '阿司匹林', pronunciation: 'Āsīpǐlín', english: 'Aspirin' }] },
      { english: 'When did the pain start?', translation: '什么时候开始痛的？(Shénme shíhòu kāishǐ tòng de?)', responses: [{ translation: '今天', pronunciation: 'Jīntiān', english: 'Today' }, { translation: '昨天', pronunciation: 'Zuótiān', english: 'Yesterday' }, { translation: '今天早上', pronunciation: 'Jīntiān zǎoshang', english: 'This morning' }, { translation: '昨晚', pronunciation: 'Zuówǎn', english: 'Last night' }, { translation: '一周前', pronunciation: 'Yī zhōu qián', english: 'A week ago' }, { translation: '我不知道', pronunciation: 'Wǒ bù zhīdào', english: "I don't know" }] },
      { english: 'Do you have a fever?', translation: '你发烧吗？(Nǐ fāshāo ma?)', responses: [{ translation: '有', pronunciation: 'Yǒu', english: 'Yes' }, { translation: '没有', pronunciation: 'Méiyǒu', english: 'No' }, { translation: '有，很高', pronunciation: 'Yǒu, hěn gāo', english: 'Yes, high' }, { translation: '不确定', pronunciation: 'Bù quèdìng', english: 'Not sure' }, { translation: '热', pronunciation: 'Rè', english: 'Hot' }, { translation: '冷', pronunciation: 'Lěng', english: 'Cold' }] },
      { english: 'Have you been vomiting?', translation: '你呕吐了吗？(Nǐ ǒutù le ma?)', responses: [{ translation: '有', pronunciation: 'Yǒu', english: 'Yes' }, { translation: '没有', pronunciation: 'Méiyǒu', english: 'No' }, { translation: '一点点', pronunciation: 'Yīdiǎndiǎn', english: 'A little' }, { translation: '很多', pronunciation: 'Hěnduō', english: 'A lot' }, { translation: '今天早上', pronunciation: 'Jīntiān zǎoshang', english: 'This morning' }, { translation: '有血', pronunciation: 'Yǒu xiě', english: 'With blood' }] },
      { english: 'Can you breathe normally?', translation: '你能正常呼吸吗？(Nǐ néng zhèngcháng hūxī ma?)', responses: [{ translation: '能', pronunciation: 'Néng', english: 'Yes' }, { translation: '不能', pronunciation: 'Bù néng', english: 'No' }, { translation: '困难', pronunciation: 'Kùnnán', english: 'Difficult' }, { translation: '呼吸急促', pronunciation: 'Hūxī jícù', english: 'Short of breath' }, { translation: '有时候', pronunciation: 'Yǒu shíhòu', english: 'Sometimes' }, { translation: '痛', pronunciation: 'Tòng', english: 'Painful' }] },
      { english: 'Are you dizzy?', translation: '你头晕吗？(Nǐ tóuyūn ma?)', responses: [{ translation: '晕', pronunciation: 'Yūn', english: 'Yes' }, { translation: '不晕', pronunciation: 'Bù yūn', english: 'No' }, { translation: '一点点', pronunciation: 'Yīdiǎndiǎn', english: 'A little' }, { translation: '很晕', pronunciation: 'Hěn yūn', english: 'Very' }, { translation: '天旋地转', pronunciation: 'Tiānxuán dìzhuǎn', english: 'Spinning' }, { translation: '有时候', pronunciation: 'Yǒu shíhòu', english: 'Sometimes' }] },
      { english: 'Do you need an interpreter?', translation: '你需要翻译吗？(Nǐ xūyào fānyì ma?)', responses: [{ translation: '需要', pronunciation: 'Xūyào', english: 'Yes' }, { translation: '不需要', pronunciation: 'Bù xūyào', english: 'No' }, { translation: '是的，谢谢', pronunciation: 'Shì de, xièxiè', english: 'Yes, please' }, { translation: '谢谢', pronunciation: 'Xièxiè', english: 'Thank you' }, { translation: '我不会说英语', pronunciation: 'Wǒ bù huì shuō Yīngyǔ', english: "I don't speak English" }, { translation: '一点英语', pronunciation: 'Yīdiǎn Yīngyǔ', english: 'A little English' }] },
      { english: 'Please sign here', translation: '请在这里签名 (Qǐng zài zhèlǐ qiānmíng)', responses: [{ translation: '好的', pronunciation: 'Hǎo de', english: 'Okay' }, { translation: '是', pronunciation: 'Shì', english: 'Yes' }, { translation: '在哪里？', pronunciation: 'Zài nǎlǐ?', english: 'Where?' }, { translation: '我不明白', pronunciation: 'Wǒ bù míngbái', english: "I don't understand" }, { translation: '这是什么？', pronunciation: 'Zhè shì shénme?', english: 'What is this?' }, { translation: '我需要帮助', pronunciation: 'Wǒ xūyào bāngzhù', english: 'I need help' }] }
    ]
  },
  cantonese: {
    name: 'Cantonese',
    phrases: [
      { english: 'Where does it hurt?', translation: '邊度痛？(Bīn douh tung?)', responses: [{ translation: '頭', pronunciation: 'Tàuh', english: 'Head' }, { translation: '胸口', pronunciation: 'Hūng háu', english: 'Chest' }, { translation: '肚', pronunciation: 'Tóuh', english: 'Stomach' }, { translation: '背脊', pronunciation: 'Bui jek', english: 'Back' }, { translation: '腳', pronunciation: 'Geuk', english: 'Leg' }, { translation: '手臂', pronunciation: 'Sáu bei', english: 'Arm' }] },
      { english: 'Do you have any allergies?', translation: '你有冇敏感？(Néih yáuh móuh mán gám?)', responses: [{ translation: '有', pronunciation: 'Yáuh', english: 'Yes' }, { translation: '冇', pronunciation: 'Móuh', english: 'No' }, { translation: '盤尼西林', pronunciation: 'Pùhn néih sāi làhm', english: 'Penicillin' }, { translation: '花生', pronunciation: 'Fā sāng', english: 'Peanuts' }, { translation: '我唔知', pronunciation: 'Ngóh m̀h jī', english: "I don't know" }, { translation: '海鮮', pronunciation: 'Hói sīn', english: 'Seafood' }] },
      { english: 'Are you taking any medications?', translation: '你有冇食緊藥？(Néih yáuh móuh sihk gán yeuhk?)', responses: [{ translation: '有', pronunciation: 'Yáuh', english: 'Yes' }, { translation: '冇', pronunciation: 'Móuh', english: 'No' }, { translation: '糖尿病藥', pronunciation: 'Tòhng niuh behng yeuhk', english: 'Diabetes medicine' }, { translation: '心臟藥', pronunciation: 'Sām johng yeuhk', english: 'Heart medicine' }, { translation: '我唔記得', pronunciation: 'Ngóh m̀h gei dák', english: 'I forgot' }, { translation: '阿士匹靈', pronunciation: 'Ah sí pāt lìhng', english: 'Aspirin' }] },
      { english: 'When did the pain start?', translation: '幾時開始痛？(Géi sìh hōi chí tung?)', responses: [{ translation: '今日', pronunciation: 'Gām yaht', english: 'Today' }, { translation: '琴日', pronunciation: 'Kàhm yaht', english: 'Yesterday' }, { translation: '今朝', pronunciation: 'Gām jīu', english: 'This morning' }, { translation: '琴晚', pronunciation: 'Kàhm máahn', english: 'Last night' }, { translation: '一個禮拜前', pronunciation: 'Yāt go láih baai chìhn', english: 'A week ago' }, { translation: '我唔知', pronunciation: 'Ngóh m̀h jī', english: "I don't know" }] },
      { english: 'Do you have a fever?', translation: '你有冇發燒？(Néih yáuh móuh faat sīu?)', responses: [{ translation: '有', pronunciation: 'Yáuh', english: 'Yes' }, { translation: '冇', pronunciation: 'Móuh', english: 'No' }, { translation: '有，好高', pronunciation: 'Yáuh, hóu gōu', english: 'Yes, high' }, { translation: '唔肯定', pronunciation: 'M̀h háng dihng', english: 'Not sure' }, { translation: '熱', pronunciation: 'Yiht', english: 'Hot' }, { translation: '凍', pronunciation: 'Dung', english: 'Cold' }] },
      { english: 'Have you been vomiting?', translation: '你有冇嘔？(Néih yáuh móuh ngáu?)', responses: [{ translation: '有', pronunciation: 'Yáuh', english: 'Yes' }, { translation: '冇', pronunciation: 'Móuh', english: 'No' }, { translation: '少少', pronunciation: 'Síu síu', english: 'A little' }, { translation: '好多', pronunciation: 'Hóu dō', english: 'A lot' }, { translation: '今朝', pronunciation: 'Gām jīu', english: 'This morning' }, { translation: '有血', pronunciation: 'Yáuh hyut', english: 'With blood' }] },
      { english: 'Can you breathe normally?', translation: '你呼吸正唔正常？(Néih fū kāp jing m̀h jing sèuhng?)', responses: [{ translation: '正常', pronunciation: 'Jing sèuhng', english: 'Yes' }, { translation: '唔正常', pronunciation: 'M̀h jing sèuhng', english: 'No' }, { translation: '困難', pronunciation: 'Kwán nàahn', english: 'Difficult' }, { translation: '氣促', pronunciation: 'Hei chūk', english: 'Short of breath' }, { translation: '有時', pronunciation: 'Yáuh sìh', english: 'Sometimes' }, { translation: '痛', pronunciation: 'Tung', english: 'Painful' }] },
      { english: 'Are you dizzy?', translation: '你頭暈唔暈？(Néih tàuh wahn m̀h wahn?)', responses: [{ translation: '暈', pronunciation: 'Wahn', english: 'Yes' }, { translation: '唔暈', pronunciation: 'M̀h wahn', english: 'No' }, { translation: '少少', pronunciation: 'Síu síu', english: 'A little' }, { translation: '好暈', pronunciation: 'Hóu wahn', english: 'Very' }, { translation: '天旋地轉', pronunciation: 'Tīn syùhn deih jyún', english: 'Spinning' }, { translation: '有時', pronunciation: 'Yáuh sìh', english: 'Sometimes' }] },
      { english: 'Do you need an interpreter?', translation: '你需唔需要翻譯？(Néih sēui m̀h sēui yiu fāan yihk?)', responses: [{ translation: '需要', pronunciation: 'Sēui yiu', english: 'Yes' }, { translation: '唔需要', pronunciation: 'M̀h sēui yiu', english: 'No' }, { translation: '係，唔該', pronunciation: 'Haih, m̀h gōi', english: 'Yes, please' }, { translation: '多謝', pronunciation: 'Dō jeh', english: 'Thank you' }, { translation: '我唔識講英文', pronunciation: 'Ngóh m̀h sīk góng Yīng mán', english: "I don't speak English" }, { translation: '識少少英文', pronunciation: 'Sīk síu síu Yīng mán', english: 'A little English' }] },
      { english: 'Please sign here', translation: '請喺度簽名 (Chéng hái douh chīm méng)', responses: [{ translation: '好', pronunciation: 'Hóu', english: 'Okay' }, { translation: '得', pronunciation: 'Dāk', english: 'Yes' }, { translation: '邊度？', pronunciation: 'Bīn douh?', english: 'Where?' }, { translation: '我唔明', pronunciation: 'Ngóh m̀h mìhng', english: "I don't understand" }, { translation: '呢個係乜嘢？', pronunciation: 'Nī go haih māt yéh?', english: 'What is this?' }, { translation: '我需要幫手', pronunciation: 'Ngóh sēui yiu bōng sáu', english: 'I need help' }] }
    ]
  }
};
