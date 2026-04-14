import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  const TEST_EMAIL = 'test@example.com';
  const TEST_PASSWORD = 'Password123';

  console.log(`🔍 Checking if test user ${TEST_EMAIL} exists...`);

  // 1. Find or Create Auth User
  let userId: string;
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Error listing users:', listError);
    return;
  }

  const existingUser = users.users.find(u => u.email === TEST_EMAIL);

  if (existingUser) {
    userId = existingUser.id;
    console.log(`✅ User exists with ID: ${userId}`);
  } else {
    console.log(`➕ Creating new test user...`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true
    });

    if (createError) {
      console.error('❌ Error creating user:', createError);
      return;
    }
    userId = newUser.user.id;
    console.log(`✅ User created with ID: ${userId}`);
  }

  // 2. Create/Update Profile
  console.log('👤 Updating profile...');
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: 'Test Candidate',
      email: TEST_EMAIL,
      location: 'San Francisco, CA',
      linkedin_url: 'https://linkedin.com/in/test-candidate',
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('❌ Error seeding profile:', profileError);
    return;
  }

  // 3. Clear existing applications (Clean Slate)
  console.log('🧹 Cleaning old test data...');
  await supabase.from('job_applications').delete().eq('user_id', userId);

  // 4. Create Mock Applications
  console.log('📦 Seeding fresh applications...');
  const mockApps = [
    {
      user_id: userId,
      job_url: 'https://indeed.com/viewjob?jk=123',
      portal_name: 'indeed',
      job_title: 'Senior Frontend Engineer',
      company_name: 'TechCorp',
      status: 'submitted',
      applied_at: new Date().toISOString(),
    },
    {
      user_id: userId,
      job_url: 'https://glassdoor.com/job/456',
      portal_name: 'glassdoor',
      job_title: 'Full Stack Developer',
      company_name: 'Startup Inc',
      status: 'failed',
      error_message: 'Captcha failed multiple times',
    },
    {
      user_id: userId,
      job_url: 'https://wellfound.com/jobs/789',
      portal_name: 'wellfound',
      job_title: 'Backend Node.js Engineer',
      company_name: 'Web3 Solutions',
      status: 'queued',
    },
    {
      user_id: userId,
      job_url: 'https://indeed.com/viewjob?jk=999',
      portal_name: 'indeed',
      job_title: 'Lead Architect',
      company_name: 'Legacy Systems',
      status: 'submitted',
      applied_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      user_id: userId,
      job_url: 'https://glassdoor.com/job/000',
      portal_name: 'glassdoor',
      job_title: 'Junior UI/UX Designer',
      company_name: 'Creative Agency',
      status: 'in_progress',
    }
  ];

  const { error: appError } = await supabase
    .from('job_applications')
    .insert(mockApps);

  if (appError) {
    console.error('❌ Error seeding applications:', appError);
    return;
  }

  console.log('\n✨ Seeding Complete!');
  console.log('----------------------------');
  console.log(`Email: ${TEST_EMAIL}`);
  console.log(`Password: ${TEST_PASSWORD}`);
  console.log('----------------------------');
  console.log('🚀 You can now log into the Dashboard with these credentials.');
}

seed();
