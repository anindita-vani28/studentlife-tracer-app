const https = require('https');

const SUPABASE_URL = 'shgvmwclcrhfdgovhdjb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoZ3Ztd2NsY3JoZmRnb3ZoZGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NjA0MTEsImV4cCI6MjEwNTMzNjQxMX0.NDqWYYUzYBJDDkstcC8J5z1vj4hc1081WcTubGxQ_ck';

const email = 'bhowmikanindita84@gmail.com';
const password = 'DummyPassword123!';

console.log('🌱 Seeding dummy data for:', email, '\n');

function signup() {
  console.log('📝 Signing up user...');
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });

    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/auth/v1/signup',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'apikey': ANON_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 || res.statusCode === 201) {
            const userId = response.user?.id || response.id;
            if (userId) {
              console.log('✅ User signed up:', userId, '\n');
              resolve({ userId, accessToken: response.session?.access_token || null });
            } else {
              console.log('⏱️  Rate limited - user may already exist. Trying login...\n');
              resolve(null);
            }
          } else if (res.statusCode === 429) {
            console.log('⏱️  Rate limited - user may already exist. Trying login...\n');
            resolve(null);
          } else {
            console.log('❌ Error:', res.statusCode, response.error_description || response.message);
            resolve(null);
          }
        } catch (e) {
          console.log('Error:', e.message);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log('Request error:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

function login() {
  console.log('🔑 Logging in user...');
  return new Promise((resolve) => {
    const postData = JSON.stringify({ email, password });

    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'apikey': ANON_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Logged in:', response.user.id, '\n');
            resolve({ userId: response.user.id, accessToken: response.access_token });
          } else {
            console.log('❌ Login failed:', res.statusCode, response.error_description);
            resolve(null);
          }
        } catch (e) {
          console.log('Error:', e.message);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log('Request error:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

function insertCourse(userId, accessToken, name, color) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ user_id: userId, name, color });

    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/rest/v1/courses',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'Authorization': `Bearer ${accessToken}`,
        'apikey': ANON_KEY,
        'Prefer': 'return=representation',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (Array.isArray(response) && response.length > 0) {
            console.log(`  ✓ ${name}`);
            resolve(response[0].id);
          } else {
            console.log(`  ✗ Failed: ${name}`);
            resolve(null);
          }
        } catch (e) {
          console.log(`  ✗ Error: ${name}`);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => resolve(null));
    req.write(postData);
    req.end();
  });
}

function insertTask(userId, accessToken, courseId, title, type, difficulty, dueDate) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      user_id: userId,
      course_id: courseId,
      title,
      description: `Complete this ${type}`,
      type,
      difficulty,
      due_date: dueDate,
      status: 'pending',
    });

    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/rest/v1/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'Authorization': `Bearer ${accessToken}`,
        'apikey': ANON_KEY,
        'Prefer': 'return=representation',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (Array.isArray(response) && response.length > 0) {
            console.log(`  ✓ ${title}`);
            resolve(true);
          } else {
            console.log(`  ✗ Failed: ${title}`);
            resolve(false);
          }
        } catch (e) {
          console.log(`  ✗ Error: ${title}`);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => resolve(false));
    req.write(postData);
    req.end();
  });
}

(async () => {
  try {
    let auth = await signup();

    if (!auth) {
      auth = await login();
    }

    if (!auth) {
      console.log('❌ Could not authenticate');
      return;
    }

    const { userId, accessToken } = auth;

    console.log('📚 Inserting courses...');
    const courses = [
      { name: 'Physics 101', color: '#3B82F6' },
      { name: 'Mathematics Advanced', color: '#EF4444' },
      { name: 'Chemistry Lab', color: '#10B981' },
      { name: 'English Literature', color: '#F59E0B' },
    ];

    const courseIds = [];
    for (const course of courses) {
      const id = await insertCourse(userId, accessToken, course.name, course.color);
      if (id) courseIds.push(id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (courseIds.length === 0) {
      console.log('❌ No courses created');
      return;
    }

    console.log('\n✏️  Inserting tasks...');
    const tasks = [
      { courseIdx: 0, title: 'Chapter 5 Assignment', type: 'assignment', difficulty: 'medium', daysFromNow: 2 },
      { courseIdx: 0, title: 'Midterm Exam', type: 'exam', difficulty: 'hard', daysFromNow: 7 },
      { courseIdx: 1, title: 'Problem Set 3', type: 'assignment', difficulty: 'hard', daysFromNow: 1 },
      { courseIdx: 1, title: 'Calculus Quiz', type: 'exam', difficulty: 'medium', daysFromNow: 5 },
      { courseIdx: 2, title: 'Lab Report', type: 'assignment', difficulty: 'medium', daysFromNow: 3 },
      { courseIdx: 2, title: 'Final Exam', type: 'exam', difficulty: 'hard', daysFromNow: 14 },
      { courseIdx: 3, title: 'Essay on Shakespeare', type: 'assignment', difficulty: 'easy', daysFromNow: 4 },
    ];

    for (const task of tasks) {
      const courseId = courseIds[task.courseIdx];
      if (courseId) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + task.daysFromNow);
        await insertTask(userId, accessToken, courseId, task.title, task.type, task.difficulty, dueDate.toISOString());
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    console.log('\n🎉 Dummy data created successfully!');
    console.log('\n📌 Next: Go to http://localhost:3000');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (e) {
    console.log('Fatal error:', e.message);
  }
})();
