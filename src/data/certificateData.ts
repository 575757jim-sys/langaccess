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
