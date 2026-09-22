'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [candidates, setCandidates] = useState([]);
  const [nis, setNis] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('OSIS');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('*')
      .order('id', { ascending: true });

    if (data) setCandidates(data);
  };

  const handleVote = async (candidateId) => {
    if (!nis.trim()) {
      setStatus({ type: 'error', message: 'Harap masukkan Nomor Urut Pemilih Anda terlebih dahulu!' });
      return;
    }

    if (!confirm(`Apakah Anda yakin memilih kandidat ini untuk ${activeTab}?`)) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nis, candidateId, category: activeTab }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: result.message });
        setNis('');
        fetchCandidates();
      } else {
        setStatus({ type: 'error', message: result.error });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Gagal terhubung ke server.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter((c) => c.category === activeTab);

  return (
    <main className="h-screen w-full fixed inset-0 overflow-hidden overscroll-none bg-[#140F0A] text-[#F2E8D5] relative">
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

        .vote-btn {
          background: linear-gradient(180deg, #DDB65B 0%, #B5872C 100%);
          transition: filter 0.2s ease, transform 0.2s ease;
        }
        .vote-btn:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .vote-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .vote-btn:focus-visible, .tab-btn:focus-visible, .nis-input:focus-visible {
          outline: 2px solid #E7C875;
          outline-offset: 2px;
        }

        /* Custom Scrollbar agar senada dengan tema */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #8A6F3C; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C9A34A; }
      `}</style>

      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 0%, rgba(201,163,74,0.10) 0%, rgba(20,15,10,0) 70%)',
        }}
      />

      {/* Kontainer Scrollable Internal */}
      <div className="w-full h-full overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-5xl mx-auto relative min-h-full flex flex-col py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          
          {/* Tombol Login Admin (Pojok Kanan Atas) */}
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 rise-in" style={{ animationDelay: '500ms' }}>
            <a
              href="/admin"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1D160F] border border-[#C9A34A]/20 text-[#8A7A5E] hover:text-[#E7C875] hover:border-[#C9A34A] transition-all"
              title="Login Admin"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </a>
          </div>

          {/* Header */}
          <div className="text-center mb-12 rise-in mt-6 sm:mt-0">
            <h1 className="font-display text-4xl sm:text-5xl font-medium text-[#F2E8D5] tracking-tight mb-4">
              Pemilihan Ketua OSIS &amp; MPK
            </h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-10 bg-[#8A6F3C]" />
              <span className="w-1.5 h-1.5 rotate-45 bg-[#C9A34A]" />
              <span className="h-px w-10 bg-[#8A6F3C]" />
            </div>
            <p className="font-body text-[#C9BBA0] text-[15px]">
              Gunakan Nomor Urut Pemilih untuk memberikan suara.
            </p>
          </div>

          {/* NIS panel */}
          <div
            className="rise-in mb-10 max-w-md mx-auto w-full rounded-lg p-6 bg-[#1D160F] border border-[#C9A34A]/25"
            style={{ animationDelay: '80ms' }}
          >
            <label className="font-body block text-[13px] font-medium text-[#C9A34A] mb-2">
              Nomor Urut Pemilih
            </label>
            <input
              type="number" /* Saya kembalikan ke type="number" agar numpad otomatis muncul di HP */
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              className="nis-input font-body w-full px-4 py-3 rounded-md bg-[#241B12] border border-[#8A6F3C]/50 text-[#F2E8D5] placeholder-[#8A7A5E] focus:outline-none focus:border-[#C9A34A] transition-colors"
              placeholder="Masukkan Nomor (1-200)..."
              disabled={loading}
            />
          </div>

          {/* Status message */}
          {status.message && (
            <div
              className={`font-body rise-in p-4 mb-10 w-full rounded-md text-center text-sm max-w-md mx-auto border ${
                status.type === 'success'
                  ? 'bg-[#2A2410] text-[#E7C875] border-[#C9A34A]/40'
                  : 'bg-[#2A150F] text-[#E2A98F] border-[#C1440E]/40'
              }`}
            >
              {status.message}
            </div>
          )}

          {/* Category switch */}
          <div className="flex justify-center gap-8 mb-12 rise-in" style={{ animationDelay: '120ms' }}>
            {['OSIS', 'MPK'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`tab-btn font-body pb-2 text-base font-semibold tracking-wide transition-colors ${
                  activeTab === tab
                    ? 'text-[#E7C875] border-b-2 border-[#C9A34A]'
                    : 'text-[#8A7A5E] border-b-2 border-transparent hover:text-[#C9BBA0]'
                }`}
              >
                Kandidat {tab}
              </button>
            ))}
          </div>

          {/* Candidate list */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {filteredCandidates.map((c, i) => (
              <div
                key={c.id}
                className="rise-in relative flex flex-col w-full sm:w-[340px] rounded-lg bg-[#1D160F] border border-[#C9A34A]/20 p-6"
                style={{ animationDelay: `${160 + i * 60}ms` }}
              >
                {/* corner ornaments */}
                <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#C9A34A]/60" />
                <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#C9A34A]/60" />
                <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#C9A34A]/60" />
                <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#C9A34A]/60" />

                <div className="mb-5 w-full overflow-hidden rounded-md bg-[#0F0B07] flex items-center justify-center p-2 ring-1 ring-[#C9A34A]/20">
                  {c.photo_url ? (
                    <img
                      src={c.photo_url}
                      alt={c.name}
                      className="w-full h-auto object-contain rounded max-h-[480px]"
                    />
                  ) : (
                    <span className="font-body text-[#8A7A5E] text-sm py-20">
                      Foto belum tersedia
                    </span>
                  )}
                </div>

                <div className="flex-grow">
                  <h2 className="font-display text-xl font-medium text-[#F2E8D5] mb-4">
                    {c.name}
                  </h2>
                  <div className="border-l-2 border-[#8A6F3C]/60 pl-4 mb-6">
                    <p className="font-body text-[14px] text-[#C9BBA0] italic leading-relaxed">
                      {c.vision}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleVote(c.id)}
                  disabled={loading}
                  className="vote-btn font-body w-full text-[#1A1206] font-semibold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Memproses...' : `Pilih untuk ${activeTab}`}
                </button>
              </div>
            ))}

            {filteredCandidates.length === 0 && (
              <div className="font-body w-full text-center text-[#8A7A5E] py-10 rise-in">
                Belum ada kandidat terdaftar untuk kategori {activeTab}.
              </div>
            )}
          </div>

          {/* Tombol ke Halaman Hasil (Didorong ke bawah) */}
          <div className="mt-auto text-center pb-8 rise-in" style={{ animationDelay: '400ms' }}>
            <a
              href="/hasil"
              className="font-body inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1D160F] border border-[#C9A34A]/30 text-[#C9BBA0] hover:text-[#E7C875] hover:border-[#C9A34A] transition-all group shadow-lg"
            >
              <span>Lihat Live Quick Count</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}