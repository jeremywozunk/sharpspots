#!/usr/bin/env python3
"""
SharpSpots Twitter Recap Generator
-----------------------------------
Reads yesterday's GRADED 2-star+ picks from Contentful and produces ready-to-post
tweets for @sharpspots:
  1) A daily recap post (the card + day's W-L + units)
  2) Per-pick breakdown posts (one per notable pick) to stagger through the day

Voice: hybrid -- clean/consistent stat lines, light human connective tissue,
buttoned-up for the brand account (no hashtags, lowercase-leaning, no hype).

Mirrors the website's track-record logic:
  - only confidenceScore >= 2 counts (1-star = informational, excluded)
  - uses stored unitsWonLost; falls back to star-stake @ -110 if missing
  - Voids excluded from record

Usage:
  python3 recap_generator.py              # yesterday (ET)
  python3 recap_generator.py 2026-06-12   # a specific date
"""
import urllib.request, json, sys, os
from datetime import datetime, timedelta, timezone

# ---- config ----
ENV_PATH = os.path.join(os.path.dirname(__file__), "..", "..",
                        "Sharpspots-Code", "sharpspots-website", ".env.local")
# When run from the website dir, fall back to local .env.local
ENV_FALLBACKS = [ENV_PATH, ".env.local",
                 "/sessions/cool-festive-mccarthy/mnt/Sharpspots-Code/sharpspots-website/.env.local"]
SITE_URL = "https://sharpspots.com"
UNITS_BY_STAR = {5: 3, 4: 2, 3: 1, 2: 0.5, 1: 0}

def load_env():
    """Prefer environment variables (GitHub Actions secrets). Fall back to a local
    .env.local for development runs."""
    import os
    if os.environ.get("CONTENTFUL_SPACE_ID") and os.environ.get("CONTENTFUL_ACCESS_TOKEN"):
        return {"CONTENTFUL_SPACE_ID": os.environ["CONTENTFUL_SPACE_ID"].strip(),
                "CONTENTFUL_ACCESS_TOKEN": os.environ["CONTENTFUL_ACCESS_TOKEN"].strip()}
    for p in ENV_FALLBACKS:
        if os.path.exists(p):
            env = {}
            for line in open(p, encoding="utf-8-sig"):
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip()
            if "CONTENTFUL_SPACE_ID" in env:
                return env
    raise SystemExit("No Contentful creds in env or .env.local")

def et_yesterday():
    # ET is UTC-4 (EDT) in June. Good enough for date bucketing.
    now_et = datetime.now(timezone.utc) - timedelta(hours=4)
    return (now_et - timedelta(days=1)).strftime("%Y-%m-%d")

def fetch_day(env, day):
    sid = env["CONTENTFUL_SPACE_ID"]; tok = env["CONTENTFUL_ACCESS_TOKEN"]
    url = (f"https://cdn.contentful.com/spaces/{sid}/environments/master/entries"
           f"?content_type=gamePick&fields.gameDate={day}"
           f"&fields.result%5Bexists%5D=true&access_token={tok}&limit=100")
    with urllib.request.urlopen(url, timeout=30) as r:
        d = json.loads(r.read().decode())
    if d.get("sys", {}).get("type") == "Error":
        raise SystemExit("Contentful error: " + d.get("message", "?"))
    return [it["fields"] for it in d.get("items", [])]

def norm(r):
    s = str(r or "").lower()
    return {"w":"W","win":"W","l":"L","loss":"L","push":"Push","void":"Void"}.get(s)

def units_for(f, r):
    if isinstance(f.get("unitsWonLost"), (int, float)):
        return float(f["unitsWonLost"])
    stake = UNITS_BY_STAR.get(f.get("confidenceScore", 0), 0)
    if r == "W": return stake * (100/110)
    if r == "L": return -stake
    return 0.0

def clean_play(f):
    """'St. Louis Cardinals F5 ML (-110)' -> tidy, drop the embedded fair-odds paren."""
    p = (f.get("playToLine") or f.get("recommendedPlay") or "").strip()
    # strip a trailing "(-110)"-style fair-odds note if present; keep market odds separate
    import re
    p = re.sub(r"\s*\([-+]\d+\)\s*$", "", p)
    return p

def fmt_date_long(day):
    dt = datetime.strptime(day, "%Y-%m-%d")
    return dt.strftime("%b %-d") if os.name != "nt" else dt.strftime("%b %d").lstrip("0")

def emoji_for(r):
    return {"W":"✅","L":"❌","Push":"➰"}.get(r,"")


# ---- signal name -> plain English (for post-mortems) ----
SIGNAL_LABELS = {
    "starter_siera_differential": "the starting-pitching edge (SIERA)",
    "last_3_starts_form": "the starter's recent form",
    "last_15_form_divergence": "recent team form",
    "lineup_woba_vs_handedness": "the lineup's platoon matchup (wOBA vs. handedness)",
    "market_signal_public_fade": "a public-fade market signal",
    "pinnacle_divergence_ml": "sharp-money divergence (Pinnacle)",
    "line_movement": "the line movement",
    "bullpen_edge": "the bullpen edge",
}

def fired_signals(cb):
    if not isinstance(cb, dict): return []
    out=[]
    for c in cb.get("contributions", []):
        if c.get("fired"):
            out.append({"name": c.get("name"), "pillar": c.get("pillar"),
                        "favors": c.get("favors"), "p": c.get("p", 0)})
    return out

