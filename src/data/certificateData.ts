export type TrackId = 'healthcare' | 'education' | 'construction' | 'social-services' | 'mental-health';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CertModule {
  id: number;
  title: string;
  questions: QuizQuestion[];
}

export interface CertTrack {
  id: TrackId;
  title: string;
  description: string;
  icon: string;
  color: string;
  modules: CertModule[];
}

export const CERT_PRICE = 39;
export const PASS_THRESHOLD = 0.8;
export const STORAGE_KEY = 'langaccess_certificates';

export interface CertProgress {
  userName: string;
  purchased: Record<TrackId, boolean>;
  moduleScores: Record<string, number>;
  completedModules: Record<string, boolean>;
  certIds: Record<TrackId, string>;
}

export function loadProgress(): CertProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CertProgress;
  } catch { /* ignore */ }
  return {
    userName: '',
    purchased: {} as Record<TrackId, boolean>,
    moduleScores: {},
    completedModules: {},
    certIds: {} as Record<TrackId, string>,
  };
}

export function saveProgress(p: CertProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function generateCertId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `LA-2026-${num}`;
}

export function isTrackComplete(trackId: TrackId, progress: CertProgress): boolean {
  const track = CERT_TRACKS.find(t => t.id === trackId);
  if (!track) return false;
  return track.modules.every(m => progress.completedModules[`${trackId}-${m.id}`]);
}

const healthcareQuestions: QuizQuestion[] = [
  {
    question: "How do you say 'Do you have pain?' in Spanish?",
    options: ['¿Tiene dolor?', '¿Tiene fiebre?', '¿Tiene hambre?', '¿Tiene miedo?'],
    correctIndex: 0,
    explanation: "'¿Tiene dolor?' directly translates to 'Do you have pain?' — a critical intake question.",
  },
  {
    question: "Which phrase asks a patient about allergies?",
    options: ['¿Es usted alérgico a algún medicamento?', '¿Cuánto pesa usted?', '¿Cuándo nació?', '¿Dónde trabaja?'],
    correctIndex: 0,
    explanation: "'¿Es usted alérgico a algún medicamento?' asks about medication allergies — vital before treatment.",
  },
  {
    question: "What does 'Respire profundamente' mean?",
    options: ['Take a deep breath', 'Open your mouth', 'Roll up your sleeve', 'Sit down'],
    correctIndex: 0,
    explanation: "'Respire profundamente' = 'Take a deep breath.' Used during physical exams.",
  },
  {
    question: "How do you tell a patient to fast before a procedure?",
    options: ['No coma ni beba nada después de la medianoche.', 'Tome agua extra esta noche.', 'Coma una comida ligera.', 'Tome su medicamento con comida.'],
    correctIndex: 0,
    explanation: "'No coma ni beba nada después de la medianoche' means 'Do not eat or drink anything after midnight.'",
  },
  {
    question: "'¿Está embarazada?' means:",
    options: ['Are you pregnant?', 'Are you diabetic?', 'Are you insured?', 'Are you in pain?'],
    correctIndex: 0,
    explanation: "'¿Está embarazada?' = 'Are you pregnant?' — critical before X-rays or certain medications.",
  },
  {
    question: "Which phrase means 'I need to take your blood pressure'?",
    options: ['Necesito tomarle la presión arterial.', 'Necesito sacarle sangre.', 'Necesito ponerle una inyección.', 'Necesito revisarle los oídos.'],
    correctIndex: 0,
    explanation: "'Presión arterial' means blood pressure. 'Necesito tomarle…' = 'I need to take your…'",
  },
  {
    question: "What does 'Señale dónde le duele' ask the patient to do?",
    options: ['Point to where it hurts', 'Rate the pain 1–10', 'Describe the pain type', 'Tell when it started'],
    correctIndex: 0,
    explanation: "'Señale' = 'Point/indicate.' The phrase asks the patient to point to the location of pain.",
  },
  {
    question: "How do you ask 'When did the symptoms start?'",
    options: ['¿Cuándo comenzaron los síntomas?', '¿Qué síntomas tiene?', '¿Cuánto tiempo tiene los síntomas?', '¿Dónde le duele?'],
    correctIndex: 0,
    explanation: "'¿Cuándo comenzaron…?' directly asks 'When did they start?' — essential for triage.",
  },
  {
    question: "'Tome este medicamento dos veces al día' means:",
    options: ['Take this medication twice a day', 'Take this medication once a day', 'Take this medication with food', 'Take this medication at bedtime'],
    correctIndex: 0,
    explanation: "'Dos veces al día' = 'twice a day.' Clear dosage instructions reduce medication errors.",
  },
  {
    question: "Which response means 'Yes, I understand'?",
    options: ['Sí, entiendo.', 'No sé.', 'Tal vez.', 'Más despacio, por favor.'],
    correctIndex: 0,
    explanation: "'Sí, entiendo' = 'Yes, I understand.' Confirms the patient comprehended your instructions.",
  },
];

