create or replace function increment_swipe_count(p_user_id uuid)
returns void as $$
begin
  update profiles
  set daily_swipe_count = daily_swipe_count + 1,
      last_swipe_count_reset_at = now()
  where id = p_user_id;
end;
$$ language plpgsql;