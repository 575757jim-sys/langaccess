import { supabase } from '../lib/supabase';
import { CertProgress, TrackId, CERT_TRACKS, generateCertId } from '../data/certificateData';
import { getSessionId } from './sessionId';

const STORAGE_KEY = 'langaccess_certificates';

export function loadLocalProgress(): CertProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CertProgress;
  } catch { /* ignore */ }
  return {
    userName: '',
    purchased: {} as Record<TrackId, boolean>,
    moduleScores: {},
    completedModules: {},
    certIds: {} as Record<TrackId, string>,
  };
}

export function saveLocalProgress(p: CertProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export async function loadProgressFromSupabase(): Promise<Partial<CertProgress>> {
  const sessionId = getSessionId();
  const result: Partial<CertProgress> = {
    moduleScores: {},
    completedModules: {},
    certIds: {} as Record<TrackId, string>,
    purchased: {} as Record<TrackId, boolean>,
  };

  try {
    const { data: progressRows } = await supabase
      .from('certificate_progress')
      .select('*')
      .eq('session_id', sessionId);

    if (progressRows?.length) {
      result.userName = progressRows[0].user_name || '';
      for (const row of progressRows) {
        const key = `${row.track_id}-${row.module_id}`;
        result.moduleScores![key] = row.score;
        if (row.passed) result.completedModules![key] = true;
      }
    }

    const { data: certRows } = await supabase
      .from('certificate_records')
      .select('track_id, cert_id')
      .eq('session_id', sessionId);

    if (certRows?.length) {
      for (const row of certRows) {
        (result.certIds as Record<string, string>)[row.track_id] = row.cert_id;
        (result.purchased as Record<string, boolean>)[row.track_id] = true;
      }
    }

    const { data: purchaseRows } = await supabase
      .from('certificate_purchases')
      .select('track_id')
      .eq('session_id', sessionId);

    if (purchaseRows?.length) {
      for (const row of purchaseRows) {
        (result.purchased as Record<string, boolean>)[row.track_id] = true;
      }
    }
  } catch { /* fall through to local */ }

  return result;
}

export async function saveModuleResult(
  userName: string,
  trackId: TrackId,
  moduleId: number,
  score: number,
  passed: boolean
): Promise<void> {
  const sessionId = getSessionId();
  try {
    await supabase.from('certificate_progress').upsert({
      session_id: sessionId,
      user_name: userName,
      track_id: trackId,
      module_id: moduleId,
      score,
      passed,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'session_id,track_id,module_id' });
  } catch { /* non-blocking */ }
}

export async function saveCertificateRecord(
  userName: string,
  trackId: TrackId,
  trackTitle: string,
  certId: string,
  email?: string
): Promise<void> {
  const sessionId = getSessionId();
  try {
    await supabase.from('certificate_records').upsert({
      cert_id: certId,
      session_id: sessionId,
      user_name: userName,
      track_id: trackId,
      track_title: trackTitle,
      issued_at: new Date().toISOString(),
      email: email || null,
    }, { onConflict: 'cert_id' });
  } catch { /* non-blocking */ }
}

export async function verifyCertificate(certId: string): Promise<{
  valid: boolean;
  userName?: string;
  trackTitle?: string;
  issuedAt?: string;
} | null> {
  try {
    const { data } = await supabase
      .from('certificate_records')
      .select('user_name, track_title, issued_at')
      .eq('cert_id', certId)
      .maybeSingle();

    if (!data) return { valid: false };
    return {
      valid: true,
      userName: data.user_name,
      trackTitle: data.track_title,
      issuedAt: data.issued_at,
    };
  } catch {
    return null;
  }
}

export async function isTrackPurchasedOnServer(trackId: TrackId): Promise<boolean> {
  const sessionId = getSessionId();
  try {
    const { data } = await supabase
      .from('certificate_purchases')
      .select('id')
      .eq('session_id', sessionId)
      .eq('track_id', trackId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function isTrackComplete(trackId: TrackId, progress: CertProgress): Promise<boolean> {
  const track = CERT_TRACKS.find(t => t.id === trackId);
  if (!track) return false;
  return track.modules.every(m => progress.completedModules[`${trackId}-${m.id}`]);
}

export { generateCertId };
