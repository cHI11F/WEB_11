import React from 'react';
import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white/80 border-t border-slate-200 mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg text-slate-900">FitFusion 🏋️</span>
          </div>

          <div className="flex space-x-6 text-sm text-slate-600">
            <Link to="/classes" className="hover:text-blue-600 transition font-medium">Classes</Link>
            <Link to="/memberships" className="hover:text-blue-600 transition font-medium">Memberships</Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} FitFusion. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
