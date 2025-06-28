import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

async function diagnoseMysql() {
  console.log('🔍 MySQL Diagnosis Tool');
  console.log('========================');
  
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log(`DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`);
  console.log(`DB_USER: ${process.env.DB_USER || 'NOT SET'}`);
  console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '***SET***' : 'NOT SET'}`);
  console.log(`DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`);
  
  // Check if MySQL service is running
  console.log('\n🔧 MySQL Service Status:');
  try {
    const mysqlStatus = execSync('systemctl is-active mysql', { encoding: 'utf8' }).trim();
    console.log(`MySQL service: ${mysqlStatus}`);
    
    if (mysqlStatus !== 'active') {
      console.log('⚠️  MySQL is not running. Starting it...');
      try {
        execSync('sudo systemctl start mysql');
        console.log('✅ MySQL started successfully');
      } catch (error) {
        console.log('❌ Failed to start MySQL:', error.message);
      }
    }
  } catch (error) {
    console.log('❌ Could not check MySQL status:', error.message);
  }
  
  // Check MySQL port
  console.log('\n🌐 Network Status:');
  try {
    const portCheck = execSync('netstat -tlnp | grep 3306', { encoding: 'utf8' });
    console.log('MySQL port 3306 status:');
    console.log(portCheck);
  } catch (error) {
    console.log('❌ MySQL port 3306 not listening');
  }
  
  // Test basic connection
  console.log('\n🔌 Connection Tests:');
  
  const configs = [
    {
      name: 'With password from .env',
      config: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
      }
    },
    {
      name: 'Root with empty password',
      config: {
        host: 'localhost',
        user: 'root',
        password: ''
      }
    },
    {
      name: 'Root with common passwords',
      config: {
        host: 'localhost',
        user: 'root',
        password: 'root'
      }
    }
  ];
  
  for (const test of configs) {
    console.log(`\nTesting: ${test.name}`);
    try {
      const connection = await mysql.createConnection(test.config);
      console.log('✅ Connection successful!');
      
      // Get MySQL version
      const [rows] = await connection.execute('SELECT VERSION() as version');
      console.log(`   MySQL version: ${rows[0].version}`);
      
      // Check authentication plugin
      const [authRows] = await connection.execute(
        'SELECT user, host, plugin FROM mysql.user WHERE user = ? AND host = ?',
        [test.config.user, 'localhost']
      );
      
      if (authRows.length > 0) {
        console.log(`   Authentication plugin: ${authRows[0].plugin}`);
      }
      
      await connection.end();
      
      // If this connection worked, suggest using these credentials
      if (test.config.password !== process.env.DB_PASSWORD) {
        console.log(`\n💡 SUGGESTION: Update your .env file with:`);
        console.log(`DB_USER=${test.config.user}`);
        console.log(`DB_PASSWORD=${test.config.password}`);
      }
      
      break; // Stop testing once we find working credentials
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  // MySQL user information
  console.log('\n👥 MySQL Users (if accessible):');
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    const [users] = await connection.execute(
      'SELECT user, host, plugin, authentication_string FROM mysql.user'
    );
    
    console.log('Available users:');
    users.forEach(user => {
      console.log(`   ${user.user}@${user.host} (${user.plugin})`);
    });
    
    await connection.end();
  } catch (error) {
    console.log('❌ Could not retrieve user information');
  }
  
  console.log('\n🔧 Recommended Actions:');
  console.log('1. If MySQL is not running: sudo systemctl start mysql');
  console.log('2. If password is wrong: sudo mysql -u root -p');
  console.log('3. To reset root password:');
  console.log('   sudo mysql');
  console.log('   ALTER USER \'root\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'your_new_password\';');
  console.log('   FLUSH PRIVILEGES;');
  console.log('   EXIT;');
  console.log('4. Update .env file with correct credentials');
}

diagnoseMysql().catch(console.error);