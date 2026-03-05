import { NextResponse } from 'next/server';
import {
  getPropertyByAddress,
  getPropertyByUprn,
  normaliseChimnieResponse,
  mapToBaspiFields,
  countPrepopulatedFields,
  estimateTimeSaved,
} from '@/lib/chimnie';

// GET /api/chimnie/property?address=42+Acacia+Avenue...&session=abc123
// GET /api/chimnie/property?uprn=123456789
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const session = searchParams.get('session') || undefined;
  const uprn = searchParams.get('uprn');

  if (!address && !uprn) {
    return NextResponse.json(
      { error: 'Either "address" (with optional "session") or "uprn" is required' },
      { status: 400 }
    );
  }

  try {
    const raw = address
      ? await getPropertyByAddress(address, session)
      : await getPropertyByUprn(uprn!);

    const normalised = normaliseChimnieResponse(raw);
    const mapped = mapToBaspiFields(normalised);
    const fieldCount = countPrepopulatedFields(mapped);
    const timeSaved = estimateTimeSaved(fieldCount);

    return NextResponse.json({
      fieldCount,
      timeSaved,
      prepopulated: mapped,
      chimnieData: {
        creditsUsed: normalised.creditsUsed,
        creditsRemaining: normalised.creditsRemaining,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };

    if (err.status === 404) {
      return NextResponse.json({
        fieldCount: 0,
        notFound: true,
        reason: 'Property not found in Chimnie database',
      });
    }

    console.error('Chimnie property lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property data' },
      { status: 502 }
    );
  }
}
