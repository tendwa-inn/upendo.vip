-- Hardens objects flagged by Supabase Security Advisor.
-- Targets:
-- - public.likes: enable RLS and scope access to the participating users
-- - public.story_likes: enable RLS and lock down a discontinued feature
-- - public.stories: enable RLS and lock down the discontinued feature's parent table
-- - public.profiles_view: switch to SECURITY INVOKER so underlying RLS is respected
-- - public.spatial_ref_sys: enable RLS while preserving safe read access

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

DO $$
DECLARE
  policy_name text;
BEGIN
  IF to_regclass('public.likes') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.likes FORCE ROW LEVEL SECURITY';

    FOR policy_name IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'likes'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.likes', policy_name);
    END LOOP;

    EXECUTE $policy$
      CREATE POLICY "likes_select_own_or_received"
      ON public.likes
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = liker_id
        OR auth.uid() = liked_id
        OR public.is_admin()
      )
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "likes_insert_own"
      ON public.likes
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = liker_id
        AND liker_id <> liked_id
      )
    $policy$;

    EXECUTE $policy$
      CREATE POLICY "likes_delete_own_or_received"
      ON public.likes
      FOR DELETE
      TO authenticated
      USING (
        auth.uid() = liker_id
        OR auth.uid() = liked_id
        OR public.is_admin()
      )
    $policy$;
  END IF;
END
$$;

DO $$
DECLARE
  policy_name text;
BEGIN
  IF to_regclass('public.story_likes') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.story_likes FORCE ROW LEVEL SECURITY';

    FOR policy_name IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'story_likes'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.story_likes', policy_name);
    END LOOP;

    EXECUTE $policy$
      CREATE POLICY "story_likes_admin_all"
      ON public.story_likes
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())
    $policy$;
  END IF;
END
$$;

DO $$
DECLARE
  policy_name text;
BEGIN
  IF to_regclass('public.stories') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.stories FORCE ROW LEVEL SECURITY';

    FOR policy_name IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'stories'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.stories', policy_name);
    END LOOP;

    EXECUTE $policy$
      CREATE POLICY "stories_admin_all"
      ON public.stories
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())
    $policy$;
  END IF;
END
$$;

DO $$
DECLARE
  policy_name text;
BEGIN
  IF to_regclass('public.spatial_ref_sys') IS NOT NULL THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY';
      EXECUTE 'ALTER TABLE public.spatial_ref_sys FORCE ROW LEVEL SECURITY';

      FOR policy_name IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'spatial_ref_sys'
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.spatial_ref_sys', policy_name);
      END LOOP;

      EXECUTE $policy$
        CREATE POLICY "spatial_ref_sys_read_only"
        ON public.spatial_ref_sys
        FOR SELECT
        TO anon, authenticated
        USING (true)
      $policy$;
    EXCEPTION
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'Skipping public.spatial_ref_sys RLS hardening because the current role does not own the extension table.';
    END;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.profiles_view') IS NOT NULL THEN
    EXECUTE 'ALTER VIEW public.profiles_view SET (security_invoker = true)';
  END IF;
END
$$;
