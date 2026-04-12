export type TrackId = 'healthcare' | 'education' | 'construction' | 'social-services' | 'mental-health' | 'property-management' | 'warehouse' | 'hospitality';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface KeyPhrase {
  english: string;
  spanish: string;
  context: string;
}

export interface CertModule {
  id: number;
  title: string;
  questions: QuizQuestion[];
  keyPhrases: KeyPhrase[];
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

const healthcareModule2Questions: QuizQuestion[] = [
  {
    question: "How do you ask 'Where does it hurt?'",
    options: ['¿Cuánto le duele?', '¿Dónde le duele?', '¿Cuándo empezó el dolor?', '¿Cómo es el dolor?'],
    correctIndex: 1,
    explanation: "'¿Dónde le duele?' directly asks 'Where does it hurt?' — the most fundamental pain location question.",
  },
  {
    question: '"En una escala del uno al diez" means:',
    options: ['On a scale from one to ten', 'For one to ten minutes', 'Once or twice a day', 'One tablet at a time'],
    correctIndex: 0,
    explanation: "'En una escala del uno al diez' is used to ask patients to rate their pain numerically.",
  },
  {
    question: "How do you ask 'How long have you had this pain?'",
    options: ['¿Qué tan fuerte es el dolor?', '¿Dónde siente el dolor?', '¿Desde cuándo tiene este dolor?', '¿El dolor se mueve?'],
    correctIndex: 2,
    explanation: "'¿Desde cuándo tiene este dolor?' asks how long the pain has been present — key for diagnosis.",
  },
  {
    question: "Which phrase means 'Is the pain constant or does it come and go?'",
    options: ['¿El dolor es fuerte o suave?', '¿El dolor es constante o va y viene?', '¿El dolor empeora por la noche?', '¿El dolor mejora con medicamento?'],
    correctIndex: 1,
    explanation: "'¿El dolor es constante o va y viene?' helps distinguish chronic from intermittent pain patterns.",
  },
  {
    question: '"Mareo" means:',
    options: ['Nausea', 'Headache', 'Dizziness', 'Fatigue'],
    correctIndex: 2,
    explanation: "'Mareo' = dizziness. Important symptom to distinguish from náuseas (nausea) and dolor de cabeza (headache).",
  },
  {
    question: "How do you say 'Do you have shortness of breath?'",
    options: ['¿Tiene tos?', '¿Tiene fiebre?', '¿Tiene dificultad para respirar?', '¿Tiene dolor de pecho?'],
    correctIndex: 2,
    explanation: "'¿Tiene dificultad para respirar?' screens for respiratory distress — critical for triage prioritization.",
  },
  {
    question: '"Náuseas" means:',
    options: ['Dizziness', 'Nausea', 'Headache', 'Chest pain'],
    correctIndex: 1,
    explanation: "'Náuseas' = nausea. Distinguishing from 'mareo' (dizziness) ensures accurate symptom documentation.",
  },
  {
    question: "How do you ask 'Does the pain radiate anywhere?'",
    options: ['¿El dolor es constante?', '¿El dolor se irradia a algún lugar?', '¿El dolor empezó hoy?', '¿El dolor mejora al descansar?'],
    correctIndex: 1,
    explanation: "'¿El dolor se irradia a algún lugar?' is critical for identifying referred pain patterns like cardiac events.",
  },
  {
    question: "Which phrase means 'Do you have a fever?'",
    options: ['¿Tiene escalofríos?', '¿Tiene sudoración?', '¿Tiene fiebre?', '¿Tiene cansancio?'],
    correctIndex: 2,
    explanation: "'¿Tiene fiebre?' is one of the most common symptom screening questions in any clinical encounter.",
  },
  {
    question: "How do you say 'Point to where you feel the pain'?",
    options: ['Muéstreme sus medicamentos', 'Señale dónde siente el dolor', 'Dígame cuándo empezó', 'Describa cómo es el dolor'],
    correctIndex: 1,
    explanation: "'Señale dónde siente el dolor' is especially useful when language barriers make verbal description difficult.",
  },
];

const healthcareModule3Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Take one tablet twice a day'?",
    options: ['Tome una pastilla tres veces al día', 'Tome una pastilla dos veces al día', 'Tome dos pastillas una vez al día', 'Tome una pastilla con el desayuno'],
    correctIndex: 1,
    explanation: "'Dos veces al día' = twice a day. Accurate dosage instructions are critical to medication safety.",
  },
  {
    question: '"En ayunas" means:',
    options: ['With food', 'At bedtime', 'On an empty stomach', 'With water only'],
    correctIndex: 2,
    explanation: "'En ayunas' = on an empty stomach. Some medications require fasting for proper absorption.",
  },
  {
    question: "How do you ask 'Are you currently taking any medications?'",
    options: ['¿Toma vitaminas?', '¿Toma actualmente algún medicamento?', '¿Tiene receta médica?', '¿Compra medicamentos sin receta?'],
    correctIndex: 1,
    explanation: "'¿Toma actualmente algún medicamento?' is essential to prevent dangerous drug interactions.",
  },
  {
    question: "Which phrase means 'Do not drive after taking this medication'?",
    options: ['No tome alcohol con este medicamento', 'No maneje después de tomar este medicamento', 'No tome este medicamento con comida', 'No suspenda este medicamento sin consultar'],
    correctIndex: 1,
    explanation: "'No maneje después de tomar este medicamento' is required for sedating medications and narcotics.",
  },
  {
    question: '"Efectos secundarios" means:',
    options: ['Dosage instructions', 'Drug interactions', 'Side effects', 'Prescription refills'],
    correctIndex: 2,
    explanation: "'Efectos secundarios' = side effects. Patients must understand what to watch for after starting new medications.",
  },
  {
    question: "How do you say 'Take this medication with food'?",
    options: ['Tome este medicamento en ayunas', 'Tome este medicamento con agua', 'Tome este medicamento con comida', 'Tome este medicamento antes de dormir'],
    correctIndex: 2,
    explanation: "'Con comida' = with food. Certain medications cause nausea or stomach irritation when taken without food.",
  },
  {
    question: "Which phrase means 'This prescription needs to be refilled'?",
    options: ['Esta receta está vencida', 'Esta receta necesita renovarse', 'Esta receta es genérica', 'Esta receta es nueva'],
    correctIndex: 1,
    explanation: "'Esta receta necesita renovarse' communicates a refill need — critical for chronic medication management.",
  },
  {
    question: '"No mezcle con alcohol" means:',
    options: ['Take with juice', 'Do not take on empty stomach', 'Do not mix with alcohol', 'Avoid dairy products'],
    correctIndex: 2,
    explanation: "'No mezcle con alcohol' is a vital safety warning for antibiotics, blood thinners, and many other drugs.",
  },
  {
    question: "How do you ask 'Do you have any drug allergies?'",
    options: ['¿Toma medicamentos naturales?', '¿Tiene alergia a algún medicamento?', '¿Cuántos medicamentos toma?', '¿Dónde compra sus medicamentos?'],
    correctIndex: 1,
    explanation: "'¿Tiene alergia a algún medicamento?' must be asked before prescribing or administering any medication.",
  },
  {
    question: "How do you say 'Finish all of the medication'?",
    options: ['Guarde el medicamento sobrante', 'Tome el medicamento solo cuando tenga dolor', 'Termine todo el medicamento', 'Divida el medicamento por la mitad'],
    correctIndex: 2,
    explanation: "'Termine todo el medicamento' is critical for antibiotic courses to prevent resistance and treatment failure.",
  },
];

const healthcareModule4Questions: QuizQuestion[] = [
  {
    question: "How do you say 'We need your signature here'?",
    options: ['Necesitamos su seguro aquí', 'Necesitamos su firma aquí', 'Necesitamos su identificación aquí', 'Necesitamos su dirección aquí'],
    correctIndex: 1,
    explanation: "'Firma' = signature. Obtaining proper consent signatures is a legal requirement before procedures.",
  },
  {
    question: '"Consentimiento informado" means:',
    options: ['Medical history form', 'Insurance authorization', 'Informed consent', 'Discharge summary'],
    correctIndex: 2,
    explanation: "'Consentimiento informado' = informed consent. Patients must understand and agree to treatment before it begins.",
  },
  {
    question: "How do you ask 'Do you understand the procedure?'",
    options: ['¿Tiene preguntas sobre el seguro?', '¿Entiende el procedimiento?', '¿Conoce al médico?', '¿Ha tenido este procedimiento antes?'],
    correctIndex: 1,
    explanation: "'¿Entiende el procedimiento?' confirms patient comprehension — required for valid informed consent.",
  },
  {
    question: "Which phrase means 'You have the right to refuse treatment'?",
    options: ['Usted tiene que firmar este formulario', 'Usted tiene derecho a rechazar el tratamiento', 'Usted necesita una segunda opinión', 'Usted debe seguir las instrucciones del médico'],
    correctIndex: 1,
    explanation: "Patients must be informed of their right to refuse treatment — a fundamental patient rights principle.",
  },
  {
    question: '"Anestesia local" means:',
    options: ['General anesthesia', 'Local anesthesia', 'Sedation', 'Pain medication'],
    correctIndex: 1,
    explanation: "'Anestesia local' = local anesthesia. Clarifying anesthesia type reduces patient anxiety before procedures.",
  },
  {
    question: "How do you say 'This procedure takes about 30 minutes'?",
    options: ['Este procedimiento es muy sencillo', 'Este procedimiento tarda unos 30 minutos', 'Este procedimiento requiere hospitalización', 'Este procedimiento se hace mañana'],
    correctIndex: 1,
    explanation: "Setting time expectations with 'tarda unos 30 minutos' reduces patient anxiety and aids scheduling.",
  },
  {
    question: "Which phrase asks 'Do you have any questions before we begin?'",
    options: ['¿Está listo para empezar?', '¿Tiene preguntas antes de comenzar?', '¿Ha comido hoy?', '¿Trajo a alguien con usted?'],
    correctIndex: 1,
    explanation: "Inviting questions before a procedure ensures understanding and strengthens the consent process.",
  },
  {
    question: '"Riesgos y beneficios" means:',
    options: ['Rights and responsibilities', 'Risks and benefits', 'Rules and regulations', 'Results and recommendations'],
    correctIndex: 1,
    explanation: "'Riesgos y beneficios' = risks and benefits. Explaining both is a core component of informed consent.",
  },
  {
    question: "How do you say 'Please fast after midnight'?",
    options: ['Por favor, no beba agua después de medianoche', 'Por favor, no coma ni beba después de medianoche', 'Por favor, tome sus medicamentos a medianoche', 'Por favor, llegue antes de medianoche'],
    correctIndex: 1,
    explanation: "'No coma ni beba' (do not eat or drink) covers both food and liquids — critical pre-surgical instruction.",
  },
  {
    question: "How do you ask 'Is there someone who can make decisions for you?'",
    options: ['¿Tiene médico de cabecera?', '¿Hay alguien que pueda tomar decisiones por usted?', '¿Tiene poder notarial médico?', '¿Tiene seguro de vida?'],
    correctIndex: 1,
    explanation: "Identifying a surrogate decision-maker is essential when a patient cannot consent for themselves.",
  },
];

const healthcareModule5Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Your follow-up appointment is in two weeks'?",
    options: ['Su cita de seguimiento es mañana', 'Su cita de seguimiento es en dos semanas', 'Su cita de seguimiento es en dos meses', 'Su cita de seguimiento fue cancelada'],
    correctIndex: 1,
    explanation: "'En dos semanas' = in two weeks. Clear follow-up timing improves patient compliance and outcomes.",
  },
  {
    question: '"Instrucciones de alta" means:',
    options: ['Emergency instructions', 'Discharge instructions', 'Admission instructions', 'Prescription instructions'],
    correctIndex: 1,
    explanation: "'Alta' = discharge. Providing written discharge instructions reduces readmission rates significantly.",
  },
  {
    question: "How do you say 'Call us if you have a fever above 101°F'?",
    options: ['Regrese si el dolor empeora', 'Llámenos si tiene fiebre de más de 101°F', 'Tome ibuprofeno si tiene fiebre', 'Vaya a urgencias si tiene náuseas'],
    correctIndex: 1,
    explanation: "'Llámenos' = call us. Giving patients specific fever thresholds helps them know when to seek care.",
  },
  {
    question: "Which phrase means 'Do not lift anything heavy for two weeks'?",
    options: ['No maneje por dos semanas', 'No levante objetos pesados por dos semanas', 'No trabaje por dos semanas', 'No haga ejercicio por dos semanas'],
    correctIndex: 1,
    explanation: "'No levante objetos pesados' = do not lift heavy objects. Activity restrictions prevent post-procedure complications.",
  },
  {
    question: '"Señales de advertencia" means:',
    options: ['Medication instructions', 'Follow-up schedule', 'Warning signs', 'Dietary restrictions'],
    correctIndex: 2,
    explanation: "'Señales de advertencia' = warning signs. Patients need to recognize when symptoms require immediate attention.",
  },
  {
    question: "How do you ask 'Do you have a way to get home?'",
    options: ['¿Tiene seguro para el transporte?', '¿Tiene cómo llegar a casa?', '¿Vive lejos del hospital?', '¿Necesita una ambulancia?'],
    correctIndex: 1,
    explanation: "'¿Tiene cómo llegar a casa?' ensures safe discharge — patients cannot drive themselves after many procedures.",
  },
  {
    question: "Which phrase means 'Keep the wound clean and dry'?",
    options: ['Cambie el vendaje todos los días', 'Mantenga la herida limpia y seca', 'Cubra la herida con hielo', 'Aplique crema en la herida'],
    correctIndex: 1,
    explanation: "'Limpia y seca' = clean and dry. Proper wound care instructions prevent post-surgical infection.",
  },
  {
    question: '"Cita de seguimiento" means:',
    options: ['Emergency visit', 'Initial appointment', 'Follow-up appointment', 'Specialist referral'],
    correctIndex: 2,
    explanation: "'Cita de seguimiento' = follow-up appointment. Scheduling follow-ups at discharge improves continuity of care.",
  },
  {
    question: "How do you say 'Go to the emergency room if symptoms worsen'?",
    options: ['Llame a su médico si tiene preguntas', 'Vaya a urgencias si los síntomas empeoran', 'Regrese a la clínica mañana por la mañana', 'Tome más medicamento si tiene dolor'],
    correctIndex: 1,
    explanation: "'Vaya a urgencias' = go to the emergency room. Patients must know when escalation to emergency care is necessary.",
  },
  {
    question: "How do you say 'Here are your discharge papers'?",
    options: ['Aquí están sus resultados de laboratorio', 'Aquí están sus papeles de alta', 'Aquí está su receta médica', 'Aquí está su factura del hospital'],
    correctIndex: 1,
    explanation: "'Papeles de alta' = discharge papers. Handing over documentation ensures patients have instructions to reference at home.",
  },
];

const educationQuestions: QuizQuestion[] = [
  {
    question: "How do you say 'Welcome to our school' in Spanish?",
    options: ['Gracias por venir hoy', 'Bienvenido a nuestra escuela', 'Por favor, tome asiento', 'Necesitamos su firma aquí'],
    correctIndex: 1,
    explanation: "'Bienvenido a nuestra escuela' is the standard welcoming phrase used when greeting new families at enrollment.",
  },
  {
    question: "Which phrase asks 'How old is your child?'",
    options: ['¿Cómo se llama su hijo?', '¿En qué grado está su hijo?', '¿Cuántos años tiene su hijo?', '¿Dónde vive su hijo?'],
    correctIndex: 2,
    explanation: "'¿Cuántos años tiene su hijo?' = How old is your child? Age determines grade placement during enrollment.",
  },
  {
    question: '"Registración escolar" means:',
    options: ['School report card', 'School enrollment', 'School schedule', 'School supplies'],
    correctIndex: 1,
    explanation: "'Registración escolar' = school enrollment. Families must complete this process before a child can begin attending.",
  },
  {
    question: "How do you ask 'Does your child have any special needs?'",
    options: ['¿Su hijo tiene hermanos en esta escuela?', '¿Su hijo tiene necesidades especiales?', '¿Su hijo ha estado en otra escuela?', '¿Su hijo habla inglés?'],
    correctIndex: 1,
    explanation: "'¿Tiene necesidades especiales?' identifies students who may require IEP or 504 accommodations at enrollment.",
  },
  {
    question: "Which phrase means 'Please bring proof of address'?",
    options: ['Por favor, traiga el acta de nacimiento', 'Por favor, traiga las vacunas del niño', 'Por favor, traiga comprobante de domicilio', 'Por favor, traiga el pasaporte del niño'],
    correctIndex: 2,
    explanation: "'Comprobante de domicilio' = proof of address. Schools require this to verify residency for enrollment.",
  },
  {
    question: '"Certificado de vacunación" means:',
    options: ['Birth certificate', 'Report card', 'Immunization record', 'Transcript'],
    correctIndex: 2,
    explanation: "'Certificado de vacunación' = immunization record. Up-to-date vaccines are required before a child can enroll.",
  },
  {
    question: "How do you say 'School starts at 8 AM'?",
    options: ['La escuela termina a las 3 de la tarde', 'La escuela empieza a las 8 de la mañana', 'La escuela está cerrada los lunes', 'La escuela tiene dos turnos'],
    correctIndex: 1,
    explanation: "'Empieza a las 8 de la mañana' = starts at 8 AM. Families need clear schedule information to ensure timely arrival.",
  },
  {
    question: "Which phrase asks 'What language does your child speak at home?'",
    options: ['¿Su hijo habla con sus amigos en inglés?', '¿Qué idioma habla su hijo en casa?', '¿Su hijo necesita clases de inglés?', '¿Su hijo estudia otro idioma?'],
    correctIndex: 1,
    explanation: "'¿Qué idioma habla su hijo en casa?' is the home language survey question required for ELL identification under federal law.",
  },
  {
    question: '"Formulario de emergencia" means:',
    options: ['Permission slip', 'Emergency contact form', 'Enrollment application', 'Report card'],
    correctIndex: 1,
    explanation: "'Formulario de emergencia' = emergency contact form. Schools must have current contact info for every enrolled student.",
  },
  {
    question: "How do you ask 'Who has permission to pick up your child?'",
    options: ['¿Quién trae a su hijo a la escuela?', '¿Quién tiene permiso de recoger a su hijo?', '¿Su hijo camina a la escuela?', '¿Su hijo come en la escuela?'],
    correctIndex: 1,
    explanation: "'¿Quién tiene permiso de recoger a su hijo?' ensures only authorized adults can collect a child — a critical safety requirement.",
  },
];

const educationModule2Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Your child is doing very well in class'?",
    options: ['Su hijo necesita mejorar en clase', 'Su hijo se porta muy bien en clase', 'Su hijo está progresando muy bien en clase', 'Su hijo falta mucho a clase'],
    correctIndex: 2,
    explanation: "'Está progresando muy bien' = is doing very well / progressing well. This is positive feedback about academic performance.",
  },
  {
    question: '"Calificaciones" means:',
    options: ['Attendance', 'Behavior', 'Grades', 'Homework'],
    correctIndex: 2,
    explanation: "'Calificaciones' = grades. During parent-teacher conferences, reviewing grades is a primary agenda item.",
  },
  {
    question: "How do you ask 'Does your child do homework at home?'",
    options: ['¿Su hijo tiene libros en casa?', '¿Su hijo hace la tarea en casa?', '¿Su hijo estudia con amigos?', '¿Su hijo necesita ayuda con la tarea?'],
    correctIndex: 1,
    explanation: "'¿Hace la tarea en casa?' = Does your child do homework at home? This helps identify if support is needed at home.",
  },
  {
    question: "Which phrase means 'Your child needs extra help in reading'?",
    options: ['Su hijo lee muy bien', 'Su hijo necesita ayuda adicional en lectura', 'Su hijo lee en dos idiomas', 'Su hijo no le gusta leer'],
    correctIndex: 1,
    explanation: "'Necesita ayuda adicional en lectura' = needs extra help in reading. Communicating this clearly helps families support literacy at home.",
  },
  {
    question: '"Asistencia" in a school context means:',
    options: ['Teacher assistance', 'Homework help', 'Attendance', 'Academic support'],
    correctIndex: 2,
    explanation: "'Asistencia' = attendance. Regular attendance directly impacts student learning and is tracked by every school.",
  },
  {
    question: "How do you say 'We are concerned about your child's progress'?",
    options: ['Estamos contentos con el progreso de su hijo', 'Estamos preocupados por el progreso de su hijo', 'Estamos sorprendidos por su hijo', 'Estamos esperando mejoras de su hijo'],
    correctIndex: 1,
    explanation: "'Estamos preocupados' = we are concerned. Expressing concern clearly — without alarm — opens a productive conversation with families.",
  },
  {
    question: "Which phrase asks 'Does your child mention school at home?'",
    options: ['¿Su hijo tiene amigos en la escuela?', '¿Su hijo habla de la escuela en casa?', '¿Su hijo quiere cambiar de escuela?', '¿Su hijo prefiere quedarse en casa?'],
    correctIndex: 1,
    explanation: "'¿Habla de la escuela en casa?' gauges how connected a child feels to school, which is an indicator of engagement and well-being.",
  },
  {
    question: '"Comportamiento en clase" means:',
    options: ['Academic performance', 'Classroom behavior', 'Learning style', 'Social skills'],
    correctIndex: 1,
    explanation: "'Comportamiento en clase' = classroom behavior. This is a standard conference topic alongside grades and attendance.",
  },
  {
    question: "How do you say 'I would like to schedule another meeting'?",
    options: ['Esta fue nuestra última reunión', 'Me gustaría programar otra reunión', 'No necesitamos otra reunión', 'La próxima reunión es obligatoria'],
    correctIndex: 1,
    explanation: "'Me gustaría programar otra reunión' = I would like to schedule another meeting. Follow-up meetings ensure continued communication with families.",
  },
  {
    question: "How do you ask 'Do you have any questions or concerns?'",
    options: ['¿Tiene tiempo para hablar ahora?', '¿Tiene preguntas o inquietudes?', '¿Tiene el reporte de calificaciones?', '¿Tiene acceso al portal de padres?'],
    correctIndex: 1,
    explanation: "'¿Tiene preguntas o inquietudes?' invites families to voice concerns, ensuring the conference is a two-way conversation.",
  },
];

const educationModule3Questions: QuizQuestion[] = [
  {
    question: '"IEP" stands for:',
    options: ['Individual Education Program', 'Integrated English Program', 'Independent Evaluation Process', 'Instructional Enrichment Plan'],
    correctIndex: 0,
    explanation: "IEP = Individualized Education Program. It is a legally binding document outlining services and goals for students with disabilities.",
  },
  {
    question: "How do you say 'Your child qualifies for special services'?",
    options: ['Su hijo no necesita servicios especiales', 'Su hijo califica para servicios especiales', 'Su hijo ya recibe servicios especiales', 'Su hijo será evaluado para servicios'],
    correctIndex: 1,
    explanation: "'Califica para servicios especiales' = qualifies for special services. This is a key message that opens the door to IEP planning.",
  },
  {
    question: "Which phrase means 'We will evaluate your child'?",
    options: ['Vamos a ayudar a su hijo en clase', 'Vamos a evaluar a su hijo', 'Vamos a cambiar a su hijo de clase', 'Vamos a hablar con su hijo'],
    correctIndex: 1,
    explanation: "'Vamos a evaluar a su hijo' = We will evaluate your child. Families must be informed before any formal assessment begins.",
  },
  {
    question: '"Adaptaciones" in special education means:',
    options: ['Evaluations', 'Accommodations', 'Goals', 'Services'],
    correctIndex: 1,
    explanation: "'Adaptaciones' = accommodations. These are adjustments made to support a student's access to learning without changing the curriculum.",
  },
  {
    question: "How do you say 'You have the right to attend all IEP meetings'?",
    options: ['Usted debe asistir a todas las reuniones del IEP', 'Usted tiene derecho a asistir a todas las reuniones del IEP', 'Usted puede asistir a algunas reuniones del IEP', 'Usted será informado de las reuniones del IEP'],
    correctIndex: 1,
    explanation: "'Usted tiene derecho' = you have the right. Parental participation in IEP meetings is a legal protection under IDEA.",
  },
  {
    question: "Which phrase asks 'Do you agree with this plan?'",
    options: ['¿Entiende este plan?', '¿Tiene preguntas sobre este plan?', '¿Está de acuerdo con este plan?', '¿Ha visto este plan antes?'],
    correctIndex: 2,
    explanation: "'¿Está de acuerdo con este plan?' = Do you agree with this plan? Parental consent is required before implementing an IEP.",
  },
  {
    question: '"Terapia del habla" means:',
    options: ['Physical therapy', 'Occupational therapy', 'Speech therapy', 'Behavioral therapy'],
    correctIndex: 2,
    explanation: "'Terapia del habla' = speech therapy. It is one of the most common related services provided under an IEP.",
  },
  {
    question: "How do you say 'Your signature is required to proceed'?",
    options: ['Su firma es opcional', 'Su firma es requerida para continuar', 'Su firma fue recibida', 'Su firma no es necesaria hoy'],
    correctIndex: 1,
    explanation: "'Su firma es requerida para continuar' = Your signature is required to proceed. Written parental consent is legally required before services begin.",
  },
  {
    question: "Which phrase means 'Your child will be reassessed annually'?",
    options: ['Su hijo fue evaluado el año pasado', 'Su hijo será reevaluado anualmente', 'Su hijo no necesita más evaluaciones', 'Su hijo será evaluado en dos años'],
    correctIndex: 1,
    explanation: "'Será reevaluado anualmente' = will be reassessed annually. Annual reviews ensure IEP goals remain appropriate as the student progresses.",
  },
  {
    question: "How do you ask 'Do you want an interpreter at the next meeting?'",
    options: ['¿Habla inglés bien?', '¿Necesita un intérprete en la próxima reunión?', '¿Prefiere reuniones en español?', '¿Trae a alguien que traduzca?'],
    correctIndex: 1,
    explanation: "'¿Necesita un intérprete?' = Do you need an interpreter? Schools are required to provide language access so families can meaningfully participate in IEP meetings.",
  },
];

