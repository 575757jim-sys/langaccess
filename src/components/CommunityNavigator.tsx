import { useState, useRef } from 'react';
import {
  ArrowLeft, Phone, MessageSquare, Utensils, Stethoscope, Droplets,
  BatteryCharging, Home, Package, Wifi, WifiOff, ShieldCheck,
  Upload, Trash2, Eye, X, Camera, ChevronDown, Building2
} from 'lucide-react';
import CityResources from './CityResources';
import { cityResources, CITY_KEYS, CityKey } from '../data/cityResources';

interface CommunityNavigatorProps {
  onBack: () => void;
}

const LANG_KEY = 'langaccess_nav_lang';
const CITY_KEY_STORAGE = 'langaccess_nav_city';

type LangCode = 'en' | 'es' | 'vi' | 'tl';

interface LangStrings {
  food: string;
  medical: string;
  bathrooms: string;
  power: string;
  shelter: string;
  lockers: string;
  call211: string;
}

const languageMap: Record<LangCode, LangStrings> = {
  en: { food: 'Food', medical: 'Medical + Dental', bathrooms: 'Bathrooms', power: 'Power / Charging', shelter: 'Shelter', lockers: 'Lockers', call211: 'Call 211' },
  es: { food: 'Comida', medical: 'Médico', bathrooms: 'Baños', power: 'Energía', shelter: 'Refugio', lockers: 'Casilleros', call211: 'Llamar al 211' },
  vi: { food: 'Thức ăn', medical: 'Y tế', bathrooms: 'Phòng tắm', power: 'Sạc điện', shelter: 'Chỗ ở', lockers: 'Tủ đồ', call211: 'Gọi 211' },
  tl: { food: 'Pagkain', medical: 'Medikal', bathrooms: 'Banyo', power: 'Kuryente', shelter: 'Silungan', lockers: 'Locker', call211: 'Tumawag sa 211' },
};

const speechLangMap: Record<LangCode, string> = {
  en: 'en-US',
  es: 'es-US',
  vi: 'vi-VN',
  tl: 'tl-PH',
};

const LANG_OPTIONS: { code: LangCode; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇲🇽', label: 'Español' },
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'tl', flag: '🇵🇭', label: 'Filipino' },
];

const RESOURCE_CATEGORIES: { id: keyof LangStrings; Icon: React.FC<{ className?: string }>; color: string }[] = [
  { id: 'food', Icon: Utensils, color: 'bg-amber-500 hover:bg-amber-400' },
  { id: 'medical', Icon: Stethoscope, color: 'bg-red-500 hover:bg-red-400' },
  { id: 'bathrooms', Icon: Droplets, color: 'bg-cyan-500 hover:bg-cyan-400' },
  { id: 'power', Icon: BatteryCharging, color: 'bg-yellow-500 hover:bg-yellow-400' },
  { id: 'shelter', Icon: Home, color: 'bg-green-500 hover:bg-green-400' },
  { id: 'lockers', Icon: Package, color: 'bg-orange-500 hover:bg-orange-400' },
];

const ID_VAULT_KEY = 'langaccess_id_vault';

interface StoredDoc {
  id: string;
  name: string;
  dataUrl: string;
  addedAt: string;
}

function loadVault(): StoredDoc[] {
  try {
    return JSON.parse(localStorage.getItem(ID_VAULT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveVault(docs: StoredDoc[]) {
  localStorage.setItem(ID_VAULT_KEY, JSON.stringify(docs));
}

function loadLang(): LangCode {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === 'en' || saved === 'es' || saved === 'vi' || saved === 'tl') return saved;
  return 'en';
}

function loadCity(): CityKey {
  const saved = localStorage.getItem(CITY_KEY_STORAGE);
  if (saved && CITY_KEYS.includes(saved as CityKey)) return saved as CityKey;
  return 'san-jose';
}

export default function CommunityNavigator({ onBack }: CommunityNavigatorProps) {
  const [lang, setLang] = useState<LangCode>(loadLang);
  const [selectedCity, setSelectedCity] = useState<CityKey>(loadCity);
  const [hospitalMode, setHospitalMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vaultDocs, setVaultDocs] = useState<StoredDoc[]>(loadVault);
  const [previewDoc, setPreviewDoc] = useState<StoredDoc | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOnline = navigator.onLine;
  const t = languageMap[lang];
  const city = cityResources[selectedCity];

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

  const categoryLabel = (id: string): string => {
    return t[id as keyof LangStrings] ?? id;
  };

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

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col" lang={speechLangMap[lang]}>
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

        <div className="max-w-2xl mx-auto px-4 pb-3 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Community Navigator</h1>
            <p className="text-gray-400 text-sm mt-1">Resources, outreach, and support near you</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {LANG_OPTIONS.map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => handleLangChange(code)}
                title={label}
                className={`text-xl px-2 py-1 rounded-lg transition-all duration-150 ${
                  lang === code
                    ? 'bg-amber-500/20 ring-1 ring-amber-400 scale-110'
                    : 'opacity-50 hover:opacity-80 hover:bg-gray-800'
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
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
            <Phone className="w-10 h-10 text-gray-900 flex-shrink-0" />
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

        <section>
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Quick Category Dial</h2>
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
    </div>
  );
}
