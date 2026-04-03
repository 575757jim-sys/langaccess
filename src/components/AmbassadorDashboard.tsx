import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, CheckCircle, CreditCard as Edit, Plus, ChevronDown, X } from 'lucide-react';
import { cityResources, CITY_KEYS, CityFacility } from '../data/cityResources';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  { id: 'food', label: 'Food', color: 'bg-amber-500' },
  { id: 'medical', label: 'Medical + Dental', color: 'bg-red-500' },
  { id: 'bathrooms', label: 'Bathrooms', color: 'bg-cyan-500' },
  { id: 'power', label: 'Power / Charging', color: 'bg-yellow-500' },
  { id: 'shelter', label: 'Shelter', color: 'bg-green-500' },
  { id: 'lockers', label: 'Lockers', color: 'bg-orange-500' },
] as const;

interface VerifyModalProps {
  resource: CityFacility & { verifiedBy?: string; verifiedDays?: number };
  onClose: () => void;
  onSubmit: (data: VerificationData) => void;
  mode: 'verify' | 'update';
}

interface VerificationData {
  isOpen: string;
  hours: string;
  notes: string;
}

interface AddResourceData {
  name: string;
  category: string;
  address: string;
  hours: string;
  notes: string;
}

interface Submission {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'verified' | 'needs-review';
  created_at: string;
}

