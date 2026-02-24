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

export interface PhraseGroup {
  groupLabel: string;
  phrases: Phrase[];
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
    [language in Language]: PhraseGroup[];
  };
}

export const subcategoryPhrases: SubcategoryPhraseData = {
  'physical-health': {
    spanish: [
      {
        groupLabel: 'Pain Assessment',
        phrases: [
          {
            english: 'Where does it hurt?',
            translation: '¿Dónde le duele?',
            responses: [
              { translation: 'La cabeza', pronunciation: 'lah kah-BEH-sah', english: 'The head' },
              { translation: 'El pecho', pronunciation: 'el PEH-choh', english: 'The chest' },
              { translation: 'El estómago', pronunciation: 'el es-TOH-mah-goh', english: 'The stomach' },
              { translation: 'La espalda', pronunciation: 'lah es-PAHL-dah', english: 'The back' }
            ]
          },
          {
            english: 'On a scale of 1 to 10, how bad is the pain?',
            translation: '¿En una escala del 1 al 10, qué tan fuerte es el dolor?',
            responses: [
              { translation: 'Cinco', pronunciation: 'SEEN-koh', english: 'Five' },
              { translation: 'Ocho', pronunciation: 'OH-choh', english: 'Eight' },
              { translation: 'Diez', pronunciation: 'dee-EHS', english: 'Ten' },
              { translation: 'Muy fuerte', pronunciation: 'moo-ee FWEHR-teh', english: 'Very strong' }
            ]
          },
          {
            english: 'When did the pain start?',
            translation: '¿Cuándo empezó el dolor?',
            responses: [
              { translation: 'Hoy', pronunciation: 'oy', english: 'Today' },
              { translation: 'Ayer', pronunciation: 'ah-YEHR', english: 'Yesterday' },
              { translation: 'Hace una semana', pronunciation: 'AH-seh OO-nah seh-MAH-nah', english: 'A week ago' },
              { translation: 'No sé', pronunciation: 'noh seh', english: "I don't know" }
            ]
          },
          {
            english: 'Is the pain constant or does it come and go?',
            translation: '¿El dolor es constante o va y viene?',
            responses: [
              { translation: 'Constante', pronunciation: 'kohn-STAHN-teh', english: 'Constant' },
              { translation: 'Va y viene', pronunciation: 'bah ee bee-EH-neh', english: 'Comes and goes' },
              { translation: 'Solo a veces', pronunciation: 'SOH-loh ah BEH-ses', english: 'Only sometimes' },
              { translation: 'Cuando me muevo', pronunciation: 'KWAHN-doh meh MWEH-boh', english: 'When I move' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Vital Signs',
        phrases: [
          {
            english: 'I need to check your blood pressure',
            translation: 'Necesito revisar su presión arterial',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'That\'s fine' },
              { translation: 'Adelante', pronunciation: 'ah-deh-LAHN-teh', english: 'Go ahead' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' }
            ]
          },
          {
            english: 'I need to take your temperature',
            translation: 'Necesito tomar su temperatura',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Tengo fiebre', pronunciation: 'TEHN-goh fee-EH-breh', english: 'I have a fever' },
              { translation: 'Me siento caliente', pronunciation: 'meh see-EHN-toh kah-lee-EHN-teh', english: 'I feel hot' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' }
            ]
          },
          {
            english: 'Please breathe normally',
            translation: 'Por favor respire normalmente',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Me cuesta respirar', pronunciation: 'meh KWES-tah res-pee-RAHR', english: 'It\'s hard to breathe' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Así', pronunciation: 'ah-SEE', english: 'Like this' }
            ]
          },
          {
            english: 'Your heart rate is normal',
            translation: 'Su ritmo cardíaco es normal',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Bien', pronunciation: 'bee-EHN', english: 'Good' },
              { translation: 'Me alegro', pronunciation: 'meh ah-LEH-groh', english: 'I\'m glad' },
              { translation: 'Qué bueno', pronunciation: 'keh BWEH-noh', english: 'That\'s good' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Medical History',
        phrases: [
          {
            english: 'Do you have any allergies?',
            translation: '¿Tiene alergias?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Penicilina', pronunciation: 'peh-nee-see-LEE-nah', english: 'Penicillin' },
              { translation: 'Maní', pronunciation: 'mah-NEE', english: 'Peanuts' }
            ]
          },
          {
            english: 'Are you taking any medications?',
            translation: '¿Está tomando algún medicamento?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Para la diabetes', pronunciation: 'PAH-rah lah dee-ah-BEH-tees', english: 'For diabetes' },
              { translation: 'Para el corazón', pronunciation: 'PAH-rah el koh-rah-SOHN', english: 'For the heart' }
            ]
          },
          {
            english: 'Have you had surgery before?',
            translation: '¿Ha tenido cirugía antes?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Hace años', pronunciation: 'AH-seh AH-nyohs', english: 'Years ago' },
              { translation: 'No recuerdo', pronunciation: 'noh reh-KWEHR-doh', english: "I don't remember" }
            ]
          },
          {
            english: 'Do you have any chronic conditions?',
            translation: '¿Tiene alguna condición crónica?',
            responses: [
              { translation: 'Diabetes', pronunciation: 'dee-ah-BEH-tees', english: 'Diabetes' },
              { translation: 'Presión alta', pronunciation: 'preh-see-OHN AHL-tah', english: 'High blood pressure' },
              { translation: 'Asma', pronunciation: 'AHS-mah', english: 'Asthma' },
              { translation: 'No', pronunciation: 'noh', english: 'No' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Consent and Procedures',
        phrases: [
          {
            english: 'I need to examine you',
            translation: 'Necesito examinarlo',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Adelante', pronunciation: 'ah-deh-LAHN-teh', english: 'Go ahead' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'That\'s fine' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' }
            ]
          },
          {
            english: 'We need to do blood tests',
            translation: 'Necesitamos hacer análisis de sangre',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'That\'s fine' },
              { translation: 'Por qué', pronunciation: 'pohr keh', english: 'Why' },
              { translation: 'Tengo miedo', pronunciation: 'TEHN-goh mee-EH-doh', english: 'I\'m afraid' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' }
            ]
          },
          {
            english: 'Please sign this consent form',
            translation: 'Por favor firme este formulario de consentimiento',
            responses: [
              { translation: 'Dónde firmo', pronunciation: 'DOHN-deh FEER-moh', english: 'Where do I sign' },
              { translation: 'Qué dice', pronunciation: 'keh DEE-seh', english: 'What does it say' },
              { translation: 'Necesito ayuda para leer', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah PAH-rah leh-EHR', english: 'I need help reading' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' }
            ]
          },
          {
            english: 'This procedure will take about 30 minutes',
            translation: 'Este procedimiento tomará unos 30 minutos',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'That\'s fine' },
              { translation: 'Cuánto tiempo', pronunciation: 'KWAHN-toh tee-EHM-poh', english: 'How long' },
              { translation: 'Va a doler', pronunciation: 'bah ah doh-LEHR', english: 'Will it hurt' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Discharge Instructions',
        phrases: [
          {
            english: 'Take this medication twice a day',
            translation: 'Tome este medicamento dos veces al día',
            responses: [
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: 'Con comida', pronunciation: 'kohn koh-MEE-dah', english: 'With food' },
              { translation: 'A qué hora', pronunciation: 'ah keh OH-rah', english: 'At what time' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' }
            ]
          },
          {
            english: 'Come back if symptoms worsen',
            translation: 'Regrese si los síntomas empeoran',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: 'Cuándo debo volver', pronunciation: 'KWAHN-doh DEH-boh bohl-BEHR', english: 'When should I return' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' }
            ]
          },
          {
            english: 'Rest for the next 24 hours',
            translation: 'Descanse las próximas 24 horas',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Puedo trabajar', pronunciation: 'PWEH-doh trah-bah-HAHR', english: 'Can I work' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'That\'s fine' }
            ]
          },
          {
            english: 'Follow up with your doctor in one week',
            translation: 'Haga seguimiento con su doctor en una semana',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No tengo doctor', pronunciation: 'noh TEHN-goh dohk-TOHR', english: 'I don\'t have a doctor' },
              { translation: 'Dónde', pronunciation: 'DOHN-deh', english: 'Where' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' }
            ]
          }
        ]
      }
    ],
    tagalog: [
      {
        groupLabel: 'Pain Assessment',
        phrases: [
          {
            english: 'Where does it hurt?',
            translation: 'Saan ka masakit?',
            responses: [
              { translation: 'Ulo', pronunciation: 'OO-loh', english: 'Head' },
              { translation: 'Dibdib', pronunciation: 'deeb-DEEB', english: 'Chest' },
              { translation: 'Tiyan', pronunciation: 'tee-YAHN', english: 'Stomach' },
              { translation: 'Likod', pronunciation: 'lee-KOHD', english: 'Back' }
            ]
          },
          {
            english: 'On a scale of 1 to 10, how bad is the pain?',
            translation: 'Sa scale na 1 hanggang 10, gaano kasakit?',
            responses: [
              { translation: 'Lima', pronunciation: 'lee-MAH', english: 'Five' },
              { translation: 'Walo', pronunciation: 'wah-LOH', english: 'Eight' },
              { translation: 'Sampu', pronunciation: 'sahm-POO', english: 'Ten' },
              { translation: 'Sobrang sakit', pronunciation: 'soh-BRAHNG sah-KEET', english: 'Very painful' }
            ]
          },
          {
            english: 'When did the pain start?',
            translation: 'Kailan nagsimula ang sakit?',
            responses: [
              { translation: 'Ngayon', pronunciation: 'ngah-YOHN', english: 'Today' },
              { translation: 'Kahapon', pronunciation: 'kah-hah-POHN', english: 'Yesterday' },
              { translation: 'Isang linggo na', pronunciation: 'ee-SAHNG leeng-GOH nah', english: 'A week ago' },
              { translation: 'Hindi ko alam', pronunciation: 'heen-DEE koh ah-LAHM', english: "I don't know" }
            ]
          },
          {
            english: 'Is the pain constant or does it come and go?',
            translation: 'Tuloy-tuloy ba ang sakit o pumapasok at umaalis?',
            responses: [
              { translation: 'Tuloy-tuloy', pronunciation: 'too-LOY too-LOY', english: 'Constant' },
              { translation: 'Pumapasok at umaalis', pronunciation: 'poo-mah-PAH-sok aht oo-mah-ah-LEES', english: 'Comes and goes' },
              { translation: 'Paminsan-minsan lang', pronunciation: 'pah-meen-SAHN meen-SAHN lahng', english: 'Only sometimes' },
              { translation: 'Kapag gumagalaw', pronunciation: 'kah-PAHG goo-mah-GAH-law', english: 'When I move' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Vital Signs',
        phrases: [
          {
            english: 'I need to check your blood pressure',
            translation: 'Kailangan kong suriin ang iyong blood pressure',
            responses: [
              { translation: 'Okay lang', pronunciation: 'oh-KAY lahng', english: 'That\'s fine' },
              { translation: 'Sige', pronunciation: 'see-GEH', english: 'Go ahead' },
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' }
            ]
          },
          {
            english: 'I need to take your temperature',
            translation: 'Kailangan kong kunin ang iyong temperatura',
            responses: [
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' },
              { translation: 'May lagnat ako', pronunciation: 'may lahg-NAHT ah-KOH', english: 'I have a fever' },
              { translation: 'Mainit ako', pronunciation: 'mah-EE-neet ah-KOH', english: 'I feel hot' },
              { translation: 'Sige', pronunciation: 'see-GEH', english: 'Go ahead' }
            ]
          },
          {
            english: 'Please breathe normally',
            translation: 'Huminga ka ng normal',
            responses: [
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' },
              { translation: 'Hirap huminga', pronunciation: 'hee-RAHP hoo-mee-NGAH', english: 'Hard to breathe' },
              { translation: 'Ganito', pronunciation: 'gah-nee-TOH', english: 'Like this' },
              { translation: 'Sige', pronunciation: 'see-GEH', english: 'Okay' }
            ]
          },
          {
            english: 'Your heart rate is normal',
            translation: 'Normal ang iyong heart rate',
            responses: [
              { translation: 'Salamat', pronunciation: 'sah-lah-MAHT', english: 'Thank you' },
              { translation: 'Mabuti', pronunciation: 'mah-BOO-tee', english: 'Good' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Salamat sa Diyos', pronunciation: 'sah-lah-MAHT sah dee-YOHS', english: 'Thank God' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Medical History',
        phrases: [
          {
            english: 'Do you have any allergies?',
            translation: 'Mayroon ka bang allergy?',
            responses: [
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' },
              { translation: 'Wala', pronunciation: 'wah-LAH', english: 'No' },
              { translation: 'Penicillin', pronunciation: 'peh-nee-see-LEEN', english: 'Penicillin' },
              { translation: 'Mani', pronunciation: 'mah-NEE', english: 'Peanuts' }
            ]
          },
          {
            english: 'Are you taking any medications?',
            translation: 'Umiinom ka ba ng gamot?',
            responses: [
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' },
              { translation: 'Hindi', pronunciation: 'heen-DEE', english: 'No' },
              { translation: 'Para sa diabetes', pronunciation: 'pah-RAH sah dee-ah-BEH-tes', english: 'For diabetes' },
              { translation: 'Para sa puso', pronunciation: 'pah-RAH sah poo-SOH', english: 'For the heart' }
            ]
          },
          {
            english: 'Have you had surgery before?',
            translation: 'Naoperahan ka na ba dati?',
            responses: [
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' },
              { translation: 'Hindi', pronunciation: 'heen-DEE', english: 'No' },
              { translation: 'Matagal na', pronunciation: 'mah-tah-GAHL nah', english: 'Long time ago' },
              { translation: 'Hindi ko matandaan', pronunciation: 'heen-DEE koh mah-tahn-dah-AHN', english: "I don't remember" }
            ]
          },
          {
            english: 'Do you have any chronic conditions?',
            translation: 'Mayroon ka bang chronic condition?',
            responses: [
              { translation: 'Diabetes', pronunciation: 'dee-ah-BEH-tes', english: 'Diabetes' },
              { translation: 'Mataas na blood pressure', pronunciation: 'mah-tah-AHS nah blood PREH-shur', english: 'High blood pressure' },
              { translation: 'Hika', pronunciation: 'hee-KAH', english: 'Asthma' },
              { translation: 'Wala', pronunciation: 'wah-LAH', english: 'No' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Consent and Procedures',
        phrases: [
          {
            english: 'I need to examine you',
            translation: 'Kailangan kitang suriin',
            responses: [
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' },
              { translation: 'Sige', pronunciation: 'see-GEH', english: 'Go ahead' },
              { translation: 'Okay lang', pronunciation: 'oh-KAY lahng', english: 'That\'s fine' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' }
            ]
          },
          {
            english: 'We need to do blood tests',
            translation: 'Kailangan nating mag-blood test',
            responses: [
              { translation: 'Okay lang', pronunciation: 'oh-KAY lahng', english: 'That\'s fine' },
              { translation: 'Bakit', pronunciation: 'bah-KEET', english: 'Why' },
              { translation: 'Takot ako', pronunciation: 'tah-KOHT ah-KOH', english: 'I\'m afraid' },
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }
            ]
          },
          {
            english: 'Please sign this consent form',
            translation: 'Paki-pirma ang consent form na ito',
            responses: [
              { translation: 'Saan ako pipirma', pronunciation: 'sah-AHN ah-KOH pee-peer-MAH', english: 'Where do I sign' },
              { translation: 'Ano ang nakasulat', pronunciation: 'ah-NOH ahng nah-kah-soo-LAHT', english: 'What does it say' },
              { translation: 'Kailangan ko ng tulong', pronunciation: 'kah-ee-LAH-ngahn koh nahng too-LOHNG', english: 'I need help' },
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }
            ]
          },
          {
            english: 'This procedure will take about 30 minutes',
            translation: 'Ang procedure na ito ay aabot ng 30 minuto',
            responses: [
              { translation: 'Okay lang', pronunciation: 'oh-KAY lahng', english: 'That\'s fine' },
              { translation: 'Gaano katagal', pronunciation: 'gah-ah-NOH kah-tah-GAHL', english: 'How long' },
              { translation: 'Masakit ba', pronunciation: 'mah-sah-KEET bah', english: 'Will it hurt' },
              { translation: 'Sige', pronunciation: 'see-GEH', english: 'Okay' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Discharge Instructions',
        phrases: [
          {
            english: 'Take this medication twice a day',
            translation: 'Inumin ang gamot na ito dalawang beses sa isang araw',
            responses: [
              { translation: 'Naiintindihan ko', pronunciation: 'nah-ee-een-teen-dee-HAHN koh', english: 'I understand' },
              { translation: 'Kasama ng pagkain', pronunciation: 'kah-sah-MAH nahng pahg-kah-EEN', english: 'With food' },
              { translation: 'Anong oras', pronunciation: 'ah-NOHNG oh-RAHS', english: 'What time' },
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' }
            ]
          },
          {
            english: 'Come back if symptoms worsen',
            translation: 'Bumalik kung lumala ang sintomas',
            responses: [
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' },
              { translation: 'Naiintindihan ko', pronunciation: 'nah-ee-een-teen-dee-HAHN koh', english: 'I understand' },
              { translation: 'Kailan ako babalik', pronunciation: 'kah-ee-LAHN ah-KOH bah-bah-LEEK', english: 'When should I return' },
              { translation: 'Salamat', pronunciation: 'sah-lah-MAHT', english: 'Thank you' }
            ]
          },
          {
            english: 'Rest for the next 24 hours',
            translation: 'Magpahinga sa loob ng 24 oras',
            responses: [
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' },
              { translation: 'Pwede ba akong magtrabaho', pronunciation: 'PWEH-deh bah ah-KOHNG mahg-trah-bah-HOH', english: 'Can I work' },
              { translation: 'Naiintindihan ko', pronunciation: 'nah-ee-een-teen-dee-HAHN koh', english: 'I understand' },
              { translation: 'Sige', pronunciation: 'see-GEH', english: 'Okay' }
            ]
          },
          {
            english: 'Follow up with your doctor in one week',
            translation: 'Bumalik sa doktor mo sa loob ng isang linggo',
            responses: [
              { translation: 'Oo', pronunciation: 'oh-OH', english: 'Yes' },
              { translation: 'Wala akong doktor', pronunciation: 'wah-LAH ah-KOHNG dohk-TOHR', english: 'I don\'t have a doctor' },
              { translation: 'Saan', pronunciation: 'sah-AHN', english: 'Where' },
              { translation: 'Salamat', pronunciation: 'sah-lah-MAHT', english: 'Thank you' }
            ]
          }
        ]
      }
    ],
    vietnamese: [
      {
        groupLabel: 'Pain Assessment',
        phrases: [
          {
            english: 'Where does it hurt?',
            translation: 'Đau ở đâu?',
            responses: [
              { translation: 'Đầu', pronunciation: 'dow', english: 'Head' },
              { translation: 'Ngực', pronunciation: 'ngooc', english: 'Chest' },
              { translation: 'Bụng', pronunciation: 'boong', english: 'Stomach' },
              { translation: 'Lưng', pronunciation: 'loong', english: 'Back' }
            ]
          },
          {
            english: 'On a scale of 1 to 10, how bad is the pain?',
            translation: 'Trên thang điểm từ 1 đến 10, mức độ đau như thế nào?',
            responses: [
              { translation: 'Năm', pronunciation: 'nahm', english: 'Five' },
              { translation: 'Tám', pronunciation: 'tahm', english: 'Eight' },
              { translation: 'Mười', pronunciation: 'moo-uh-ee', english: 'Ten' },
              { translation: 'Rất đau', pronunciation: 'zuht dow', english: 'Very painful' }
            ]
          },
          {
            english: 'When did the pain start?',
            translation: 'Khi nào bắt đầu đau?',
            responses: [
              { translation: 'Hôm nay', pronunciation: 'hohm nai', english: 'Today' },
              { translation: 'Hôm qua', pronunciation: 'hohm gwah', english: 'Yesterday' },
              { translation: 'Một tuần trước', pronunciation: 'moht twuhn choo-uhk', english: 'A week ago' },
              { translation: 'Tôi không biết', pronunciation: 'toy khohng bee-eht', english: "I don't know" }
            ]
          },
          {
            english: 'Is the pain constant or does it come and go?',
            translation: 'Cơn đau liên tục hay đau từng lúc?',
            responses: [
              { translation: 'Liên tục', pronunciation: 'lee-ehn took', english: 'Constant' },
              { translation: 'Đau từng lúc', pronunciation: 'dow toong look', english: 'Comes and goes' },
              { translation: 'Chỉ thỉnh thoảng', pronunciation: 'chee theeng thwahng', english: 'Only sometimes' },
              { translation: 'Khi tôi di chuyển', pronunciation: 'khee toy zee choo-yehn', english: 'When I move' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Vital Signs',
        phrases: [
          {
            english: 'I need to check your blood pressure',
            translation: 'Tôi cần kiểm tra huyết áp của bạn',
            responses: [
              { translation: 'Được', pronunciation: 'dook', english: 'That\'s fine' },
              { translation: 'Vâng', pronunciation: 'vuhng', english: 'Yes' },
              { translation: 'Làm đi', pronunciation: 'lahm dee', english: 'Go ahead' },
              { translation: 'Okay', pronunciation: 'oh-kay', english: 'Okay' }
            ]
          },
          {
            english: 'I need to take your temperature',
            translation: 'Tôi cần đo nhiệt độ của bạn',
            responses: [
              { translation: 'Vâng', pronunciation: 'vuhng', english: 'Yes' },
              { translation: 'Tôi bị sốt', pronunciation: 'toy bee soht', english: 'I have a fever' },
              { translation: 'Tôi thấy nóng', pronunciation: 'toy thay nohng', english: 'I feel hot' },
              { translation: 'Được', pronunciation: 'dook', english: 'Okay' }
            ]
          },
          {
            english: 'Please breathe normally',
            translation: 'Xin hãy thở bình thường',
            responses: [
              { translation: 'Vâng', pronunciation: 'vuhng', english: 'Yes' },
              { translation: 'Khó thở', pronunciation: 'khoh thoh', english: 'Hard to breathe' },
              { translation: 'Thế này', pronunciation: 'theh nai', english: 'Like this' },
              { translation: 'Được', pronunciation: 'dook', english: 'Okay' }
            ]
          },
          {
            english: 'Your heart rate is normal',
            translation: 'Nhịp tim của bạn bình thường',
            responses: [
              { translation: 'Cảm ơn', pronunciation: 'gahm uhn', english: 'Thank you' },
              { translation: 'Tốt', pronunciation: 'toht', english: 'Good' },
              { translation: 'Mừng quá', pronunciation: 'moong gwah', english: 'I\'m glad' },
              { translation: 'Tốt lắm', pronunciation: 'toht lahm', english: 'That\'s good' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Medical History',
        phrases: [
          {
            english: 'Do you have any allergies?',
            translation: 'Bạn có dị ứng gì không?',
            responses: [
              { translation: 'Có', pronunciation: 'gaw', english: 'Yes' },
              { translation: 'Không', pronunciation: 'kohng', english: 'No' },
              { translation: 'Penicillin', pronunciation: 'peh-nee-see-leen', english: 'Penicillin' },
              { translation: 'Đậu phộng', pronunciation: 'dow fohng', english: 'Peanuts' }
            ]
          },
          {
            english: 'Are you taking any medications?',
            translation: 'Bạn có đang uống thuốc gì không?',
            responses: [
              { translation: 'Có', pronunciation: 'gaw', english: 'Yes' },
              { translation: 'Không', pronunciation: 'kohng', english: 'No' },
              { translation: 'Thuốc tiểu đường', pronunciation: 'thwohk tee-ew doo-uhng', english: 'Diabetes medication' },
              { translation: 'Thuốc tim', pronunciation: 'thwohk teem', english: 'Heart medication' }
            ]
          },
          {
            english: 'Have you had surgery before?',
            translation: 'Bạn đã từng phẫu thuật chưa?',
            responses: [
              { translation: 'Rồi', pronunciation: 'zoy', english: 'Yes' },
              { translation: 'Chưa', pronunciation: 'choo-uh', english: 'No' },
              { translation: 'Lâu rồi', pronunciation: 'low zoy', english: 'Long time ago' },
              { translation: 'Tôi không nhớ', pronunciation: 'toy kohng nyuh', english: "I don't remember" }
            ]
          },
          {
            english: 'Do you have any chronic conditions?',
            translation: 'Bạn có bệnh mãn tính nào không?',
            responses: [
              { translation: 'Tiểu đường', pronunciation: 'tee-ew doo-uhng', english: 'Diabetes' },
              { translation: 'Huyết áp cao', pronunciation: 'hwee-eht ahp gow', english: 'High blood pressure' },
              { translation: 'Hen suyễn', pronunciation: 'hen swee-ehn', english: 'Asthma' },
              { translation: 'Không', pronunciation: 'kohng', english: 'No' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Consent and Procedures',
        phrases: [
          {
            english: 'I need to examine you',
            translation: 'Tôi cần khám cho bạn',
            responses: [
              { translation: 'Vâng', pronunciation: 'vuhng', english: 'Yes' },
              { translation: 'Được', pronunciation: 'dook', english: 'Go ahead' },
              { translation: 'Làm đi', pronunciation: 'lahm dee', english: 'That\'s fine' },
              { translation: 'Okay', pronunciation: 'oh-kay', english: 'Okay' }
            ]
          },
          {
            english: 'We need to do blood tests',
            translation: 'Chúng tôi cần xét nghiệm máu',
            responses: [
              { translation: 'Được', pronunciation: 'dook', english: 'That\'s fine' },
              { translation: 'Tại sao', pronunciation: 'tai sow', english: 'Why' },
              { translation: 'Tôi sợ', pronunciation: 'toy suh', english: 'I\'m afraid' },
              { translation: 'Vâng', pronunciation: 'vuhng', english: 'Yes' }
            ]
          },
          {
            english: 'Please sign this consent form',
            translation: 'Xin vui lòng ký vào mẫu đồng ý này',
            responses: [
              { translation: 'Ký ở đâu', pronunciation: 'kee uh dow', english: 'Where do I sign' },
              { translation: 'Nó nói gì', pronunciation: 'noh noy zee', english: 'What does it say' },
              { translation: 'Tôi cần giúp đọc', pronunciation: 'toy kuhn yoop dohk', english: 'I need help reading' },
              { translation: 'Vâng', pronunciation: 'vuhng', english: 'Yes' }
            ]
          },
          {
            english: 'This procedure will take about 30 minutes',
            translation: 'Thủ tục này sẽ mất khoảng 30 phút',
            responses: [
              { translation: 'Được', pronunciation: 'dook', english: 'That\'s fine' },
              { translation: 'Bao lâu', pronunciation: 'bow low', english: 'How long' },
              { translation: 'Có đau không', pronunciation: 'gaw dow kohng', english: 'Will it hurt' },
              { translation: 'Okay', pronunciation: 'oh-kay', english: 'Okay' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Discharge Instructions',
        phrases: [
          {
            english: 'Take this medication twice a day',
            translation: 'Uống thuốc này hai lần một ngày',
            responses: [
              { translation: 'Tôi hiểu', pronunciation: 'toy hee-ew', english: 'I understand' },
              { translation: 'Uống với đồ ăn', pronunciation: 'oo-ohng voy doh ahn', english: 'With food' },
              { translation: 'Lúc mấy giờ', pronunciation: 'look may zuh', english: 'At what time' },
              { translation: 'Vâng', pronunciation: 'vuhng', english: 'Yes' }
            ]
          },
          {
            english: 'Come back if symptoms worsen',
            translation: 'Quay lại nếu triệu chứng trở nên tệ hơn',
            responses: [
              { translation: 'Vâng', pronunciation: 'vuhng', english: 'Yes' },
              { translation: 'Tôi hiểu', pronunciation: 'toy hee-ew', english: 'I understand' },
              { translation: 'Khi nào tôi nên quay lại', pronunciation: 'khee now toy nehn gway lai', english: 'When should I return' },
              { translation: 'Cảm ơn', pronunciation: 'gahm uhn', english: 'Thank you' }
            ]
          },
          {
            english: 'Rest for the next 24 hours',
            translation: 'Nghỉ ngơi trong 24 giờ tới',
            responses: [
              { translation: 'Vâng', pronunciation: 'vuhng', english: 'Yes' },
              { translation: 'Tôi có thể làm việc không', pronunciation: 'toy gaw theh lahm vee-ehk kohng', english: 'Can I work' },
              { translation: 'Tôi hiểu', pronunciation: 'toy hee-ew', english: 'I understand' },
              { translation: 'Được', pronunciation: 'dook', english: 'Okay' }
            ]
          },
          {
            english: 'Follow up with your doctor in one week',
            translation: 'Tái khám với bác sĩ trong một tuần',
            responses: [
              { translation: 'Vâng', pronunciation: 'vuhng', english: 'Yes' },
              { translation: 'Tôi không có bác sĩ', pronunciation: 'toy kohng gaw bahk see', english: 'I don\'t have a doctor' },
              { translation: 'Ở đâu', pronunciation: 'uh dow', english: 'Where' },
              { translation: 'Cảm ơn', pronunciation: 'gahm uhn', english: 'Thank you' }
            ]
          }
        ]
      }
    ],
    mandarin: [
      {
        groupLabel: 'Pain Assessment',
        phrases: [
          {
            english: 'Where does it hurt?',
            translation: '哪里痛？(Nǎlǐ tòng?)',
            responses: [
              { translation: '头 (Tóu)', pronunciation: 'Tóu', english: 'Head' },
              { translation: '胸部 (Xiōngbù)', pronunciation: 'Xiōngbù', english: 'Chest' },
              { translation: '肚子 (Dùzi)', pronunciation: 'Dùzi', english: 'Stomach' },
              { translation: '背 (Bèi)', pronunciation: 'Bèi', english: 'Back' }
            ]
          },
          {
            english: 'On a scale of 1 to 10, how bad is the pain?',
            translation: '从1到10分，疼痛程度是多少？(Cóng yī dào shí fēn, téngtòng chéngdù shì duōshao?)',
            responses: [
              { translation: '五 (Wǔ)', pronunciation: 'Wǔ', english: 'Five' },
              { translation: '八 (Bā)', pronunciation: 'Bā', english: 'Eight' },
              { translation: '十 (Shí)', pronunciation: 'Shí', english: 'Ten' },
              { translation: '很痛 (Hěn tòng)', pronunciation: 'Hěn tòng', english: 'Very painful' }
            ]
          },
          {
            english: 'When did the pain start?',
            translation: '什么时候开始痛的？(Shénme shíhou kāishǐ tòng de?)',
            responses: [
              { translation: '今天 (Jīntiān)', pronunciation: 'Jīntiān', english: 'Today' },
              { translation: '昨天 (Zuótiān)', pronunciation: 'Zuótiān', english: 'Yesterday' },
              { translation: '一个星期前 (Yí ge xīngqī qián)', pronunciation: 'Yí ge xīngqī qián', english: 'A week ago' },
              { translation: '不知道 (Bù zhīdào)', pronunciation: 'Bù zhīdào', english: "I don't know" }
            ]
          },
          {
            english: 'Is the pain constant or does it come and go?',
            translation: '疼痛是持续的还是时有时无？(Téngtòng shì chíxù de háishì shí yǒu shí wú?)',
            responses: [
              { translation: '持续的 (Chíxù de)', pronunciation: 'Chíxù de', english: 'Constant' },
              { translation: '时有时无 (Shí yǒu shí wú)', pronunciation: 'Shí yǒu shí wú', english: 'Comes and goes' },
              { translation: '偶尔 (Ǒu\'ěr)', pronunciation: 'Ǒu\'ěr', english: 'Only sometimes' },
              { translation: '动的时候 (Dòng de shíhou)', pronunciation: 'Dòng de shíhou', english: 'When I move' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Vital Signs',
        phrases: [
          {
            english: 'I need to check your blood pressure',
            translation: '我需要检查您的血压 (Wǒ xūyào jiǎnchá nín de xuèyā)',
            responses: [
              { translation: '好的 (Hǎo de)', pronunciation: 'Hǎo de', english: 'That\'s fine' },
              { translation: '可以 (Kěyǐ)', pronunciation: 'Kěyǐ', english: 'Yes' },
              { translation: '请便 (Qǐng biàn)', pronunciation: 'Qǐng biàn', english: 'Go ahead' },
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Okay' }
            ]
          },
          {
            english: 'I need to take your temperature',
            translation: '我需要量您的体温 (Wǒ xūyào liáng nín de tǐwēn)',
            responses: [
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Yes' },
              { translation: '我发烧了 (Wǒ fāshāo le)', pronunciation: 'Wǒ fāshāo le', english: 'I have a fever' },
              { translation: '我觉得热 (Wǒ juéde rè)', pronunciation: 'Wǒ juéde rè', english: 'I feel hot' },
              { translation: '可以 (Kěyǐ)', pronunciation: 'Kěyǐ', english: 'Okay' }
            ]
          },
          {
            english: 'Please breathe normally',
            translation: '请正常呼吸 (Qǐng zhèngcháng hūxī)',
            responses: [
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Yes' },
              { translation: '呼吸困难 (Hūxī kùnnan)', pronunciation: 'Hūxī kùnnan', english: 'Hard to breathe' },
              { translation: '这样 (Zhèyàng)', pronunciation: 'Zhèyàng', english: 'Like this' },
              { translation: '明白 (Míngbái)', pronunciation: 'Míngbái', english: 'Okay' }
            ]
          },
          {
            english: 'Your heart rate is normal',
            translation: '您的心率正常 (Nín de xīnlǜ zhèngcháng)',
            responses: [
              { translation: '谢谢 (Xièxiè)', pronunciation: 'Xièxiè', english: 'Thank you' },
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Good' },
              { translation: '太好了 (Tài hǎo le)', pronunciation: 'Tài hǎo le', english: 'That\'s great' },
              { translation: '很好 (Hěn hǎo)', pronunciation: 'Hěn hǎo', english: 'Very good' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Medical History',
        phrases: [
          {
            english: 'Do you have any allergies?',
            translation: '你有过敏吗？(Nǐ yǒu guòmǐn ma?)',
            responses: [
              { translation: '有 (Yǒu)', pronunciation: 'Yǒu', english: 'Yes' },
              { translation: '没有 (Méiyǒu)', pronunciation: 'Méiyǒu', english: 'No' },
              { translation: '青霉素 (Qīngméisù)', pronunciation: 'Qīngméisù', english: 'Penicillin' },
              { translation: '花生 (Huāshēng)', pronunciation: 'Huāshēng', english: 'Peanuts' }
            ]
          },
          {
            english: 'Are you taking any medications?',
            translation: '你在吃药吗？(Nǐ zài chī yào ma?)',
            responses: [
              { translation: '吃 (Chī)', pronunciation: 'Chī', english: 'Yes' },
              { translation: '不吃 (Bù chī)', pronunciation: 'Bù chī', english: 'No' },
              { translation: '糖尿病药 (Tángniàobìng yào)', pronunciation: 'Tángniàobìng yào', english: 'Diabetes medication' },
              { translation: '心脏药 (Xīnzàng yào)', pronunciation: 'Xīnzàng yào', english: 'Heart medication' }
            ]
          },
          {
            english: 'Have you had surgery before?',
            translation: '你以前做过手术吗？(Nǐ yǐqián zuòguò shǒushù ma?)',
            responses: [
              { translation: '做过 (Zuòguò)', pronunciation: 'Zuòguò', english: 'Yes' },
              { translation: '没有 (Méiyǒu)', pronunciation: 'Méiyǒu', english: 'No' },
              { translation: '很久以前 (Hěn jiǔ yǐqián)', pronunciation: 'Hěn jiǔ yǐqián', english: 'Long time ago' },
              { translation: '不记得 (Bù jìde)', pronunciation: 'Bù jìde', english: "I don't remember" }
            ]
          },
          {
            english: 'Do you have any chronic conditions?',
            translation: '你有慢性病吗？(Nǐ yǒu mànxìngbìng ma?)',
            responses: [
              { translation: '糖尿病 (Tángniàobìng)', pronunciation: 'Tángniàobìng', english: 'Diabetes' },
              { translation: '高血压 (Gāoxuèyā)', pronunciation: 'Gāoxuèyā', english: 'High blood pressure' },
              { translation: '哮喘 (Xiàochuǎn)', pronunciation: 'Xiàochuǎn', english: 'Asthma' },
              { translation: '没有 (Méiyǒu)', pronunciation: 'Méiyǒu', english: 'No' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Consent and Procedures',
        phrases: [
          {
            english: 'I need to examine you',
            translation: '我需要检查您 (Wǒ xūyào jiǎnchá nín)',
            responses: [
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Yes' },
              { translation: '可以 (Kěyǐ)', pronunciation: 'Kěyǐ', english: 'Go ahead' },
              { translation: '没问题 (Méi wèntí)', pronunciation: 'Méi wèntí', english: 'No problem' },
              { translation: '好的 (Hǎo de)', pronunciation: 'Hǎo de', english: 'Okay' }
            ]
          },
          {
            english: 'We need to do blood tests',
            translation: '我们需要验血 (Wǒmen xūyào yànxuè)',
            responses: [
              { translation: '好的 (Hǎo de)', pronunciation: 'Hǎo de', english: 'That\'s fine' },
              { translation: '为什么 (Wèishénme)', pronunciation: 'Wèishénme', english: 'Why' },
              { translation: '我害怕 (Wǒ hàipà)', pronunciation: 'Wǒ hàipà', english: 'I\'m afraid' },
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Yes' }
            ]
          },
          {
            english: 'Please sign this consent form',
            translation: '请签这份同意书 (Qǐng qiān zhè fèn tóngyìshū)',
            responses: [
              { translation: '在哪里签 (Zài nǎlǐ qiān)', pronunciation: 'Zài nǎlǐ qiān', english: 'Where do I sign' },
              { translation: '这是什么 (Zhè shì shénme)', pronunciation: 'Zhè shì shénme', english: 'What is this' },
              { translation: '我需要帮助 (Wǒ xūyào bāngzhù)', pronunciation: 'Wǒ xūyào bāngzhù', english: 'I need help' },
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Yes' }
            ]
          },
          {
            english: 'This procedure will take about 30 minutes',
            translation: '这个程序大约需要30分钟 (Zhège chéngxù dàyuē xūyào sānshí fēnzhōng)',
            responses: [
              { translation: '好的 (Hǎo de)', pronunciation: 'Hǎo de', english: 'That\'s fine' },
              { translation: '多久 (Duō jiǔ)', pronunciation: 'Duō jiǔ', english: 'How long' },
              { translation: '会痛吗 (Huì tòng ma)', pronunciation: 'Huì tòng ma', english: 'Will it hurt' },
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Okay' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Discharge Instructions',
        phrases: [
          {
            english: 'Take this medication twice a day',
            translation: '每天吃两次这个药 (Měitiān chī liǎng cì zhège yào)',
            responses: [
              { translation: '明白 (Míngbái)', pronunciation: 'Míngbái', english: 'I understand' },
              { translation: '跟饭一起吃吗 (Gēn fàn yìqǐ chī ma)', pronunciation: 'Gēn fàn yìqǐ chī ma', english: 'With food' },
              { translation: '什么时候 (Shénme shíhou)', pronunciation: 'Shénme shíhou', english: 'When' },
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Yes' }
            ]
          },
          {
            english: 'Come back if symptoms worsen',
            translation: '如果症状恶化请回来 (Rúguǒ zhèngzhuàng èhuà qǐng huílái)',
            responses: [
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Yes' },
              { translation: '明白 (Míngbái)', pronunciation: 'Míngbái', english: 'I understand' },
              { translation: '什么时候回来 (Shénme shíhou huílái)', pronunciation: 'Shénme shíhou huílái', english: 'When should I return' },
              { translation: '谢谢 (Xièxiè)', pronunciation: 'Xièxiè', english: 'Thank you' }
            ]
          },
          {
            english: 'Rest for the next 24 hours',
            translation: '接下来24小时要休息 (Jiē xiàlái èrshísì xiǎoshí yào xiūxi)',
            responses: [
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Yes' },
              { translation: '我能工作吗 (Wǒ néng gōngzuò ma)', pronunciation: 'Wǒ néng gōngzuò ma', english: 'Can I work' },
              { translation: '明白 (Míngbái)', pronunciation: 'Míngbái', english: 'I understand' },
              { translation: '好的 (Hǎo de)', pronunciation: 'Hǎo de', english: 'Okay' }
            ]
          },
          {
            english: 'Follow up with your doctor in one week',
            translation: '一周后去看医生 (Yì zhōu hòu qù kàn yīshēng)',
            responses: [
              { translation: '好 (Hǎo)', pronunciation: 'Hǎo', english: 'Yes' },
              { translation: '我没有医生 (Wǒ méiyǒu yīshēng)', pronunciation: 'Wǒ méiyǒu yīshēng', english: 'I don\'t have a doctor' },
              { translation: '在哪里 (Zài nǎlǐ)', pronunciation: 'Zài nǎlǐ', english: 'Where' },
              { translation: '谢谢 (Xièxiè)', pronunciation: 'Xièxiè', english: 'Thank you' }
            ]
          }
        ]
      }
    ],
    cantonese: [
      {
        groupLabel: 'Pain Assessment',
        phrases: [
          {
            english: 'Where does it hurt?',
            translation: '邊度痛？(Bīn douh tung?)',
            responses: [
              { translation: '頭 (Tàuh)', pronunciation: 'Tàuh', english: 'Head' },
              { translation: '胸口 (Hūng háu)', pronunciation: 'Hūng háu', english: 'Chest' },
              { translation: '肚 (Tóuh)', pronunciation: 'Tóuh', english: 'Stomach' },
              { translation: '背脊 (Bui jek)', pronunciation: 'Bui jek', english: 'Back' }
            ]
          },
          {
            english: 'On a scale of 1 to 10, how bad is the pain?',
            translation: '由1到10，有幾痛？(Yàuh yāt dou sahp, yáuh géi tung?)',
            responses: [
              { translation: '五 (Ńgh)', pronunciation: 'Ńgh', english: 'Five' },
              { translation: '八 (Baat)', pronunciation: 'Baat', english: 'Eight' },
              { translation: '十 (Sahp)', pronunciation: 'Sahp', english: 'Ten' },
              { translation: '好痛 (Hóu tung)', pronunciation: 'Hóu tung', english: 'Very painful' }
            ]
          },
          {
            english: 'When did the pain start?',
            translation: '幾時開始痛？(Géi sìh hōi chí tung?)',
            responses: [
              { translation: '今日 (Gām yaht)', pronunciation: 'Gām yaht', english: 'Today' },
              { translation: '尋日 (Cham yaht)', pronunciation: 'Cham yaht', english: 'Yesterday' },
              { translation: '一個禮拜前 (Yāt go láih baai chìhn)', pronunciation: 'Yāt go láih baai chìhn', english: 'A week ago' },
              { translation: '唔知 (M̀h jī)', pronunciation: 'M̀h jī', english: "I don't know" }
            ]
          },
          {
            english: 'Is the pain constant or does it come and go?',
            translation: '痛係唔係成日都有，定係時痛時唔痛？(Tung haih m̀h haih sìhng yaht dōu yáuh, dihng haih sìh tung sìh m̀h tung?)',
            responses: [
              { translation: '成日都痛 (Sìhng yaht dōu tung)', pronunciation: 'Sìhng yaht dōu tung', english: 'Constant' },
              { translation: '時痛時唔痛 (Sìh tung sìh m̀h tung)', pronunciation: 'Sìh tung sìh m̀h tung', english: 'Comes and goes' },
              { translation: '間中 (Gaan jung)', pronunciation: 'Gaan jung', english: 'Sometimes' },
              { translation: '郁嘅時候 (Yūk ge sìh hauh)', pronunciation: 'Yūk ge sìh hauh', english: 'When I move' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Vital Signs',
        phrases: [
          {
            english: 'I need to check your blood pressure',
            translation: '我要檢查你嘅血壓 (Ngóh yiu gím chàh néih ge hyut ngaat)',
            responses: [
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'That\'s fine' },
              { translation: '可以 (Hó yíh)', pronunciation: 'Hó yíh', english: 'Yes' },
              { translation: '嚟啦 (Lèih la)', pronunciation: 'Lèih la', english: 'Go ahead' },
              { translation: '得 (Dāk)', pronunciation: 'Dāk', english: 'Okay' }
            ]
          },
          {
            english: 'I need to take your temperature',
            translation: '我要幫你探熱 (Ngóh yiu bōng néih taam yiht)',
            responses: [
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'Yes' },
              { translation: '我發燒 (Ngóh faat sīu)', pronunciation: 'Ngóh faat sīu', english: 'I have a fever' },
              { translation: '我好熱 (Ngóh hóu yiht)', pronunciation: 'Ngóh hóu yiht', english: 'I feel hot' },
              { translation: '得 (Dāk)', pronunciation: 'Dāk', english: 'Okay' }
            ]
          },
          {
            english: 'Please breathe normally',
            translation: '請正常呼吸 (Chéng jing sèuhng fū kāp)',
            responses: [
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'Yes' },
              { translation: '唞唔到氣 (Tó m̀h dou hei)', pronunciation: 'Tó m̀h dou hei', english: 'Hard to breathe' },
              { translation: '咁樣 (Gám yéung)', pronunciation: 'Gám yéung', english: 'Like this' },
              { translation: '明白 (Mìhng baahk)', pronunciation: 'Mìhng baahk', english: 'Okay' }
            ]
          },
          {
            english: 'Your heart rate is normal',
            translation: '你嘅心跳正常 (Néih ge sām tiu jing sèuhng)',
            responses: [
              { translation: '多謝 (Dō jeh)', pronunciation: 'Dō jeh', english: 'Thank you' },
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'Good' },
              { translation: '好彩 (Hóu chói)', pronunciation: 'Hóu chói', english: 'That\'s good' },
              { translation: '太好喇 (Taai hóu la)', pronunciation: 'Taai hóu la', english: 'That\'s great' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Medical History',
        phrases: [
          {
            english: 'Do you have any allergies?',
            translation: '你有冇敏感？(Néih yáuh móuh mán gám?)',
            responses: [
              { translation: '有 (Yáuh)', pronunciation: 'Yáuh', english: 'Yes' },
              { translation: '冇 (Móuh)', pronunciation: 'Móuh', english: 'No' },
              { translation: '盤尼西林 (Pùhn nèih sāi làhm)', pronunciation: 'Pùhn nèih sāi làhm', english: 'Penicillin' },
              { translation: '花生 (Fā sāng)', pronunciation: 'Fā sāng', english: 'Peanuts' }
            ]
          },
          {
            english: 'Are you taking any medications?',
            translation: '你有冇食緊藥？(Néih yáuh móuh sihk gán yeuhk?)',
            responses: [
              { translation: '有 (Yáuh)', pronunciation: 'Yáuh', english: 'Yes' },
              { translation: '冇 (Móuh)', pronunciation: 'Móuh', english: 'No' },
              { translation: '糖尿病藥 (Tòhng niuh behng yeuhk)', pronunciation: 'Tòhng niuh behng yeuhk', english: 'Diabetes medication' },
              { translation: '心臟藥 (Sām johng yeuhk)', pronunciation: 'Sām johng yeuhk', english: 'Heart medication' }
            ]
          },
          {
            english: 'Have you had surgery before?',
            translation: '你以前做過手術未？(Néih yíh chìhn jouh gwo sáu seuht meih?)',
            responses: [
              { translation: '做過 (Jouh gwo)', pronunciation: 'Jouh gwo', english: 'Yes' },
              { translation: '未 (Meih)', pronunciation: 'Meih', english: 'No' },
              { translation: '好耐之前 (Hóu noih jī chìhn)', pronunciation: 'Hóu noih jī chìhn', english: 'Long time ago' },
              { translation: '唔記得 (M̀h gei dāk)', pronunciation: 'M̀h gei dāk', english: "I don't remember" }
            ]
          },
          {
            english: 'Do you have any chronic conditions?',
            translation: '你有冇慢性病？(Néih yáuh móuh maahn sing behng?)',
            responses: [
              { translation: '糖尿病 (Tòhng niuh behng)', pronunciation: 'Tòhng niuh behng', english: 'Diabetes' },
              { translation: '高血壓 (Gōu hyut ngaat)', pronunciation: 'Gōu hyut ngaat', english: 'High blood pressure' },
              { translation: '哮喘 (Haau chyún)', pronunciation: 'Haau chyún', english: 'Asthma' },
              { translation: '冇 (Móuh)', pronunciation: 'Móuh', english: 'No' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Consent and Procedures',
        phrases: [
          {
            english: 'I need to examine you',
            translation: '我要檢查你 (Ngóh yiu gím chàh néih)',
            responses: [
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'Yes' },
              { translation: '可以 (Hó yíh)', pronunciation: 'Hó yíh', english: 'Go ahead' },
              { translation: '冇問題 (Móuh manh tàih)', pronunciation: 'Móuh manh tàih', english: 'No problem' },
              { translation: '得 (Dāk)', pronunciation: 'Dāk', english: 'Okay' }
            ]
          },
          {
            english: 'We need to do blood tests',
            translation: '我哋要驗血 (Ngóh deih yiu yihm hyut)',
            responses: [
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'That\'s fine' },
              { translation: '點解 (Dím gáai)', pronunciation: 'Dím gáai', english: 'Why' },
              { translation: '我驚 (Ngóh gēng)', pronunciation: 'Ngóh gēng', english: 'I\'m afraid' },
              { translation: '得 (Dāk)', pronunciation: 'Dāk', english: 'Yes' }
            ]
          },
          {
            english: 'Please sign this consent form',
            translation: '請喺呢份同意書度簽名 (Chéng hái nī fahn tùhng yi syū douh chīm méng)',
            responses: [
              { translation: '喺邊度簽 (Hái bīn douh chīm)', pronunciation: 'Hái bīn douh chīm', english: 'Where do I sign' },
              { translation: '呢個係乜 (Nī go haih māt)', pronunciation: 'Nī go haih māt', english: 'What is this' },
              { translation: '我要幫手 (Ngóh yiu bōng sáu)', pronunciation: 'Ngóh yiu bōng sáu', english: 'I need help' },
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'Yes' }
            ]
          },
          {
            english: 'This procedure will take about 30 minutes',
            translation: '呢個程序大約要30分鐘 (Nī go chìhng jeuih daaih yeuk yiu sāam sahp fān jūng)',
            responses: [
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'That\'s fine' },
              { translation: '要幾耐 (Yiu géi noih)', pronunciation: 'Yiu géi noih', english: 'How long' },
              { translation: '會唔會痛 (Wúih m̀h wúih tung)', pronunciation: 'Wúih m̀h wúih tung', english: 'Will it hurt' },
              { translation: '得 (Dāk)', pronunciation: 'Dāk', english: 'Okay' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Discharge Instructions',
        phrases: [
          {
            english: 'Take this medication twice a day',
            translation: '每日食兩次呢隻藥 (Múih yaht sihk léuhng chi nī jek yeuhk)',
            responses: [
              { translation: '明白 (Mìhng baahk)', pronunciation: 'Mìhng baahk', english: 'I understand' },
              { translation: '同埋飯食 (Tùhng màaih faahn sihk)', pronunciation: 'Tùhng màaih faahn sihk', english: 'With food' },
              { translation: '幾時食 (Géi sìh sihk)', pronunciation: 'Géi sìh sihk', english: 'When' },
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'Yes' }
            ]
          },
          {
            english: 'Come back if symptoms worsen',
            translation: '如果情況惡化就返嚟 (Yùh gwó chìhng fong ok fa jauh fāan lèih)',
            responses: [
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'Yes' },
              { translation: '明白 (Mìhng baahk)', pronunciation: 'Mìhng baahk', english: 'I understand' },
              { translation: '幾時返嚟 (Géi sìh fāan lèih)', pronunciation: 'Géi sìh fāan lèih', english: 'When should I return' },
              { translation: '多謝 (Dō jeh)', pronunciation: 'Dō jeh', english: 'Thank you' }
            ]
          },
          {
            english: 'Rest for the next 24 hours',
            translation: '休息24個鐘 (Yāu sīk yih sahp sei go jūng)',
            responses: [
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'Yes' },
              { translation: '我可唔可以做嘢 (Ngóh hó m̀h hó yíh jouh yéh)', pronunciation: 'Ngóh hó m̀h hó yíh jouh yéh', english: 'Can I work' },
              { translation: '明白 (Mìhng baahk)', pronunciation: 'Mìhng baahk', english: 'I understand' },
              { translation: '得 (Dāk)', pronunciation: 'Dāk', english: 'Okay' }
            ]
          },
          {
            english: 'Follow up with your doctor in one week',
            translation: '一個禮拜之後去睇醫生 (Yāt go láih baai jī hauh heui tái yī sāng)',
            responses: [
              { translation: '好 (Hóu)', pronunciation: 'Hóu', english: 'Yes' },
              { translation: '我冇醫生 (Ngóh móuh yī sāng)', pronunciation: 'Ngóh móuh yī sāng', english: 'I don\'t have a doctor' },
              { translation: '喺邊度 (Hái bīn douh)', pronunciation: 'Hái bīn douh', english: 'Where' },
              { translation: '多謝 (Dō jeh)', pronunciation: 'Dō jeh', english: 'Thank you' }
            ]
          }
        ]
      }
    ]
  },
  'mental-health': {
    spanish: [
      {
        groupLabel: 'Initial Assessment',
        phrases: [
          {
            english: 'How are you feeling today?',
            translation: '¿Cómo se siente hoy?',
            responses: [
              { translation: 'Bien', pronunciation: 'bee-EHN', english: 'Good' },
              { translation: 'Mal', pronunciation: 'mahl', english: 'Bad' },
              { translation: 'Triste', pronunciation: 'TREES-teh', english: 'Sad' },
              { translation: 'Ansioso', pronunciation: 'ahn-see-OH-soh', english: 'Anxious' }
            ]
          },
          {
            english: 'What brings you here today?',
            translation: '¿Qué lo trae aquí hoy?',
            responses: [
              { translation: 'Necesito ayuda', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah', english: 'I need help' },
              { translation: 'Me siento mal', pronunciation: 'meh see-EHN-toh mahl', english: 'I feel bad' },
              { translation: 'Estoy deprimido', pronunciation: 'es-TOY deh-pree-MEE-doh', english: 'I\'m depressed' },
              { translation: 'No puedo dormir', pronunciation: 'noh PWEH-doh dohr-MEER', english: 'I can\'t sleep' }
            ]
          },
          {
            english: 'Have you been feeling this way for a long time?',
            translation: '¿Se ha sentido así por mucho tiempo?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Unas semanas', pronunciation: 'OO-nahs seh-MAH-nahs', english: 'A few weeks' },
              { translation: 'Meses', pronunciation: 'MEH-ses', english: 'Months' }
            ]
          },
          {
            english: 'Do you have a history of mental health issues?',
            translation: '¿Tiene historial de problemas de salud mental?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'En mi familia', pronunciation: 'en mee fah-MEE-lee-ah', english: 'In my family' },
              { translation: 'No sé', pronunciation: 'noh seh', english: "I don't know" }
            ]
          }
        ]
      },
      {
        groupLabel: 'Safety Check',
        phrases: [
          {
            english: 'Are you having thoughts of hurting yourself?',
            translation: '¿Tiene pensamientos de hacerse daño?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'A veces', pronunciation: 'ah BEH-ses', english: 'Sometimes' },
              { translation: 'No quiero hablar', pronunciation: 'noh kee-EH-roh ah-BLAHR', english: "I don't want to talk" }
            ]
          },
          {
            english: 'Do you have a plan to hurt yourself?',
            translation: '¿Tiene un plan para hacerse daño?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Solo pensamientos', pronunciation: 'SOH-loh pen-sah-mee-EHN-tohs', english: 'Just thoughts' },
              { translation: 'No sé', pronunciation: 'noh seh', english: "I don't know" }
            ]
          },
          {
            english: 'Do you feel safe at home?',
            translation: '¿Se siente seguro en casa?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'A veces', pronunciation: 'ah BEH-ses', english: 'Sometimes' },
              { translation: 'No tengo casa', pronunciation: 'noh TEHN-goh KAH-sah', english: 'I don\'t have a home' }
            ]
          },
          {
            english: 'Is anyone hurting you?',
            translation: '¿Alguien le está haciendo daño?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Mi pareja', pronunciation: 'mee pah-REH-hah', english: 'My partner' },
              { translation: 'Tengo miedo', pronunciation: 'TEHN-goh mee-EH-doh', english: 'I\'m afraid' }
            ]
          },
          {
            english: 'Do you have someone you can talk to?',
            translation: '¿Tiene alguien con quien hablar?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Mi familia', pronunciation: 'mee fah-MEE-lee-ah', english: 'My family' },
              { translation: 'Nadie', pronunciation: 'NAH-dee-eh', english: 'Nobody' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Therapeutic Communication',
        phrases: [
          {
            english: 'It\'s okay to feel this way',
            translation: 'Está bien sentirse así',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'No sé', pronunciation: 'noh seh', english: "I don't know" },
              { translation: 'Me siento mal', pronunciation: 'meh see-EHN-toh mahl', english: 'I feel bad' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' }
            ]
          },
          {
            english: 'I\'m here to help you',
            translation: 'Estoy aquí para ayudarle',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Necesito ayuda', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah', english: 'I need help' },
              { translation: 'Qué puedo hacer', pronunciation: 'keh PWEH-doh ah-SEHR', english: 'What can I do' },
              { translation: 'Por favor', pronunciation: 'pohr fah-BOHR', english: 'Please' }
            ]
          },
          {
            english: 'Can you tell me more about how you\'re feeling?',
            translation: '¿Puede contarme más sobre cómo se siente?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No sé cómo explicar', pronunciation: 'noh seh KOH-moh ex-plee-KAHR', english: 'I don\'t know how to explain' },
              { translation: 'Me siento vacío', pronunciation: 'meh see-EHN-toh bah-SEE-oh', english: 'I feel empty' },
              { translation: 'Estoy perdido', pronunciation: 'es-TOY pehr-DEE-doh', english: 'I\'m lost' }
            ]
          },
          {
            english: 'Your feelings are valid',
            translation: 'Sus sentimientos son válidos',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'No lo siento así', pronunciation: 'noh loh see-EHN-toh ah-SEE', english: 'I don\'t feel that way' },
              { translation: 'Me ayuda oír eso', pronunciation: 'meh ah-YOO-dah oh-EER EH-soh', english: 'It helps to hear that' },
              { translation: 'Necesito tiempo', pronunciation: 'neh-seh-SEE-toh tee-EHM-poh', english: 'I need time' }
            ]
          },
          {
            english: 'We can work through this together',
            translation: 'Podemos trabajar en esto juntos',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Tengo esperanza', pronunciation: 'TEHN-goh es-peh-RAHN-sah', english: 'I have hope' },
              { translation: 'Qué hago', pronunciation: 'keh AH-goh', english: 'What do I do' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Crisis De-escalation',
        phrases: [
          {
            english: 'Please take a deep breath',
            translation: 'Por favor respire profundo',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'No puedo', pronunciation: 'noh PWEH-doh', english: 'I can\'t' },
              { translation: 'Ayúdame', pronunciation: 'ah-YOO-dah-meh', english: 'Help me' },
              { translation: 'Estoy tratando', pronunciation: 'es-TOY trah-TAHN-doh', english: 'I\'m trying' }
            ]
          },
          {
            english: 'You are safe here',
            translation: 'Está seguro aquí',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Tengo miedo', pronunciation: 'TEHN-goh mee-EH-doh', english: 'I\'m afraid' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'No me siento seguro', pronunciation: 'noh meh see-EHN-toh seh-GOO-roh', english: 'I don\'t feel safe' }
            ]
          },
          {
            english: 'Let\'s focus on calming down',
            translation: 'Vamos a enfocarnos en calmarnos',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Cómo', pronunciation: 'KOH-moh', english: 'How' },
              { translation: 'Estoy intentando', pronunciation: 'es-TOY een-ten-TAHN-doh', english: 'I\'m trying' },
              { translation: 'Ayúdame', pronunciation: 'ah-YOO-dah-meh', english: 'Help me' }
            ]
          },
          {
            english: 'I\'m not going to leave you',
            translation: 'No voy a dejarlo',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Por favor', pronunciation: 'pohr fah-BOHR', english: 'Please' },
              { translation: 'Tengo miedo', pronunciation: 'TEHN-goh mee-EH-doh', english: 'I\'m afraid' },
              { translation: 'Me ayuda', pronunciation: 'meh ah-YOO-dah', english: 'That helps' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Follow Up Care',
        phrases: [
          {
            english: 'Would you like to schedule a follow-up appointment?',
            translation: '¿Quiere programar una cita de seguimiento?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Cuándo', pronunciation: 'KWAHN-doh', english: 'When' },
              { translation: 'Necesito pensar', pronunciation: 'neh-seh-SEE-toh pen-SAHR', english: 'I need to think' }
            ]
          },
          {
            english: 'Here is a crisis hotline number',
            translation: 'Aquí tiene un número de línea de crisis',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Lo voy a guardar', pronunciation: 'loh boy ah gwahr-DAHR', english: 'I\'ll keep it' },
              { translation: 'Puedo llamar', pronunciation: 'PWEH-doh yah-MAHR', english: 'Can I call' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' }
            ]
          },
          {
            english: 'Do you need a referral to a specialist?',
            translation: '¿Necesita una referencia a un especialista?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Qué tipo', pronunciation: 'keh TEE-poh', english: 'What kind' },
              { translation: 'Por favor', pronunciation: 'pohr fah-BOHR', english: 'Please' }
            ]
          },
          {
            english: 'Continue taking your medication as prescribed',
            translation: 'Continúe tomando su medicamento como se lo recetaron',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: 'No me gusta', pronunciation: 'noh meh GOOS-tah', english: 'I don\'t like it' },
              { translation: 'Tiene efectos secundarios', pronunciation: 'tee-EH-neh eh-FEK-tohs seh-koon-DAH-ree-ohs', english: 'It has side effects' }
            ]
          }
        ]
      }
    ],
    tagalog: [],
    vietnamese: [],
    mandarin: [],
    cantonese: []
  },
  'dental-health': {
    spanish: [
      {
        groupLabel: 'Pain and Symptoms',
        phrases: [
          {
            english: 'Do you have tooth pain?',
            translation: '¿Tiene dolor de dientes?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Mucho', pronunciation: 'MOO-choh', english: 'A lot' },
              { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' },
              { translation: 'Solo al masticar', pronunciation: 'SOH-loh ahl mahs-tee-KAHR', english: 'Only when chewing' }
            ]
          },
          {
            english: 'Which tooth hurts?',
            translation: '¿Cuál diente le duele?',
            responses: [
              { translation: 'Este', pronunciation: 'EHS-teh', english: 'This one' },
              { translation: 'Arriba', pronunciation: 'ah-REE-bah', english: 'Top' },
              { translation: 'Abajo', pronunciation: 'ah-BAH-hoh', english: 'Bottom' },
              { translation: 'El del fondo', pronunciation: 'el del FOHN-doh', english: 'The back one' },
              { translation: 'No sé exactamente', pronunciation: 'noh seh ex-ahk-tah-MEHN-teh', english: 'Not exactly sure' }
            ]
          },
          {
            english: 'Is it sensitive to hot or cold?',
            translation: '¿Es sensible al calor o al frío?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Al frío', pronunciation: 'ahl FREE-oh', english: 'To cold' },
              { translation: 'Al calor', pronunciation: 'ahl kah-LOHR', english: 'To hot' },
              { translation: 'A ambos', pronunciation: 'ah AHM-bohs', english: 'To both' },
              { translation: 'No', pronunciation: 'noh', english: 'No' }
            ]
          },
          {
            english: 'Do your gums bleed?',
            translation: '¿Le sangran las encías?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Al cepillarme', pronunciation: 'ahl seh-pee-YAHR-meh', english: 'When brushing' },
              { translation: 'A veces', pronunciation: 'ah BEH-ses', english: 'Sometimes' },
              { translation: 'Mucho', pronunciation: 'MOO-choh', english: 'A lot' }
            ]
          },
          {
            english: 'Do you have any swelling?',
            translation: '¿Tiene alguna hinchazón?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'En la encía', pronunciation: 'en lah en-SEE-ah', english: 'In the gum' },
              { translation: 'En la cara', pronunciation: 'en lah KAH-rah', english: 'In the face' },
              { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' }
            ]
          },
          {
            english: 'When did you last see a dentist?',
            translation: '¿Cuándo fue la última vez que vio a un dentista?',
            responses: [
              { translation: 'Hace un mes', pronunciation: 'AH-seh oon mehs', english: 'A month ago' },
              { translation: 'Hace un año', pronunciation: 'AH-seh oon AH-nyoh', english: 'A year ago' },
              { translation: 'Hace mucho', pronunciation: 'AH-seh MOO-choh', english: 'A long time ago' },
              { translation: 'No recuerdo', pronunciation: 'noh reh-KWEHR-doh', english: "I don't remember" },
              { translation: 'Nunca', pronunciation: 'NOON-kah', english: 'Never' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Procedure Explanation',
        phrases: [
          {
            english: 'I need to take an X-ray',
            translation: 'Necesito tomar una radiografía',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: '¿Duele?', pronunciation: 'DWEH-leh', english: 'Does it hurt?' },
              { translation: '¿Cuánto tiempo?', pronunciation: 'KWAHN-toh tee-EHM-poh', english: 'How long?' }
            ]
          },
          {
            english: 'You need a filling',
            translation: 'Necesita un empaste',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: '¿Cuánto cuesta?', pronunciation: 'KWAHN-toh KWES-tah', english: 'How much does it cost?' },
              { translation: '¿Hoy?', pronunciation: 'oy', english: 'Today?' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' }
            ]
          },
          {
            english: 'You may need a root canal',
            translation: 'Puede que necesite un tratamiento de conducto',
            responses: [
              { translation: '¿Qué es eso?', pronunciation: 'keh es EH-soh', english: 'What is that?' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: '¿Duele?', pronunciation: 'DWEH-leh', english: 'Does it hurt?' },
              { translation: 'No quiero', pronunciation: 'noh kee-EH-roh', english: "I don't want" }
            ]
          },
          {
            english: 'I will numb the area first',
            translation: 'Primero voy a adormecer el área',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: '¿Cuánto tarda?', pronunciation: 'KWAHN-toh TAHR-dah', english: 'How long does it take?' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' }
            ]
          },
          {
            english: 'This may cause some pressure',
            translation: 'Esto puede causar algo de presión',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: 'Me duele', pronunciation: 'meh DWEH-leh', english: 'It hurts me' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: "It's okay" }
            ]
          },
          {
            english: 'The tooth needs to be extracted',
            translation: 'El diente necesita ser extraído',
            responses: [
              { translation: '¿Tiene que ser?', pronunciation: 'tee-EH-neh keh sehr', english: 'Does it have to be?' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: '¿Cuándo?', pronunciation: 'KWAHN-doh', english: 'When?' },
              { translation: 'Tengo miedo', pronunciation: 'TEHN-goh mee-EH-doh', english: "I'm scared" }
            ]
          },
          {
            english: 'You need a cleaning',
            translation: 'Necesita una limpieza',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: '¿Hoy?', pronunciation: 'oy', english: 'Today?' },
              { translation: '¿Cuánto cuesta?', pronunciation: 'KWAHN-toh KWES-tah', english: 'How much?' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Post Care Instructions',
        phrases: [
          {
            english: 'Do not eat for 2 hours',
            translation: 'No coma por 2 horas',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: '¿Puedo tomar agua?', pronunciation: 'PWEH-doh toh-MAHR AH-gwah', english: 'Can I drink water?' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' }
            ]
          },
          {
            english: 'Take this pain medication if needed',
            translation: 'Tome este medicamento para el dolor si es necesario',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: '¿Cada cuánto?', pronunciation: 'KAH-dah KWAHN-toh', english: 'How often?' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' }
            ]
          },
          {
            english: 'Avoid hot drinks today',
            translation: 'Evite bebidas calientes hoy',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: '¿Por qué?', pronunciation: 'pohr keh', english: 'Why?' }
            ]
          },
          {
            english: 'Rinse with salt water',
            translation: 'Enjuague con agua salada',
            responses: [
              { translation: '¿Cuántas veces?', pronunciation: 'KWAHN-tahs BEH-ses', english: 'How many times?' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: '¿Cuándo?', pronunciation: 'KWAHN-doh', english: 'When?' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' }
            ]
          },
          {
            english: 'Brush gently around the area',
            translation: 'Cepille suavemente alrededor del área',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: '¿Por cuánto tiempo?', pronunciation: 'pohr KWAHN-toh tee-EHM-poh', english: 'For how long?' }
            ]
          },
          {
            english: 'Call if you have bleeding that won\'t stop',
            translation: 'Llame si tiene sangrado que no para',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: '¿Qué número?', pronunciation: 'keh NOO-meh-roh', english: 'What number?' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' }
            ]
          },
          {
            english: 'Come back in one week',
            translation: 'Regrese en una semana',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: '¿Qué día?', pronunciation: 'keh DEE-ah', english: 'What day?' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' }
            ]
          }
        ]
      }
    ],
    tagalog: [],
    vietnamese: [],
    mandarin: [],
    cantonese: []
  },
  'emergency-crisis': {
    spanish: [
      {
        groupLabel: 'Immediate Assessment',
        phrases: [
          {
            english: 'Can you breathe?',
            translation: '¿Puede respirar?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Difícil', pronunciation: 'dee-FEE-seel', english: 'Difficult' },
              { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' }
            ]
          },
          {
            english: 'Are you bleeding?',
            translation: '¿Está sangrando?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Mucho', pronunciation: 'MOO-choh', english: 'A lot' },
              { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' }
            ]
          },
          {
            english: 'Can you move?',
            translation: '¿Puede moverse?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Me duele', pronunciation: 'meh DWEH-leh', english: 'It hurts' },
              { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' }
            ]
          },
          {
            english: 'Where is the pain?',
            translation: '¿Dónde está el dolor?',
            responses: [
              { translation: 'Aquí', pronunciation: 'ah-KEE', english: 'Here' },
              { translation: 'El pecho', pronunciation: 'el PEH-choh', english: 'The chest' },
              { translation: 'La cabeza', pronunciation: 'lah kah-BEH-sah', english: 'The head' },
              { translation: 'Todo el cuerpo', pronunciation: 'TOH-doh el KWEHR-poh', english: 'Whole body' }
            ]
          },
          {
            english: 'Are you conscious?',
            translation: '¿Está consciente?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Mareado', pronunciation: 'mah-reh-AH-doh', english: 'Dizzy' },
              { translation: 'Confundido', pronunciation: 'kohn-foon-DEE-doh', english: 'Confused' },
              { translation: 'Me duele', pronunciation: 'meh DWEH-leh', english: 'I hurt' }
            ]
          },
          {
            english: 'What happened?',
            translation: '¿Qué pasó?',
            responses: [
              { translation: 'Me caí', pronunciation: 'meh kah-EE', english: 'I fell' },
              { translation: 'Un accidente', pronunciation: 'oon ahk-see-DEN-teh', english: 'An accident' },
              { translation: 'No sé', pronunciation: 'noh seh', english: "I don't know" },
              { translation: 'Me golpearon', pronunciation: 'meh gohl-peh-AH-rohn', english: 'I was hit' }
            ]
          },
          {
            english: 'Do you have chest pain?',
            translation: '¿Tiene dolor en el pecho?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Mucho', pronunciation: 'MOO-choh', english: 'A lot' },
              { translation: 'Presión', pronunciation: 'preh-see-OHN', english: 'Pressure' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Patient Stabilization',
        phrases: [
          {
            english: 'Stay still, help is coming',
            translation: 'Quédese quieto, viene ayuda',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Me duele', pronunciation: 'meh DWEH-leh', english: 'It hurts' },
              { translation: 'Tengo miedo', pronunciation: 'TEHN-goh mee-EH-doh', english: "I'm scared" },
              { translation: 'Rápido', pronunciation: 'RAH-pee-doh', english: 'Quickly' }
            ]
          },
          {
            english: 'Keep pressure on the wound',
            translation: 'Mantenga presión en la herida',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Me duele', pronunciation: 'meh DWEH-leh', english: 'It hurts' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'No puedo', pronunciation: 'noh PWEH-doh', english: "I can't" }
            ]
          },
          {
            english: 'Don\'t move your neck',
            translation: 'No mueva el cuello',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Me duele', pronunciation: 'meh DWEH-leh', english: 'It hurts' },
              { translation: 'Por qué', pronunciation: 'pohr keh', english: 'Why' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' }
            ]
          },
          {
            english: 'Try to stay calm',
            translation: 'Trate de mantener la calma',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Tengo miedo', pronunciation: 'TEHN-goh mee-EH-doh', english: "I'm scared" },
              { translation: 'Me duele', pronunciation: 'meh DWEH-leh', english: 'It hurts' },
              { translation: 'Estoy intentando', pronunciation: 'es-TOY een-ten-TAHN-doh', english: "I'm trying" }
            ]
          },
          {
            english: 'Ambulance is on the way',
            translation: 'La ambulancia viene en camino',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Rápido', pronunciation: 'RAH-pee-doh', english: 'Quickly' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Me duele mucho', pronunciation: 'meh DWEH-leh MOO-choh', english: 'It hurts a lot' }
            ]
          },
          {
            english: 'I\'m going to check your pulse',
            translation: 'Voy a revisar su pulso',
            responses: [
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Adelante', pronunciation: 'ah-deh-LAHN-teh', english: 'Go ahead' },
              { translation: 'Me duele', pronunciation: 'meh DWEH-leh', english: 'It hurts' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Family Communication',
        phrases: [
          {
            english: 'We need to contact your family',
            translation: 'Necesitamos contactar a su familia',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Por favor', pronunciation: 'pohr fah-BOHR', english: 'Please' },
              { translation: 'Mi teléfono', pronunciation: 'mee teh-LEH-foh-noh', english: 'My phone' },
              { translation: 'En mi bolsillo', pronunciation: 'en mee bohl-SEE-yoh', english: 'In my pocket' }
            ]
          },
          {
            english: 'What is your emergency contact?',
            translation: '¿Cuál es su contacto de emergencia?',
            responses: [
              { translation: 'Mi esposa', pronunciation: 'mee es-POH-sah', english: 'My wife' },
              { translation: 'Mi esposo', pronunciation: 'mee es-POH-soh', english: 'My husband' },
              { translation: 'Mi madre', pronunciation: 'mee MAH-dreh', english: 'My mother' },
              { translation: 'Mi hermano', pronunciation: 'mee ehr-MAH-noh', english: 'My brother' }
            ]
          },
          {
            english: 'Your family is on the way',
            translation: 'Su familia viene en camino',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Cuándo llegan', pronunciation: 'KWAHN-doh YEH-gahn', english: 'When do they arrive' },
              { translation: 'Bien', pronunciation: 'bee-EHN', english: 'Good' }
            ]
          },
          {
            english: 'Is there anyone we should call?',
            translation: '¿Hay alguien a quien debamos llamar?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Mi familia', pronunciation: 'mee fah-MEE-lee-ah', english: 'My family' },
              { translation: 'Mi jefe', pronunciation: 'mee HEH-feh', english: 'My boss' },
              { translation: 'No', pronunciation: 'noh', english: 'No' }
            ]
          },
          {
            english: 'Do you want someone with you?',
            translation: '¿Quiere que alguien esté con usted?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Por favor', pronunciation: 'pohr fah-BOHR', english: 'Please' },
              { translation: 'Mi familia', pronunciation: 'mee fah-MEE-lee-ah', english: 'My family' },
              { translation: 'No estoy solo', pronunciation: 'noh es-TOY SOH-loh', english: "I'm not alone" }
            ]
          },
          {
            english: 'We will keep your family informed',
            translation: 'Mantendremos a su familia informada',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Por favor', pronunciation: 'pohr fah-BOHR', english: 'Please' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' }
            ]
          },
          {
            english: 'Your family has been notified',
            translation: 'Su familia ha sido notificada',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Bien', pronunciation: 'bee-EHN', english: 'Good' },
              { translation: 'Okay', pronunciation: 'oh-KAY', english: 'Okay' },
              { translation: 'Cuándo vienen', pronunciation: 'KWAHN-doh bee-EH-nen', english: 'When are they coming' }
            ]
          }
        ]
      }
    ],
    tagalog: [],
    vietnamese: [],
    mandarin: [],
    cantonese: []
  },
  'safe-haven-immigration': {
    spanish: [
      {
        groupLabel: 'Identifying the Situation',
        phrases: [
          {
            english: 'Are you here seeking safety?',
            translation: '¿Está aquí buscando seguridad?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Necesito ayuda', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah', english: 'I need help' },
              { translation: 'Tengo miedo', pronunciation: 'TEHN-goh mee-EH-doh', english: 'I\'m afraid' },
              { translation: 'No sé', pronunciation: 'noh seh', english: 'I don\'t know' }
            ]
          },
          {
            english: 'Do you have your immigration documents?',
            translation: '¿Tiene sus documentos de inmigración?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Los perdí', pronunciation: 'lohs pehr-DEE', english: 'I lost them' },
              { translation: 'Están en casa', pronunciation: 'es-TAHN en KAH-sah', english: 'They\'re at home' }
            ]
          },
          {
            english: 'Do you feel safe at home?',
            translation: '¿Se siente seguro en casa?',
            responses: [
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'A veces', pronunciation: 'ah BEH-ses', english: 'Sometimes' },
              { translation: 'No puedo volver', pronunciation: 'noh PWEH-doh bohl-BEHR', english: 'I can\'t go back' }
            ]
          },
          {
            english: 'Has anyone threatened you or your family?',
            translation: '¿Alguien lo ha amenazado a usted o a su familia?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Tengo miedo de hablar', pronunciation: 'TEHN-goh mee-EH-doh deh ah-BLAHR', english: 'I\'m afraid to talk' },
              { translation: 'Mi familia está en peligro', pronunciation: 'mee fah-MEE-lee-ah es-TAH en peh-LEE-groh', english: 'My family is in danger' }
            ]
          },
          {
            english: 'How long have you been in the United States?',
            translation: '¿Cuánto tiempo lleva en los Estados Unidos?',
            responses: [
              { translation: 'Un mes', pronunciation: 'oon mehs', english: 'One month' },
              { translation: 'Seis meses', pronunciation: 'say-EES MEH-ses', english: 'Six months' },
              { translation: 'Un año', pronunciation: 'oon AH-nyoh', english: 'One year' },
              { translation: 'Muchos años', pronunciation: 'MOO-chohs AH-nyohs', english: 'Many years' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Rights and Protections',
        phrases: [
          {
            english: 'You have the right to remain silent',
            translation: 'Usted tiene el derecho de permanecer en silencio',
            responses: [
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Qué significa eso', pronunciation: 'keh seeg-nee-FEE-kah EH-soh', english: 'What does that mean' },
              { translation: 'Quiero hablar', pronunciation: 'kee-EH-roh ah-BLAHR', english: 'I want to talk' }
            ]
          },
          {
            english: 'You have the right to speak with a lawyer',
            translation: 'Usted tiene derecho a hablar con un abogado',
            responses: [
              { translation: 'Sí, por favor', pronunciation: 'see pohr fah-BOHR', english: 'Yes, please' },
              { translation: 'Necesito un abogado', pronunciation: 'neh-seh-SEE-toh oon ah-boh-GAH-doh', english: 'I need a lawyer' },
              { translation: 'No tengo dinero', pronunciation: 'noh TEHN-goh dee-NEH-roh', english: 'I don\'t have money' },
              { translation: 'Dónde puedo conseguir uno', pronunciation: 'DOHN-deh PWEH-doh kohn-seh-GEER OO-noh', english: 'Where can I get one' }
            ]
          },
          {
            english: 'We will not report your immigration status',
            translation: 'No vamos a reportar su estado migratorio',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Está seguro', pronunciation: 'es-TAH seh-GOO-roh', english: 'Are you sure' },
              { translation: 'Tengo miedo', pronunciation: 'TEHN-goh mee-EH-doh', english: 'I\'m afraid' },
              { translation: 'Me alegro', pronunciation: 'meh ah-LEH-groh', english: 'I\'m glad' }
            ]
          },
          {
            english: 'This is a safe space for all students',
            translation: 'Este es un espacio seguro para todos los estudiantes',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Me siento mejor', pronunciation: 'meh see-EHN-toh meh-HOHR', english: 'I feel better' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: 'Qué bueno', pronunciation: 'keh BWEH-noh', english: 'That\'s good' }
            ]
          },
          {
            english: 'You cannot be discriminated against because of your status',
            translation: 'No pueden discriminarlo por su estatus',
            responses: [
              { translation: 'Gracias por decirme', pronunciation: 'GRAH-see-ahs pohr deh-SEER-meh', english: 'Thank you for telling me' },
              { translation: 'No lo sabía', pronunciation: 'noh loh sah-BEE-ah', english: 'I didn\'t know' },
              { translation: 'Me siento protegido', pronunciation: 'meh see-EHN-toh proh-teh-HEE-doh', english: 'I feel protected' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'That\'s good' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Immediate Actions',
        phrases: [
          {
            english: 'I will connect you with our counselor',
            translation: 'Lo voy a conectar con nuestro consejero',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Sí, por favor', pronunciation: 'see pohr fah-BOHR', english: 'Yes, please' },
              { translation: 'Cuándo', pronunciation: 'KWAHN-doh', english: 'When' },
              { translation: 'Necesito hablar ahora', pronunciation: 'neh-seh-SEE-toh ah-BLAHR ah-OH-rah', english: 'I need to talk now' }
            ]
          },
          {
            english: 'Do you need a safe place to stay tonight?',
            translation: '¿Necesita un lugar seguro para quedarse esta noche?',
            responses: [
              { translation: 'Sí, por favor', pronunciation: 'see pohr fah-BOHR', english: 'Yes, please' },
              { translation: 'No sé', pronunciation: 'noh seh', english: 'I don\'t know' },
              { translation: 'Tengo donde quedarme', pronunciation: 'TEHN-goh DOHN-deh keh-DAHR-meh', english: 'I have somewhere to stay' },
              { translation: 'Tengo miedo de volver a casa', pronunciation: 'TEHN-goh mee-EH-doh deh bohl-BEHR ah KAH-sah', english: 'I\'m afraid to go home' }
            ]
          },
          {
            english: 'We can provide emergency food and clothing',
            translation: 'Podemos proporcionar comida y ropa de emergencia',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Sí, necesito ayuda', pronunciation: 'see neh-seh-SEE-toh ah-YOO-dah', english: 'Yes, I need help' },
              { translation: 'Dónde', pronunciation: 'DOHN-deh', english: 'Where' },
              { translation: 'Para mi familia también', pronunciation: 'PAH-rah mee fah-MEE-lee-ah tahm-bee-EHN', english: 'For my family too' }
            ]
          },
          {
            english: 'I will call our social worker to help you',
            translation: 'Voy a llamar a nuestro trabajador social para ayudarlo',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Sí, por favor', pronunciation: 'see pohr fah-BOHR', english: 'Yes, please' },
              { translation: 'Cuánto tiempo tomará', pronunciation: 'KWAHN-toh tee-EHM-poh toh-mah-RAH', english: 'How long will it take' },
              { translation: 'Necesito ayuda urgente', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah oor-HEHN-teh', english: 'I need urgent help' }
            ]
          },
          {
            english: 'Here is a list of legal aid organizations',
            translation: 'Aquí tiene una lista de organizaciones de ayuda legal',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Puedo llamar desde aquí', pronunciation: 'PWEH-doh yah-MAHR DEHS-deh ah-KEE', english: 'Can I call from here' },
              { translation: 'Hablan español', pronunciation: 'AH-blahn es-pah-NYOHL', english: 'Do they speak Spanish' },
              { translation: 'Son gratis', pronunciation: 'sohn GRAH-tees', english: 'Are they free' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Family Communication',
        phrases: [
          {
            english: 'Do you need to contact your family?',
            translation: '¿Necesita contactar a su familia?',
            responses: [
              { translation: 'Sí, por favor', pronunciation: 'see pohr fah-BOHR', english: 'Yes, please' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'No tengo teléfono', pronunciation: 'noh TEHN-goh teh-LEH-foh-noh', english: 'I don\'t have a phone' },
              { translation: 'Están en otro país', pronunciation: 'es-TAHN en OH-troh pah-EES', english: 'They\'re in another country' }
            ]
          },
          {
            english: 'Who is your emergency contact?',
            translation: '¿Quién es su contacto de emergencia?',
            responses: [
              { translation: 'Mi madre', pronunciation: 'mee MAH-dreh', english: 'My mother' },
              { translation: 'Mi hermano', pronunciation: 'mee ehr-MAH-noh', english: 'My brother' },
              { translation: 'No tengo', pronunciation: 'noh TEHN-goh', english: 'I don\'t have one' },
              { translation: 'Un amigo', pronunciation: 'oon ah-MEE-goh', english: 'A friend' }
            ]
          },
          {
            english: 'Does your family know where you are?',
            translation: '¿Su familia sabe dónde está?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Necesito decirles', pronunciation: 'neh-seh-SEE-toh deh-SEER-les', english: 'I need to tell them' },
              { translation: 'No puedo contactarlos', pronunciation: 'noh PWEH-doh kohn-tahk-TAHR-lohs', english: 'I can\'t contact them' }
            ]
          },
          {
            english: 'We can help you send a message to your family',
            translation: 'Podemos ayudarlo a enviar un mensaje a su familia',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Sí, por favor', pronunciation: 'see pohr fah-BOHR', english: 'Yes, please' },
              { translation: 'Cómo', pronunciation: 'KOH-moh', english: 'How' },
              { translation: 'Es seguro', pronunciation: 'ehs seh-GOO-roh', english: 'Is it safe' }
            ]
          },
          {
            english: 'Is there anyone we should not contact?',
            translation: '¿Hay alguien a quien no debemos contactar?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Mi padre', pronunciation: 'mee PAH-dreh', english: 'My father' },
              { translation: 'Es complicado', pronunciation: 'ehs kohm-plee-KAH-doh', english: 'It\'s complicated' }
            ]
          }
        ]
      }
    ],
    tagalog: [],
    vietnamese: [],
    mandarin: [],
    cantonese: []
  },
  'restorative-justice': {
    spanish: [
      {
        groupLabel: 'Opening the Conversation',
        phrases: [
          {
            english: 'Thank you for being here today',
            translation: 'Gracias por estar aquí hoy',
            responses: [
              { translation: 'De nada', pronunciation: 'deh NAH-dah', english: 'You\'re welcome' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'It\'s okay' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' }
            ]
          },
          {
            english: 'Can you tell me what happened in your own words?',
            translation: '¿Puede contarme qué pasó con sus propias palabras?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Es difícil hablar de eso', pronunciation: 'ehs dee-FEE-seel ah-BLAHR deh EH-soh', english: 'It\'s hard to talk about it' },
              { translation: 'No sé por dónde empezar', pronunciation: 'noh seh pohr DOHN-deh em-peh-SAHR', english: 'I don\'t know where to start' },
              { translation: 'Puedo intentar', pronunciation: 'PWEH-doh een-ten-TAHR', english: 'I can try' }
            ]
          },
          {
            english: 'This is a safe space to share your feelings',
            translation: 'Este es un espacio seguro para compartir sus sentimientos',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Me siento nervioso', pronunciation: 'meh see-EHN-toh nehr-bee-OH-soh', english: 'I feel nervous' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' }
            ]
          },
          {
            english: 'Everyone here will be respectful and listen',
            translation: 'Todos aquí serán respetuosos y escucharán',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Eso me ayuda', pronunciation: 'EH-soh meh ah-YOO-dah', english: 'That helps me' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Aprecio eso', pronunciation: 'ah-preh-see-OH EH-soh', english: 'I appreciate that' }
            ]
          },
          {
            english: 'You can take your time',
            translation: 'Puede tomarse su tiempo',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Necesito un momento', pronunciation: 'neh-seh-SEE-toh oon moh-MEN-toh', english: 'I need a moment' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Voy a empezar', pronunciation: 'boy ah em-peh-SAHR', english: 'I\'m going to start' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Understanding Impact',
        phrases: [
          {
            english: 'How did this situation affect you?',
            translation: '¿Cómo le afectó esta situación?',
            responses: [
              { translation: 'Me sentí mal', pronunciation: 'meh sen-TEE mahl', english: 'I felt bad' },
              { translation: 'Fue difícil', pronunciation: 'fweh dee-FEE-seel', english: 'It was difficult' },
              { translation: 'Me dolió mucho', pronunciation: 'meh doh-lee-OH MOO-choh', english: 'It hurt me a lot' },
              { translation: 'Todavía me afecta', pronunciation: 'toh-dah-BEE-ah meh ah-FEK-tah', english: 'It still affects me' }
            ]
          },
          {
            english: 'What was the hardest part for you?',
            translation: '¿Cuál fue la parte más difícil para usted?',
            responses: [
              { translation: 'Todo', pronunciation: 'TOH-doh', english: 'Everything' },
              { translation: 'Perder la confianza', pronunciation: 'pehr-DEHR lah kohn-fee-AHN-sah', english: 'Losing trust' },
              { translation: 'Sentirme solo', pronunciation: 'sen-TEER-meh SOH-loh', english: 'Feeling alone' },
              { translation: 'No poder concentrarme', pronunciation: 'noh poh-DEHR kohn-sen-TRAHR-meh', english: 'Not being able to concentrate' }
            ]
          },
          {
            english: 'Do you understand how your actions affected others?',
            translation: '¿Entiende cómo sus acciones afectaron a otros?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Ahora lo entiendo', pronunciation: 'ah-OH-rah loh en-tee-EHN-doh', english: 'I understand now' },
              { translation: 'No me di cuenta', pronunciation: 'noh meh dee KWEN-tah', english: 'I didn\'t realize' },
              { translation: 'Lo siento mucho', pronunciation: 'loh see-EHN-toh MOO-choh', english: 'I\'m very sorry' }
            ]
          },
          {
            english: 'Who else was impacted by what happened?',
            translation: '¿Quién más fue impactado por lo que pasó?',
            responses: [
              { translation: 'Mi familia', pronunciation: 'mee fah-MEE-lee-ah', english: 'My family' },
              { translation: 'Mis amigos', pronunciation: 'mees ah-MEE-gohs', english: 'My friends' },
              { translation: 'Toda la clase', pronunciation: 'TOH-dah lah KLAH-seh', english: 'The whole class' },
              { translation: 'No lo había pensado', pronunciation: 'noh loh ah-BEE-ah pen-SAH-doh', english: 'I hadn\'t thought about it' }
            ]
          },
          {
            english: 'What do you need to feel better about this?',
            translation: '¿Qué necesita para sentirse mejor sobre esto?',
            responses: [
              { translation: 'Una disculpa', pronunciation: 'OO-nah dees-KOOL-pah', english: 'An apology' },
              { translation: 'Que esto no vuelva a pasar', pronunciation: 'keh EH-stoh noh BWEL-bah ah pah-SAHR', english: 'That this doesn\'t happen again' },
              { translation: 'Entender por qué pasó', pronunciation: 'en-ten-DEHR pohr keh pah-SOH', english: 'To understand why it happened' },
              { translation: 'No estoy seguro', pronunciation: 'noh es-TOY seh-GOO-roh', english: 'I\'m not sure' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Finding Resolution',
        phrases: [
          {
            english: 'What would help repair the harm that was done?',
            translation: '¿Qué ayudaría a reparar el daño que se hizo?',
            responses: [
              { translation: 'Una disculpa sincera', pronunciation: 'OO-nah dees-KOOL-pah seen-SEH-rah', english: 'A sincere apology' },
              { translation: 'Cambiar su comportamiento', pronunciation: 'kahm-bee-AHR soo kohm-pohr-tah-mee-EHN-toh', english: 'Change their behavior' },
              { translation: 'Ayudar a otros', pronunciation: 'ah-yoo-DAHR ah OH-trohs', english: 'Help others' },
              { translation: 'Necesito tiempo para pensar', pronunciation: 'neh-seh-SEE-toh tee-EHM-poh PAH-rah pen-SAHR', english: 'I need time to think' }
            ]
          },
          {
            english: 'Are you willing to make things right?',
            translation: '¿Está dispuesto a arreglar las cosas?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Haré lo que sea necesario', pronunciation: 'ah-REH loh keh SEH-ah neh-seh-SAH-ree-oh', english: 'I\'ll do whatever is necessary' },
              { translation: 'Dígame qué hacer', pronunciation: 'DEE-gah-meh keh ah-SEHR', english: 'Tell me what to do' },
              { translation: 'Quiero ayudar', pronunciation: 'kee-EH-roh ah-yoo-DAHR', english: 'I want to help' }
            ]
          },
          {
            english: 'What can we agree on to move forward?',
            translation: '¿En qué podemos estar de acuerdo para seguir adelante?',
            responses: [
              { translation: 'Respetarnos mutuamente', pronunciation: 'res-peh-TAHR-nohs moo-too-ah-MEN-teh', english: 'Respect each other' },
              { translation: 'Comunicarnos mejor', pronunciation: 'koh-moo-nee-KAHR-nohs meh-HOHR', english: 'Communicate better' },
              { translation: 'Pedir ayuda cuando la necesitemos', pronunciation: 'peh-DEER ah-YOO-dah KWAHN-doh lah neh-seh-see-TEH-mohs', english: 'Ask for help when we need it' },
              { translation: 'Trabajar en esto juntos', pronunciation: 'trah-bah-HAHR en EH-stoh HOON-tohs', english: 'Work on this together' }
            ]
          },
          {
            english: 'Do you feel this agreement is fair?',
            translation: '¿Siente que este acuerdo es justo?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Es justo', pronunciation: 'ehs HOOS-toh', english: 'It\'s fair' },
              { translation: 'Necesito pensar', pronunciation: 'neh-seh-SEE-toh pen-SAHR', english: 'I need to think' },
              { translation: 'Tengo algunas preguntas', pronunciation: 'TEHN-goh ahl-GOO-nahs preh-GOON-tahs', english: 'I have some questions' }
            ]
          },
          {
            english: 'Is there anything else you need to say?',
            translation: '¿Hay algo más que necesite decir?',
            responses: [
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Gracias por escuchar', pronunciation: 'GRAH-see-ahs pohr es-koo-CHAHR', english: 'Thank you for listening' },
              { translation: 'Eso es todo', pronunciation: 'EH-soh ehs TOH-doh', english: 'That\'s all' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Moving Forward',
        phrases: [
          {
            english: 'How will you handle similar situations in the future?',
            translation: '¿Cómo manejará situaciones similares en el futuro?',
            responses: [
              { translation: 'Pensaré antes de actuar', pronunciation: 'pen-sah-REH AHN-tes deh ahk-too-AHR', english: 'I\'ll think before acting' },
              { translation: 'Pediré ayuda', pronunciation: 'peh-dee-REH ah-YOO-dah', english: 'I\'ll ask for help' },
              { translation: 'Hablaré sobre mis sentimientos', pronunciation: 'ah-blah-REH SOH-breh mees sen-tee-mee-EHN-tohs', english: 'I\'ll talk about my feelings' },
              { translation: 'Seré más cuidadoso', pronunciation: 'seh-REH mahs kwee-dah-DOH-soh', english: 'I\'ll be more careful' }
            ]
          },
          {
            english: 'We will check in with you next week',
            translation: 'Revisaremos con usted la próxima semana',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Estaré listo', pronunciation: 'es-tah-REH LEES-toh', english: 'I\'ll be ready' },
              { translation: 'Qué día', pronunciation: 'keh DEE-ah', english: 'What day' }
            ]
          },
          {
            english: 'Do you feel ready to return to class?',
            translation: '¿Se siente listo para volver a clase?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Creo que sí', pronunciation: 'KREH-oh keh see', english: 'I think so' },
              { translation: 'Estoy nervioso', pronunciation: 'es-TOY nehr-bee-OH-soh', english: 'I\'m nervous' },
              { translation: 'Necesito más tiempo', pronunciation: 'neh-seh-SEE-toh mahs tee-EHM-poh', english: 'I need more time' }
            ]
          },
          {
            english: 'You can always come talk to us if you need support',
            translation: 'Siempre puede venir a hablar con nosotros si necesita apoyo',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Lo recordaré', pronunciation: 'loh reh-kohr-dah-REH', english: 'I\'ll remember that' },
              { translation: 'Eso me ayuda', pronunciation: 'EH-soh meh ah-YOO-dah', english: 'That helps me' },
              { translation: 'Es bueno saberlo', pronunciation: 'ehs BWEH-noh sah-BEHR-loh', english: 'It\'s good to know' }
            ]
          },
          {
            english: 'I believe you can learn from this experience',
            translation: 'Creo que puede aprender de esta experiencia',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Yo también lo creo', pronunciation: 'yoh tahm-bee-EHN loh KREH-oh', english: 'I believe it too' },
              { translation: 'Lo intentaré', pronunciation: 'loh een-ten-tah-REH', english: 'I\'ll try' },
              { translation: 'Eso significa mucho', pronunciation: 'EH-soh seeg-nee-FEE-kah MOO-choh', english: 'That means a lot' }
            ]
          }
        ]
      }
    ],
    tagalog: [],
    vietnamese: [],
    mandarin: [],
    cantonese: []
  },
  'parent-communication': {
    spanish: [
      {
        groupLabel: 'Academic Progress',
        phrases: [
          {
            english: 'Your child is doing well in class',
            translation: 'Su hijo está haciendo bien en clase',
            responses: [
              { translation: 'Qué bueno', pronunciation: 'keh BWEH-noh', english: 'That\'s good' },
              { translation: 'Me alegro', pronunciation: 'meh ah-LEH-groh', english: 'I\'m glad' },
              { translation: 'Gracias por decirme', pronunciation: 'GRAH-see-ahs pohr deh-SEER-meh', english: 'Thank you for telling me' },
              { translation: 'Excelente', pronunciation: 'ek-seh-LEN-teh', english: 'Excellent' }
            ]
          },
          {
            english: 'He is struggling with math',
            translation: 'Él está teniendo dificultades con matemáticas',
            responses: [
              { translation: 'Qué puedo hacer', pronunciation: 'keh PWEH-doh ah-SEHR', english: 'What can I do' },
              { translation: 'Necesita ayuda extra', pronunciation: 'neh-seh-SEE-tah ah-YOO-dah EK-strah', english: 'Does he need extra help' },
              { translation: 'Cómo puedo ayudar en casa', pronunciation: 'KOH-moh PWEH-doh ah-yoo-DAHR en KAH-sah', english: 'How can I help at home' },
              { translation: 'Es preocupante', pronunciation: 'ehs preh-oh-koo-PAHN-teh', english: 'That\'s concerning' }
            ]
          },
          {
            english: 'She is excelling in reading',
            translation: 'Ella está sobresaliendo en lectura',
            responses: [
              { translation: 'Qué bueno', pronunciation: 'keh BWEH-noh', english: 'That\'s good' },
              { translation: 'Le gusta leer', pronunciation: 'leh GOOS-tah leh-EHR', english: 'She likes to read' },
              { translation: 'Estoy orgulloso', pronunciation: 'es-TOY ohr-goo-YOH-soh', english: 'I\'m proud' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' }
            ]
          },
          {
            english: 'His grades have improved this semester',
            translation: 'Sus calificaciones han mejorado este semestre',
            responses: [
              { translation: 'Qué alegría', pronunciation: 'keh ah-leh-GREE-ah', english: 'What joy' },
              { translation: 'Ha trabajado mucho', pronunciation: 'ah trah-bah-HAH-doh MOO-choh', english: 'He has worked hard' },
              { translation: 'Me alegro mucho', pronunciation: 'meh ah-LEH-groh MOO-choh', english: 'I\'m very glad' },
              { translation: 'Gracias por su apoyo', pronunciation: 'GRAH-see-ahs pohr soo ah-POH-yoh', english: 'Thank you for your support' }
            ]
          },
          {
            english: 'She needs to complete her homework regularly',
            translation: 'Ella necesita completar su tarea regularmente',
            responses: [
              { translation: 'Lo vigilaré', pronunciation: 'loh bee-hee-lah-REH', english: 'I\'ll monitor it' },
              { translation: 'No lo sabía', pronunciation: 'noh loh sah-BEE-ah', english: 'I didn\'t know' },
              { translation: 'Hablaré con ella', pronunciation: 'ah-blah-REH kohn EH-yah', english: 'I\'ll talk to her' },
              { translation: 'Qué días tiene tarea', pronunciation: 'keh DEE-ahs tee-EH-neh tah-REH-ah', english: 'What days does she have homework' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Behavior and Discipline',
        phrases: [
          {
            english: 'Your child was disruptive in class today',
            translation: 'Su hijo fue disruptivo en clase hoy',
            responses: [
              { translation: 'Lo siento', pronunciation: 'loh see-EHN-toh', english: 'I\'m sorry' },
              { translation: 'Qué pasó', pronunciation: 'keh pah-SOH', english: 'What happened' },
              { translation: 'Hablaré con él', pronunciation: 'ah-blah-REH kohn ehl', english: 'I\'ll talk to him' },
              { translation: 'Es la primera vez', pronunciation: 'ehs lah pree-MEH-rah behs', english: 'Is it the first time' }
            ]
          },
          {
            english: 'He has been very respectful and helpful',
            translation: 'Él ha sido muy respetuoso y servicial',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Qué bueno', pronunciation: 'keh BWEH-noh', english: 'That\'s good' },
              { translation: 'Así lo educamos', pronunciation: 'ah-SEE loh eh-doo-KAH-mohs', english: 'That\'s how we raised him' },
              { translation: 'Me alegro', pronunciation: 'meh ah-LEH-groh', english: 'I\'m glad' }
            ]
          },
          {
            english: 'She got into a disagreement with another student',
            translation: 'Ella tuvo un desacuerdo con otro estudiante',
            responses: [
              { translation: 'Qué pasó exactamente', pronunciation: 'keh pah-SOH ek-sahk-tah-MEN-teh', english: 'What exactly happened' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Is she okay' },
              { translation: 'Lo resolvieron', pronunciation: 'loh reh-sohl-bee-EH-rohn', english: 'Did they resolve it' },
              { translation: 'Hablaré con ella', pronunciation: 'ah-blah-REH kohn EH-yah', english: 'I\'ll talk to her' }
            ]
          },
          {
            english: 'We need to discuss his behavior pattern',
            translation: 'Necesitamos discutir su patrón de comportamiento',
            responses: [
              { translation: 'Cuándo podemos reunirnos', pronunciation: 'KWAHN-doh poh-DEH-mohs reh-oo-NEER-nohs', english: 'When can we meet' },
              { translation: 'Qué está pasando', pronunciation: 'keh es-TAH pah-SAHN-doh', english: 'What\'s happening' },
              { translation: 'Es serio', pronunciation: 'ehs SEH-ree-oh', english: 'Is it serious' },
              { translation: 'Estoy preocupado', pronunciation: 'es-TOY preh-oh-koo-PAH-doh', english: 'I\'m worried' }
            ]
          },
          {
            english: 'There will be consequences for this action',
            translation: 'Habrá consecuencias por esta acción',
            responses: [
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: 'Qué consecuencias', pronunciation: 'keh kohn-seh-KWEN-see-ahs', english: 'What consequences' },
              { translation: 'Es justo', pronunciation: 'ehs HOOS-toh', english: 'It\'s fair' },
              { translation: 'También lo disciplinaré en casa', pronunciation: 'tahm-bee-EHN loh dees-see-plee-nah-REH en KAH-sah', english: 'I\'ll also discipline him at home' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Support Services',
        phrases: [
          {
            english: 'We can provide tutoring after school',
            translation: 'Podemos proporcionar tutoría después de clases',
            responses: [
              { translation: 'Es gratis', pronunciation: 'ehs GRAH-tees', english: 'Is it free' },
              { translation: 'Qué días', pronunciation: 'keh DEE-ahs', english: 'What days' },
              { translation: 'Eso ayudaría mucho', pronunciation: 'EH-soh ah-yoo-dah-REE-ah MOO-choh', english: 'That would help a lot' },
              { translation: 'Cómo me inscribo', pronunciation: 'KOH-moh meh een-SKREE-boh', english: 'How do I sign up' }
            ]
          },
          {
            english: 'She may benefit from counseling services',
            translation: 'Ella podría beneficiarse de servicios de consejería',
            responses: [
              { translation: 'Por qué', pronunciation: 'pohr keh', english: 'Why' },
              { translation: 'Está disponible en la escuela', pronunciation: 'es-TAH dees-poh-NEE-bleh en lah es-KWEH-lah', english: 'Is it available at school' },
              { translation: 'Qué ha notado', pronunciation: 'keh ah noh-TAH-doh', english: 'What have you noticed' },
              { translation: 'Sí, por favor', pronunciation: 'see pohr fah-BOHR', english: 'Yes, please' }
            ]
          },
          {
            english: 'We have resources for English language learners',
            translation: 'Tenemos recursos para estudiantes que aprenden inglés',
            responses: [
              { translation: 'Qué tipo de recursos', pronunciation: 'keh TEE-poh deh reh-KOOR-sohs', english: 'What kind of resources' },
              { translation: 'Eso ayudaría', pronunciation: 'EH-soh ah-yoo-dah-REE-ah', english: 'That would help' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Cómo accedo a ellos', pronunciation: 'KOH-moh ahk-SEH-doh ah EH-yohs', english: 'How do I access them' }
            ]
          },
          {
            english: 'Your child qualifies for free lunch',
            translation: 'Su hijo califica para almuerzo gratis',
            responses: [
              { translation: 'Qué necesito hacer', pronunciation: 'keh neh-seh-SEE-toh ah-SEHR', english: 'What do I need to do' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Dónde lleno la solicitud', pronunciation: 'DOHN-deh YEH-noh lah soh-lee-see-TOOD', english: 'Where do I fill out the application' },
              { translation: 'Es automático', pronunciation: 'ehs ow-toh-MAH-tee-koh', english: 'Is it automatic' }
            ]
          },
          {
            english: 'We recommend testing for special education services',
            translation: 'Recomendamos pruebas para servicios de educación especial',
            responses: [
              { translation: 'Por qué lo recomienda', pronunciation: 'pohr keh loh reh-koh-mee-EHN-dah', english: 'Why do you recommend it' },
              { translation: 'Qué implica', pronunciation: 'keh eem-PLEE-kah', english: 'What does it involve' },
              { translation: 'Cuánto tiempo toma', pronunciation: 'KWAHN-toh tee-EHM-poh TOH-mah', english: 'How long does it take' },
              { translation: 'Doy mi permiso', pronunciation: 'doy mee pehr-MEE-soh', english: 'I give my permission' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Meeting Scheduling',
        phrases: [
          {
            english: 'Can we schedule a parent-teacher conference?',
            translation: '¿Podemos programar una conferencia de padres y maestros?',
            responses: [
              { translation: 'Sí, cuándo', pronunciation: 'see KWAHN-doh', english: 'Yes, when' },
              { translation: 'Qué días está disponible', pronunciation: 'keh DEE-ahs es-TAH dees-poh-NEE-bleh', english: 'What days are you available' },
              { translation: 'Puede ser por teléfono', pronunciation: 'PWEH-deh sehr pohr teh-LEH-foh-noh', english: 'Can it be by phone' },
              { translation: 'De qué quiere hablar', pronunciation: 'deh keh kee-EH-reh ah-BLAHR', english: 'What do you want to talk about' }
            ]
          },
          {
            english: 'I have time available on Tuesday at 3pm',
            translation: 'Tengo tiempo disponible el martes a las 3pm',
            responses: [
              { translation: 'Perfecto', pronunciation: 'pehr-FEK-toh', english: 'Perfect' },
              { translation: 'Esa hora funciona', pronunciation: 'EH-sah OH-rah foon-see-OH-nah', english: 'That time works' },
              { translation: 'No puedo a esa hora', pronunciation: 'noh PWEH-doh ah EH-sah OH-rah', english: 'I can\'t at that time' },
              { translation: 'Tiene otra hora', pronunciation: 'tee-EH-neh OH-trah OH-rah', english: 'Do you have another time' }
            ]
          },
          {
            english: 'Do you need a translator for our meeting?',
            translation: '¿Necesita un traductor para nuestra reunión?',
            responses: [
              { translation: 'Sí, por favor', pronunciation: 'see pohr fah-BOHR', english: 'Yes, please' },
              { translation: 'No, hablo inglés', pronunciation: 'noh AH-bloh een-GLEHS', english: 'No, I speak English' },
              { translation: 'Eso ayudaría', pronunciation: 'EH-soh ah-yoo-dah-REE-ah', english: 'That would help' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' }
            ]
          },
          {
            english: 'Parent-teacher conferences are next week',
            translation: 'Las conferencias de padres y maestros son la próxima semana',
            responses: [
              { translation: 'Qué día y hora', pronunciation: 'keh DEE-ah ee OH-rah', english: 'What day and time' },
              { translation: 'Dónde son', pronunciation: 'DOHN-deh sohn', english: 'Where are they' },
              { translation: 'Necesito programar una cita', pronunciation: 'neh-seh-SEE-toh proh-grah-MAHR OO-nah SEE-tah', english: 'I need to schedule an appointment' },
              { translation: 'Gracias por avisar', pronunciation: 'GRAH-see-ahs pohr ah-bee-SAHR', english: 'Thanks for letting me know' }
            ]
          },
          {
            english: 'Please call the office to schedule an appointment',
            translation: 'Por favor llame a la oficina para programar una cita',
            responses: [
              { translation: 'Cuál es el número', pronunciation: 'kwahl ehs el NOO-meh-roh', english: 'What\'s the number' },
              { translation: 'A qué hora puedo llamar', pronunciation: 'ah keh OH-rah PWEH-doh yah-MAHR', english: 'What time can I call' },
              { translation: 'Puedo ir en persona', pronunciation: 'PWEH-doh eer en pehr-SOH-nah', english: 'Can I go in person' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' }
            ]
          }
        ]
      }
    ],
    tagalog: [],
    vietnamese: [],
    mandarin: [],
    cantonese: []
  },
  'special-needs': {
    spanish: [
      {
        groupLabel: 'Assessment and Planning',
        phrases: [
          {
            english: 'We need to develop an Individualized Education Program',
            translation: 'Necesitamos desarrollar un Programa de Educación Individualizado',
            responses: [
              { translation: 'Qué es eso', pronunciation: 'keh ehs EH-soh', english: 'What is that' },
              { translation: 'Qué necesita mi hijo', pronunciation: 'keh neh-seh-SEE-tah mee EE-hoh', english: 'What does my child need' },
              { translation: 'Cuándo empezamos', pronunciation: 'KWAHN-doh em-peh-SAH-mohs', english: 'When do we start' },
              { translation: 'Estoy de acuerdo', pronunciation: 'es-TOY deh ah-KWEHR-doh', english: 'I agree' }
            ]
          },
          {
            english: 'Your child qualifies for special education services',
            translation: 'Su hijo califica para servicios de educación especial',
            responses: [
              { translation: 'Qué servicios', pronunciation: 'keh sehr-BEE-see-ohs', english: 'What services' },
              { translation: 'Cuánto tiempo durará', pronunciation: 'KWAHN-toh tee-EHM-poh doo-rah-RAH', english: 'How long will it last' },
              { translation: 'Es gratis', pronunciation: 'ehs GRAH-tees', english: 'Is it free' },
              { translation: 'Qué tengo que hacer', pronunciation: 'keh TEHN-goh keh ah-SEHR', english: 'What do I have to do' }
            ]
          },
          {
            english: 'We will conduct an evaluation',
            translation: 'Realizaremos una evaluación',
            responses: [
              { translation: 'Qué tipo de evaluación', pronunciation: 'keh TEE-poh deh eh-bah-loo-ah-see-OHN', english: 'What type of evaluation' },
              { translation: 'Cuánto tiempo toma', pronunciation: 'KWAHN-toh tee-EHM-poh TOH-mah', english: 'How long does it take' },
              { translation: 'Dónde será', pronunciation: 'DOHN-deh seh-RAH', english: 'Where will it be' },
              { translation: 'Doy mi permiso', pronunciation: 'doy mee pehr-MEE-soh', english: 'I give my permission' }
            ]
          },
          {
            english: 'Does your child have any medical conditions we should know about?',
            translation: '¿Tiene su hijo alguna condición médica que debamos saber?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Tiene asma', pronunciation: 'tee-EH-neh AHS-mah', english: 'He has asthma' },
              { translation: 'Toma medicamentos', pronunciation: 'TOH-mah meh-dee-kah-MEN-tohs', english: 'He takes medications' }
            ]
          },
          {
            english: 'We need to schedule an IEP meeting',
            translation: 'Necesitamos programar una reunión de IEP',
            responses: [
              { translation: 'Cuándo', pronunciation: 'KWAHN-doh', english: 'When' },
              { translation: 'Quién estará allí', pronunciation: 'kee-EHN es-tah-RAH ah-YEE', english: 'Who will be there' },
              { translation: 'Puedo traer a alguien', pronunciation: 'PWEH-doh trah-EHR ah AHL-gee-en', english: 'Can I bring someone' },
              { translation: 'Qué debo preparar', pronunciation: 'keh DEH-boh preh-pah-RAHR', english: 'What should I prepare' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Daily Support',
        phrases: [
          {
            english: 'He will work with a special education teacher',
            translation: 'Él trabajará con un maestro de educación especial',
            responses: [
              { translation: 'Todos los días', pronunciation: 'TOH-dohs lohs DEE-ahs', english: 'Every day' },
              { translation: 'Cuánto tiempo', pronunciation: 'KWAHN-toh tee-EHM-poh', english: 'How long' },
              { translation: 'Puedo conocerlo', pronunciation: 'PWEH-doh koh-noh-SEHR-loh', english: 'Can I meet him' },
              { translation: 'Qué bueno', pronunciation: 'keh BWEH-noh', english: 'That\'s good' }
            ]
          },
          {
            english: 'She has access to assistive technology',
            translation: 'Ella tiene acceso a tecnología de asistencia',
            responses: [
              { translation: 'Qué tipo de tecnología', pronunciation: 'keh TEE-poh deh tek-noh-loh-HEE-ah', english: 'What type of technology' },
              { translation: 'Cómo funciona', pronunciation: 'KOH-moh foon-see-OH-nah', english: 'How does it work' },
              { translation: 'Puede usarla en casa', pronunciation: 'PWEH-deh oo-SAHR-lah en KAH-sah', english: 'Can she use it at home' },
              { translation: 'Eso ayudará', pronunciation: 'EH-soh ah-yoo-dah-RAH', english: 'That will help' }
            ]
          },
          {
            english: 'Your child needs extra time on tests',
            translation: 'Su hijo necesita tiempo extra en los exámenes',
            responses: [
              { translation: 'Cuánto tiempo extra', pronunciation: 'KWAHN-toh tee-EHM-poh EK-strah', english: 'How much extra time' },
              { translation: 'Por qué', pronunciation: 'pohr keh', english: 'Why' },
              { translation: 'Está en el IEP', pronunciation: 'es-TAH en el IEP', english: 'Is it in the IEP' },
              { translation: 'Gracias por la acomodación', pronunciation: 'GRAH-see-ahs pohr lah ah-koh-moh-dah-see-OHN', english: 'Thank you for the accommodation' }
            ]
          },
          {
            english: 'She will receive speech therapy twice a week',
            translation: 'Ella recibirá terapia del habla dos veces por semana',
            responses: [
              { translation: 'Qué días', pronunciation: 'keh DEE-ahs', english: 'What days' },
              { translation: 'A qué hora', pronunciation: 'ah keh OH-rah', english: 'At what time' },
              { translation: 'Durante la clase', pronunciation: 'doo-RAHN-teh lah KLAH-seh', english: 'During class' },
              { translation: 'Cuánto tiempo dura cada sesión', pronunciation: 'KWAHN-toh tee-EHM-poh DOO-rah KAH-dah seh-see-OHN', english: 'How long is each session' }
            ]
          },
          {
            english: 'We provide a quiet space for testing',
            translation: 'Proporcionamos un espacio tranquilo para los exámenes',
            responses: [
              { translation: 'Eso ayudará', pronunciation: 'EH-soh ah-yoo-dah-RAH', english: 'That will help' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Lo necesita', pronunciation: 'loh neh-seh-SEE-tah', english: 'He needs it' },
              { translation: 'Es buena acomodación', pronunciation: 'ehs BWEH-nah ah-koh-moh-dah-see-OHN', english: 'It\'s a good accommodation' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Emergency Procedures',
        phrases: [
          {
            english: 'Does your child have any emergency medical needs?',
            translation: '¿Tiene su hijo alguna necesidad médica de emergencia?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Tiene un EpiPen', pronunciation: 'tee-EH-neh oon EpiPen', english: 'He has an EpiPen' },
              { translation: 'Puede tener convulsiones', pronunciation: 'PWEH-deh teh-NEHR kohn-bool-see-OH-nes', english: 'He can have seizures' }
            ]
          },
          {
            english: 'We need emergency contact information',
            translation: 'Necesitamos información de contacto de emergencia',
            responses: [
              { translation: 'Aquí está', pronunciation: 'ah-KEE es-TAH', english: 'Here it is' },
              { translation: 'Puedo escribirlo', pronunciation: 'PWEH-doh es-kree-BEER-loh', english: 'Can I write it' },
              { translation: 'Mi número es', pronunciation: 'mee NOO-meh-roh ehs', english: 'My number is' },
              { translation: 'A quién debo llamar', pronunciation: 'ah kee-EHN DEH-boh yah-MAHR', english: 'Who should I call' }
            ]
          },
          {
            english: 'In case of a seizure, we will follow the care plan',
            translation: 'En caso de una convulsión, seguiremos el plan de atención',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Tienen el plan', pronunciation: 'tee-EH-nen el plahn', english: 'Do you have the plan' },
              { translation: 'Necesitan entrenamiento', pronunciation: 'neh-seh-SEE-tahn en-treh-nah-mee-EHN-toh', english: 'Do you need training' },
              { translation: 'Llamen de inmediato', pronunciation: 'YAH-men deh een-meh-dee-AH-toh', english: 'Call immediately' }
            ]
          },
          {
            english: 'Where is your child\'s medication kept?',
            translation: '¿Dónde se guarda el medicamento de su hijo?',
            responses: [
              { translation: 'En la oficina de la enfermera', pronunciation: 'en lah oh-fee-SEE-nah deh lah en-fehr-MEH-rah', english: 'In the nurse\'s office' },
              { translation: 'En su mochila', pronunciation: 'en soo moh-CHEE-lah', english: 'In his backpack' },
              { translation: 'Lo lleva con él', pronunciation: 'loh YEH-bah kohn ehl', english: 'He carries it with him' },
              { translation: 'Dónde debe guardarse', pronunciation: 'DOHN-deh DEH-beh gwahr-DAHR-seh', english: 'Where should it be kept' }
            ]
          },
          {
            english: 'We will call you immediately if there is a problem',
            translation: 'Le llamaremos de inmediato si hay un problema',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Tienen mi número', pronunciation: 'tee-EH-nen mee NOO-meh-roh', english: 'Do you have my number' },
              { translation: 'Déjenme un mensaje si no contesto', pronunciation: 'DEH-hen-meh oon men-SAH-heh see noh kohn-TES-toh', english: 'Leave me a message if I don\'t answer' },
              { translation: 'Llamen primero a mi esposa', pronunciation: 'YAH-men pree-MEH-roh ah mee es-POH-sah', english: 'Call my wife first' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Parent Rights',
        phrases: [
          {
            english: 'You have the right to request an IEP review at any time',
            translation: 'Usted tiene el derecho de solicitar una revisión del IEP en cualquier momento',
            responses: [
              { translation: 'No lo sabía', pronunciation: 'noh loh sah-BEE-ah', english: 'I didn\'t know' },
              { translation: 'Gracias por la información', pronunciation: 'GRAH-see-ahs pohr lah een-fohr-mah-see-OHN', english: 'Thank you for the information' },
              { translation: 'Quiero solicitar una revisión', pronunciation: 'kee-EH-roh soh-lee-see-TAHR OO-nah reh-bee-see-OHN', english: 'I want to request a review' },
              { translation: 'Cómo lo solicito', pronunciation: 'KOH-moh loh soh-LEE-see-toh', english: 'How do I request it' }
            ]
          },
          {
            english: 'You can bring an advocate to IEP meetings',
            translation: 'Puede traer un defensor a las reuniones de IEP',
            responses: [
              { translation: 'Eso ayudaría', pronunciation: 'EH-soh ah-yoo-dah-REE-ah', english: 'That would help' },
              { translation: 'Dónde encuentro un defensor', pronunciation: 'DOHN-deh en-KWEN-troh oon deh-fen-SOHR', english: 'Where do I find an advocate' },
              { translation: 'Es gratis', pronunciation: 'ehs GRAH-tees', english: 'Is it free' },
              { translation: 'Gracias por decirme', pronunciation: 'GRAH-see-ahs pohr deh-SEER-meh', english: 'Thank you for telling me' }
            ]
          },
          {
            english: 'You must approve any changes to the IEP',
            translation: 'Usted debe aprobar cualquier cambio al IEP',
            responses: [
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: 'Qué pasa si no estoy de acuerdo', pronunciation: 'keh PAH-sah see noh es-TOY deh ah-KWEHR-doh', english: 'What happens if I disagree' },
              { translation: 'Cuáles son mis opciones', pronunciation: 'KWAH-les sohn mees ohp-see-OH-nes', english: 'What are my options' },
              { translation: 'Quiero tiempo para pensar', pronunciation: 'kee-EH-roh tee-EHM-poh PAH-rah pen-SAHR', english: 'I want time to think' }
            ]
          },
          {
            english: 'Your child has the right to a free appropriate public education',
            translation: 'Su hijo tiene derecho a una educación pública apropiada y gratuita',
            responses: [
              { translation: 'Qué significa apropiada', pronunciation: 'keh seeg-nee-FEE-kah ah-proh-pee-AH-dah', english: 'What does appropriate mean' },
              { translation: 'Me alegro', pronunciation: 'meh ah-LEH-groh', english: 'I\'m glad' },
              { translation: 'Eso es importante', pronunciation: 'EH-soh ehs eem-pohr-TAHN-teh', english: 'That\'s important' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' }
            ]
          },
          {
            english: 'You can request mediation or due process if you disagree',
            translation: 'Puede solicitar mediación o debido proceso si no está de acuerdo',
            responses: [
              { translation: 'Qué es mediación', pronunciation: 'keh ehs meh-dee-ah-see-OHN', english: 'What is mediation' },
              { translation: 'Espero no necesitarlo', pronunciation: 'es-PEH-roh noh neh-seh-see-TAHR-loh', english: 'I hope I don\'t need it' },
              { translation: 'Es bueno saberlo', pronunciation: 'ehs BWEH-noh sah-BEHR-loh', english: 'It\'s good to know' },
              { translation: 'Hay alguien que pueda ayudarme', pronunciation: 'ay AHL-gee-en keh PWEH-dah ah-yoo-DAHR-meh', english: 'Is there someone who can help me' }
            ]
          }
        ]
      }
    ],
    tagalog: [],
    vietnamese: [],
    mandarin: [],
    cantonese: []
  },
  'safety-osha': {
    spanish: [
      {
        groupLabel: 'Daily Safety Briefing',
        phrases: [
          {
            english: 'Everyone must wear a hard hat on site',
            translation: 'Todos deben usar casco en el sitio',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Dónde está el mío', pronunciation: 'DOHN-deh es-TAH el MEE-oh', english: 'Where is mine' },
              { translation: 'Lo tengo', pronunciation: 'loh TEHN-goh', english: 'I have it' }
            ]
          },
          {
            english: 'Safety glasses are required in this area',
            translation: 'Se requieren gafas de seguridad en esta área',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Ya las tengo puestas', pronunciation: 'yah lahs TEHN-goh PWES-tahs', english: 'I already have them on' },
              { translation: 'Necesito unas', pronunciation: 'neh-seh-SEE-toh OO-nahs', english: 'I need some' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' }
            ]
          },
          {
            english: 'Check your equipment before starting work',
            translation: 'Revise su equipo antes de empezar a trabajar',
            responses: [
              { translation: 'Sí, señor', pronunciation: 'see seh-NYOHR', english: 'Yes, sir' },
              { translation: 'Lo haré', pronunciation: 'loh ah-REH', english: 'I will' },
              { translation: 'Ya lo revisé', pronunciation: 'yah loh reh-bee-SEH', english: 'I already checked it' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' }
            ]
          },
          {
            english: 'Report any unsafe conditions immediately',
            translation: 'Reporte cualquier condición insegura inmediatamente',
            responses: [
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'A quién le reporto', pronunciation: 'ah kee-EHN leh reh-POHR-toh', english: 'Who do I report to' },
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Lo haré', pronunciation: 'loh ah-REH', english: 'I will' }
            ]
          },
          {
            english: 'This is today\'s safety meeting topic',
            translation: 'Este es el tema de seguridad de hoy',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Entiendo', pronunciation: 'en-tee-EHN-doh', english: 'I understand' },
              { translation: 'Puede repetir', pronunciation: 'PWEH-deh reh-peh-TEER', english: 'Can you repeat' },
              { translation: 'Tengo preguntas', pronunciation: 'TEHN-goh preh-GOON-tahs', english: 'I have questions' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Hazard Identification',
        phrases: [
          {
            english: 'This area has a trip hazard',
            translation: 'Esta área tiene un peligro de tropiezos',
            responses: [
              { translation: 'Dónde', pronunciation: 'DOHN-deh', english: 'Where' },
              { translation: 'Gracias por avisar', pronunciation: 'GRAH-see-ahs pohr ah-bee-SAHR', english: 'Thanks for warning' },
              { translation: 'Voy a tener cuidado', pronunciation: 'boy ah teh-NEHR kwee-DAH-doh', english: 'I\'ll be careful' },
              { translation: 'Lo veo', pronunciation: 'loh BEH-oh', english: 'I see it' }
            ]
          },
          {
            english: 'There are electrical hazards overhead',
            translation: 'Hay peligros eléctricos arriba',
            responses: [
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Tendré cuidado', pronunciation: 'ten-DREH kwee-DAH-doh', english: 'I\'ll be careful' },
              { translation: 'Dónde exactamente', pronunciation: 'DOHN-deh ek-sahk-tah-MEN-teh', english: 'Where exactly' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' }
            ]
          },
          {
            english: 'Watch out for falling objects',
            translation: 'Cuidado con objetos que caen',
            responses: [
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Tengo casco', pronunciation: 'TEHN-goh KAHS-koh', english: 'I have a hard hat' },
              { translation: 'Voy a estar alerta', pronunciation: 'boy ah es-TAHR ah-LEHR-tah', english: 'I\'ll be alert' }
            ]
          },
          {
            english: 'This surface is slippery',
            translation: 'Esta superficie está resbalosa',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Iré despacio', pronunciation: 'ee-REH des-PAH-see-oh', english: 'I\'ll go slowly' },
              { translation: 'Tendré cuidado', pronunciation: 'ten-DREH kwee-DAH-doh', english: 'I\'ll be careful' },
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' }
            ]
          },
          {
            english: 'Do not enter this confined space without proper equipment',
            translation: 'No entre a este espacio confinado sin el equipo apropiado',
            responses: [
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Qué equipo necesito', pronunciation: 'keh eh-KEE-poh neh-seh-SEE-toh', english: 'What equipment do I need' },
              { translation: 'No entraré', pronunciation: 'noh en-trah-REH', english: 'I won\'t enter' },
              { translation: 'Gracias por avisar', pronunciation: 'GRAH-see-ahs pohr ah-bee-SAHR', english: 'Thanks for warning' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Equipment Safety',
        phrases: [
          {
            english: 'Are you certified to operate this equipment?',
            translation: '¿Está certificado para operar este equipo?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Necesito entrenamiento', pronunciation: 'neh-seh-SEE-toh en-treh-nah-mee-EHN-toh', english: 'I need training' },
              { translation: 'Tengo la certificación', pronunciation: 'TEHN-goh lah sehr-tee-fee-kah-see-OHN', english: 'I have the certification' }
            ]
          },
          {
            english: 'Lock out and tag out before maintenance',
            translation: 'Bloquee y etiquete antes del mantenimiento',
            responses: [
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Sí, señor', pronunciation: 'see seh-NYOHR', english: 'Yes, sir' },
              { translation: 'Dónde están las etiquetas', pronunciation: 'DOHN-deh es-TAHN lahs eh-tee-KEH-tahs', english: 'Where are the tags' },
              { translation: 'Lo haré', pronunciation: 'loh ah-REH', english: 'I will' }
            ]
          },
          {
            english: 'This machine guard must stay in place',
            translation: 'Esta protección de máquina debe permanecer en su lugar',
            responses: [
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'No la moveré', pronunciation: 'noh lah moh-beh-REH', english: 'I won\'t move it' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' }
            ]
          },
          {
            english: 'Keep your hands clear of moving parts',
            translation: 'Mantenga sus manos lejos de las partes móviles',
            responses: [
              { translation: 'Sí, señor', pronunciation: 'see seh-NYOHR', english: 'Yes, sir' },
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Tendré cuidado', pronunciation: 'ten-DREH kwee-DAH-doh', english: 'I\'ll be careful' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' }
            ]
          },
          {
            english: 'Turn off the power before working on this',
            translation: 'Apague la energía antes de trabajar en esto',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Lo haré', pronunciation: 'loh ah-REH', english: 'I will' },
              { translation: 'Dónde está el interruptor', pronunciation: 'DOHN-deh es-TAH el een-teh-roop-TOHR', english: 'Where is the switch' },
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Compliance Requirements',
        phrases: [
          {
            english: 'You must complete this safety training',
            translation: 'Debe completar este entrenamiento de seguridad',
            responses: [
              { translation: 'Cuándo', pronunciation: 'KWAHN-doh', english: 'When' },
              { translation: 'Cuánto tiempo toma', pronunciation: 'KWAHN-toh tee-EHM-poh TOH-mah', english: 'How long does it take' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Dónde lo hago', pronunciation: 'DOHN-deh loh AH-goh', english: 'Where do I do it' }
            ]
          },
          {
            english: 'Sign this safety acknowledgment form',
            translation: 'Firme este formulario de reconocimiento de seguridad',
            responses: [
              { translation: 'Dónde firmo', pronunciation: 'DOHN-deh FEER-moh', english: 'Where do I sign' },
              { translation: 'Puedo leerlo primero', pronunciation: 'PWEH-doh leh-EHR-loh pree-MEH-roh', english: 'Can I read it first' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Necesito ayuda para leer', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah PAH-rah leh-EHR', english: 'I need help reading' }
            ]
          },
          {
            english: 'Your safety certification expires next month',
            translation: 'Su certificación de seguridad expira el próximo mes',
            responses: [
              { translation: 'Cómo la renuevo', pronunciation: 'KOH-moh lah reh-NWEH-boh', english: 'How do I renew it' },
              { translation: 'Dónde voy', pronunciation: 'DOHN-deh boy', english: 'Where do I go' },
              { translation: 'Gracias por decirme', pronunciation: 'GRAH-see-ahs pohr deh-SEER-meh', english: 'Thank you for telling me' },
              { translation: 'Cuánto cuesta', pronunciation: 'KWAHN-toh KWES-tah', english: 'How much does it cost' }
            ]
          },
          {
            english: 'OSHA requires proper fall protection at this height',
            translation: 'OSHA requiere protección contra caídas apropiada a esta altura',
            responses: [
              { translation: 'Dónde está el arnés', pronunciation: 'DOHN-deh es-TAH el ahr-NEHS', english: 'Where is the harness' },
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Necesito equipo', pronunciation: 'neh-seh-SEE-toh eh-KEE-poh', english: 'I need equipment' },
              { translation: 'Sí, señor', pronunciation: 'see seh-NYOHR', english: 'Yes, sir' }
            ]
          },
          {
            english: 'All incidents must be reported within 24 hours',
            translation: 'Todos los incidentes deben reportarse dentro de 24 horas',
            responses: [
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'A quién lo reporto', pronunciation: 'ah kee-EHN loh reh-POHR-toh', english: 'Who do I report it to' },
              { translation: 'Cómo lo reporto', pronunciation: 'KOH-moh loh reh-POHR-toh', english: 'How do I report it' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' }
            ]
          }
        ]
      }
    ],
    tagalog: [],
    vietnamese: [],
    mandarin: [],
    cantonese: []
  },
  'injury-emergency': {
    spanish: [
      {
        groupLabel: 'Immediate Response',
        phrases: [
          {
            english: 'Are you hurt?',
            translation: '¿Está herido?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' },
              { translation: 'Me duele mucho', pronunciation: 'meh DWEH-leh MOO-choh', english: 'It hurts a lot' }
            ]
          },
          {
            english: 'Don\'t move, help is coming',
            translation: 'No se mueva, viene ayuda',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Me duele', pronunciation: 'meh DWEH-leh', english: 'It hurts' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Tengo miedo', pronunciation: 'TEHN-goh mee-EH-doh', english: 'I\'m afraid' }
            ]
          },
          {
            english: 'I\'m calling 911',
            translation: 'Estoy llamando al 911',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Por favor', pronunciation: 'pohr fah-BOHR', english: 'Please' },
              { translation: 'Es grave', pronunciation: 'ehs GRAH-beh', english: 'It\'s serious' },
              { translation: 'Apúrese', pronunciation: 'ah-POO-reh-seh', english: 'Hurry' }
            ]
          },
          {
            english: 'Where does it hurt?',
            translation: '¿Dónde le duele?',
            responses: [
              { translation: 'Aquí', pronunciation: 'ah-KEE', english: 'Here' },
              { translation: 'La pierna', pronunciation: 'lah pee-EHR-nah', english: 'The leg' },
              { translation: 'El brazo', pronunciation: 'el BRAH-soh', english: 'The arm' },
              { translation: 'La espalda', pronunciation: 'lah es-PAHL-dah', english: 'The back' }
            ]
          },
          {
            english: 'Stay calm, we will help you',
            translation: 'Mantenga la calma, lo vamos a ayudar',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Me duele mucho', pronunciation: 'meh DWEH-leh MOO-choh', english: 'It hurts a lot' },
              { translation: 'Tengo miedo', pronunciation: 'TEHN-goh mee-EH-doh', english: 'I\'m afraid' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Medical Assessment',
        phrases: [
          {
            english: 'Can you move your fingers?',
            translation: '¿Puede mover los dedos?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' },
              { translation: 'Duele cuando los muevo', pronunciation: 'DWEH-leh KWAHN-doh lohs MWEH-boh', english: 'It hurts when I move them' }
            ]
          },
          {
            english: 'Are you bleeding?',
            translation: '¿Está sangrando?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' },
              { translation: 'Mucho', pronunciation: 'MOO-choh', english: 'A lot' }
            ]
          },
          {
            english: 'Do you feel dizzy?',
            translation: '¿Se siente mareado?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Un poco', pronunciation: 'oon POH-koh', english: 'A little' },
              { translation: 'Muy mareado', pronunciation: 'moo-ee mah-reh-AH-doh', english: 'Very dizzy' }
            ]
          },
          {
            english: 'Did you hit your head?',
            translation: '¿Se golpeó la cabeza?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'No estoy seguro', pronunciation: 'noh es-TOY seh-GOO-roh', english: 'I\'m not sure' },
              { translation: 'Creo que sí', pronunciation: 'KREH-oh keh see', english: 'I think so' }
            ]
          },
          {
            english: 'On a scale of 1 to 10, how bad is the pain?',
            translation: '¿En una escala del 1 al 10, qué tan fuerte es el dolor?',
            responses: [
              { translation: 'Cinco', pronunciation: 'SEEN-koh', english: 'Five' },
              { translation: 'Ocho', pronunciation: 'OH-choh', english: 'Eight' },
              { translation: 'Diez', pronunciation: 'dee-EHS', english: 'Ten' },
              { translation: 'Muy fuerte', pronunciation: 'moo-ee FWEHR-teh', english: 'Very strong' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Reporting Procedures',
        phrases: [
          {
            english: 'I need to fill out an incident report',
            translation: 'Necesito llenar un reporte de incidente',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Qué necesita saber', pronunciation: 'keh neh-seh-SEE-tah sah-BEHR', english: 'What do you need to know' },
              { translation: 'Ahora', pronunciation: 'ah-OH-rah', english: 'Now' },
              { translation: 'Puede ayudarme', pronunciation: 'PWEH-deh ah-yoo-DAHR-meh', english: 'Can you help me' }
            ]
          },
          {
            english: 'What time did the accident happen?',
            translation: '¿A qué hora ocurrió el accidente?',
            responses: [
              { translation: 'A las diez', pronunciation: 'ah lahs dee-EHS', english: 'At ten' },
              { translation: 'Esta mañana', pronunciation: 'EH-stah mah-NYAH-nah', english: 'This morning' },
              { translation: 'Hace una hora', pronunciation: 'AH-seh OO-nah OH-rah', english: 'An hour ago' },
              { translation: 'No estoy seguro', pronunciation: 'noh es-TOY seh-GOO-roh', english: 'I\'m not sure' }
            ]
          },
          {
            english: 'Did anyone witness the accident?',
            translation: '¿Alguien presenció el accidente?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No', pronunciation: 'noh', english: 'No' },
              { translation: 'Mi compañero', pronunciation: 'mee kohm-pah-NYEH-roh', english: 'My coworker' },
              { translation: 'No sé', pronunciation: 'noh seh', english: 'I don\'t know' }
            ]
          },
          {
            english: 'You need to see a doctor',
            translation: 'Necesita ver a un doctor',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Dónde', pronunciation: 'DOHN-deh', english: 'Where' },
              { translation: 'Cuándo', pronunciation: 'KWAHN-doh', english: 'When' },
              { translation: 'Es necesario', pronunciation: 'ehs neh-seh-SAH-ree-oh', english: 'Is it necessary' }
            ]
          },
          {
            english: 'Sign this injury report',
            translation: 'Firme este reporte de lesión',
            responses: [
              { translation: 'Dónde firmo', pronunciation: 'DOHN-deh FEER-moh', english: 'Where do I sign' },
              { translation: 'Puedo leerlo primero', pronunciation: 'PWEH-doh leh-EHR-loh pree-MEH-roh', english: 'Can I read it first' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Qué dice', pronunciation: 'keh DEE-seh', english: 'What does it say' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Worker Rights',
        phrases: [
          {
            english: 'You have the right to workers\' compensation',
            translation: 'Usted tiene derecho a compensación de trabajadores',
            responses: [
              { translation: 'Cómo solicito', pronunciation: 'KOH-moh soh-LEE-see-toh', english: 'How do I apply' },
              { translation: 'Qué cubre', pronunciation: 'keh KOO-breh', english: 'What does it cover' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Necesito ayuda', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah', english: 'I need help' }
            ]
          },
          {
            english: 'Your medical bills will be covered',
            translation: 'Sus gastos médicos serán cubiertos',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Todos los gastos', pronunciation: 'TOH-dohs lohs GAHS-tohs', english: 'All expenses' },
              { translation: 'Qué bueno', pronunciation: 'keh BWEH-noh', english: 'That\'s good' },
              { translation: 'Cómo funciona', pronunciation: 'KOH-moh foon-see-OH-nah', english: 'How does it work' }
            ]
          },
          {
            english: 'You cannot be fired for reporting an injury',
            translation: 'No pueden despedirlo por reportar una lesión',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Es bueno saberlo', pronunciation: 'ehs BWEH-noh sah-BEHR-loh', english: 'It\'s good to know' },
              { translation: 'Tenía miedo', pronunciation: 'teh-NEE-ah mee-EH-doh', english: 'I was afraid' },
              { translation: 'Está seguro', pronunciation: 'es-TAH seh-GOO-roh', english: 'Are you sure' }
            ]
          },
          {
            english: 'You will receive pay while you recover',
            translation: 'Recibirá pago mientras se recupera',
            responses: [
              { translation: 'Cuánto', pronunciation: 'KWAHN-toh', english: 'How much' },
              { translation: 'Por cuánto tiempo', pronunciation: 'pohr KWAHN-toh tee-EHM-poh', english: 'For how long' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Eso me ayuda', pronunciation: 'EH-soh meh ah-YOO-dah', english: 'That helps me' }
            ]
          },
          {
            english: 'You can choose your own doctor for treatment',
            translation: 'Puede elegir su propio doctor para tratamiento',
            responses: [
              { translation: 'Puedo elegir', pronunciation: 'PWEH-doh eh-leh-HEER', english: 'Can I choose' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'No lo sabía', pronunciation: 'noh loh sah-BEE-ah', english: 'I didn\'t know' },
              { translation: 'Tengo un doctor', pronunciation: 'TEHN-goh oon dohk-TOHR', english: 'I have a doctor' }
            ]
          }
        ]
      }
    ],
    tagalog: [],
    vietnamese: [],
    mandarin: [],
    cantonese: []
  },
  'general-worksite': {
    spanish: [
      {
        groupLabel: 'Daily Instructions',
        phrases: [
          {
            english: 'We start work at 7 AM',
            translation: 'Empezamos a trabajar a las 7 AM',
            responses: [
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Estaré aquí', pronunciation: 'es-tah-REH ah-KEE', english: 'I\'ll be here' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' }
            ]
          },
          {
            english: 'Your assignment today is in Building B',
            translation: 'Su asignación hoy es en el Edificio B',
            responses: [
              { translation: 'Dónde está', pronunciation: 'DOHN-deh es-TAH', english: 'Where is it' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Qué voy a hacer', pronunciation: 'keh boy ah ah-SEHR', english: 'What am I going to do' },
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' }
            ]
          },
          {
            english: 'Pick up your tools from the storage shed',
            translation: 'Recoja sus herramientas del cobertizo de almacenamiento',
            responses: [
              { translation: 'Dónde está el cobertizo', pronunciation: 'DOHN-deh es-TAH el koh-behr-TEE-soh', english: 'Where is the shed' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Qué herramientas necesito', pronunciation: 'keh eh-rah-mee-EHN-tahs neh-seh-SEE-toh', english: 'What tools do I need' },
              { translation: 'Voy ahora', pronunciation: 'boy ah-OH-rah', english: 'I\'m going now' }
            ]
          },
          {
            english: 'Take your lunch break at noon',
            translation: 'Tome su descanso de almuerzo al mediodía',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Cuánto tiempo', pronunciation: 'KWAHN-toh tee-EHM-poh', english: 'How long' },
              { translation: 'Dónde puedo comer', pronunciation: 'DOHN-deh PWEH-doh koh-MEHR', english: 'Where can I eat' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' }
            ]
          },
          {
            english: 'Clean up your work area before leaving',
            translation: 'Limpie su área de trabajo antes de irse',
            responses: [
              { translation: 'Sí, señor', pronunciation: 'see seh-NYOHR', english: 'Yes, sir' },
              { translation: 'Lo haré', pronunciation: 'loh ah-REH', english: 'I will' },
              { translation: 'Dónde pongo las herramientas', pronunciation: 'DOHN-deh POHN-goh lahs eh-rah-mee-EHN-tahs', english: 'Where do I put the tools' },
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Quality Standards',
        phrases: [
          {
            english: 'This needs to be level',
            translation: 'Esto necesita estar nivelado',
            responses: [
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Lo nivelaré', pronunciation: 'loh nee-beh-lah-REH', english: 'I\'ll level it' },
              { translation: 'Dónde está el nivel', pronunciation: 'DOHN-deh es-TAH el nee-BEHL', english: 'Where is the level' },
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' }
            ]
          },
          {
            english: 'Measure twice, cut once',
            translation: 'Mida dos veces, corte una vez',
            responses: [
              { translation: 'Sí, señor', pronunciation: 'see seh-NYOHR', english: 'Yes, sir' },
              { translation: 'Siempre lo hago', pronunciation: 'see-EHM-preh loh AH-goh', english: 'I always do' },
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' }
            ]
          },
          {
            english: 'The inspector will check this later',
            translation: 'El inspector revisará esto más tarde',
            responses: [
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Lo haré bien', pronunciation: 'loh ah-REH bee-EHN', english: 'I\'ll do it well' },
              { translation: 'Cuándo viene', pronunciation: 'KWAHN-doh bee-EH-neh', english: 'When is he coming' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' }
            ]
          },
          {
            english: 'This does not meet specifications',
            translation: 'Esto no cumple con las especificaciones',
            responses: [
              { translation: 'Qué está mal', pronunciation: 'keh es-TAH mahl', english: 'What\'s wrong' },
              { translation: 'Lo arreglaré', pronunciation: 'loh ah-reh-glah-REH', english: 'I\'ll fix it' },
              { translation: 'Lo siento', pronunciation: 'loh see-EHN-toh', english: 'I\'m sorry' },
              { translation: 'Qué debo hacer', pronunciation: 'keh DEH-boh ah-SEHR', english: 'What should I do' }
            ]
          },
          {
            english: 'Good work, keep it up',
            translation: 'Buen trabajo, siga así',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Gracias, señor', pronunciation: 'GRAH-see-ahs seh-NYOHR', english: 'Thank you, sir' },
              { translation: 'Lo haré', pronunciation: 'loh ah-REH', english: 'I will' },
              { translation: 'Aprecio eso', pronunciation: 'ah-preh-see-OH EH-soh', english: 'I appreciate that' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Schedule and Deadlines',
        phrases: [
          {
            english: 'This section must be finished by Friday',
            translation: 'Esta sección debe terminarse para el viernes',
            responses: [
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Lo terminaré', pronunciation: 'loh tehr-mee-nah-REH', english: 'I\'ll finish it' },
              { translation: 'Es posible', pronunciation: 'ehs poh-SEE-bleh', english: 'It\'s possible' },
              { translation: 'Necesito ayuda', pronunciation: 'neh-seh-SEE-toh ah-YOO-dah', english: 'I need help' }
            ]
          },
          {
            english: 'We are behind schedule',
            translation: 'Estamos atrasados en el cronograma',
            responses: [
              { translation: 'Qué puedo hacer', pronunciation: 'keh PWEH-doh ah-SEHR', english: 'What can I do' },
              { translation: 'Trabajaré más rápido', pronunciation: 'trah-bah-hah-REH mahs RAH-pee-doh', english: 'I\'ll work faster' },
              { translation: 'Cuánto tiempo tenemos', pronunciation: 'KWAHN-toh tee-EHM-poh teh-NEH-mohs', english: 'How much time do we have' },
              { translation: 'Lo siento', pronunciation: 'loh see-EHN-toh', english: 'I\'m sorry' }
            ]
          },
          {
            english: 'Can you work overtime this week?',
            translation: '¿Puede trabajar horas extras esta semana?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'No puedo', pronunciation: 'noh PWEH-doh', english: 'I can\'t' },
              { translation: 'Qué días', pronunciation: 'keh DEE-ahs', english: 'What days' },
              { translation: 'Cuántas horas', pronunciation: 'KWAHN-tahs OH-rahs', english: 'How many hours' }
            ]
          },
          {
            english: 'The delivery is scheduled for tomorrow',
            translation: 'La entrega está programada para mañana',
            responses: [
              { translation: 'A qué hora', pronunciation: 'ah keh OH-rah', english: 'At what time' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Estaré listo', pronunciation: 'es-tah-REH LEES-toh', english: 'I\'ll be ready' },
              { translation: 'Gracias por avisar', pronunciation: 'GRAH-see-ahs pohr ah-bee-SAHR', english: 'Thanks for letting me know' }
            ]
          },
          {
            english: 'We need to finish this before it rains',
            translation: 'Necesitamos terminar esto antes de que llueva',
            responses: [
              { translation: 'Voy a apurarme', pronunciation: 'boy ah ah-poo-RAHR-meh', english: 'I\'ll hurry' },
              { translation: 'Cuánto tiempo tenemos', pronunciation: 'KWAHN-toh tee-EHM-poh teh-NEH-mohs', english: 'How much time do we have' },
              { translation: 'Entendido', pronunciation: 'en-ten-DEE-doh', english: 'Understood' },
              { translation: 'Necesitamos más gente', pronunciation: 'neh-seh-see-TAH-mohs mahs HEN-teh', english: 'We need more people' }
            ]
          }
        ]
      },
      {
        groupLabel: 'Team Communication',
        phrases: [
          {
            english: 'Can you help me with this?',
            translation: '¿Me puede ayudar con esto?',
            responses: [
              { translation: 'Sí', pronunciation: 'see', english: 'Yes' },
              { translation: 'Un momento', pronunciation: 'oon moh-MEN-toh', english: 'One moment' },
              { translation: 'Ahora no puedo', pronunciation: 'ah-OH-rah noh PWEH-doh', english: 'I can\'t right now' },
              { translation: 'Qué necesita', pronunciation: 'keh neh-seh-SEE-tah', english: 'What do you need' }
            ]
          },
          {
            english: 'Let\'s take a water break',
            translation: 'Tomemos un descanso para agua',
            responses: [
              { translation: 'Buena idea', pronunciation: 'BWEH-nah ee-DEH-ah', english: 'Good idea' },
              { translation: 'Está bien', pronunciation: 'es-TAH bee-EHN', english: 'Okay' },
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Necesito agua', pronunciation: 'neh-seh-SEE-toh AH-gwah', english: 'I need water' }
            ]
          },
          {
            english: 'Where is the foreman?',
            translation: '¿Dónde está el capataz?',
            responses: [
              { translation: 'No sé', pronunciation: 'noh seh', english: 'I don\'t know' },
              { translation: 'Allá', pronunciation: 'ah-YAH', english: 'Over there' },
              { translation: 'En la oficina', pronunciation: 'en lah oh-fee-SEE-nah', english: 'In the office' },
              { translation: 'Lo vi hace un momento', pronunciation: 'loh bee AH-seh oon moh-MEN-toh', english: 'I saw him a moment ago' }
            ]
          },
          {
            english: 'We need more materials',
            translation: 'Necesitamos más materiales',
            responses: [
              { translation: 'A quién le digo', pronunciation: 'ah kee-EHN leh DEE-goh', english: 'Who do I tell' },
              { translation: 'Qué materiales', pronunciation: 'keh mah-teh-ree-AH-les', english: 'What materials' },
              { translation: 'Dónde están', pronunciation: 'DOHN-deh es-TAHN', english: 'Where are they' },
              { translation: 'Voy a pedir', pronunciation: 'boy ah peh-DEER', english: 'I\'ll request them' }
            ]
          },
          {
            english: 'Good teamwork today',
            translation: 'Buen trabajo en equipo hoy',
            responses: [
              { translation: 'Gracias', pronunciation: 'GRAH-see-ahs', english: 'Thank you' },
              { translation: 'Igualmente', pronunciation: 'ee-gwahl-MEN-teh', english: 'Likewise' },
              { translation: 'Trabajamos bien juntos', pronunciation: 'trah-bah-HAH-mohs bee-EHN HOON-tohs', english: 'We work well together' },
              { translation: 'Gracias a todos', pronunciation: 'GRAH-see-ahs ah TOH-dohs', english: 'Thanks to everyone' }
            ]
          }
        ]
      }
    ],
    tagalog: [],
    vietnamese: [],
    mandarin: [],
    cantonese: []
  }
};
