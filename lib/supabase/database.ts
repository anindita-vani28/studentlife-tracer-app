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
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
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
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || null
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
