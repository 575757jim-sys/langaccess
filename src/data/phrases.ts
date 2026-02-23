export type Language = 'spanish' | 'tagalog' | 'vietnamese' | 'mandarin' | 'cantonese';

export interface Phrase {
  english: string;
  translation: string;
}

export interface LanguageData {
  name: string;
  phrases: Phrase[];
}

export const languageData: Record<Language, LanguageData> = {
  spanish: {
    name: 'Spanish',
    phrases: [
      { english: 'Where does it hurt?', translation: '¿Dónde le duele?' },
      { english: 'Do you have any allergies?', translation: '¿Tiene alergias?' },
      { english: 'Are you taking any medications?', translation: '¿Está tomando algún medicamento?' },
      { english: 'When did the pain start?', translation: '¿Cuándo comenzó el dolor?' },
      { english: 'Do you have a fever?', translation: '¿Tiene fiebre?' },
      { english: 'Have you been vomiting?', translation: '¿Ha estado vomitando?' },
      { english: 'Can you breathe normally?', translation: '¿Puede respirar normalmente?' },
      { english: 'Are you dizzy?', translation: '¿Está mareado?' },
      { english: 'Do you need an interpreter?', translation: '¿Necesita un intérprete?' },
      { english: 'Please sign here', translation: 'Por favor firme aquí' }
    ]
  },
  tagalog: {
    name: 'Tagalog',
    phrases: [
      { english: 'Where does it hurt?', translation: 'Saan ka masakit?' },
      { english: 'Do you have any allergies?', translation: 'Mayroon ka bang allergy?' },
      { english: 'Are you taking any medications?', translation: 'Umiinom ka ba ng gamot?' },
      { english: 'When did the pain start?', translation: 'Kailan nagsimula ang sakit?' },
      { english: 'Do you have a fever?', translation: 'May lagnat ka ba?' },
      { english: 'Have you been vomiting?', translation: 'Nagsusuka ka ba?' },
      { english: 'Can you breathe normally?', translation: 'Makahinga ka ba ng normal?' },
      { english: 'Are you dizzy?', translation: 'Nahihilo ka ba?' },
      { english: 'Do you need an interpreter?', translation: 'Kailangan mo ba ng interpreter?' },
      { english: 'Please sign here', translation: 'Paki-sign dito' }
    ]
  },
  vietnamese: {
    name: 'Vietnamese',
    phrases: [
      { english: 'Where does it hurt?', translation: 'Đau ở đâu?' },
      { english: 'Do you have any allergies?', translation: 'Bạn có dị ứng gì không?' },
      { english: 'Are you taking any medications?', translation: 'Bạn có đang uống thuốc gì không?' },
      { english: 'When did the pain start?', translation: 'Khi nào bắt đầu đau?' },
      { english: 'Do you have a fever?', translation: 'Bạn có bị sốt không?' },
      { english: 'Have you been vomiting?', translation: 'Bạn có bị nôn không?' },
      { english: 'Can you breathe normally?', translation: 'Bạn có thở bình thường không?' },
      { english: 'Are you dizzy?', translation: 'Bạn có bị chóng mặt không?' },
      { english: 'Do you need an interpreter?', translation: 'Bạn có cần thông dịch viên không?' },
      { english: 'Please sign here', translation: 'Xin vui lòng ký tên ở đây' }
    ]
  },
  mandarin: {
    name: 'Mandarin',
    phrases: [
      { english: 'Where does it hurt?', translation: '哪里痛？(Nǎlǐ tòng?)' },
      { english: 'Do you have any allergies?', translation: '你有过敏吗？(Nǐ yǒu guòmǐn ma?)' },
      { english: 'Are you taking any medications?', translation: '你在服用什么药物吗？(Nǐ zài fúyòng shénme yàowù ma?)' },
      { english: 'When did the pain start?', translation: '什么时候开始痛的？(Shénme shíhòu kāishǐ tòng de?)' },
      { english: 'Do you have a fever?', translation: '你发烧吗？(Nǐ fāshāo ma?)' },
      { english: 'Have you been vomiting?', translation: '你呕吐了吗？(Nǐ ǒutù le ma?)' },
      { english: 'Can you breathe normally?', translation: '你能正常呼吸吗？(Nǐ néng zhèngcháng hūxī ma?)' },
      { english: 'Are you dizzy?', translation: '你头晕吗？(Nǐ tóuyūn ma?)' },
      { english: 'Do you need an interpreter?', translation: '你需要翻译吗？(Nǐ xūyào fānyì ma?)' },
      { english: 'Please sign here', translation: '请在这里签名 (Qǐng zài zhèlǐ qiānmíng)' }
    ]
  },
  cantonese: {
    name: 'Cantonese',
    phrases: [
      { english: 'Where does it hurt?', translation: '邊度痛？(Bīn douh tung?)' },
      { english: 'Do you have any allergies?', translation: '你有冇敏感？(Néih yáuh móuh mán gám?)' },
      { english: 'Are you taking any medications?', translation: '你有冇食緊藥？(Néih yáuh móuh sihk gán yeuhk?)' },
      { english: 'When did the pain start?', translation: '幾時開始痛？(Géi sìh hōi chí tung?)' },
      { english: 'Do you have a fever?', translation: '你有冇發燒？(Néih yáuh móuh faat sīu?)' },
      { english: 'Have you been vomiting?', translation: '你有冇嘔？(Néih yáuh móuh ngáu?)' },
      { english: 'Can you breathe normally?', translation: '你呼吸正唔正常？(Néih fū kāp jing m̀h jing sèuhng?)' },
      { english: 'Are you dizzy?', translation: '你頭暈唔暈？(Néih tàuh wahn m̀h wahn?)' },
      { english: 'Do you need an interpreter?', translation: '你需唔需要翻譯？(Néih sēui m̀h sēui yiu fāan yihk?)' },
      { english: 'Please sign here', translation: '請喺度簽名 (Chéng hái douh chīm méng)' }
    ]
  }
};