function VerifyModal({ resource, onClose, onSubmit, mode }: VerifyModalProps) {
  const [isOpen, setIsOpen] = useState('');
  const [hours, setHours] = useState(resource.hours || '');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({ isOpen, hours, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-gray-950 border border-gray-700 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === 'verify' ? 'Verify Resource' : 'Update Info'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">{resource.name}</h3>
            <p className="text-gray-400 text-sm flex items-start gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {resource.address}
            </p>
          </div>

          <div>
            <label className="block text-white font-semibold text-base mb-3">
              Is this location open?
            </label>
            <div className="space-y-2">
              {['Yes', 'No', 'Unsure'].map((option) => (
                <button
                  key={option}
                  onClick={() => setIsOpen(option)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-base transition-all duration-150 ${
                    isOpen === option
                      ? 'bg-amber-500 text-gray-950 border-2 border-amber-400'
                      : 'bg-gray-900 text-gray-300 border-2 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold text-sm mb-2">
              Hours (Optional)
            </label>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g., Mon-Fri 9am-5pm"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-white font-semibold text-sm mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Languages spoken, restrictions, conditions"
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isOpen}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-150 ${
              isOpen
                ? 'bg-green-600 hover:bg-green-500 text-white active:scale-95'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Update
          </button>
        </div>
      </div>
    </div>
  );
}

function AddResourceModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: AddResourceData) => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (name && category && address) {
      onSubmit({ name, category, address, hours, notes });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-gray-950 border border-gray-700 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add New Resource</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-white font-semibold text-sm mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Resource name"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-white font-semibold text-sm mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold text-sm mb-2">
              Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-white font-semibold text-sm mb-2">
              Hours (Optional)
            </label>
            <input
              type="text"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g., Mon-Fri 9am-5pm"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-white font-semibold text-sm mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Languages spoken, restrictions, conditions, etc."
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name || !category || !address}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-150 ${
              name && category && address
                ? 'bg-green-600 hover:bg-green-500 text-white active:scale-95'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Resource
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AmbassadorDashboard({ onBack }: { onBack: () => void }) {
  const [selectedCity, setSelectedCity] = useState<string>('concord');
  const [verifyModal, setVerifyModal] = useState<{ resource: CityFacility & { verifiedBy?: string; verifiedDays?: number }; mode: 'verify' | 'update' } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'resources' | 'submissions'>('resources');
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const city = cityResources[selectedCity as keyof typeof cityResources];

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    const mockSubmissions: Submission[] = [
      { id: '1', name: 'St. Mary\'s Center', category: 'food', status: 'verified', created_at: new Date().toISOString() },
      { id: '2', name: 'Community Health Clinic', category: 'medical', status: 'pending', created_at: new Date().toISOString() },
      { id: '3', name: 'Public Library Charging Station', category: 'power', status: 'needs-review', created_at: new Date().toISOString() },
    ];
    setSubmissions(mockSubmissions);
  };

  const handleVerification = async (data: VerificationData) => {
    console.log('Verification submitted:', data);

    await supabase.from('interaction_logs').insert({
      event_type: 'ambassador_verification',
      event_data: {
        resource_name: verifyModal?.resource.name,
        verification_data: data,
        city: selectedCity,
      },
    });
  };

  const handleAddResource = async (data: AddResourceData) => {
    console.log('New resource submitted:', data);

    await supabase.from('interaction_logs').insert({
      event_type: 'ambassador_new_resource',
      event_data: {
        resource_data: data,
        city: selectedCity,
      },
    });

    const newSubmission: Submission = {
      id: Date.now().toString(),
      name: data.name,
      category: data.category,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setSubmissions([newSubmission, ...submissions]);
  };

  const getCategoryLabel = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId)?.label || categoryId;
  };

  const getCategoryColor = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId)?.color || 'bg-gray-500';
  };

  const getConfidence = (index: number) => {
    if (index < 2) return { label: 'High', color: 'text-green-400' };
    if (index < 4) return { label: 'Medium', color: 'text-yellow-400' };
    return { label: 'Low', color: 'text-orange-400' };
  };

  const getVerifiedBy = (index: number) => {
    const names = ['Maria G.', 'James L.', 'Sarah K.', 'Michael R.', 'Lisa M.'];
    return names[index % names.length];
  };

  const getVerifiedDays = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 14) + 1;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <div className="sticky top-0 z-30 bg-gray-950 border-b border-gray-800 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Ambassador Dashboard</h1>
              <p className="text-gray-400 text-sm">Help keep resources accurate</p>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full appearance-none bg-gray-900 border border-gray-700 text-white text-sm font-semibold rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
            >
              {CITY_KEYS.map(key => (
                <option key={key} value={key}>{cityResources[key].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-150 ${
                activeTab === 'resources'
                  ? 'bg-amber-500 text-gray-950'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-150 ${
                activeTab === 'submissions'
                  ? 'bg-amber-500 text-gray-950'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              My Submissions
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {activeTab === 'resources' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">{city.facilities.length} resources in {city.label}</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-150 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>

            {city.facilities.map((facility, index) => {
              const confidence = getConfidence(index);
              const verifiedBy = getVerifiedBy(index);
              const verifiedDays = getVerifiedDays(facility.name);

              return (
                <div
                  key={index}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-white font-bold text-base leading-tight flex-1">
                        {facility.name}
                      </h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(facility.category)} bg-opacity-20`}>
                        {getCategoryLabel(facility.category)}
                      </span>
                    </div>

                    <p className="flex items-start gap-1 text-gray-400 text-sm mb-1">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {facility.address}
                    </p>

                    {facility.hours && (
                      <p className="flex items-center gap-1 text-gray-500 text-xs">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        {facility.hours}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs border-t border-gray-800 pt-3">
                    <div className="flex-1">
                      <p className="text-gray-500 mb-0.5">Verified by {verifiedBy}</p>
                      <p className="text-gray-600">Last verified: {verifiedDays} {verifiedDays === 1 ? 'day' : 'days'} ago</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 mb-0.5">Confidence</p>
                      <p className={`font-bold ${confidence.color}`}>{confidence.label}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setVerifyModal({ resource: { ...facility, verifiedBy, verifiedDays }, mode: 'verify' })}
                      className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-3 rounded-xl text-sm transition-all duration-150 active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Verify</span>
                    </button>
                    <button
                      onClick={() => setVerifyModal({ resource: { ...facility, verifiedBy, verifiedDays }, mode: 'update' })}
                      className="flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-3 rounded-xl text-sm transition-all duration-150 active:scale-95"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Update</span>
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-3 rounded-xl text-sm transition-all duration-150 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-white font-bold text-lg mb-1">My Submissions</h2>
              <p className="text-gray-400 text-sm">{submissions.length} total submissions</p>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
                <p className="text-gray-500 mb-4">No submissions yet</p>
                <button
                  onClick={() => {
                    setActiveTab('resources');
                    setShowAddModal(true);
                  }}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-150 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Resource
                </button>
              </div>
            ) : (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-base mb-1">{submission.name}</h3>
                      <p className="text-gray-400 text-sm">{getCategoryLabel(submission.category)}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                        submission.status === 'verified'
                          ? 'bg-green-500/20 text-green-300'
                          : submission.status === 'pending'
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-orange-500/20 text-orange-300'
                      }`}
                    >
                      {submission.status === 'verified' ? 'Verified' : submission.status === 'pending' ? 'Pending' : 'Needs Review'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs">
                    Submitted {new Date(submission.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {verifyModal && (
        <VerifyModal
          resource={verifyModal.resource}
          mode={verifyModal.mode}
          onClose={() => setVerifyModal(null)}
          onSubmit={handleVerification}
        />
      )}

      {showAddModal && (
        <AddResourceModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddResource}
        />
      )}
    </div>
  );
}
