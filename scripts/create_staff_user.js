// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

async function main() {
  console.log('--- Create New Staff User (with Auth) ---');
  const username = await ask('Username: ');
  const email = await ask('Email: ');
  const password = await ask('Password: ');
  const role = await ask('Role (admin/moderator) [moderator]: ');
  const staffRole = role === 'admin' ? 'admin' : 'moderator';

  if (!username || !email || !password) {
    console.error('Username, email, and password are required.');
    rl.close();
    process.exit(1);
  }

  // 1. Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    console.error('Failed to create Supabase Auth user:', authError.message);
    rl.close();
    process.exit(1);
  }

  const userId = authData.user.id;
  // Hash the password for staff_users table
  const password_hash = await bcrypt.hash(password, 10);

  // 2. Insert into staff_users with the same id
  const { data, error } = await supabase.from('staff_users').insert({
    id: userId,
    username,
    email,
    password_hash,
    role: staffRole
  }).select();

  if (error) {
    console.error('Failed to create staff user in staff_users table:', error.message);
    // Optionally, delete the Auth user to avoid orphaned Auth users
    await supabase.auth.admin.deleteUser(userId);
  } else {
    console.log('Staff user created successfully:', data[0]);
  }

  // After setStaffUser(data.user);
  const { data: staffData, error: staffError } = await supabase
    .from('staff_users')
    .select('username')
    .eq('id', data[0].id)
    .single();

  if (!staffError && staffData) {
    console.log('Staff username:', staffData.username);
  }

  rl.close();
}

main(); 