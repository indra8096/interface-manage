import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Test simple - GET');
    return NextResponse.json({ message: 'Test simple fonctionne', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('❌ Erreur test simple:', error);
    return NextResponse.json({ error: 'Erreur test simple' }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🧪 Test simple - POST');
    return NextResponse.json({ message: 'Test simple POST fonctionne', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('❌ Erreur test simple POST:', error);
    return NextResponse.json({ error: 'Erreur test simple POST' }, { status: 500 });
  }
}
