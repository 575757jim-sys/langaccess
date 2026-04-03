import { Star, Download, Package, ArrowRight } from 'lucide-react';

interface AmbassadorSuccessProps {
  name: string;
  ambassadorCode: string;
  onGoToDashboard: () => void;
  onGetCards: () => void;
}

export default function AmbassadorSuccess({ name, ambassadorCode, onGoToDashboard, onGetCards }: AmbassadorSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mb-4 animate-bounce">
            <Star className="w-10 h-10 text-white" fill="white" />
          </div>
          <h1 className="text-4xl font-bold">
            You're now a LangAccess Ambassador!
          </h1>
          <p className="text-slate-300 text-lg">
            Welcome to the brigade, <span className="text-cyan-400 font-semibold">{name}</span>!
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6">

          <div className="text-center space-y-3">
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">Your Ambassador Code</p>
            <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-xl px-6 py-4 inline-block">
              <p className="text-3xl font-mono font-bold text-cyan-400 tracking-wider">{ambassadorCode}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center mx-auto">
                <svg className="w-24 h-24" viewBox="0 0 100 100">
                  <rect x="10" y="10" width="15" height="15" fill="#000" />
                  <rect x="35" y="10" width="15" height="15" fill="#000" />
                  <rect x="60" y="10" width="15" height="15" fill="#000" />
                  <rect x="10" y="35" width="15" height="15" fill="#000" />
                  <rect x="35" y="35" width="15" height="15" fill="#fff" />
                  <rect x="60" y="35" width="15" height="15" fill="#000" />
                  <rect x="10" y="60" width="15" height="15" fill="#000" />
                  <rect x="35" y="60" width="15" height="15" fill="#000" />
                  <rect x="60" y="60" width="15" height="15" fill="#000" />
                </svg>
              </div>
              <p className="text-slate-600 text-xs font-semibold">Your QR Code</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onGetCards}
              className="flex flex-col items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-semibold px-4 py-4 rounded-xl transition-all"
            >
              <Download className="w-5 h-5" />
              <span className="text-sm">Download QR</span>
            </button>
            <button
              onClick={onGetCards}
              className="flex flex-col items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-semibold px-4 py-4 rounded-xl transition-all"
            >
              <Package className="w-5 h-5" />
              <span className="text-sm">Order Cards</span>
            </button>
          </div>
        </div>

        <button
          onClick={onGoToDashboard}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}
