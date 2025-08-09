require('dotenv').config();
const database = require('./db');
const Question = require('./models/questions');
const Module = require('./models/modules');

async function testQuestionInsertion() {
  try {
    console.log('🔧 Testing Question Insertion...\n');

    // Step 1: Connect to database
    await database.connect();
    console.log('✅ Connected to database');

    // Step 2: Check existing modules
    console.log('\n📋 Checking existing modules...');
    const db = database.getDb();
    const modules = await db.collection('modules').find({}).toArray();
    console.log('Found modules:', modules.map(m => ({
      id: m._id.toString(),
      name: m.name,
      slug: m.slug
    })));

    // Step 3: Find trigonometry module
    let trigModule = modules.find(m => m.slug === 'trigonometry');
    if (!trigModule) {
      console.log('❌ Trigonometry module not found');
      return;
    }

    console.log('\n✅ Found trigonometry module:');
    console.log('  ID:', trigModule._id.toString());
    console.log('  Name:', trigModule.name);
    console.log('  Slug:', trigModule.slug);

    // Step 4: Check existing questions count
    const existingQuestions = await db.collection('questions').find({
      module_id: trigModule._id
    }).toArray();
    console.log(`\n📚 Found ${existingQuestions.length} existing questions for this module`);

    // Step 5: Test insertion with a simple question
    console.log('\n🧪 Testing question insertion...');
    
    const testQuestionData = {
      module_id: trigModule._id.toString(), // Convert ObjectId to string
      type: 'revision',
      question_text: '$\\sin^2(\\theta) + \\cos^2(\\theta)$',
      option_a: null,
      option_b: null,
      option_c: null,
      option_d: null,
      correct_option: null,
      answer_text: '$1$',
      difficulty: 'basic'
    };

    console.log('Test question data:', testQuestionData);

    const result = await Question.create(testQuestionData);
    console.log('\n✅ Question inserted successfully!');
    console.log('Result:', result);

    // Step 6: Verify the insertion
    const { ObjectId } = require('mongodb');
    const insertedQuestion = await db.collection('questions').findOne({
      _id: new ObjectId(result.id)
    });
    
    console.log('\n🔍 Verification - inserted question:');
    console.log({
      _id: insertedQuestion._id.toString(),
      module_id: insertedQuestion.module_id.toString(),
      type: insertedQuestion.type,
      question_text: insertedQuestion.question_text,
      answer_text: insertedQuestion.answer_text,
      difficulty: insertedQuestion.difficulty
    });

    // Step 7: Clean up test question
    await db.collection('questions').deleteOne({
      _id: new ObjectId(result.id)
    });
    console.log('\n🧹 Test question cleaned up');

  } catch (error) {
    console.error('❌ Error during test:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  } finally {
    process.exit(0);
  }
}

// Run the test
testQuestionInsertion();
