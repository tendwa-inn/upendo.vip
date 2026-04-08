
# Upendo - Dating Application

This is the repository for the Upendo dating application.

## Project Setup

To run this project locally, you will need to create a `.env.local` file in the root of the project with the following environment variables:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these keys in your Supabase project dashboard under **Project Settings** > **API**.

### Database Setup

All the necessary SQL to set up the database schema is located in the `setup.sql` file. This includes all tables, triggers, and row-level security policies.

### Google OAuth Configuration

To enable Google Sign-In, you must add the following URL to your list of allowed redirect URLs in your Supabase project's authentication settings:

**`http://localhost:5173/profile`**

This can be found in your Supabase dashboard under **Authentication** > **URL Configuration**.
