const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://shgvmwclcrhfdgovhdjb.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZ3Ztd2NsY3JoZmRnb3ZoZGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTc2MDQxMSwiZXhwIjoyMTA1MzM2NDExfQ.ckGV7i5sZ9BKevMY2N0dZJkgVLOvjJE3TGSrPj2V3Xo';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const userId = 'bf0d5983-9bcc-44db-9330-e71234bf4536';

async function insertTestData() {
  try {
    console.log('🌱 Inserting test data for user:', userId, '\n');

    // 1. Courses
    console.log('📚 Inserting courses...');
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .insert([
        { user_id: userId, name: 'Physics 101', color: '#3B82F6' },
        { user_id: userId, name: 'Mathematics Advanced', color: '#EF4444' },
        { user_id: userId, name: 'Chemistry Lab', color: '#10B981' },
        { user_id: userId, name: 'English Literature', color: '#F59E0B' },
      ])
      .select();
    if (coursesError) throw coursesError;
    console.log(`✅ ${coursesData.length} courses\n`);

    // 2. Tasks
    console.log('✏️  Inserting tasks...');
    const tasks = [
      { courseId: coursesData[0].id, title: 'Chapter 5 Assignment', type: 'assignment', difficulty: 'medium', daysFromNow: 2 },
      { courseId: coursesData[0].id, title: 'Midterm Exam', type: 'exam', difficulty: 'hard', daysFromNow: 7 },
      { courseId: coursesData[1].id, title: 'Problem Set 3', type: 'assignment', difficulty: 'hard', daysFromNow: 1 },
      { courseId: coursesData[1].id, title: 'Calculus Quiz', type: 'exam', difficulty: 'medium', daysFromNow: 5 },
      { courseId: coursesData[2].id, title: 'Lab Report', type: 'assignment', difficulty: 'medium', daysFromNow: 3 },
      { courseId: coursesData[2].id, title: 'Final Exam', type: 'exam', difficulty: 'hard', daysFromNow: 14 },
      { courseId: coursesData[3].id, title: 'Essay on Shakespeare', type: 'assignment', difficulty: 'easy', daysFromNow: 4 },
    ];

    const tasksToInsert = tasks.map(t => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + t.daysFromNow);
      return {
        user_id: userId,
        course_id: t.courseId,
        title: t.title,
        description: `Complete this ${t.type}`,
        type: t.type,
        difficulty: t.difficulty,
        due_date: dueDate.toISOString(),
        status: 'pending',
      };
    });

    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();
    if (tasksError) throw tasksError;
    console.log(`✅ ${tasksData.length} tasks\n`);

    // 3. Habits
    console.log('🏋️  Inserting habits...');
    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .insert([
        { user_id: userId, name: 'Morning Exercise', category: 'exercise', goal_value: 30, goal_unit: 'minutes', color: '#EF4444', is_active: true },
        { user_id: userId, name: 'Study Hours', category: 'study_hours', goal_value: 2, goal_unit: 'hours', color: '#3B82F6', is_active: true },
        { user_id: userId, name: 'Sleep Goal', category: 'sleep', goal_value: 8, goal_unit: 'hours', color: '#8B5CF6', is_active: true },
        { user_id: userId, name: 'Reading', category: 'reading', goal_value: 20, goal_unit: 'pages', color: '#10B981', is_active: true },
        { user_id: userId, name: 'Meditation', category: 'meditation', goal_value: 15, goal_unit: 'minutes', color: '#14B8A6', is_active: true },
        { user_id: userId, name: 'Code Practice', category: 'coding', goal_value: 60, goal_unit: 'minutes', color: '#F59E0B', is_active: true },
      ])
      .select();
    if (habitsError) throw habitsError;
    console.log(`✅ ${habitsData.length} habits\n`);

    // 4. Habit Logs
    console.log('📊 Inserting habit logs (7 days)...');
    const habitLogs = [];
    for (let day = 0; day < 7; day++) {
      for (const habit of habitsData) {
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - day);
        let value = 30;
        if (habit.category === 'study_hours') value = 2;
        if (habit.category === 'sleep') value = 8;
        if (habit.category === 'reading') value = 20;
        if (habit.category === 'meditation') value = 15;
        if (habit.category === 'coding') value = 60;

        habitLogs.push({
          user_id: userId,
          habit_id: habit.id,
          log_date: logDate.toISOString().split('T')[0],
          value: value,
          completed: true,
        });
      }
    }

    const { error: logsError } = await supabase
      .from('habit_logs')
      .insert(habitLogs);
    if (logsError) throw logsError;
    console.log(`✅ ${habitLogs.length} habit logs\n`);

    // 5. Expenses
    console.log('💰 Inserting expenses...');
    const { error: expensesError } = await supabase
      .from('expenses')
      .insert([
        { user_id: userId, category: 'tuition', description: 'Fall Semester Tuition', amount: 5000.00, currency: 'USD', purchase_date: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0], vendor: 'University' },
        { user_id: userId, category: 'books', description: 'Physics Textbook', amount: 120.50, currency: 'USD', purchase_date: new Date(Date.now() - 25*24*60*60*1000).toISOString().split('T')[0], vendor: 'Amazon' },
        { user_id: userId, category: 'books', description: 'Calculus Textbook', amount: 95.00, currency: 'USD', purchase_date: new Date(Date.now() - 25*24*60*60*1000).toISOString().split('T')[0], vendor: 'Barnes & Noble' },
        { user_id: userId, category: 'tech', description: 'Scientific Calculator', amount: 45.99, currency: 'USD', purchase_date: new Date(Date.now() - 20*24*60*60*1000).toISOString().split('T')[0], vendor: 'Best Buy' },
        { user_id: userId, category: 'lab', description: 'Lab Notebook & Supplies', amount: 25.00, currency: 'USD', purchase_date: new Date(Date.now() - 15*24*60*60*1000).toISOString().split('T')[0], vendor: 'Campus Store' },
        { user_id: userId, category: 'transport', description: 'Monthly Transit Pass', amount: 80.00, currency: 'USD', purchase_date: new Date(Date.now() - 10*24*60*60*1000).toISOString().split('T')[0], vendor: 'Transit Authority' },
        { user_id: userId, category: 'software', description: 'MATLAB License', amount: 60.00, currency: 'USD', purchase_date: new Date(Date.now() - 5*24*60*60*1000).toISOString().split('T')[0], vendor: 'MathWorks' },
        { user_id: userId, category: 'exams', description: 'SAT Test Fee', amount: 200.00, currency: 'USD', purchase_date: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0], vendor: 'College Board' },
      ]);
    if (expensesError) throw expensesError;
    console.log('✅ 8 expenses\n');

    // 6. Mood
    console.log('😊 Inserting mood...');
    const { error: moodError } = await supabase
      .from('mood_log')
      .insert([
        { user_id: userId, mood: 'motivated', energy_level: 4, stress_level: 3, notes: 'Feeling great!' }
      ]);
    if (moodError) throw moodError;
    console.log('✅ Mood logged\n');

    // 7. Career Goal
    console.log('🎯 Inserting career goal...');
    const { error: careerError } = await supabase
      .from('career_goals')
      .insert([{
        user_id: userId,
        career_title: 'Software Engineer',
        target_salary: 70000,
        expected_salary_after_5yr: 100000,
        industry: 'Technology',
        location: 'San Francisco, CA',
        graduation_year: 2027,
      }]);
    if (careerError) throw careerError;
    console.log('✅ Career goal set\n');

    console.log('════════════════════════════════════════');
    console.log('🎉 ALL TEST DATA INSERTED!');
    console.log('════════════════════════════════════════\n');
    console.log('Refresh http://localhost:3000 to see it!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertTestData();
