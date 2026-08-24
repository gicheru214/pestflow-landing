import crypto from 'crypto';

const PIXEL_ID = process.env.META_PIXEL_ID || '1316762993672485';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v24.0';
const REQUEST_TIMEOUT_MS = 5_000;
const EVENT_ID_PATTERN = /^[A-Za-z0-9._:-]{8,100}$/;

export interface UserData {
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
  leadSource:
    | 'contact-capture'
    | 'owner-offer'
    | 'prospect-ledger'
    | 'prospect-backfill';
  eventTime?: Date | number;
  prospectKeyHash?: string;
  userData: UserData;
}

export interface MetaEventResult {
  ok: boolean;
  retryable: boolean;
  configured: boolean;
  status?: number;
  error?: string;
  eventsReceived?: number;
  fbtraceId?: string;
}

export interface AppStoreHandoffEventData {
  eventId: string;
  eventSourceUrl: string;
  source: string;
  platform: 'ios_ipados' | 'android';
  destination: 'apple_app_store' | 'google_play_store';
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

async function postMetaEvent(
  payload: Record<string, unknown>,
  eventLabel: string,
): Promise<MetaEventResult> {
  if (!ACCESS_TOKEN) {
    console.log(`[Meta CAPI] No access token configured, skipping ${eventLabel} event`);
    return {
      ok: false,
      retryable: false,
      configured: false,
      error: 'META_CAPI_ACCESS_TOKEN is not configured',
    };
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
      return {
        ok: (result.events_received ?? 0) > 0,
        retryable: false,
        configured: true,
        status: response.status,
        error: (result.events_received ?? 0) > 0
          ? undefined
          : 'Meta accepted the request but did not receive an event',
        eventsReceived: result.events_received,
        fbtraceId: result.fbtrace_id,
      };
    }

    const errorMessage =
      result.error?.message || `Meta request failed with HTTP ${response.status}`;
    console.error(`[Meta CAPI] failed ${eventLabel}`, {
      status: response.status,
      code: result.error?.code,
      message: errorMessage,
    });
    return {
      ok: false,
      retryable: response.status === 408 || response.status === 429 || response.status >= 500,
      configured: true,
      status: response.status,
      error: errorMessage,
      eventsReceived: result.events_received,
      fbtraceId: result.fbtrace_id,
    };
  } catch (error) {
    console.error(`[Meta CAPI] error sending ${eventLabel}`, error);
    return {
      ok: false,
      retryable: true,
      configured: true,
      error: error instanceof Error ? error.message : 'Unexpected Meta request error',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function eventTimeSeconds(value: Date | number | undefined): number {
  if (value instanceof Date) return Math.floor(value.getTime() / 1000);
  if (typeof value === 'number') {
    return value > 10_000_000_000 ? Math.floor(value / 1000) : Math.floor(value);
  }
  return Math.floor(Date.now() / 1000);
}

export async function sendLeadEventDetailed(
  data: LeadEventData,
): Promise<MetaEventResult> {
  if (!validEventId(data.eventId)) {
    console.warn('[Meta CAPI] Invalid Lead event ID, skipping event');
    return {
      ok: false,
      retryable: false,
      configured: Boolean(ACCESS_TOKEN),
      error: 'Invalid Meta Lead event ID',
    };
  }

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: eventTimeSeconds(data.eventTime),
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
          external_id: data.prospectKeyHash
            ? [data.prospectKeyHash]
            : undefined,
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

export async function sendLeadEvent(data: LeadEventData): Promise<boolean> {
  const result = await sendLeadEventDetailed(data);
  return result.ok;
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
          content_name: data.platform === 'android'
            ? 'PestFlow Android App'
            : 'PestFlow iOS App',
          content_category: 'mobile_app',
          destination: data.destination,
          platform: data.platform,
          source: data.source,
        },
      },
    ],
  };

  const result = await postMetaEvent(payload, 'AppStoreHandoff');
  return result.ok;
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
  const result = await postMetaEvent(payload, 'Purchase');
  return result.ok;
}
