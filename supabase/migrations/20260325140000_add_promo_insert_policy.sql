create policy "Admins can insert promo codes" 
on promo_codes 
for insert 
to authenticated 
with check ( 
  exists ( 
    select 1 from profiles 
    where profiles.id = auth.uid() 
    and profiles.role = 'admin' 
  ) 
);