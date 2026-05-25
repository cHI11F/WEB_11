import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-black text-2xl tracking-tight text-slate-900">C1FIT</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/classes" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700">Classes</Link>
            <Link to="/memberships" className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700">Memberships</Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'Admin' && <Link to="/admin"><Button variant="ghost">Admin</Button></Link>}
                {user.role === 'Trainer' && <Link to="/trainer"><Button variant="ghost">Trainer</Button></Link>}
                {(user.role === 'Member' || user.role === 'Admin') && <Link to="/dashboard"><Button variant="ghost">Dashboard</Button></Link>}
                <Button variant="outline" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="border border-slate-300 text-slate-700 rounded-full px-5 py-2 hover:bg-slate-50 transition-all font-medium text-sm">Log in</Link>
                <Link to="/register" className="bg-blue-600 text-white rounded-full px-5 py-2 hover:bg-blue-700 hover:shadow-lg transition-all font-medium text-sm">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
