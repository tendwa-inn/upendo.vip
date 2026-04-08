
create or replace function get_discover_users(current_user_id uuid, count integer)
returns setof profiles
as $$
begin
  return query
  select *
  from profiles
  where id != current_user_id
  order by random()
  limit count;
end;
$$ language plpgsql;