const educationModule4Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Your child was involved in an incident today'?",
    options: ['Su hijo tuvo un buen día hoy', 'Su hijo estuvo involucrado en un incidente hoy', 'Su hijo faltó a clase hoy', 'Su hijo llegó tarde hoy'],
    correctIndex: 1,
    explanation: "'Involucrado en un incidente' = involved in an incident. Clear, factual language helps families understand what occurred without escalating emotions.",
  },
  {
    question: '"Suspensión" in a school context means:',
    options: ['Expulsion', 'Detention', 'Suspension', 'Warning'],
    correctIndex: 2,
    explanation: "'Suspensión' = suspension. It is a temporary removal from school, distinct from expulsion which is permanent.",
  },
  {
    question: "How do you ask 'Can you come to school to discuss this?'",
    options: ['¿Puede llamar a la escuela?', '¿Puede venir a la escuela a hablar sobre esto?', '¿Puede enviar un correo electrónico?', '¿Puede hablar con su hijo sobre esto?'],
    correctIndex: 1,
    explanation: "'¿Puede venir a la escuela a hablar sobre esto?' invites in-person dialogue, which is most effective for serious behavioral concerns.",
  },
  {
    question: "Which phrase means 'This behavior cannot be tolerated'?",
    options: ['Este comportamiento es inusual', 'Este comportamiento no puede tolerarse', 'Este comportamiento será monitoreado', 'Este comportamiento debe mejorar'],
    correctIndex: 1,
    explanation: "'No puede tolerarse' = cannot be tolerated. Setting clear expectations communicates that standards apply equally to all students.",
  },
  {
    question: '"Código de conducta" means:',
    options: ['Report card', 'Code of conduct', 'Dress code', 'Honor code'],
    correctIndex: 1,
    explanation: "'Código de conducta' = code of conduct. Families should receive and understand this document at the start of each school year.",
  },
  {
    question: "How do you say 'Your child has been bullying other students'?",
    options: ['Su hijo ha sido víctima de acoso escolar', 'Su hijo ha estado acosando a otros estudiantes', 'Su hijo reportó un caso de acoso', 'Su hijo presenció un caso de acoso'],
    correctIndex: 1,
    explanation: "'Acosando a otros estudiantes' = bullying other students. This phrasing is direct and distinguishes the child as the one causing harm, not experiencing it.",
  },
  {
    question: "Which phrase asks 'Is everything okay at home?'",
    options: ['¿Su hijo tiene problemas con sus amigos?', '¿Todo está bien en casa?', '¿Su hijo ha cambiado de comportamiento?', '¿Su hijo necesita apoyo emocional?'],
    correctIndex: 1,
    explanation: "'¿Todo está bien en casa?' shows empathy and opens space for families to share context that may be influencing behavior at school.",
  },
  {
    question: '"Consecuencias" in a school discipline context means:',
    options: ['Counseling sessions', 'Parent notifications', 'Consequences', 'Interventions'],
    correctIndex: 2,
    explanation: "'Consecuencias' = consequences. Explaining consequences clearly ensures families understand the school's response to behavior.",
  },
  {
    question: "How do you say 'We want to support your child, not punish them'?",
    options: ['Su hijo recibirá una suspensión', 'Queremos apoyar a su hijo, no castigarlo', 'Su hijo debe cambiar de escuela', 'Su hijo necesita disciplina más estricta'],
    correctIndex: 1,
    explanation: "'Queremos apoyar a su hijo, no castigarlo' reframes discipline conversations as collaborative. It builds trust and encourages family partnership.",
  },
  {
    question: "How do you ask 'What can we do together to help your child?'",
    options: ['¿Qué ha intentado usted en casa?', '¿Qué podemos hacer juntos para ayudar a su hijo?', '¿Qué dice su hijo que pasó?', '¿Qué espera usted de la escuela?'],
    correctIndex: 1,
    explanation: "'¿Qué podemos hacer juntos?' = What can we do together? This collaborative language positions the school and family as partners in the child's success.",
  },
];

const educationModule5Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Congratulations on your graduation'?",
    options: ['Buena suerte en la universidad', 'Felicitaciones por su graduación', 'Estamos orgullosos de su esfuerzo', 'Ha sido un placer tenerlo en nuestra escuela'],
    correctIndex: 1,
    explanation: "'Felicitaciones por su graduación' = Congratulations on your graduation. Celebratory language acknowledges the student's achievement and strengthens the family-school relationship.",
  },
  {
    question: '"Transcripción oficial" means:',
    options: ['Diploma', 'Official transcript', 'Graduation program', 'Class schedule'],
    correctIndex: 1,
    explanation: "'Transcripción oficial' = official transcript. This document is required for college applications, employment verification, and transfer credits.",
  },
  {
    question: "How do you ask 'What are your plans after graduation?'",
    options: ['¿Cuándo se gradúa?', '¿Cuáles son sus planes después de graduarse?', '¿Tiene trabajo después de la escuela?', '¿Va a continuar sus estudios?'],
    correctIndex: 1,
    explanation: "'¿Cuáles son sus planes después de graduarse?' opens an open-ended conversation about post-secondary goals, covering college, career, and trade paths.",
  },
  {
    question: "Which phrase means 'You need these credits to graduate'?",
    options: ['Ya tiene suficientes créditos para graduarse', 'Necesita estos créditos para graduarse', 'Le faltan muchos créditos para graduarse', 'Sus créditos han sido transferidos'],
    correctIndex: 1,
    explanation: "'Necesita estos créditos para graduarse' clearly identifies graduation requirements, helping families support their student in meeting them on time.",
  },
  {
    question: '"Solicitud de admisión universitaria" means:',
    options: ['Financial aid application', 'College admission application', 'Scholarship application', 'Transfer application'],
    correctIndex: 1,
    explanation: "'Solicitud de admisión universitaria' = college admission application. Guiding families through this process increases access for first-generation college students.",
  },
  {
    question: "How do you say 'Financial aid is available'?",
    options: ['La universidad es muy cara', 'Hay ayuda financiera disponible', 'Debe solicitar becas pronto', 'Los préstamos estudiantiles tienen interés'],
    correctIndex: 1,
    explanation: "'Hay ayuda financiera disponible' = Financial aid is available. Many immigrant families are unaware of FAFSA and other aid options — this phrase opens that door.",
  },
  {
    question: "Which phrase asks 'Do you need help with your college applications?'",
    options: ['¿Ya eligió su universidad?', '¿Necesita ayuda con sus solicitudes universitarias?', '¿Sabe cuánto cuesta la universidad?', '¿Tiene cartas de recomendación?'],
    correctIndex: 1,
    explanation: "'¿Necesita ayuda con sus solicitudes universitarias?' proactively offers support, which is critical for students without family experience navigating college admissions.",
  },
  {
    question: '"Consejero académico" means:',
    options: ['Classroom teacher', 'School principal', 'Academic counselor', 'Special education coordinator'],
    correctIndex: 2,
    explanation: "'Consejero académico' = academic counselor. Families should know this person is a key resource for course planning, transcripts, and post-secondary guidance.",
  },
  {
    question: "How do you say 'Your diploma will be mailed to your address'?",
    options: ['Su diploma estará listo en una semana', 'Su diploma será enviado a su dirección', 'Su diploma debe ser recogido en la escuela', 'Su diploma está en la oficina principal'],
    correctIndex: 1,
    explanation: "'Su diploma será enviado a su dirección' = Your diploma will be mailed to your address. Clear logistics prevent families from missing this important document.",
  },
  {
    question: "How do you ask 'Is there anything else I can help you with?'",
    options: ['¿Tiene más preguntas sobre los requisitos?', '¿Hay algo más en lo que pueda ayudarle?', '¿Necesita información sobre otras escuelas?', '¿Quiere hablar con el director?'],
    correctIndex: 1,
    explanation: "'¿Hay algo más en lo que pueda ayudarle?' = Is there anything else I can help you with? Closing conversations this way signals openness and reinforces trust with families.",
  },
];

const constructionQuestions: QuizQuestion[] = [
  {
    question: "How do you say 'Hard hat required in this area'?",
    options: ['Guantes requeridos en esta área', 'Casco requerido en esta área', 'Botas requeridas en esta área', 'Lentes requeridos en esta área'],
    correctIndex: 1,
    explanation: "'Casco requerido en esta área' = Hard hat required in this area. Head protection is the first line of defense against falling objects and overhead hazards on any job site.",
  },
  {
    question: '"Zona de peligro" means:',
    options: ['Safety zone', 'Work zone', 'Danger zone', 'Restricted zone'],
    correctIndex: 2,
    explanation: "'Zona de peligro' = danger zone. Recognizing this term helps workers identify and avoid areas with elevated risk of injury.",
  },
  {
    question: "How do you say 'Do not enter without authorization'?",
    options: ['Entre con cuidado', 'No entre sin autorización', 'Entre por la puerta trasera', 'Entre solo con supervisor'],
    correctIndex: 1,
    explanation: "'No entre sin autorización' controls access to restricted areas, reducing risk of injury to untrained personnel and protecting site liability.",
  },
  {
    question: "Which phrase means 'Watch your step'?",
    options: ['Cuidado con su cabeza', 'Cuidado con sus manos', 'Cuidado con el paso', 'Cuidado con el cable'],
    correctIndex: 2,
    explanation: "'Cuidado con el paso' = Watch your step. Slip and fall hazards are among the most common causes of construction injuries.",
  },
  {
    question: '"Salida de emergencia" means:',
    options: ['Safety meeting', 'Emergency exit', 'First aid station', 'Assembly point'],
    correctIndex: 1,
    explanation: "'Salida de emergencia' = emergency exit. All workers must know where exits are located before beginning any shift.",
  },
  {
    question: "How do you ask 'Have you completed safety training?'",
    options: ['¿Tiene experiencia en construcción?', '¿Ha completado el entrenamiento de seguridad?', '¿Conoce las reglas del trabajo?', '¿Ha trabajado en este tipo de proyecto?'],
    correctIndex: 1,
    explanation: "'¿Ha completado el entrenamiento de seguridad?' = Have you completed safety training? Verifying training before high-risk tasks is a legal requirement under OSHA standards.",
  },
  {
    question: "Which phrase means 'Report all injuries immediately'?",
    options: ['Evite lesiones en el trabajo', 'Reporte todas las lesiones inmediatamente', 'Documente todas las lesiones al final del día', 'Informe lesiones solo si son graves'],
    correctIndex: 1,
    explanation: "'Reporte todas las lesiones inmediatamente' = Report all injuries immediately. Prompt reporting enables proper medical care and preserves workers' compensation rights.",
  },
  {
    question: '"Extintor de incendios" means:',
    options: ['Fire alarm', 'Smoke detector', 'Fire extinguisher', 'Sprinkler system'],
    correctIndex: 2,
    explanation: "'Extintor de incendios' = fire extinguisher. Workers must be able to locate and identify fire suppression equipment as part of basic fire safety.",
  },
  {
    question: "How do you say 'Keep this area clean and organized'?",
    options: ['Trabaje despacio en esta área', 'Mantenga esta área limpia y organizada', 'No trabaje solo en esta área', 'Inspeccione esta área diariamente'],
    correctIndex: 1,
    explanation: "'Mantenga esta área limpia y organizada' = Keep this area clean and organized. Clutter and debris are leading causes of slips, trips, and falls on construction sites.",
  },
  {
    question: "How do you ask 'Do you know where the first aid kit is?'",
    options: ['¿Sabe dónde está el baño?', '¿Sabe dónde está el botiquín de primeros auxilios?', '¿Sabe dónde está la salida?', '¿Sabe dónde está el supervisor?'],
    correctIndex: 1,
    explanation: "'¿Sabe dónde está el botiquín de primeros auxilios?' = Do you know where the first aid kit is? Every worker should be able to locate first aid supplies before starting their shift.",
  },
];

const ppeQuestions: QuizQuestion[] = [
  {
    question: '"Equipo de protección personal" means:',
    options: ['Power tools', 'Safety training', 'Personal protective equipment', 'Work uniform'],
    correctIndex: 2,
    explanation: "'Equipo de protección personal' = personal protective equipment (PPE). This umbrella term covers all gear worn to minimize exposure to hazards on the job site.",
  },
  {
    question: "How do you say 'You must wear safety glasses'?",
    options: ['Se recomienda usar lentes de seguridad', 'Debe usar lentes de seguridad', 'Puede usar lentes de seguridad', 'Los lentes de seguridad son opcionales'],
    correctIndex: 1,
    explanation: "'Debe usar lentes de seguridad' = You must wear safety glasses. Eye injuries are among the most preventable on construction sites when proper protection is enforced.",
  },
  {
    question: "Which phrase means 'Your harness must be properly secured'?",
    options: ['Su arnés debe estar disponible siempre', 'Su arnés debe estar bien asegurado', 'Su arnés debe ser inspeccionado mensualmente', 'Su arnés debe ser reemplazado anualmente'],
    correctIndex: 1,
    explanation: "'Su arnés debe estar bien asegurado' = Your harness must be properly secured. An improperly secured harness provides no fall protection and creates a false sense of safety.",
  },
  {
    question: '"Guantes resistentes a cortes" means:',
    options: ['Heat-resistant gloves', 'Cut-resistant gloves', 'Waterproof gloves', 'Chemical-resistant gloves'],
    correctIndex: 1,
    explanation: "'Guantes resistentes a cortes' = cut-resistant gloves. Hand lacerations are one of the most frequent construction injuries; the right glove type is critical.",
  },
  {
    question: "How do you ask 'Is your equipment inspected before each use?'",
    options: ['¿Su equipo es nuevo?', '¿Su equipo es inspeccionado antes de cada uso?', '¿Su equipo está asegurado?', '¿Su equipo tiene garantía?'],
    correctIndex: 1,
    explanation: "'¿Su equipo es inspeccionado antes de cada uso?' = Is your equipment inspected before each use? Pre-use inspections catch defects before they cause injuries or fatalities.",
  },
  {
    question: "Which phrase means 'Damaged equipment must be removed from service'?",
    options: ['El equipo dañado debe ser reparado pronto', 'El equipo dañado debe ser retirado del servicio', 'El equipo dañado puede usarse con cuidado', 'El equipo dañado debe ser reportado mensualmente'],
    correctIndex: 1,
    explanation: "'El equipo dañado debe ser retirado del servicio' = Damaged equipment must be removed from service. Using compromised PPE can be more dangerous than using none at all.",
  },
  {
    question: '"Protección auditiva" means:',
    options: ['Eye protection', 'Head protection', 'Hearing protection', 'Foot protection'],
    correctIndex: 2,
    explanation: "'Protección auditiva' = hearing protection. Prolonged noise exposure above 85 dB causes permanent hearing loss — earplugs and earmuffs are essential in loud environments.",
  },
  {
    question: "How do you say 'Wear steel-toed boots on this site'?",
    options: ['Use botas cómodas en esta obra', 'Use botas con punta de acero en esta obra', 'Use botas impermeables en esta obra', 'Use botas altas en esta obra'],
    correctIndex: 1,
    explanation: "'Use botas con punta de acero en esta obra' = Wear steel-toed boots on this site. Steel-toed footwear protects against crushing injuries from falling objects and heavy equipment.",
  },
  {
    question: "Which phrase asks 'Do you need replacement equipment?'",
    options: ['¿Su equipo está guardado correctamente?', '¿Necesita equipo de reemplazo?', '¿Su equipo fue aprobado?', '¿Dónde guarda su equipo?'],
    correctIndex: 1,
    explanation: "'¿Necesita equipo de reemplazo?' = Do you need replacement equipment? Workers should never continue using worn or broken PPE; replacement must be immediate.",
  },
  {
    question: "How do you say 'Never operate equipment without proper training'?",
    options: ['Nunca use equipo sin supervisión', 'Nunca opere equipo sin el entrenamiento adecuado', 'Nunca preste su equipo a otros', 'Nunca use equipo en condiciones húmedas'],
    correctIndex: 1,
    explanation: "'Nunca opere equipo sin el entrenamiento adecuado' = Never operate equipment without proper training. Untrained equipment operation is a leading cause of serious and fatal construction accidents.",
  },
];

const hazardCommQuestions: QuizQuestion[] = [
  {
    question: '"Hoja de datos de seguridad" means:',
    options: ['Work order', 'Safety data sheet', 'Inspection report', 'Incident form'],
    correctIndex: 1,
    explanation: "'Hoja de datos de seguridad' = safety data sheet (SDS). SDS documents provide critical information about chemical hazards, handling, storage, and emergency response procedures.",
  },
  {
    question: "How do you say 'This chemical is hazardous'?",
    options: ['Este químico es inflamable', 'Este químico es peligroso', 'Este químico es tóxico', 'Este químico es corrosivo'],
    correctIndex: 1,
    explanation: "'Este químico es peligroso' = This chemical is hazardous. 'Peligroso' is the general term for dangerous/hazardous, while other options describe specific hazard types (flammable, toxic, corrosive).",
  },
  {
    question: "Which phrase means 'Read the label before using any chemical'?",
    options: ['Guarde los químicos en lugar seguro', 'Lea la etiqueta antes de usar cualquier químico', 'Pida ayuda antes de usar químicos', 'Evite contacto con químicos desconocidos'],
    correctIndex: 1,
    explanation: "'Lea la etiqueta antes de usar cualquier químico' = Read the label before using any chemical. Chemical labels contain hazard warnings, PPE requirements, and first aid instructions that must be reviewed before use.",
  },
  {
    question: '"Señal de advertencia" means:',
    options: ['Exit sign', 'No entry sign', 'Warning sign', 'Informational sign'],
    correctIndex: 2,
    explanation: "'Señal de advertencia' = warning sign. Warning signs alert workers to potential hazards in an area and are a key component of hazard communication systems on job sites.",
  },
  {
    question: "How do you ask 'Are there any hazardous materials in this area?'",
    options: ['¿Hay materiales peligrosos en esta área?', '¿Hay químicos almacenados aquí?', '¿Se usan químicos en este proyecto?', '¿Hay restricciones en esta área?'],
    correctIndex: 0,
    explanation: "'¿Hay materiales peligrosos en esta área?' = Are there any hazardous materials in this area? Always ask this before starting work in an unfamiliar space to identify chemical exposure risks.",
  },
  {
    question: '"Ventilación adecuada" means:',
    options: ['Proper lighting', 'Proper ventilation', 'Proper drainage', 'Proper temperature'],
    correctIndex: 1,
    explanation: "'Ventilación adecuada' = proper ventilation. Adequate airflow is essential when working with chemicals to prevent dangerous buildup of fumes or vapors that can cause health problems or fires.",
  },
  {
    question: "How do you say 'Do not mix these two chemicals'?",
    options: ['Use estos químicos con cuidado', 'No mezcle estos dos químicos', 'Mantenga estos químicos separados', 'Almacene estos químicos juntos'],
    correctIndex: 1,
    explanation: "'No mezcle estos dos químicos' = Do not mix these two chemicals. Mixing incompatible chemicals can create toxic gases, fires, or explosions — always verify compatibility before combining any substances.",
  },
  {
    question: "Which phrase means 'In case of chemical spill, evacuate immediately'?",
    options: ['En caso de derrame químico, llame al supervisor', 'En caso de derrame químico, evacúe inmediatamente', 'En caso de derrame químico, cubra el área', 'En caso de derrame químico, use guantes'],
    correctIndex: 1,
    explanation: "'En caso de derrame químico, evacúe inmediatamente' = In case of chemical spill, evacuate immediately. Rapid evacuation prevents exposure injuries; trained spill response teams handle cleanup.",
  },
  {
    question: '"Inflamable" means:',
    options: ['Toxic', 'Corrosive', 'Flammable', 'Explosive'],
    correctIndex: 2,
    explanation: "'Inflamable' = flammable. Flammable chemicals ignite easily and require specific storage, handling, and fire suppression measures. Never store flammables near heat sources or open flames.",
  },
  {
    question: "How do you say 'Store chemicals in a locked cabinet'?",
    options: ['Tire los químicos usados correctamente', 'Almacene los químicos en un gabinete con llave', 'Marque los químicos claramente', 'Inspeccione los químicos regularmente'],
    correctIndex: 1,
    explanation: "'Almacene los químicos en un gabinete con llave' = Store chemicals in a locked cabinet. Locked storage prevents unauthorized access, accidental spills, and theft of hazardous substances.",
  },
];

const emergencyProceduresQuestions: QuizQuestion[] = [
  {
    question: "How do you say 'Call 911 immediately'?",
    options: ['Llame al supervisor inmediatamente', 'Llame al 911 inmediatamente', 'Llame a la ambulancia inmediatamente', 'Llame a la oficina inmediatamente'],
    correctIndex: 1,
    explanation: "'Llame al 911 inmediatamente' = Call 911 immediately. In any life-threatening emergency on a job site, calling 911 must be the first action to get professional emergency responders on the way.",
  },
  {
    question: '"Punto de reunión" means:',
    options: ['Safety meeting', 'Break room', 'Assembly point', 'First aid station'],
    correctIndex: 2,
    explanation: "'Punto de reunión' = assembly point. All workers must know the designated assembly point so supervisors can account for everyone during an evacuation. Never re-enter until cleared.",
  },
  {
    question: "How do you ask 'Is anyone injured?'",
    options: ['¿Alguien necesita ayuda?', '¿Hay alguien herido?', '¿Alguien vio lo que pasó?', '¿Alguien llamó al supervisor?'],
    correctIndex: 1,
    explanation: "'¿Hay alguien herido?' = Is anyone injured? This is a critical first question after any incident to quickly identify who needs immediate medical attention.",
  },
  {
    question: "Which phrase means 'Do not move an injured worker'?",
    options: ['Ayude al trabajador lesionado a moverse', 'No mueva a un trabajador lesionado', 'Lleve al trabajador lesionado a la oficina', 'Pida al trabajador lesionado que descanse'],
    correctIndex: 1,
    explanation: "'No mueva a un trabajador lesionado' = Do not move an injured worker. Moving someone with a spinal or serious injury can cause permanent paralysis or death. Keep them still until EMS arrives.",
  },
  {
    question: '"Reporte de incidente" means:',
    options: ['Safety checklist', 'Work order', 'Incident report', 'Daily log'],
    correctIndex: 2,
    explanation: "'Reporte de incidente' = incident report. Incident reports must be completed after any workplace injury or near-miss. They document facts, help identify root causes, and are required by OSHA.",
  },
  {
    question: "How do you say 'Evacuate the building now'?",
    options: ['Reúnanse en la entrada del edificio', 'Evacúen el edificio ahora', 'Quédense dentro del edificio', 'Esperen instrucciones dentro del edificio'],
    correctIndex: 1,
    explanation: "'Evacúen el edificio ahora' = Evacuate the building now. When an evacuation order is given, everyone must exit immediately using designated routes and proceed to the assembly point.",
  },
  {
    question: "Which phrase asks 'Where were you when the accident happened?'",
    options: ['¿Qué estaba haciendo cuando ocurrió el accidente?', '¿Dónde estaba cuando ocurrió el accidente?', '¿Cómo ocurrió el accidente?', '¿Cuándo ocurrió el accidente?'],
    correctIndex: 1,
    explanation: "'¿Dónde estaba cuando ocurrió el accidente?' = Where were you when the accident happened? Location details are essential in incident investigations to reconstruct the sequence of events.",
  },
  {
    question: '"RCP" stands for:',
    options: ['Respiratory Control Procedure', 'Reanimación Cardiopulmonar', 'Risk Control Plan', 'Rescue Contact Protocol'],
    correctIndex: 1,
    explanation: "'RCP' = Reanimación Cardiopulmonar (Cardiopulmonary Resuscitation / CPR). RCP training is encouraged for all workers. Early CPR dramatically increases survival rates in cardiac emergencies.",
  },
  {
    question: "How do you say 'Stay calm and follow instructions'?",
    options: ['Corra hacia la salida más cercana', 'Mantenga la calma y siga las instrucciones', 'Llame a su familia inmediatamente', 'Espere a que lleguen los bomberos'],
    correctIndex: 1,
    explanation: "'Mantenga la calma y siga las instrucciones' = Stay calm and follow instructions. Panic during emergencies causes accidents. Following the designated emergency plan keeps everyone safe.",
  },
  {
    question: "How do you ask 'Did you witness the accident?'",
    options: ['¿Estuvo involucrado en el accidente?', '¿Fue testigo del accidente?', '¿Reportó el accidente?', '¿Conoce a la persona lesionada?'],
    correctIndex: 1,
    explanation: "'¿Fue testigo del accidente?' = Did you witness the accident? Witness accounts provide crucial information for incident investigations and help prevent similar accidents in the future.",
  },
];

