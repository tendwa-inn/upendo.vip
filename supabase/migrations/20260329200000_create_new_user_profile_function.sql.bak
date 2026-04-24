create or replace function create_new_user_profile(p_user_id uuid, p_name text, p_birthday text, p_gender text, p_location_name text, p_longitude float, p_latitude float)
returns void as $$
begin
  insert into profiles (id, name, birthday, gender, age, location_name, location)
  values (
    p_user_id,
    p_name,
    p_birthday,
    p_gender,
    (date_part('year', age(p_birthday::date))),
    p_location_name,
    case
      when p_longitude is not null and p_latitude is not null then ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)
      else null
    end
  );
end;
$$ language plpgsql security definer;