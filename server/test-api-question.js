require('dotenv').config();
const axios = require('axios');

async function testAPIQuestionAdd() {
  try {
    console.log('🧪 Testing Question Addition via API...\n');

    // Test data for a simple trigonometry question
    const testQuestion = {
      admin_password: process.env.ADMIN_PASSWORD,
      module_name: 'trigonometry', // This should match your existing module
      type: 'revision',
      question_text: '$\\tan(A + B)$',
      answer_text: '$\\frac{\\tan A + \\tan B}{1 - \\tan A \\tan B}$',
      difficulty: 'medium'
    };

    console.log('Test question data:', testQuestion);

    // Make API call to add question
    const response = await axios.post('http://localhost:3001/api/admin/add-question', testQuestion, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': process.env.ADMIN_PASSWORD
      }
    });

    console.log('\n✅ Question added successfully via API!');
    console.log('Response:', response.data);

  } catch (error) {
    console.error('❌ Error adding question via API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Only run if server is available
console.log('Make sure your server is running on port 3001, then test...');
console.log('You can run: cd server && npm start');
console.log('Then run this test script again.');

// Uncomment the line below to run the test
// testAPIQuestionAdd();
