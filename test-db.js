// Quick database connection test
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');

    // Try to count students
    const count = await prisma.student.count();
    console.log('✅ Connection successful!');
    console.log(`Found ${count} students in database`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nFull error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
