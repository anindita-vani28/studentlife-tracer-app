# Deploy to Vercel

This guide walks you through deploying the Student Life AI Assistant to Vercel.

## Prerequisites

- Vercel account (free tier available at https://vercel.com)
- GitHub account (repo is already set up at https://github.com/anindita-vani28/studentlife-tracer-app)
- Supabase project with credentials

## Option 1: Deploy via Vercel Web Dashboard (Recommended for First Time)

### Step 1: Connect GitHub to Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select "Import Git Repository"
4. Search for "studentlife-tracer-app" and click "Import"
5. Vercel will auto-detect Next.js settings

### Step 2: Configure Environment Variables
Before clicking "Deploy", add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://shgvmwclcrhfdgovhdjb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Where:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (from .env.local)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key (from .env.local)

⚠️ Only `NEXT_PUBLIC_*` variables are needed — these are safe to expose in the browser since they're part of the Supabase public API.

### Step 3: Deploy
1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. You'll get a live URL like `https://studentlife-tracer-app.vercel.app`

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Project to Vercel
```bash
vercel link
```
Select "yes" to link to existing project or create a new one.

### Step 4: Deploy
```bash
vercel --prod
```

This will prompt for environment variables during deployment.

## Verify Your Deployment

After deployment, test the live app end-to-end:

1. **Sign up**: Create a test account
2. **Add course**: Create a course with a color
3. **Add task**: Create a task with due date
4. **Check dashboard**: Verify stats and widgets appear
5. **Toggle task**: Mark task as complete
6. **Delete**: Test delete functionality

## Redeploy After Changes

Once Vercel is connected to your GitHub repo, any push to the `main` branch automatically triggers a new deployment.

```bash
git add .
git commit -m "Some changes"
git push origin main
# Vercel will automatically build and deploy
```

You can monitor deployments at: https://vercel.com/dashboard/[your-account]/studentlife-tracer-app

## Environment Variables Reference

| Variable | Purpose | Visibility |
|----------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Public (browser) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public API key | Public (browser) |

Both variables are required for Supabase to work. They're marked as `NEXT_PUBLIC_` because they're meant to be used from the browser.

## Troubleshooting

### "Build failed" error
- Check that all environment variables are set
- Verify TypeScript compiles: `npm run build`
- Check logs in Vercel dashboard: https://vercel.com/dashboard

### "Supabase connection failed" after deploy
- Double-check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify your Supabase project is active
- Check RLS policies allow the anon key

### Database queries returning empty
- Ensure you're logged in with the same account that created courses/tasks
- Check RLS policies: `auth.uid() = user_id` should allow access
- Verify courses/tasks exist in Supabase dashboard

## Next Steps

After successful deployment:
1. Share the live URL with others
2. Monitor performance in Vercel Analytics
3. Set up error tracking (Sentry, etc.) if desired
4. Consider upgrading Supabase for higher limits

For more info: https://vercel.com/docs
