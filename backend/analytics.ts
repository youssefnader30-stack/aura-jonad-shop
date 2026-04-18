// N20_Analytics_Agent output — GA4 Measurement Protocol (server-side)
const MP_URL = 'https://www.google-analytics.com/mp/collect';
const GA_ID = process.env.GA4_MEASUREMENT_ID!;
const GA_SECRET = process.env.GA4_API_SECRET!;

export async function gaEvent(clientId: string, name: string, params: Record<string, any>) {
  await fetch(`${MP_URL}?measurement_id=${GA_ID}&api_secret=${GA_SECRET}`, {
    method: 'POST',
    body: JSON.stringify({ client_id: clientId, events: [{ name, params }] }),
  });
}

// Call sites:
//   add_to_cart:  gaEvent(cid,'add_to_cart',{items:[{item_id,item_name,price,quantity}],value,currency:'USD'})
//   purchase:     gaEvent(cid,'purchase',{transaction_id,value,currency:'USD',items:[...]})
//   view_item:    gaEvent(cid,'view_item',{items:[{item_id,item_name,price}]})
