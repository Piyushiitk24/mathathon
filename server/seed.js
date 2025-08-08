const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

const database = require('./db');
const Module = require('./models/modules');
const Question = require('./models/questions');

async function seedDatabase() {
  console.log('🌱 Starting database seeding process...');
  
  try {
    // Connect to database
    await database.connect();
    console.log('✅ Database connected successfully');
    
    const csvPath = path.join(__dirname, 'data', 'Complete_NDA_Trig_Formulas.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }
    
    console.log(`📄 Reading CSV file: ${csvPath}`);
    
    const results = [];
    const moduleCache = new Map();
    
    // Read and parse CSV
    const parsePromise = new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });
    
    await parsePromise;
    console.log(`📊 Parsed ${results.length} rows from CSV`);
    
    if (results.length === 0) {
      throw new Error('No data found in CSV file');
    }
    
    // Log first row to verify column mapping
    console.log('🔍 Sample row data:');
    console.log(JSON.stringify(results[0], null, 2));
    
    let insertedCount = 0;
    const sampleInserted = [];

    // Helper to normalize a row to our internal schema
    const mapRow = (row) => {
      // Support original schema
      let moduleName = row.module?.trim();
      let questionType = row.type?.trim();
      let questionText = row.question?.trim();
      let answerText = row.answer?.trim();
      let difficulty = row.difficulty?.trim() || row.Difficulty?.trim();

      // Support simplified schema: Serial Number, Question, Answer
      if (!questionText && row['Question']) questionText = String(row['Question']).trim();
      if (!answerText && row['Answer']) answerText = String(row['Answer']).trim();

      // If module/type are missing but it looks like simplified schema, default them
      const looksLikeSimple = row['Question'] || row['Serial Number'] || row['Answer'];
      if (!moduleName && looksLikeSimple) moduleName = 'trigonometry';
      if (!questionType && looksLikeSimple) questionType = 'revision';

      // Options mapping (support both styles if present)
      const option_a = row.option_a?.trim() || row['Option A']?.trim() || null;
      const option_b = row.option_b?.trim() || row['Option B']?.trim() || null;
      const option_c = row.option_c?.trim() || row['Option C']?.trim() || null;
      const option_d = row.option_d?.trim() || row['Option D']?.trim() || null;
      const correct_option = row.correct_option?.trim() || row['Correct Option']?.trim() || null;
      
      return {
        moduleName,
        questionType,
        questionText,
        answerText,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        difficulty: difficulty || 'medium'
      };
    };
    
    // Process each row
    for (const row of results) {
      try {
        const mapped = mapRow(row);
        const { moduleName, questionType, questionText } = mapped;

        if (!moduleName || !questionType || !questionText) {
          console.warn('⚠️  Skipping row with missing required fields:', {
            module: moduleName,
            type: questionType,
            question: questionText ? questionText.substring(0, 50) + '...' : 'undefined...'
          });
          continue;
        }
        
        // Get or create module
        let module;
        if (moduleCache.has(moduleName)) {
          module = moduleCache.get(moduleName);
        } else {
          const moduleSlug = moduleName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          module = await Module.create(moduleName, moduleSlug);
          moduleCache.set(moduleName, module);
          console.log(`📚 Created/found module: ${moduleName} (ID: ${module.id})`);
        }
        
        // Prepare question data
        const questionData = {
          module_id: module.id,
          type: mapped.questionType,
          question_text: mapped.questionText,
          option_a: mapped.option_a,
          option_b: mapped.option_b,
          option_c: mapped.option_c,
          option_d: mapped.option_d,
          correct_option: mapped.correct_option,
          answer_text: mapped.answerText || null,
          difficulty: mapped.difficulty
        };
        
        // Insert question
        const question = await Question.create(questionData);
        insertedCount++;
        
        // Store first 5 for logging
        if (sampleInserted.length < 5) {
          sampleInserted.push({
            id: question.id,
            module: moduleName,
            type: questionData.type,
            question: questionData.question_text.substring(0, 100) + (questionData.question_text.length > 100 ? '...' : ''),
            difficulty: questionData.difficulty
          });
        }
        
      } catch (error) {
        console.error('❌ Error processing row:', error.message);
        console.error('Row data:', row);
      }
    }
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📈 Statistics:`);
    console.log(`   - Total rows processed: ${results.length}`);
    console.log(`   - Questions inserted: ${insertedCount}`);
    console.log(`   - Modules created: ${moduleCache.size}`);
    
    console.log('\n📝 First 5 inserted questions:');
    sampleInserted.forEach((q, index) => {
      console.log(`   ${index + 1}. [${q.module}] ${q.question} (${q.type}, ${q.difficulty})`);
    });
    
    // Display modules
    console.log('\n📚 Modules in database:');
    for (const [name, module] of moduleCache) {
      console.log(`   - ${name} (ID: ${module.id}, Slug: ${module.slug})`);
    }
    
  } catch (error) {
    console.error('💥 Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await database.close();
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('Error closing database:', error.message);
    }
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✨ Seeding process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
