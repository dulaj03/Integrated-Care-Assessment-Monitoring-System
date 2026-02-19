import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Save, X } from 'lucide-react';

export function HealthLog() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    oxygenLevel: '',
    symptoms: [] as string[],
    notes: '',
    mood: 'good',
  });

  const commonSymptoms = [
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Shortness of Breath', 
    'Dizziness', 'Nausea', 'Chest Pain'
  ];

  const handleSymptomToggle = (symptom: string) => {
    setFormData(prev => {
      if (prev.symptoms.includes(symptom)) {
        return { ...prev, symptoms: prev.symptoms.filter(s => s !== symptom) };
      } else {
        return { ...prev, symptoms: [...prev.symptoms, symptom] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to the API
    alert('Health log submitted successfully!');
    navigate('/patient/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-blue-600">
          <h3 className="text-lg leading-6 font-medium text-white">Daily Health Log</h3>
          <p className="mt-1 max-w-2xl text-sm text-blue-100">
            Please fill in your vitals and any symptoms you are experiencing today.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
          
          {/* Vitals Section */}
          <div>
            <h4 className="text-sm font-medium text-slate-900 border-b border-slate-200 pb-2 mb-4">Vitals</h4>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bp" className="block text-sm font-medium text-slate-700">Blood Pressure (mmHg)</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="number"
                    name="systolic"
                    id="systolic"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-slate-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="120"
                    value={formData.systolic}
                    onChange={e => setFormData({...formData, systolic: e.target.value})}
                  />
                  <span className="inline-flex items-center px-3 rounded-none border border-l-0 border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                    /
                  </span>
                  <input
                    type="number"
                    name="diastolic"
                    id="diastolic"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border border-slate-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="80"
                    value={formData.diastolic}
                    onChange={e => setFormData({...formData, diastolic: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="heartRate" className="block text-sm font-medium text-slate-700">Heart Rate (bpm)</label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="heartRate"
                    id="heartRate"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md px-3 py-2 border"
                    placeholder="72"
                    value={formData.heartRate}
                    onChange={e => setFormData({...formData, heartRate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-slate-700">Temperature (°C)</label>
                <div className="mt-1">
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    id="temperature"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md px-3 py-2 border"
                    placeholder="36.5"
                    value={formData.temperature}
                    onChange={e => setFormData({...formData, temperature: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="oxygen" className="block text-sm font-medium text-slate-700">Oxygen Level (%)</label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="oxygen"
                    id="oxygen"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md px-3 py-2 border"
                    placeholder="98"
                    value={formData.oxygenLevel}
                    onChange={e => setFormData({...formData, oxygenLevel: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          <div>
            <h4 className="text-sm font-medium text-slate-900 border-b border-slate-200 pb-2 mb-4">Symptoms & Mood</h4>
            
            <label className="block text-sm font-medium text-slate-700 mb-2">How are you feeling overall?</label>
            <div className="flex space-x-4 mb-6">
                {['great', 'good', 'okay', 'poor', 'bad'].map((mood) => (
                    <button
                        key={mood}
                        type="button"
                        onClick={() => setFormData({...formData, mood})}
                        className={`px-3 py-2 rounded-md text-sm font-medium capitalize ${
                            formData.mood === mood 
                            ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {mood}
                    </button>
                ))}
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-2">Select any symptoms:</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md ${
                    formData.symptoms.includes(symptom)
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Additional Notes</label>
            <div className="mt-1">
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border"
                placeholder="Anything else you'd like to share with your doctor?"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-5 border-t border-slate-200 flex justify-end space-x-3">
             <button
                type="button"
                onClick={() => navigate('/patient/dashboard')}
                className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Log
              </button>
          </div>

        </form>
      </div>
    </div>
  );
}
