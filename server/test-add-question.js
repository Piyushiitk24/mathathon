require('dotenv').config();
const database = require('./db');
const Question = require('./models/questions');
const Module = require('./models/modules');

async function addNewQuestionTest() {
  try {
    console.log('🧪 Testing New Question Addition...\n');

    // Connect to database
    await database.connect();
    console.log('✅ Connected to database');

    // Find the trigonometry module
    const db = database.getDb();
    const { ObjectId } = require('mongodb');
    
    const trigModule = await db.collection('modules').findOne({
      slug: 'trigonometry'
    });

    if (!trigModule) {
      console.log('❌ Trigonometry module not found');
      return;
    }

    console.log('✅ Found trigonometry module:', trigModule._id.toString());

    // Count existing questions
    const existingCount = await db.collection('questions').countDocuments({
      module_id: trigModule._id
    });
    console.log(`📚 Current question count: ${existingCount}`);

    // Test adding a new question
    const newQuestionData = {
      module_id: trigModule._id.toString(),
      type: 'revision',
      question_text: '$\\cos(2A)$ (Double angle formula)',
      answer_text: '$\\cos^2(A) - \\sin^2(A) = 2\\cos^2(A) - 1 = 1 - 2\\sin^2(A)$',
      option_a: null,
      option_b: null,
      option_c: null,
      option_d: null,
      correct_option: null,
      difficulty: 'medium'
    };

    console.log('\n🔧 Adding new question...');
    const result = await Question.create(newQuestionData);
    console.log('✅ New question added:', result.id);

    // Verify the new count
    const newCount = await db.collection('questions').countDocuments({
      module_id: trigModule._id
    });
    console.log(`📚 New question count: ${newCount}`);

    // Verify the question was inserted correctly
    const insertedQuestion = await db.collection('questions').findOne({
      _id: new ObjectId(result.id)
    });

    console.log('\n🔍 Inserted question verification:');
    console.log({
      _id: insertedQuestion._id.toString(),
      module_id: insertedQuestion.module_id.toString(),
      type: insertedQuestion.type,
      question_text: insertedQuestion.question_text,
      answer_text: insertedQuestion.answer_text,
      difficulty: insertedQuestion.difficulty
    });

    // Clean up the test question
    await db.collection('questions').deleteOne({
      _id: new ObjectId(result.id)
    });
    console.log('\n🧹 Test question cleaned up');

    const finalCount = await db.collection('questions').countDocuments({
      module_id: trigModule._id
    });
    console.log(`📚 Final question count: ${finalCount}`);

    console.log('\n✅ Question addition test completed successfully!');

  } catch (error) {
    console.error('❌ Error during test:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

addNewQuestionTest();