const toolboxTalksQuestions: QuizQuestion[] = [
  {
    question: '"Charla de seguridad" means:',
    options: ['Safety inspection', 'Safety toolbox talk', 'Safety training course', 'Safety certification'],
    correctIndex: 1,
    explanation: "'Charla de seguridad' = safety toolbox talk. These brief, focused meetings are held before shifts to review hazards, procedures, and reminders specific to the day's work.",
  },
  {
    question: "How do you say 'Attendance at safety meetings is mandatory'?",
    options: ['Las reuniones de seguridad son recomendadas', 'La asistencia a las reuniones de seguridad es obligatoria', 'Las reuniones de seguridad son opcionales', 'Las reuniones de seguridad son mensuales'],
    correctIndex: 1,
    explanation: "'La asistencia a las reuniones de seguridad es obligatoria' = Attendance at safety meetings is mandatory. All workers are required to attend — missing a safety briefing means missing critical information that could prevent injury.",
  },
  {
    question: "Which phrase means 'Sign here to confirm you attended'?",
    options: ['Marque aquí si tiene preguntas', 'Firme aquí para confirmar su asistencia', 'Escriba aquí sus comentarios', 'Anote aquí su nombre'],
    correctIndex: 1,
    explanation: "'Firme aquí para confirmar su asistencia' = Sign here to confirm you attended. Attendance signatures create a legal record showing each worker received the safety information for that day.",
  },
  {
    question: '"Supervisor de seguridad" means:',
    options: ['Safety inspector', 'Safety supervisor', 'Safety trainer', 'Safety officer'],
    correctIndex: 1,
    explanation: "'Supervisor de seguridad' = safety supervisor. This person is responsible for enforcing safety rules, conducting toolbox talks, investigating incidents, and ensuring all workers follow OSHA standards.",
  },
  {
    question: "How do you ask 'Do you have any safety concerns to report?'",
    options: ['¿Ha tenido accidentes anteriores?', '¿Tiene alguna inquietud de seguridad que reportar?', '¿Ha completado su entrenamiento?', '¿Conoce las reglas del sitio?'],
    correctIndex: 1,
    explanation: "'¿Tiene alguna inquietud de seguridad que reportar?' = Do you have any safety concerns to report? Workers are the first line of defense — their observations often catch hazards before accidents happen.",
  },
  {
    question: "Which phrase means 'You have the right to refuse unsafe work'?",
    options: ['Usted debe completar el trabajo asignado', 'Usted tiene derecho a rechazar trabajo inseguro', 'Usted puede pausar el trabajo si está cansado', 'Usted puede reportar trabajo inseguro después'],
    correctIndex: 1,
    explanation: "'Usted tiene derecho a rechazar trabajo inseguro' = You have the right to refuse unsafe work. Under OSHA Section 11(c), workers are legally protected from retaliation when they refuse genuinely dangerous tasks.",
  },
  {
    question: '"Corrección inmediata" means:',
    options: ['Immediate inspection', 'Immediate correction', 'Immediate reporting', 'Immediate training'],
    correctIndex: 1,
    explanation: "'Corrección inmediata' = immediate correction. When a hazard is identified, immediate correction means fixing it on the spot rather than waiting — preventing the next person from being injured.",
  },
  {
    question: "How do you say 'No shortcuts on safety procedures'?",
    options: ['Siga los procedimientos de seguridad cuando sea posible', 'No haga atajos en los procedimientos de seguridad', 'Los procedimientos de seguridad pueden ajustarse', 'Consulte al supervisor antes de hacer cambios'],
    correctIndex: 1,
    explanation: "'No haga atajos en los procedimientos de seguridad' = No shortcuts on safety procedures. Most workplace injuries happen when workers skip steps to save time. Procedures exist because shortcuts have caused deaths.",
  },
  {
    question: "Which phrase asks 'Did you understand today\\'s safety topic?'",
    options: ['¿Tiene preguntas sobre el equipo?', '¿Entendió el tema de seguridad de hoy?', '¿Asistió a la reunión de la semana pasada?', '¿Necesita más entrenamiento?'],
    correctIndex: 1,
    explanation: "'¿Entendió el tema de seguridad de hoy?' = Did you understand today's safety topic? Checking comprehension at the end of a toolbox talk ensures the message was clear and workers can apply it on the job.",
  },
  {
    question: "How do you say 'Safety is everyone\\'s responsibility'?",
    options: ['La seguridad es responsabilidad del supervisor', 'La seguridad es responsabilidad de todos', 'La seguridad es responsabilidad del trabajador', 'La seguridad es responsabilidad de la empresa'],
    correctIndex: 1,
    explanation: "'La seguridad es responsabilidad de todos' = Safety is everyone's responsibility. A strong safety culture requires every worker — regardless of role — to watch out for each other and speak up about hazards.",
  },
];

const socialServicesClientIntakeQuestions: QuizQuestion[] = [
  {
    question: "How do you say 'Everything you tell us is confidential'?",
    options: ['Todo lo que nos diga será compartido con su familia', 'Todo lo que nos diga es confidencial', 'Todo lo que nos diga será documentado', 'Todo lo que nos diga ayudará a otros clientes'],
    correctIndex: 1,
    explanation: "'Todo lo que nos diga es confidencial' = Everything you tell us is confidential. Establishing confidentiality from the start builds trust and is a cornerstone of trauma-informed social services practice.",
  },
  {
    question: '"Derechos del cliente" means:',
    options: ['Client responsibilities', 'Client rights', 'Client services', 'Client information'],
    correctIndex: 1,
    explanation: "'Derechos del cliente' = client rights. Every client has the right to be informed of their rights — including confidentiality, interpreter access, and the right to file a grievance — before services begin.",
  },
  {
    question: "How do you ask 'What brings you here today?'",
    options: ['¿Cuándo fue su última visita?', '¿Qué lo trae aquí hoy?', '¿Conoce nuestros servicios?', '¿Cómo se enteró de nosotros?'],
    correctIndex: 1,
    explanation: "'¿Qué lo trae aquí hoy?' = What brings you here today? This open-ended question invites the client to share in their own words without making assumptions, setting a respectful tone for the intake.",
  },
  {
    question: "Which phrase means 'You have the right to an interpreter'?",
    options: ['Puede traer a alguien que traduzca', 'Tiene derecho a un intérprete', 'Necesita hablar inglés para recibir servicios', 'Podemos conseguirle un intérprete si es necesario'],
    correctIndex: 1,
    explanation: "'Tiene derecho a un intérprete' = You have the right to an interpreter. Under Title VI of the Civil Rights Act, agencies receiving federal funding must provide free language access to limited English proficient individuals.",
  },
  {
    question: '"Formulario de consentimiento" means:',
    options: ['Service application', 'Intake form', 'Consent form', 'Needs assessment'],
    correctIndex: 2,
    explanation: "'Formulario de consentimiento' = consent form. Informed consent requires clients to understand what they are agreeing to — in their language — before signing. Signing without understanding is not valid consent.",
  },
  {
    question: "How do you say 'Your information will not be shared without your permission'?",
    options: ['Su información estará disponible para todas las agencias', 'Su información no será compartida sin su permiso', 'Su información será guardada por 10 años', 'Su información puede ser revisada por el gobierno'],
    correctIndex: 1,
    explanation: "'Su información no será compartida sin su permiso' = Your information will not be shared without your permission. This directly addresses the fear many clients have about disclosure, especially those with immigration concerns.",
  },
  {
    question: "Which phrase asks 'Have you received services here before?'",
    options: ['¿Conoce a otros clientes aquí?', '¿Ha recibido servicios aquí antes?', '¿Cuándo empezó a necesitar servicios?', '¿Qué servicios necesita ahora?'],
    correctIndex: 1,
    explanation: "'¿Ha recibido servicios aquí antes?' = Have you received services here before? Knowing a client's history helps avoid duplication, locate existing case files, and build on previous service plans.",
  },
  {
    question: '"Evaluación de necesidades" means:',
    options: ['Service agreement', 'Case review', 'Needs assessment', 'Progress report'],
    correctIndex: 2,
    explanation: "'Evaluación de necesidades' = needs assessment. This structured process identifies what support a client requires — housing, food, mental health, legal aid — so the case worker can develop an appropriate service plan.",
  },
  {
    question: "How do you say 'We are here to help, not to judge'?",
    options: ['Estamos aquí para evaluar su situación', 'Estamos aquí para ayudar, no para juzgar', 'Estamos aquí para documentar su caso', 'Estamos aquí para conectarle con recursos'],
    correctIndex: 1,
    explanation: "'Estamos aquí para ayudar, no para juzgar' = We are here to help, not to judge. This phrase is especially important for clients who have faced stigma or shame. It signals psychological safety and encourages honesty.",
  },
  {
    question: "How do you ask 'Is it safe for you to talk right now?'",
    options: ['¿Tiene tiempo para hablar ahora?', '¿Es seguro para usted hablar ahora?', '¿Prefiere hablar en privado?', '¿Está cómodo hablando aquí?'],
    correctIndex: 1,
    explanation: "'¿Es seguro para usted hablar ahora?' = Is it safe for you to talk right now? This question is critical in domestic violence and crisis situations where a third party may be listening. Safety always comes first.",
  },
];

const socialServicesHousingQuestions: QuizQuestion[] = [
  {
    question: "How do you ask 'Are you currently homeless?'",
    options: ['¿Tiene casa propia?', '¿Actualmente no tiene hogar?', '¿Está pagando renta?', '¿Vive con familiares?'],
    correctIndex: 1,
    explanation: "'¿Actualmente no tiene hogar?' = Are you currently homeless? Accurate homelessness screening is the gateway to emergency shelter, rapid rehousing, and HUD-funded programs. Direct, respectful language avoids stigma while gathering critical information.",
  },
  {
    question: '"Albergue de emergencia" means:',
    options: ['Affordable housing', 'Transitional housing', 'Emergency shelter', 'Permanent housing'],
    correctIndex: 2,
    explanation: "'Albergue de emergencia' = emergency shelter. Emergency shelters provide immediate, short-term protection from weather and danger. Understanding this term helps workers connect clients to the right level of housing support on a continuum.",
  },
  {
    question: "How do you say 'There is a bed available tonight'?",
    options: ['No hay camas disponibles esta noche', 'Hay una cama disponible esta noche', 'Puede quedarse hasta encontrar trabajo', 'Tiene que salir mañana por la mañana'],
    correctIndex: 1,
    explanation: "'Hay una cama disponible esta noche' = There is a bed available tonight. In a crisis, this sentence can be lifesaving. Confirming availability immediately reduces uncertainty and helps clients make an informed decision about where to go.",
  },
  {
    question: "Which phrase means 'Children are welcome at this shelter'?",
    options: ['Este albergue es solo para adultos', 'Los niños son bienvenidos en este albergue', 'Los niños necesitan documentos para entrar', 'Los niños deben ir a otro albergue'],
    correctIndex: 1,
    explanation: "'Los niños son bienvenidos en este albergue' = Children are welcome at this shelter. Families with children are one of the fastest-growing homeless populations. Clearly communicating family-inclusive policies prevents unnecessary separation.",
  },
  {
    question: '"Lista de espera" means:',
    options: ['Service schedule', 'Waitlist', 'Priority list', 'Resource list'],
    correctIndex: 1,
    explanation: "'Lista de espera' = waitlist. Many housing programs have lengthy waitlists. Explaining this term honestly — and offering interim resources — is essential for managing expectations and keeping clients engaged in the process.",
  },
  {
    question: "How do you ask 'How many people are in your family?'",
    options: ['¿Cuántos hijos tiene?', '¿Cuántas personas hay en su familia?', '¿Tiene familia en esta ciudad?', '¿Su familia puede ayudarle?'],
    correctIndex: 1,
    explanation: "'¿Cuántas personas hay en su familia?' = How many people are in your family? Household size determines eligibility for many housing programs (e.g., Section 8 voucher size, shelter capacity). This is a foundational intake question.",
  },
  {
    question: "Which phrase means 'You must follow shelter rules to stay'?",
    options: ['Puede quedarse aunque no siga las reglas', 'Debe seguir las reglas del albergue para quedarse', 'Las reglas del albergue son sugerencias', 'Las reglas cambian cada semana'],
    correctIndex: 1,
    explanation: "'Debe seguir las reglas del albergue para quedarse' = You must follow shelter rules to stay. Communicating expectations clearly — sobriety policies, curfews, chore requirements — sets clients up for success and reduces avoidable exits.",
  },
  {
    question: '"Vivienda de transición" means:',
    options: ['Emergency shelter', 'Permanent housing', 'Transitional housing', 'Subsidized housing'],
    correctIndex: 2,
    explanation: "'Vivienda de transición' = transitional housing. Transitional housing bridges the gap between emergency shelter and permanent housing, typically offering 6–24 months of support with case management and skill-building services.",
  },
  {
    question: "How do you say 'We can help you find permanent housing'?",
    options: ['Solo ofrecemos albergue de emergencia', 'Podemos ayudarle a encontrar vivienda permanente', 'La vivienda permanente tiene lista de espera larga', 'La vivienda permanente requiere buen crédito'],
    correctIndex: 1,
    explanation: "'Podemos ayudarle a encontrar vivienda permanente' = We can help you find permanent housing. Hope is part of trauma-informed care. Affirming that permanent housing is a real goal — not just a crisis response — motivates clients to stay engaged.",
  },
  {
    question: "How do you ask 'Do you feel safe where you are staying now?'",
    options: ['¿Le gusta donde está viviendo?', '¿Se siente seguro donde está viviendo ahora?', '¿Cuánto tiempo lleva en esa situación?', '¿Quiere cambiar de lugar?'],
    correctIndex: 1,
    explanation: "'¿Se siente seguro donde está viviendo ahora?' = Do you feel safe where you are staying now? Safety screening is mandatory at every housing intake. Clients in dangerous living situations — domestic violence, gang territory, unstable overcrowding — require immediate prioritization.",
  },
];

const socialServicesBenefitsQuestions: QuizQuestion[] = [
  {
    question: '"Elegibilidad" means:',
    options: ['Application', 'Eligibility', 'Benefits', 'Documentation'],
    correctIndex: 1,
    explanation: "'Elegibilidad' = eligibility. Every benefits program starts with an eligibility determination. Workers must use this term accurately so clients understand why they may or may not qualify for a given program.",
  },
  {
    question: "How do you ask 'Do you have a valid ID?'",
    options: ['¿Tiene pasaporte vigente?', '¿Tiene una identificación válida?', '¿Tiene licencia de conducir?', '¿Tiene tarjeta de seguro social?'],
    correctIndex: 1,
    explanation: "'¿Tiene una identificación válida?' = Do you have a valid ID? Many benefits programs require government-issued ID. Asking broadly about 'valid ID' rather than a specific document type ensures clients aren't turned away unnecessarily.",
  },
  {
    question: "Which phrase means 'You may qualify for food assistance'?",
    options: ['No califica para asistencia de alimentos', 'Puede calificar para asistencia de alimentos', 'Ya recibe asistencia de alimentos', 'La asistencia de alimentos está agotada'],
    correctIndex: 1,
    explanation: "'Puede calificar para asistencia de alimentos' = You may qualify for food assistance. Using 'may qualify' (puede calificar) instead of definitive language sets accurate expectations before an official eligibility determination is made.",
  },
  {
    question: '"Beneficios de desempleo" means:',
    options: ['Disability benefits', 'Food stamps', 'Unemployment benefits', 'Housing assistance'],
    correctIndex: 2,
    explanation: "'Beneficios de desempleo' = unemployment benefits. These are state-administered benefits for workers who lost jobs through no fault of their own. Workers must use this specific term — not 'seguro de desempleo' alone — to avoid confusion with other programs.",
  },
  {
    question: "How do you say 'This application takes 30 days to process'?",
    options: ['Esta solicitud es aprobada inmediatamente', 'Esta solicitud tarda 30 días en procesarse', 'Esta solicitud puede tardar meses', 'Esta solicitud necesita ser renovada anualmente'],
    correctIndex: 1,
    explanation: "'Esta solicitud tarda 30 días en procesarse' = This application takes 30 days to process. Setting clear timelines prevents clients from calling repeatedly to check status, and reduces frustration when decisions are not immediate.",
  },
  {
    question: "Which phrase asks 'Are you currently employed?'",
    options: ['¿Está buscando trabajo?', '¿Está trabajando actualmente?', '¿Tiene experiencia laboral?', '¿Tiene habilidades especiales?'],
    correctIndex: 1,
    explanation: "'¿Está trabajando actualmente?' = Are you currently employed? Employment status is a core eligibility factor for SNAP, Medicaid, unemployment, and cash assistance programs. This question must be asked clearly and neutrally.",
  },
  {
    question: '"Prueba de ingresos" means:',
    options: ['Proof of address', 'Proof of identity', 'Proof of income', 'Proof of enrollment'],
    correctIndex: 2,
    explanation: "'Prueba de ingresos' = proof of income. Income documentation — pay stubs, tax returns, employer letters — is required for virtually every means-tested benefits program. Clients must understand what specific documents satisfy this requirement.",
  },
  {
    question: "How do you say 'You need to recertify every six months'?",
    options: ['Su beneficio es permanente', 'Necesita recertificarse cada seis meses', 'Necesita recertificarse cada año', 'Necesita recertificarse una sola vez'],
    correctIndex: 1,
    explanation: "'Necesita recertificarse cada seis meses' = You need to recertify every six months. Many benefits (SNAP, Medicaid) require periodic renewal. Failure to recertify is one of the top reasons clients lose benefits they still qualify for.",
  },
  {
    question: "Which phrase means 'Bring all required documents to your appointment'?",
    options: ['Puede traer los documentos después de la cita', 'Traiga todos los documentos requeridos a su cita', 'Los documentos pueden enviarse por correo', 'Los documentos son opcionales para la cita'],
    correctIndex: 1,
    explanation: "'Traiga todos los documentos requeridos a su cita' = Bring all required documents to your appointment. Incomplete document submissions are a leading cause of delayed or denied applications. Clear instructions before the appointment save time for both clients and workers.",
  },
  {
    question: "How do you ask 'Have you applied for benefits before?'",
    options: ['¿Sabe qué beneficios le corresponden?', '¿Ha solicitado beneficios antes?', '¿Cuándo necesita empezar a recibir beneficios?', '¿Prefiere recibir beneficios en efectivo?'],
    correctIndex: 1,
    explanation: "'¿Ha solicitado beneficios antes?' = Have you applied for benefits before? Prior application history helps workers identify denied claims that may be appealable, active benefits that could be modified, or prior documentation already on file.",
  },
];

