import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params;

    // Vérifier que c'est un service personnalisé (commence par 'custom-')
    if (!serviceId.startsWith('custom-')) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un service prédéfini' },
        { status: 403 }
      );
    }

    // Supprimer le service de la base de données
    // Note: Pour l'instant, on utilise le localStorage, mais on pourrait ajouter une table services dans la DB
    // await prisma.service.delete({
    //   where: { id: serviceId }
    // });

    return NextResponse.json(
      { message: 'Service supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression du service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du service' },
      { status: 500 }
    );
  }
} 