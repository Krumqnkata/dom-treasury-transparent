-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Function to auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apartments table (single building)
create table if not exists public.apartments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  monthly_fee numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  period_month date not null,
  amount numeric(12,2) not null check (amount >= 0),
  paid_at timestamptz not null default now(),
  method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_apartment_period unique (apartment_id, period_month)
);
create index if not exists idx_payments_period_month on public.payments (period_month);

-- Expense categories
create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.expense_categories(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  incurred_at date not null default (now()::date),
  description text,
  receipt_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_expenses_incurred_at on public.expenses(incurred_at);
create index if not exists idx_expenses_category_id on public.expenses(category_id);

-- Goals
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_amount numeric(12,2) not null check (target_amount >= 0),
  saved_amount numeric(12,2) not null default 0 check (saved_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.apartments enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_categories enable row level security;
alter table public.goals enable row level security;

-- Policies: allow all operations for authenticated users
-- Apartments
drop policy if exists "apartments_select_authenticated" on public.apartments;
create policy "apartments_select_authenticated" on public.apartments
for select to authenticated using (true);

drop policy if exists "apartments_insert_authenticated" on public.apartments;
create policy "apartments_insert_authenticated" on public.apartments
for insert to authenticated with check (true);

drop policy if exists "apartments_update_authenticated" on public.apartments;
create policy "apartments_update_authenticated" on public.apartments
for update to authenticated using (true) with check (true);

drop policy if exists "apartments_delete_authenticated" on public.apartments;
create policy "apartments_delete_authenticated" on public.apartments
for delete to authenticated using (true);

-- Payments
drop policy if exists "payments_select_authenticated" on public.payments;
create policy "payments_select_authenticated" on public.payments
for select to authenticated using (true);

drop policy if exists "payments_insert_authenticated" on public.payments;
create policy "payments_insert_authenticated" on public.payments
for insert to authenticated with check (true);

drop policy if exists "payments_update_authenticated" on public.payments;
create policy "payments_update_authenticated" on public.payments
for update to authenticated using (true) with check (true);

drop policy if exists "payments_delete_authenticated" on public.payments;
create policy "payments_delete_authenticated" on public.payments
for delete to authenticated using (true);

-- Expenses
drop policy if exists "expenses_select_authenticated" on public.expenses;
create policy "expenses_select_authenticated" on public.expenses
for select to authenticated using (true);

drop policy if exists "expenses_insert_authenticated" on public.expenses;
create policy "expenses_insert_authenticated" on public.expenses
for insert to authenticated with check (true);

drop policy if exists "expenses_update_authenticated" on public.expenses;
create policy "expenses_update_authenticated" on public.expenses
for update to authenticated using (true) with check (true);

drop policy if exists "expenses_delete_authenticated" on public.expenses;
create policy "expenses_delete_authenticated" on public.expenses
for delete to authenticated using (true);

-- Expense categories
drop policy if exists "expense_categories_select_authenticated" on public.expense_categories;
create policy "expense_categories_select_authenticated" on public.expense_categories
for select to authenticated using (true);

drop policy if exists "expense_categories_insert_authenticated" on public.expense_categories;
create policy "expense_categories_insert_authenticated" on public.expense_categories
for insert to authenticated with check (true);

drop policy if exists "expense_categories_update_authenticated" on public.expense_categories;
create policy "expense_categories_update_authenticated" on public.expense_categories
for update to authenticated using (true) with check (true);

drop policy if exists "expense_categories_delete_authenticated" on public.expense_categories;
create policy "expense_categories_delete_authenticated" on public.expense_categories
for delete to authenticated using (true);

-- Goals
drop policy if exists "goals_select_authenticated" on public.goals;
create policy "goals_select_authenticated" on public.goals
for select to authenticated using (true);

drop policy if exists "goals_insert_authenticated" on public.goals;
create policy "goals_insert_authenticated" on public.goals
for insert to authenticated with check (true);

drop policy if exists "goals_update_authenticated" on public.goals;
create policy "goals_update_authenticated" on public.goals
for update to authenticated using (true) with check (true);

drop policy if exists "goals_delete_authenticated" on public.goals;
create policy "goals_delete_authenticated" on public.goals
for delete to authenticated using (true);

-- Triggers for updated_at
create or replace trigger trg_apartments_updated_at
before update on public.apartments
for each row execute function public.update_updated_at_column();

create or replace trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.update_updated_at_column();

create or replace trigger trg_expenses_updated_at
before update on public.expenses
for each row execute function public.update_updated_at_column();

create or replace trigger trg_goals_updated_at
before update on public.goals
for each row execute function public.update_updated_at_column();

-- Seed default expense categories
insert into public.expense_categories (name)
values ('Ремонти'), ('Комунални'), ('Почистване'), ('Извънредни')
on conflict (name) do nothing;

-- Storage bucket for receipts
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Storage policies for receipts bucket
-- (Policies are global per table, we add conditions for the specific bucket)
drop policy if exists "Public can read receipts" on storage.objects;
create policy "Public can read receipts"
on storage.objects for select
using (bucket_id = 'receipts');

drop policy if exists "Authenticated can upload receipts" on storage.objects;
create policy "Authenticated can upload receipts"
on storage.objects for insert to authenticated
with check (bucket_id = 'receipts');

drop policy if exists "Authenticated can update receipts" on storage.objects;
create policy "Authenticated can update receipts"
on storage.objects for update to authenticated
using (bucket_id = 'receipts')
with check (bucket_id = 'receipts');

drop policy if exists "Authenticated can delete receipts" on storage.objects;
create policy "Authenticated can delete receipts"
on storage.objects for delete to authenticated
using (bucket_id = 'receipts');