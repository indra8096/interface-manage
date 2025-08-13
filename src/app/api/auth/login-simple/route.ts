import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 LOGIN SIMPLE - Début');
    
    // Test 1: Vérifier que la route est accessible
    console.log('✅ Route accessible');
    
    // Test 2: Vérifier le body
    const body = await req.json();
    console.log('✅ Body reçu:', { email: body.email, hasPassword: !!body.password });
    
    // Test 3: Réponse simple
    console.log('✅ Envoi de la réponse');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Login simple fonctionne',
      received: { email: body.email, hasPassword: !!body.password }
    });
    
  } catch (error) {
    console.error('❌ Erreur login simple:', error);
    return NextResponse.json({ 
      error: 'Erreur login simple',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}
