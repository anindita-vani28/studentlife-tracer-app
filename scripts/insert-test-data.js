const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://shgvmwclcrhfdgovhdjb.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZ3Ztd2NsY3JoZmRnb3ZoZGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTc2MDQxMSwiZXhwIjoyMTA1MzM2NDExfQ.ckGV7i5sZ9BKevMY2N0dZJkgVLOvjJE3TGSrPj2V3Xo';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function insertTestData() {
  try {
    console.log('🌱 Starting test data insertion...\n');

    // Step 1: Get user ID
    console.log('📍 Finding user: bhowmikanindita84@gmail.com');
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) throw userError;

    const user = users.users.find(u => u.email === 'bhowmikanindita84@gmail.com');
    if (!user) {
      console.error('❌ User not found');
      return;
    }

    const userId = user.id;
    console.log(`✅ Found user: ${userId}\n`);

    // Step 2: Insert Courses
    console.log('📚 Inserting courses...');
    const courses = [
      { name: 'Physics 101', color: '#3B82F6' },
      { name: 'Mathematics Advanced', color: '#EF4444' },
      { name: 'Chemistry Lab', color: '#10B981' },
      { name: 'English Literature', color: '#F59E0B' },
    ];

    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .insert(courses.map(c => ({ user_id: userId, ...c })))
      .select();

    if (coursesError) throw coursesError;
    console.log(`✅ Inserted ${coursesData.length} courses\n`);

    // Step 3: Insert Tasks
    console.log('✏️ Inserting tasks...');
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
    console.log(`✅ Inserted ${tasksData.length} tasks\n`);

    // Step 4: Insert Habits
    console.log('🏋️ Inserting habits...');
    const habits = [
      { name: 'Morning Exercise', category: 'exercise', goal_value: 30, goal_unit: 'minutes', color: '#EF4444' },
      { name: 'Study Hours', category: 'study_hours', goal_value: 2, goal_unit: 'hours', color: '#3B82F6' },
      { name: 'Sleep Goal', category: 'sleep', goal_value: 8, goal_unit: 'hours', color: '#8B5CF6' },
      { name: 'Reading', category: 'reading', goal_value: 20, goal_unit: 'pages', color: '#10B981' },
      { name: 'Meditation', category: 'meditation', goal_value: 15, goal_unit: 'minutes', color: '#14B8A6' },
      { name: 'Code Practice', category: 'coding', goal_value: 60, goal_unit: 'minutes', color: '#F59E0B' },
    ];

    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .insert(habits.map(h => ({ user_id: userId, is_active: true, ...h })))
      .select();

    if (habitsError) throw habitsError;
    console.log(`✅ Inserted ${habitsData.length} habits\n`);

    // Step 5: Insert Habit Logs (7 days)
    console.log('📊 Inserting habit logs (7 days)...');
    const habitLogs = [];
    for (let day = 0; day < 7; day++) {
      for (const habit of habitsData) {
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - day);

        let value = 1;
        if (habit.category === 'exercise') value = 30;
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

    const { data: logsData, error: logsError } = await supabase
      .from('habit_logs')
      .insert(habitLogs)
      .select();

    if (logsError) throw logsError;
    console.log(`✅ Inserted ${logsData?.length || habitLogs.length} habit logs\n`);

    // Step 6: Insert Expenses
    console.log('💰 Inserting expenses...');
    const expenses = [
      { category: 'tuition', description: 'Fall Semester Tuition', amount: 5000.00, days_ago: 30, vendor: 'University' },
      { category: 'books', description: 'Physics Textbook', amount: 120.50, days_ago: 25, vendor: 'Amazon' },
      { category: 'books', description: 'Calculus Textbook', amount: 95.00, days_ago: 25, vendor: 'Barnes & Noble' },
      { category: 'tech', description: 'Scientific Calculator', amount: 45.99, days_ago: 20, vendor: 'Best Buy' },
      { category: 'lab', description: 'Lab Notebook & Supplies', amount: 25.00, days_ago: 15, vendor: 'Campus Store' },
      { category: 'transport', description: 'Monthly Transit Pass', amount: 80.00, days_ago: 10, vendor: 'Transit Authority' },
      { category: 'software', description: 'MATLAB License', amount: 60.00, days_ago: 5, vendor: 'MathWorks' },
      { category: 'exams', description: 'SAT Test Fee', amount: 200.00, days_ago: 2, vendor: 'College Board' },
    ];

    const expensesToInsert = expenses.map(e => {
      const date = new Date();
      date.setDate(date.getDate() - e.days_ago);
      return {
        user_id: userId,
        category: e.category,
        description: e.description,
        amount: e.amount,
        currency: 'USD',
        purchase_date: date.toISOString().split('T')[0],
        vendor: e.vendor,
      };
    });

    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .insert(expensesToInsert)
      .select();

    if (expensesError) throw expensesError;
    console.log(`✅ Inserted ${expensesData.length} expenses\n`);

    // Step 7: Insert Mood Log
    console.log('😊 Inserting mood logs...');
    const moods = [
      { mood: 'motivated', energy_level: 4, stress_level: 3, notes: 'Feeling great about starting semester' },
      { mood: 'energetic', energy_level: 5, stress_level: 2, notes: 'Great study session today' },
      { mood: 'focused', energy_level: 4, stress_level: 2, notes: 'Good productivity' },
    ];

    const { data: moodData, error: moodError } = await supabase
      .from('mood_log')
      .insert(moods.map((m, i) => ({
        user_id: userId,
        ...m,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      })))
      .select();

    if (moodError) throw moodError;
    console.log(`✅ Inserted ${moodData.length} mood logs\n`);

    // Step 8: Insert Career Goal
    console.log('🎯 Inserting career goal...');
    const { data: careerData, error: careerError } = await supabase
      .from('career_goals')
      .insert([{
        user_id: userId,
        career_title: 'Software Engineer',
        target_salary: 70000,
        expected_salary_after_5yr: 100000,
        industry: 'Technology',
        location: 'San Francisco, CA',
        graduation_year: 2027,
        notes: 'Full-stack development. Target: Google, Microsoft, Apple',
      }])
      .select();

    if (careerError) throw careerError;
    console.log(`✅ Inserted career goal\n`);

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('🎉 TEST DATA INSERTION COMPLETE!');
    console.log('═══════════════════════════════════════════\n');
    console.log('📊 Summary:');
    console.log(`  ✅ 4 Courses`);
    console.log(`  ✅ 7 Tasks`);
    console.log(`  ✅ 6 Habits`);
    console.log(`  ✅ 42 Habit Logs (7 days × 6 habits)`);
    console.log(`  ✅ 8 Expenses ($5,626.49 total)`);
    console.log(`  ✅ 3 Mood Logs`);
    console.log(`  ✅ 1 Career Goal\n`);
    console.log('🌐 Go to http://localhost:3000 and refresh!');
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertTestData();
