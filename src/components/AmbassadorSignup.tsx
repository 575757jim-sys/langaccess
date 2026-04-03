import { useState } from 'react';
import { X, User, Mail, MapPin } from 'lucide-react';

interface AmbassadorSignupProps {
  onClose: () => void;
  onComplete: (data: { name: string; email: string; city: string }) => void;
}

export default function AmbassadorSignup({ onClose, onComplete }: AmbassadorSignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');

  console.log('AmbassadorSignup rendered');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && city.trim()) {
      onComplete({
        name: name.trim(),
        email: email.trim(),
        city: city.trim(),
      });
    }
  };

  const isValid = name.trim() && city.trim();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Join the Ambassador Brigade</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-slate-300 text-sm leading-relaxed">
            Become a LangAccess Ambassador and help bridge language barriers in your community.
          </p>

          <div>
            <label className="block text-white font-semibold text-sm mb-2">
              Your Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Maria Sanchez"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold text-sm mb-2">
              Email <span className="text-slate-500">(optional)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@example.com"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold text-sm mb-2">
              City <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
              isValid
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-lg hover:-translate-y-0.5 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Become an Ambassador
          </button>
        </form>
      </div>
    </div>
  );
}
