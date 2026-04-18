import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type CampaignKey = "first_win" | "day3_nudge";

type RowSummary = {
  campaign: CampaignKey;
  total: number;
  sent: number;
  pending: number;
  skipped: number;
  opened: number;
  bounced: number;
  open_rate: number;
};

type Recent = {
  id: string;
  campaign: CampaignKey;
  email: string;
  track_id: string;
  track_title: string;
  scheduled_at: string;
  sent_at: string | null;
  skipped_at: string | null;
  opened_at: string | null;
  bounced_at: string | null;
};

type Upcoming = {
  id: string;
  campaign: CampaignKey;
  email: string;
  track_title: string;
  track_id: string;
  scheduled_at: string;
};

type Suppression = {
  email: string;
  reason: string;
  bounce_type: string | null;
  created_at: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const ADMIN_TOKEN = Deno.env.get("ADMIN_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!ADMIN_TOKEN) {
      return new Response(JSON.stringify({ error: "ADMIN_TOKEN not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = req.headers.get("Authorization") || "";
    const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    let bodyToken = "";
    if (req.method === "POST") {
      try {
        const body = await req.json();
        bodyToken = (body?.token as string) || "";
      } catch {
        /* ignore */
      }
    }

    if (provided !== ADMIN_TOKEN && bodyToken !== ADMIN_TOKEN) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    async function summarize(
      table: string,
      campaign: CampaignKey,
      hasSkipped: boolean,
    ): Promise<RowSummary> {
      const [totalRes, sentRes, openedRes, skippedRes, bouncedRes] = await Promise.all([
        supabase.from(table).select("id", { count: "exact", head: true }),
        supabase
          .from(table)
          .select("id", { count: "exact", head: true })
          .not("sent_at", "is", null),
        supabase
          .from(table)
          .select("id", { count: "exact", head: true })
          .not("opened_at", "is", null),
        hasSkipped
          ? supabase
              .from(table)
              .select("id", { count: "exact", head: true })
              .not("skipped_at", "is", null)
          : Promise.resolve({ count: 0 }),
        supabase
          .from(table)
          .select("id", { count: "exact", head: true })
          .not("bounced_at", "is", null),
      ]);

      const total = totalRes.count || 0;
      const sent = sentRes.count || 0;
      const opened = openedRes.count || 0;
      const skipped = (skippedRes as { count: number | null }).count || 0;
      const bounced = bouncedRes.count || 0;
      const pending = Math.max(0, total - sent - skipped - bounced);
      const open_rate = sent > 0 ? Math.round((opened / sent) * 1000) / 10 : 0;

      return { campaign, total, sent, pending, skipped, opened, bounced, open_rate };
    }

    const [firstWinStats, day3Stats] = await Promise.all([
      summarize("certificate_first_wins", "first_win", false),
      summarize("certificate_day3_nudges", "day3_nudge", true),
    ]);

    const { data: fwRecent } = await supabase
      .from("certificate_first_wins")
      .select("id, email, track_id, track_title, scheduled_at, sent_at, opened_at, bounced_at")
      .order("created_at", { ascending: false })
      .limit(25);

    const { data: d3Recent } = await supabase
      .from("certificate_day3_nudges")
      .select(
        "id, email, track_id, track_title, scheduled_at, sent_at, skipped_at, opened_at, bounced_at",
      )
      .order("created_at", { ascending: false })
      .limit(25);

    const recent: Recent[] = [
      ...(fwRecent || []).map((r) => ({
        id: r.id,
        campaign: "first_win" as CampaignKey,
        email: r.email,
        track_id: r.track_id,
        track_title: r.track_title,
        scheduled_at: r.scheduled_at,
        sent_at: r.sent_at,
        skipped_at: null,
        opened_at: r.opened_at,
        bounced_at: r.bounced_at,
      })),
      ...(d3Recent || []).map((r) => ({
        id: r.id,
        campaign: "day3_nudge" as CampaignKey,
        email: r.email,
        track_id: r.track_id,
        track_title: r.track_title,
        scheduled_at: r.scheduled_at,
        sent_at: r.sent_at,
        skipped_at: r.skipped_at,
        opened_at: r.opened_at,
        bounced_at: r.bounced_at,
      })),
    ].sort((a, b) => (a.scheduled_at < b.scheduled_at ? 1 : -1));

    const now = new Date();
    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    const nowIso = now.toISOString();
    const tomorrowEndIso = tomorrowEnd.toISOString();

    const [{ data: fwUpcoming }, { data: d3Upcoming }] = await Promise.all([
      supabase
        .from("certificate_first_wins")
        .select("id, email, track_id, track_title, scheduled_at")
        .is("sent_at", null)
        .is("bounced_at", null)
        .gte("scheduled_at", nowIso)
        .lte("scheduled_at", tomorrowEndIso)
        .order("scheduled_at", { ascending: true })
        .limit(50),
      supabase
        .from("certificate_day3_nudges")
        .select("id, email, track_id, track_title, scheduled_at")
        .is("sent_at", null)
        .is("skipped_at", null)
        .is("bounced_at", null)
        .gte("scheduled_at", nowIso)
        .lte("scheduled_at", tomorrowEndIso)
        .order("scheduled_at", { ascending: true })
        .limit(50),
    ]);

    const upcoming: Upcoming[] = [
      ...(fwUpcoming || []).map((r) => ({
        id: r.id,
        campaign: "first_win" as CampaignKey,
        email: r.email,
        track_title: r.track_title,
        track_id: r.track_id,
        scheduled_at: r.scheduled_at,
      })),
      ...(d3Upcoming || []).map((r) => ({
        id: r.id,
        campaign: "day3_nudge" as CampaignKey,
        email: r.email,
        track_title: r.track_title,
        track_id: r.track_id,
        scheduled_at: r.scheduled_at,
      })),
    ].sort((a, b) => (a.scheduled_at > b.scheduled_at ? 1 : -1));

    const { data: suppressionRows, count: suppressionCount } = await supabase
      .from("email_suppressions")
      .select("email, reason, bounce_type, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(25);

    const suppressions: Suppression[] = (suppressionRows || []).map((s) => ({
      email: s.email,
      reason: s.reason,
      bounce_type: s.bounce_type,
      created_at: s.created_at,
    }));

    return new Response(
      JSON.stringify({
        summary: [firstWinStats, day3Stats],
        recent,
        upcoming,
        upcoming_window_hours: 24,
        suppressions,
        suppressions_total: suppressionCount || 0,
        generated_at: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
