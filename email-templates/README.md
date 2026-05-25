# Conddo transactional email templates

Branded, email-client-safe HTML (table layout + inline styles; tested patterns for
Gmail, Apple Mail, Outlook/MSO). These are the **design source of truth** — the
backend renders them by substituting the `{{PLACEHOLDER}}` tokens, then sends the
result as the email's `html` body (via Resend).

Brand: violet `#7C5CBF`, ink `#141414`, page `#F4F3F0`, white card with a 1px
hairline border — no gradients/shadows, matching the app.

## Templates & placeholders

| File | Sent when | Placeholders |
|---|---|---|
| `verification-code.html` | Signup OTP (`/auth/register/start`, `/resend`) | `LOGO_URL`, `CODE`, `EXPIRY_MINUTES` |
| `password-reset.html` | `/auth/forgot-password` | `LOGO_URL`, `RESET_URL`, `RESET_TOKEN`, `EXPIRY_MINUTES` |
| `welcome.html` | After `/auth/register/complete` | `LOGO_URL`, `FIRST_NAME`, `BUSINESS_NAME`, `DASHBOARD_URL` |
| `staff-invite.html` | `/staff/invite` | `LOGO_URL`, `INVITER_NAME`, `BUSINESS_NAME`, `ROLE`, `ACCEPT_URL`, `EXPIRY_HOURS` |

- **`LOGO_URL`** — a public URL to the Conddo logo (e.g. `https://app.conddo.io/conddo_logo.png`).
  Every template has `alt="conddo.io"`, so it degrades gracefully if the image is blocked.
- **`RESET_URL`** — `https://app.conddo.io/reset-password?token=<token>` (the frontend
  reset page reads `?token=`). `RESET_TOKEN` is shown as a paste-able fallback.
- **`ACCEPT_URL`** — the staff accept-invite link (set-password flow).
- **`DASHBOARD_URL`** — `https://app.conddo.io/dashboard`.

## Wiring in the backend (NotificationService)

Today `NotificationService` sends **plain text**. To use these:

1. Drop the four files into `conddo-core/src/main/resources/email-templates/`.
2. Load + fill: read the file, `replace("{{CODE}}", code)`, etc.
3. Send as **HTML** — Resend accepts an `html` field. `EmailSender` currently does
   `send(to, subject, body)` as text; add an HTML overload (or a 4th arg) so
   `ResendEmailSender` posts `{ from, to, subject, html }`. Keep the existing plain
   text as the `text` fallback (good deliverability — include both).

Example (verification):
```
String html = load("email-templates/verification-code.html")
    .replace("{{LOGO_URL}}", logoUrl)
    .replace("{{CODE}}", code)
    .replace("{{EXPIRY_MINUTES}}", String.valueOf(otp.ttl().toMinutes()));
emailSender.sendHtml(toEmail, "Your Conddo verification code", html, plainTextFallback);
```

## Preview

Open any `.html` in a browser to preview (the logo shows once `LOGO_URL` resolves;
the `{{...}}` tokens render literally until substituted).