const socialServicesDVQuestions: QuizQuestion[] = [
  {
    question: "How do you ask 'Are you safe at home?'",
    options: ['¿Le gusta su hogar?', '¿Está seguro en casa?', '¿Tiene problemas en casa?', '¿Necesita ayuda en casa?'],
    correctIndex: 1,
    explanation: "'¿Está seguro en casa?' = Are you safe at home? Safety screening is the first priority in any DV encounter. This direct question — asked privately and without judgment — gives clients an opening to disclose abuse that they may not have been able to name on their own.",
  },
  {
    question: '"Orden de alejamiento" means:',
    options: ['Custody order', 'Restraining order', 'Child support order', 'Protective custody'],
    correctIndex: 1,
    explanation: "'Orden de alejamiento' = restraining order / protective order. This legal tool prohibits an abuser from contacting or approaching the victim. Workers must use this term precisely — not 'orden de protección' interchangeably — as different jurisdictions may distinguish between the two.",
  },
  {
    question: "How do you say 'You are not alone. Help is available'?",
    options: ['Muchas personas pasan por lo mismo que usted', 'No está solo. Hay ayuda disponible', 'Debe buscar ayuda inmediatamente', 'Nadie más sabe lo que está pasando'],
    correctIndex: 1,
    explanation: "'No está solo. Hay ayuda disponible' = You are not alone. Help is available. Isolation is a core tactic of abusers. This phrase directly counters that tactic and is often the first step toward a survivor feeling safe enough to accept services.",
  },
  {
    question: "Which phrase means 'Your safety is our priority'?",
    options: ['Su caso es muy importante para nosotros', 'Su seguridad es nuestra prioridad', 'Su familia necesita saber lo que pasa', 'Su situación puede mejorar con tiempo'],
    correctIndex: 1,
    explanation: "'Su seguridad es nuestra prioridad' = Your safety is our priority. Stating this explicitly tells the survivor that the worker's role is not to preserve the relationship, involve the family, or minimize the situation — it is solely to protect them.",
  },
  {
    question: '"Casa de acogida" means:',
    options: ['Social services office', 'Safe house / domestic violence shelter', 'Community center', "Children's shelter"],
    correctIndex: 1,
    explanation: "'Casa de acogida' = safe house / domestic violence shelter. Knowing the correct term is essential when making referrals. Clients who don't understand what a 'casa de acogida' is may decline a referral that could save their lives.",
  },
  {
    question: "How do you say 'You can leave when you are ready'?",
    options: ['Debe irse ahora por su seguridad', 'Puede irse cuando esté listo', 'No tiene que irse si no quiere', 'Puede regresar a casa si promete que estará bien'],
    correctIndex: 1,
    explanation: "'Puede irse cuando esté listo' = You can leave when you are ready. Trauma-informed care means respecting autonomy. Pressuring survivors to leave before they are ready can increase danger. This phrase affirms their control over the decision.",
  },
  {
    question: "Which phrase asks 'Is there a safe number where we can reach you?'",
    options: ['¿Tiene teléfono propio?', '¿Hay un número seguro donde podamos contactarle?', '¿Con quién vive actualmente?', '¿Puede llamarnos usted?'],
    correctIndex: 1,
    explanation: "'¿Hay un número seguro donde podamos contactarle?' = Is there a safe number where we can reach you? Contacting a survivor at an unsafe number can put them at risk of discovery by their abuser. Workers must always confirm a communication channel that won't be monitored.",
  },
  {
    question: '"Plan de seguridad" means:',
    options: ['Legal strategy', 'Safety plan', 'Relocation plan', 'Financial plan'],
    correctIndex: 1,
    explanation: "'Plan de seguridad' = safety plan. A safety plan is a personalized, practical guide that helps a survivor prepare for dangerous situations — what to take, where to go, who to call. Workers must be able to name and explain this tool clearly.",
  },
  {
    question: "How do you say 'The National DV Hotline is 1-800-799-7233'?",
    options: ['Llame al 911 si está en peligro inmediato', 'La línea nacional de violencia doméstica es 1-800-799-7233', 'Llame a la policía si necesita ayuda', 'Llame a nuestra oficina para más información'],
    correctIndex: 1,
    explanation: "'La línea nacional de violencia doméstica es 1-800-799-7233' = The National DV Hotline is 1-800-799-7233. This hotline operates 24/7 in more than 200 languages. Every worker serving DV-affected clients must be able to provide this number clearly and correctly.",
  },
  {
    question: "How do you ask 'Do you have children who are also in danger?'",
    options: ['¿Sus hijos saben lo que está pasando?', '¿Tiene hijos que también están en peligro?', '¿Sus hijos están en la escuela ahora?', '¿Sus hijos pueden quedarse con familiares?'],
    correctIndex: 1,
    explanation: "'¿Tiene hijos que también están en peligro?' = Do you have children who are also in danger? Children in DV households face direct harm, trauma, and mandated reporting obligations. This question triggers both child welfare assessment and appropriate multi-service coordination.",
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

const socialServicesCaseClosureQuestions: QuizQuestion[] = [
  {
    question: "How do you say 'We are closing your case today'?",
    options: ['Su caso fue transferido a otra agencia', 'Estamos cerrando su caso hoy', 'Su caso necesita más documentación', 'Su caso fue resuelto el mes pasado'],
    correctIndex: 1,
    explanation: "'Estamos cerrando su caso hoy' = We are closing your case today. Clear, direct language about case closure prevents confusion. Clients deserve to know exactly where they stand so they can seek services elsewhere if needed.",
  },
  {
    question: '"Resumen del caso" means:',
    options: ['Case number', 'Case summary', 'Case worker', 'Case file'],
    correctIndex: 1,
    explanation: "'Resumen del caso' = case summary. A case summary documents what services were provided, outcomes achieved, and referrals made. Workers should offer clients a copy in their language as part of an equitable closure process.",
  },
  {
    question: "How do you ask 'Have your needs been met?'",
    options: ['¿Está satisfecho con nuestros servicios?', '¿Han sido atendidas sus necesidades?', '¿Necesita servicios adicionales?', '¿Tiene comentarios sobre su experiencia?'],
    correctIndex: 1,
    explanation: "'¿Han sido atendidas sus necesidades?' = Have your needs been met? This question focuses on outcomes rather than satisfaction, which is more meaningful. It gives clients the language to identify unresolved needs before the case closes.",
  },
  {
    question: "Which phrase means 'You can reopen your case if needed'?",
    options: ['Este es el fin de nuestros servicios', 'Puede reabrir su caso si es necesario', 'Necesitará una nueva solicitud para volver', 'Su caso no puede reabrirse después de 6 meses'],
    correctIndex: 1,
    explanation: "'Puede reabrir su caso si es necesario' = You can reopen your case if needed. Informing clients of this option reduces anxiety about closure and ensures they know help is available if circumstances change — without requiring them to start the intake process from scratch.",
  },
  {
    question: '"Recursos comunitarios" means:',
    options: ['Community volunteers', 'Community resources', 'Community programs', 'Community centers'],
    correctIndex: 1,
    explanation: "'Recursos comunitarios' = community resources. Connecting clients to ongoing community resources at case closure is essential for sustainability. Workers must be able to name and explain local services in terms clients understand.",
  },
  {
    question: "How do you say 'Here is a list of resources for your area'?",
    options: ['Aquí está el número de nuestra oficina', 'Aquí está una lista de recursos para su área', 'Aquí están los formularios que necesita', 'Aquí está la información de su caso'],
    correctIndex: 1,
    explanation: "'Aquí está una lista de recursos para su área' = Here is a list of resources for your area. Providing a tangible resource list at closure ensures clients have actionable next steps and don't lose access to support when their case ends.",
  },
  {
    question: "Which phrase asks 'Is there anything else we can help you with before we close?'",
    options: ['¿Está listo para cerrar su caso?', '¿Hay algo más en lo que podamos ayudarle antes de cerrar?', '¿Tiene alguna queja sobre nuestros servicios?', '¿Conoce a alguien más que necesite ayuda?'],
    correctIndex: 1,
    explanation: "'¿Hay algo más en lo que podamos ayudarle antes de cerrar?' = Is there anything else we can help you with before we close? This open-ended question creates space for clients to raise concerns they may not have felt comfortable sharing earlier in the process.",
  },
  {
    question: '"Encuesta de satisfacción" means:',
    options: ['Service agreement', 'Progress report', 'Satisfaction survey', 'Needs assessment'],
    correctIndex: 2,
    explanation: "'Encuesta de satisfacción' = satisfaction survey. Offering clients a satisfaction survey in their language demonstrates respect and accountability. Feedback from LEP clients helps agencies identify language access gaps and improve services.",
  },
  {
    question: "How do you say 'Thank you for trusting us with your situation'?",
    options: ['Ha sido un placer trabajar con usted', 'Gracias por confiar en nosotros con su situación', 'Esperamos que todo vaya bien', 'Fue difícil, pero lo logramos juntos'],
    correctIndex: 1,
    explanation: "'Gracias por confiar en nosotros con su situación' = Thank you for trusting us with your situation. Acknowledging the courage it takes to seek help — especially for clients navigating systems in a second language — is a dignifying way to close a professional relationship.",
  },
  {
    question: "How do you ask 'May we contact you for a follow-up in 30 days?'",
    options: ['¿Podemos compartir su información con otras agencias?', '¿Podemos contactarle para un seguimiento en 30 días?', '¿Podemos cerrar su caso hoy?', '¿Podemos usar su caso como ejemplo?'],
    correctIndex: 1,
    explanation: "'¿Podemos contactarle para un seguimiento en 30 días?' = May we contact you for a follow-up in 30 days? Follow-up contact demonstrates ongoing accountability and helps agencies identify clients who needed more support than was provided during the active case period.",
  },
];

const hc1Phrases: KeyPhrase[] = [
  { english: 'Do you have pain?', spanish: '¿Tiene dolor?', context: 'Patient intake — first pain screening question' },
  { english: 'Are you allergic to any medication?', spanish: '¿Es usted alérgico a algún medicamento?', context: 'Allergy check before prescribing treatment' },
  { english: 'Take a deep breath.', spanish: 'Respire profundamente.', context: 'Instruction during physical examination' },
  { english: 'Do not eat or drink after midnight.', spanish: 'No coma ni beba nada después de la medianoche.', context: 'Pre-procedure fasting instruction' },
  { english: 'Are you pregnant?', spanish: '¿Está embarazada?', context: 'Safety screening before X-rays or certain medications' },
  { english: 'I need to take your blood pressure.', spanish: 'Necesito tomarle la presión arterial.', context: 'Routine vitals check during intake' },
  { english: 'Point to where it hurts.', spanish: 'Señale dónde le duele.', context: 'Pain location identification during intake' },
  { english: 'When did the symptoms start?', spanish: '¿Cuándo comenzaron los síntomas?', context: 'Triage history-taking question' },
  { english: 'Take this medication twice a day.', spanish: 'Tome este medicamento dos veces al día.', context: 'Discharge medication instruction' },
  { english: 'Yes, I understand.', spanish: 'Sí, entiendo.', context: 'Patient confirmation of understanding' },
];

const hc2Phrases: KeyPhrase[] = [
  { english: 'Where does it hurt?', spanish: '¿Dónde le duele?', context: 'Fundamental pain location question' },
  { english: 'On a scale from one to ten…', spanish: 'En una escala del uno al diez…', context: 'Numeric pain rating scale prompt' },
  { english: 'How long have you had this pain?', spanish: '¿Desde cuándo tiene este dolor?', context: 'Pain duration assessment for diagnosis' },
  { english: 'Is the pain constant or does it come and go?', spanish: '¿El dolor es constante o va y viene?', context: 'Distinguishing chronic from intermittent pain' },
  { english: 'Dizziness', spanish: 'Mareo', context: 'Symptom vocabulary — different from nausea' },
  { english: 'Do you have shortness of breath?', spanish: '¿Tiene dificultad para respirar?', context: 'Respiratory distress screening during triage' },
  { english: 'Nausea', spanish: 'Náuseas', context: 'Symptom vocabulary — distinguish from dizziness' },
  { english: 'Does the pain radiate anywhere?', spanish: '¿El dolor se irradia a algún lugar?', context: 'Identifying referred pain patterns such as cardiac events' },
  { english: 'Do you have a fever?', spanish: '¿Tiene fiebre?', context: 'Common symptom screening in every clinical encounter' },
  { english: 'Point to where you feel the pain.', spanish: 'Señale dónde siente el dolor.', context: 'Non-verbal pain location method when verbal description is difficult' },
];

const hc3Phrases: KeyPhrase[] = [
  { english: 'Take one tablet twice a day.', spanish: 'Tome una pastilla dos veces al día.', context: 'Accurate dosage instruction for medication safety' },
  { english: 'On an empty stomach', spanish: 'En ayunas', context: 'Medication absorption requirement for certain drugs' },
  { english: 'Are you currently taking any medications?', spanish: '¿Toma actualmente algún medicamento?', context: 'Medication reconciliation to prevent interactions' },
  { english: 'Do not drive after taking this medication.', spanish: 'No maneje después de tomar este medicamento.', context: 'Safety warning for sedating or narcotic medications' },
  { english: 'Side effects', spanish: 'Efectos secundarios', context: 'Vocabulary for patient education after prescribing' },
  { english: 'Take this medication with food.', spanish: 'Tome este medicamento con comida.', context: 'Reducing nausea or stomach irritation from certain drugs' },
  { english: 'This prescription needs to be refilled.', spanish: 'Esta receta necesita renovarse.', context: 'Communicating refill needs for chronic medications' },
  { english: 'Do not mix with alcohol.', spanish: 'No mezcle con alcohol.', context: 'Safety warning for antibiotics and blood thinners' },
  { english: 'Do you have any drug allergies?', spanish: '¿Tiene alergia a algún medicamento?', context: 'Must be asked before any medication is administered' },
  { english: 'Finish all of the medication.', spanish: 'Termine todo el medicamento.', context: 'Antibiotic compliance to prevent resistance' },
];

const hc4Phrases: KeyPhrase[] = [
  { english: 'We need your signature here.', spanish: 'Necesitamos su firma aquí.', context: 'Obtaining legal consent before procedures' },
  { english: 'Informed consent', spanish: 'Consentimiento informado', context: 'Required before any treatment begins' },
  { english: 'Do you understand the procedure?', spanish: '¿Entiende el procedimiento?', context: 'Confirming patient comprehension for valid consent' },
  { english: 'You have the right to refuse treatment.', spanish: 'Usted tiene derecho a rechazar el tratamiento.', context: 'Fundamental patient rights disclosure' },
  { english: 'Local anesthesia', spanish: 'Anestesia local', context: 'Clarifying anesthesia type to reduce patient anxiety' },
  { english: 'This procedure takes about 30 minutes.', spanish: 'Este procedimiento tarda unos 30 minutos.', context: 'Setting time expectations before a procedure' },
  { english: 'Do you have any questions before we begin?', spanish: '¿Tiene preguntas antes de comenzar?', context: 'Ensuring understanding as part of the consent process' },
  { english: 'Risks and benefits', spanish: 'Riesgos y beneficios', context: 'Core component of informed consent discussion' },
  { english: 'Please do not eat or drink after midnight.', spanish: 'Por favor, no coma ni beba después de medianoche.', context: 'Pre-surgical fasting instruction' },
  { english: 'Is there someone who can make decisions for you?', spanish: '¿Hay alguien que pueda tomar decisiones por usted?', context: 'Identifying a surrogate when patient cannot consent' },
];

const hc5Phrases: KeyPhrase[] = [
  { english: 'Your follow-up appointment is in two weeks.', spanish: 'Su cita de seguimiento es en dos semanas.', context: 'Follow-up scheduling at discharge' },
  { english: 'Discharge instructions', spanish: 'Instrucciones de alta', context: 'Written instructions given when leaving the facility' },
  { english: 'Call us if you have a fever above 101°F.', spanish: 'Llámenos si tiene fiebre de más de 101°F.', context: 'Specific symptom threshold for when to seek care' },
  { english: 'Do not lift anything heavy for two weeks.', spanish: 'No levante objetos pesados por dos semanas.', context: 'Activity restriction to prevent post-procedure complications' },
  { english: 'Warning signs', spanish: 'Señales de advertencia', context: 'Symptoms that require immediate medical attention' },
  { english: 'Do you have a way to get home?', spanish: '¿Tiene cómo llegar a casa?', context: 'Safe discharge check — patients may not drive themselves' },
  { english: 'Keep the wound clean and dry.', spanish: 'Mantenga la herida limpia y seca.', context: 'Wound care instruction to prevent infection' },
  { english: 'Follow-up appointment', spanish: 'Cita de seguimiento', context: 'Scheduling continuity of care after discharge' },
  { english: 'Go to the emergency room if symptoms worsen.', spanish: 'Vaya a urgencias si los síntomas empeoran.', context: 'Escalation instruction for post-discharge emergencies' },
  { english: 'Here are your discharge papers.', spanish: 'Aquí están sus papeles de alta.', context: 'Handing over documentation for home reference' },
];

const ed1Phrases: KeyPhrase[] = [
  { english: 'Welcome to our school.', spanish: 'Bienvenido a nuestra escuela.', context: 'Greeting new families at enrollment' },
  { english: 'How old is your child?', spanish: '¿Cuántos años tiene su hijo?', context: 'Age determines grade placement during enrollment' },
  { english: 'School enrollment', spanish: 'Registración escolar', context: 'Process required before a child can begin attending' },
  { english: 'Does your child have any special needs?', spanish: '¿Su hijo tiene necesidades especiales?', context: 'Identifying IEP or 504 needs at enrollment' },
  { english: 'Please bring proof of address.', spanish: 'Por favor, traiga comprobante de domicilio.', context: 'Residency verification required for enrollment' },
  { english: 'Immunization record', spanish: 'Certificado de vacunación', context: 'Required vaccination documentation for school enrollment' },
  { english: 'School starts at 8 AM.', spanish: 'La escuela empieza a las 8 de la mañana.', context: 'Schedule information for timely arrival' },
  { english: 'What language does your child speak at home?', spanish: '¿Qué idioma habla su hijo en casa?', context: 'Home language survey required for ELL identification' },
  { english: 'Emergency contact form', spanish: 'Formulario de emergencia', context: 'Current contact info required for every enrolled student' },
  { english: 'Who has permission to pick up your child?', spanish: '¿Quién tiene permiso de recoger a su hijo?', context: 'Authorized pickup safety requirement' },
];

const ed2Phrases: KeyPhrase[] = [
  { english: 'Your child is progressing very well in class.', spanish: 'Su hijo está progresando muy bien en clase.', context: 'Positive academic feedback during parent-teacher conference' },
  { english: 'Grades', spanish: 'Calificaciones', context: 'Primary conference topic alongside attendance and behavior' },
  { english: 'Does your child do homework at home?', spanish: '¿Su hijo hace la tarea en casa?', context: 'Identifying whether home academic support is needed' },
  { english: 'Your child needs extra help in reading.', spanish: 'Su hijo necesita ayuda adicional en lectura.', context: 'Communicating literacy needs to support home learning' },
  { english: 'Attendance', spanish: 'Asistencia', context: 'Tracked by every school — directly impacts student learning' },
  { english: 'We are concerned about your child\'s progress.', spanish: 'Estamos preocupados por el progreso de su hijo.', context: 'Opening a constructive conversation about academic concerns' },
  { english: 'Does your child mention school at home?', spanish: '¿Su hijo habla de la escuela en casa?', context: 'Indicator of school engagement and well-being' },
  { english: 'Classroom behavior', spanish: 'Comportamiento en clase', context: 'Standard conference topic alongside grades' },
  { english: 'I would like to schedule another meeting.', spanish: 'Me gustaría programar otra reunión.', context: 'Follow-up meetings for continued family communication' },
  { english: 'Do you have any questions or concerns?', spanish: '¿Tiene preguntas o inquietudes?', context: 'Inviting families to voice concerns — two-way conference' },
];

const ed3Phrases: KeyPhrase[] = [
  { english: 'Individualized Education Program', spanish: 'Programa de Educación Individualizado (IEP)', context: 'Legally binding document for students with disabilities' },
  { english: 'Your child qualifies for special services.', spanish: 'Su hijo califica para servicios especiales.', context: 'Key message that opens IEP planning process' },
  { english: 'We will evaluate your child.', spanish: 'Vamos a evaluar a su hijo.', context: 'Families must be informed before formal assessment begins' },
  { english: 'Accommodations', spanish: 'Adaptaciones', context: 'Adjustments supporting a student\'s access to learning' },
  { english: 'You have the right to attend all IEP meetings.', spanish: 'Usted tiene derecho a asistir a todas las reuniones del IEP.', context: 'Legal protection under IDEA for parental participation' },
  { english: 'Do you agree with this plan?', spanish: '¿Está de acuerdo con este plan?', context: 'Parental consent required before implementing an IEP' },
  { english: 'Speech therapy', spanish: 'Terapia del habla', context: 'Most common related service provided under an IEP' },
  { english: 'Your signature is required to proceed.', spanish: 'Su firma es requerida para continuar.', context: 'Written parental consent required before services begin' },
  { english: 'Your child will be reassessed annually.', spanish: 'Su hijo será reevaluado anualmente.', context: 'Annual reviews keep IEP goals appropriate to student progress' },
  { english: 'Do you need an interpreter at the next meeting?', spanish: '¿Necesita un intérprete en la próxima reunión?', context: 'Schools must provide language access for IEP meetings' },
];

const ed4Phrases: KeyPhrase[] = [
  { english: 'Your child was involved in an incident today.', spanish: 'Su hijo estuvo involucrado en un incidente hoy.', context: 'Factual language for reporting behavioral incidents' },
  { english: 'Suspension', spanish: 'Suspensión', context: 'Temporary removal from school — distinct from expulsion' },
  { english: 'Can you come to school to discuss this?', spanish: '¿Puede venir a la escuela a hablar sobre esto?', context: 'In-person dialogue for serious behavioral concerns' },
  { english: 'This behavior cannot be tolerated.', spanish: 'Este comportamiento no puede tolerarse.', context: 'Setting clear expectations that apply to all students' },
  { english: 'Code of conduct', spanish: 'Código de conducta', context: 'Document families receive at the start of each school year' },
  { english: 'Your child has been bullying other students.', spanish: 'Su hijo ha estado acosando a otros estudiantes.', context: 'Direct language distinguishing the child as causing harm' },
  { english: 'Is everything okay at home?', spanish: '¿Todo está bien en casa?', context: 'Empathic question to understand context behind behavior' },
  { english: 'Consequences', spanish: 'Consecuencias', context: 'Explaining the school\'s response to behavior clearly' },
  { english: 'We want to support your child, not punish them.', spanish: 'Queremos apoyar a su hijo, no castigarlo.', context: 'Reframing discipline as a collaborative, supportive process' },
  { english: 'What can we do together to help your child?', spanish: '¿Qué podemos hacer juntos para ayudar a su hijo?', context: 'Collaborative language positioning school and family as partners' },
];

const ed5Phrases: KeyPhrase[] = [
  { english: 'Congratulations on your graduation.', spanish: 'Felicitaciones por su graduación.', context: 'Celebrating student achievement at ceremony or transition' },
  { english: 'Your child has met all graduation requirements.', spanish: 'Su hijo ha cumplido con todos los requisitos de graduación.', context: 'Confirming eligibility for graduation' },
  { english: 'Transcript', spanish: 'Expediente académico', context: 'Official record required for college applications and transfers' },
  { english: 'Your child has been accepted to college.', spanish: 'Su hijo ha sido aceptado en la universidad.', context: 'Sharing college acceptance news with family' },
  { english: 'Financial aid', spanish: 'Ayuda financiera', context: 'Assistance programs for families with college costs' },
  { english: 'We are proud of your child\'s hard work.', spanish: 'Estamos orgullosos del trabajo duro de su hijo.', context: 'Acknowledging effort throughout the student\'s school career' },
  { english: 'Your child will receive their diploma by mail.', spanish: 'Su hijo recibirá su diploma por correo.', context: 'Logistics communication for diploma delivery' },
  { english: 'Career and technical education', spanish: 'Educación técnica y vocacional', context: 'Pathway option for students not pursuing a four-year college' },
  { english: 'Does your child have a plan after graduation?', spanish: '¿Su hijo tiene un plan después de la graduación?', context: 'Transition planning conversation at end of high school' },
  { english: 'We wish your child the best in the future.', spanish: 'Le deseamos lo mejor a su hijo en el futuro.', context: 'Closing message to family at end of school career' },
];

const con1Phrases: KeyPhrase[] = [
  { english: 'Always wear your hard hat on this jobsite.', spanish: 'Siempre use su casco en esta obra.', context: 'Mandatory PPE rule communicated during site orientation' },
  { english: 'Do not enter this area without authorization.', spanish: 'No entre a esta área sin autorización.', context: 'Restricted zone warning to prevent unauthorized access' },
  { english: 'Report all injuries immediately.', spanish: 'Reporte todas las lesiones de inmediato.', context: 'OSHA-required incident reporting instruction' },
  { english: 'Where is the nearest emergency exit?', spanish: '¿Dónde está la salida de emergencia más cercana?', context: 'Safety orientation question every worker must know' },
  { english: 'This area is a fall hazard.', spanish: 'Esta área es un peligro de caída.', context: 'Fall protection warning in elevated work zones' },
  { english: 'Toolbox talk', spanish: 'Charla de seguridad', context: 'Daily safety meeting held before work begins' },
  { english: 'Keep this area clean and organized.', spanish: 'Mantenga esta área limpia y organizada.', context: 'Housekeeping instruction to prevent trip hazards' },
  { english: 'Do not operate equipment without training.', spanish: 'No opere equipo sin capacitación.', context: 'Preventing untrained workers from using heavy machinery' },
  { english: 'The foreman is in charge of site safety.', spanish: 'El capataz está a cargo de la seguridad en la obra.', context: 'Establishing the chain of command for safety issues' },
  { english: 'Safety first on every job.', spanish: 'La seguridad es primero en todo trabajo.', context: 'Core safety culture message reinforced daily' },
];

const con2Phrases: KeyPhrase[] = [
  { english: 'You must wear safety glasses at all times.', spanish: 'Debe usar lentes de seguridad en todo momento.', context: 'Eye protection requirement in hazardous work areas' },
  { english: 'Put on your high-visibility vest before entering.', spanish: 'Póngase el chaleco de alta visibilidad antes de entrar.', context: 'Visibility requirement near active traffic or equipment' },
  { english: 'Steel-toed boots are required on this site.', spanish: 'Se requieren botas con punta de acero en esta obra.', context: 'Foot protection standard for all construction workers' },
  { english: 'Use gloves when handling sharp materials.', spanish: 'Use guantes al manejar materiales filosos.', context: 'Hand protection instruction for cut hazard prevention' },
  { english: 'This equipment requires a spotter.', spanish: 'Este equipo requiere un observador.', context: 'Operational safety requirement for heavy machinery' },
  { english: 'Inspect your harness before each use.', spanish: 'Inspeccione su arnés antes de cada uso.', context: 'Fall protection pre-use check procedure' },
  { english: 'Respirator', spanish: 'Respirador', context: 'Required PPE when working with dust, fumes, or chemicals' },
  { english: 'Hearing protection is required in this zone.', spanish: 'Se requiere protección auditiva en esta zona.', context: 'Noise hazard area requiring ear plugs or muffs' },
  { english: 'Check that all guards are in place before starting.', spanish: 'Verifique que todas las guardas estén en su lugar antes de comenzar.', context: 'Machine guarding pre-operation safety check' },
  { english: 'Do not modify or remove safety equipment.', spanish: 'No modifique ni retire el equipo de seguridad.', context: 'Preventing tampering with protective devices' },
];

const con3Phrases: KeyPhrase[] = [
  { english: 'This chemical is hazardous.', spanish: 'Este químico es peligroso.', context: 'HAZCOM warning for workers handling chemicals' },
  { english: 'Read the safety data sheet before use.', spanish: 'Lea la hoja de datos de seguridad antes de usar.', context: 'OSHA GHS requirement for chemical handling' },
  { english: 'Do not mix these two chemicals.', spanish: 'No mezcle estos dos químicos.', context: 'Preventing dangerous chemical reactions on site' },
  { english: 'Store flammable materials away from heat sources.', spanish: 'Almacene materiales inflamables lejos de fuentes de calor.', context: 'Fire prevention through proper chemical storage' },
  { english: 'Wash your hands before eating or drinking.', spanish: 'Lávese las manos antes de comer o beber.', context: 'Preventing chemical ingestion from contaminated hands' },
  { english: 'This area has been treated with chemicals.', spanish: 'Esta área ha sido tratada con químicos.', context: 'Site notification after chemical application' },
  { english: 'Where is the nearest eye wash station?', spanish: '¿Dónde está la estación de lavado de ojos más cercana?', context: 'Emergency response question for chemical splash incidents' },
  { english: 'Dispose of chemical waste properly.', spanish: 'Deseche los residuos químicos correctamente.', context: 'Environmental compliance and site safety rule' },
  { english: 'Do not eat or drink near chemical storage.', spanish: 'No coma ni beba cerca del almacenamiento de químicos.', context: 'Contamination prevention near hazardous materials' },
  { english: 'Poison', spanish: 'Veneno', context: 'Hazard label vocabulary for toxic substance identification' },
];

const con4Phrases: KeyPhrase[] = [
  { english: 'Call 911 immediately.', spanish: 'Llame al 911 de inmediato.', context: 'First response instruction in any life-threatening emergency' },
  { english: 'There has been an accident on site.', spanish: 'Hubo un accidente en la obra.', context: 'Reporting an incident to the foreman or safety officer' },
  { english: 'Where is the first aid kit?', spanish: '¿Dónde está el botiquín de primeros auxilios?', context: 'Locating emergency medical supplies on site' },
  { english: 'Do not move the injured worker.', spanish: 'No mueva al trabajador lesionado.', context: 'Preventing further injury after a fall or trauma' },
  { english: 'Evacuate the building immediately.', spanish: 'Evacúe el edificio de inmediato.', context: 'Fire, gas leak, or structural emergency directive' },
  { english: 'The emergency meeting point is outside the gate.', spanish: 'El punto de reunión de emergencia está fuera de la puerta.', context: 'Muster point location communicated during site orientation' },
  { english: 'Someone is not breathing.', spanish: 'Alguien no está respirando.', context: 'Critical communication during a medical emergency' },
  { english: 'Is anyone injured?', spanish: '¿Hay alguien lesionado?', context: 'First question asked after any site incident' },
  { english: 'The foreman has been notified.', spanish: 'El capataz ha sido notificado.', context: 'Confirming the chain of command has been alerted' },
  { english: 'Stay calm and follow instructions.', spanish: 'Manténgase calmado y siga las instrucciones.', context: 'Emergency crowd control and safety directive' },
];

const con5Phrases: KeyPhrase[] = [
  { english: 'Today\'s toolbox talk is about fall protection.', spanish: 'La charla de seguridad de hoy es sobre protección contra caídas.', context: 'Opening a daily safety meeting on a specific topic' },
  { english: 'Does anyone have a safety concern to raise?', spanish: '¿Alguien tiene alguna preocupación de seguridad que plantear?', context: 'Inviting worker feedback at the start of a safety talk' },
  { english: 'This is a new safety procedure starting today.', spanish: 'Este es un nuevo procedimiento de seguridad a partir de hoy.', context: 'Introducing updated safety rules to the crew' },
  { english: 'You are responsible for your team\'s safety.', spanish: 'Usted es responsable por la seguridad de su equipo.', context: 'Establishing supervisor accountability for crew safety' },
  { english: 'Sign the attendance sheet after the safety talk.', spanish: 'Firme la hoja de asistencia después de la charla de seguridad.', context: 'OSHA compliance documentation for training records' },
  { english: 'Never skip a safety step to save time.', spanish: 'Nunca omita un paso de seguridad para ahorrar tiempo.', context: 'Core safety culture message against shortcutting procedures' },
  { english: 'What did we cover in last week\'s safety talk?', spanish: '¿Qué cubrimos en la charla de seguridad de la semana pasada?', context: 'Knowledge reinforcement through review at start of meeting' },
  { english: 'If you see something unsafe, say something.', spanish: 'Si ve algo inseguro, dígalo.', context: 'Encouraging a speak-up safety culture on site' },
  { english: 'All workers must attend the safety briefing.', spanish: 'Todos los trabajadores deben asistir a la sesión informativa de seguridad.', context: 'Mandatory participation rule for safety meetings' },
  { english: 'Your supervisor will review the new procedures with you.', spanish: 'Su supervisor revisará los nuevos procedimientos con usted.', context: 'Directing workers to the appropriate person for further guidance' },
];

const ss1Phrases: KeyPhrase[] = [
  { english: 'Welcome. How can I help you today?', spanish: 'Bienvenido. ¿En qué puedo ayudarle hoy?', context: 'Standard greeting at a social services intake desk' },
  { english: 'Everything you share with us is confidential.', spanish: 'Todo lo que comparta con nosotros es confidencial.', context: 'Building trust and assuring privacy at intake' },
  { english: 'You have the right to an interpreter.', spanish: 'Usted tiene derecho a un intérprete.', context: 'Required language access disclosure under Title VI' },
  { english: 'Please fill out this intake form.', spanish: 'Por favor, complete este formulario de admisión.', context: 'Starting the client intake process' },
  { english: 'Do you have any identification with you?', spanish: '¿Tiene alguna identificación con usted?', context: 'Document request during client registration' },
  { english: 'What services are you looking for today?', spanish: '¿Qué servicios está buscando hoy?', context: 'Needs assessment at first point of contact' },
  { english: 'We will connect you with the right services.', spanish: 'Le conectaremos con los servicios adecuados.', context: 'Reassuring the client during intake navigation' },
  { english: 'Your information will not be shared without your consent.', spanish: 'Su información no será compartida sin su consentimiento.', context: 'HIPAA and privacy rights disclosure at intake' },
  { english: 'Do you feel safe right now?', spanish: '¿Se siente seguro en este momento?', context: 'Safety screening question at initial client contact' },
  { english: 'We are here to help you, not to judge you.', spanish: 'Estamos aquí para ayudarle, no para juzgarle.', context: 'Trauma-informed communication that reduces client shame' },
];

const ss2Phrases: KeyPhrase[] = [
  { english: 'Are you currently housed?', spanish: '¿Tiene vivienda en este momento?', context: 'Immediate housing stability screening question' },
  { english: 'We can help you find emergency shelter.', spanish: 'Podemos ayudarle a encontrar un refugio de emergencia.', context: 'Connecting clients to same-day emergency housing' },
  { english: 'How long have you been without stable housing?', spanish: '¿Cuánto tiempo ha estado sin vivienda estable?', context: 'Housing history for prioritization in shelter programs' },
  { english: 'Do you have children with you?', spanish: '¿Tiene hijos con usted?', context: 'Families with children are often prioritized for housing' },
  { english: 'The shelter has space available tonight.', spanish: 'El refugio tiene espacio disponible esta noche.', context: 'Real-time availability communication for emergency housing' },
  { english: 'You will need to follow shelter rules.', spanish: 'Deberá seguir las reglas del refugio.', context: 'Setting expectations before placement in a shelter program' },
  { english: 'We can help you apply for rental assistance.', spanish: 'Podemos ayudarle a solicitar asistencia de renta.', context: 'Connecting clients to housing subsidy programs' },
  { english: 'Have you been evicted recently?', spanish: '¿Ha sido desalojado recientemente?', context: 'Eviction history affects eligibility for some programs' },
  { english: 'Here is the address of the nearest shelter.', spanish: 'Aquí está la dirección del refugio más cercano.', context: 'Providing immediate, actionable next steps to clients' },
  { english: 'A case manager will follow up with you.', spanish: 'Un gestor de casos le dará seguimiento.', context: 'Setting expectations for ongoing housing support' },
];

const ss3Phrases: KeyPhrase[] = [
  { english: 'Do you currently receive any government benefits?', spanish: '¿Recibe actualmente algún beneficio del gobierno?', context: 'Benefits history check to prevent duplication and identify gaps' },
  { english: 'You may qualify for food assistance.', spanish: 'Puede calificar para asistencia de alimentos.', context: 'Introducing SNAP or food bank eligibility to a client' },
  { english: 'What is your household income?', spanish: '¿Cuál es el ingreso de su hogar?', context: 'Income verification required for benefit eligibility determination' },
  { english: 'How many people live in your household?', spanish: '¿Cuántas personas viven en su hogar?', context: 'Household size is a key factor in benefits calculations' },
  { english: 'We can help you apply for Medi-Cal.', spanish: 'Podemos ayudarle a solicitar Medi-Cal.', context: 'Connecting uninsured clients to state health coverage' },
  { english: 'You will need to renew your benefits annually.', spanish: 'Deberá renovar sus beneficios anualmente.', context: 'Preventing benefit loss due to missed renewal deadlines' },
  { english: 'Do you have a Social Security number?', spanish: '¿Tiene número de Seguro Social?', context: 'Required for most federal and state benefit applications' },
  { english: 'Your application is being processed.', spanish: 'Su solicitud está siendo procesada.', context: 'Status update to reduce client anxiety after applying' },
  { english: 'Here is a list of documents you will need.', spanish: 'Aquí hay una lista de documentos que necesitará.', context: 'Preparation guidance before a benefits appointment' },
  { english: 'You have been approved for benefits.', spanish: 'Ha sido aprobado para recibir beneficios.', context: 'Communicating a positive eligibility determination' },
];

const ss4Phrases: KeyPhrase[] = [
  { english: 'You are safe here.', spanish: 'Está seguro aquí.', context: 'Immediate safety reassurance for DV survivors' },
  { english: 'Do you feel safe at home?', spanish: '¿Se siente seguro en casa?', context: 'Routine DV screening question in social services settings' },
  { english: 'Has someone hurt you or threatened you?', spanish: '¿Alguien le ha lastimado o amenazado?', context: 'Direct DV disclosure question requiring careful delivery' },
  { english: 'We can help you create a safety plan.', spanish: 'Podemos ayudarle a crear un plan de seguridad.', context: 'Practical safety planning for clients in dangerous situations' },
  { english: 'The hotline number is available 24 hours.', spanish: 'El número de la línea de ayuda está disponible las 24 horas.', context: 'Providing DV crisis hotline contact information' },
  { english: 'You are not alone.', spanish: 'No está solo.', context: 'Emotional support statement that reduces isolation for survivors' },
  { english: 'We can help you find emergency shelter tonight.', spanish: 'Podemos ayudarle a encontrar un refugio de emergencia esta noche.', context: 'Immediate safety response for survivors in crisis' },
  { english: 'This information will be kept private.', spanish: 'Esta información se mantendrá privada.', context: 'Confidentiality assurance critical for DV disclosures' },
  { english: 'You have legal rights and options.', spanish: 'Usted tiene derechos y opciones legales.', context: 'Empowering survivors with knowledge of restraining orders and legal aid' },
  { english: 'There is no excuse for violence.', spanish: 'No hay excusa para la violencia.', context: 'Clear statement that removes self-blame from survivors' },
];

const ss5Phrases: KeyPhrase[] = [
  { english: 'We are closing your case today.', spanish: 'Estamos cerrando su caso hoy.', context: 'Formal case closure notification to the client' },
  { english: 'Have your needs been met?', spanish: '¿Han sido satisfechas sus necesidades?', context: 'Final needs assessment before closing a case' },
  { english: 'Here is a summary of the services you received.', spanish: 'Aquí hay un resumen de los servicios que recibió.', context: 'Documentation review at case closure meeting' },
  { english: 'You can contact us again if you need help.', spanish: 'Puede contactarnos nuevamente si necesita ayuda.', context: 'Open-door message encouraging clients to return if needed' },
  { english: 'We will do a 30-day follow-up call.', spanish: 'Haremos una llamada de seguimiento a los 30 días.', context: 'Post-closure check-in to verify continued stability' },
  { english: 'Do you have a support system in place?', spanish: '¿Tiene una red de apoyo establecida?', context: 'Ensuring the client has resources after case closure' },
  { english: 'Here is a list of community resources.', spanish: 'Aquí hay una lista de recursos comunitarios.', context: 'Transition planning resource packet given at closure' },
  { english: 'It has been a pleasure working with you.', spanish: 'Ha sido un placer trabajar con usted.', context: 'Professional closing statement that affirms the client\'s dignity' },
  { english: 'Your case has been resolved successfully.', spanish: 'Su caso ha sido resuelto exitosamente.', context: 'Positive outcome statement reinforcing the client\'s progress' },
  { english: 'May we contact you for a follow-up in 30 days?', spanish: '¿Podemos contactarle para un seguimiento en 30 días?', context: 'Consent request for post-closure outreach' },
];

const mh1Phrases: KeyPhrase[] = [
  { english: 'I am here to listen, not to judge.', spanish: 'Estoy aquí para escuchar, no para juzgar.', context: 'Establishing psychological safety at the start of an assessment' },
  { english: 'Are you having thoughts of harming yourself?', spanish: '¿Está teniendo pensamientos de hacerse daño?', context: 'Direct suicide risk screening question' },
  { english: 'You are not alone in what you are feeling.', spanish: 'No está solo en lo que siente.', context: 'Normalizing distress to reduce shame during crisis' },
  { english: 'Everything you tell me is confidential.', spanish: 'Todo lo que me diga es confidencial.', context: 'Privacy assurance that encourages honest disclosure' },
  { english: 'How long have you been feeling this way?', spanish: '¿Cuánto tiempo lleva sintiéndose así?', context: 'Duration question for initial mental health assessment' },
  { english: 'Do you have a safety plan?', spanish: '¿Tiene un plan de seguridad?', context: 'Checking for existing crisis planning with at-risk clients' },
  { english: 'I want to make sure you are safe.', spanish: 'Quiero asegurarme de que esté seguro.', context: 'Safety-focused language during an initial mental health assessment' },
  { english: 'Have you ever received mental health services before?', spanish: '¿Ha recibido servicios de salud mental antes?', context: 'Treatment history question in an initial assessment' },
  { english: 'How would you describe your mood today?', spanish: '¿Cómo describiría su estado de ánimo hoy?', context: 'Open-ended mood assessment question' },
  { english: 'We are going to figure this out together.', spanish: 'Vamos a resolver esto juntos.', context: 'Collaborative framing that builds therapeutic alliance' },
];

const mh2Phrases: KeyPhrase[] = [
  { english: 'Have you been feeling sad or hopeless lately?', spanish: '¿Ha estado sintiéndose triste o sin esperanza últimamente?', context: 'Depression screening question from PHQ-9' },
  { english: 'Have you lost interest in things you used to enjoy?', spanish: '¿Ha perdido interés en cosas que antes disfrutaba?', context: 'Anhedonia screening — core depression symptom' },
  { english: 'Are you having trouble sleeping?', spanish: '¿Tiene problemas para dormir?', context: 'Sleep disturbance screening for depression and anxiety' },
  { english: 'Do you feel nervous or anxious most of the time?', spanish: '¿Se siente nervioso o ansioso la mayor parte del tiempo?', context: 'Generalized anxiety screening question' },
  { english: 'Have you had panic attacks?', spanish: '¿Ha tenido ataques de pánico?', context: 'Panic disorder screening question' },
  { english: 'On a scale of 1 to 10, how is your mood today?', spanish: 'En una escala del 1 al 10, ¿cómo está su estado de ánimo hoy?', context: 'Standardized mood tracking tool used in ongoing sessions' },
  { english: 'Have you been able to eat regularly?', spanish: '¿Ha podido comer regularmente?', context: 'Appetite and self-care assessment in depression screening' },
  { english: 'Do you feel overwhelmed by daily tasks?', spanish: '¿Se siente abrumado por las tareas diarias?', context: 'Functional impairment screening in depression and anxiety' },
  { english: 'How long have these feelings been going on?', spanish: '¿Cuánto tiempo llevan estos sentimientos?', context: 'Duration assessment to distinguish adjustment from clinical disorder' },
  { english: 'You showed a lot of courage coming here today.', spanish: 'Mostró mucho valor al venir aquí hoy.', context: 'Affirming the client for seeking help — reduces stigma' },
];

const mh3Phrases: KeyPhrase[] = [
  { english: 'I want to understand your experience.', spanish: 'Quiero entender su experiencia.', context: 'Trauma-informed opening that centers the client\'s perspective' },
  { english: 'You do not have to share anything you are not ready to share.', spanish: 'No tiene que compartir nada que no esté listo para compartir.', context: 'Respecting client pace in trauma-informed care' },
  { english: 'What happened to you is not your fault.', spanish: 'Lo que le pasó no es su culpa.', context: 'Core trauma-informed statement that removes self-blame' },
  { english: 'Have you experienced a traumatic event in your life?', spanish: '¿Ha experimentado un evento traumático en su vida?', context: 'Trauma history screening in an intake or assessment setting' },
  { english: 'Your feelings are a normal response to what you experienced.', spanish: 'Sus sentimientos son una respuesta normal a lo que vivió.', context: 'Normalizing trauma reactions as part of psychoeducation' },
  { english: 'We will go at a pace that is comfortable for you.', spanish: 'Iremos a un ritmo que sea cómodo para usted.', context: 'Trauma-informed pacing that gives control to the client' },
  { english: 'Do you feel safe in your current environment?', spanish: '¿Se siente seguro en su entorno actual?', context: 'Present-moment safety check throughout trauma-informed care' },
  { english: 'You have survived very difficult things.', spanish: 'Ha sobrevivido cosas muy difíciles.', context: 'Strengths-based reframe acknowledging resilience' },
  { english: 'It takes courage to talk about painful experiences.', spanish: 'Se necesita valor para hablar sobre experiencias dolorosas.', context: 'Affirming the client for engaging in trauma work' },
  { english: 'I believe what you are telling me.', spanish: 'Creo lo que me está diciendo.', context: 'Validation statement essential in trauma-informed practice' },
];

const mh4Phrases: KeyPhrase[] = [
  { english: 'Are you thinking about suicide right now?', spanish: '¿Está pensando en el suicidio en este momento?', context: 'Direct crisis assessment question during acute intervention' },
  { english: 'Do you have a plan to hurt yourself?', spanish: '¿Tiene un plan para hacerse daño?', context: 'Lethality assessment question for suicide risk' },
  { english: 'I am going to stay with you right now.', spanish: 'Voy a quedarme con usted en este momento.', context: 'Crisis de-escalation through physical presence and support' },
  { english: 'We need to get you immediate help.', spanish: 'Necesitamos conseguirle ayuda inmediata.', context: 'Directing to emergency services during a mental health crisis' },
  { english: 'You called the right place.', spanish: 'Llamó al lugar correcto.', context: 'Validating the client\'s decision to reach out during a crisis' },
  { english: 'Can you tell me where you are right now?', spanish: '¿Puede decirme dónde está en este momento?', context: 'Location question needed to dispatch emergency services' },
  { english: 'Is there someone who can be with you?', spanish: '¿Hay alguien que pueda estar con usted?', context: 'Safety planning through social support during a crisis' },
  { english: 'Let\'s make a plan to keep you safe tonight.', spanish: 'Hagamos un plan para mantenerlo seguro esta noche.', context: 'Short-term safety planning during crisis intervention' },
  { english: 'The crisis line is available 24 hours a day.', spanish: 'La línea de crisis está disponible las 24 horas del día.', context: 'Connecting client to after-hours crisis support resources' },
  { english: 'You matter, and your life has value.', spanish: 'Usted importa, y su vida tiene valor.', context: 'Affirmation of the client\'s worth during suicidal crisis' },
];

const mh5Phrases: KeyPhrase[] = [
  { english: 'How have you been feeling since our last session?', spanish: '¿Cómo se ha sentido desde nuestra última sesión?', context: 'Check-in opening that tracks progress between appointments' },
  { english: 'What coping strategies have worked for you?', spanish: '¿Qué estrategias de afrontamiento le han funcionado?', context: 'Building on client strengths in recovery planning' },
  { english: 'Recovery is a journey, not a destination.', spanish: 'La recuperación es un camino, no un destino.', context: 'Psychoeducation that reframes setbacks as part of the process' },
  { english: 'Let\'s set a goal for this week.', spanish: 'Establezcamos una meta para esta semana.', context: 'Collaborative goal-setting in a wellness plan session' },
  { english: 'What does a good day look like for you?', spanish: '¿Cómo se ve un buen día para usted?', context: 'Identifying baseline wellbeing markers for treatment planning' },
  { english: 'Have you been taking your medication as prescribed?', spanish: '¿Ha estado tomando sus medicamentos como se le indicó?', context: 'Medication adherence check in a recovery follow-up session' },
  { english: 'What support do you have outside of these sessions?', spanish: '¿Qué apoyo tiene fuera de estas sesiones?', context: 'Assessing social support network in a wellness plan' },
  { english: 'You have made a lot of progress.', spanish: 'Ha progresado mucho.', context: 'Affirming client gains to reinforce motivation in recovery' },
  { english: 'What would help you stay on track?', spanish: '¿Qué le ayudaría a mantenerse en el camino correcto?', context: 'Client-centered question to identify relapse prevention strategies' },
  { english: 'I am proud of the work you have done.', spanish: 'Estoy orgulloso del trabajo que ha realizado.', context: 'Closing affirmation in a wellness or recovery planning session' },
];

const pm1Questions: QuizQuestion[] = [
  {
    question: "How do you ask a tenant 'Is there a leak in your apartment?'",
    options: ['¿Hay una gotera en su apartamento?', '¿Hay ruido en su apartamento?', '¿Hay una llave rota?', '¿Necesita más agua?'],
    correctIndex: 0,
    explanation: "'¿Hay una gotera en su apartamento?' directly asks about a water leak — the most common maintenance report.",
  },
  {
    question: "Which phrase means 'Please describe the problem'?",
    options: ['Por favor, describa el problema.', 'Por favor, firme aquí.', 'Por favor, llame más tarde.', 'Por favor, espere afuera.'],
    correctIndex: 0,
    explanation: "'Por favor, describa el problema' invites the tenant to explain the issue clearly before submitting a work order.",
  },
  {
    question: "How do you say 'We will send someone to fix it'?",
    options: ['Vamos a mandarle una carta.', 'Vamos a mandar a alguien para repararlo.', 'Necesita llamar al propietario.', 'Debe esperar dos semanas.'],
    correctIndex: 1,
    explanation: "'Vamos a mandar a alguien para repararlo' tells the tenant a technician will come — managing expectations early.",
  },
  {
    question: "'¿Cuándo comenzó el problema?' means:",
    options: ['Where is the problem?', 'How bad is the problem?', 'When did the problem start?', 'Who caused the problem?'],
    correctIndex: 2,
    explanation: "'¿Cuándo comenzó el problema?' establishes the timeline — important for determining urgency and liability.",
  },
  {
    question: "Which phrase means 'We need to access your unit to make the repair'?",
    options: ['Necesitamos acceder a su unidad para hacer la reparación.', 'Necesitamos su firma en el contrato.', 'Necesitamos su número de teléfono.', 'Necesitamos renovar su contrato.'],
    correctIndex: 0,
    explanation: "'Necesitamos acceder a su unidad para hacer la reparación' is the standard phrasing for requesting legal unit access.",
  },
  {
    question: "How do you tell a tenant 'The office is open Monday through Friday'?",
    options: ['La oficina abre los fines de semana.', 'La oficina está cerrada esta semana.', 'La oficina está abierta de lunes a viernes.', 'La oficina abre solo por la tarde.'],
    correctIndex: 2,
    explanation: "'La oficina está abierta de lunes a viernes' sets clear office hours — reducing after-hours contact attempts.",
  },
  {
    question: "Which phrase means 'Please submit a written request'?",
    options: ['Por favor, hable con su vecino.', 'Por favor, presente una solicitud por escrito.', 'Por favor, llame al número de emergencia.', 'Por favor, espere la aprobación.'],
    correctIndex: 1,
    explanation: "'Por favor, presente una solicitud por escrito' initiates the formal maintenance request process.",
  },
  {
    question: "How do you say 'Someone will be there between 9 and 11 in the morning'?",
    options: ['Alguien llegará entre las 9 y las 11 de la mañana.', 'Alguien llegará mañana por la tarde.', 'Nadie puede venir hoy.', 'Llame antes de las 9.'],
    correctIndex: 0,
    explanation: "'Alguien llegará entre las 9 y las 11 de la mañana' sets a repair window — reducing missed appointment friction.",
  },
  {
    question: "'¿Está en casa durante el día?' means:",
    options: ['Are you home in the evenings?', 'Are you home during the day?', 'Are you available on weekends?', 'Are you home right now?'],
    correctIndex: 1,
    explanation: "'¿Está en casa durante el día?' confirms availability before scheduling a maintenance visit.",
  },
  {
    question: "How do you say 'Thank you for letting us know'?",
    options: ['Gracias por avisarnos.', 'Gracias por esperar.', 'Gracias por pagar.', 'Gracias por mudarse.'],
    correctIndex: 0,
    explanation: "'Gracias por avisarnos' acknowledges the tenant's report professionally — setting a cooperative tone.",
  },
];

const pm2Questions: QuizQuestion[] = [
  {
    question: "How do you ask 'Is this an emergency?'",
    options: ['¿Es una emergencia?', '¿Es un problema pequeño?', '¿Es nuevo el problema?', '¿Es su primer reporte?'],
    correctIndex: 0,
    explanation: "'¿Es una emergencia?' determines whether a work order requires same-day dispatch or routine scheduling.",
  },
  {
    question: "Which phrase describes a broken pipe that is flooding?",
    options: ['Una tubería rota que está inundando', 'Un problema menor de fontanería', 'Una gotera pequeña en el techo', 'Un desagüe lento en el baño'],
    correctIndex: 0,
    explanation: "'Una tubería rota que está inundando' = a broken pipe that is flooding — a Level 1 emergency requiring immediate response.",
  },
  {
    question: "How do you say 'We need to turn off the water to your unit'?",
    options: ['Necesitamos limpiar su unidad.', 'Necesitamos apagar el agua de su unidad.', 'Necesitamos revisar su contrato.', 'Necesitamos abrir las ventanas.'],
    correctIndex: 1,
    explanation: "'Necesitamos apagar el agua de su unidad' is the critical phrase used before stopping water service for emergency repairs.",
  },
  {
    question: "'Permiso de acceso' means:",
    options: ['Parking permit', 'Access permission', 'Utility payment', 'Move-in form'],
    correctIndex: 1,
    explanation: "'Permiso de acceso' = access permission. Landlords must document tenant consent before entering a unit.",
  },
  {
    question: "How do you ask 'Can the vendor enter on Tuesday?'",
    options: ['¿Puede el proveedor entrar el martes?', '¿Puede el inquilino salir el martes?', '¿Puede el técnico cobrar el martes?', '¿Puede el gerente llamar el martes?'],
    correctIndex: 0,
    explanation: "'¿Puede el proveedor entrar el martes?' confirms tenant availability for vendor access — required for legal entry.",
  },
  {
    question: "Which phrase means 'The repair will take about two hours'?",
    options: ['La reparación durará unos dos días.', 'La reparación es muy complicada.', 'La reparación tardará unas dos horas.', 'La reparación no se puede hacer hoy.'],
    correctIndex: 2,
    explanation: "'La reparación tardará unas dos horas' sets the work duration expectation — reducing tenant anxiety during repairs.",
  },
  {
    question: "How do you say 'Please keep the area clear for the technician'?",
    options: ['Por favor, llame al técnico usted mismo.', 'Por favor, mantenga el área despejada para el técnico.', 'Por favor, espere en otra habitación.', 'Por favor, cierre todas las puertas.'],
    correctIndex: 1,
    explanation: "'Por favor, mantenga el área despejada para el técnico' ensures safe work conditions for the repair crew.",
  },
  {
    question: "'Trabajo de rutina' means:",
    options: ['Emergency repair', 'Routine work', 'Urgent inspection', 'Final walkthrough'],
    correctIndex: 1,
    explanation: "'Trabajo de rutina' = routine work. Used to distinguish non-urgent repairs from emergencies in dispatch prioritization.",
  },
  {
    question: "How do you ask 'Did the technician complete the repair?'",
    options: ['¿Terminó el técnico la reparación?', '¿Llegó el técnico ayer?', '¿Pagó el técnico la factura?', '¿Necesita el técnico más herramientas?'],
    correctIndex: 0,
    explanation: "'¿Terminó el técnico la reparación?' closes the work order loop — confirming job completion with the tenant.",
  },
  {
    question: "Which phrase means 'Please sign to confirm the work is done'?",
    options: ['Por favor, firme para confirmar que el trabajo está terminado.', 'Por favor, pague la factura en línea.', 'Por favor, llame a la oficina cuando llegue el técnico.', 'Por favor, describa el daño adicional.'],
    correctIndex: 0,
    explanation: "'Por favor, firme para confirmar que el trabajo está terminado' is the standard tenant sign-off phrase for work order closure.",
  },
];

const pm3Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Your rent is due on the first of each month'?",
    options: ['Su renta vence el primero de cada mes.', 'Su renta vence el último día del mes.', 'Su renta debe pagarse cada dos semanas.', 'Su renta vence cuando usted decida.'],
    correctIndex: 0,
    explanation: "'Su renta vence el primero de cada mes' establishes the rent due date — the most fundamental lease term to communicate.",
  },
  {
    question: "'Cargo por pago atrasado' means:",
    options: ['Lease renewal fee', 'Late payment fee', 'Security deposit', 'Move-out charge'],
    correctIndex: 1,
    explanation: "'Cargo por pago atrasado' = late payment fee. Clear communication of this term reduces disputes and non-payment.",
  },
  {
    question: "How do you ask 'Have you paid your rent this month?'",
    options: ['¿Ha pagado su renta este mes?', '¿Ha firmado su contrato este mes?', '¿Ha renovado su seguro este mes?', '¿Ha recibido su recibo este mes?'],
    correctIndex: 0,
    explanation: "'¿Ha pagado su renta este mes?' is the direct payment confirmation question used during collections follow-up.",
  },
  {
    question: "Which phrase means 'We can set up a payment plan for you'?",
    options: ['Podemos cancelar su contrato de arrendamiento.', 'Podemos establecer un plan de pago para usted.', 'Podemos darle una prórroga permanente.', 'Podemos reducir su renta mensual.'],
    correctIndex: 1,
    explanation: "'Podemos establecer un plan de pago para usted' opens a collaborative resolution that avoids eviction proceedings.",
  },
  {
    question: "How do you explain 'Your lease ends on December 31st'?",
    options: ['Su contrato vence el 31 de diciembre.', 'Su contrato empieza el 31 de diciembre.', 'Su contrato se renueva el 31 de diciembre.', 'Su contrato se cancela en enero.'],
    correctIndex: 0,
    explanation: "'Su contrato vence el 31 de diciembre' clearly states the lease termination date — critical for renewal or move-out planning.",
  },
  {
    question: "'Depósito de seguridad' means:",
    options: ['Monthly rent', 'Security deposit', 'Cleaning fee', 'Application fee'],
    correctIndex: 1,
    explanation: "'Depósito de seguridad' = security deposit. Understanding this term helps tenants know what is refundable.",
  },
  {
    question: "How do you say 'You have a balance of $200 due'?",
    options: ['Tiene un saldo de $200 pendiente.', 'Tiene un descuento de $200 disponible.', 'Tiene un crédito de $200 en su cuenta.', 'Tiene un recibo de $200 en la oficina.'],
    correctIndex: 0,
    explanation: "'Tiene un saldo de $200 pendiente' communicates an outstanding balance clearly — preventing misunderstanding.",
  },
  {
    question: "Which phrase means 'The lease automatically renews unless you give notice'?",
    options: ['El contrato se cancela automáticamente sin aviso.', 'El contrato se renueva automáticamente a menos que dé aviso.', 'El contrato requiere firma nueva cada año.', 'El contrato no se puede renovar.'],
    correctIndex: 1,
    explanation: "'El contrato se renueva automáticamente a menos que dé aviso' informs tenants of auto-renewal terms — reducing move-out disputes.",
  },
  {
    question: "How do you ask 'Do you need help understanding the lease terms?'",
    options: ['¿Necesita ayuda para entender los términos del contrato?', '¿Necesita una copia del contrato en inglés?', '¿Necesita un abogado para firmar?', '¿Necesita más tiempo para mudarse?'],
    correctIndex: 0,
    explanation: "'¿Necesita ayuda para entender los términos del contrato?' proactively supports tenant comprehension — reducing legal risk.",
  },
  {
    question: "'¿Cómo prefiere pagar su renta?' means:",
    options: ['How much is your rent?', 'When did you last pay rent?', 'How do you prefer to pay your rent?', 'Where do you pay your rent?'],
    correctIndex: 2,
    explanation: "'¿Cómo prefiere pagar su renta?' opens a conversation about payment methods — online, check, or money order.",
  },
];

