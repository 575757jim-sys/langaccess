import { useState, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft, Phone, MessageSquare, Utensils, Stethoscope, Droplets,
  BatteryCharging, Home, Package, Wifi, WifiOff, ShieldCheck,
  Upload, Trash2, Eye, X, Camera, ChevronDown, Building2, Volume2,
  MapPin, Clock, Heart, ExternalLink, Copy, Share2, Navigation,
  ChevronRight, Check
} from 'lucide-react';
import CityResources from './CityResources';
import { cityResources, CITY_KEYS, CityKey } from '../data/cityResources';
import { fetchTTSBlob } from '../utils/speech';

interface CommunityNavigatorProps {
  onBack: () => void;
}

const LANG_KEY = 'langaccess_nav_lang';
const CITY_KEY_STORAGE = 'langaccess_nav_city';

type LangCode = 'en' | 'es' | 'vi' | 'tl' | 'zh-TW' | 'zh-CN' ;

interface LangStrings {
  food: string;
  medical: string;
  bathrooms: string;
  power: string;
  shelter: string;
  lockers: string;
  call211: string;
  instructions: string;
}

const languageMap: Record<LangCode, LangStrings> = {
  en: {
    food: 'Food', medical: 'Medical + Dental', bathrooms: 'Bathrooms',
    power: 'Power / Charging', shelter: 'Shelter', lockers: 'Lockers',
    call211: 'Call 211',
    instructions: 'Tap a category to find nearby help. Call 211 for social services.',
  },
  es: {
    food: 'Comida', medical: 'Médico + Dental', bathrooms: 'Baños',
    power: 'Energía / Carga', shelter: 'Refugio', lockers: 'Casilleros',
    call211: 'Llamar al 211',
    instructions: 'Toca una categoría para encontrar ayuda cercana. Llama al 211 para servicios sociales.',
  },
  vi: {
    food: 'Thức ăn', medical: 'Y tế + Nha khoa', bathrooms: 'Phòng tắm',
    power: 'Sạc điện', shelter: 'Chỗ ở', lockers: 'Tủ đồ',
    call211: 'Gọi 211',
    instructions: 'Nhấn vào danh mục để tìm sự trợ giúp gần đây. Gọi 211 cho dịch vụ xã hội.',
  },
  tl: {
    food: 'Pagkain', medical: 'Medikal + Dental', bathrooms: 'Banyo',
    power: 'Kuryente / Charging', shelter: 'Silungan', lockers: 'Locker',
    call211: 'Tumawag sa 211',
    instructions: 'I-tap ang isang kategorya para mahanap ang tulong malapit sa iyo. Tumawag sa 211 para sa mga serbisyong panlipunan.',
  },
  hmn: {
    food: 'Zaub mov', medical: 'Kho mob', bathrooms: 'Chav dej',
    power: 'Hluav taws xob', shelter: 'Tsev so', lockers: 'Lub phov',
    call211: 'Hu 211',
    instructions: 'Kov ib pawg los nrhiav kev pab ze. Hu 211 rau kev pab hauv zej zog.',
  },
  'zh-TW': {
    food: '食物', medical: '醫療 + 牙科', bathrooms: '洗手間',
    power: '充電', shelter: '庇護所', lockers: '儲物櫃',
    call211: '撥打 211',
    instructions: '點擊類別以尋找附近的幫助。撥打 211 獲取社會服務。',
  },
  'zh-CN': {
    food: '食物', medical: '医疗 + 牙科', bathrooms: '洗手间',
    power: '充电', shelter: '庇护所', lockers: '储物柜',
    call211: '拨打 211',
    instructions: '点击类别以寻找附近的帮助。拨打 211 获取社会服务。',
  },
};
const ttslangMap: Record<LangCode, string> = {
  en: 'en', es: 'spanish', vi: 'vietnamese', tl: 'tagalog',
  'zh-TW': 'zh-traditional', 'zh-CN': 'zh-simplified',
};

