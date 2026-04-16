import { ArrowLeft, LogOut, CircleUser as UserCircle2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccountPage() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
            <UserCircle2 className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Your Account</h1>
        </div>

        <div className="bg-[#111827] rounded-2xl border border-white/10 p-5 mb-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm mb-0.5">Signed in</p>
              <p className="text-slate-400 text-sm break-all">{user?.email}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-colors flex items-center justify-center gap-2 mb-6"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        <button
          onClick={() => { window.location.href = '/'; }}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
