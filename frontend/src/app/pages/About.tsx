import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from '../components/footer';

export function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            About I-CAMS
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-slate-500 dark:text-slate-400">
            Bridging the gap in healthcare communication through technology.
          </p>
        </div>

        <div className="prose prose-lg prose-blue dark:prose-invert mx-auto text-slate-500 dark:text-slate-400">
          <p>
            The Integrated Care Assessment and Monitoring System (I-CAMS) is a web application designed to bridge the communication gap between patients, nurses, and doctors in Sri Lanka.
          </p>
          <p>
            Our platform empowers patients to take control of their health by easily logging vital statistics and symptoms, while providing healthcare professionals with the tools they need to monitor patient progress effectively.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Our Mission</h2>
          <p>
            To improve patient outcomes and healthcare efficiency by facilitating seamless information exchange and proactive monitoring.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Key Features</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Role-based dashboards for Patients, Doctors, and Nurses</li>
            <li>Real-time health log tracking</li>
            <li>Visual trend analysis for vital signs</li>
            <li>Secure and private data handling</li>
          </ul>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 font-medium transition-colors duration-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
