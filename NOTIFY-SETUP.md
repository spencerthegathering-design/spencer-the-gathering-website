# "Notify Me" / Waitlist email capture — setup

The site captures signups through a Cloudflare Pages Function at `/api/notify`
(`functions/api/notify.js`). It emails each signup to the studio via **Resend**.
Until the two steps below are done, the form shows a graceful *"signups are
temporarily unavailable — please email us directly"* message.

## One-time setup (~10 min, all on your side)

### 1. Create a Resend account + API key
1. Sign up free at <https://resend.com> (3,000 emails/month free).
2. **Add & verify the domain** `spencer-the-gathering.com`:
   - Resend shows you a few DNS records (SPF / DKIM / a return-path CNAME).
   - Add them in Cloudflare → DNS for `spencer-the-gathering.com`.
   - Back in Resend, click **Verify**. (Usually verifies within minutes.)
3. Create an **API key** (Resend → API Keys → Create). Copy it.

### 2. Add the key to Cloudflare Pages
1. Cloudflare dashboard → **Workers & Pages** → `spencer-the-gathering-website`
   → **Settings** → **Variables and Secrets** (Production).
2. Add:
   - `RESEND_API_KEY` = *the key from step 1* (mark it as a **Secret**)
3. Optional overrides:
   - `NOTIFY_TO` = `spencerthegathering@gmail.com` *(default; comma-separate for
     several recipients, e.g. add `sales@computeralliance.com.au`)*
   - `NOTIFY_FROM` = `Spencer The Gathering <notify@spencer-the-gathering.com>`
     *(default; the address must be on the verified domain)*
4. **Redeploy** (Deployments → ⋯ → Retry, or push any commit) so the Function
   picks up the variables.

That's it. Submissions then arrive in the inbox with the source
(`Best Price PC Parts`, `Quantum Button waitlist`, etc.), the visitor's email
set as reply-to, and a timestamp.

## Notes
- **Spam:** the form has a hidden honeypot field; bot submissions are dropped
  silently.
- **No visitor mail client needed** — this is a real server-side send, unlike a
  `mailto:` link.
- **Wiring more forms:** any `<form class="notify-form" data-source="...">` on the
  site posts to the same endpoint. The two game waitlist pages can be migrated to
  this the same way (currently they still use the older `mailto` form).
- **Swap in the live URL:** once Best Price PC Parts is deployed, point the
  announcement bar / card at its real domain instead of the `#bppcp` anchor.
