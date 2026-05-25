import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Calendar, Users, Edit, Trash2, Plus, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const TrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [loading, setLoading] = useState(true);

  // Data
  const [classes, setClasses] = useState([]);
  const [clients, setClients] = useState([]);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientWorkouts, setClientWorkouts] = useState([]);
  const [workoutNote, setWorkoutNote] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'classes') {
        const res = await api.get('/trainer/classes');
        setClasses(res.data);
      } else if (activeTab === 'clients') {
        const res = await api.get('/trainer/clients');
        setClients(res.data);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // --- CLASSES ---
  const handleCreateClass = () => {
    setSelectedClass({ name: '', description: '', capacity: 15, date: '', start_time: '', end_time: '' });
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      if (selectedClass.id) {
        await api.put(`/admin/classes/${selectedClass.id}`, selectedClass); // Using the same endpoint
        toast.success('Class updated');
      } else {
        await api.post(`/admin/classes`, selectedClass);
        toast.success('Class created');
      }
      setIsClassModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save class');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this class?')) return;
    try {
      await api.delete(`/trainer/classes/${id}`);
      toast.success('Class cancelled successfully');
      setClasses(classes.filter(c => c.id !== id));
    } catch (err) {
      toast.error('Failed to cancel class');
    }
  };

  // --- CLIENTS ---
  const handleViewClient = async (client) => {
    setSelectedClient(client);
    setIsClientModalOpen(true);
    try {
      const res = await api.get(`/trainer/clients/${client.id}/workouts`);
      setClientWorkouts(res.data);
    } catch (err) {
      toast.error('Failed to load client workouts');
    }
  };

  const handleAddNote = async (workoutId) => {
    const note = workoutNote[workoutId];
    if (!note) return;
    try {
      await api.put(`/trainer/workouts/${workoutId}/notes`, { notes: note });
      toast.success('Note added successfully');
      setWorkoutNote({ ...workoutNote, [workoutId]: '' });
      // Refresh workouts
      handleViewClient(selectedClient);
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8 text-gradient">Trainer Dashboard</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        {['classes', 'clients'].map(tab => (
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
          {activeTab === 'classes' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full overflow-x-auto">
              <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center text-slate-900"><Calendar className="mr-2 h-5 w-5 text-blue-600" /> My Schedule</h2>
                <button onClick={handleCreateClass} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center shadow-sm shadow-blue-600/20">
                  <Plus className="w-4 h-4 mr-1" /> New Class
                </button>
              </div>
              <table className="w-full text-left border-collapse min-w-[600px] mt-4">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-700">Name</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Date</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Time</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Capacity</th>
                    <th className="p-4 font-semibold text-sm text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classes.map(cls => (
                    <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium">{cls.name}</td>
                      <td className="p-4 text-gray-600">{cls.date}</td>
                      <td className="p-4 text-gray-600">{cls.start_time} - {cls.end_time}</td>
                      <td className="p-4 text-gray-600">{cls.capacity}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => { setSelectedClass(cls); setIsClassModalOpen(true); }} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-medium text-slate-700">Edit</button>
                        <button onClick={() => handleDeleteClass(cls.id)} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">You have no upcoming classes.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map(client => (
                <div key={client.id} className="glass-card p-8 flex flex-col justify-between">
                  <div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="text-blue-600 h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-1 text-slate-900">{client.name}</h3>
                    <p className="text-sm text-slate-600 mb-4">{client.email}</p>
                  </div>
                  <button onClick={() => handleViewClient(client)} className="w-full bg-white hover:bg-slate-50 text-slate-900 font-medium py-2 rounded-full transition mt-4 border border-slate-200 shadow-sm">
                    View Progress
                  </button>
                </div>
              ))}
              {clients.length === 0 && (
                <div className="col-span-full text-center text-gray-500 p-8 glass-card">No clients have booked your classes yet.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* Class Modal */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title={selectedClass?.id ? 'Edit Class' : 'Create Class'}>
        <form onSubmit={handleSaveClass} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Class Name</label>
            <input required type="text" value={selectedClass?.name || ''} onChange={e => setSelectedClass({ ...selectedClass, name: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
            <textarea required value={selectedClass?.description || ''} onChange={e => setSelectedClass({ ...selectedClass, description: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" rows="2"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
              <input required type="date" value={selectedClass?.date || ''} onChange={e => setSelectedClass({ ...selectedClass, date: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Capacity</label>
              <input required type="number" value={selectedClass?.capacity || 15} onChange={e => setSelectedClass({ ...selectedClass, capacity: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Start Time</label>
              <input required type="time" value={selectedClass?.start_time || ''} onChange={e => setSelectedClass({ ...selectedClass, start_time: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">End Time</label>
              <input required type="time" value={selectedClass?.end_time || ''} onChange={e => setSelectedClass({ ...selectedClass, end_time: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-full transition mt-4 shadow-md shadow-blue-600/20">
            Save Class
          </button>
        </form>
      </Modal>

      {/* Client Progress Modal */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title={`${selectedClient?.name}'s Progress`}>
        <div className="space-y-6">
          {clientWorkouts.length === 0 ? (
            <p className="text-gray-600 text-center py-4">This client hasn't logged any workouts yet.</p>
          ) : (
            clientWorkouts.map(w => (
              <div key={w.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-lg text-blue-600">{w.type}</h4>
                    <p className="text-xs text-gray-600">{w.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{w.duration_minutes} min</p>
                    <p className="text-xs text-yellow-500">{w.calories_burned} kcal</p>
                  </div>
                </div>
                {w.notes && (
                  <div className="mt-3 p-3 bg-slate-100 rounded-xl text-sm text-slate-700 whitespace-pre-wrap">
                    {w.notes}
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a trainer note..."
                    className="flex-grow bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={workoutNote[w.id] || ''}
                    onChange={(e) => setWorkoutNote({ ...workoutNote, [w.id]: e.target.value })}
                  />
                  <button onClick={() => handleAddNote(w.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition shadow-sm">
                    <MessageSquare size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

    </div>
  );
};

export default TrainerDashboard;
