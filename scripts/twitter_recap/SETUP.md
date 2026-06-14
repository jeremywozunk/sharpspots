# SharpSpots Twitter Recap — Setup

Automated daily email of the @sharpspots results thread (master post + per-pick
breakdowns with honest post-mortems). Generation is fully automated via GitHub
Actions; you copy/paste the posts into X each morning.

## What runs

- `recap_generator.py` — fetches yesterday's graded 2★+ picks from Contentful,
  builds the thread, writes the post-mortems.
- `send_recap_email.py` — emails the thread to you via Gmail SMTP.
- `.github/workflows/twitter-recap.yml` — runs it daily at 10:00 UTC
  (= 6:00 AM EDT in summer / 5:00 AM EST in winter).

Runs on Python standard library only — no dependencies.

---

## One-time setup (≈15 min)

### 1. Generate a Gmail App Password
A normal Gmail password won't work for SMTP; you need an "App Password."

1. Go to your Google Account → **Security**.
2. Make sure **2-Step Verification** is ON (App Passwords require it).
3. Search "App passwords" (or visit myaccount.google.com/apppasswords).
4. Create one named "SharpSpots Recap". Google gives you a **16-character code**.
5. Copy it (no spaces).

### 2. Add GitHub repository secrets
In the repo on GitHub: **Settings → Secrets and variables → Actions → New repository secret.**
Add each of these:

| Secret name | Value |
|---|---|
| `CONTENTFUL_SPACE_ID` | (same value as in your `.env.local`) |
| `CONTENTFUL_ACCESS_TOKEN` | (same value as in your `.env.local`) |
| `GMAIL_USER` | `jeremywozunk@gmail.com` |
| `GMAIL_APP_PASSWORD` | the 16-char app password from step 1 |
| `RECAP_TO` | `jeremywozunk@gmail.com` (or wherever you want it sent) |

### 3. Test it
Go to the repo's **Actions** tab → **SharpSpots Twitter Recap** → **Run workflow**.
This runs it on demand (doesn't wait for 6 AM). Check the run log and your inbox.

---

## Daily flow (≈2 min)
1. Open the recap email.
2. Post the **Master post** to @sharpspots.
3. Post each **Reply** as a reply to the master (or build the whole thread at
   once in X's composer using the "+" to add posts), staggered through the day.

## Adjusting things
- **Time:** edit the `cron` line in `.github/workflows/twitter-recap.yml`.
  GitHub uses UTC. (10:00 UTC = 6 AM EDT.)
- **A specific date (re-run):** set a `RECAP_DATE` secret like `2026-06-12`,
  or run `RECAP_DATE=2026-06-12 python3 send_recap_email.py` locally.
- **Voice/format:** edit `recap_generator.py` — the `postmortem()` function and
  the master-post intro lines.