const pm4Questions: QuizQuestion[] = [
  {
    question: "How do you say 'We will enter your unit on Thursday at 10 AM'?",
    options: ['Entraremos a su unidad el jueves a las 10 de la mañana.', 'Entraremos a su unidad el viernes por la tarde.', 'Enviaremos una carta el jueves.', 'Llamaremos antes del jueves.'],
    correctIndex: 0,
    explanation: "'Entraremos a su unidad el jueves a las 10 de la mañana' is the standard advance entry notice phrasing — legally required in most states.",
  },
  {
    question: "Which phrase means 'This is a violation of your lease agreement'?",
    options: ['Esto es una violación de su contrato de arrendamiento.', 'Esto es un problema de mantenimiento.', 'Esto requiere su firma inmediata.', 'Esto está permitido bajo las reglas de la propiedad.'],
    correctIndex: 0,
    explanation: "'Esto es una violación de su contrato de arrendamiento' is used in formal compliance conversations — clear and legally precise.",
  },
  {
    question: "How do you ask 'Is there a pet in your unit?'",
    options: ['¿Hay una mascota en su unidad?', '¿Tiene un jardín en su unidad?', '¿Hay niños en su unidad?', '¿Hay invitados en su unidad?'],
    correctIndex: 0,
    explanation: "'¿Hay una mascota en su unidad?' is used during inspections to identify unauthorized animals — a common lease violation.",
  },
  {
    question: "'Aviso de desalojo' means:",
    options: ['Move-in inspection', 'Lease renewal notice', 'Eviction notice', 'Entry notice'],
    correctIndex: 2,
    explanation: "'Aviso de desalojo' = eviction notice. Knowing this term helps staff communicate the seriousness of non-compliance.",
  },
  {
    question: "How do you say 'You have the right to a safe living environment'?",
    options: ['Usted tiene el derecho a un ambiente de vida seguro.', 'Usted debe mantener su unidad limpia.', 'Usted no puede hacer cambios en la unidad.', 'Usted debe pagar por todos los daños.'],
    correctIndex: 0,
    explanation: "'Usted tiene el derecho a un ambiente de vida seguro' is a tenant rights statement — builds trust and reduces adversarial situations.",
  },
  {
    question: "Which phrase means 'Smoking is not allowed on the property'?",
    options: ['Fumar no está permitido en la propiedad.', 'Fumar solo está permitido afuera.', 'Fumar está permitido en las áreas comunes.', 'Fumar no afecta su contrato.'],
    correctIndex: 0,
    explanation: "'Fumar no está permitido en la propiedad' enforces a no-smoking policy — a common lease addendum requirement.",
  },
  {
    question: "How do you say 'We will document this with a written notice'?",
    options: ['Vamos a documentar esto con un aviso escrito.', 'Vamos a cancelar su contrato de inmediato.', 'Vamos a llamar a las autoridades.', 'Vamos a cobrar una multa adicional.'],
    correctIndex: 0,
    explanation: "'Vamos a documentar esto con un aviso escrito' communicates a formal follow-up step — important for legal paper trails.",
  },
  {
    question: "'¿Recibió el aviso de entrada?' means:",
    options: ['Did you pay the entry fee?', 'Did you receive the entry notice?', 'Did you sign the entry permit?', 'Did you schedule the inspection?'],
    correctIndex: 1,
    explanation: "'¿Recibió el aviso de entrada?' confirms the tenant received proper notice — satisfying legal notification requirements.",
  },
  {
    question: "How do you explain 'Noise must stop by 10 PM per building rules'?",
    options: ['El ruido debe cesar a las 10 PM según las reglas del edificio.', 'El ruido no está permitido durante el día.', 'El ruido es permitido hasta medianoche los fines de semana.', 'El ruido debe reportarse a la policía.'],
    correctIndex: 0,
    explanation: "'El ruido debe cesar a las 10 PM según las reglas del edificio' enforces quiet hours — critical to preventing neighbor complaints.",
  },
  {
    question: "Which phrase means 'You are responsible for keeping common areas clean'?",
    options: ['Usted es responsable de mantener limpias las áreas comunes.', 'La administración limpia todas las áreas.', 'Los vecinos comparten la responsabilidad de reparaciones.', 'Las áreas comunes son solo para uso del personal.'],
    correctIndex: 0,
    explanation: "'Usted es responsable de mantener limpias las áreas comunes' sets shared-space expectations — reducing housekeeping disputes.",
  },
];

