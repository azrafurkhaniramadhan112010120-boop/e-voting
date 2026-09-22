'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function HasilVoting() {
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState({ OSIS: 0, MPK: 0, ALL: 0 });

  useEffect(() => {
    fetchData();

    // Listener Realtime Supabase
    const channel = supabase
      .channel('realtime_candidates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'candidates' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .order('votes', { ascending: false }); // Urutkan dari suara terbanyak
    
    if (data) {
      setCandidates(data);
      
      // Hitung total suara spesifik per kategori untuk kalkulasi persentase
      const osisTotal = data.filter(c => c.category === 'OSIS').reduce((sum, cand) => sum + (cand.votes || 0), 0);
      const mpkTotal = data.filter(c => c.category === 'MPK').reduce((sum, cand) => sum + (cand.votes || 0), 0);
      
      setTotalVotes({
        OSIS: osisTotal,
        MPK: mpkTotal,
        ALL: osisTotal + mpkTotal
      });
    }
  };

  // Komponen Helper untuk me-render Grafik Bar per Kategori
  const renderGraphicSection = (categoryTitle, totalKategori) => {
    const categoryCandidates = candidates.filter(c => c.category === categoryTitle);

    return (
      <div className="mb-16 rise-in" style={{ animationDelay: '120ms' }}>
        <div className="flex justify-between items-end mb-6 border-b border-[#C9A34A]/20 pb-4">
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#E7C875]">
            Grafik Suara {categoryTitle}
          </h2>
          <span className="font-body text-sm text-[#8A7A5E]">Total: {totalKategori} Suara</span>
        </div>

        <div className="flex flex-col gap-6">
          {categoryCandidates.map((c, index) => {
            // Kalkulasi persentase
            const percentage = totalKategori > 0 ? ((c.votes || 0) / totalKategori) * 100 : 0;
            
            return (
              <div key={c.id} className="bg-[#1D160F] border border-[#C9A34A]/20 rounded-xl p-5 sm:p-6 relative overflow-hidden group">
                
                {/* Detail Kandidat */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail Foto Lingkaran */}
                    {c.photo_url && (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#8A6F3C]/50 flex-shrink-0 bg-[#0F0B07]">
                        <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="font-display text-lg sm:text-xl text-[#F2E8D5]">{c.name}</h3>
                  </div>
                  
                  <div className="text-right flex flex-col">
                    <span className="font-display text-2xl sm:text-3xl font-medium text-[#E7C875]">
                      {c.votes || 0}
                    </span>
                    <span className="font-body text-xs text-[#8A7A5E] uppercase tracking-wider">Suara</span>
                  </div>
                </div>

                {/* Trek Progress Bar */}
                <div className="h-3 w-full bg-[#0F0B07] rounded-full overflow-hidden relative z-10 ring-1 ring-[#C9A34A]/10">
                  {/* Isi Progress Bar Beranimasi */}
                  <div 
                    className="h-full bg-gradient-to-r from-[#B5872C] to-[#DDB65B] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                {/* Teks Persentase di Kanan Bawah */}
                <div className="text-right mt-2 relative z-10">
                  <span className="font-body text-[13px] font-semibold text-[#C9BBA0]">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#140F0A] text-[#F2E8D5] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-body { font-family: 'Inter', sans-serif; }

        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise-in { animation: riseIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }

        @media (prefers-reduced-motion: reduce) {
          .rise-in { animation: none; }
        }
      `}</style>

      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(60% 40% at 50% 0%, rgba(201,163,74,0.10) 0%, rgba(20,15,10,0) 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto relative">
        
        {/* Header */}
        <div className="text-center mb-16 rise-in">
          <h1 className="font-display text-4xl sm:text-5xl font-medium text-[#F2E8D5] tracking-tight mb-4">
            Live Quick Count
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-10 bg-[#8A6F3C]" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#C9A34A] animate-pulse" />
            <span className="h-px w-10 bg-[#8A6F3C]" />
          </div>
          <p className="font-body text-[#C9BBA0] text-[15px]">
            Data masuk keseluruhan: <span className="text-[#E7C875] font-semibold">{totalVotes.ALL}</span> suara
          </p>
        </div>

        {/* Render Grafik OSIS */}
        {renderGraphicSection('OSIS', totalVotes.OSIS)}

        {/* Render Grafik MPK */}
        {renderGraphicSection('MPK', totalVotes.MPK)}
        <div className="mt-4 text-center rise-in" style={{ animationDelay: '400ms' }}>
          <a
            href="/"
            className="font-body inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1D160F] border border-[#C9A34A]/30 text-[#C9BBA0] hover:text-[#E7C875] hover:border-[#C9A34A] transition-all group shadow-lg"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span>Kembali ke Halaman Voting</span>
          </a>
        </div>
      </div>
    </main>
  );
}