'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  
  // State untuk Reset Pemilih
  const [resetNis, setResetNis] = useState('');
  const [resetCategory, setResetCategory] = useState('OSIS');
  const [resetStatus, setResetStatus] = useState({ type: '', message: '' });
  
  // State untuk Koreksi Suara
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    if (isLoggedIn) fetchCandidates();
  }, [isLoggedIn]);

  const fetchCandidates = async () => {
    const { data } = await supabase.from('candidates').select('*').order('id', { ascending: true });
    if (data) setCandidates(data);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') { // GANTI PASSWORD DI SINI JIKA PERLU
      setIsLoggedIn(true);
    } else {
      alert('Password salah!');
    }
  };

  const handleResetVoter = async () => {
    if (!resetNis.trim()) {
      setResetStatus({ type: 'error', message: 'Masukkan Nomor Pemilih!' });
      return;
    }

    if (!confirm(`Yakin ingin mereset hak suara ${resetCategory} untuk Nomor ${resetNis}?`)) return;

    setResetStatus({ type: '', message: '' });
    const column = resetCategory === 'OSIS' ? 'has_voted_osis' : 'has_voted_mpk';

    try {
      // 1. Cek apakah nomor ada
      const { data: checkVoter } = await supabase.from('voters').select(column).eq('nis', resetNis).single();
      
      if (!checkVoter) {
        setResetStatus({ type: 'error', message: `Nomor ${resetNis} tidak ditemukan.` });
        return;
      }

      if (!checkVoter[column]) {
        setResetStatus({ type: 'error', message: `Nomor ${resetNis} memang belum memilih ${resetCategory}.` });
        return;
      }

      // 2. Lakukan Reset
      const { error } = await supabase.from('voters').update({ [column]: false }).eq('nis', resetNis);
      if (error) throw error;

      setResetStatus({ type: 'success', message: `Nomor ${resetNis} berhasil direset! Jangan lupa kurangi suara paslon jika perlu.` });
      setResetNis('');
    } catch (error) {
      setResetStatus({ type: 'error', message: 'Gagal melakukan reset.' });
    }
  };

  const handleAdjustVote = async (id, currentVotes, action) => {
    const newVotes = action === 'increase' ? currentVotes + 1 : currentVotes - 1;
    if (newVotes < 0) return;

    if (!confirm(`Yakin ingin ${action === 'increase' ? 'MENAMBAH' : 'MENGURANGI'} suara paslon ini?`)) return;

    await supabase.from('candidates').update({ votes: newVotes }).eq('id', id);
    fetchCandidates();
  };

  // --- TAMPILAN LOGIN ---
  if (!isLoggedIn) {
    return (
      <main className="h-screen w-full fixed inset-0 overflow-hidden overscroll-none touch-none bg-[#140F0A] flex items-center justify-center p-4">
        <div className="bg-[#1D160F] border border-[#C9A34A]/30 p-8 rounded-xl max-w-sm w-full text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-[#E7C875] mb-6 font-serif">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan Password..."
              className="w-full px-4 py-3 mb-6 rounded-md bg-[#241B12] border border-[#8A6F3C]/50 text-[#F2E8D5] focus:outline-none focus:border-[#C9A34A]"
            />
            <button type="submit" className="w-full bg-gradient-to-r from-[#B5872C] to-[#DDB65B] text-[#1A1206] font-bold py-3 rounded-md hover:brightness-110 transition-all">
              Masuk
            </button>
          </form>
          <a href="/" className="block mt-6 text-sm text-[#8A7A5E] hover:text-[#C9A34A]">&larr; Kembali ke Web</a>
        </div>
      </main>
    );
  }

  // --- TAMPILAN DASHBOARD ADMIN ---
  return (
    <main className="h-screen w-full fixed inset-0 overflow-hidden overscroll-none bg-[#140F0A] text-[#F2E8D5] py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      
      {/* Container Utama yang menyesuaikan tinggi layar */}
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
        
        {/* Header Admin (Terkunci di Atas) */}
        <div className="flex justify-between items-center mb-6 border-b border-[#C9A34A]/20 pb-4 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-[#E7C875] font-serif mb-1">Admin Dashboard</h1>
            <p className="text-[#8A7A5E] text-sm">Kelola reset nomor pemilih dan koreksi suara.</p>
          </div>
          <a href="/" className="px-5 py-2 rounded-full border border-[#8A6F3C] text-[#C9BBA0] hover:bg-[#1D160F] transition-colors text-sm">
            Keluar
          </a>
        </div>

        {/* Grid Konten (Mengisi Sisa Layar) */}
        <div className="grid md:grid-cols-2 gap-8 flex-grow overflow-hidden pb-4">
          
          {/* KOLOM 1: RESET PEMILIH (Statis) */}
          <div className="bg-[#1D160F] border border-[#C9A34A]/20 rounded-xl p-6 h-fit">
            <h2 className="text-xl font-bold text-[#F2E8D5] mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#C9A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Reset Status Pemilih
            </h2>
            
            <label className="block text-sm text-[#C9A34A] mb-2">Nomor Pemilih</label>
            <input
              type="number"
              value={resetNis}
              onChange={(e) => setResetNis(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-md bg-[#241B12] border border-[#8A6F3C]/50 text-white focus:outline-none focus:border-[#C9A34A]"
              placeholder="Contoh: 12"
            />

            <label className="block text-sm text-[#C9A34A] mb-2">Kategori Voting</label>
            <select
              value={resetCategory}
              onChange={(e) => setResetCategory(e.target.value)}
              className="w-full px-4 py-3 mb-6 rounded-md bg-[#241B12] border border-[#8A6F3C]/50 text-white focus:outline-none focus:border-[#C9A34A]"
            >
              <option value="OSIS">Kandidat OSIS</option>
              <option value="MPK">Kandidat MPK</option>
            </select>

            <button onClick={handleResetVoter} className="w-full bg-red-900/50 border border-red-500/50 text-red-200 font-bold py-3 rounded-md hover:bg-red-900 transition-colors">
              Reset Pemilih
            </button>

            {resetStatus.message && (
              <div className={`mt-4 p-3 text-sm rounded-md border ${resetStatus.type === 'success' ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-red-900/30 border-red-500/50 text-red-300'}`}>
                {resetStatus.message}
              </div>
            )}
          </div>

          {/* KOLOM 2: KOREKSI SUARA (Bisa di-scroll di bagian dalamnya saja) */}
          <div className="bg-[#1D160F] border border-[#C9A34A]/20 rounded-xl p-6 flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0">
              <h2 className="text-xl font-bold text-[#F2E8D5] mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#C9A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Koreksi Suara Manual
              </h2>
              <p className="text-xs text-[#8A7A5E] mb-6">Jika Anda mereset pemilih karena salah input, gunakan tombol (-) untuk membatalkan suara yang telanjur masuk ke paslon.</p>
            </div>

            {/* Area Daftar Kandidat yang bisa di-scroll secara internal */}
            <div className="space-y-4 overflow-y-auto pr-2 flex-grow custom-scrollbar">
              {candidates.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-[#241B12] rounded-lg border border-[#8A6F3C]/30">
                  <div className="flex-grow pr-4">
                    <span className="text-[10px] uppercase font-bold text-[#C9A34A] bg-[#2A2410] px-2 py-1 rounded">{c.category}</span>
                    <h3 className="font-bold text-sm text-[#F2E8D5] mt-1">{c.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleAdjustVote(c.id, c.votes, 'decrease')} className="w-8 h-8 flex items-center justify-center rounded bg-red-900/30 text-red-400 hover:bg-red-800 transition-colors">
                      -
                    </button>
                    <span className="font-mono text-xl text-[#E7C875] w-8 text-center">{c.votes}</span>
                    <button onClick={() => handleAdjustVote(c.id, c.votes, 'increase')} className="w-8 h-8 flex items-center justify-center rounded bg-green-900/30 text-green-400 hover:bg-green-800 transition-colors">
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Tambahan style CSS untuk mempercantik scrollbar internal (opsional) */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #140F0A; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #8A6F3C; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C9A34A; }
      `}</style>
    </main>
  );
}