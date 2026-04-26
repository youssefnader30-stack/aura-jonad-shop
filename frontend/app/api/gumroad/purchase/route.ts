import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const webhookSecret = process.env.GUMROAD_WEBHOOK_SECRET;

type PurchasePayload = {
  email?: string;
  product_name?: string;
  product_id?: string;
  gumroad_order_id?: string;
  sale_id?: string;
  download_url?: string;
  purchased_at?: string;
  user_id?: string;
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
  const email = (payload.email || '').toLowerCase().trim();
  const gumroadOrderId = payload.gumroad_order_id || payload.sale_id || '';

  if (!email || !productNameIsValid(payload.product_name) || !payload.product_id || !gumroadOrderId) {
    return NextResponse.json(
      { error: 'Missing email, product_name, product_id, or gumroad_order_id' },
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
        product_name: payload.product_name,
        product_id: payload.product_id,
        gumroad_order_id: gumroadOrderId,
        purchased_at: payload.purchased_at || new Date().toISOString(),
        download_url: payload.download_url || null,
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
