const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/db');
const PatientModel = require('../models/patientModel');

const aiController = {
  chat: async (req, res) => {
    try {
      const API_KEY = process.env.GEMINI_API_KEY;
      
      if (!API_KEY) {
        console.error('❌ AI_ERROR: GEMINI_API_KEY is missing in .env file');
        return res.status(503).json({ 
          error: 'AI Service Unavailable', 
          details: 'The server is missing the GEMINI_API_KEY. Please verify your .env file on the server.' 
        });
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const { message, history } = req.body;
      const user = req.user;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // 1. Fetch relevant context from DB
      let hospitals = [];
      let doctors = [];
      
      try {
        const hospitalsRes = await pool.query('SELECT name, address, phone, type, specialties FROM hospitals WHERE status = \'ACTIVE\' LIMIT 20');
        hospitals = hospitalsRes.rows;
      } catch (err) {
        console.warn('Could not fetch hospitals:', err.message);
      }

      try {
        const doctorsRes = await pool.query('SELECT full_name, specialization, years_of_experience, institution_name FROM doctors WHERE status = \'ACTIVE\' LIMIT 20');
        doctors = doctorsRes.rows;
      } catch (err) {
        console.warn('Could not fetch doctors:', err.message);
      }
      
      let patientContext = '';
      if (user && user.role === 'patient') {
        try {
          const patient = await PatientModel.findById(user.id);
          if (patient) {
            const apptsRes = await pool.query(
              `SELECT a.appointment_date, a.appointment_time, a.reason, a.status, d.full_name as doctor_name 
               FROM appointments a 
               JOIN doctors d ON a.doctor_id = d.id 
               WHERE a.patient_id = $1 ORDER BY a.appointment_date DESC LIMIT 5`,
              [user.id]
            );
            const healthLogsRes = await pool.query(
              'SELECT systolic_bp, diastolic_bp, heart_rate, temperature, created_at FROM health_logs WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 5',
              [user.id]
            );

            patientContext = `
YOU ARE TALKING TO A LOGGED-IN PATIENT.
Patient Name: ${patient.full_name}
Age: ${patient.age || 'Not provided'}
Gender: ${patient.gender || 'Not provided'}
Condition: ${patient.condition || 'None stated'}
Recent Appointments: ${JSON.stringify(apptsRes.rows)}
Recent Health Vitals: ${JSON.stringify(healthLogsRes.rows)}
`;
          }
        } catch (err) {
          console.warn('Could not fetch patient context:', err.message);
        }
      }

      const systemPrompt = `
You are "Dr. ICAMS - Assistant", a warm, friendly and knowledgeable healthcare AI assistant for the I-CAMS system in Sri Lanka.

CORE PERSONALITY:
1. Warm, friendly, and empathetic.
2. Multilingual: Reply in the same language as the user (English, Sinhala, or Tamil).
3. Concise: Keep answers helpful but short.

MEDICAL GUIDANCE:
- Discuss symptoms, first aid, and conditions simply.
- ALWAYS end with: "Remember, I'm an AI — please see a real doctor for a proper diagnosis! 😊"

I-CAMS SYSTEM CONTEXT:
Hospitals: ${JSON.stringify(hospitals)}
Doctors: ${JSON.stringify(doctors)}

${patientContext}
`;

      // 2. Prepare history with system prompt at the beginning to avoid v1beta systemInstruction 404s
      const systemContextHistory = [
        { role: 'user', parts: [{ text: `SYSTEM INSTRUCTIONS: ${systemPrompt}` }] },
        { role: 'model', parts: [{ text: 'I understand my role as Dr. ICAMS - Assistant. I will follow all instructions and use the provided healthcare context for recommendations.' }] },
        ...(history || [])
      ];

      let response;
      try {
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash',
          // Relax safety settings to allow clinical/medical discussions within system guardrails
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ]
        });
        
        const chat = model.startChat({
          history: systemContextHistory,
          generationConfig: { 
            maxOutputTokens: 2048,
            temperature: 0.7
          },
        });

        console.log(`[AI_CHAT] Request from ${user?.role || 'guest'}: "${message.substring(0, 50)}..."`);
        const result = await chat.sendMessage(message);
        response = await result.response;
      } catch (err) {
        console.error('⚠️ AI Model Error:', err.message);
        
        try {
          const fallbackModel = genAI.getGenerativeModel({ 
            model: 'gemini-flash-latest' 
          });
          const fallbackChat = fallbackModel.startChat({
            history: systemContextHistory,
            generationConfig: { maxOutputTokens: 2048 },
          });
          const result = await fallbackChat.sendMessage(message);
          response = await result.response;
        } catch (fallbackErr) {
          console.error('🔥 AI_FAILURE:', fallbackErr.message);
          throw fallbackErr;
        }
      }
      
      if (response.promptFeedback && response.promptFeedback.blockReason) {
        console.warn('🚫 AI_BLOCKED:', response.promptFeedback.blockReason);
        return res.status(400).json({ error: 'Blocked', details: `Safety blockage: ${response.promptFeedback.blockReason}` });
      }

      const text = response.text();
      res.json({ reply: text });

    } catch (error) {
      console.error('🔥 AI_CONTROLLER_CRASH:', error);
      
      // Determine if it's an API error or a code error
      const isQuotaError = error.message?.includes('429') || error.message?.includes('quota');
      const isAuthError = error.message?.includes('API_KEY_INVALID') || error.status === 400 || error.status === 403;

      if (isQuotaError) {
        return res.status(429).json({ error: 'Quota Exceeded', details: 'The AI service limit has been reached. Please try again later.' });
      }
      
      if (isAuthError) {
        return res.status(503).json({ error: 'Configuration Error', details: 'The AI API key is invalid or restricted.' });
      }

      res.status(500).json({ 
        error: 'Internal Server Error', 
        details: error.message 
      });
    }
  }
};

module.exports = aiController;