const educationQuestions: QuizQuestion[] = [
  {
    question: "How do you say 'Welcome to our school' in Spanish?",
    options: ['Bienvenido a nuestra escuela.', 'Por favor siéntese.', 'Gracias por venir.', 'El horario empieza a las ocho.'],
    correctIndex: 0,
    explanation: "'Bienvenido a nuestra escuela' is the standard welcoming phrase for new families.",
  },
  {
    question: "'¿Habla inglés su hijo/a?' asks:",
    options: ['Does your child speak English?', 'Is your child bilingual?', 'What language does your child prefer?', 'Has your child studied English?'],
    correctIndex: 0,
    explanation: "This question determines language dominance for proper classroom placement.",
  },
  {
    question: "Which phrase schedules a parent-teacher conference?",
    options: ['¿Puede venir el martes a las tres?', '¿Cuándo es el próximo día escolar?', '¿Necesita su hijo tutorías?', '¿Tiene preguntas sobre las calificaciones?'],
    correctIndex: 0,
    explanation: "Offering a specific time ('el martes a las tres') reduces ambiguity in scheduling.",
  },
  {
    question: "What does 'Su hijo/a necesita materiales escolares' mean?",
    options: ['Your child needs school supplies', 'Your child is doing great', 'Your child needs extra help', 'Your child is absent too often'],
    correctIndex: 0,
    explanation: "'Materiales escolares' = school supplies. Parents need to know what to purchase.",
  },
  {
    question: "How do you explain a school emergency drill?",
    options: ['Hoy vamos a practicar un simulacro de emergencia.', 'Hay una emergencia real ahora.', 'Por favor salga inmediatamente.', 'Llame al 911 ahora.'],
    correctIndex: 0,
    explanation: "'Simulacro' means 'drill/practice.' The word prevents panic during routine safety exercises.",
  },
  {
    question: "'Las calificaciones se publican en línea' tells parents:",
    options: ['Grades are posted online', 'Report cards will be mailed', 'Grades are available at the office', 'You must attend in person'],
    correctIndex: 0,
    explanation: "Directing families to online grade portals improves engagement and removes barriers.",
  },
  {
    question: "Which phrase requests a home language survey?",
    options: ['Por favor complete esta encuesta sobre el idioma del hogar.', 'Su hijo habla muy bien inglés.', 'Necesitamos un intérprete.', 'La escuela ofrece clases de inglés.'],
    correctIndex: 0,
    explanation: "Home language surveys are legally required in many states for ELL identification.",
  },
  {
    question: "What does 'Su hijo/a tiene una cita con el consejero' mean?",
    options: ['Your child has an appointment with the counselor', 'Your child needs to see the nurse', "Your child is in the principal's office", 'Your child missed a test'],
    correctIndex: 0,
    explanation: "'Consejero/a' = counselor. Communicating appointments helps families prepare.",
  },
  {
    question: "How do you ask if a family needs translation services?",
    options: ['¿Necesita servicios de traducción?', '¿Habla usted inglés?', '¿Tiene un intérprete?', '¿Entiende usted este documento?'],
    correctIndex: 0,
    explanation: "Proactively offering translation services fulfills Title III obligations under federal law.",
  },
  {
    question: "'La escuela tiene programa de desayuno gratuito' informs families:",
    options: ['The school has a free breakfast program', 'Lunch is free for all students', 'Breakfast is served at 7 AM', 'Students must bring their own food'],
    correctIndex: 0,
    explanation: "Informing families about nutrition programs ensures children start the day nourished and ready to learn.",
  },
];

