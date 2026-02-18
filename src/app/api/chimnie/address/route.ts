import { NextResponse } from 'next/server';
import { searchAddresses } from '@/lib/chimnie';

// GET /api/chimnie/address?postcode=SW1A1AA
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get('postcode');

  if (!postcode) {
    return NextResponse.json({ error: 'Postcode is required' }, { status: 400 });
  }

  try {
    const addresses = await searchAddresses(postcode);
    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Chimnie address search error:', error);
    return NextResponse.json(
      { error: 'Failed to search addresses', details: String(error) },
      { status: 502 }
    );
  }
}
