import crypto from 'crypto';

const PIXEL_ID = process.env.META_PIXEL_ID || '1316762993672485';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v24.0';
const REQUEST_TIMEOUT_MS = 5_000;
const EVENT_ID_PATTERN = /^[A-Za-z0-9._:-]{8,100}$/;

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

interface PurchaseEventData {
  eventId: string;
  eventSourceUrl: string;
  value: number;
  currency: string;
  contentName?: string;
  contentIds?: string[];
  userData: UserData;
}

export interface LeadEventData {
  eventId: string;
  eventSourceUrl: string;
  leadSource: 'contact-capture' | 'owner-offer';
  userData: UserData;
}

export interface AppStoreHandoffEventData {
  eventId: string;
  eventSourceUrl: string;
  source: 'home_mobile_top';
  userData: Pick<
    UserData,
    'clientIpAddress' | 'clientUserAgent' | 'fbc' | 'fbp'
  >;
}

export function isQualifiedOwnerLeadSubmission(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false;
  const candidate = body as Record<string, unknown>;
  if (typeof candidate.metaEventId !== 'string') return false;

  const acceptedOwnerOffer = candidate.type === 'popup_partial'
    && candidate.reason === 'accept_offer_signup_success';
  const capturedContact = candidate.type === 'newsletter'
    && typeof candidate.email === 'string'
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email.trim())
    && typeof candidate.phone === 'string'
    && candidate.phone.replace(/\D/g, '').length >= 10;

  return acceptedOwnerOffer || capturedContact;
}

function clean(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function hashValue(value: string | undefined): string[] | undefined {
  const normalized = clean(value)?.normalize('NFKC').toLowerCase();
  if (!normalized) return undefined;
  return [crypto.createHash('sha256').update(normalized).digest('hex')];
}

function hashPhone(value: string | undefined): string[] | undefined {
  const normalized = clean(value)?.replace(/[^0-9]/g, '');
  if (!normalized) return undefined;
  return [crypto.createHash('sha256').update(normalized).digest('hex')];
}

function validEventId(value: string): boolean {
  return EVENT_ID_PATTERN.test(value.trim());
}

function metaEndpoint(): string {
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(PIXEL_ID)}/events`;
}

async function postMetaEvent(payload: Record<string, unknown>, eventLabel: string): Promise<boolean> {
  if (!ACCESS_TOKEN) {
    console.log(`[Meta CAPI] No access token configured, skipping ${eventLabel} event`);
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(metaEndpoint(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({})) as {
      events_received?: number;
      fbtrace_id?: string;
      error?: { message?: string; code?: number };
    };

    if (response.ok && !result.error) {
      console.log(`[Meta CAPI] sent ${eventLabel}`, {
        eventId: (payload.data as Array<{ event_id?: string }> | undefined)?.[0]?.event_id,
        eventsReceived: result.events_received,
      });
      return true;
    }

    console.error(`[Meta CAPI] failed ${eventLabel}`, {
      status: response.status,
      code: result.error?.code,
      message: result.error?.message,
    });
    return false;
  } catch (error) {
    console.error(`[Meta CAPI] error sending ${eventLabel}`, error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendLeadEvent(data: LeadEventData): Promise<boolean> {
  if (!validEventId(data.eventId)) {
    console.warn('[Meta CAPI] Invalid Lead event ID, skipping event');
    return false;
  }

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: data.eventId.trim(),
        event_source_url: data.eventSourceUrl,
        action_source: 'website',
        user_data: {
          em: hashValue(data.userData.email),
          ph: hashPhone(data.userData.phone),
          fn: hashValue(data.userData.firstName),
          ln: hashValue(data.userData.lastName),
          client_ip_address: clean(data.userData.clientIpAddress),
          client_user_agent: clean(data.userData.clientUserAgent),
          fbc: clean(data.userData.fbc),
          fbp: clean(data.userData.fbp),
        },
        custom_data: {
          currency: 'USD',
          value: 10,
          content_name: 'PestFlow qualified lead',
          lead_source: data.leadSource,
        },
      },
    ],
  };

  return postMetaEvent(payload, 'Lead');
}

export async function sendAppStoreHandoffEvent(
  data: AppStoreHandoffEventData,
): Promise<boolean> {
  if (!validEventId(data.eventId)) {
    console.warn('[Meta CAPI] Invalid AppStoreHandoff event ID, skipping event');
    return false;
  }

  const payload = {
    data: [
      {
        event_name: 'AppStoreHandoff',
        event_time: Math.floor(Date.now() / 1000),
        event_id: data.eventId.trim(),
        event_source_url: data.eventSourceUrl,
        action_source: 'website',
        user_data: {
          client_ip_address: clean(data.userData.clientIpAddress),
          client_user_agent: clean(data.userData.clientUserAgent),
          fbc: clean(data.userData.fbc),
          fbp: clean(data.userData.fbp),
        },
        custom_data: {
          content_name: 'PestFlow iOS App',
          content_category: 'mobile_app',
          destination: 'apple_app_store',
          source: data.source,
        },
      },
    ],
  };

  return postMetaEvent(payload, 'AppStoreHandoff');
}

export async function sendPurchaseEvent(data: PurchaseEventData): Promise<boolean> {
  const eventTime = Math.floor(Date.now() / 1000);

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: eventTime,
        event_id: data.eventId,
        event_source_url: data.eventSourceUrl,
        action_source: 'website',
        user_data: {
          em: hashValue(data.userData.email),
          ph: hashPhone(data.userData.phone),
          fn: hashValue(data.userData.firstName),
          ln: hashValue(data.userData.lastName),
          client_ip_address: data.userData.clientIpAddress,
          client_user_agent: data.userData.clientUserAgent,
          fbc: data.userData.fbc,
          fbp: data.userData.fbp,
        },
        custom_data: {
          value: data.value,
          currency: data.currency,
          content_name: data.contentName || 'PestFlow Subscription',
          content_ids: data.contentIds || ['pestflow-monthly'],
          content_type: 'product',
        },
      },
    ],
  };
  return postMetaEvent(payload, 'Purchase');
}
