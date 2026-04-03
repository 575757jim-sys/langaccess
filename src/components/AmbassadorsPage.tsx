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

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">

        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-semibold">Join the Brigade</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Become a LangAccess
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
              Ambassador
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Help bridge language barriers in your community by distributing cards, verifying resources, and improving local accuracy.
          </p>

          <button
            onClick={() => {
              console.log('Join the Brigade clicked');
              setViewMode('signup');
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-900 font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg mt-4"
          >
            <Star className="w-5 h-5" />
            Join the Brigade
          </button>
        </div>

        {/* What Ambassadors Do */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold">What Ambassadors Do</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 space-y-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-lg">Distribute Cards</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Order and distribute QR code cards in your workplace, clinic, school, or job site to help people access multilingual services instantly.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 space-y-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold text-lg">Verify Resources</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visit local community resources and verify they're open, accurate, and accessible. Your updates help everyone find real help.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 space-y-2">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-bold text-lg">Add New Resources</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Know of a food bank, shelter, or clinic that's not on our map? Add it so others in need can find help near them.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 space-y-2">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="font-bold text-lg">Improve Accuracy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Help maintain up-to-date information about hours, services, and languages spoken at community resources.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-2xl p-6 md:p-8 text-center space-y-6 border border-cyan-500/30 shadow-xl">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-2">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">Ambassador Access</span>
          </div>
          <h2 className="text-3xl font-bold">Ready to Make an Impact?</h2>
          <p className="text-cyan-50 text-lg max-w-xl mx-auto">
            {ambassadorData
              ? 'Access your dashboard to start verifying resources, adding new locations, and tracking your contributions.'
              : 'Sign up to access the Ambassador Dashboard and start making a difference in your community.'}
          </p>
          <button
            onClick={handleDashboardAccess}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-cyan-700 font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg"
          >
            <Star className="w-5 h-5" />
            {ambassadorData ? 'Open Ambassador Dashboard' : 'Sign Up & Access Dashboard'}
          </button>
        </div>

        {/* Benefits Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Ambassador Benefits</h2>
          <ul className="space-y-3">
            {[
              'Free access to Ambassador Dashboard with resource verification tools',
              'Track your impact with submission statistics and verification count',
              'Help improve language access for your entire community',
              'Certificate of participation for verified contributions',
              'Direct connection to people who need language support',
            ].map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Get Cards CTA */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center space-y-4">
          <h3 className="text-xl font-bold">Get Your Ambassador Cards</h3>
          <p className="text-slate-400">
            Download your QR code or order physical cards to distribute in your community.
          </p>
          <button
            onClick={handleGetCardsClick}
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Package className="w-5 h-5" />
            {ambassadorData ? 'Get Cards' : 'Sign Up to Get Cards'}
          </button>
        </div>

      </main>
    </div>
  );
}
