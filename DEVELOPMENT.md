# Development Guide

This guide provides information for developers working on the Student Life AI Assistant project.

## Development Environment Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Visual Studio Code (recommended)
- Supabase account (https://supabase.com)

### Initial Setup
```bash
# Clone repository
git clone https://github.com/anindita-vani28/studentlife-tracer-app.git
cd studentlife-tracer-app

# Install dependencies
npm install

# Create .env.local with your credentials
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the app.

## Project Architecture

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Vercel (recommended)

### Key Folders
- `app/` — React components and routes
- `lib/` — Utilities, database functions, and Supabase clients
- `supabase/` — Database migrations and SQL
- `public/` — Static assets

## Database

### Connecting to Supabase

**Browser-side** (Client Components):
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.from('courses').select('*')
```

**Server-side** (Server Components):
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data, error } = await supabase.from('courses').select('*')
```

### Database Queries

Helper functions are in `lib/supabase/database.ts`:
```typescript
// Get all courses for current user
const courses = await getCourses()

// Add a new course
const course = await addCourse('Physics 101', '#3B82F6')

// Get tasks
const tasks = await getTasks()
const coursesTasks = await getTasksByCourse(courseId)

// Update task status
await updateTaskStatus(taskId, 'done')
```

### Row Level Security (RLS)

All data is protected by RLS policies. Users can only access their own courses and tasks:
```sql
-- Example RLS policy
create policy "Users can view their own courses"
  on public.courses for select
  using (auth.uid() = user_id);
```

To add new tables:
1. Create migration file in `supabase/migrations/`
2. Enable RLS on table
3. Add policies for select, insert, update, delete
4. Add `user_id` foreign key to `auth.users`

## Authentication

### Supabase Auth Flow

1. **Sign Up** (`/auth/sign-up`)
   ```typescript
   const { error } = await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'password123'
   })
   ```

2. **Log In** (`/auth/login`)
   ```typescript
   const { error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password123'
   })
   ```

3. **Get Current User** (Client)
   ```typescript
   const { data } = await supabase.auth.getUser()
   const user = data?.user
   ```

4. **Log Out** (Server Action)
   ```typescript
   await supabase.auth.signOut()
   ```

## Common Tasks

### Add a New Page

1. Create file at `app/your-page/page.tsx`
2. Import components and utilities:
   ```typescript
   import { Navigation } from '@/app/components/Navigation'
   import { LoadingSpinner } from '@/app/components/LoadingSpinner'
   import { ErrorAlert } from '@/app/components/ErrorAlert'
   ```
3. Use `'use client'` if you need interactivity
4. Add `export const dynamic = 'force-dynamic'` for real-time data

### Add a New Database Table

1. Create migration in `supabase/migrations/` (e.g., `002_create_habits.sql`)
2. Enable RLS and add policies
3. Add helper functions in `lib/supabase/database.ts`
4. Push migration: `supabase db push`

### Create a Reusable Component

1. Create file in `app/components/` (e.g., `TaskCard.tsx`)
2. Export as default or named export
3. Use in other components:
   ```typescript
   import { TaskCard } from '@/app/components/TaskCard'
   ```

### Handle Loading and Errors

```typescript
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  async function load() {
    try {
      setLoading(true)
      // fetch data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  load()
}, [])

if (loading) return <LoadingSpinner />
if (error) return <ErrorAlert message={error} />
```

## Git Workflow

### Commit Messages
- Use clear, descriptive messages
- Format: `type: short description`
- Examples:
  - `feat: add task search and filtering`
  - `fix: resolve dashboard loading issue`
  - `docs: update README with setup instructions`

### Push to GitHub
```bash
git add .
git commit -m "your message"
git push origin main
```

### Vercel Auto-Deploy
- Pushing to `main` automatically triggers Vercel deployment
- Watch deployment: https://vercel.com/dashboard/your-account/studentlife-tracer-app

## Performance Tips

1. **Use Server Components** where possible (no `'use client'`)
2. **Optimize Images** — use Next.js Image component
3. **Lazy Load Components** — use `React.lazy()` for heavy components
4. **Cache Data** — use Supabase realtime for live updates
5. **Minimize Bundle** — avoid large dependencies

## Testing

### Manual Testing Checklist
- [ ] Sign up creates new user
- [ ] Login works with correct credentials
- [ ] Logout clears session
- [ ] Can create courses
- [ ] Can create tasks in courses
- [ ] Tasks appear in dashboard
- [ ] Can mark tasks complete
- [ ] Can delete courses (cascades tasks)
- [ ] Can delete tasks
- [ ] Dashboard stats are accurate
- [ ] Filters work correctly
- [ ] Mobile layout responsive

### Running Tests
```bash
# TypeScript check
npm run build

# Lint code
npm run lint

# Manual testing with dev server
npm run dev
```

## Debugging

### Enable Debug Logging
```typescript
// In browser console
localStorage.setItem('DEBUG', 'supabase:*')
```

### Check Supabase Logs
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Logs" in left sidebar
4. View API calls and errors

### Common Issues

**"Supabase connection failed"**
- Check `.env.local` has correct URL and key
- Verify project is active in Supabase
- Restart dev server

**"User can't see their data"**
- Check RLS policies
- Verify `user_id` in tables matches `auth.uid()`
- Test with different user accounts

**"Build fails on Vercel"**
- Verify environment variables on Vercel
- Check TypeScript: `npm run build`
- Clear Vercel cache and redeploy

## Deployment Checklist

Before pushing to production:
- [ ] All TypeScript compiles: `npm run build`
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Tested on multiple browsers
- [ ] Mobile responsive
- [ ] Environment variables set on Vercel
- [ ] RLS policies are correct
- [ ] Tested signup → use app → logout flow

## Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contributing

See GitHub issues for tasks to work on. When ready to contribute:
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test
3. Commit with clear messages
4. Push to your branch
5. Create pull request on GitHub

---

Questions? Check the README.md or open an issue on GitHub.