return (


const speechLangMap: Record<LangCode, string> = {
  en: 'en-US', es: 'es-US', vi: 'vi-VN', tl: 'tl-PH',
    'zh-TW': 'zh-TW', 'zh-CN': 'zh-CN',
  ,
};

const AZURE_LANG_CODES: LangCode[] = [];

const LANG_OPTIONS: { code: LangCode; flag: string; label: string }[] = [
  { code: 'en',    flag: '🇺🇸', label: 'English' },
  { code: 'es',    flag: '🇲🇽', label: 'Español' },
  { code: 'vi',    flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'tl',    flag: '🇵🇭', label: 'Filipino' },
 
  { code: 'zh-TW', flag: '🇹🇼', label: '繁體中文' },
  { code: 'zh-CN', flag: '🇨🇳', label: '简体中文' },
  
  

const RESOURCE_CATEGORIES: { id: keyof LangStrings; Icon: React.FC<{ className?: string }>; color: string }[] = [
  { id: 'food',      Icon: Utensils,        color: 'bg-amber-500 hover:bg-amber-400' },
  { id: 'medical',   Icon: Stethoscope,     color: 'bg-red-500 hover:bg-red-400' },
  { id: 'bathrooms', Icon: Droplets,        color: 'bg-cyan-500 hover:bg-cyan-400' },
  { id: 'power',     Icon: BatteryCharging, color: 'bg-yellow-500 hover:bg-yellow-400' },
  { id: 'shelter',   Icon: Home,            color: 'bg-green-500 hover:bg-green-400' },
  { id: 'lockers',   Icon: Package,         color: 'bg-orange-500 hover:bg-orange-400' },
];

const ID_VAULT_KEY = 'langaccess_id_vault';

interface StoredDoc {
  id: string;
  name: string;
  dataUrl: string;
  addedAt: string;
}

function loadVault(): StoredDoc[] {
  try { return JSON.parse(localStorage.getItem(ID_VAULT_KEY) || '[]'); }
  catch { return []; }
}

function saveVault(docs: StoredDoc[]) {
  localStorage.setItem(ID_VAULT_KEY, JSON.stringify(docs));
}

function loadLang(): LangCode {
  const saved = localStorage.getItem(LANG_KEY) as LangCode | null;
  const valid: LangCode[] = ['en', 'es', 'vi', 'tl', 'hmn', 'zh-TW', 'zh-CN', 'ko', 'ar', 'fa', 'prs'];
  if (saved && valid.includes(saved)) return saved;
  return 'en';
}

function loadCity(): CityKey {
  const saved = localStorage.getItem(CITY_KEY_STORAGE);
  if (saved && CITY_KEYS.includes(saved as CityKey)) return saved as CityKey;
  return 'san-jose';
}

let navPlayId = 0;
let navCurrentAudio: HTMLAudioElement | null = null;

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function playNavText(text: string, langCode: LangCode) {
  const language = ttslangMap[langCode];
  if (language === 'en') return;

  const playId = ++navPlayId;
  navCurrentAudio?.pause();
  navCurrentAudio = null;

  if (isIOS()) {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = speechLangMap[langCode];
    utt.rate = 0.9;
    synth.speak(utt);
    fetchTTSBlob(text, language).catch(() => {});
    return;
  }

  fetchTTSBlob(text, language)
    .then((url) => {
      if (!url || navPlayId !== playId) return;
      const audio = new Audio(url);
      navCurrentAudio = audio;
      audio.play().catch(() => {});
    })
    .catch(() => {});
}

// ── Resource finder types & data ──────────────────────────────────────────────

type Resource = {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  hours: { [dow: number]: { open: string; close: string } | null };
  notes?: string;
  eligibility?: string;
  whatToBring?: string;
  languages?: string[];
  website?: string;
};

const FAVORITES_KEY = 'langaccess_resource_favorites';
const RECENTS_KEY = 'langaccess_resource_recents';

const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const RESOURCE_FILTER_CATS = [
  { value: 'all',       label: 'All Categories' },
  { value: 'food',      label: 'Food' },
  { value: 'medical',   label: 'Medical + Dental' },
  { value: 'bathrooms', label: 'Bathrooms' },
  { value: 'power',     label: 'Power / Charging' },
  { value: 'shelter',   label: 'Shelter' },
  { value: 'lockers',   label: 'Lockers' },
];

const CAT_ICON: Record<string, React.FC<{ className?: string }>> = {
  food: Utensils, medical: Stethoscope, bathrooms: Droplets,
  power: BatteryCharging, shelter: Home, lockers: Package,
};

const CAT_COLOR: Record<string, string> = {
  food: 'text-amber-400', medical: 'text-red-400', bathrooms: 'text-cyan-400',
  power: 'text-yellow-400', shelter: 'text-green-400', lockers: 'text-orange-400',
};

const SAMPLE_RESOURCES: Resource[] = [
  {
    id: 'sj-food-1',
    name: 'Second Harvest Food Bank',
    category: 'food',
    address: '750 Curtner Ave, San Jose, CA 95125',
    phone: '4086665772',
    lat: 37.3019, lng: -121.8869,
    hours: {
      0: null,
      1: { open: '08:00', close: '17:00' }, 2: { open: '08:00', close: '17:00' },
      3: { open: '08:00', close: '17:00' }, 4: { open: '08:00', close: '17:00' },
      5: { open: '08:00', close: '17:00' }, 6: null,
    },
    notes: 'Drive-through and walk-up distribution. No appointment needed on distribution days.',
    eligibility: 'Anyone in need. No ID or proof of income required.',
    whatToBring: 'Bags or boxes to carry food home.',
    languages: ['English', 'Spanish', 'Vietnamese', 'Chinese'],
    website: 'https://www.shfb.org',
  },
  {
    id: 'sj-food-2',
    name: 'Sacred Heart Community Service',
    category: 'food',
    address: '1381 S 1st St, San Jose, CA 95110',
    phone: '4082788033',
    lat: 37.3253, lng: -121.8761,
    hours: {
      0: null,
      1: { open: '09:00', close: '17:00' }, 2: { open: '09:00', close: '17:00' },
      3: { open: '09:00', close: '17:00' }, 4: { open: '09:00', close: '17:00' },
      5: { open: '09:00', close: '14:00' }, 6: null,
    },
    notes: 'Pantry, hot meals, and emergency food assistance.',
    eligibility: 'Santa Clara County residents. Proof of address helpful but not required.',
    whatToBring: 'ID if available. Shopping bags.',
    languages: ['English', 'Spanish'],
    website: 'https://sacredheartcs.org',
  },
  {
    id: 'sj-food-3',
    name: 'Loaves & Fishes Family Kitchen',
    category: 'food',
    address: '195 N 27th St, San Jose, CA 95116',
    phone: '4082549799',
    lat: 37.3567, lng: -121.8645,
    hours: {
      0: { open: '10:00', close: '13:00' }, 1: { open: '10:00', close: '13:00' },
      2: { open: '10:00', close: '13:00' }, 3: { open: '10:00', close: '13:00' },
      4: { open: '10:00', close: '13:00' }, 5: { open: '10:00', close: '13:00' },
      6: { open: '10:00', close: '13:00' },
    },
    notes: 'Hot meals served daily. No questions asked.',
    eligibility: 'Open to everyone. No registration needed.',
    whatToBring: 'Nothing required.',
    languages: ['English', 'Spanish', 'Vietnamese'],
  },
  {
    id: 'sj-med-1',
    name: 'Gardner Health Services',
    category: 'medical',
    address: '2575 N 1st St, San Jose, CA 95131',
    phone: '4089249500',
    lat: 37.3943, lng: -121.9001,
    hours: {
      0: null,
      1: { open: '08:00', close: '17:00' }, 2: { open: '08:00', close: '17:00' },
      3: { open: '08:00', close: '17:00' }, 4: { open: '08:00', close: '17:00' },
      5: { open: '08:00', close: '17:00' }, 6: null,
    },
    notes: 'Federally Qualified Health Center. Sliding scale fees based on income.',
    eligibility: 'All patients welcome regardless of ability to pay or insurance status.',
    whatToBring: 'ID if available. Insurance card if insured.',
    languages: ['English', 'Spanish', 'Vietnamese', 'Tagalog'],
    website: 'https://www.gardnerhealthservices.org',
  },
  {
    id: 'sj-med-2',
    name: 'Valley Homeless Healthcare Program',
    category: 'medical',
    address: '976 Lenzen Ave, San Jose, CA 95126',
    phone: '4089772500',
    lat: 37.3378, lng: -121.9117,
    hours: {
      0: null,
      1: { open: '08:30', close: '17:00' }, 2: { open: '08:30', close: '17:00' },
      3: { open: '08:30', close: '17:00' }, 4: { open: '08:30', close: '17:00' },
      5: { open: '08:30', close: '12:00' }, 6: null,
    },
    notes: 'Medical, dental, and mental health services for people experiencing homelessness.',
    eligibility: 'Must be currently homeless or recently housed.',
    whatToBring: 'Any ID. Medical records if available.',
    languages: ['English', 'Spanish'],
  },
  {
    id: 'sj-bath-1',
    name: 'Dr. MLK Jr. Library – Public Restrooms',
    category: 'bathrooms',
    address: '150 E San Fernando St, San Jose, CA 95112',
    phone: '4088082000',
    lat: 37.3350, lng: -121.8813,
    hours: {
      0: { open: '12:00', close: '17:00' },
      1: { open: '08:00', close: '20:00' }, 2: { open: '08:00', close: '20:00' },
      3: { open: '08:00', close: '20:00' }, 4: { open: '08:00', close: '20:00' },
      5: { open: '08:00', close: '18:00' }, 6: { open: '10:00', close: '17:00' },
    },
    notes: 'Public restrooms, free WiFi, and computer access available inside.',
    eligibility: 'Open to all library visitors.',
    whatToBring: 'Nothing required.',
    languages: ['English', 'Spanish', 'Vietnamese', 'Chinese'],
    website: 'https://www.sjpl.org',
  },
  {
    id: 'sj-bath-2',
    name: 'City Hall Plaza Restrooms',
    category: 'bathrooms',
    address: '200 E Santa Clara St, San Jose, CA 95113',
    lat: 37.3384, lng: -121.8855,
    hours: {
      0: { open: '06:00', close: '22:00' }, 1: { open: '06:00', close: '22:00' },
      2: { open: '06:00', close: '22:00' }, 3: { open: '06:00', close: '22:00' },
      4: { open: '06:00', close: '22:00' }, 5: { open: '06:00', close: '22:00' },
      6: { open: '06:00', close: '22:00' },
    },
    notes: 'Public plaza restrooms near the fountain. ADA accessible.',
    eligibility: 'Open to public.',
    whatToBring: 'Nothing required.',
  },
  {
    id: 'sj-power-1',
    name: 'Main Library – Charging Stations',
    category: 'power',
    address: '150 E San Fernando St, San Jose, CA 95112',
    phone: '4088082000',
    lat: 37.3350, lng: -121.8813,
    hours: {
      0: { open: '12:00', close: '17:00' },
      1: { open: '08:00', close: '20:00' }, 2: { open: '08:00', close: '20:00' },
      3: { open: '08:00', close: '20:00' }, 4: { open: '08:00', close: '20:00' },
      5: { open: '08:00', close: '18:00' }, 6: { open: '10:00', close: '17:00' },
    },
    notes: 'Multiple USB and outlet charging stations throughout the library. Free WiFi.',
    eligibility: 'Open to all library visitors.',
    whatToBring: 'Your device and charging cable.',
    languages: ['English', 'Spanish', 'Vietnamese'],
    website: 'https://www.sjpl.org',
  },
  {
    id: 'sj-power-2',
    name: 'St. James Park – Solar Charging Kiosk',
    category: 'power',
    address: 'N 1st St & E St James St, San Jose, CA 95112',
    lat: 37.3413, lng: -121.8839,
    hours: {
      0: { open: '06:00', close: '22:00' }, 1: { open: '06:00', close: '22:00' },
      2: { open: '06:00', close: '22:00' }, 3: { open: '06:00', close: '22:00' },
      4: { open: '06:00', close: '22:00' }, 5: { open: '06:00', close: '22:00' },
      6: { open: '06:00', close: '22:00' },
    },
    notes: 'Solar-powered kiosk with USB ports. Free to use.',
    eligibility: 'Open to all park visitors.',
    whatToBring: 'Your device and charging cable.',
  },
  {
    id: 'sj-shelter-1',
    name: 'Next Door Solutions – Crisis Shelter',
    category: 'shelter',
    address: 'Confidential location – call hotline',
    phone: '4082793260',
    lat: 37.3382, lng: -121.8863,
    hours: {
      0: { open: '00:00', close: '23:59' }, 1: { open: '00:00', close: '23:59' },
      2: { open: '00:00', close: '23:59' }, 3: { open: '00:00', close: '23:59' },
      4: { open: '00:00', close: '23:59' }, 5: { open: '00:00', close: '23:59' },
      6: { open: '00:00', close: '23:59' },
    },
    notes: '24/7 crisis hotline and emergency shelter for domestic violence survivors.',
    eligibility: 'Survivors of domestic violence and their children.',
    whatToBring: 'Call the hotline first. They will help you prepare.',
    languages: ['English', 'Spanish', 'Vietnamese', 'Tagalog', 'Korean'],
    website: 'https://nextdoorsolutions.org',
  },
  {
    id: 'sj-shelter-2',
    name: 'Bill Wilson Center Emergency Shelter',
    category: 'shelter',
    address: '3490 The Alameda, Santa Clara, CA 95050',
    phone: '4082431448',
    lat: 37.3550, lng: -121.9330,
    hours: {
      0: { open: '00:00', close: '23:59' }, 1: { open: '00:00', close: '23:59' },
      2: { open: '00:00', close: '23:59' }, 3: { open: '00:00', close: '23:59' },
      4: { open: '00:00', close: '23:59' }, 5: { open: '00:00', close: '23:59' },
      6: { open: '00:00', close: '23:59' },
    },
    notes: 'Call before arriving to confirm space availability.',
    eligibility: 'Youth ages 18–24 and families with children.',
    whatToBring: 'Photo ID. Medications. Any important documents.',
    languages: ['English', 'Spanish'],
    website: 'https://www.billwilsoncenter.org',
  },
  {
    id: 'sj-shelter-3',
    name: 'HomeFirst Services – 90-Day Shelter',
    category: 'shelter',
    address: '2011 Little Orchard St, San Jose, CA 95125',
    phone: '4082550500',
    lat: 37.2993, lng: -121.8806,
    hours: {
      0: { open: '07:00', close: '22:00' }, 1: { open: '07:00', close: '22:00' },
      2: { open: '07:00', close: '22:00' }, 3: { open: '07:00', close: '22:00' },
      4: { open: '07:00', close: '22:00' }, 5: { open: '07:00', close: '22:00' },
      6: { open: '07:00', close: '22:00' },
    },
    notes: 'Walk-in intake when capacity available. Call ahead recommended.',
    eligibility: 'Adult individuals and couples. Must be 18+.',
    whatToBring: 'Photo ID. Proof of homelessness helpful.',
    languages: ['English', 'Spanish'],
    website: 'https://www.homefirstscc.org',
  },
  {
    id: 'sj-locker-1',
    name: 'Loaves & Fishes – Storage Lockers',
    category: 'lockers',
    address: '195 N 27th St, San Jose, CA 95116',
    phone: '4082549799',
    lat: 37.3567, lng: -121.8645,
    hours: {
      0: { open: '09:00', close: '14:00' }, 1: { open: '09:00', close: '14:00' },
      2: { open: '09:00', close: '14:00' }, 3: { open: '09:00', close: '14:00' },
      4: { open: '09:00', close: '14:00' }, 5: { open: '09:00', close: '14:00' },
      6: { open: '09:00', close: '14:00' },
    },
    notes: 'Secure storage lockers for belongings. Must register for locker assignment.',
    eligibility: 'Currently homeless individuals.',
    whatToBring: 'Photo ID or case manager referral.',
    languages: ['English', 'Spanish'],
  },
  {
    id: 'sj-locker-2',
    name: 'HomeFirst – Day Storage Program',
    category: 'lockers',
    address: '2011 Little Orchard St, San Jose, CA 95125',
    phone: '4082550500',
    lat: 37.2993, lng: -121.8806,
    hours: {
      0: null,
      1: { open: '08:00', close: '16:00' }, 2: { open: '08:00', close: '16:00' },
      3: { open: '08:00', close: '16:00' }, 4: { open: '08:00', close: '16:00' },
      5: { open: '08:00', close: '16:00' }, 6: null,
    },
    notes: 'Daytime storage for belongings. First-come, first-served.',
    eligibility: 'Homeless adults.',
    whatToBring: 'Photo ID.',
    languages: ['English', 'Spanish'],
  },
];

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getOpenStatus(r: Resource): { isOpen: boolean; minutesToClose: number | null; label: string } {
  const now = new Date();
  const dow = now.getDay();
  const h = r.hours[dow];
  if (!h) return { isOpen: false, minutesToClose: null, label: 'Closed today' };
  if (h.open === '00:00' && h.close === '23:59') {
    return { isOpen: true, minutesToClose: null, label: 'Open 24h' };
  }
  const [openH, openM] = h.open.split(':').map(Number);
  const [closeH, closeM] = h.close.split(':').map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;
  if (cur < openMins || cur >= closeMins) {
    return { isOpen: false, minutesToClose: null, label: `Opens ${formatTime(h.open)}` };
  }
  const left = closeMins - cur;
  if (left <= 60) return { isOpen: true, minutesToClose: left, label: `Closes in ${left}m` };
  return { isOpen: true, minutesToClose: left, label: `Open until ${formatTime(h.close)}` };
}

function loadFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); }
  catch { return []; }
}
function saveFavorites(ids: string[]) { localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)); }

