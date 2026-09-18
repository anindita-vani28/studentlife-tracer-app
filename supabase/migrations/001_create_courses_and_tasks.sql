-- Create courses table
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text default '#3B82F6',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('assignment', 'exam', 'other')),
  due_date timestamp with time zone not null,
  status text not null default 'pending' check (status in ('pending', 'done')),
  difficulty text default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on courses table
alter table public.courses enable row level security;

-- RLS policy: users can only see their own courses
create policy "Users can view their own courses"
  on public.courses for select
  using (auth.uid() = user_id);

-- RLS policy: users can insert their own courses
create policy "Users can insert their own courses"
  on public.courses for insert
  with check (auth.uid() = user_id);

-- RLS policy: users can update their own courses
create policy "Users can update their own courses"
  on public.courses for update
  using (auth.uid() = user_id);

-- RLS policy: users can delete their own courses
create policy "Users can delete their own courses"
  on public.courses for delete
  using (auth.uid() = user_id);

-- Enable RLS on tasks table
alter table public.tasks enable row level security;

-- RLS policy: users can only see their own tasks
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

-- RLS policy: users can insert their own tasks
create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

-- RLS policy: users can update their own tasks
create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

-- RLS policy: users can delete their own tasks
create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Create indexes for better query performance
create index idx_courses_user_id on public.courses(user_id);
create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_course_id on public.tasks(course_id);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_status on public.tasks(status);
