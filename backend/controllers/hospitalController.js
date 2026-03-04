const HospitalModel = require('../models/hospitalModel');
const DoctorModel = require('../models/doctorModel');

const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await HospitalModel.findAll();
    res.json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ error: 'Server error fetching hospitals' });
  }
};

const getHospitalDoctors = async (req, res) => {
  const { id } = req.params;
  try {
    const doctors = await DoctorModel.findActiveByHospitalId(id);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching hospital doctors:', error);
    res.status(500).json({ error: 'Server error fetching hospital doctors' });
  }
};

module.exports = {
  getAllHospitals,
  getHospitalDoctors
};