function loadRecents(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'); }
  catch { return []; }
}
function saveRecents(ids: string[]) { localStorage.setItem(RECENTS_KEY, JSON.stringify(ids)); }

// ── Component ─────────────────────────────────────────────────────────────────

export default function CommunityNavigator({ onBack }: CommunityNavigatorProps) {
  const [lang, setLang] = useState<LangCode>(loadLang);
  const [selectedCity, setSelectedCity] = useState<CityKey>(loadCity);
  const [hospitalMode, setHospitalMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vaultDocs, setVaultDocs] = useState<StoredDoc[]>(loadVault);
  const [previewDoc, setPreviewDoc] = useState<StoredDoc | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resource finder state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [zipInput, setZipInput] = useState('');
  const [zipLoading, setZipLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [openNowOnly, setOpenNowOnly] = useState(true);
  const [radiusMi, setRadiusMi] = useState(5);
  const [sortBy, setSortBy] = useState<'nearest' | 'open-first' | 'az'>('nearest');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(loadRecents);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isOnline = navigator.onLine;
  const t = languageMap[lang];
  const city = cityResources[selectedCity];
  const isRtl = lang === 'ar' || lang === 'fa' || lang === 'prs';
  const isAzureLang = AZURE_LANG_CODES.includes(lang);

  const handleLangChange = (code: LangCode) => {
    setLang(code);
    localStorage.setItem(LANG_KEY, code);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = speechLangMap[code];
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as CityKey;
    setSelectedCity(val);
    localStorage.setItem(CITY_KEY_STORAGE, val);
    setSelectedCategory(null);
  };

  const categoryLabel = (id: string): string => t[id as keyof LangStrings] ?? id;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const newDoc: StoredDoc = {
        id: `${Date.now()}`,
        name: file.name,
        dataUrl,
        addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      const updated = [newDoc, ...vaultDocs];
      setVaultDocs(updated);
      saveVault(updated);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const deleteDoc = (id: string) => {
    const updated = vaultDocs.filter(d => d.id !== id);
    setVaultDocs(updated);
    saveVault(updated);
  };

  // Resource finder handlers
  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location access denied. Enter a ZIP code below.');
        } else {
          setGeoError('Unable to get location. Try entering a ZIP code.');
        }
      },
      { timeout: 10000 }
    );
  }, []);

  const handleZipSearch = useCallback(async () => {
    if (!zipInput.trim() || zipInput.length < 5) return;
    setZipLoading(true);
    setGeoError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zipInput)}&country=US&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data[0]) {
        setUserCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        setGeoError(null);
      } else {
        setGeoError('ZIP code not found. Try another.');
      }
    } catch {
      setGeoError('Could not look up ZIP code. Check your connection.');
    } finally {
      setZipLoading(false);
    }
  }, [zipInput]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);

  const viewResource = useCallback((resource: Resource) => {
    setSelectedResource(resource);
    setRecentlyViewed(prev => {
      const next = [resource.id, ...prev.filter(id => id !== resource.id)].slice(0, 10);
      saveRecents(next);
      return next;
    });
  }, []);

  const handleCopyAddress = useCallback((resource: Resource) => {
    navigator.clipboard.writeText(resource.address).catch(() => {});
    setCopiedId(resource.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleShare = useCallback((resource: Resource) => {
    const text = `${resource.name}\n${resource.address}${resource.phone ? `\nPhone: ${resource.phone}` : ''}`;
    if (navigator.share) {
      navigator.share({ title: resource.name, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }, []);

  const filteredResources = useMemo(() => {
    let list = SAMPLE_RESOURCES.slice();
    if (filterCategory !== 'all') {
      list = list.filter(r => r.category === filterCategory);
    }
    if (openNowOnly) {
      list = list.filter(r => getOpenStatus(r).isOpen);
    }
    if (userCoords) {
      list = list.filter(r => haversine(userCoords.lat, userCoords.lng, r.lat, r.lng) <= radiusMi);
    }
    list.sort((a, b) => {
      if (sortBy === 'az') return a.name.localeCompare(b.name);
      if (sortBy === 'open-first') {
        const diff = (getOpenStatus(a).isOpen ? 0 : 1) - (getOpenStatus(b).isOpen ? 0 : 1);
        if (diff !== 0) return diff;
      }
      if (userCoords) {
        return (
          haversine(userCoords.lat, userCoords.lng, a.lat, a.lng) -
          haversine(userCoords.lat, userCoords.lng, b.lat, b.lng)
        );
      }
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [filterCategory, openNowOnly, radiusMi, sortBy, userCoords]);

  const selectStyle = 'w-full appearance-none bg-gray-900 border border-gray-700 text-white text-sm rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 cursor-pointer';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col" lang={speechLangMap[lang]} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 bg-gray-950 border-b border-gray-800 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-lg font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold bg-green-400/10 border border-green-400/30 px-2.5 py-1 rounded-full">
                <Wifi className="w-3.5 h-3.5" />
                Offline Ready
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-full">
                <WifiOff className="w-3.5 h-3.5" />
                Offline Mode
              </span>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-2">
          <h1 className="text-3xl font-bold text-white mb-1">Community Navigator</h1>
          <div className="flex items-start gap-2">
            <p className="text-gray-400 text-sm flex-1">{t.instructions}</p>
            {lang !== 'en' && (
              <button
                onClick={() => playNavText(t.instructions, lang)}
                className="flex-shrink-0 p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-lg transition-colors"
                title="Read instructions aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-2 pt-2">
          <div className="flex flex-wrap gap-2">
            {LANG_OPTIONS.map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => handleLangChange(code)}
                title={label}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-150 ${
                  lang === code
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm shadow-amber-400/20'
                    : 'border-gray-700 bg-gray-900 text-gray-200 hover:border-gray-500 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-base leading-none">{flag}</span>
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
          {isAzureLang && (
            <p className="text-xs text-gray-500 mt-2">Translations powered by Microsoft Azure</p>
          )}
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="w-full appearance-none bg-gray-900 border border-gray-700 text-white text-sm font-semibold rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
            >
              {CITY_KEYS.map(key => (
                <option key={key} value={key}>{cityResources[key].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={() => setHospitalMode(m => !m)}
            title="Hospital Staff View"
            className={`flex items-center gap-2 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all duration-150 flex-shrink-0 ${
              hospitalMode
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Hospital View</span>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-8">

        <a
          href="tel:211"
          className="block w-full bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-2xl py-5 px-6 shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black tracking-tight">{t.call211}</div>
              <div className="text-sm font-semibold text-gray-800 mt-0.5">Social services, food, shelter — 24/7 free helpline</div>
            </div>
            <div className="flex items-center gap-3">
              {lang !== 'en' && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); playNavText(t.call211, lang); }}
                  className="p-2 text-gray-800 hover:text-gray-950 hover:bg-amber-300 rounded-lg transition-colors"
                  title="Read aloud"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
              <Phone className="w-10 h-10 text-gray-900 flex-shrink-0" />
            </div>
          </div>
        </a>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              {city.label} Resources
            </h2>
            <a
              href={`tel:${city.outreachPhone}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              {city.outreachLabel}
            </a>
          </div>
          <CityResources
            city={city}
            hospitalMode={hospitalMode}
            activeCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            categoryLabel={categoryLabel}
          />
        </section>

        {/* ── Find Resources Open Now ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-sky-400 uppercase tracking-widest">Find Resources Open Now</h2>
            <span className="text-xs text-gray-500">{filteredResources.length} found</span>
          </div>

          {/* Location bar */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-3">
            {userCoords ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                  <Navigation className="w-4 h-4" />
                  <span>Location active</span>
                </div>
                <button
                  onClick={() => { setUserCoords(null); setZipInput(''); }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleUseLocation}
                  disabled={geoLoading}
                  className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  {geoLoading ? 'Getting location…' : 'Use My Location'}
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-600">or enter ZIP code</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 95112"
                    value={zipInput}
                    onChange={e => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    onKeyDown={e => e.key === 'Enter' && handleZipSearch()}
                    className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button
                    onClick={handleZipSearch}
                    disabled={zipLoading || zipInput.length < 5}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {zipLoading ? '…' : 'Go'}
                  </button>
                </div>
              </div>
            )}
            {geoError && <p className="text-amber-400 text-xs mt-2">{geoError}</p>}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="relative">
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={selectStyle}>
                {RESOURCE_FILTER_CATS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => setOpenNowOnly(v => !v)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all border ${
                openNowOnly
                  ? 'bg-green-600/20 border-green-500 text-green-400'
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Open Now
            </button>
            <div className="relative">
              <select
                value={radiusMi}
                onChange={e => setRadiusMi(Number(e.target.value))}
                className={selectStyle}
                disabled={!userCoords}
                title={!userCoords ? 'Enable location to filter by distance' : undefined}
              >
                <option value={1}>Within 1 mi</option>
                <option value={3}>Within 3 mi</option>
                <option value={5}>Within 5 mi</option>
                <option value={10}>Within 10 mi</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className={selectStyle}>
                <option value="nearest">Nearest first</option>
                <option value="open-first">Open first</option>
                <option value="az">A – Z</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Resource cards */}
          {filteredResources.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <MapPin className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">No resources match your filters.</p>
              {openNowOnly && (
                <p className="text-gray-600 text-xs mt-1">Try turning off "Open Now" to see all hours.</p>
              )}
              {!userCoords && (
                <p className="text-gray-600 text-xs mt-1">Enable location to filter by distance.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResources.map(resource => {
                const status = getOpenStatus(resource);
                const dist = userCoords
                  ? haversine(userCoords.lat, userCoords.lng, resource.lat, resource.lng)
                  : null;
                const isFav = favorites.includes(resource.id);
                const CatIcon = CAT_ICON[resource.category] || Package;

                return (
                  <div key={resource.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-start gap-2 mb-1.5">
                        <h3 className="font-bold text-white text-sm leading-snug flex-1">{resource.name}</h3>
                        <div className="flex-shrink-0">
                          {status.isOpen ? (
                            <span className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {status.label === 'Open 24h' ? 'Open 24h' : 'Open'}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/30 px-2 py-0.5 rounded-full">
                              Closed
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                        <span className={`flex items-center gap-1 text-xs ${CAT_COLOR[resource.category] || 'text-gray-400'}`}>
                          <CatIcon className="w-3 h-3" />
                          {RESOURCE_FILTER_CATS.find(c => c.value === resource.category)?.label || resource.category}
                        </span>
                        {dist !== null && (
                          <span className="text-xs text-gray-500">{dist < 0.1 ? '<0.1' : dist.toFixed(1)} mi</span>
                        )}
                        {status.isOpen && status.minutesToClose !== null && status.minutesToClose <= 60 && (
                          <span className="text-xs font-semibold text-amber-400">{status.label}</span>
                        )}
                        {status.isOpen && status.minutesToClose !== null && status.minutesToClose > 60 && (
                          <span className="text-xs text-gray-500">{status.label}</span>
                        )}
                        {!status.isOpen && status.label !== 'Closed today' && (
                          <span className="text-xs text-gray-600">{status.label}</span>
                        )}
                      </div>

                      <p className="text-gray-500 text-xs leading-snug">{resource.address}</p>
                    </div>

                    <div className="px-4 pb-3 pt-2.5 border-t border-gray-800/60 flex items-center flex-wrap gap-1.5">
                      {resource.phone && (
                        <a
                          href={`tel:${resource.phone}`}
                          className="flex items-center gap-1 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Directions
                      </a>
                      <button
                        onClick={() => handleCopyAddress(resource)}
                        className="flex items-center gap-1 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        {copiedId === resource.id
                          ? <Check className="w-3.5 h-3.5 text-green-400" />
                          : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === resource.id ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleShare(resource)}
                        className="flex items-center gap-1 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                      <button
                        onClick={() => toggleFavorite(resource.id)}
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                          isFav
                            ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
                            : 'text-gray-400 bg-gray-800 hover:bg-gray-700'
                        }`}
                        title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => viewResource(resource)}
                        className="flex items-center gap-1 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-sky-400 hover:text-sky-300 px-2.5 py-1.5 rounded-lg transition-colors ml-auto"
                      >
                        Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Saved Favorites</h3>
              <div className="flex flex-wrap gap-2">
                {favorites.map(id => {
                  const r = SAMPLE_RESOURCES.find(sr => sr.id === id);
                  if (!r) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => viewResource(r)}
                      className="flex items-center gap-1.5 bg-red-400/10 border border-red-400/20 hover:border-red-400/40 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Heart className="w-3 h-3 fill-current" />
                      {r.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Recently Viewed</h3>
              <div className="flex flex-wrap gap-2">
                {recentlyViewed.slice(0, 5).map(id => {
                  const r = SAMPLE_RESOURCES.find(sr => sr.id === id);
                  if (!r) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => viewResource(r)}
                      className="text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {r.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Quick Category Dial</h2>
            {lang !== 'en' && (
              <button
                onClick={() => playNavText(
                  `${t.food}. ${t.medical}. ${t.bathrooms}. ${t.power}. ${t.shelter}. ${t.lockers}.`,
                  lang
                )}
                className="p-1 text-amber-400/60 hover:text-amber-400 hover:bg-amber-400/10 rounded transition-colors"
                title="Read categories aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {RESOURCE_CATEGORIES.map(({ id, Icon, color }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(selectedCategory === id ? null : id)}
                className={`${color} ${selectedCategory === id ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-950' : ''} text-white rounded-xl py-5 px-4 font-semibold text-base shadow-md transition-all duration-150 active:scale-95 flex flex-col items-center gap-2`}
              >
                <Icon className="w-7 h-7" />
                {t[id as keyof LangStrings]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">Crisis Text Line</h2>
          <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl px-5 py-4">
            <div>
              <div className="font-bold text-white text-base">General Crisis Text Line</div>
              <div className="text-xs text-gray-500 mt-0.5">Text HOPE to 20121</div>
            </div>
            <a
              href="sms:20121?body=HOPE"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Text HOPE
            </a>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-bold text-green-400 uppercase tracking-widest">ID Vault</h2>
              <p className="text-gray-500 text-xs mt-0.5">Photos stored only on this device</p>
            </div>
            <div className="flex items-center gap-1.5 text-green-400/70 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Local only</span>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-700 hover:border-green-500/60 rounded-xl py-6 px-4 flex flex-col items-center gap-2 text-gray-400 hover:text-green-400 transition-all duration-150 mb-4"
          >
            <Camera className="w-8 h-8" />
            <span className="font-semibold text-sm">{uploading ? 'Saving...' : 'Upload ID Photo'}</span>
            <span className="text-xs text-gray-600">Photo ID, insurance card, benefit letter, etc.</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {vaultDocs.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <Upload className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No documents saved yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {vaultDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      <img src={doc.dataUrl} alt={doc.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-gray-600 text-xs">{doc.addedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDoc(doc.id)}
                      className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="pb-6" />
      </div>

      {/* ID preview modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          onClick={() => setPreviewDoc(null)}
        >
          <button
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
            onClick={() => setPreviewDoc(null)}
          >
            <X className="w-10 h-10" />
          </button>
          <img
            src={previewDoc.dataUrl}
            alt={previewDoc.name}
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Resource detail modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-gray-950 z-50 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-6 pb-16">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedResource(null)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <button
                onClick={() => toggleFavorite(selectedResource.id)}
                className={`p-2 rounded-lg transition-colors ${
                  favorites.includes(selectedResource.id)
                    ? 'text-red-400 bg-red-400/10'
                    : 'text-gray-500 hover:text-red-400 hover:bg-red-400/10'
                }`}
                title={favorites.includes(selectedResource.id) ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Heart className={`w-5 h-5 ${favorites.includes(selectedResource.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-xl font-bold text-white leading-snug flex-1">{selectedResource.name}</h2>
                  {(() => {
                    const s = getOpenStatus(selectedResource);
                    return s.isOpen ? (
                      <span className="text-sm font-bold text-green-400 bg-green-400/10 border border-green-400/30 px-3 py-1 rounded-full flex-shrink-0">{s.label}</span>
                    ) : (
                      <span className="text-sm font-bold text-red-400 bg-red-400/10 border border-red-400/30 px-3 py-1 rounded-full flex-shrink-0">Closed</span>
                    );
                  })()}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm">{selectedResource.address}</p>
                      <div className="flex gap-3 mt-1.5">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedResource.lat},${selectedResource.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          Get Directions
                        </a>
                        <button
                          onClick={() => handleCopyAddress(selectedResource)}
                          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {copiedId === selectedResource.id ? 'Copied!' : 'Copy Address'}
                        </button>
                      </div>
                    </div>
                  </div>
                  {selectedResource.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <a
                        href={`tel:${selectedResource.phone}`}
                        className="text-green-400 font-semibold text-sm hover:text-green-300 transition-colors"
                      >
                        {selectedResource.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Hours */}
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Hours</h3>
                <div className="space-y-1">
                  {DOW_NAMES.map((name, dow) => {
                    const todayDow = new Date().getDay();
                    const h = selectedResource.hours[dow];
                    const isToday = dow === todayDow;
                    return (
                      <div
                        key={dow}
                        className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${
                          isToday ? 'bg-amber-500/10 border border-amber-500/20' : ''
                        }`}
                      >
                        <span className={`text-sm ${isToday ? 'text-amber-300 font-bold' : 'text-gray-400'}`}>
                          {name}{isToday && ' (today)'}
                        </span>
                        {h ? (
                          <span className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-gray-300'}`}>
                            {h.open === '00:00' && h.close === '23:59'
                              ? '24 hours'
                              : `${formatTime(h.open)} – ${formatTime(h.close)}`}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedResource.eligibility && (
                <div>
                  <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2">Who Can Use This</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedResource.eligibility}</p>
                </div>
              )}

              {selectedResource.whatToBring && (
                <div>
                  <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">What to Bring</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedResource.whatToBring}</p>
                </div>
              )}

              {selectedResource.notes && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedResource.notes}</p>
                </div>
              )}

              {selectedResource.languages && selectedResource.languages.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Languages Spoken</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResource.languages.map(l => (
                      <span key={l} className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full">{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedResource.website && (
                <a
                  href={selectedResource.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-semibold transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