const pm5Questions: QuizQuestion[] = [
  {
    question: "How do you begin a de-escalation with 'I understand this is frustrating'?",
    options: ['Entiendo que esto es frustrante.', 'Eso no es mi responsabilidad.', 'Por favor, no grite en la oficina.', 'Llame a la línea de emergencia.'],
    correctIndex: 0,
    explanation: "'Entiendo que esto es frustrante' validates the tenant's emotion — the first step in every de-escalation model.",
  },
  {
    question: "Which phrase means 'Let's find a solution together'?",
    options: ['Vamos a encontrar una solución juntos.', 'Esto no tiene solución posible.', 'Hable con el dueño del edificio.', 'Escriba su queja por correo.'],
    correctIndex: 0,
    explanation: "'Vamos a encontrar una solución juntos' shifts the dynamic from adversarial to collaborative — critical for de-escalation.",
  },
  {
    question: "How do you say 'Please tell me what happened from the beginning'?",
    options: ['Por favor, cuénteme qué pasó desde el principio.', 'Por favor, firme este formulario primero.', 'Por favor, espere a que llegue mi supervisor.', 'Por favor, regrese mañana con la documentación.'],
    correctIndex: 0,
    explanation: "'Por favor, cuénteme qué pasó desde el principio' invites a full explanation — gathering facts before responding.",
  },
  {
    question: "'¿Cómo puedo ayudarle hoy?' means:",
    options: ['How long have you lived here?', 'How can I help you today?', 'How did this happen?', 'How much do you owe?'],
    correctIndex: 1,
    explanation: "'¿Cómo puedo ayudarle hoy?' opens every interaction on a service-oriented note — reducing defensive posturing.",
  },
  {
    question: "How do you say 'I will follow up with you within 24 hours'?",
    options: ['Me pondré en contacto con usted en 24 horas.', 'Le mandaré una carta dentro de dos semanas.', 'No puedo prometerle nada en este momento.', 'Hable con alguien en la oficina principal.'],
    correctIndex: 0,
    explanation: "'Me pondré en contacto con usted en 24 horas' sets a clear commitment — reducing tenant anxiety and repeat contacts.",
  },
  {
    question: "Which phrase means 'I hear your concern and we take it seriously'?",
    options: ['Escucho su preocupación y la tomamos en serio.', 'Su preocupación no está dentro de nuestras reglas.', 'Debe hablar con el propietario directamente.', 'Presentaremos su queja a la ciudad.'],
    correctIndex: 0,
    explanation: "'Escucho su preocupación y la tomamos en serio' demonstrates active listening — the foundation of professional conflict resolution.",
  },
  {
    question: "How do you say 'This is our policy and I am not able to make exceptions'?",
    options: ['Esta es nuestra política y no puedo hacer excepciones.', 'Esta política solo aplica a algunos inquilinos.', 'Las excepciones son posibles con aprobación.', 'La política cambia según el caso.'],
    correctIndex: 0,
    explanation: "'Esta es nuestra política y no puedo hacer excepciones' sets firm, fair limits — maintaining professionalism without escalating.",
  },
  {
    question: "'¿Hay algo más en lo que pueda ayudarle?' means:",
    options: ['Is there a problem I can report?', 'Is there anything else I can help you with?', 'Is there someone else you can call?', 'Is there a fee for this service?'],
    correctIndex: 1,
    explanation: "'¿Hay algo más en lo que pueda ayudarle?' closes interactions professionally — signaling attentiveness and goodwill.",
  },
  {
    question: "How do you say 'I want to make sure we resolve this for you'?",
    options: ['Quiero asegurarme de que resolvamos esto para usted.', 'Quiero que entienda nuestras reglas.', 'Quiero documentar todo lo que dijo.', 'Quiero hablar con mi supervisor primero.'],
    correctIndex: 0,
    explanation: "'Quiero asegurarme de que resolvamos esto para usted' is a resolution commitment — reinforcing tenant-centered service.",
  },
  {
    question: "Which phrase means 'Thank you for your patience'?",
    options: ['Gracias por su paciencia.', 'Gracias por mudarse pronto.', 'Gracias por pagar a tiempo.', 'Gracias por llamar antes de venir.'],
    correctIndex: 0,
    explanation: "'Gracias por su paciencia' acknowledges the tenant's cooperation — always use it when a resolution took longer than expected.",
  },
];

const pm1Phrases: KeyPhrase[] = [
  { english: 'Is there a problem in your apartment?', spanish: '¿Hay un problema en su apartamento?', context: 'Opening a tenant maintenance conversation at the front desk' },
  { english: 'When did the problem start?', spanish: '¿Cuándo empezó el problema?', context: 'Gathering timeline information before creating a work order' },
  { english: 'We will send a technician as soon as possible.', spanish: 'Enviaremos a un técnico lo antes posible.', context: 'Reassuring a tenant that their request is being processed' },
  { english: 'Please leave a note if you are not home.', spanish: 'Por favor, deje una nota si no está en casa.', context: 'Coordinating access for a repair visit' },
  { english: 'The office is open Monday through Friday from 9 to 5.', spanish: 'La oficina está abierta de lunes a viernes de 9 a 5.', context: 'Responding to an after-hours tenant inquiry about office access' },
];

const pm2Phrases: KeyPhrase[] = [
  { english: 'This is an emergency repair.', spanish: 'Esta es una reparación de emergencia.', context: 'Classifying a work order as critical priority for same-day dispatch' },
  { english: 'The technician will arrive between 10 AM and 12 PM.', spanish: 'El técnico llegará entre las 10 y las 12 del mediodía.', context: 'Setting a repair window for a scheduled maintenance visit' },
  { english: 'Please keep the area around the problem clear.', spanish: 'Por favor, mantenga el área alrededor del problema despejada.', context: 'Preparing the tenant before a repair crew arrives' },
  { english: 'We need your permission to enter the unit.', spanish: 'Necesitamos su permiso para entrar a la unidad.', context: 'Requesting verbal or written consent before non-emergency access' },
  { english: 'Please sign here to confirm the work is complete.', spanish: 'Por favor, firme aquí para confirmar que el trabajo está completo.', context: 'Closing a work order with tenant sign-off documentation' },
];

const pm3Phrases: KeyPhrase[] = [
  { english: 'Your rent is due on the first of the month.', spanish: 'Su renta vence el primero del mes.', context: 'Reminding a tenant of the monthly payment due date' },
  { english: 'There is a late fee if payment is received after the 5th.', spanish: 'Hay un cargo por pago tardío si el pago se recibe después del día 5.', context: 'Explaining late fee policy during a lease signing or payment follow-up' },
  { english: 'We can set up a payment plan if needed.', spanish: 'Podemos establecer un plan de pago si es necesario.', context: 'Offering flexibility to a tenant experiencing financial hardship' },
  { english: 'Your lease expires on December 31st.', spanish: 'Su contrato vence el 31 de diciembre.', context: 'Communicating lease end date during a renewal discussion' },
  { english: 'Do you have any questions about the lease terms?', spanish: '¿Tiene alguna pregunta sobre los términos del contrato?', context: 'Closing a lease signing meeting with an open offer to clarify terms' },
];

const pm4Phrases: KeyPhrase[] = [
  { english: 'We will enter your unit on Monday at 10 AM to perform an inspection.', spanish: 'Entraremos a su unidad el lunes a las 10 AM para realizar una inspección.', context: 'Delivering a legally required advance entry notice to a tenant' },
  { english: 'This is a lease violation notice.', spanish: 'Este es un aviso de violación del contrato de arrendamiento.', context: 'Presenting formal written notice of a policy breach' },
  { english: 'Smoking is not permitted anywhere on the property.', spanish: 'Fumar no está permitido en ninguna parte de la propiedad.', context: 'Enforcing a no-smoking policy after a complaint is received' },
  { english: 'You have the right to a safe and habitable home.', spanish: 'Usted tiene derecho a un hogar seguro y habitable.', context: 'Acknowledging tenant rights during a compliance or inspection conversation' },
  { english: 'We will follow up with a written notice within 24 hours.', spanish: 'Le daremos seguimiento con un aviso escrito en 24 horas.', context: 'Communicating next steps after a verbal compliance warning' },
];

const pm5Phrases: KeyPhrase[] = [
  { english: 'I understand this is frustrating.', spanish: 'Entiendo que esto es frustrante.', context: 'Opening a de-escalation conversation with an upset tenant' },
  { english: 'Let me see what I can do to help you.', spanish: 'Déjeme ver qué puedo hacer para ayudarle.', context: 'Demonstrating willingness to act before committing to a specific resolution' },
  { english: 'I will personally follow up with you tomorrow.', spanish: 'Yo personalmente me pondré en contacto con usted mañana.', context: 'Making a direct commitment to follow up after a complaint conversation' },
  { english: 'We take all concerns seriously.', spanish: 'Tomamos todas las inquietudes en serio.', context: 'Validating a tenant complaint to reduce defensiveness and build trust' },
  { english: 'Thank you for bringing this to our attention.', spanish: 'Gracias por informarnos sobre esto.', context: 'Closing a conflict conversation on a constructive, professional note' },
];

const wh1Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Pick this item and put it in the bin'?",
    options: ['Recoge este artículo y ponlo en el contenedor.', 'Deja este artículo en el suelo.', 'Lleva este artículo a la oficina.', 'Cuenta los artículos en el estante.'],
    correctIndex: 0,
    explanation: "'Recoge este artículo y ponlo en el contenedor' is the most common pick instruction on the warehouse floor.",
  },
  {
    question: "Which phrase means 'Follow me'?",
    options: ['Espera aquí.', 'Sígueme.', 'Ve a tu área.', 'Habla con el supervisor.'],
    correctIndex: 1,
    explanation: "'Sígueme' = follow me — used constantly to guide workers to new areas, equipment, or tasks.",
  },
  {
    question: "How do you say 'Put it here'?",
    options: ['Ponlo aquí.', 'Llévalo allá.', 'Déjalo en el camión.', 'Tíralo al basurero.'],
    correctIndex: 0,
    explanation: "'Ponlo aquí' = put it here — a direct placement instruction used in receiving, packing, and staging areas.",
  },
  {
    question: "'¿Entiendes las instrucciones?' means:",
    options: ['Do you have the instructions?', 'Did you finish the instructions?', 'Do you understand the instructions?', 'Where are the instructions?'],
    correctIndex: 2,
    explanation: "'¿Entiendes las instrucciones?' confirms comprehension before a worker proceeds — reducing costly errors.",
  },
  {
    question: "How do you ask 'How many items are in this box?'",
    options: ['¿Cuántos artículos hay en esta caja?', '¿Cuántos camiones hay hoy?', '¿Cuántas etiquetas necesitas?', '¿Cuánto tiempo te queda?'],
    correctIndex: 0,
    explanation: "'¿Cuántos artículos hay en esta caja?' is the standard count verification question during receiving and inventory checks.",
  },
  {
    question: "Which phrase means 'Start your shift here'?",
    options: ['Tu turno empieza aquí.', 'Tu turno termina aquí.', 'Ve al área de descanso.', 'Firma tu entrada en la oficina.'],
    correctIndex: 0,
    explanation: "'Tu turno empieza aquí' directs a worker to their starting station — reducing early-shift confusion.",
  },
  {
    question: "How do you say 'Please wear your badge at all times'?",
    options: ['Por favor, lleva tu gafete en todo momento.', 'Por favor, deja tu gafete en tu casillero.', 'Por favor, entrega tu gafete al salir.', 'Por favor, registra tu gafete en la entrada.'],
    correctIndex: 0,
    explanation: "'Por favor, lleva tu gafete en todo momento' enforces ID badge policy — standard for all facility access control.",
  },
  {
    question: "'Área de recepción' means:",
    options: ['Break room', 'Office area', 'Receiving area', 'Restroom'],
    correctIndex: 2,
    explanation: "'Área de recepción' = receiving area — where inbound shipments are unloaded, inspected, and logged.",
  },
  {
    question: "How do you say 'Line up at the station before you begin'?",
    options: ['Fórmense en la estación antes de empezar.', 'Siéntense en el área de descanso.', 'Vayan directamente a sus camiones.', 'Esperen afuera hasta las 6 AM.'],
    correctIndex: 0,
    explanation: "'Fórmense en la estación antes de empezar' organizes workers for shift briefings and task assignments.",
  },
  {
    question: "Which phrase means 'Do you need help with your task?'",
    options: ['¿Necesitas ayuda con tu tarea?', '¿Terminaste tu turno?', '¿Tienes tu equipo de seguridad?', '¿Puedes quedarte tiempo extra?'],
    correctIndex: 0,
    explanation: "'¿Necesitas ayuda con tu tarea?' allows supervisors to proactively offer support — catching problems before they delay fulfillment.",
  },
];

const wh2Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Always wear your safety vest'?",
    options: ['Siempre usa tu chaleco de seguridad.', 'Deja tu chaleco en el casillero.', 'El chaleco es opcional en el almacén.', 'Usa el chaleco solo en el estacionamiento.'],
    correctIndex: 0,
    explanation: "'Siempre usa tu chaleco de seguridad' is a non-negotiable PPE instruction — required in all OSHA-compliant environments.",
  },
  {
    question: "Which phrase means 'Stay away from forklift lanes'?",
    options: ['Mantente alejado de los carriles de montacargas.', 'Puedes caminar en los carriles de montacargas.', 'Los montacargas no operan en este turno.', 'Avisa al operador si necesitas pasar.'],
    correctIndex: 0,
    explanation: "'Mantente alejado de los carriles de montacargas' is the critical pedestrian safety instruction that prevents most warehouse injuries.",
  },
  {
    question: "How do you ask 'Are you wearing your hard hat?'",
    options: ['¿Estás usando tu casco?', '¿Tienes tu casco en el casillero?', '¿Necesitas un casco nuevo?', '¿Tu casco está aprobado?'],
    correctIndex: 0,
    explanation: "'¿Estás usando tu casco?' is a spot-check question supervisors use during walkthroughs to enforce PPE compliance.",
  },
  {
    question: "'Zona restringida' means:",
    options: ['Break area', 'Loading dock', 'Restricted zone', 'Storage room'],
    correctIndex: 2,
    explanation: "'Zona restringida' = restricted zone. Workers must recognize this term to avoid unauthorized access to hazardous areas.",
  },
  {
    question: "How do you say 'Do not enter this area without authorization'?",
    options: ['No entres a esta área sin autorización.', 'Entra solo si tienes tu gafete.', 'Esta área está abierta después de las 3 PM.', 'Pide permiso al supervisor de turno.'],
    correctIndex: 0,
    explanation: "'No entres a esta área sin autorización' is the standard restricted area warning — often posted and verbally enforced.",
  },
  {
    question: "Which phrase means 'The forklift is operating in this aisle'?",
    options: ['El montacargas está operando en este pasillo.', 'El montacargas está apagado hoy.', 'El pasillo está cerrado por inventario.', 'El montacargas necesita reparación.'],
    correctIndex: 0,
    explanation: "'El montacargas está operando en este pasillo' alerts pedestrians to active forklift movement — preventing collisions.",
  },
  {
    question: "How do you say 'Wear steel-toed boots at all times'?",
    options: ['Usa botas con puntera de acero en todo momento.', 'Los zapatos normales están permitidos.', 'Las botas son opcionales para trabajo de oficina.', 'Solo usa botas en zonas de carga.'],
    correctIndex: 0,
    explanation: "'Usa botas con puntera de acero en todo momento' is a mandatory footwear instruction for all warehouse floor workers.",
  },
  {
    question: "'Peligro de caída' means:",
    options: ['Chemical spill', 'Fire hazard', 'Fall hazard', 'Trip wire'],
    correctIndex: 2,
    explanation: "'Peligro de caída' = fall hazard. Recognizing this warning is required for working at height and in wet areas.",
  },
  {
    question: "How do you ask 'Have you completed your safety training?'",
    options: ['¿Has completado tu capacitación de seguridad?', '¿Has firmado el contrato de trabajo?', '¿Has recibido tu uniforme?', '¿Has hablado con tu supervisor?'],
    correctIndex: 0,
    explanation: "'¿Has completado tu capacitación de seguridad?' is asked before a worker begins tasks in a new area or with new equipment.",
  },
  {
    question: "Which phrase means 'Report any unsafe condition immediately'?",
    options: ['Reporta cualquier condición insegura de inmediato.', 'Espera al siguiente turno para reportar problemas.', 'Solo el supervisor puede reportar condiciones.', 'Escribe el reporte al final de la semana.'],
    correctIndex: 0,
    explanation: "'Reporta cualquier condición insegura de inmediato' reinforces a safety-first culture — OSHA requires prompt hazard reporting.",
  },
];

