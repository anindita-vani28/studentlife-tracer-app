# Student Life AI Assistant

A comprehensive web application and browser extension designed to help students manage their academic life more effectively through AI-powered recommendations, study tracking, and smart productivity tools.

**Live Demo**: [Deploy to Vercel](#deployment) (See VERCEL_DEPLOYMENT.md)

## 🎯 Current Features (Foundation Milestone - v0.1)

### ✅ Study Planner
- **Courses Management**: Create, edit, and organize courses with custom colors
- **Task Management**: Add assignments, exams, and other tasks with due dates
- **Task Tracking**: Mark tasks as complete/incomplete with visual status
- **Difficulty Levels**: Tag tasks as easy, medium, or hard

### ✅ Intelligent Dashboard
- **Study Streaks**: Track consecutive days of completed tasks 🔥
- **Completion Metrics**: View overall completion rate and progress
- **Next Exam Widget**: See your upcoming exam with countdown
- **Overdue Tracking**: Quick view of overdue tasks to stay on top
- **Course Progress**: Visual progress bars for each course
- **Quick Views**: Today's tasks and this week's upcoming work

### ✅ Authentication
- Email/password signup and login
- Secure session management with Supabase
- Logout functionality
- Protected routes

### ✅ Data Privacy
- Row Level Security (RLS) on all data
- Users can only access their own courses and tasks
- Secure Supabase database backend

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React, TypeScript | Full-stack React framework with App Router |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework |
| **Database** | Supabase (PostgreSQL) | Backend database with real-time support |
| **Auth** | Supabase Auth | Email/password authentication |
| **Deployment** | Vercel | Free serverless hosting |

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Home page (redirects to auth/dashboard)
│   ├── components/             # Reusable React components
│   │   ├── Navigation.tsx       # Top navigation bar
│   │   ├── ErrorAlert.tsx       # Error notification
│   │   ├── LoadingSpinner.tsx   # Loading state
│   │   └── EmptyState.tsx       # Empty state UI
│   ├── auth/
│   │   ├── login/page.tsx       # Login page
│   │   └── sign-up/page.tsx     # Signup page
│   ├── dashboard/page.tsx       # Main dashboard with analytics
│   ├── courses/page.tsx         # Course management page
│   ├── tasks/page.tsx           # Task management page
│   ├── actions/
│   │   └── auth.ts              # Server actions (logout)
│   └── globals.css              # Global styles
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   ├── server.ts            # Server Supabase client
│   │   └── database.ts          # Database queries
│   └── utils.ts                 # Utility functions
├── supabase/
│   └── migrations/
│       └── 001_create_courses_and_tasks.sql  # Database schema
├── public/                      # Static assets
├── .env.local                   # Environment variables (git-ignored)
├── .env.local.example           # Environment template (committed)
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind config
├── next.config.js               # Next.js config
├── vercel.json                  # Vercel deployment config
├── PROGRESS.md                  # Implementation progress tracker
├── VERCEL_DEPLOYMENT.md         # Deployment guide
└── package.json                 # Dependencies
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- A Supabase project (free tier at https://supabase.com)

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/anindita-vani28/studentlife-tracer-app.git
cd studentlife-tracer-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

### First Time Setup

1. Sign up with your email at `/auth/sign-up`
2. Log in at `/auth/login`
3. Create your first course at `/courses`
4. Add tasks to your course at `/tasks`
5. View your dashboard at `/dashboard`

## 📖 Usage Guide

### Managing Courses
1. Go to **Courses** page
2. Click **Add Course**
3. Enter course name and pick a color
4. Click **Save Course**
5. Edit or delete courses using the buttons on each course card

### Managing Tasks
1. Go to **Tasks** page
2. Click **Add Task**
3. Select a course, enter title, type (assignment/exam/other)
4. Set due date and difficulty level
5. Click **Save Task**
6. Mark tasks complete using the checkbox
7. Edit or delete tasks as needed

### Dashboard Analytics
- **Study Streak 🔥**: Number of consecutive days with completed tasks
- **Completion Rate**: Percentage of tasks you've completed
- **Due Today**: Tasks with today's due date
- **Due This Week**: Upcoming tasks in the next 7 days
- **Course Progress**: Visual progress bar for each course
- **Next Exam**: Countdown to your nearest exam

## 🚢 Deployment

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy** (with Vercel):
1. Push code to GitHub (already set up)
2. Go to https://vercel.com/dashboard
3. Import this GitHub repo
4. Add environment variables
5. Click Deploy

Live URL will be provided after deployment.

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Reinstall dependencies
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

### Supabase connection errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check Supabase project is active
- Verify RLS policies allow your role

### Build failures on Vercel
- Check environment variables are set on Vercel dashboard
- Verify all dependencies installed: `npm install`
- Clear Vercel build cache and redeploy

## 🎯 Roadmap

### Current (v0.1) ✅
- Study Planner (Courses & Tasks)
- Dashboard with analytics
- Authentication
- Database schema

### Next (v0.5)
- Mood/weather-aware AI recommendations
- Habit tracking system
- Expense tracker
- AI tutor integration

### Future (v1.0+)
- Real-time chat/study groups
- Browser extension
- Career ROI calculator
- Advanced analytics
- Mobile app

## 📚 Database Schema

### courses table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key to auth.users)
- name (TEXT, not null)
- color (TEXT, default '#3B82F6')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### tasks table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key to auth.users)
- course_id (UUID, foreign key to courses)
- title (TEXT, not null)
- description (TEXT, nullable)
- type (TEXT: 'assignment' | 'exam' | 'other')
- due_date (TIMESTAMP)
- status (TEXT: 'pending' | 'done')
- difficulty (TEXT: 'easy' | 'medium' | 'hard')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

All tables have RLS policies: users can only access their own data.

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- Secure authentication via Supabase Auth
- Environment variables protected (.env.local git-ignored)
- Anon key only has access to user's own data
- Server-side auth checks on protected routes

## 🙋 Support & Contributing

For issues, feature requests, or contributions:
1. Open an issue on GitHub
2. Create a pull request with changes
3. Check the PROGRESS.md for development status

## 📝 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for students everywhere**

Last Updated: 2026-09-18  
Version: 0.1 (Foundation Milestone)
