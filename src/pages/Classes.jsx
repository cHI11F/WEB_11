import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/classes')
      .then(res => {
        setClasses(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Failed to load classes');
        setLoading(false);
      });
  }, []);

  const handleBook = async (id) => {
    try {
      await api.post('/bookings', { class_id: id });
      toast.success('Class booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to book class');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center w-full mb-12 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-900">Upcoming <span className="text-gradient">Classes</span></h1>
      </div>

      {loading ? (
        <Spinner size={40} className="my-20" />
      ) : (
        <div className="max-w-6xl mx-auto flex justify-center flex-wrap gap-8">
          {classes.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-100 w-full max-w-sm"
            >
              <h3 className="text-2xl font-bold mb-2 text-slate-900">{c.name}</h3>
              <p className="text-slate-600 text-sm mb-4 flex-grow">{c.description}</p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-700">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  {new Date(c.date).toLocaleDateString()} &bull; {c.start_time} - {c.end_time}
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Trainer: {c.trainer_name}
                </div>
              </div>

              {user ? (
                <Button onClick={() => handleBook(c.id)} className="w-full">Book Now</Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/login'}>Log in to book</Button>
              )}
            </motion.div>
          ))}
          {classes.length === 0 && <p className="col-span-full text-center text-slate-600">No classes scheduled at the moment.</p>}
        </div>
      )}
    </div>
  );
};

export default Classes;