const wh3Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Check the label before you pack it'?",
    options: ['Revisa la etiqueta antes de empacarlo.', 'Pega la etiqueta después de empacar.', 'No necesitas revisar la etiqueta.', 'Entrega el artículo sin etiqueta.'],
    correctIndex: 0,
    explanation: "'Revisa la etiqueta antes de empacarlo' prevents mispicks — label verification is a critical quality step in every pick-and-pack operation.",
  },
  {
    question: "Which phrase means 'Scan the barcode before placing in the bin'?",
    options: ['Escanea el código de barras antes de colocarlo en el contenedor.', 'Escanea el código de barras al final del turno.', 'No necesitas escanear artículos pequeños.', 'El código de barras lo escanea el sistema automáticamente.'],
    correctIndex: 0,
    explanation: "'Escanea el código de barras antes de colocarlo en el contenedor' ensures every item is digitally tracked before it moves.",
  },
  {
    question: "How do you ask 'Is this order complete?'",
    options: ['¿Está completo este pedido?', '¿Es correcto el número de pedido?', '¿Ya empacaste los artículos del pedido?', '¿Cuántos pedidos te quedan?'],
    correctIndex: 0,
    explanation: "'¿Está completo este pedido?' is the order completeness check question — used before sealing, labeling, or staging for shipment.",
  },
  {
    question: "'Número de pedido' means:",
    options: ['Box number', 'Order number', 'Bin number', 'Item count'],
    correctIndex: 1,
    explanation: "'Número de pedido' = order number — workers need to recognize this term to match picks to the correct fulfillment record.",
  },
  {
    question: "How do you say 'The quantity is wrong — check the pick list again'?",
    options: ['La cantidad está mal — revisa la lista de recogida otra vez.', 'La cantidad está bien — continúa.', 'El artículo no está en la lista.', 'Reporta el problema al cliente.'],
    correctIndex: 0,
    explanation: "'La cantidad está mal — revisa la lista de recogida otra vez' corrects a picking error before it reaches packing — preventing shipping mistakes.",
  },
  {
    question: "Which phrase means 'Seal the box with tape before scanning'?",
    options: ['Sella la caja con cinta antes de escanearla.', 'Deja la caja abierta para inspección.', 'Escanea la caja antes de sellarla.', 'No selles cajas en esta área.'],
    correctIndex: 0,
    explanation: "'Sella la caja con cinta antes de escanearla' is the correct sequence instruction — seal first, then scan for final confirmation.",
  },
  {
    question: "How do you ask 'Which shelf does this item go on?'",
    options: ['¿En qué estante va este artículo?', '¿En qué contenedor va este pedido?', '¿En qué caja va este producto?', '¿En qué zona está el supervisor?'],
    correctIndex: 0,
    explanation: "'¿En qué estante va este artículo?' is used during putaway tasks to confirm correct slotting location.",
  },
  {
    question: "'Artículo dañado' means:",
    options: ['Missing item', 'Damaged item', 'Expired item', 'Wrong item'],
    correctIndex: 1,
    explanation: "'Artículo dañado' = damaged item. Workers must identify and segregate damaged goods before they enter fulfillment.",
  },
  {
    question: "How do you say 'Place fragile items on top'?",
    options: ['Pon los artículos frágiles arriba.', 'Pon los artículos pesados arriba.', 'Mezcla los artículos en la caja.', 'Los artículos frágiles van al fondo.'],
    correctIndex: 0,
    explanation: "'Pon los artículos frágiles arriba' prevents breakage during transit — a key packing instruction for mixed-content orders.",
  },
  {
    question: "Which phrase means 'Double-check the order before sending it out'?",
    options: ['Verifica dos veces el pedido antes de enviarlo.', 'Envía el pedido sin revisarlo.', 'El sistema verifica automáticamente.', 'Solo verifica si el cliente lo pide.'],
    correctIndex: 0,
    explanation: "'Verifica dos veces el pedido antes de enviarlo' is the final accuracy checkpoint — reducing returns and mis-shipments.",
  },
];

const wh4Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Your shift starts at 6 AM'?",
    options: ['Tu turno empieza a las 6 de la mañana.', 'Tu turno empieza a las 6 de la tarde.', 'Tu turno es de noche.', 'Tu turno cambia esta semana.'],
    correctIndex: 0,
    explanation: "'Tu turno empieza a las 6 de la mañana' is the most direct shift-start communication — reduces tardiness and confusion.",
  },
  {
    question: "Which phrase means 'Speed is important but accuracy comes first'?",
    options: ['La velocidad es importante pero la precisión es lo primero.', 'Trabaja más rápido que ayer.', 'La precisión no importa si trabajas rápido.', 'Haz todo lo que puedas antes de las 10.'],
    correctIndex: 0,
    explanation: "'La velocidad es importante pero la precisión es lo primero' sets the quality-over-speed principle — critical for reducing order errors.",
  },
  {
    question: "How do you ask 'Did you finish your assigned tasks?'",
    options: ['¿Terminaste tus tareas asignadas?', '¿Empezaste tus tareas de mañana?', '¿Tienes tareas extra para hoy?', '¿Tu supervisor te dio nuevas tareas?'],
    correctIndex: 0,
    explanation: "'¿Terminaste tus tareas asignadas?' is the end-of-shift completeness check — used before releasing workers or reassigning tasks.",
  },
  {
    question: "'Hora extra' means:",
    options: ['Break time', 'Overtime', 'Shift change', 'Clock-in time'],
    correctIndex: 1,
    explanation: "'Hora extra' = overtime. Workers need to understand this term when asked to stay beyond their scheduled shift.",
  },
  {
    question: "How do you say 'You are working in zone three today'?",
    options: ['Hoy trabajas en la zona tres.', 'Hoy trabajas en la zona uno.', 'Tu zona cambió para el turno de la tarde.', 'No hay asignación de zona hoy.'],
    correctIndex: 0,
    explanation: "'Hoy trabajas en la zona tres' communicates daily zone assignments — essential for large-floor operations with multiple work areas.",
  },
  {
    question: "Which phrase means 'Please correct this mistake before continuing'?",
    options: ['Por favor, corrige este error antes de continuar.', 'Puedes corregirlo al final del turno.', 'El supervisor corregirá el error.', 'El sistema detectará el error automáticamente.'],
    correctIndex: 0,
    explanation: "'Por favor, corrige este error antes de continuar' addresses mistakes in real time — preventing downstream fulfillment errors.",
  },
  {
    question: "How do you ask 'Do you need more time to finish?'",
    options: ['¿Necesitas más tiempo para terminar?', '¿Terminaste antes de lo esperado?', '¿Cuántos artículos te quedan?', '¿Tu compañero puede ayudarte?'],
    correctIndex: 0,
    explanation: "'¿Necesitas más tiempo para terminar?' checks in with workers before reassigning — supporting completion without rushing.",
  },
  {
    question: "'Reunión de equipo' means:",
    options: ['Safety inspection', 'Team meeting', 'Shift assignment', 'Equipment check'],
    correctIndex: 1,
    explanation: "'Reunión de equipo' = team meeting. Common at shift start for briefings, productivity goals, and safety reminders.",
  },
  {
    question: "How do you say 'Stay focused on your area'?",
    options: ['Mantente enfocado en tu área.', 'Ayuda a tus compañeros en otras zonas.', 'Puedes moverte libremente por el almacén.', 'Trabaja en el área que prefieras.'],
    correctIndex: 0,
    explanation: "'Mantente enfocado en tu área' directs workers to stay in their assigned zone — maintaining productivity and reducing congestion.",
  },
  {
    question: "Which phrase means 'Good work today — thank you'?",
    options: ['Buen trabajo hoy — gracias.', 'Tienes que mejorar para mañana.', 'Reporta al supervisor antes de salir.', 'Llega más temprano mañana.'],
    correctIndex: 0,
    explanation: "'Buen trabajo hoy — gracias' is a positive closing phrase — small recognition phrases improve retention and morale significantly.",
  },
];

const wh5Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Call 911 immediately'?",
    options: ['Llama al 911 de inmediato.', 'Espera a que llegue el supervisor.', 'Busca el botiquín de primeros auxilios.', 'Avisa al equipo de seguridad.'],
    correctIndex: 0,
    explanation: "'Llama al 911 de inmediato' is the first emergency instruction — never delay in a life-threatening situation.",
  },
  {
    question: "Which phrase means 'Someone is injured — do not move them'?",
    options: ['Alguien está lesionado — no lo muevas.', 'Alguien está cansado — déjalo descansar.', 'Alguien se fue a casa por enfermedad.', 'Alguien necesita un descanso.'],
    correctIndex: 0,
    explanation: "'Alguien está lesionado — no lo muevas' is a critical first-response instruction — moving an injured person can worsen the injury.",
  },
  {
    question: "How do you say 'Report this problem to your supervisor right away'?",
    options: ['Reporta este problema a tu supervisor de inmediato.', 'Reporta el problema al final del turno.', 'Escribe el problema en el cuaderno.', 'El problema se resuelve solo.'],
    correctIndex: 0,
    explanation: "'Reporta este problema a tu supervisor de inmediato' ensures rapid escalation — critical for equipment failures and safety hazards.",
  },
  {
    question: "'Equipo averiado' means:",
    options: ['New equipment', 'Borrowed equipment', 'Broken/failed equipment', 'Heavy equipment'],
    correctIndex: 2,
    explanation: "'Equipo averiado' = broken or failed equipment. Workers must use this term to tag out defective machinery before it causes injury.",
  },
  {
    question: "How do you say 'Stop the machine and tag it out'?",
    options: ['Apaga la máquina y etiquétala para bloqueo.', 'Continúa usando la máquina con cuidado.', 'Avisa al técnico pero no la pares.', 'Espera a que la máquina se detenga sola.'],
    correctIndex: 0,
    explanation: "'Apaga la máquina y etiquétala para bloqueo' is the lockout/tagout command — OSHA requires this before any maintenance work.",
  },
  {
    question: "Which phrase means 'There is a spill in aisle 7'?",
    options: ['Hay un derrame en el pasillo 7.', 'Hay un paquete caído en el pasillo 7.', 'Hay un montacargas bloqueando el pasillo 7.', 'Hay un trabajador descansando en el pasillo 7.'],
    correctIndex: 0,
    explanation: "'Hay un derrame en el pasillo 7' is the standard spill alert — triggers cleanup response and slip-hazard mitigation.",
  },
  {
    question: "How do you ask 'Is everyone okay?'",
    options: ['¿Están todos bien?', '¿Están todos trabajando?', '¿Están todos en su área?', '¿Están todos listos para salir?'],
    correctIndex: 0,
    explanation: "'¿Están todos bien?' is the first accountability check after any incident or emergency evacuation.",
  },
  {
    question: "'Salida de emergencia' means:",
    options: ['Fire extinguisher', 'Emergency exit', 'First aid kit', 'Safety officer'],
    correctIndex: 1,
    explanation: "'Salida de emergencia' = emergency exit. Every worker must know this term and be able to locate all exits on their floor.",
  },
  {
    question: "How do you say 'Evacuate the building now'?",
    options: ['Evacúen el edificio ahora.', 'Regresen a sus puestos de trabajo.', 'Esperen la señal de alarma.', 'Reúnanse en la sala de descanso.'],
    correctIndex: 0,
    explanation: "'Evacúen el edificio ahora' is the full evacuation command — short, direct, and unambiguous.",
  },
  {
    question: "Which phrase means 'The incident has been reported and recorded'?",
    options: ['El incidente ha sido reportado y registrado.', 'El incidente no requiere documentación.', 'El incidente fue un error del trabajador.', 'El incidente no afecta las operaciones.'],
    correctIndex: 0,
    explanation: "'El incidente ha sido reportado y registrado' closes the incident loop — OSHA requires documentation of all workplace incidents.",
  },
];

const wh1Phrases: KeyPhrase[] = [
  { english: 'Pick this item and place it in the bin.', spanish: 'Recoge este artículo y ponlo en el contenedor.', context: 'Instructing a picker on a specific item placement during order fulfillment' },
  { english: 'Follow me to your station.', spanish: 'Sígueme a tu estación.', context: 'Directing a new worker to their assigned workstation at shift start' },
  { english: 'Do you understand the task?', spanish: '¿Entiendes la tarea?', context: 'Confirming comprehension before a worker begins an independent task' },
  { english: 'Report to the receiving area first.', spanish: 'Preséntate primero al área de recepción.', context: 'Directing a worker to their first reporting location at the start of a shift' },
  { english: 'Always wear your badge on the floor.', spanish: 'Siempre lleva tu gafete en el piso.', context: 'Enforcing the facility ID badge policy for floor access' },
];

const wh2Phrases: KeyPhrase[] = [
  { english: 'Stay out of forklift lanes at all times.', spanish: 'Mantente fuera de los carriles de montacargas en todo momento.', context: 'Reinforcing pedestrian safety zones during a floor safety walkthrough' },
  { english: 'Put on your safety vest before entering the floor.', spanish: 'Ponte el chaleco de seguridad antes de entrar al piso.', context: 'PPE checkpoint instruction before a worker enters an active warehouse floor' },
  { english: 'This area is restricted — do not enter.', spanish: 'Esta área está restringida — no entres.', context: 'Verbal warning to a worker approaching a controlled or hazardous zone' },
  { english: 'Hard hats are required past this point.', spanish: 'Los cascos son obligatorios más allá de este punto.', context: 'Enforcing head protection requirements at a zone boundary' },
  { english: 'Report all hazards to your supervisor immediately.', spanish: 'Reporta todos los peligros a tu supervisor de inmediato.', context: 'Reminding workers of hazard reporting obligations during a safety briefing' },
];

const wh3Phrases: KeyPhrase[] = [
  { english: 'Check the label before packing.', spanish: 'Revisa la etiqueta antes de empacar.', context: 'Quality control instruction at the start of a packing station task' },
  { english: 'Scan every item before it goes in the box.', spanish: 'Escanea cada artículo antes de meterlo en la caja.', context: 'Barcode tracking instruction to ensure inventory accuracy during packing' },
  { english: 'This order is incomplete — check the pick list.', spanish: 'Este pedido está incompleto — revisa la lista de recogida.', context: 'Flagging an order discrepancy before it is sealed and sent to shipping' },
  { english: 'Put fragile items on top.', spanish: 'Pon los artículos frágiles arriba.', context: 'Packing instruction to prevent breakage on multi-item shipments' },
  { english: 'Seal the box and place it on the outbound pallet.', spanish: 'Sella la caja y ponla en el palet de salida.', context: 'Final packing step instruction before the order is staged for pickup' },
];

const wh4Phrases: KeyPhrase[] = [
  { english: 'Your zone assignment is posted by the door.', spanish: 'Tu asignación de zona está publicada junto a la puerta.', context: 'Directing workers to their daily area assignments at shift start' },
  { english: 'Speed is important but accuracy comes first.', spanish: 'La velocidad es importante pero la precisión es lo primero.', context: 'Setting performance expectations during a team briefing' },
  { english: 'Let me know if you need more time.', spanish: 'Avísame si necesitas más tiempo.', context: 'Checking in with a worker who is behind on their task quota' },
  { english: 'Stay in your assigned area until I tell you otherwise.', spanish: 'Quédate en tu área asignada hasta que yo te diga lo contrario.', context: 'Maintaining zone discipline during a high-volume fulfillment period' },
  { english: 'Good work today.', spanish: 'Buen trabajo hoy.', context: 'Closing a shift with positive reinforcement to support worker morale' },
];

const wh5Phrases: KeyPhrase[] = [
  { english: 'Call 911 — someone is injured.', spanish: 'Llama al 911 — alguien está lesionado.', context: 'Immediate injury response command on the warehouse floor' },
  { english: 'Stop the machine and tag it out.', spanish: 'Apaga la máquina y etiquétala para bloqueo.', context: 'Lockout/tagout command when a piece of equipment malfunctions or becomes unsafe' },
  { english: 'Evacuate immediately — leave everything behind.', spanish: 'Evacúen de inmediato — dejen todo atrás.', context: 'Emergency evacuation command during a fire, chemical spill, or structural emergency' },
  { english: 'There is a spill — do not enter aisle 4.', spanish: 'Hay un derrame — no entres al pasillo 4.', context: 'Hazard communication to prevent slip-and-fall injuries near an uncontained spill' },
  { english: 'The incident has been documented.', spanish: 'El incidente ha sido documentado.', context: 'Closing statement after an incident report is filed — confirms OSHA recordkeeping compliance' },
];

const hosp1Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Welcome to our hotel'?",
    options: ['Bienvenido a nuestro hotel.', 'Por favor espere afuera.', 'Su habitación no está lista.', 'Vuelva más tarde.'],
    correctIndex: 0,
    explanation: "'Bienvenido a nuestro hotel' is the standard arrival greeting that sets a warm, professional tone from the first moment.",
  },
  {
    question: "Which phrase means 'How can I help you today?'",
    options: ['¿En qué le puedo ayudar hoy?', '¿Tiene una reservación?', '¿Cuántas noches se queda?', '¿Cuál es su nombre?'],
    correctIndex: 0,
    explanation: "'¿En qué le puedo ayudar hoy?' is the go-to service opener for front desk and concierge interactions.",
  },
  {
    question: "How do you ask 'Do you have a reservation?'",
    options: ['¿Tiene una reservación?', '¿Necesita una llave?', '¿Ya pagó su cuenta?', '¿Quiere desayuno?'],
    correctIndex: 0,
    explanation: "'¿Tiene una reservación?' is the first question at check-in to locate the guest's booking in the system.",
  },
  {
    question: "'Su habitación está en el tercer piso' means:",
    options: ['Your room is on the second floor.', 'Your room is on the third floor.', 'Your room is not available.', 'Your room has been upgraded.'],
    correctIndex: 1,
    explanation: "'Su habitación está en el tercer piso' tells the guest their room floor — critical for first-time navigation of the property.",
  },
  {
    question: "How do you say 'The elevator is to your left'?",
    options: ['El elevador está a su izquierda.', 'El elevador está a su derecha.', 'Las escaleras están al fondo.', 'El elevador no funciona hoy.'],
    correctIndex: 0,
    explanation: "'El elevador está a su izquierda' provides directional guidance — one of the most common front desk phrases.",
  },
  {
    question: "Which phrase means 'Enjoy your stay'?",
    options: ['Disfrute su estadía.', 'Hasta luego.', 'Su llave está lista.', 'Regrese mañana.'],
    correctIndex: 0,
    explanation: "'Disfrute su estadía' is the warm send-off at the end of check-in — reinforcing a welcoming experience.",
  },
  {
    question: "How do you say 'What time is check-out?'",
    options: ['¿A qué hora es el check-out?', '¿A qué hora es el desayuno?', '¿A qué hora llega el equipaje?', '¿A qué hora cierra la piscina?'],
    correctIndex: 0,
    explanation: "'¿A qué hora es el check-out?' is frequently asked by guests and must be answered clearly to avoid late fees or confusion.",
  },
  {
    question: "'Aquí está su llave de habitación' means:",
    options: ['Here is your room key.', 'Your key is not ready.', 'Please return your key.', 'You need a new key.'],
    correctIndex: 0,
    explanation: "'Aquí está su llave de habitación' is said while handing the key card — the final step of the check-in process.",
  },
  {
    question: "How do you ask 'How many guests are in your party?'",
    options: ['¿Cuántos huéspedes vienen con usted?', '¿Cuántas noches se queda?', '¿Cuántos cuartos necesita?', '¿Cuántos equipajes trae?'],
    correctIndex: 0,
    explanation: "'¿Cuántos huéspedes vienen con usted?' determines room occupancy — needed for billing and safety compliance.",
  },
  {
    question: "Which phrase means 'Let me know if you need anything'?",
    options: ['Avíseme si necesita algo.', 'Llame a la recepción si tiene problemas.', 'Estamos disponibles las 24 horas.', 'Su solicitud ha sido enviada.'],
    correctIndex: 0,
    explanation: "'Avíseme si necesita algo' closes any service interaction with an open offer of continued assistance.",
  },
];

const hosp2Questions: QuizQuestion[] = [
  {
    question: "How do you say 'We will send housekeeping to your room'?",
    options: ['Enviaremos al servicio de limpieza a su habitación.', 'Su habitación ya fue limpiada.', 'El servicio de limpieza no está disponible.', 'Puede solicitar toallas en recepción.'],
    correctIndex: 0,
    explanation: "'Enviaremos al servicio de limpieza a su habitación' confirms the guest's cleaning request is being actioned.",
  },
  {
    question: "Which phrase means 'We will send someone to fix it right away'?",
    options: ['Enviaremos a alguien a repararlo de inmediato.', 'El problema será resuelto mañana.', 'Por favor llame a mantenimiento directamente.', 'Puede cambiarse a otra habitación.'],
    correctIndex: 0,
    explanation: "'Enviaremos a alguien a repararlo de inmediato' reassures the guest that maintenance issues will be handled promptly.",
  },
  {
    question: "How do you ask 'Do you need extra towels?'",
    options: ['¿Necesita toallas adicionales?', '¿Necesita almohadas adicionales?', '¿Necesita jabón adicional?', '¿Necesita mantas adicionales?'],
    correctIndex: 0,
    explanation: "'¿Necesita toallas adicionales?' is a standard amenity check offered during housekeeping or front desk interactions.",
  },
  {
    question: "'El aire acondicionado no funciona' means:",
    options: ['The air conditioning is very cold.', 'The air conditioning is not working.', 'The air conditioning has been fixed.', 'The air conditioning is on the wall.'],
    correctIndex: 1,
    explanation: "Recognizing 'El aire acondicionado no funciona' lets staff quickly dispatch maintenance before the guest escalates the complaint.",
  },
  {
    question: "How do you say 'We will have it ready within 30 minutes'?",
    options: ['Lo tendremos listo en 30 minutos.', 'Estará listo mañana por la mañana.', 'Puede recogerlo en recepción.', 'Por favor espere en su habitación.'],
    correctIndex: 0,
    explanation: "'Lo tendremos listo en 30 minutos' sets a clear time expectation — reducing follow-up calls and guest frustration.",
  },
  {
    question: "Which phrase means 'The pool is open until 10 PM'?",
    options: ['La piscina está abierta hasta las 10 PM.', 'La piscina está cerrada hoy.', 'La piscina abre a las 8 AM.', 'La piscina está disponible solo para adultos.'],
    correctIndex: 0,
    explanation: "'La piscina está abierta hasta las 10 PM' is a common amenity hours question guests ask at the front desk.",
  },
  {
    question: "How do you say 'Room service is available 24 hours'?",
    options: ['El servicio a la habitación está disponible las 24 horas.', 'El servicio a la habitación cierra a las 11 PM.', 'El servicio a la habitación no está incluido.', 'Puede ordenar comida en el restaurante.'],
    correctIndex: 0,
    explanation: "'El servicio a la habitación está disponible las 24 horas' informs guests of around-the-clock in-room dining options.",
  },
  {
    question: "'Necesito más jabón y champú' means:",
    options: ['I need more soap and shampoo.', 'I need more towels and blankets.', 'I need the room cleaned again.', 'I need an extra pillow.'],
    correctIndex: 0,
    explanation: "Recognizing 'Necesito más jabón y champú' lets staff fulfill a basic amenity request without escalation.",
  },
  {
    question: "How do you ask 'When would you like your room cleaned?'",
    options: ['¿Cuándo le gustaría que limpiáramos su habitación?', '¿Su habitación ya está limpia?', '¿Quiere que cambiemos las sábanas?', '¿Necesita servicio de limpieza hoy?'],
    correctIndex: 0,
    explanation: "'¿Cuándo le gustaría que limpiáramos su habitación?' gives guests control over their schedule — a premium service standard.",
  },
  {
    question: "Which phrase means 'We will replace the linens immediately'?",
    options: ['Cambiaremos la ropa de cama de inmediato.', 'Las sábanas se cambian cada tres días.', 'Por favor deje la ropa sucia afuera de la puerta.', 'El servicio de lavandería cuesta extra.'],
    correctIndex: 0,
    explanation: "'Cambiaremos la ropa de cama de inmediato' confirms fast response to a linen complaint — preserving the guest's comfort.",
  },
];

