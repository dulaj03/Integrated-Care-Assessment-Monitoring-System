const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/db');
const PatientModel = require('../models/patientModel');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const aiController = {
  chat: async (req, res) => {
    try {
      const { message, history } = req.body;
      const user = req.user; // May be undefined for guests

      // 1. Fetch relevant context from DB
      let hospitals = [];
      let doctors = [];
      
      try {
        const hospitalsRes = await pool.query('SELECT name, address, phone, type, specialties FROM hospitals WHERE status = \'ACTIVE\'');
        hospitals = hospitalsRes.rows;
      } catch (err) {
        console.warn('Could not fetch hospitals:', err.message);
      }

      try {
        const doctorsRes = await pool.query('SELECT full_name, specialization, years_of_experience, institution_name FROM doctors WHERE status = \'ACTIVE\'');
        doctors = doctorsRes.rows;
      } catch (err) {
        console.warn('Could not fetch doctors:', err.message);
      }
      
      let patientContext = '';
      if (user && user.role === 'patient') {
        try {
          const patient = await PatientModel.findById(user.id);
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
        } catch (err) {
          console.warn('Could not fetch patient context:', err.message);
        }
      }

      const systemPrompt = `
You are "Dr. ICAMS - Assistant", a warm, friendly and knowledgeable healthcare AI assistant for the I-CAMS system (Integrated Clinical & Administrative Management System) in Sri Lanka.

CORE PERSONALITY & BEHAVIOR:
1. CONVERSATIONAL: Be warm and friendly like chatting with a trusted friend who happens to be a doctor. Use casual, natural language. Ask follow-up questions about symptoms before jumping to conclusions.
2. EMPATHETIC: Acknowledge the user's concerns with care (e.g., "That sounds uncomfortable!", "Don't worry, let's figure this out together.").
3. MULTILINGUAL: Detect the language of the user's message and ALWAYS reply in the SAME language. Support English, Sinhala (සිංහල), and Tamil (தமிழ்).
4. KEEP RESPONSES CONCISE: Avoid very long answers. Be clear and to-the-point.

MEDICAL GUIDANCE:
- Discuss symptoms, give first aid tips, explain conditions in simple terms.
- For first aid questions, provide clear step-by-step instructions.
- ALWAYS end any medical advice with a gentle reminder: "Remember, I'm an AI — please see a real doctor for a proper diagnosis! 😊"

SYSTEM RECOMMENDATIONS:
- When suggesting specialists or care, ALWAYS recommend from OUR I-CAMS hospitals and doctors listed below.
- Mention their specialization and where they are located.
- Encourage the user to book an appointment through I-CAMS.

OUR HOSPITALS IN THE SYSTEM:
${JSON.stringify(hospitals)}

OUR DOCTORS IN THE SYSTEM:
${JSON.stringify(doctors)}

${patientContext}

Current User Role: ${user ? user.role : 'GUEST'}
`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt
      });

      const chat = model.startChat({
        history: history || [],
        generationConfig: {
          maxOutputTokens: 2048,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      res.json({ reply: text });
    } catch (error) {
      console.error('🔥 AI Chat Error Details:', {
        message: error.message,
        status: error.status,
        apiKeyExists: !!process.env.GEMINI_API_KEY,
        fullError: error
      });

      // Handle rate limit errors (429) with a user-friendly message
      if (error.status === 429 || (error.message && error.message.includes('429'))) {
        let details = 'The AI service is temporarily busy. Please wait a moment and try again.';
        
        if (error.message.includes('limit: 0') || error.message.includes('quota exceeded')) {
          details = 'Your API key has no quota (limit: 0). Please check that the Generative Language API is enabled in Google AI Studio for this specific key.';
        }

        return res.status(429).json({
          error: 'Rate limit reached',
          details: details
        });
      }

      // Handle invalid API key / auth errors
      if (error.status === 400 || error.status === 403) {
        return res.status(503).json({
          error: 'AI service configuration error',
          details: 'There is a configuration issue with the AI service. Please contact support.'
        });
      }

      res.status(500).json({ 
        error: 'Failed to get AI response', 
        details: error.message 
      });
    }
  }
};

module.exports = aiController;
