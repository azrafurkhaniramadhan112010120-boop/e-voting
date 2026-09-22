import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { nis, candidateId, category } = await request.json();

    if (!nis || !candidateId || !category) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // 1. Cek NIS
    const { data: voter, error: voterError } = await supabase
      .from('voters')
      .select('*')
      .eq('nis', nis)
      .single();

    if (voterError || !voter) {
      return NextResponse.json({ error: 'NIS tidak terdaftar dalam DPT.' }, { status: 400 });
    }

    // 2. Cek apakah sudah memilih di kategori ini
    const hasVotedColumn = category === 'OSIS' ? 'has_voted_osis' : 'has_voted_mpk';
    
    if (voter[hasVotedColumn]) {
      return NextResponse.json({ error: `Anda sudah memberikan suara untuk pemilihan ${category}.` }, { status: 403 });
    }

    // 3. Update status pemilih
    const { error: updateVoterError } = await supabase
      .from('voters')
      .update({ [hasVotedColumn]: true })
      .eq('nis', nis);

    if (updateVoterError) throw updateVoterError;

    // 4. Tambahkan suara ke kandidat
    const { data: candidate } = await supabase.from('candidates').select('votes').eq('id', candidateId).single();
    await supabase.from('candidates').update({ votes: candidate.votes + 1 }).eq('id', candidateId);

    return NextResponse.json({ message: `Voting ${category} berhasil direkam!` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}