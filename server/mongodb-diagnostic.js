require('dotenv').config();
const database = require('./db');

async function checkMongoDBStatus() {
  try {
    console.log('🔍 MongoDB Database Diagnostic...\n');

    // Connect to database
    await database.connect();
    console.log('✅ Connected to database');
    
    const db = database.getDb();

    // Check database stats
    console.log('\n📊 Database Stats:');
    const stats = await db.stats();
    console.log(`Database: ${stats.db}`);
    console.log(`Collections: ${stats.collections}`);
    console.log(`Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);

    // Check collections
    console.log('\n📂 Collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`  - ${col.name} (type: ${col.type})`);
    });

    // Check modules collection
    console.log('\n📋 Modules Collection:');
    const modules = await db.collection('modules').find({}).toArray();
    modules.forEach(module => {
      console.log(`  - ${module.name} (ID: ${module._id}, Slug: ${module.slug})`);
    });

    // Check questions collection
    console.log('\n📚 Questions Collection:');
    const questionCount = await db.collection('questions').countDocuments();
    console.log(`Total questions: ${questionCount}`);

    // Check questions by module
    for (const module of modules) {
      const moduleQuestions = await db.collection('questions').countDocuments({
        module_id: module._id
      });
      console.log(`  - ${module.name}: ${moduleQuestions} questions`);
    }

    // Check collection validation rules
    console.log('\n🔧 Collection Info (including validation):');
    const collectionsInfo = await db.listCollections({name: "questions"}).toArray();
    if (collectionsInfo.length > 0) {
      console.log('Questions collection info:', JSON.stringify(collectionsInfo[0], null, 2));
    }

    // Check if there are any validation errors in recent documents
    console.log('\n🔍 Sample Questions (first 3):');
    const sampleQuestions = await db.collection('questions').find({}).limit(3).toArray();
    sampleQuestions.forEach((q, index) => {
      console.log(`${index + 1}. Question ID: ${q._id}`);
      console.log(`   Module ID: ${q.module_id} (type: ${typeof q.module_id})`);
      console.log(`   Type: ${q.type}`);
      console.log(`   Question: ${q.question_text.substring(0, 50)}...`);
      console.log(`   Answer: ${q.answer_text ? q.answer_text.substring(0, 50) + '...' : 'null'}`);
      console.log('');
    });

    // Test ObjectId operations
    console.log('🧪 Testing ObjectId Operations:');
    const { ObjectId } = require('mongodb');
    const testObjectId = new ObjectId();
    console.log(`Generated test ObjectId: ${testObjectId}`);
    console.log(`Is valid ObjectId string: ${ObjectId.isValid(testObjectId.toString())}`);
    
    // Test with your module ID
    const trigModule = modules.find(m => m.slug === 'trigonometry');
    if (trigModule) {
      console.log(`Trigonometry module ID: ${trigModule._id}`);
      console.log(`Is valid ObjectId: ${ObjectId.isValid(trigModule._id.toString())}`);
    }

  } catch (error) {
    console.error('❌ Error during diagnostic:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

checkMongoDBStatus();
