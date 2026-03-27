const HospitalModel = require('./models/hospitalModel');
const bcrypt = require('bcryptjs');

async function test() {
  try {
    const pwd = await bcrypt.hash('test1234', 10);
    const hospital = await HospitalModel.create({
      name: 'Test Hospital',
      email: `test_${Date.now()}@test.com`,
      password: pwd,
      registration_number: 'REG123',
      address: 'Test Address',
      phone: '123456789',
      type: 'Private',
      specialties: ['Cardiology', 'Neurology']
    });
    console.log("SUCCESS:", hospital.id);
  } catch (e) {
    console.error("FAIL:", e.message);
  } finally {
    process.exit();
  }
}
test();
