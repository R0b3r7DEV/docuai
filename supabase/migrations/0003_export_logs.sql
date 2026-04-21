-- Export logs for rate limiting (max 10 exports per hour per org)
create table if not exists export_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists export_logs_org_created
  on export_logs (organization_id, created_at desc);

-- RLS: users can only see their own org's logs
alter table export_logs enable row level security;

create policy "org members can insert export logs"
  on export_logs for insert
  with check (
    organization_id in (
      select organization_id from users where id = auth.uid()::text
    )
  );

create policy "org members can read export logs"
  on export_logs for select
  using (
    organization_id in (
      select organization_id from users where id = auth.uid()::text
    )
  );
