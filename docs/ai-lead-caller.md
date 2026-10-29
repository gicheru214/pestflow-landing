# PestFlow AI lead caller

The homepage playbook form offers an unchecked, optional AI voice-call consent box. Only a completed `newsletter` submission with that box checked, a valid US phone number, and a recognized US time zone can enter this queue. Partial captures and existing leads never enter it. Consent wording, timestamp, IP, and user agent are stored in `ai_lead_calls` for an audit trail.

`AI_LEAD_CALL_ENABLED` defaults off. When it is off, new consent receipts are marked `disabled` and will never be backfilled. Turning it on only affects future form submissions. A lead can get one immediate attempt during 9 a.m.–6 p.m. on weekdays in the lead's local time and one more four hours later only after Vapi reports `customer-did-not-answer` or `customer-busy`. The second attempt also waits for local calling hours. A connected call, refusal, booked appointment, uncertain API outcome, or opt-out blocks further attempts. A new form submission from the same phone cannot restart calls for 30 days; an opt-out suppresses future attempts indefinitely.

## Connections to finish before launch

Set these server-only Railway variables on the landing service:

- `VAPI_API_KEY`: private key for the Vapi organization.
- `VAPI_ASSISTANT_ID`: `21a79609-d298-454e-a265-74b6fe5ca8a5` (PestFlow Facebook Lead Setter).
- `VAPI_PHONE_NUMBER_ID`: a dedicated, imported outbound-capable number.
- `VAPI_WEBHOOK_SECRET`: a random secret configured as a Bearer credential in Vapi.
- `CALENDLY_API_TOKEN` and `CALENDLY_PESTFLOW_EVENT_TYPE_URI`: existing Calendly integration values, if present. The event must be the 30-minute Pestflow Set Up Call configured to require the invitee's phone number.

Configure the published Vapi assistant's Server URL as `https://pestflow.org/api/vapi/lead-caller` with the Bearer credential. Enable `status-update`, `end-of-call-report`, and `tool-calls` server messages. Add and attach these Function tools to that assistant; their server can inherit the assistant Server URL and credential:

- `pestflow_available_times`: optional string `date` in `YYYY-MM-DD` (the lead's local date). Returns real open slots as `start_time`, `local_time`, and `local_date`.
- `book_pestflow_setup_call`: object with required string `start_time`, selected exactly from availability. The backend rechecks the slot and uses the lead's saved name, email, phone, and time zone.
- `stop_pestflow_calls`: no arguments. Call immediately when the person asks not to be called again.

Do not put the webhook URL in per-call `assistantOverrides`: Vapi may omit the saved credential for request-supplied server URLs. Do not enable `AI_LEAD_CALL_ENABLED` until the assistant tools, imported number, Vapi billing, webhook authentication, and a complete test call have all been verified.

The existing signed Calendly `invitee.created` webhook stops pending lead calls when the lead books through the normal Calendly page. The direct booking tool records the confirmed event URI. If Vapi or Calendly times out after a create request, the lead moves to `needs_review`; automation does not repeat a potentially successful action.

## Launch proof

Test one explicit opt-in with an owned phone number and one without opt-in. Verify the caller ID, AI disclosure, real Calendly availability, booking confirmation and Calendar event, opt-out, no-answer result, retry cap, and Vapi webhook logs. Keep live calling off until this evidence is recorded. Calls consume Vapi/telephony credits.
