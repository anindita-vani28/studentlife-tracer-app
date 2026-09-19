import { createClient } from './client'

export type Course = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  user_id: string
  course_id: string
  title: string
  description: string | null
  type: 'assignment' | 'exam' | 'other'
  due_date: string
  status: 'pending' | 'done'
  difficulty: 'easy' | 'medium' | 'hard'
  created_at: string
  updated_at: string
}

export async function getCourses(): Promise<Course[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function addCourse(name: string, color: string): Promise<Course> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses')
    .insert([{ name, color }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCourse(id: string, name: string, color: string): Promise<Course> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses')
    .update({ name, color, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCourse(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('courses').delete().eq('id', id)

  if (error) throw error
}

export async function getTasks(): Promise<Task[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getTasksByCourse(courseId: string): Promise<Task[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('course_id', courseId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function addTask(
  courseId: string,
  title: string,
  description: string | null,
  type: 'assignment' | 'exam' | 'other',
  dueDate: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Task> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ course_id: courseId, title, description, type, due_date: dueDate, difficulty }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(
  id: string,
  title: string,
  description: string | null,
  type: 'assignment' | 'exam' | 'other',
  dueDate: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Task> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .update({ title, description, type, due_date: dueDate, difficulty, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTaskStatus(id: string, status: 'pending' | 'done'): Promise<Task> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) throw error
}

export type MoodLog = {
  id: string
  user_id: string
  mood: string
  energy_level: number | null
  stress_level: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type UserPreferences = {
  id: string
  user_id: string
  location: string | null
  weather_api_key: string | null
  preferred_study_duration: number
  preferred_break_duration: number
  enable_weather_recommendations: boolean
  enable_mood_recommendations: boolean
  created_at: string
  updated_at: string
}

export async function logMood(
  mood: string,
  energyLevel?: number,
  stressLevel?: number,
  notes?: string
): Promise<MoodLog> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mood_log')
    .insert([{ mood, energy_level: energyLevel || null, stress_level: stressLevel || null, notes: notes || null }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getLatestMood(): Promise<MoodLog | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mood_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error
  return (data && data.length > 0) ? data[0] : null
}

export async function getMoodHistory(days: number = 7): Promise<MoodLog[]> {
  const supabase = createClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('mood_log')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(1)

  if (error) throw error
  return (data && data.length > 0) ? data[0] : null
}

export async function createOrUpdateUserPreferences(
  location?: string,
  preferredStudyDuration?: number,
  preferredBreakDuration?: number,
  enableWeatherRecommendations?: boolean,
  enableMoodRecommendations?: boolean
): Promise<UserPreferences> {
  const supabase = createClient()
  const preferences = {
    location: location || null,
    preferred_study_duration: preferredStudyDuration || 60,
    preferred_break_duration: preferredBreakDuration || 15,
    enable_weather_recommendations: enableWeatherRecommendations !== false,
    enable_mood_recommendations: enableMoodRecommendations !== false,
  }

  const existing = await getUserPreferences()

  if (existing) {
    const { data, error } = await supabase
      .from('user_preferences')
      .update({ ...preferences, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert([preferences])
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export type Habit = {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string
  goal_value: number
  goal_unit: string
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type HabitLog = {
  id: string
  user_id: string
  habit_id: string
  log_date: string
  value: number
  notes: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export async function getHabits(activeOnly: boolean = true): Promise<Habit[]> {
  const supabase = createClient()
  let query = supabase.from('habits').select('*').order('created_at', { ascending: false })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function addHabit(
  name: string,
  category: string,
  goalValue: number,
  goalUnit: string,
  description?: string,
  color?: string
): Promise<Habit> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('habits')
    .insert([{ name, category, goal_value: goalValue, goal_unit: goalUnit, description: description || null, color: color || '#3B82F6' }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateHabit(
  id: string,
  name: string,
  category: string,
  goalValue: number,
  goalUnit: string,
  description?: string,
  color?: string,
  isActive?: boolean
): Promise<Habit> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('habits')
    .update({
      name,
      category,
      goal_value: goalValue,
      goal_unit: goalUnit,
      description: description || null,
      color: color || '#3B82F6',
      is_active: isActive !== undefined ? isActive : true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteHabit(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('habits').delete().eq('id', id)

  if (error) throw error
}

export async function logHabit(habitId: string, value: number, logDate?: string, notes?: string): Promise<HabitLog> {
  const supabase = createClient()
  const date = logDate || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('habit_logs')
    .upsert([
      {
        habit_id: habitId,
        log_date: date,
        value,
        notes: notes || null,
        completed: true,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getHabitLogs(habitId: string, daysBack: number = 30): Promise<HabitLog[]> {
  const supabase = createClient()
  const since = new Date()
  since.setDate(since.getDate() - daysBack)

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .gte('log_date', since.toISOString().split('T')[0])
    .order('log_date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getHabitStreak(habitId: string): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('habit_logs')
    .select('log_date')
    .eq('habit_id', habitId)
    .eq('completed', true)
    .order('log_date', { ascending: false })

  if (error) throw error

  if (!data || data.length === 0) return 0

  let streak = 0
  let expectedDate = new Date()
  expectedDate.setHours(0, 0, 0, 0)

  for (const log of data) {
    const logDate = new Date(log.log_date)
    logDate.setHours(0, 0, 0, 0)

    const daysDiff = (expectedDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)

    if (daysDiff === 0) {
      streak++
      expectedDate.setDate(expectedDate.getDate() - 1)
    } else if (daysDiff === 1) {
      streak++
      expectedDate.setDate(expectedDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export type Expense = {
  id: string
  user_id: string
  category: string
  description: string
  amount: number
  currency: string
  purchase_date: string
  vendor: string | null
  notes: string | null
  receipt_url: string | null
  created_at: string
  updated_at: string
}

export type ExpenseCategory = {
  id: string
  user_id: string
  name: string
  color: string
  is_predefined: boolean
  created_at: string
}

export async function getExpenses(monthsBack?: number): Promise<Expense[]> {
  const supabase = createClient()
  let query = supabase.from('expenses').select('*').order('purchase_date', { ascending: false })

  if (monthsBack) {
    const since = new Date()
    since.setMonth(since.getMonth() - monthsBack)
    query = query.gte('purchase_date', since.toISOString().split('T')[0])
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function addExpense(
  category: string,
  description: string,
  amount: number,
  purchaseDate: string,
  vendor?: string,
  notes?: string,
  currency?: string
): Promise<Expense> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      category,
      description,
      amount,
      purchase_date: purchaseDate,
      vendor: vendor || null,
      notes: notes || null,
      currency: currency || 'USD',
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExpense(
  id: string,
  category: string,
  description: string,
  amount: number,
  purchaseDate: string,
  vendor?: string,
  notes?: string,
  currency?: string
): Promise<Expense> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('expenses')
    .update({
      category,
      description,
      amount,
      purchase_date: purchaseDate,
      vendor: vendor || null,
      notes: notes || null,
      currency: currency || 'USD',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) throw error
}

export async function getExpenseStats(): Promise<{ total: number; byCategory: Record<string, number> }> {
  const supabase = createClient()
  const { data, error } = await supabase.from('expenses').select('amount, category')

  if (error) throw error

  const total = (data || []).reduce((sum, exp) => sum + exp.amount, 0)
  const byCategory = (data || []).reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {})

  return { total, byCategory }
}

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .order('is_predefined', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export type CareerGoal = {
  id: string
  user_id: string
  career_title: string
  target_salary: number
  expected_salary_after_5yr: number
  industry: string | null
  location: string | null
  graduation_year: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type SalaryData = {
  id: string
  career_title: string
  industry: string | null
  entry_level_salary: number | null
  mid_level_salary: number | null
  senior_level_salary: number | null
  country: string
  year_updated: number | null
  created_at: string
}

export type EducationROI = {
  totalInvested: number
  targetSalary: number
  monthsToBreakEven: number
  breakEvenSalary: number
  yearlyROI: number
  careySalaryMultiplier: number
  investmentCategory: 'excellent' | 'good' | 'fair' | 'needs-review'
}

export async function getCareerGoal(): Promise<CareerGoal | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('career_goals').select('*').limit(1)

  if (error) throw error
  return (data && data.length > 0) ? data[0] : null
}

export async function setCareerGoal(
  careerTitle: string,
  targetSalary: number,
  expectedSalaryAfter5yr?: number,
  industry?: string,
  location?: string,
  graduationYear?: number,
  notes?: string
): Promise<CareerGoal> {
  const supabase = createClient()
  const existing = await getCareerGoal()

  const data = {
    career_title: careerTitle,
    target_salary: targetSalary,
    expected_salary_after_5yr: expectedSalaryAfter5yr || targetSalary * 1.3,
    industry: industry || null,
    location: location || null,
    graduation_year: graduationYear || null,
    notes: notes || null,
  }

  if (existing) {
    const { data: result, error } = await supabase
      .from('career_goals')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return result
  } else {
    const { data: result, error } = await supabase
      .from('career_goals')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return result
  }
}

export async function getSalaryData(careerTitle?: string): Promise<SalaryData[]> {
  const supabase = createClient()
  let query = supabase.from('salary_data').select('*')

  if (careerTitle) {
    query = query.ilike('career_title', `%${careerTitle}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function calculateEducationROI(totalInvested: number, targetSalary: number): Promise<EducationROI> {
  // Calculate months to break even
  const monthlyIncome = targetSalary / 12
  const monthsToBreakEven = Math.ceil(totalInvested / monthlyIncome)

  // Calculate yearly ROI percentage
  const yearlyROI = ((targetSalary - 0) / totalInvested) * 100

  // Calculate career salary multiplier
  const careySalaryMultiplier = Math.round((targetSalary * 40) / totalInvested * 100) / 100 // 40 year career

  // Determine investment category
  let investmentCategory: 'excellent' | 'good' | 'fair' | 'needs-review'
  if (monthsToBreakEven <= 12) {
    investmentCategory = 'excellent'
  } else if (monthsToBreakEven <= 24) {
    investmentCategory = 'good'
  } else if (monthsToBreakEven <= 36) {
    investmentCategory = 'fair'
  } else {
    investmentCategory = 'needs-review'
  }

  return {
    totalInvested,
    targetSalary,
    monthsToBreakEven,
    breakEvenSalary: Math.round(totalInvested),
    yearlyROI: Math.round(yearlyROI),
    careySalaryMultiplier,
    investmentCategory,
  }
}

// ============================================================================
// INTERNSHIP APPLICATION TRACKER
// ============================================================================

export type InternshipApplication = {
  id: string
  user_id: string
  company_name: string
  position_title: string
  location: string | null
  application_date: string
  deadline: string | null
  status: 'interested' | 'applied' | 'resume_submitted' | 'hr_screening' | 'interview' | 'offer' | 'accepted' | 'rejected' | 'withdrawn'
  interview_stage: 'technical' | 'behavioral' | 'final' | null
  hr_contact_name: string | null
  hr_contact_email: string | null
  hr_contact_phone: string | null
  job_posting_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type InternshipFollowUp = {
  id: string
  user_id: string
  application_id: string
  reminder_date: string
  reminder_text: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export async function getInternshipApplications(): Promise<InternshipApplication[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('internship_applications')
    .select('*')
    .order('application_date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function addInternshipApplication(application: Omit<InternshipApplication, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<InternshipApplication> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('internship_applications')
    .insert([application])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateInternshipApplication(id: string, updates: Partial<InternshipApplication>): Promise<InternshipApplication> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('internship_applications')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteInternshipApplication(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('internship_applications').delete().eq('id', id)

  if (error) throw error
}

export async function getInternshipFollowUps(applicationId?: string): Promise<InternshipFollowUp[]> {
  const supabase = createClient()
  let query = supabase.from('internship_follow_ups').select('*')

  if (applicationId) {
    query = query.eq('application_id', applicationId)
  }

  const { data, error } = await query.order('reminder_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function addInternshipFollowUp(followUp: Omit<InternshipFollowUp, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<InternshipFollowUp> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('internship_follow_ups')
    .insert([followUp])
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// STUDENT OPPORTUNITY HUB
// ============================================================================

export type Opportunity = {
  id: string
  title: string
  organizer: string
  category: 'hackathon' | 'coding_competition' | 'olympiad' | 'scholarship' | 'research' | 'volunteering' | 'conference' | 'internship' | 'workshop'
  eligibility: string | null
  registration_opens: string | null
  deadline: string
  event_date: string | null
  event_type: 'online' | 'in_person' | 'hybrid' | null
  location: string | null
  cost_amount: number
  cost_currency: string
  official_url: string | null
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export type SavedOpportunity = {
  id: string
  user_id: string
  opportunity_id: string
  saved_at: string
}

export async function getOpportunities(category?: string): Promise<Opportunity[]> {
  const supabase = createClient()
  let query = supabase.from('opportunities').select('*')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query.order('deadline', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getSavedOpportunities(): Promise<(Opportunity & { saved_at: string })[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('saved_opportunities')
    .select('opportunity_id, saved_at, opportunities(*)')
    .order('saved_at', { ascending: false })

  if (error) throw error
  return (data || []).map((item: any) => ({ ...item.opportunities, saved_at: item.saved_at }))
}

export async function saveOpportunity(opportunityId: string): Promise<SavedOpportunity> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('saved_opportunities')
    .insert([{ opportunity_id: opportunityId }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unsaveOpportunity(opportunityId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('saved_opportunities')
    .delete()
    .eq('opportunity_id', opportunityId)

  if (error) throw error
}

// ============================================================================
// STUDENT DISCUSSION
// ============================================================================

export type DiscussionPost = {
  id: string
  user_id: string
  title: string
  description: string
  tags: string[]
  view_count: number
  created_at: string
  updated_at: string
}

export type DiscussionComment = {
  id: string
  post_id: string
  user_id: string
  content: string
  upvotes: number
  created_at: string
  updated_at: string
}

export async function getDiscussionPosts(): Promise<DiscussionPost[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('discussion_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getDiscussionPost(id: string): Promise<DiscussionPost | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('discussion_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createDiscussionPost(title: string, description: string, tags: string[] = []): Promise<DiscussionPost> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('discussion_posts')
    .insert([{ title, description, tags }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDiscussionComments(postId: string): Promise<DiscussionComment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('discussion_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createDiscussionComment(postId: string, content: string): Promise<DiscussionComment> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('discussion_comments')
    .insert([{ post_id: postId, content }])
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// CURATED MOVIES
// ============================================================================

export type CuratedMovie = {
  id: string
  title: string
  year: number | null
  genre: string[]
  description: string | null
  why_students_like: string | null
  poster_url: string | null
  imdb_url: string | null
  duration_minutes: number | null
  rating: number | null
  categories: string[]
  created_at: string
}

export type MovieWatchlistItem = {
  id: string
  user_id: string
  movie_id: string
  status: 'want_to_watch' | 'watching' | 'watched'
  rating: number | null
  notes: string | null
  added_at: string
  watched_at: string | null
}

export async function getCuratedMovies(category?: string): Promise<CuratedMovie[]> {
  const supabase = createClient()
  let query = supabase.from('curated_movies').select('*')

  if (category) {
    query = query.contains('categories', [category])
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getMovieWatchlist(): Promise<(MovieWatchlistItem & { movie: CuratedMovie })[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('movie_watchlist')
    .select('*, curated_movies(*)')
    .order('added_at', { ascending: false })

  if (error) throw error
  return (data || []).map((item: any) => ({ ...item, movie: item.curated_movies }))
}

export async function addToMovieWatchlist(movieId: string, status: 'want_to_watch' | 'watching' | 'watched' = 'want_to_watch'): Promise<MovieWatchlistItem> {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (!user || userError) throw new Error('Must be logged in to add to watchlist')
  
  const { data, error } = await supabase
    .from('movie_watchlist')
    .insert([{ user_id: user.id, movie_id: movieId, status }])
    .select()
    .single()

  if (error) throw error
  return data
}
export async function updateMovieWatchlistItem(movieId: string, updates: Partial<Omit<MovieWatchlistItem, 'id' | 'user_id' | 'movie_id' | 'added_at'>>): Promise<MovieWatchlistItem> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('movie_watchlist')
    .update(updates)
    .eq('movie_id', movieId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeFromMovieWatchlist(movieId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (!user || userError) throw new Error('Must be logged in to remove from watchlist')
  
  const { error } = await supabase
    .from('movie_watchlist')
    .delete()
    .eq('user_id', user.id)
    .eq('movie_id', movieId)

  if (error) throw error
}