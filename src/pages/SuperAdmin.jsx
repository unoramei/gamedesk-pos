import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ui/ConfirmModal';
import {
  Users, Plus, Search, Calendar, ShieldCheck,
  ShieldAlert, RefreshCcw, MoreVertical,
  Lock, Mail, Gamepad2, Loader2, X, LogOut, Edit
} from 'lucide-react';

export default function SuperAdmin() {
  const { signOut } = useAuth();
  const [clubs, setClubs] = useState(() => {
    const saved = localStorage.getItem('axiph_clubs');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [editingClub, setEditingClub] = useState(null);

  // New club form state
  const [newClub, setNewClub] = useState({
    name: '',
    login: '',
    password: '',
    subscriptionMonths: 1
  });

  const { signUp } = useAuth();
  useEffect(() => {
    fetchClubs();
  }, []);

  async function fetchClubs() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setClubs(data);
        localStorage.setItem('axiph_clubs', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching clubs:', err);
      showToast('Klublarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function toggleFreeze(clubId, currentStatus) {
    const { error } = await supabase
      .from('clubs')
      .update({ is_frozen: !currentStatus })
      .eq('id', clubId);

    if (!error) {
      // Update local state and storage
      const updatedClubs = clubs.map(c => 
        c.id === clubId ? { ...c, is_frozen: !currentStatus } : c
      );
      setClubs(updatedClubs);
      localStorage.setItem('axiph_clubs', JSON.stringify(updatedClubs));
      fetchClubs();
    }
  }

  async function updateSubscription(clubId, months) {
    const club = clubs.find(c => c.id === clubId);
    const date = new Date(club.subscription_expires_at || new Date());
    date.setMonth(date.getMonth() + months);

    const { error } = await supabase
      .from('clubs')
      .update({ subscription_expires_at: date.toISOString() })
      .eq('id', clubId);

    if (!error) {
      // Update local state and storage
      const updatedClubs = clubs.map(c => 
        c.id === clubId ? { ...c, subscription_expires_at: date.toISOString() } : c
      );
      setClubs(updatedClubs);
      localStorage.setItem('axiph_clubs', JSON.stringify(updatedClubs));
      fetchClubs();
    }
  }

  async function handleAddClub(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await signUp(
        newClub.login,
        newClub.password,
        newClub.name,
        newClub.subscriptionMonths
      );

      if (error) throw error;

      const clubData = data?.club; 
      
      // Update local storage immediately
      const currentClubs = JSON.parse(localStorage.getItem('axiph_clubs') || '[]');
      const updatedClubs = [clubData || { ...newClub, id: data.user.id }, ...currentClubs];
      setClubs(updatedClubs);
      localStorage.setItem('axiph_clubs', JSON.stringify(updatedClubs));

      setShowAddModal(false);
      setNewClub({ name: '', login: '', password: '', subscriptionMonths: 1 });
      fetchClubs();
      showToast('Klub muvaffaqiyatli qo\'shildi!', 'success');
    } catch (err) {
      showToast('Xato: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
                <ShieldCheck className="text-indigo-500 w-10 h-10" />
                SuperAdmin <span className="text-white/20 font-light">Panel</span>
              </h1>
              <p className="text-white/40">AXIPH POS ekotizimini boshqarish markazi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfirmLogout(true)}
              className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-6 py-4 rounded-2xl flex items-center gap-2 transition-all border border-white/10"
            >
              <LogOut size={20} />
              Chiqish
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-4 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              <Plus size={20} />
              Yangi Klub Qo'shish
            </button>
          </div>
        </div>
      </div>

      {/* Stats & Search */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <div className="text-white/40 text-sm mb-1 uppercase tracking-wider font-bold">Jami Klublar</div>
          <div className="text-3xl font-black">{clubs.length}</div>
        </div>
        <div className="md:col-span-2 relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-indigo-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Klub nomini qidiring..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-full min-h-[72px] bg-white/[0.03] border border-white/10 rounded-3xl pl-16 pr-6 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg"
          />
        </div>
      </div>

      {/* Clubs List */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-white/40">Klub Nomi</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-white/40">Status</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-white/40">Obuna Tugashi</th>
                  <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-white/40">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                    </td>
                  </tr>
                ) : filteredClubs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-white/20 italic">
                      Hech qanday klub topilmadi
                    </td>
                  </tr>
                ) : filteredClubs.map((club) => {
                  const isExpired = club.subscription_expires_at && new Date(club.subscription_expires_at) < new Date();
                  return (
                    <tr key={club.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-lg">{club.name}</div>
                        <div className="text-xs text-white/20 uppercase font-mono">{club.slug}</div>
                      </td>
                      <td className="px-8 py-6">
                        {club.is_frozen || isExpired ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider border border-red-500/20">
                            <ShieldAlert size={12} />
                            Muzlatilgan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                            <ShieldCheck size={12} />
                            Faol
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 font-mono text-sm">
                        {club.subscription_expires_at ? new Date(club.subscription_expires_at).toLocaleDateString() : 'Belgilanmagan'}
                        {isExpired && <div className="text-[10px] text-red-500 font-bold uppercase">Muddati o'tgan</div>}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingClub(club)}
                            className="p-3 bg-white/5 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-all"
                            title="Tahrirlash"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => toggleFreeze(club.id, club.is_frozen)}
                            className={`p-3 rounded-xl transition-all ${club.is_frozen ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                            title={club.is_frozen ? "Muzdan tushirish" : "Muzlatish"}
                          >
                            <Lock size={18} />
                          </button>
                          <button
                            onClick={() => updateSubscription(club.id, 1)}
                            className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all"
                            title="+1 Oy obuna"
                          >
                            <RefreshCcw size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Club Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isSubmitting && setShowAddModal(false)}
          />
          <div className="relative bg-[#141416] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black">Yangi Klub Qo'shish</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddClub} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 tracking-widest ml-1">Klub Nomi</label>
                <input
                  required
                  type="text"
                  value={newClub.name}
                  onChange={e => setNewClub({ ...newClub, name: e.target.value })}
                  placeholder="Masalan: Phoenix Gaming"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 tracking-widest ml-1">Login</label>
                <input
                  required
                  type="text"
                  value={newClub.login}
                  onChange={e => setNewClub({ ...newClub, login: e.target.value })}
                  placeholder="Klub logini (masalan: phoenix_club)"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 tracking-widest ml-1">Parol</label>
                <input
                  required
                  type="password"
                  value={newClub.password}
                  onChange={e => setNewClub({ ...newClub, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 tracking-widest ml-1">Dastlabki Obuna (Oy)</label>
                <select
                  value={newClub.subscriptionMonths}
                  onChange={e => setNewClub({ ...newClub, subscriptionMonths: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all appearance-none"
                >
                  <option value="1">1 Oy</option>
                  <option value="3">3 Oy</option>
                  <option value="6">6 Oy</option>
                  <option value="12">12 Oy</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl mt-4 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                Klubni Ro'yxatdan O'tkazish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Club Modal */}
      {editingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isSubmitting && setEditingClub(null)}
          />
          <div className="relative bg-[#141416] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black">Klubni Tahrirlash</h2>
              <button
                onClick={() => setEditingClub(null)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40"
              >
                <X size={24} />
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const { error } = await supabase
                    .from('clubs')
                    .update({
                      name: editingClub.name,
                      login: editingClub.login,
                      password: editingClub.password
                    })
                    .eq('id', editingClub.id);
                  
                  if (error) throw error;
                  showToast('Ma\'lumotlar yangilandi!', 'success');
                  setEditingClub(null);
                  fetchClubs();
                } catch (err) {
                  showToast('Xato: ' + err.message, 'error');
                } finally {
                  setIsSubmitting(false);
                }
              }} 
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 tracking-widest ml-1">Klub Nomi</label>
                <input
                  required
                  type="text"
                  value={editingClub.name}
                  onChange={e => setEditingClub({ ...editingClub, name: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 tracking-widest ml-1">Login</label>
                <input
                  required
                  type="text"
                  value={editingClub.login || ''}
                  onChange={e => setEditingClub({ ...editingClub, login: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-white/40 tracking-widest ml-1">Parol</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={editingClub.password || ''}
                    onChange={e => setEditingClub({ ...editingClub, password: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-white/20 mt-1 italic">Diqqat: Parol o'zgartirilsa, eski parol o'z kuchini yo'qotadi.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl mt-4 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <RefreshCcw size={20} />}
                O'zgarishlarni Saqlash
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmLogout}
        title="Tizimdan chiqish"
        message="SuperAdmin panelidan chiqishni tasdiqlaysizmi?"
        onConfirm={signOut}
        onCancel={() => setShowConfirmLogout(false)}
      />
    </div>
  );
}
