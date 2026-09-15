-- Kipling Committee food ordering app — database schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

-- Restaurants
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Menu items (each belongs to one restaurant)
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists menu_items_restaurant_id_idx on menu_items(restaurant_id);

-- Orders placed by students
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  student_class text not null,
  student_phone text not null,
  restaurant_id uuid not null references restaurants(id),
  delivery_date date not null,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'confirmed', 'ready_for_pickup')),
  payment_screenshot_path text not null,
  total_amount numeric(10,2) not null check (total_amount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists orders_student_phone_idx on orders(student_phone);
create index if not exists orders_delivery_date_idx on orders(delivery_date);

-- Line items for each order (snapshot of name/price at order time)
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  item_name text not null,
  item_price numeric(10,2) not null check (item_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0)
);

create index if not exists order_items_order_id_idx on order_items(order_id);

-- Row Level Security: all reads/writes go through server-side API routes using
-- the Supabase service role key, so no client-side access is granted here.
alter table restaurants enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Storage bucket for payment screenshots (private; accessed via signed URLs
-- generated server-side with the service role key).
insert into storage.buckets (id, name, public)
values ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do nothing;
