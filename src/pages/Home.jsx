import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Activity, Users, Calendar } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center py-20 gap-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
        >
          Unleash Your <span className="text-gradient">Potential</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-xl text-slate-500"
        >
          Join C1FIT and transform your body and mind with our state-of-the-art facilities, expert trainers, and vibrant community.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-6"
        >
          <Link to="/register" tabIndex={-1}><Button size="lg" className="px-8 shadow-lg shadow-blue-600/30">Start Free Trial</Button></Link>
          <Link to="/classes" tabIndex={-1}><Button variant="secondary" size="lg" className="px-8">View Classes</Button></Link>
        </motion.div>
      </section>


    </div>
  );
};

export default Home;
