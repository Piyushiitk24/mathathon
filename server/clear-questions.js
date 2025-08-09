require('dotenv').config();
const database = require('./db');

async function clearQuestions() {
  try {
    console.log('🧹 Clearing existing questions...');

    await database.connect();
    const db = database.getDb();

    // Find the trigonometry module
    const trigModule = await db.collection('modules').findOne({
      slug: 'trigonometry'
    });

    if (!trigModule) {
      console.log('❌ Trigonometry module not found');
      return;
    }

    console.log('📚 Found trigonometry module:', trigModule._id.toString());

    // Count existing questions
    const existingCount = await db.collection('questions').countDocuments({
      module_id: trigModule._id
    });
    console.log(`📊 Current question count: ${existingCount}`);

    // Delete all questions for this module
    const deleteResult = await db.collection('questions').deleteMany({
      module_id: trigModule._id
    });

    console.log(`🗑️  Deleted ${deleteResult.deletedCount} questions`);

    // Verify deletion
    const newCount = await db.collection('questions').countDocuments({
      module_id: trigModule._id
    });
    console.log(`📊 New question count: ${newCount}`);

    console.log('✅ Questions cleared successfully!');

  } catch (error) {
    console.error('❌ Error clearing questions:', error);
  } finally {
    process.exit(0);
  }
}

clearQuestions();
