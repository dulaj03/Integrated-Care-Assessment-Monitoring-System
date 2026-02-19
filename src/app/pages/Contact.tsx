import { Link } from "react-router";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { Navbar } from "../components/Navbar";

export function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Contact Us
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-slate-500">
            Get in touch with our support team for any inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-blue-600 mr-4" />
                <span className="text-lg text-slate-700">support@i-cams.lk</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-6 w-6 text-blue-600 mr-4" />
                <span className="text-lg text-slate-700">+94 11 234 5678</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-blue-600 mr-4" />
                <span className="text-lg text-slate-700">123 Healthcare Ave, Colombo 03, Sri Lanka</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                <input type="text" id="name" name="name" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" placeholder="Your Name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                <input type="email" id="email" name="email" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
                <textarea id="message" name="message" rows={4} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" placeholder="How can we help?"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Send Message
              </button>
            </form>
          </div>
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
