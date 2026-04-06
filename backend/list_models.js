const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  try {
    const key = process.env.GEMINI_API_KEY;
    console.log('Using Key:', key ? 'FOUND' : 'NOT');
    
    // The SDK itself doesn't have listModels, but we can try a raw fetch to the API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    if (data.models) {
      const names = data.models.map(m => m.name.replace('models/', ''));
      console.log('Available Model IDs:', names);
      console.log('Includes gemini-1.5-flash?', names.includes('gemini-1.5-flash'));
    }
  } catch (error) {
    console.error('List Models Failed:', error);
  }
}

listModels();
