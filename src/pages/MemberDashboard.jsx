import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Calendar as CalendarIcon, Flame, Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [workouts, setWorkouts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [userMembership, setUserMembership] = useState(null);

  // Modals
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'workouts') {
        const res = await api.get('/workouts/me');
        setWorkouts(res.data);
      }
      if (activeTab === 'overview' || activeTab === 'bookings') {
        const res = await api.get('/bookings/me');
        setBookings(res.data);
      }
      if (activeTab === 'membership') {
        const uRes = await api.get('/users/me');
        setUserMembership(uRes.data.membership);
        const mRes = await api.get('/memberships');
        setMemberships(mRes.data);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // --- WORKOUTS ---
  const handleAddWorkout = () => {
    setSelectedWorkout({ date: new Date().toISOString().split('T')[0], duration_minutes: 30, type: 'Cardio', calories_burned: 0, notes: '' });
    setIsWorkoutModalOpen(true);
  };

  const handleEditWorkout = (w) => {
    setSelectedWorkout(w);
    setIsWorkoutModalOpen(true);
  };

  const handleSaveWorkout = async (e) => {
    e.preventDefault();
    try {
      if (selectedWorkout.id) {
        await api.put(`/workouts/${selectedWorkout.id}`, selectedWorkout);
        toast.success('Workout updated');
      } else {
        await api.post('/workouts', selectedWorkout);
        toast.success('Workout logged');
      }
      setIsWorkoutModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save workout');
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Delete this workout log?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      toast.success('Workout deleted');
      setWorkouts(workouts.filter(w => w.id !== id));
    } catch (err) {
      toast.error('Failed to delete workout');
    }
  };

  // --- BOOKINGS ---
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      setBookings(bookings.filter(b => b.id !== id));
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  // --- MEMBERSHIP ---
  const handleUpgradePlan = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) return toast.error('Please select a plan');
    try {
      await api.post('/users/me/membership', { membership_id: selectedPlanId });
      toast.success('Membership updated successfully!');
      setIsMembershipModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update membership');
    }
  };

  // Chart data
  const chartData = workouts.slice().reverse().map(w => ({
    name: new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    calories: w.calories_burned || 0
  }));
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Welcome back, <span className="text-gradient">{user.name}</span></h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        {['overview', 'workouts', 'bookings', 'membership'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium transition-colors capitalize whitespace-nowrap ${activeTab === tab ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            My {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner size={40} className="my-20" />
      ) : (
        <>
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-8 flex items-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Activity className="text-blue-600 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Workouts</p>
                    <p className="text-2xl font-bold text-slate-900">{workouts.length}</p>
                  </div>
                </div>
                <div className="glass-card p-8 flex items-center">
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <Flame className="text-orange-500 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Calories Burned</p>
                    <p className="text-2xl font-bold text-slate-900">{totalCalories} kcal</p>
                  </div>
                </div>
                <div className="glass-card p-8 flex items-center">
                  <div className="h-12 w-12 bg-sky-100 rounded-full flex items-center justify-center mr-4">
                    <CalendarIcon className="text-sky-600 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Active Minutes</p>
                    <p className="text-2xl font-bold text-slate-900">{totalDuration} min</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8 h-[400px]">
                  <h2 className="text-xl font-bold mb-6 text-slate-900">Activity Overview</h2>
                  {workouts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                        <Line type="monotone" dataKey="calories" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">Log some workouts to see your progress!</div>
                  )}
                </div>

                <div className="glass-card p-8">
                  <h2 className="text-xl font-bold mb-6 text-slate-900">Upcoming Classes</h2>
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <p className="text-gray-600 text-sm">No upcoming classes booked.</p>
                    ) : (
                      bookings.map(b => (
                        <div key={b.id} className="p-4 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
                          <div>
                            <h4 className="font-bold">{b.class_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{b.date} at {b.start_time}</p>
                          </div>
                          <button onClick={() => handleCancelBooking(b.id)} className="text-red-400 hover:text-red-300 p-2 bg-red-500/10 rounded-lg transition" title="Cancel Booking">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'workouts' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full overflow-x-auto">
              <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">My Workout Log</h2>
                <button onClick={handleAddWorkout} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center shadow-sm shadow-blue-600/20">
                  <Plus className="w-4 h-4 mr-1" /> Log Workout
                </button>
              </div>
              <table className="w-full text-left border-collapse min-w-[600px] mt-4">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-700">Date</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Type</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Duration</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Calories</th>
                    <th className="p-4 font-semibold text-sm text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {workouts.map(w => (
                    <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-600">{w.date}</td>
                      <td className="p-4 font-medium text-slate-900">{w.type}</td>
                      <td className="p-4 text-gray-600">{w.duration_minutes} min</td>
                      <td className="p-4 text-gray-600">{w.calories_burned} kcal</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEditWorkout(w)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-medium text-slate-700">Edit</button>
                        <button onClick={() => handleDeleteWorkout(w.id)} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {workouts.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No workouts logged yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full overflow-x-auto">
              <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">My Bookings</h2>
                <a href="/classes" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition shadow-sm shadow-blue-600/20">
                  Browse Classes
                </a>
              </div>
              <table className="w-full text-left border-collapse min-w-[600px] mt-4">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-700">Class Name</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Date</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Time</th>
                    <th className="p-4 font-semibold text-sm text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{b.class_name}</td>
                      <td className="p-4 text-gray-600">{b.date}</td>
                      <td className="p-4 text-gray-600">{b.start_time}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleCancelBooking(b.id)} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium">Cancel</button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">You have no class bookings.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'membership' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-2xl mx-auto text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="text-blue-600 h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Current Plan</h2>
              {userMembership ? (
                <>
                  <p className="text-4xl font-bold text-blue-600 mb-2">{userMembership.name}</p>
                  <p className="text-slate-600 mb-8">Valid until {new Date(userMembership.end_date).toLocaleDateString()}</p>
                </>
              ) : (
                <p className="text-xl text-slate-600 mb-8">You don't have an active membership plan.</p>
              )}

              <button onClick={() => setIsMembershipModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition shadow-md shadow-blue-600/20 w-full sm:w-auto">
                {userMembership ? 'Upgrade / Change Plan' : 'Subscribe to a Plan'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Workout Modal */}
      <Modal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} title={selectedWorkout?.id ? 'Edit Workout' : 'Log Workout'}>
        <form onSubmit={handleSaveWorkout} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
              <input required type="date" value={selectedWorkout?.date || ''} onChange={e => setSelectedWorkout({ ...selectedWorkout, date: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
              <select required value={selectedWorkout?.type || ''} onChange={e => setSelectedWorkout({ ...selectedWorkout, type: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                <option value="Cardio">Cardio</option>
                <option value="Strength">Strength</option>
                <option value="Yoga">Yoga</option>
                <option value="CrossFit">CrossFit</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Duration (min)</label>
              <input required type="number" value={selectedWorkout?.duration_minutes || ''} onChange={e => setSelectedWorkout({ ...selectedWorkout, duration_minutes: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Calories</label>
              <input type="number" value={selectedWorkout?.calories_burned || ''} onChange={e => setSelectedWorkout({ ...selectedWorkout, calories_burned: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Notes / Trainer Feedback</label>
            <textarea disabled={selectedWorkout?.id && selectedWorkout.notes?.includes('Trainer Note')} value={selectedWorkout?.notes || ''} onChange={e => setSelectedWorkout({ ...selectedWorkout, notes: e.target.value })} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${selectedWorkout?.id && selectedWorkout.notes?.includes('Trainer Note') ? 'opacity-70 cursor-not-allowed' : ''}`} rows="3" placeholder="How did it go?"></textarea>
            {selectedWorkout?.id && selectedWorkout.notes?.includes('Trainer Note') && <p className="text-xs text-yellow-500 mt-1">Contains trainer feedback. Cannot be edited.</p>}
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-full transition mt-4 shadow-md shadow-blue-600/20">
            Save Workout
          </button>
        </form>
      </Modal>

      {/* Change Membership Modal */}
      <Modal isOpen={isMembershipModalOpen} onClose={() => setIsMembershipModalOpen(false)} title="Select a Membership Plan">
        <form onSubmit={handleUpgradePlan} className="space-y-4">
          <p className="text-gray-600 text-sm mb-4">Choose a new plan. This will instantly replace your current active membership.</p>
          <div className="space-y-3">
            {memberships.map(m => (
              <label key={m.id} className={`block p-4 border rounded-xl cursor-pointer transition ${selectedPlanId == m.id ? 'bg-primary/10 border-primary' : 'bg-white border-gray-200 hover:bg-gray-100'}`}>
                <div className="flex items-center">
                  <input type="radio" name="plan" value={m.id} checked={selectedPlanId == m.id} onChange={(e) => setSelectedPlanId(e.target.value)} className="mr-3" />
                  <div className="flex-grow flex justify-between items-center">
                    <span className="font-bold text-lg">{m.name}</span>
                    <span className="font-bold text-blue-600">${m.price}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-full transition mt-6 shadow-md shadow-blue-600/20">
            Confirm Change
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default MemberDashboard;
