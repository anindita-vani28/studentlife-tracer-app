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
