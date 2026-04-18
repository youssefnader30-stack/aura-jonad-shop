// N8_Admin_Agent output — /admin dashboard (RBAC via admins table)
// File tree:
//   app/admin/layout.tsx   (role guard)
//   app/admin/page.tsx     (overview KPIs)
//   app/admin/products/page.tsx  (CRUD)
//   app/admin/orders/page.tsx
//   app/admin/users/page.tsx

// ---------- app/admin/layout.tsx ----------
import { redirect } from 'next/navigation';
import { sb } from '@/lib/supabase';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = sb();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect('/login');
  const { data: admin } = await s.from('admins').select('role').eq('user_id', user.id).single();
  if (!admin) redirect('/');
  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      <nav className="col-span-2 space-y-2">
        <a href="/admin" className="block">Overview</a>
        <a href="/admin/products" className="block">Products</a>
        <a href="/admin/orders" className="block">Orders</a>
        <a href="/admin/users" className="block">Users</a>
      </nav>
      <section className="col-span-10">{children}</section>
    </div>
  );
}

// ---------- app/admin/page.tsx ----------
// KPIs: revenue_30d, orders_30d, top_products, low_stock (<=5)
// SQL:
//   select sum(total_cents) from orders where status='paid' and created_at > now()-interval '30 days';
//   select count(*) from orders where created_at > now()-interval '30 days';
//   select p.name, sum(oi.qty) s from order_items oi join products p on p.id=oi.product_id
//     group by p.name order by s desc limit 5;
//   select id,name,stock from products where stock <= 5;

// ---------- app/admin/products/page.tsx ----------
// Table + "New product" drawer → POST /api/admin/products
// Image upload → Supabase Storage bucket 'product-images' → insert product_images row.
