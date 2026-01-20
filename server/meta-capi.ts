import crypto from 'crypto';

const PIXEL_ID = process.env.META_PIXEL_ID || '876189468370955';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

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

function hashValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

export async function sendPurchaseEvent(data: PurchaseEventData): Promise<boolean> {
  if (!ACCESS_TOKEN) {
    console.log('[Meta CAPI] No access token configured, skipping server-side event');
    return false;
  }

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
          ph: hashValue(data.userData.phone),
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

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log('[Meta CAPI] Purchase event sent successfully:', result);
      return true;
    } else {
      console.error('[Meta CAPI] Failed to send event:', result);
      return false;
    }
  } catch (error) {
    console.error('[Meta CAPI] Error sending event:', error);
    return false;
  }
}