const constructionQuestions: QuizQuestion[] = [
  {
    question: "How do you say 'Always wear your hard hat' in Spanish?",
    options: ['Siempre use su casco.', 'Use sus guantes siempre.', 'Use sus botas siempre.', 'Siempre use su chaleco.'],
    correctIndex: 0,
    explanation: "'Casco' = hard hat. This is the most frequently delivered safety instruction on job sites.",
  },
  {
    question: "'¿Está usted lesionado?' asks:",
    options: ['Are you injured?', 'Are you tired?', 'Are you sick?', 'Are you lost?'],
    correctIndex: 0,
    explanation: "'Lesionado/a' means injured. Immediate injury assessment prevents further harm.",
  },
  {
    question: "Which phrase means 'Stop work immediately'?",
    options: ['Detenga el trabajo inmediatamente.', 'Trabaje más despacio.', 'Tome un descanso ahora.', 'Espere las instrucciones.'],
    correctIndex: 0,
    explanation: "'Detenga' = stop (command form). Clear stop-work commands are critical during hazard identification.",
  },
  {
    question: "What does 'No entre a esta área sin autorización' mean?",
    options: ['Do not enter this area without authorization', 'Enter at your own risk', 'Hard hat required in this area', 'This area is under construction'],
    correctIndex: 0,
    explanation: "Restricted zone communication prevents accidents and liability in controlled areas.",
  },
  {
    question: "How do you ask 'Did you complete the safety training?'",
    options: ['¿Completó el entrenamiento de seguridad?', '¿Tiene su licencia de conducir?', '¿Sabe usar el equipo?', '¿Cuántos años de experiencia tiene?'],
    correctIndex: 0,
    explanation: "Verifying safety training completion is legally required before many high-risk tasks.",
  },
  {
    question: "'Use el equipo de protección personal' instructs workers to:",
    options: ['Use personal protective equipment', 'Use power tools carefully', 'Use the elevator', 'Use the emergency exit'],
    correctIndex: 0,
    explanation: "PPE (equipo de protección personal) instructions are mandatory under OSHA standards.",
  },
  {
    question: "What phrase reports a chemical spill?",
    options: ['Hay un derrame de químicos. Evacúe el área.', 'Hay fuego en el edificio.', 'Hay un trabajador herido.', 'Hay una fuga de gas.'],
    correctIndex: 0,
    explanation: "'Derrame de químicos' = chemical spill. Evacuation instructions must follow immediately.",
  },
  {
    question: "How do you explain working at heights safety?",
    options: ['Al trabajar en alturas, use el arnés de seguridad.', 'No suba a la escalera.', 'El andamio está asegurado.', 'Trabaje con un compañero siempre.'],
    correctIndex: 0,
    explanation: "'Arnés de seguridad' = safety harness. Fall protection is the #1 cause of construction fatalities.",
  },
  {
    question: "'¿Dónde está el extintor de incendios?' asks about:",
    options: ['Where the fire extinguisher is', 'Where the first aid kit is', 'Where the emergency exit is', 'Where the foreman is'],
    correctIndex: 0,
    explanation: "Knowing fire extinguisher locations is a basic fire safety requirement for all workers.",
  },
  {
    question: "Which phrase means 'Do not operate machinery if you feel unwell'?",
    options: ['No opere maquinaria si se siente mal.', 'Tome su descanso antes de operar.', 'Revise la maquinaria antes de usarla.', 'Apague la maquinaria al terminar.'],
    correctIndex: 0,
    explanation: "Impaired operation causes accidents. Workers must know they can and should stop if ill.",
  },
];

