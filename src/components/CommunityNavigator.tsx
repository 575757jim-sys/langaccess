import { useState, useRef } from 'react';
import {
  ArrowLeft, Phone, MessageSquare, Utensils, Stethoscope, Droplets,
  BatteryCharging, Home, Package, Wifi, WifiOff, ShieldCheck,
  Upload, Trash2, Eye, X, Camera
} from 'lucide-react';

interface CommunityNavigatorProps {
  onBack: () => void;
}

const RESOURCE_CATEGORIES = [
  { id: 'food', label: 'Food', Icon: Utensils, color: 'bg-amber-500 hover:bg-amber-400' },
  { id: 'medical', label: 'Medical + Dental', Icon: Stethoscope, color: 'bg-red-500 hover:bg-red-400' },
  { id: 'bathrooms', label: 'Bathrooms', Icon: Droplets, color: 'bg-cyan-500 hover:bg-cyan-400' },
  { id: 'power', label: 'Power / Charging', Icon: BatteryCharging, color: 'bg-yellow-500 hover:bg-yellow-400' },
  { id: 'shelter', label: 'Shelter', Icon: Home, color: 'bg-green-500 hover:bg-green-400' },
  { id: 'lockers', label: 'Lockers', Icon: Package, color: 'bg-orange-500 hover:bg-orange-400' },
];

const OUTREACH_CONTACTS = [
  { label: 'SF HOT Team', number: '4153557401', display: '(415) 355-7401', region: 'San Francisco' },
  { label: 'Oakland Street Medicine', number: '5108918950', display: '(510) 891-8950', region: 'Oakland' },
  { label: 'San Jose HomeFirst', number: '4085107600', display: '(408) 510-7600', region: 'San Jose' },
  { label: 'Sacramento Hope Cooperative', number: '9164410166', display: '(916) 441-0166', region: 'Sacramento' },
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

export default function CommunityNavigator({ onBack }: CommunityNavigatorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vaultDocs, setVaultDocs] = useState<StoredDoc[]>(loadVault);
  const [previewDoc, setPreviewDoc] = useState<StoredDoc | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOnline = navigator.onLine;

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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
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
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <h1 className="text-3xl font-bold text-white">Community Navigator</h1>
          <p className="text-gray-400 text-sm mt-1">Resources, outreach, and support near you</p>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-8">

        <a
          href="tel:211"
          className="block w-full bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-2xl py-5 px-6 shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black tracking-tight">Call 211</div>
              <div className="text-sm font-semibold text-gray-800 mt-0.5">Social services, food, shelter — 24/7 free helpline</div>
            </div>
            <Phone className="w-10 h-10 text-gray-900 flex-shrink-0" />
          </div>
        </a>

        <section>
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Find Resources</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {RESOURCE_CATEGORIES.map(({ id, label, Icon, color }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(selectedCategory === id ? null : id)}
                className={`${color} ${selectedCategory === id ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-950' : ''} text-white rounded-xl py-5 px-4 font-semibold text-base shadow-md transition-all duration-150 active:scale-95 flex flex-col items-center gap-2`}
              >
                <Icon className="w-7 h-7" />
                {label}
              </button>
            ))}
          </div>
          {selectedCategory && (
            <div className="mt-4 bg-gray-900 border border-gray-700 rounded-xl p-5">
              <p className="text-amber-300 font-semibold text-sm mb-2">
                Finding {RESOURCE_CATEGORIES.find(c => c.id === selectedCategory)?.label} near you
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Call <strong className="text-white">211</strong> or visit <strong className="text-white">211.org</strong> for a live directory of nearby {RESOURCE_CATEGORIES.find(c => c.id === selectedCategory)?.label.toLowerCase()} resources. Updated daily with real-time availability.
              </p>
              <a
                href="tel:211"
                className="mt-3 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call 211 Now
              </a>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">Direct Outreach</h2>
          <div className="space-y-3">
            {OUTREACH_CONTACTS.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-orange-500/50 rounded-xl px-5 py-4 transition-all duration-150 group"
              >
                <div>
                  <div className="font-bold text-white text-base group-hover:text-orange-300 transition-colors">{contact.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{contact.region}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 font-mono text-sm font-semibold">{contact.display}</span>
                  <div className="bg-orange-500 group-hover:bg-orange-400 rounded-full p-2 transition-colors">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                </div>
              </a>
            ))}

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
