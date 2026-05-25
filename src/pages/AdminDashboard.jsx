import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Users, Calendar, Activity, DollarSign, Edit, Trash2, Plus, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState({ totalUsers: 0, totalClasses: 0, totalBookings: 0, totalRevenue: 0 });
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [memberships, setMemberships] = useState([]);

  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'classes') {
        const res = await api.get('/classes'); // Public route has all classes
        setClasses(res.data);
      } else if (activeTab === 'memberships') {
        const res = await api.get('/memberships'); // Public route has all memberships
        setMemberships(res.data);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // --- USER Handlers ---
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${selectedUser.id}`, selectedUser);
      toast.success('User updated successfully');
      setIsUserModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  // --- CLASS Handlers ---
  const handleEditClass = (cls) => {
    setSelectedClass(cls);
    setIsClassModalOpen(true);
  };

  const handleCreateClass = () => {
    setSelectedClass({ name: '', description: '', capacity: 20, date: '', start_time: '', end_time: '' });
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      if (selectedClass.id) {
        await api.put(`/admin/classes/${selectedClass.id}`, selectedClass);
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
    if (!window.confirm('Delete this class?')) return;
    try {
      await api.delete(`/admin/classes/${id}`);
      toast.success('Class deleted');
      setClasses(classes.filter(c => c.id !== id));
    } catch (err) {
      toast.error('Failed to delete class');
    }
  };

  // --- MEMBERSHIP Handlers ---
  const handleEditMembership = (m) => {
    setSelectedMembership(m);
    setIsMembershipModalOpen(true);
  };

  const handleCreateMembership = () => {
    setSelectedMembership({ name: '', description: '', price: 0, duration_months: 1, features: [] });
    setIsMembershipModalOpen(true);
  };

  const handleSaveMembership = async (e) => {
    e.preventDefault();
    try {
      if (selectedMembership.id) {
        await api.put(`/admin/memberships/${selectedMembership.id}`, selectedMembership);
        toast.success('Membership updated');
      } else {
        await api.post(`/admin/memberships`, selectedMembership);
        toast.success('Membership created');
      }
      setIsMembershipModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save membership');
    }
  };

  const handleDeleteMembership = async (id) => {
    if (!window.confirm('Delete this membership?')) return;
    try {
      await api.delete(`/admin/memberships/${id}`);
      toast.success('Membership deleted');
      setMemberships(memberships.filter(m => m.id !== id));
    } catch (err) {
      toast.error('Failed to delete membership');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8 text-gradient">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        {['overview', 'users', 'classes', 'memberships'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium transition-colors capitalize whitespace-nowrap ${activeTab === tab ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner size={40} className="my-20" />
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="glass-card p-8 flex items-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="text-blue-600 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                  </div>
                </div>
                <div className="glass-card p-8 flex items-center">
                  <div className="h-12 w-12 bg-sky-100 rounded-full flex items-center justify-center mr-4">
                    <Calendar className="text-sky-600 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Classes</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalClasses}</p>
                  </div>
                </div>
                <div className="glass-card p-8 flex items-center">
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                    <Activity className="text-emerald-600 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
                  </div>
                </div>
                <div className="glass-card p-8 flex items-center">
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <DollarSign className="text-amber-600 h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue?.toFixed(2) || 0}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 h-[400px]">
                <h2 className="text-xl font-bold mb-6 text-slate-900">System Overview</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Users', value: stats.totalUsers },
                    { name: 'Classes', value: stats.totalClasses },
                    { name: 'Bookings', value: stats.totalBookings }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full overflow-x-auto">
              <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Manage Users</h2>
              </div>
              <table className="w-full text-left border-collapse min-w-[600px] mt-4">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-700">Name</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Email</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Role</th>
                    <th className="p-4 font-semibold text-sm text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'Admin' ? 'bg-red-100 text-red-700' :
                            user.role === 'Trainer' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEditUser(user)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-medium">Edit</button>
                        <button onClick={() => handleDeleteUser(user.id)} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CLASSES TAB */}
          {activeTab === 'classes' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full overflow-x-auto">
              <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Manage Classes</h2>
                <button onClick={handleCreateClass} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition flex items-center text-sm shadow-sm shadow-blue-600/20">
                  <Plus className="w-4 h-4 mr-1" /> Add Class
                </button>
              </div>
              <table className="w-full text-left border-collapse min-w-[600px] mt-4">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-700">Name</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Trainer</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Date & Time</th>
                    <th className="p-4 font-semibold text-sm text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classes.map(cls => (
                    <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">{cls.name}</td>
                      <td className="p-4 text-gray-600">{cls.trainer_name || 'TBD'}</td>
                      <td className="p-4 text-gray-600">{cls.date} ({cls.start_time}-{cls.end_time})</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEditClass(cls)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-medium">Edit</button>
                        <button onClick={() => handleDeleteClass(cls.id)} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MEMBERSHIPS TAB */}
          {activeTab === 'memberships' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full overflow-x-auto">
              <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Manage Memberships</h2>
                <button onClick={handleCreateMembership} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition flex items-center text-sm shadow-sm shadow-blue-600/20">
                  <Plus className="w-4 h-4 mr-1" /> Add Membership
                </button>
              </div>
              <table className="w-full text-left border-collapse min-w-[600px] mt-4">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-700">Plan Name</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Price</th>
                    <th className="p-4 font-semibold text-sm text-gray-700">Duration (Mo)</th>
                    <th className="p-4 font-semibold text-sm text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {memberships.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium">{m.name}</td>
                      <td className="p-4 text-blue-600 font-bold">${m.price}</td>
                      <td className="p-4 text-gray-600">{m.duration_months}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleEditMembership(m)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-medium text-slate-700">Edit</button>
                        <button onClick={() => handleDeleteMembership(m.id)} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* MODALS */}

      {/* Edit User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Edit User Role">
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Name</label>
            <input type="text" value={selectedUser?.name || ''} disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
            <select
              value={selectedUser?.role || 'Member'}
              onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="Member">Member</option>
              <option value="Trainer">Trainer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-full transition mt-4 shadow-md shadow-blue-600/20">
            Save Changes
          </button>
        </form>
      </Modal>

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
              <input required type="number" value={selectedClass?.capacity || 20} onChange={e => setSelectedClass({ ...selectedClass, capacity: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
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

      {/* Membership Modal */}
      <Modal isOpen={isMembershipModalOpen} onClose={() => setIsMembershipModalOpen(false)} title={selectedMembership?.id ? 'Edit Membership' : 'Create Membership'}>
        <form onSubmit={handleSaveMembership} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Plan Name</label>
            <input required type="text" value={selectedMembership?.name || ''} onChange={e => setSelectedMembership({ ...selectedMembership, name: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Price ($)</label>
              <input required type="number" step="0.01" value={selectedMembership?.price || 0} onChange={e => setSelectedMembership({ ...selectedMembership, price: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Duration (Months)</label>
              <input required type="number" value={selectedMembership?.duration_months || 1} onChange={e => setSelectedMembership({ ...selectedMembership, duration_months: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Features (Comma separated)</label>
            <textarea
              required
              value={typeof selectedMembership?.features === 'string' ? selectedMembership.features : (selectedMembership?.features?.join(', ') || '')}
              onChange={e => setSelectedMembership({ ...selectedMembership, features: e.target.value.split(',').map(s => s.trim()) })}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" rows="3"
            ></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-full transition mt-4 shadow-md shadow-blue-600/20">
            Save Membership
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default AdminDashboard;
