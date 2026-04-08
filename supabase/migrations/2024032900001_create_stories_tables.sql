
create table stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table story_likes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(story_id, user_id)
);
