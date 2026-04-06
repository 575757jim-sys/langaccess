import { ArrowLeft, Award, CheckCircle, BookOpen, Star, Lock } from 'lucide-react';
import { CERT_TRACKS, CERT_PRICE } from '../data/certificateData';
import SEO from './SEO';

interface Props {
  onBack: () => void;
  onStartCertificate: () => void;
}

export default function CertificateEnrollEducation({ onBack, onStartCertificate }: Props) {
  const educationTrack = CERT_TRACKS.find(track => track.id === 'education');

  if (!educationTrack) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <SEO
        title="Education Certificate Enrollment - LangAccess"
        description="Enroll in the LangAccess Education Spanish Certificate Program. Master student discipline, parent outreach, teacher support, and special needs communication."
        canonicalPath="/certificate/enroll/education"
      />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-slate-900">Education Certificate</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{educationTrack.title}</h1>
              <p className="text-blue-100 text-lg leading-relaxed">
                {educationTrack.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">5 Modules</div>
              <div className="text-blue-100 text-sm">Comprehensive curriculum</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">Quiz-Based</div>
              <div className="text-blue-100 text-sm">80% to pass each module</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold mb-1">${CERT_PRICE}</div>
              <div className="text-blue-100 text-sm">Full track access</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-blue-600" />
            What You'll Learn
          </h2>

          <div className="space-y-4">
            {educationTrack.modules.map((module, idx) => (
              <div
                key={module.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {idx === 0 ? (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{module.title}</h3>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm">{module.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Try the First Module Free</h3>
              <p className="text-slate-700 mb-4">
                Start with Module 1: Student Discipline Communication at no cost. Experience the full quiz format and see if this certificate track is right for you.
              </p>
              <button
                onClick={onStartCertificate}
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] shadow-lg"
              >
                Start Module 1 Free
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Try Module 1 Free</h4>
                <p className="text-slate-600 text-sm">Complete the first module quiz to get started.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Unlock Full Access</h4>
                <p className="text-slate-600 text-sm">Pay ${CERT_PRICE} to access modules 2-5 and complete your certification.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Earn Your Certificate</h4>
                <p className="text-slate-600 text-sm">Pass all 5 modules with 80% or higher to receive your professional certificate.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
