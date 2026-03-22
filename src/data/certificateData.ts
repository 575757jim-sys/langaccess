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

export const CERT_TRACKS: CertTrack[] = [
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Patient communication, intake, consent, and clinical instructions for medical settings.',
    icon: '🏥',
    color: 'from-blue-600 to-blue-800',
    modules: [
      { id: 1, title: 'Patient Intake & Vitals', questions: healthcareQuestions },
      { id: 2, title: 'Symptoms & Pain Assessment', questions: healthcareModule2Questions },
      { id: 3, title: 'Medications & Instructions', questions: healthcareModule3Questions },
      { id: 4, title: 'Procedures & Consent', questions: healthcareModule4Questions },
      { id: 5, title: 'Discharge & Follow-Up', questions: healthcareModule5Questions },
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
      { id: 2, title: 'Parent-Teacher Conferences', questions: educationModule2Questions },
      { id: 3, title: 'Special Education & IEPs', questions: educationModule3Questions },
      { id: 4, title: 'Student Behavior & Discipline', questions: educationModule4Questions },
      { id: 5, title: 'Graduation & Transitions', questions: educationModule5Questions },
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
      { id: 2, title: 'PPE & Equipment', questions: ppeQuestions },
      { id: 3, title: 'Hazard Communication', questions: hazardCommQuestions },
      { id: 4, title: 'Emergency Procedures', questions: emergencyProceduresQuestions },
      { id: 5, title: 'Toolbox Talks & Supervision', questions: toolboxTalksQuestions },
    ],
  },
  {
    id: 'social-services',
    title: 'Social Services',
    description: 'Client intake, benefits navigation, housing, food security, and case management.',
    icon: '🤝',
    color: 'from-teal-600 to-teal-800',
    modules: [
      { id: 1, title: 'Client Intake & Rights', questions: socialServicesClientIntakeQuestions },
      { id: 2, title: 'Housing & Shelter Services', questions: socialServicesHousingQuestions },
      { id: 3, title: 'Benefits & Eligibility', questions: socialServicesBenefitsQuestions },
      { id: 4, title: 'Domestic Violence Resources', questions: socialServicesDVQuestions },
      { id: 5, title: 'Case Closure & Follow-Up', questions: socialServicesCaseClosureQuestions },
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
