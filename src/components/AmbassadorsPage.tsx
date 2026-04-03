import { useState, useEffect } from 'react';
import { ArrowLeft, Star, CheckCircle, MapPin, Users, Award, Package } from 'lucide-react';
import SEO from './SEO';
import AmbassadorDashboard from './AmbassadorDashboard';
import AmbassadorSignup from './AmbassadorSignup';
import AmbassadorSuccess from './AmbassadorSuccess';

interface Props {
  onBack: () => void;
  onOrderCards?: () => void;
}

type ViewMode = 'overview' | 'signup' | 'success' | 'dashboard' | 'get-cards';

interface AmbassadorData {
  name: string;
  email: string;
  city: string;
  code: string;
}

function generateAmbassadorCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function AmbassadorsPage({ onBack, onOrderCards }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [ambassadorData, setAmbassadorData] = useState<AmbassadorData | null>(null);

  console.log('AmbassadorsPage render - viewMode:', viewMode);

  useEffect(() => {
    const stored = localStorage.getItem('ambassador_data');
    if (stored) {
      try {
        setAmbassadorData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse ambassador data:', e);
      }
    }
  }, []);

  const handleSignupComplete = (data: { name: string; email: string; city: string }) => {
    const code = generateAmbassadorCode();
    const ambassadorInfo: AmbassadorData = {
      ...data,
      code,
    };
    setAmbassadorData(ambassadorInfo);
    localStorage.setItem('ambassador_data', JSON.stringify(ambassadorInfo));
    setViewMode('success');
  };

  const handleDashboardAccess = () => {
    if (!ambassadorData) {
      setViewMode('signup');
    } else {
      setViewMode('dashboard');
    }
  };

  const handleGetCardsClick = () => {
    if (!ambassadorData) {
      setViewMode('signup');
    } else {
      setViewMode('get-cards');
    }
  };

  if (viewMode === 'signup') {
    return (
      <AmbassadorSignup
        onClose={() => setViewMode('overview')}
        onComplete={handleSignupComplete}
      />
    );
  }

  if (viewMode === 'success' && ambassadorData) {
    return (
      <AmbassadorSuccess
        name={ambassadorData.name}
        ambassadorCode={ambassadorData.code}
        onGoToDashboard={() => setViewMode('dashboard')}
        onGetCards={() => setViewMode('get-cards')}
      />
    );
  }

  if (viewMode === 'dashboard') {
    return <AmbassadorDashboard onBack={() => setViewMode('overview')} />;
  }

  if (viewMode === 'get-cards' && ambassadorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <SEO
          title="Get Cards — Ambassador Program"
          description="Download your Ambassador QR code or order physical cards."
          path="/ambassadors"
        />

        <header className="sticky top-0 bg-slate-900/90 backdrop-blur-sm border-b border-white/10 z-30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <button
              onClick={() => setViewMode('overview')}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-base">Get Cards</span>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Your Ambassador Materials</h1>
            <p className="text-slate-400">Download your QR code or order physical cards</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6">
            <div className="text-center space-y-3">
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">Your Ambassador Code</p>
              <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-xl px-6 py-4 inline-block">
                <p className="text-3xl font-mono font-bold text-cyan-400 tracking-wider">{ambassadorData.code}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-48 h-48 bg-slate-200 rounded-lg flex items-center justify-center mx-auto">
                  <svg className="w-36 h-36" viewBox="0 0 100 100">
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
                <p className="text-slate-600 text-sm font-semibold">Your Ambassador QR Code</p>
              </div>
            </div>

            <button
              onClick={() => alert('QR code download feature coming soon!')}
              className="w-full inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-4 rounded-xl transition-all"
            >
              <Package className="w-5 h-5" />
              Download QR Code
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold">Order Physical Cards</h3>
            <p className="text-slate-400 text-sm">
              Get professionally printed cards with your QR code to distribute in your community.
            </p>
            <button
              onClick={onOrderCards || (() => alert('Card ordering feature coming soon!'))}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Package className="w-5 h-5" />
              Order Physical Cards
            </button>
          </div>

          <button
            onClick={() => setViewMode('dashboard')}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Go to Dashboard
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <SEO
        title="Ambassador Program — LangAccess"
        description="Join the LangAccess Ambassador Brigade. Distribute cards, verify resources, and improve language access in your community."
        path="/ambassadors"
      />

      <header className="sticky top-0 bg-slate-900/90 backdrop-blur-sm border-b border-white/10 z-30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-base">Ambassador Program</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-32 md:pb-24">

        {/* Hero Section */}
        <div className="text-center space-y-6 py-4 md:py-8">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Become a LangAccess
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
              Ambassador
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Find nearby help fast—while bridging language barriers in your community.
          </p>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => {
                console.log('Join the Brigade clicked');
                setViewMode('signup');
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-900 font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg"
            >
              <Star className="w-5 h-5" />
              Join the Brigade
            </button>
            <p className="text-slate-400 text-sm">
              No experience needed • 2 minutes to join • Make an immediate impact
            </p>
          </div>
        </div>

        {/* What You'll Do - 3 Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-bold text-lg">Verify Local Resources</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Make sure food, shelter, and services are accurate and open
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-bold text-lg">Help People Find Help Fast</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Use LangAccess to guide others to nearby support
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-lg">Distribute Access Cards</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Share QR cards that connect people instantly to resources
            </p>
          </div>
        </div>

        {/* Why This Matters */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Why This Matters</h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            People in crisis often can't find help because of language barriers or outdated information. You make access faster, clearer, and real.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">How It Works</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Join</h3>
                <p className="text-slate-400 text-sm">Takes less than 2 minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Use the Navigator</h3>
                <p className="text-slate-400 text-sm">Find and verify resources</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Make an Impact</h3>
                <p className="text-slate-400 text-sm">Help people access support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl p-8 md:p-10 text-center space-y-6 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ready to make a real impact?</h2>
          <button
            onClick={() => {
              console.log('Final CTA clicked');
              setViewMode('signup');
            }}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg"
          >
            <Star className="w-5 h-5" />
            Join the Brigade
          </button>
        </div>

      </main>
    </div>
  );
}
