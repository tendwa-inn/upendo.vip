CREATE OR REPLACE FUNCTION public.record_profile_view(
  p_viewer_id UUID,
  p_viewed_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profile_views (viewer_id, viewed_id)
  VALUES (p_viewer_id, p_viewed_id)
  ON CONFLICT (viewer_id, viewed_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;