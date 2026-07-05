// POST /api/notify
// Captures a "notify me / waitlist" signup and emails it to the studio via Resend.
//
// Required Cloudflare Pages env var (Settings -> Environment variables):
//   RESEND_API_KEY   – your Resend API key (secret)
// Optional:
//   NOTIFY_TO        – comma-separated recipients (default: spencerthegathering@gmail.com)
//   NOTIFY_FROM      – verified sender (default: Spencer The Gathering <notify@spencer-the-gathering.com>)

export async function onRequestPost({ request, env }) {
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { 'content-type': 'application/json' },
    });

  // --- parse body (JSON or form-encoded) ---
  let data;
  const ct = request.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      data = await request.json();
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form.entries());
    }
  } catch {
    return json({ ok: false, error: 'Bad request.' }, 400);
  }

  // --- honeypot: real users never fill this; bots do. Accept silently, send nothing. ---
  if (data.company) return json({ ok: true });

  const email = String(data.email || '').trim();
  const name = String(data.name || '').trim();
  const message = String(data.message || '').trim();
  const source = String(data.source || 'website').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 422);
  }

  // --- misconfig guard: loud in logs, soft to the visitor ---
  if (!env.RESEND_API_KEY) {
    console.error('[notify] RESEND_API_KEY is not set — cannot send.');
    return json(
      { ok: false, error: 'Signups are temporarily unavailable — please email us directly.' },
      503
    );
  }

  const to = (env.NOTIFY_TO || 'spencerthegathering@gmail.com')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const from = env.NOTIFY_FROM || 'Spencer The Gathering <notify@spencer-the-gathering.com>';

  const labels = {
    bppcp: 'Best Price PC Parts',
    quantum: 'Quantum Button waitlist',
    achievo: 'Achievo waitlist',
  };
  const sourceLabel = labels[source] || source;
  const received = new Date().toISOString();

  const text = [
    `New signup for: ${sourceLabel}`,
    '',
    `Email: ${email}`,
    name ? `Name: ${name}` : null,
    message ? `Message: ${message}` : null,
    '',
    `Source: ${source}`,
    `Received: ${received}`,
  ].filter((l) => l !== null).join('\n');

  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#111">
    <h2 style="margin:0 0 10px;font-size:18px">New signup — ${esc(sourceLabel)}</h2>
    <p style="margin:0 0 4px"><strong>Email:</strong> ${esc(email)}</p>
    ${name ? `<p style="margin:0 0 4px"><strong>Name:</strong> ${esc(name)}</p>` : ''}
    ${message ? `<p style="margin:0 0 4px"><strong>Message:</strong> ${esc(message)}</p>` : ''}
    <p style="margin:12px 0 0;color:#888;font-size:13px">Source: ${esc(source)} &middot; ${esc(received)}</p>
  </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject: `New signup — ${sourceLabel}`, text, html, reply_to: email }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[notify] Resend error', res.status, body);
    return json({ ok: false, error: 'Something went wrong sending your signup. Please try again.' }, 502);
  }

  return json({ ok: true });
}

// POST is handled by onRequestPost above; every other method lands here.
export async function onRequest() {
  return new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}
