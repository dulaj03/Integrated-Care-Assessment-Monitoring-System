require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error('No API key found in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  
  console.log('--- Testing gemini-1.5-flash (default) ---');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hello');
    console.log('✅ gemini-1.5-flash works!');
  } catch (err) {
    console.error('❌ gemini-1.5-flash failed:', err.message);
  }

  console.log('\n--- Testing gemini-1.5-flash-latest ---');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent('Hello');
    console.log('✅ gemini-1.5-flash-latest works!');
  } catch (err) {
    console.error('❌ gemini-1.5-flash-latest failed:', err.message);
  }

  console.log('\n--- Testing gemini-1.5-pro ---');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent('Hello');
    console.log('✅ gemini-1.5-pro works!');
  } catch (err) {
    console.error('❌ gemini-1.5-pro failed:', err.message);
  }
}

testModels();