const socialServicesQuestions: QuizQuestion[] = [
  {
    question: "'¿Cómo puedo ayudarle hoy?' means:",
    options: ['How can I help you today?', 'What do you need?', 'Where do you live?', 'What is your name?'],
    correctIndex: 0,
    explanation: "Opening with 'How can I help?' establishes a welcoming, client-centered interaction.",
  },
  {
    question: "How do you explain confidentiality to a client?",
    options: ['Su información es confidencial y está protegida.', 'Compartiremos su información con otros.', 'Necesitamos su nombre completo.', 'Por favor firme este documento.'],
    correctIndex: 0,
    explanation: "Explaining confidentiality rights builds trust and is legally required under HIPAA and similar laws.",
  },
  {
    question: "Which phrase asks about housing situation?",
    options: ['¿Tiene dónde vivir actualmente?', '¿Cuánto paga de renta?', '¿Cuántas personas viven con usted?', '¿Tiene usted hipoteca?'],
    correctIndex: 0,
    explanation: "Homelessness screening is a critical first step in connecting clients to emergency housing.",
  },
  {
    question: "What does 'Tiene derecho a un intérprete gratuito' tell a client?",
    options: ['You have the right to a free interpreter', 'You must speak English to receive services', 'Interpreters are available for a fee', 'You should bring your own translator'],
    correctIndex: 0,
    explanation: "Informing clients of their interpreter rights is required under Title VI of the Civil Rights Act.",
  },
  {
    question: "How do you ask about food security?",
    options: ['¿Tiene suficiente comida para su familia?', '¿Qué come usted normalmente?', '¿Tiene alergias alimentarias?', '¿Cocina usted en casa?'],
    correctIndex: 0,
    explanation: "Food security screening enables referrals to food banks, SNAP benefits, and WIC programs.",
  },
  {
    question: "'Puede acceder a estos servicios sin importar su estatus migratorio' means:",
    options: ['You can access these services regardless of immigration status', 'Services are only for citizens', 'Please show your immigration documents', 'Your status will be reported'],
    correctIndex: 0,
    explanation: "Many federal programs prohibit asking about immigration status. Clients must know they are safe.",
  },
  {
    question: "Which phrase refers someone to emergency shelter?",
    options: ['Hay refugio de emergencia disponible esta noche.', 'Los hoteles están llenos.', 'Llame al 211 mañana.', 'Hable con su familia primero.'],
    correctIndex: 0,
    explanation: "Immediate shelter referrals require clear, time-sensitive language to prevent homelessness.",
  },
  {
    question: "What does 'Necesita presentar una identificación válida' mean?",
    options: ['You need to present a valid ID', 'Your ID has expired', 'A passport is required', 'No ID is needed'],
    correctIndex: 0,
    explanation: "Clear ID requirements prevent wasted trips and help clients prepare the right documents.",
  },
  {
    question: "How do you explain an appointment reminder?",
    options: ['Su próxima cita es el jueves a las dos de la tarde.', 'Por favor llegue temprano.', 'No olvide traer sus documentos.', 'La oficina cierra a las cinco.'],
    correctIndex: 0,
    explanation: "Specific date and time reminders ('jueves a las dos') reduce no-show rates significantly.",
  },
  {
    question: "'¿Necesita ayuda con transporte para llegar a su cita?' offers:",
    options: ['Transportation assistance to appointments', 'A ride to the grocery store', 'Bus passes for work commute', 'Help with car repairs'],
    correctIndex: 0,
    explanation: "Transportation barriers are a top reason clients miss appointments. Proactive offers improve outcomes.",
  },
];

