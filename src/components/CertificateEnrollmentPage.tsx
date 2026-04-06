import { ArrowLeft, Award, CheckCircle, Shield, Linkedin } from 'lucide-react';
import SEO from './SEO';

interface Props {
  onBack: () => void;
  onContinue: () => void;
}

export default function CertificateEnrollmentPage({ onBack, onContinue }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <SEO
        title="Enroll in Education Certificate - LangAccess"
        description="Get your professional Education Spanish Certificate. Demonstrate your workplace communication readiness."
        canonicalPath="/certificate/enroll/education"
      />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-slate-900">Get Certified</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Certificate Preview */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium opacity-90">LangAccess</div>
                    <div className="text-white text-xs opacity-75">Professional Certificate</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-400 px-3 py-1.5 rounded-full">
                  <Shield className="w-4 h-4 text-amber-900" />
                  <span className="text-amber-900 text-xs font-bold">Verified</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-8">
              <div className="text-center mb-6">
                <div className="text-slate-500 text-sm font-medium mb-2">This certifies that</div>
                <div className="text-3xl font-bold text-slate-900 mb-1">Maria Sanchez</div>
                <div className="text-slate-600 text-sm">has successfully completed</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    Education Spanish Certificate
                  </div>
                  <div className="text-blue-700 text-sm font-medium">
                    Professional Communication Track
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-8 text-center text-sm">
                <div>
                  <div className="font-bold text-slate-900">5 Modules</div>
                  <div className="text-slate-500 text-xs">Completed</div>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div>
                  <div className="font-bold text-slate-900">80%+</div>
                  <div className="text-slate-500 text-xs">Pass Rate</div>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div>
                  <div className="font-bold text-slate-900">2024</div>
                  <div className="text-slate-500 text-xs">Year Issued</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3">
              <div className="flex items-center justify-between text-xs">
                <div className="text-slate-500">Certificate ID: LA-EDU-2024-001234</div>
                <div className="text-slate-500">langaccess.org/verify</div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Get Certified */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Why Get Certified?</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-0.5">Save your progress</div>
                <div className="text-slate-600 text-sm">
                  Track your learning journey and pick up where you left off across devices.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-0.5">Demonstrate professional readiness</div>
                <div className="text-slate-600 text-sm">
                  Show employers and colleagues your commitment to inclusive communication.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-0.5">Support workplace communication</div>
                <div className="text-slate-600 text-sm">
                  Build confidence in everyday Spanish conversations with students and parents.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={onContinue}
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] shadow-lg flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </button>

          <button
            onClick={onContinue}
            className="w-full bg-white text-slate-700 px-6 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all duration-150 active:scale-[0.98] shadow-lg border-2 border-slate-200 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Demo Notice */}
        <div className="text-center">
          <p className="text-slate-500 text-sm">
            Demo only — no login required
          </p>
        </div>
      </main>
    </div>
  );
}
