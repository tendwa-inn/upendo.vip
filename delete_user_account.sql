create or replace function delete_user_account()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete from related tables first to avoid foreign key constraints
  delete from likes where liker_id = auth.uid();
  delete from likes where liked_id = auth.uid();
  delete from matches where user1_id = auth.uid() or user2_id = auth.uid();
  delete from messages where sender_id = auth.uid();
  delete from notifications where user_id = auth.uid();
  delete from profiles where id = auth.uid();
  
  -- Finally, delete the user from the auth.users table
  delete from auth.users where id = auth.uid();
end; 
$$;