const mentalHealthQuestions: QuizQuestion[] = [
  {
    question: "'¿Cómo se ha sentido emocionalmente esta semana?' asks:",
    options: ['How have you been feeling emotionally this week?', 'How is your physical health?', 'Have you been sleeping well?', 'Are you taking your medication?'],
    correctIndex: 0,
    explanation: "Opening with emotional check-ins sets a therapeutic tone and builds rapport quickly.",
  },
  {
    question: "Which phrase screens for suicidal ideation responsibly?",
    options: ['¿Ha tenido pensamientos de hacerse daño?', '¿Está usted deprimido?', '¿Se siente solo?', '¿Ha llorando mucho?'],
    correctIndex: 0,
    explanation: "'¿Ha tenido pensamientos de hacerse daño?' is the clinically recommended screening question.",
  },
  {
    question: "What does 'Este es un espacio seguro y confidencial' communicate?",
    options: ['This is a safe and confidential space', 'This room is private', 'Your information will be shared', 'This session is being recorded'],
    correctIndex: 0,
    explanation: "Establishing psychological safety is essential before clients can openly discuss mental health.",
  },
  {
    question: "How do you explain a breathing exercise?",
    options: ['Respire lentamente: inhale por cuatro segundos, exhale por cuatro.', 'Cierre los ojos y descanse.', 'Piense en algo feliz.', 'Cuente hasta diez.'],
    correctIndex: 0,
    explanation: "Box breathing (4-4-4-4) is an evidence-based grounding technique that works cross-culturally.",
  },
  {
    question: "'¿Tiene una red de apoyo en su vida?' asks about:",
    options: ['Support network in their life', 'Internet connectivity', 'Family members\' contact info', 'Emergency contacts'],
    correctIndex: 0,
    explanation: "Social support is a major protective factor. Assessing it guides treatment and safety planning.",
  },
  {
    question: "Which phrase normalizes seeking help?",
    options: ['Es valiente pedir ayuda. No está solo/a.', 'Mucha gente tiene estos problemas.', 'Todos se sienten así a veces.', 'No debe sentirse avergonzado.'],
    correctIndex: 0,
    explanation: "'Es valiente pedir ayuda' ('It is brave to ask for help') directly combats stigma and shame.",
  },
  {
    question: "What does 'Voy a conectarle con recursos de salud mental' mean?",
    options: ['I am going to connect you with mental health resources', 'I will schedule a follow-up', 'You need medication', 'I will refer you to a hospital'],
    correctIndex: 0,
    explanation: "Warm handoffs to mental health resources are more effective than simple referrals.",
  },
  {
    question: "How do you ask about sleep patterns?",
    options: ['¿Cuántas horas duerme por noche?', '¿Se siente cansado durante el día?', '¿Toma medicamentos para dormir?', '¿Tiene pesadillas frecuentes?'],
    correctIndex: 0,
    explanation: "Sleep is a primary mental health indicator. Duration questions precede quality follow-ups.",
  },
  {
    question: "'¿Ha experimentado algún trauma reciente?' is used to:",
    options: ['Screen for recent trauma', 'Ask about physical injuries', 'Inquire about work accidents', 'Check family history'],
    correctIndex: 0,
    explanation: "Trauma screening enables trauma-informed care and prevents re-traumatization.",
  },
  {
    question: "Which phrase closes a session supportively?",
    options: ['Recuerde: está progresando. Nos vemos la próxima semana.', 'La sesión terminó. Hasta luego.', 'Por favor espere afuera.', 'Llame si tiene una emergencia.'],
    correctIndex: 0,
    explanation: "Affirming progress and confirming next steps reduces dropout and builds therapeutic alliance.",
  },
];

