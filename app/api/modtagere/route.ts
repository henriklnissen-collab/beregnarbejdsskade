import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Henter de modtagere, der må få forespørgsler.
 *
 * Kun aktive modtagere vises. Et selskab bliver aktivt, når aftalen
 * er på plads — sæt aktiv = true på rækken i Supabase.
 *
 * Mailadresserne sendes ikke med til browseren. Kunden skal vælge
 * hvem, ikke se hvor posten lander.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await db()
      .from('modtagere')
      .select('id, navn, type, sortering')
      .eq('aktiv', true)
      .order('sortering');

    if (error) throw error;

    return NextResponse.json({ modtagere: data ?? [] }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e: any) {
    console.error('Kunne ikke hente modtagere:', e?.message ?? e);
    return NextResponse.json(
      { fejl: 'Vi kunne ikke hente listen over selskaber lige nu.' },
      { status: 502 },
    );
  }
}
