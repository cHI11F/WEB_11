import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

const Memberships = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/memberships')
      .then(res => {
        setPlans(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Failed to load memberships');
        setLoading(false);
      });
  }, []);

  const handleSelectPlan = async (id) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      await api.post('/users/me/membership', { membership_id: id });
      toast.success('Successfully subscribed to plan!');
    } catch (err) {
      toast.error('Failed to subscribe');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center w-full mb-12 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-900">Membership <span className="text-gradient">Plans</span></h1>
      </div>

      {loading ? (
        <Spinner size={40} className="my-20" />
      ) : (
        <div className="max-w-6xl mx-auto flex justify-center flex-wrap gap-8">
          {plans.map((plan, i) => {
            const features = JSON.parse(plan.features || '[]');
            const isPopular = plan.name === 'Pro';

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-8 relative flex flex-col w-full max-w-sm ${isPopular ? 'border-blue-500 shadow-xl shadow-blue-600/20 scale-105 z-10' : ''}`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-slate-900">{plan.name}</h3>
                <p className="text-slate-600 text-sm mb-6 h-10">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                  <span className="text-slate-600">/mo</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {features.map((feat, idx) => (
                    <li key={idx} className="flex items-center text-sm text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={isPopular ? 'primary' : 'outline'} onClick={() => handleSelectPlan(plan.id)}>
                  {user ? 'Select Plan' : 'Log in to subscribe'}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Memberships;