export const CERT_TRACKS: CertTrack[] = [
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Patient communication, intake, consent, and clinical instructions for medical settings.',
    icon: '🏥',
    color: 'from-blue-600 to-blue-800',
    modules: [
      { id: 1, title: 'Patient Intake & Vitals', questions: healthcareQuestions },
      { id: 2, title: 'Symptoms & Pain Assessment', questions: healthcareQuestions.map(q => ({ ...q })) },
      { id: 3, title: 'Medications & Instructions', questions: healthcareQuestions.map(q => ({ ...q })) },
      { id: 4, title: 'Procedures & Consent', questions: healthcareQuestions.map(q => ({ ...q })) },
      { id: 5, title: 'Discharge & Follow-Up', questions: healthcareQuestions.map(q => ({ ...q })) },
    ],
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Family engagement, enrollment, parent-teacher communication, and student support.',
    icon: '🎓',
    color: 'from-green-600 to-green-800',
    modules: [
      { id: 1, title: 'Enrollment & Registration', questions: educationQuestions },
      { id: 2, title: 'Parent-Teacher Conferences', questions: educationQuestions.map(q => ({ ...q })) },
      { id: 3, title: 'Special Education & IEPs', questions: educationQuestions.map(q => ({ ...q })) },
      { id: 4, title: 'Student Behavior & Discipline', questions: educationQuestions.map(q => ({ ...q })) },
      { id: 5, title: 'Graduation & Transitions', questions: educationQuestions.map(q => ({ ...q })) },
    ],
  },
  {
    id: 'construction',
    title: 'Construction',
    description: 'Jobsite safety, OSHA compliance, hazard communication, and equipment operation.',
    icon: '\u{1F3D7}\uFE0F',
    color: 'from-orange-600 to-orange-800',
    modules: [
      { id: 1, title: 'Jobsite Safety Basics', questions: constructionQuestions },
      { id: 2, title: 'PPE & Equipment', questions: constructionQuestions.map(q => ({ ...q })) },
      { id: 3, title: 'Hazard Communication', questions: constructionQuestions.map(q => ({ ...q })) },
      { id: 4, title: 'Emergency Procedures', questions: constructionQuestions.map(q => ({ ...q })) },
      { id: 5, title: 'Toolbox Talks & Supervision', questions: constructionQuestions.map(q => ({ ...q })) },
    ],
  },
  {
    id: 'social-services',
    title: 'Social Services',
    description: 'Client intake, benefits navigation, housing, food security, and case management.',
    icon: '🤝',
    color: 'from-teal-600 to-teal-800',
    modules: [
      { id: 1, title: 'Client Intake & Rights', questions: socialServicesQuestions },
      { id: 2, title: 'Housing & Shelter Services', questions: socialServicesQuestions.map(q => ({ ...q })) },
      { id: 3, title: 'Benefits & Eligibility', questions: socialServicesQuestions.map(q => ({ ...q })) },
      { id: 4, title: 'Domestic Violence Resources', questions: socialServicesQuestions.map(q => ({ ...q })) },
      { id: 5, title: 'Case Closure & Follow-Up', questions: socialServicesQuestions.map(q => ({ ...q })) },
    ],
  },
  {
    id: 'mental-health',
    title: 'Mental Health',
    description: 'Crisis screening, therapeutic communication, trauma-informed care, and wellness check-ins.',
    icon: '🧠',
    color: 'from-rose-600 to-rose-800',
    modules: [
      { id: 1, title: 'Initial Assessment & Safety', questions: mentalHealthQuestions },
      { id: 2, title: 'Depression & Anxiety Screening', questions: mentalHealthQuestions.map(q => ({ ...q })) },
      { id: 3, title: 'Trauma-Informed Approaches', questions: mentalHealthQuestions.map(q => ({ ...q })) },
      { id: 4, title: 'Crisis Intervention', questions: mentalHealthQuestions.map(q => ({ ...q })) },
      { id: 5, title: 'Recovery & Wellness Plans', questions: mentalHealthQuestions.map(q => ({ ...q })) },
    ],
  },
];
