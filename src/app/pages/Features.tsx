import { Link } from "react-router";
import { ArrowLeft, Activity, Shield, Users, FileText } from "lucide-react";
import { Navbar } from "../components/Navbar";

export function Features() {
  const features = [
    {
      name: 'Role-Based Access',
      description: 'Dedicated dashboards for patients, doctors, and nurses with tailored functionalities.',
      icon: Users,
    },
    {
      name: 'Real-Time Monitoring',
      description: 'Track vital signs and health metrics in real-time with visual trend analysis.',
      icon: Activity,
    },
    {
      name: 'Secure Data Handling',
      description: 'Your health data is encrypted and securely stored, accessible only to authorized personnel.',
      icon: Shield,
    },
    {
      name: 'Comprehensive Health Logs',
      description: 'Easily log symptoms, medications, and daily health stats for better diagnosis.',
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Key Features
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-slate-500">
            Everything you need to manage healthcare effectively.
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.name} className="pt-6">
              <div className="flow-root bg-slate-50 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-slate-900 tracking-tight">{feature.name}</h3>
                  <p className="mt-5 text-base text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
             <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
            </Link>
        </div>
      </main>
    </div>
  );
}
