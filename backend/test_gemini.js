const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  try {
    const key = process.env.GEMINI_API_KEY;
    console.log('Using Key:', key ? 'FOUND ✔️' : 'NOT FOUND ❌');
    if (!key) return;

    const genAI = new GoogleGenerativeAI(key);
    // There isn't an easy "listModels" in the simple SDK, but we'll try 'gemini-pro' first which should always work.
    
    console.log('Final Test: simplest possible call...');
    try {
      const modelSimple = genAI.getGenerativeModel({ model: "gemini-pro" });
      const request = "Say HELLO";
      const resultFinal = await modelSimple.generateContent(request);
      console.log('Result:', resultFinal.response.text());
    } catch (err3) {
      console.error('SIMPLEST FAILED AGAIN:', err3);
    }
  } catch (error) {
    console.error('❌ GLOBAL FAILED:', error);
  }
}

test();