const hosp3Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Would you like a table for two?'",
    options: ['¿Le gustaría una mesa para dos?', '¿Tiene una reservación para cenar?', '¿Prefiere sentarse en la terraza?', '¿Cuántas personas cenan esta noche?'],
    correctIndex: 0,
    explanation: "'¿Le gustaría una mesa para dos?' is the restaurant host's standard seating inquiry to open a dining interaction.",
  },
  {
    question: "Which phrase means 'Do you have a reservation?'",
    options: ['¿Tiene una reservación?', '¿Cuál es su número de habitación?', '¿Prefiere el menú del día?', '¿Ya ordenó?'],
    correctIndex: 0,
    explanation: "'¿Tiene una reservación?' is asked at the restaurant entrance before assigning a table — especially during peak hours.",
  },
  {
    question: "How do you ask 'Do you have any dietary restrictions?'",
    options: ['¿Tiene alguna restricción alimentaria?', '¿Le gusta la comida picante?', '¿Prefiere carne o pescado?', '¿Es usted vegetariano?'],
    correctIndex: 0,
    explanation: "'¿Tiene alguna restricción alimentaria?' is critical before recommending dishes — ensures food safety and guest satisfaction.",
  },
  {
    question: "'¿Le gustaría ver nuestra carta de vinos?' means:",
    options: ['Would you like to see our dessert menu?', 'Would you like to see our wine list?', 'Would you like to order now?', 'Would you like some water?'],
    correctIndex: 1,
    explanation: "'¿Le gustaría ver nuestra carta de vinos?' invites guests to explore beverage options — a key upselling phrase in restaurant service.",
  },
  {
    question: "How do you say 'Our chef recommends the grilled salmon'?",
    options: ['Nuestro chef recomienda el salmón a la parrilla.', 'El salmón no está disponible esta noche.', 'El especial del día es la pasta.', 'Tenemos mariscos frescos hoy.'],
    correctIndex: 0,
    explanation: "'Nuestro chef recomienda el salmón a la parrilla' is a concierge and restaurant phrase that guides guest decisions and drives revenue.",
  },
  {
    question: "Which phrase means 'I am allergic to shellfish'?",
    options: ['Soy alérgico a los mariscos.', 'No me gusta el pescado.', 'Prefiero pollo en lugar de mariscos.', 'Los mariscos no están en el menú.'],
    correctIndex: 0,
    explanation: "Recognizing 'Soy alérgico a los mariscos' is a life-safety phrase — staff must relay this to the kitchen immediately.",
  },
  {
    question: "How do you say 'I can make a reservation for you at 7 PM'?",
    options: ['Puedo hacerle una reservación a las 7 PM.', 'El restaurante abre a las 7 PM.', 'Las reservaciones se hacen en línea.', 'No hay disponibilidad esta noche.'],
    correctIndex: 0,
    explanation: "'Puedo hacerle una reservación a las 7 PM' is the concierge's standard response to a dining booking request.",
  },
  {
    question: "'¿Desea algo de postre?' means:",
    options: ['Would you like something to drink?', 'Would you like some dessert?', 'Would you like to see the menu?', 'Would you like the check?'],
    correctIndex: 1,
    explanation: "'¿Desea algo de postre?' is asked after the main course — a natural upsell opportunity in any restaurant setting.",
  },
  {
    question: "How do you ask 'Is everything to your satisfaction?'",
    options: ['¿Todo está a su satisfacción?', '¿Le gustó la comida?', '¿Desea algo más?', '¿Puedo retirar su plato?'],
    correctIndex: 0,
    explanation: "'¿Todo está a su satisfacción?' is the quality check mid-meal — critical for catching issues before a guest leaves unhappy.",
  },
  {
    question: "Which phrase means 'The kitchen is closed but we can offer room service'?",
    options: ['La cocina está cerrada pero podemos ofrecerle servicio a la habitación.', 'El restaurante cierra a las 11 PM.', 'Por favor pida su comida antes de las 10 PM.', 'El menú de servicio a la habitación es limitado.'],
    correctIndex: 0,
    explanation: "'La cocina está cerrada pero podemos ofrecerle servicio a la habitación' redirects a late-night dining request professionally.",
  },
];

const hosp4Questions: QuizQuestion[] = [
  {
    question: "How do you say 'I sincerely apologize for the inconvenience'?",
    options: ['Me disculpo sinceramente por el inconveniente.', 'Lo siento, no es nuestra responsabilidad.', 'Le ofrezco un descuento por su próxima visita.', 'Hablaré con el gerente.'],
    correctIndex: 0,
    explanation: "'Me disculpo sinceramente por el inconveniente' is the professional apology opener that de-escalates guest complaints immediately.",
  },
  {
    question: "Which phrase means 'We will resolve this immediately'?",
    options: ['Resolveremos esto de inmediato.', 'Necesitamos investigar el problema primero.', 'Eso no es parte de nuestra política.', 'Por favor llame mañana.'],
    correctIndex: 0,
    explanation: "'Resolveremos esto de inmediato' communicates urgency and ownership — the two qualities guests need to hear during a complaint.",
  },
  {
    question: "How do you ask 'Can you tell me more about the issue?'",
    options: ['¿Puede contarme más sobre el problema?', '¿Cuándo ocurrió esto?', '¿Ya habló con otro miembro del personal?', '¿Tiene evidencia del problema?'],
    correctIndex: 0,
    explanation: "'¿Puede contarme más sobre el problema?' opens a calm investigation — showing the guest they are being taken seriously.",
  },
  {
    question: "'Permítame llamar al gerente para ayudarle' means:",
    options: ['Please wait while I find your reservation.', 'Let me call the manager to assist you.', 'I will transfer your call to another department.', 'The manager is not available right now.'],
    correctIndex: 1,
    explanation: "'Permítame llamar al gerente para ayudarle' is the correct escalation phrase — used when a situation exceeds front-line authority.",
  },
  {
    question: "How do you say 'We would like to offer you a complimentary upgrade'?",
    options: ['Nos gustaría ofrecerle una mejora de habitación sin costo.', 'Su queja ha sido registrada.', 'Puede solicitar un reembolso en línea.', 'Le aplicaremos un descuento en su cuenta.'],
    correctIndex: 0,
    explanation: "'Nos gustaría ofrecerle una mejora de habitación sin costo' is a proactive recovery offer — turning a complaint into a loyalty moment.",
  },
  {
    question: "Which phrase means 'That should not have happened — I understand your frustration'?",
    options: ['Eso no debió haber ocurrido — entiendo su frustración.', 'Lamentamos lo sucedido pero no podemos reembolsarle.', 'Ese tipo de problemas ocurren ocasionalmente.', 'Por favor revise nuestra política de quejas en el sitio web.'],
    correctIndex: 0,
    explanation: "'Eso no debió haber ocurrido — entiendo su frustración' validates the guest's experience without defensiveness — a key empathy phrase.",
  },
  {
    question: "How do you say 'We will follow up with you within the hour'?",
    options: ['Nos comunicaremos con usted en menos de una hora.', 'Le responderemos por correo electrónico.', 'El gerente le llamará mañana por la mañana.', 'Por favor espere en su habitación.'],
    correctIndex: 0,
    explanation: "'Nos comunicaremos con usted en menos de una hora' gives the guest a concrete follow-up commitment — preventing repeated complaints.",
  },
  {
    question: "'¿Hay algo más que podamos hacer por usted?' means:",
    options: ['Is there anything else we can do for you?', 'Can you describe the problem again?', 'Is your complaint resolved?', 'Would you like to speak to a manager?'],
    correctIndex: 0,
    explanation: "'¿Hay algo más que podamos hacer por usted?' closes a resolution interaction — confirming full satisfaction before ending the exchange.",
  },
  {
    question: "How do you offer a refund professionally?",
    options: ['Nos gustaría procesar un reembolso por los inconvenientes causados.', 'No podemos ofrecer reembolsos por política.', 'Por favor contacte a su banco directamente.', 'El reembolso tomará 30 días hábiles.'],
    correctIndex: 0,
    explanation: "'Nos gustaría procesar un reembolso por los inconvenientes causados' frames a refund as a gesture of goodwill — not an obligation.",
  },
  {
    question: "Which phrase means 'We have noted your feedback and will improve'?",
    options: ['Hemos tomado nota de sus comentarios y mejoraremos.', 'Sus comentarios son importantes para nosotros.', 'Por favor complete nuestra encuesta en línea.', 'Compartiremos esto con nuestro equipo.'],
    correctIndex: 0,
    explanation: "'Hemos tomado nota de sus comentarios y mejoraremos' closes a complaint with a commitment — showing accountability.",
  },
];

const hosp5Questions: QuizQuestion[] = [
  {
    question: "How do you say 'Please evacuate the building immediately'?",
    options: ['Por favor evacúe el edificio de inmediato.', 'Permanezca en su habitación hasta nuevo aviso.', 'Diríjase a la recepción del hotel.', 'Espere las instrucciones del personal.'],
    correctIndex: 0,
    explanation: "'Por favor evacúe el edificio de inmediato' is the primary fire and emergency command — must be clear, fast, and unambiguous.",
  },
  {
    question: "Which phrase means 'Use the stairs — do not use the elevator'?",
    options: ['Use las escaleras — no use el elevador.', 'El elevador está disponible en emergencias.', 'Diríjase al elevador más cercano.', 'Las escaleras están bloqueadas.'],
    correctIndex: 0,
    explanation: "'Use las escaleras — no use el elevador' is the standard fire safety instruction — critical for guest safety during an evacuation.",
  },
  {
    question: "How do you say 'Is anyone injured?'",
    options: ['¿Hay alguien lesionado?', '¿Necesita ayuda con su equipaje?', '¿Se encuentra bien?', '¿Dónde está su habitación?'],
    correctIndex: 0,
    explanation: "'¿Hay alguien lesionado?' is the first responder triage question — needed to assess the situation and call for medical help.",
  },
  {
    question: "'Llame al 911 de inmediato' means:",
    options: ['Call hotel security right now.', 'Call the front desk immediately.', 'Call 911 immediately.', 'Call the manager right now.'],
    correctIndex: 2,
    explanation: "'Llame al 911 de inmediato' is the universal emergency services command — staff must know how to say and recognize this phrase.",
  },
  {
    question: "How do you say 'Please stay calm and follow instructions'?",
    options: ['Por favor mantenga la calma y siga las instrucciones.', 'Por favor regrese a su habitación.', 'Por favor espere en el vestíbulo.', 'Por favor no llame a nadie.'],
    correctIndex: 0,
    explanation: "'Por favor mantenga la calma y siga las instrucciones' is the command used to prevent panic and maintain orderly evacuation.",
  },
  {
    question: "Which phrase means 'The assembly point is in the parking lot'?",
    options: ['El punto de reunión está en el estacionamiento.', 'El punto de reunión está en el vestíbulo.', 'Por favor espere frente al hotel.', 'El punto de reunión está detrás del edificio.'],
    correctIndex: 0,
    explanation: "'El punto de reunión está en el estacionamiento' directs guests to the designated assembly area — key for headcounts after evacuation.",
  },
  {
    question: "How do you say 'Do not re-enter the building until cleared'?",
    options: ['No vuelva a entrar al edificio hasta recibir autorización.', 'Puede regresar a su habitación en 10 minutos.', 'El edificio está abierto de nuevo.', 'Espere la señal del bombero.'],
    correctIndex: 0,
    explanation: "'No vuelva a entrar al edificio hasta recibir autorización' prevents re-entry before the all-clear — a critical post-evacuation instruction.",
  },
  {
    question: "'Hay un derrame de productos químicos en el tercer piso' means:",
    options: ['There is a chemical spill on the third floor.', 'There is a gas leak on the third floor.', 'There is a fire on the third floor.', 'There is a flood on the third floor.'],
    correctIndex: 0,
    explanation: "Recognizing 'Hay un derrame de productos químicos' enables staff to immediately restrict access and notify emergency services.",
  },
  {
    question: "How do you say 'Security has been notified'?",
    options: ['Se ha notificado a seguridad.', 'Estamos esperando a la policía.', 'El gerente está en camino.', 'Hemos llamado a los bomberos.'],
    correctIndex: 0,
    explanation: "'Se ha notificado a seguridad' confirms that protective measures are already in motion — reassuring both guests and staff.",
  },
  {
    question: "Which phrase means 'Please follow the emergency exit signs'?",
    options: ['Por favor siga las señales de salida de emergencia.', 'Por favor espere junto a la puerta principal.', 'Las salidas están bloqueadas temporalmente.', 'Siga al personal hacia afuera.'],
    correctIndex: 0,
    explanation: "'Por favor siga las señales de salida de emergencia' reinforces wayfinding during an emergency — reducing confusion in unfamiliar spaces.",
  },
];

const hosp1Phrases: KeyPhrase[] = [
  { english: 'Welcome to our hotel — how can I help you?', spanish: 'Bienvenido a nuestro hotel — ¿en qué le puedo ayudar?', context: 'Opening greeting at the front desk when a guest approaches' },
  { english: 'Your room is ready — here is your key.', spanish: 'Su habitación está lista — aquí está su llave.', context: 'Completing the check-in process and handing the guest their room key' },
  { english: 'Check-out is at 11 AM.', spanish: 'El check-out es a las 11 de la mañana.', context: 'Informing a guest of the check-out time during check-in or when asked' },
  { english: 'The elevator is to your right.', spanish: 'El elevador está a su derecha.', context: 'Giving directions to a guest who just received their key' },
  { english: 'Enjoy your stay with us.', spanish: 'Disfrute su estadía con nosotros.', context: 'Warm send-off at the end of the check-in interaction' },
];

const hosp2Phrases: KeyPhrase[] = [
  { english: 'We will send housekeeping right away.', spanish: 'Enviaremos al servicio de limpieza enseguida.', context: 'Responding to a guest request for room cleaning or fresh towels' },
  { english: 'Maintenance will be there within 30 minutes.', spanish: 'Mantenimiento estará allí en 30 minutos.', context: 'Setting a time expectation after a repair request has been submitted' },
  { english: 'Would you like extra pillows or blankets?', spanish: '¿Le gustaría almohadas o mantas adicionales?', context: 'Proactive amenity offer during a housekeeping or turndown interaction' },
  { english: 'Room service is available until midnight.', spanish: 'El servicio a la habitación está disponible hasta la medianoche.', context: 'Informing a guest of room service availability when they ask about food options' },
  { english: 'We will replace that immediately.', spanish: 'Lo reemplazaremos de inmediato.', context: 'Responding to a guest complaint about a broken or missing room item' },
];

const hosp3Phrases: KeyPhrase[] = [
  { english: 'Do you have a reservation for dinner tonight?', spanish: '¿Tiene reservación para cenar esta noche?', context: 'Greeting a guest at the hotel restaurant entrance' },
  { english: 'Our chef recommends the grilled chicken.', spanish: 'Nuestro chef recomienda el pollo a la parrilla.', context: 'Suggesting a dish to help a guest navigate the menu' },
  { english: 'Do you have any food allergies?', spanish: '¿Tiene alguna alergia alimentaria?', context: 'Safety check before taking a guest order in the restaurant' },
  { english: 'I can make a dinner reservation for 7 PM.', spanish: 'Puedo hacerle una reservación para cenar a las 7 PM.', context: 'Concierge response to a dining booking request from a hotel guest' },
  { english: 'Would you like to see the dessert menu?', spanish: '¿Le gustaría ver el menú de postres?', context: 'Upsell offer at the end of the main course in the hotel restaurant' },
];

const hosp4Phrases: KeyPhrase[] = [
  { english: 'I sincerely apologize for the inconvenience.', spanish: 'Me disculpo sinceramente por el inconveniente.', context: 'Opening a complaint resolution with empathy and professionalism' },
  { english: 'We will resolve this immediately.', spanish: 'Resolveremos esto de inmediato.', context: 'Committing to fast action when a guest reports a problem' },
  { english: 'Let me call the manager to assist you.', spanish: 'Permítame llamar al gerente para ayudarle.', context: 'Escalating a guest complaint that requires management authority' },
  { english: 'We would like to offer you a complimentary upgrade.', spanish: 'Nos gustaría ofrecerle una mejora de habitación sin costo.', context: 'Service recovery offer after a significant guest inconvenience' },
  { english: 'Is there anything else we can do for you?', spanish: '¿Hay algo más que podamos hacer por usted?', context: 'Closing a complaint resolution interaction to confirm full guest satisfaction' },
];

const hosp5Phrases: KeyPhrase[] = [
  { english: 'Please evacuate the building immediately.', spanish: 'Por favor evacúe el edificio de inmediato.', context: 'Primary fire or emergency evacuation command issued to guests on the floor' },
  { english: 'Use the stairs — do not use the elevator.', spanish: 'Use las escaleras — no use el elevador.', context: 'Fire safety instruction during an active evacuation of the hotel' },
  { english: 'Please stay calm and follow the staff.', spanish: 'Por favor mantenga la calma y siga al personal.', context: 'Crowd management command to prevent panic during an emergency' },
  { english: 'Is anyone injured?', spanish: '¿Hay alguien lesionado?', context: 'First-response triage question after an incident to assess medical need' },
  { english: 'The assembly point is in the parking lot.', spanish: 'El punto de reunión está en el estacionamiento.', context: 'Directing evacuated guests to the designated safe assembly location' },
];

export const CERT_TRACKS: CertTrack[] = [
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Patient communication, intake, consent, and clinical instructions for medical settings.',
    icon: '🏥',
    color: 'from-blue-600 to-blue-800',
    modules: [
      { id: 1, title: 'Patient Intake & Vitals', questions: healthcareQuestions, keyPhrases: hc1Phrases },
      { id: 2, title: 'Symptoms & Pain Assessment', questions: healthcareModule2Questions, keyPhrases: hc2Phrases },
      { id: 3, title: 'Medications & Instructions', questions: healthcareModule3Questions, keyPhrases: hc3Phrases },
      { id: 4, title: 'Procedures & Consent', questions: healthcareModule4Questions, keyPhrases: hc4Phrases },
      { id: 5, title: 'Discharge & Follow-Up', questions: healthcareModule5Questions, keyPhrases: hc5Phrases },
    ],
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Family engagement, enrollment, parent-teacher communication, and student support.',
    icon: '🎓',
    color: 'from-green-600 to-green-800',
    modules: [
      { id: 1, title: 'Enrollment & Registration', questions: educationQuestions, keyPhrases: ed1Phrases },
      { id: 2, title: 'Parent-Teacher Conferences', questions: educationModule2Questions, keyPhrases: ed2Phrases },
      { id: 3, title: 'Special Education & IEPs', questions: educationModule3Questions, keyPhrases: ed3Phrases },
      { id: 4, title: 'Student Behavior & Discipline', questions: educationModule4Questions, keyPhrases: ed4Phrases },
      { id: 5, title: 'Graduation & Transitions', questions: educationModule5Questions, keyPhrases: ed5Phrases },
    ],
  },
  {
    id: 'construction',
    title: 'Construction',
    description: 'Jobsite safety, OSHA compliance, hazard communication, and equipment operation.',
    icon: '\u{1F3D7}\uFE0F',
    color: 'from-orange-600 to-orange-800',
    modules: [
      { id: 1, title: 'Jobsite Safety Basics', questions: constructionQuestions, keyPhrases: con1Phrases },
      { id: 2, title: 'PPE & Equipment', questions: ppeQuestions, keyPhrases: con2Phrases },
      { id: 3, title: 'Hazard Communication', questions: hazardCommQuestions, keyPhrases: con3Phrases },
      { id: 4, title: 'Emergency Procedures', questions: emergencyProceduresQuestions, keyPhrases: con4Phrases },
      { id: 5, title: 'Toolbox Talks & Supervision', questions: toolboxTalksQuestions, keyPhrases: con5Phrases },
    ],
  },
  {
    id: 'social-services',
    title: 'Social Services',
    description: 'Client intake, benefits navigation, housing, food security, and case management.',
    icon: '🤝',
    color: 'from-teal-600 to-teal-800',
    modules: [
      { id: 1, title: 'Client Intake & Rights', questions: socialServicesClientIntakeQuestions, keyPhrases: ss1Phrases },
      { id: 2, title: 'Housing & Shelter Services', questions: socialServicesHousingQuestions, keyPhrases: ss2Phrases },
      { id: 3, title: 'Benefits & Eligibility', questions: socialServicesBenefitsQuestions, keyPhrases: ss3Phrases },
      { id: 4, title: 'Domestic Violence Resources', questions: socialServicesDVQuestions, keyPhrases: ss4Phrases },
      { id: 5, title: 'Case Closure & Follow-Up', questions: socialServicesCaseClosureQuestions, keyPhrases: ss5Phrases },
    ],
  },
  {
    id: 'mental-health',
    title: 'Mental Health',
    description: 'Crisis screening, therapeutic communication, trauma-informed care, and wellness check-ins.',
    icon: '🧠',
    color: 'from-rose-600 to-rose-800',
    modules: [
      { id: 1, title: 'Initial Assessment & Safety', questions: mentalHealthQuestions, keyPhrases: mh1Phrases },
      { id: 2, title: 'Depression & Anxiety Screening', questions: mentalHealthQuestions.map(q => ({ ...q })), keyPhrases: mh2Phrases },
      { id: 3, title: 'Trauma-Informed Approaches', questions: mentalHealthQuestions.map(q => ({ ...q })), keyPhrases: mh3Phrases },
      { id: 4, title: 'Crisis Intervention', questions: mentalHealthQuestions.map(q => ({ ...q })), keyPhrases: mh4Phrases },
      { id: 5, title: 'Recovery & Wellness Plans', questions: mentalHealthQuestions.map(q => ({ ...q })), keyPhrases: mh5Phrases },
    ],
  },
  {
    id: 'property-management',
    title: 'Property Management',
    description: 'Built for property managers, leasing agents, and maintenance staff who need to communicate clearly with Spanish-speaking tenants in real-world situations.',
    icon: '🏢',
    color: 'from-cyan-600 to-cyan-800',
    modules: [
      { id: 1, title: 'Tenant Communication Basics', questions: pm1Questions, keyPhrases: pm1Phrases },
      { id: 2, title: 'Maintenance & Work Orders', questions: pm2Questions, keyPhrases: pm2Phrases },
      { id: 3, title: 'Lease & Payment Conversations', questions: pm3Questions, keyPhrases: pm3Phrases },
      { id: 4, title: 'Notices & Compliance', questions: pm4Questions, keyPhrases: pm4Phrases },
      { id: 5, title: 'Conflict & Resolution', questions: pm5Questions, keyPhrases: pm5Phrases },
    ],
  },
  {
    id: 'warehouse',
    title: 'Warehouse Operations',
    description: 'Built for warehouse teams, supervisors, and logistics workers who need clear, fast Spanish communication on the job floor.',
    icon: '📦',
    color: 'from-amber-600 to-amber-800',
    modules: [
      { id: 1, title: 'Basic Floor Communication', questions: wh1Questions, keyPhrases: wh1Phrases },
      { id: 2, title: 'Safety & Equipment', questions: wh2Questions, keyPhrases: wh2Phrases },
      { id: 3, title: 'Picking & Packing', questions: wh3Questions, keyPhrases: wh3Phrases },
      { id: 4, title: 'Team Coordination', questions: wh4Questions, keyPhrases: wh4Phrases },
      { id: 5, title: 'Emergencies & Issues', questions: wh5Questions, keyPhrases: wh5Phrases },
    ],
  },
  {
    id: 'hospitality',
    title: 'Hospitality Services',
    description: 'Built for hotel staff, front desk teams, and service workers who interact with Spanish-speaking guests daily.',
    icon: '🏨',
    color: 'from-teal-600 to-teal-800',
    modules: [
      { id: 1, title: 'Guest Interaction Basics', questions: hosp1Questions, keyPhrases: hosp1Phrases },
      { id: 2, title: 'Room & Service Requests', questions: hosp2Questions, keyPhrases: hosp2Phrases },
      { id: 3, title: 'Dining & Concierge', questions: hosp3Questions, keyPhrases: hosp3Phrases },
      { id: 4, title: 'Problem Resolution', questions: hosp4Questions, keyPhrases: hosp4Phrases },
      { id: 5, title: 'Safety & Emergencies', questions: hosp5Questions, keyPhrases: hosp5Phrases },
    ],
  },
];
