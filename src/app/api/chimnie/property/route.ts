import { NextResponse } from 'next/server';
import { getPropertyData, mapToBaspiFields, countPrepopulatedFields, estimateTimeSaved } from '@/lib/chimnie';

// GET /api/chimnie/property?uprn=123456789
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uprn = searchParams.get('uprn');

  if (!uprn) {
    return NextResponse.json({ error: 'UPRN is required' }, { status: 400 });
  }

  try {
    const propertyData = await getPropertyData(uprn);
    const mapped = mapToBaspiFields(propertyData);
    const fieldCount = countPrepopulatedFields(mapped);
    const timeSaved = estimateTimeSaved(fieldCount);

    return NextResponse.json({
      fieldCount,
      timeSaved,
      prepopulated: mapped,
    });
  } catch (error) {
    console.error('Chimnie property lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property data', details: String(error) },
      { status: 502 }
    );
  }
}
