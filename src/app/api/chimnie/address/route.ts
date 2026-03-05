import { NextResponse } from 'next/server';
import { autocompleteAddress, searchPostcode } from '@/lib/chimnie';

// GET /api/chimnie/address?postcode=SW1A1AA
// GET /api/chimnie/address?query=42+Acacia&session=abc123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get('postcode');
  const query = searchParams.get('query');
  const session = searchParams.get('session') || undefined;

  if (!postcode && !query) {
    return NextResponse.json(
      { error: 'Either "postcode" or "query" parameter is required' },
      { status: 400 }
    );
  }

  try {
    if (postcode) {
      const result = await searchPostcode(postcode);
      return NextResponse.json({
        addresses: result.addresses,
        session: result.session,
      });
    }

    // Autocomplete mode
    const result = await autocompleteAddress(query!, session);
    return NextResponse.json({
      addresses: result.addresses,
      highlights: result.highlights.map(h => h.replace(/<[^>]*>/g, '')),
      session: result.session,
    });
  } catch (error) {
    console.error('Chimnie address search error:', error);
    return NextResponse.json(
      { error: 'Failed to search addresses' },
      { status: 502 }
    );
  }
}
