#!/usr/bin/env python3
"""
SharpSpots daily Twitter-recap emailer (for GitHub Actions / any cron).

Fetches yesterday's graded 2-star+ picks from Contentful, builds the @sharpspots
thread (master post + per-pick reply breakdowns with honest post-mortems), and
emails it to RECAP_TO via Gmail SMTP.

Runs on Python standard library only (urllib, smtplib, email) -- no pip installs.

Required environment variables (set as GitHub Actions secrets):
  CONTENTFUL_SPACE_ID
  CONTENTFUL_ACCESS_TOKEN
  GMAIL_USER          e.g. jeremywozunk@gmail.com  (the sending account)
  GMAIL_APP_PASSWORD  16-char Google App Password (NOT your normal password)
  RECAP_TO            where to send (defaults to GMAIL_USER if unset)

Optional:
  RECAP_DATE          YYYY-MM-DD to force a specific date (default: yesterday ET)

Usage (local test):  GMAIL_USER=... GMAIL_APP_PASSWORD=... python3 send_recap_email.py
"""
import os
import sys
import smtplib
import importlib.util
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

HERE = os.path.dirname(os.path.abspath(__file__))

# Import the generator module that lives next to this file
spec = importlib.util.spec_from_file_location(
    "recap_generator", os.path.join(HERE, "recap_generator.py"))
rg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rg)


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def box(label, text):
    return ('<div style="margin:14px 0;border:1px solid #d9e2dd;border-radius:10px;overflow:hidden">'
            '<div style="background:#0e1612;color:#4ade80;font-size:11px;font-weight:600;'
            'letter-spacing:.08em;padding:7px 12px;text-transform:uppercase">' + label + '</div>'
            '<pre style="margin:0;padding:14px;white-space:pre-wrap;'
            'font-family:-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.45;'
            'color:#111;background:#fff">' + esc(text) + '</pre></div>')


def build_bodies(day, master, replies, rec, units):
    intro = ('<p style="color:#666;font-size:13px">SharpSpots thread for <b>' + day + '</b> &middot; '
             + rec + ' &middot; ' + f"{units:+.2f}u" + '<br>Post the master first, then each reply '
             'as a reply to it (or build one thread in the X composer).</p>')
    html = ['<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px">', intro,
            box("Master post (timeline)", master)]
    for i, (tag, text) in enumerate(replies, 1):
        html.append(box(f"Reply {i}", text))
    html.append("</div>")
    html = "\n".join(html)

    plain = [f"SharpSpots thread for {day} | {rec} | {units:+.2f}u", "",
             "=== MASTER POST ===", master, ""]
    for i, (tag, text) in enumerate(replies, 1):
        plain += [f"=== REPLY {i} ===", text, ""]
    plain = "\n".join(plain)
    return html, plain


def main():
    env = rg.load_env()  # reads CONTENTFUL_* from environment
    day = os.environ.get("RECAP_DATE", "").strip() or rg.et_yesterday()

    picks = rg.fetch_day(env, day)
    master, replies, (w, l, p, units) = rg.build(day, picks)
    rec = f"{w}-{l}" + (f"-{p}" if p else "")

    html, plain = build_bodies(day, master, replies, rec, units)
    subject = f"SharpSpots X thread - {rg.fmt_date_long(day)} ({rec}, {units:+.2f}u)"

    gmail_user = os.environ.get("GMAIL_USER", "").strip()
    gmail_pass = os.environ.get("GMAIL_APP_PASSWORD", "").strip()
    recap_to = os.environ.get("RECAP_TO", "").strip() or gmail_user

    if not gmail_user or not gmail_pass:
        # No creds: just print (useful for dry runs / debugging in CI logs)
        print("[no GMAIL creds -- dry run] Subject:", subject)
        print(plain)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = gmail_user
    msg["To"] = recap_to
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(gmail_user, gmail_pass)
        server.sendmail(gmail_user, [recap_to], msg.as_string())

    print(f"Sent recap for {day} ({rec}, {units:+.2f}u, {len(replies)} replies) to {recap_to}")


if __name__ == "__main__":
    main()