def parse_score(gradeNote):
    """'ML away, scored 9-6' -> (9,6) as (our_side_runs?, other). We only know the two numbers + side."""
    import re
    m = re.search(r"scored\s+(\d+)\s*-\s*(\d+)", str(gradeNote or ""))
    if not m: return None
    a, b = int(m.group(1)), int(m.group(2))
    side = "away" if "away" in str(gradeNote).lower() else ("home" if "home" in str(gradeNote).lower() else None)
    return a, b, side

def margin_kind(gradeNote, result):
    """Classify a result as 'close' (1-run / variance) or 'decisive' (blowout / real miss)."""
    sc = parse_score(gradeNote)
    if not sc: return None
    a, b, _ = sc
    diff = abs(a - b)
    if diff <= 1: return "close"
    if diff >= 4: return "decisive"
    return "mid"

def postmortem(f):
    """1-2 honest sentences: what the analysis read, and whether the result validated it.
    Only references signals that actually fired. Distinguishes variance from a real miss."""
    r = norm(f.get("result"))
    sigs = fired_signals(f.get("confidenceBreakdown", {}))
    # lead signal = highest p among fired
    lead = max(sigs, key=lambda x: x.get("p", 0)) if sigs else None
    lead_lbl = SIGNAL_LABELS.get(lead["name"], lead["name"].replace("_", " ")) if lead else "the model read"
    mk = margin_kind(f.get("gradeNote"), r)
    sc = parse_score(f.get("gradeNote"))
    score_str = f"{sc[0]}-{sc[1]}" if sc else ""

    if r == "W":
        base = f"the play leaned on {lead_lbl}, and it held up"
        if mk == "close":
            return base + f" — needed every bit of it in a one-run {score_str} win."
        if mk == "decisive":
            return base + f" — and it wasn't close, {score_str}."
        return base + f" ({score_str})."
    elif r == "L":
        if mk == "close":
            return (f"the read on {lead_lbl} was fine — this was a one-run {score_str} flip, "
                    f"the variance side of a thin edge.")
        if mk == "decisive":
            return (f"backed {lead_lbl} here and it didn't show up — {score_str}, "
                    f"not the kind of game you can explain away.")
        return f"{lead_lbl} didn't carry it — {score_str}."
    return ""

def build(day, picks):
    """Returns (master_post, [reply_post, ...]), (w,l,p,units).
    Master = the card. Replies = one per 2*+ pick, in thread order (post under master)."""
    graded = [f for f in picks if (f.get("confidenceScore") or 0) >= 2 and norm(f.get("result"))]
    # thread order: strongest plays first (matches how a reader scans the card)
    graded.sort(key=lambda f: -(f.get("confidenceScore") or 0))
    w = sum(1 for f in graded if norm(f["result"]) == "W")
    l = sum(1 for f in graded if norm(f["result"]) == "L")
    p = sum(1 for f in graded if norm(f["result"]) == "Push")
    units = sum(units_for(f, norm(f["result"])) for f in graded)
    date_lbl = fmt_date_long(day)

    # ---------- MASTER POST ----------
    if not graded:
        master = (f"{date_lbl} — no qualifying plays on the board.\n\n"
                  f"full record: {SITE_URL}/track-record")
        return master, [], (w, l, p, units)

    lines = []
    for f in graded:
        r = norm(f["result"]); stars = "★" * (f.get("confidenceScore") or 0)
        odds = f.get("marketOdds") or ""
        lines.append(f"{emoji_for(r)} {clean_play(f)} {odds}  {stars}")

    rec = f"{w}-{l}" + (f"-{p}" if p else "")
    unit_str = f"{units:+.2f}u"
    if units > 0:
        head = f"last night — green. {rec}, {unit_str}."
    elif units < 0:
        head = f"last night — {rec}, {unit_str}. on to the next."
    else:
        head = f"last night — flat. {rec}, {unit_str}."

    master = (head + "\n\n" + "\n".join(lines)
              + f"\n\nbreakdowns in replies ⤵️")

    # ---------- REPLIES: one per 2*+ pick (thread) ----------
    replies = []
    for i, f in enumerate(graded, 1):
        r = norm(f["result"]); u = units_for(f, r); stars = "★" * (f.get("confidenceScore") or 0)
        gn = (f.get("gradeNote") or "").strip()
        ev = f.get("evPercentage")
        play = clean_play(f); odds = f.get("marketOdds") or ""
        body = f"{emoji_for(r)} {play} {odds}  {stars}"
        pm = postmortem(f)
        if pm:
            body += f"\n\n{pm}"
        tail = []
        if ev is not None and str(ev).strip() != "":
            evs = str(ev).strip().rstrip("%")
            sign = "" if evs.startswith(("+", "-")) else "+"
            tail.append(f"{sign}{evs}% EV")
        tail.append(f"{u:+.2f}u")
        body += "\n\n" + " · ".join(tail)
        replies.append((f"reply-{i}", body))

    return master, replies, (w, l, p, units)

def main():
    env = load_env()
    day = sys.argv[1] if len(sys.argv) > 1 else et_yesterday()
    picks = fetch_day(env, day)
    master, replies, (w, l, p, units) = build(day, picks)
    rec = f"{w}-{l}" + (f"-{p}" if p else "")
    print(f"### SharpSpots thread for {day}  ({rec}, {units:+.2f}u)")
    print(f"### 1 master post + {len(replies)} repl(y/ies)\n")
    mc = len(master); warn = "  <-- OVER 280!" if mc > 280 else ""
    print(f"========== MASTER POST ({mc} chars){warn} ==========")
    print(master)
    print()
    for tag, text in replies:
        c = len(text); warn = "  <-- OVER 280!" if c > 280 else ""
        print(f"---------- REPLY [{tag}] ({c} chars){warn} ----------")
        print("↳ (post as reply to master)")
        print(text)
        print()


if __name__ == "__main__":
    main()
