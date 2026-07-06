# Waitlist setup — make the signup forms actually capture emails

The forms in `waitlist.html` (Achievo) and `waitlistq.html` (Quantum Button) are now
built to POST signups to a real endpoint. **They no longer fake success.** Until you
paste an endpoint they honestly tell people to email you instead — nobody is silently
dropped.

You just need one URL. Pick ONE option below, then paste the URL into both files at:

```js
var WAITLIST_ENDPOINT = "";   // <-- paste between the quotes (top of the <script> block)
```

`waitlist.html` and `waitlistq.html` each have their own copy of that line. Update both.

---

## Option A — Formspree  (recommended, ~3 minutes, no code)

Cleanest option: it reliably confirms each save, so the "You're on the list" message
only shows when the email genuinely landed.

1. Go to **https://formspree.io** → sign up (free) with `spencerthegathering@gmail.com`.
2. **New Form** → name it "Quantum Button waitlist" → it gives you a URL like
   `https://formspree.io/f/abcdwxyz`.
3. Paste that URL into `WAITLIST_ENDPOINT` in **waitlistq.html**.
4. Make a second form "Achievo waitlist" → paste its URL into **waitlist.html**.
5. Submit a test signup on each. Check it arrives in your Formspree dashboard + inbox.

**Cost/limits:** free tier = 50 submissions/month per account. Fine for validating a
waitlist. **Before any real launch push, upgrade** (~$10/mo = 1,000/mo) or switch to
Option B — otherwise submissions past the cap get rejected (the user sees an honest
error, but you still lose the signup).

---

## Option B — Google Sheet via Apps Script  (free, unlimited, you own the data)

More setup (~10 min) but free forever, unlimited, and every signup lands in a Google
Sheet you control. Tell me if you pick this — the browser↔Apps Script connection has a
CORS quirk, so I'll hand you the exact `.gs` script + a tweaked fetch that keeps the
honest success/error behaviour. Don't wire this one up blind.

---

## Option C — Netlify Forms  (only if you host on Netlify)

If you move hosting to Netlify, its built-in Forms need no external service (free 100/mo).
This changes the form markup slightly (a `data-netlify` attribute). Tell me if you go
Netlify and I'll convert both forms.

---

## After it works
- Set up a simple auto-reply / welcome email (Formspree can do this) so signups get a
  "you're in" confirmation — closes the loop and builds trust.
- Keep the `source` field (already sent) — it tells you which page each signup came from,
  so you can see what's converting.
