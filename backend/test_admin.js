const DoctorModel = require('./models/doctorModel');
const NurseModel = require('./models/nurseModel');
const HospitalModel = require('./models/hospitalModel');
const PatientModel = require('./models/patientModel');

async function test() {
  try {
    const doctors = await DoctorModel.findAll();
    console.log("Doctors found:", doctors.length);
    const nurses = await NurseModel.findAll();
    console.log("Nurses found:", nurses.length);
    const patients = await PatientModel.findAll();
    console.log("Patients found:", patients.length);
    const hospitals = await HospitalModel.findAll();
    console.log("Hospitals found:", hospitals.length);
  } catch (e) {
    console.error("FAIL:", e.message);
  } finally {
    process.exit();
  }
}
test();
