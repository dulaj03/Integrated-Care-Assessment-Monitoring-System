const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function findWorkingModel() {
  const key = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(key);
  
  // Models to try in order of preference
  const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-preview',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest'
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello.");
      console.log(`✅ ${modelName} WORKS! Response: ${result.response.text().substring(0, 50)}`);
    } catch (err) {
      console.log(`❌ ${modelName} FAILED: ${err.message.substring(0, 80)}`);
    }
  }
}

findWorkingModel();
