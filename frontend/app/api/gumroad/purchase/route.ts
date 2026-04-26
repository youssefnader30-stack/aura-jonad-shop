import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const webhookSecret =
  process.env.GUMROAD_WEBHOOK_SECRET ||
  process.env.LEMON_WEBHOOK_SECRET;

type PurchasePayload = {
  email?: string;
  product_name?: string;
  product_id?: string;
  gumroad_order_id?: string;
  sale_id?: string;
  order_id?: string;
  download_url?: string;
  purchased_at?: string;
  user_id?: string;
  // Lemon Squeezy nested payload support
  data?: {
    attributes?: {
      user_email?: string;
      product_name?: string;
      product_id?: number;
      order_number?: number;
      created_at?: string;
      urls?: { receipt?: string };
    };
  };
  meta?: { event_name?: string };
};

export async function POST(req: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase service configuration' }, { status: 500 });
  }

  if (webhookSecret) {
    const providedSecret = req.headers.get('x-webhook-secret') || req.nextUrl.searchParams.get('secret');
    if (providedSecret !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
    }
  }

  const payload = (await req.json()) as PurchasePayload;

  // Normalize: support both flat Gumroad/n8n payloads AND nested Lemon Squeezy webhooks
  const lemon = payload.data?.attributes;
  const email = (lemon?.user_email || payload.email || '').toLowerCase().trim();
  const productName = lemon?.product_name || payload.product_name || '';
  const productId = lemon?.product_id?.toString() || payload.product_id || '';
  const gumroadOrderId =
    payload.gumroad_order_id ||
    payload.sale_id ||
    payload.order_id ||
    (lemon?.order_number ? `lemon-${lemon.order_number}` : '');
  const downloadUrl = lemon?.urls?.receipt || payload.download_url || null;
  const purchasedAt = lemon?.created_at || payload.purchased_at || new Date().toISOString();

  if (!email || !productNameIsValid(productName) || !productId || !gumroadOrderId) {
    return NextResponse.json(
      { error: 'Missing email, product_name, product_id, or order_id' },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from('purchases')
    .upsert(
      {
        user_id: payload.user_id || null,
        email,
        product_name: productName,
        product_id: productId,
        gumroad_order_id: gumroadOrderId,
        purchased_at: purchasedAt,
        download_url: downloadUrl,
      },
      { onConflict: 'gumroad_order_id' }
    )
    .select('id,email,product_name,product_id,gumroad_order_id,purchased_at,download_url')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, purchase: data });
}

function productNameIsValid(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
