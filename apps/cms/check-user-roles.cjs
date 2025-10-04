const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
});

async function checkUserRoles() {
  try {
    console.log('🔍 Checking current user roles...\n');
    
    // Check enum values
    const enumQuery = `
      SELECT unnest(enum_range(NULL::enum_users_role)) as role;
    `;
    
    const enumResult = await pool.query(enumQuery);
    console.log('📋 Available user roles in enum_users_role:');
    enumResult.rows.forEach(row => {
      console.log(`  - ${row.role}`);
    });
    
    // Check actual users and their roles
    const usersQuery = `
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role;
    `;
    
    const usersResult = await pool.query(usersQuery);
    console.log('\n👥 Current users by role:');
    usersResult.rows.forEach(row => {
      console.log(`  - ${row.role}: ${row.count} users`);
    });
    
    // Check if any users still have instructor role
    const instructorUsersQuery = `
      SELECT id, email, role 
      FROM users 
      WHERE role = 'instructor' 
      LIMIT 5;
    `;
    
    try {
      const instructorUsers = await pool.query(instructorUsersQuery);
      if (instructorUsers.rows.length > 0) {
        console.log('\n⚠️  Users with instructor role found:');
        instructorUsers.rows.forEach(user => {
          console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
        });
      } else {
        console.log('\n✅ No users with instructor role found');
      }
    } catch (error) {
      console.log('\n✅ No users with instructor role (role no longer exists in enum)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUserRoles();