/**
 * Chimnie Property Data API Client
 *
 * Fetches property data from Chimnie (https://docs.chimnie.com) and maps it
 * to BASPI form fields for prepopulation.
 *
 * IMPORTANT: The endpoint paths below are based on common UK property data API
 * patterns. Verify against docs.chimnie.com and update if needed.
 */

const CHIMNIE_BASE_URL = process.env.CHIMNIE_API_URL || 'https://api.chimnie.com/v1';
const CHIMNIE_API_KEY = process.env.CHIMNIE_API_KEY || '';

interface ChimnieAddress {
  uprn: string;
  address: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county?: string;
  postcode: string;
}

interface ChimniePropertyData {
  uprn?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    county?: string;
    postcode?: string;
  };
  property?: {
    type?: string; // detached, semi_detached, terraced, flat, etc.
    tenure?: string; // freehold, leasehold
    yearBuilt?: number;
    bedrooms?: number;
    bathrooms?: number;
    stories?: number;
    floorArea?: number;
  };
  epc?: {
    rating?: string; // A-G
    certificateNumber?: string;
    expiryDate?: string;
  };
  flood?: {
    riverRisk?: string; // high, medium, low, very_low
    surfaceWaterRisk?: string;
    hasFlooded?: boolean;
  };
  environment?: {
    listedBuilding?: boolean;
    listedGrade?: string;
    conservationArea?: boolean;
    treePreservation?: boolean;
    coastalErosionRisk?: boolean;
    radonAffected?: boolean;
    miningArea?: boolean;
    contamination?: boolean;
  };
  utilities?: {
    broadbandType?: string;
    mobileSignal?: string;
    gasConnected?: boolean;
    waterSupplier?: string;
    sewerageType?: string;
  };
  leasehold?: {
    remainingYears?: number;
    groundRent?: string;
    serviceCharge?: string;
    managementCompany?: string;
  };
  insurance?: {
    previousClaims?: boolean;
    rebuildCost?: number;
  };
  // Raw response for debugging
  _raw?: Record<string, unknown>;
}

/**
 * Search for addresses by postcode using Chimnie's address autocomplete
 */
export async function searchAddresses(postcode: string): Promise<ChimnieAddress[]> {
  if (!CHIMNIE_API_KEY) {
    throw new Error('CHIMNIE_API_KEY not configured');
  }

  const response = await fetch(
    `${CHIMNIE_BASE_URL}/address/search?postcode=${encodeURIComponent(postcode)}`,
    {
      headers: {
        'x-api-key': CHIMNIE_API_KEY,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Chimnie address search failed: ${response.status}`);
  }

  const data = await response.json();

  // Map Chimnie's response to our format
  // Adjust field names based on actual API response
  const results = Array.isArray(data) ? data : data.results || data.addresses || [];
  return results.map((item: Record<string, unknown>) => ({
    uprn: String(item.uprn || item.UPRN || ''),
    address: String(item.address || item.full_address || item.singleLineAddress || ''),
    addressLine1: String(item.addressLine1 || item.address_line_1 || item.line1 || ''),
    addressLine2: String(item.addressLine2 || item.address_line_2 || item.line2 || ''),
    city: String(item.city || item.town || item.post_town || ''),
    county: String(item.county || ''),
    postcode: String(item.postcode || postcode),
  }));
}

/**
 * Fetch full property data by UPRN
 */
export async function getPropertyData(uprn: string): Promise<ChimniePropertyData> {
  if (!CHIMNIE_API_KEY) {
    throw new Error('CHIMNIE_API_KEY not configured');
  }

  const response = await fetch(
    `${CHIMNIE_BASE_URL}/property/${encodeURIComponent(uprn)}`,
    {
      headers: {
        'x-api-key': CHIMNIE_API_KEY,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Chimnie property lookup failed: ${response.status}`);
  }

  const raw = await response.json();
  return normaliseChimnieResponse(raw);
}

/**
 * Normalise Chimnie's raw API response into our structured format.
 * This handles different possible field naming conventions.
 */
function normaliseChimnieResponse(raw: Record<string, unknown>): ChimniePropertyData {
  // Chimnie may nest data differently — this handles common patterns
  const prop = (raw.property || raw.attributes || raw) as Record<string, unknown>;
  const epc = (raw.epc || raw.energy || {}) as Record<string, unknown>;
  const flood = (raw.flood || raw.flooding || {}) as Record<string, unknown>;
  const env = (raw.environment || raw.environmental || raw.hazards || {}) as Record<string, unknown>;
  const utils = (raw.utilities || raw.services || {}) as Record<string, unknown>;
  const lease = (raw.leasehold || raw.lease || {}) as Record<string, unknown>;
  const addr = (raw.address || {}) as Record<string, unknown>;
  const ins = (raw.insurance || {}) as Record<string, unknown>;

  return {
    uprn: String(raw.uprn || raw.UPRN || ''),
    address: {
      line1: String(addr.line1 || addr.addressLine1 || addr.address_line_1 || ''),
      line2: String(addr.line2 || addr.addressLine2 || addr.address_line_2 || ''),
      city: String(addr.city || addr.town || addr.post_town || ''),
      county: String(addr.county || ''),
      postcode: String(addr.postcode || ''),
    },
    property: {
      type: normalisePropertyType(String(prop.type || prop.property_type || prop.propertyType || '')),
      tenure: normaliseTenure(String(prop.tenure || '')),
      yearBuilt: toNumber(prop.yearBuilt || prop.year_built || prop.constructionYear),
      bedrooms: toNumber(prop.bedrooms || prop.num_bedrooms),
      bathrooms: toNumber(prop.bathrooms || prop.num_bathrooms),
      stories: toNumber(prop.stories || prop.floors || prop.storeys),
      floorArea: toNumber(prop.floorArea || prop.floor_area || prop.totalFloorArea),
    },
    epc: {
      rating: normaliseEpcRating(String(epc.rating || epc.currentRating || epc.current_energy_rating || '')),
      certificateNumber: String(epc.certificateNumber || epc.certificate_number || epc.lmkKey || ''),
      expiryDate: String(epc.expiryDate || epc.expiry_date || ''),
    },
    flood: {
      riverRisk: String(flood.riverRisk || flood.river_risk || flood.fluvialRisk || ''),
      surfaceWaterRisk: String(flood.surfaceWaterRisk || flood.surface_water_risk || ''),
      hasFlooded: Boolean(flood.hasFlooded || flood.has_flooded || flood.previousFlooding),
    },
    environment: {
      listedBuilding: Boolean(env.listedBuilding || env.listed_building || env.isListed),
      listedGrade: String(env.listedGrade || env.listed_grade || ''),
      conservationArea: Boolean(env.conservationArea || env.conservation_area),
      treePreservation: Boolean(env.treePreservation || env.tree_preservation_order || env.tpo),
      coastalErosionRisk: Boolean(env.coastalErosion || env.coastal_erosion),
      radonAffected: Boolean(env.radon || env.radonAffected),
      miningArea: Boolean(env.mining || env.miningArea),
      contamination: Boolean(env.contamination || env.contaminated),
    },
    utilities: {
      broadbandType: String(utils.broadband || utils.broadbandType || ''),
      mobileSignal: String(utils.mobileSignal || utils.mobile_signal || ''),
      gasConnected: Boolean(utils.gasConnected || utils.gas_connected || utils.mainsGas),
      waterSupplier: String(utils.waterSupplier || utils.water_supplier || ''),
      sewerageType: String(utils.sewerage || utils.sewerageType || ''),
    },
    leasehold: {
      remainingYears: toNumber(lease.remainingYears || lease.remaining_years || lease.leaseRemaining),
      groundRent: String(lease.groundRent || lease.ground_rent || ''),
      serviceCharge: String(lease.serviceCharge || lease.service_charge || ''),
      managementCompany: String(lease.managementCompany || lease.management_company || ''),
    },
    insurance: {
      previousClaims: Boolean(ins.previousClaims || ins.previous_claims),
      rebuildCost: toNumber(ins.rebuildCost || ins.rebuild_cost),
    },
    _raw: raw,
  };
}

/**
 * Map Chimnie property data to BASPI form field values.
 * Returns a map of sectionKey -> { fieldKey: value }
 */
export function mapToBaspiFields(data: ChimniePropertyData): Record<string, Record<string, unknown>> {
  const fields: Record<string, Record<string, unknown>> = {};

  // Property Details
  const propDetails: Record<string, unknown> = {};
  if (data.address?.line1) propDetails.address_line1 = data.address.line1;
  if (data.address?.line2) propDetails.address_line2 = data.address.line2;
  if (data.address?.city) propDetails.city = data.address.city;
  if (data.address?.county) propDetails.county = data.address.county;
  if (data.address?.postcode) propDetails.postcode = data.address.postcode;
  if (data.property?.type) propDetails.property_type = data.property.type;
  if (data.property?.tenure) propDetails.tenure = data.property.tenure;
  if (data.property?.bedrooms) propDetails.num_bedrooms = data.property.bedrooms;
  if (data.property?.bathrooms) propDetails.num_bathrooms = data.property.bathrooms;
  if (data.property?.stories) propDetails.num_stories = data.property.stories;
  if (data.property?.yearBuilt) propDetails.year_built = String(data.property.yearBuilt);
  if (Object.keys(propDetails).length > 0) fields.property_details = propDetails;

  // Specialist Issues
  const specialist: Record<string, unknown> = {};
  if (data.flood?.hasFlooded !== undefined) specialist.has_flooding = data.flood.hasFlooded;
  if (data.environment?.listedBuilding !== undefined) {
    specialist.has_listed_building = data.environment.listedBuilding;
    if (data.environment.listedBuilding && data.environment.listedGrade) {
      specialist.listed_details = `Listed Grade ${data.environment.listedGrade}${data.environment.conservationArea ? ', in a conservation area' : ''}`;
    }
  }
  if (data.environment?.coastalErosionRisk !== undefined) specialist.has_coastal_erosion = data.environment.coastalErosionRisk;
  if (data.environment?.radonAffected !== undefined) specialist.has_radon = data.environment.radonAffected ? 'yes' : 'no';
  if (data.environment?.miningArea !== undefined) specialist.has_mining = data.environment.miningArea ? 'yes' : 'no';
  if (Object.keys(specialist).length > 0) fields.specialist_issues = specialist;

  // Environmental
  const environmental: Record<string, unknown> = {};
  if (data.environment?.contamination !== undefined) environmental.has_contamination = data.environment.contamination;
  if (data.environment?.treePreservation !== undefined) environmental.has_trees = data.environment.treePreservation;
  if (Object.keys(environmental).length > 0) fields.environmental = environmental;

  // Utilities & Services
  const utilities: Record<string, unknown> = {};
  if (data.utilities?.gasConnected !== undefined) utilities.gas_connected = data.utilities.gasConnected;
  if (data.utilities?.waterSupplier) utilities.water_supplier = data.utilities.waterSupplier;
  if (data.utilities?.sewerageType) utilities.sewerage_connection = normaliseSewerageType(data.utilities.sewerageType);
  if (data.utilities?.broadbandType) utilities.broadband_type = normaliseBroadbandType(data.utilities.broadbandType);
  if (data.utilities?.mobileSignal) utilities.mobile_signal = normaliseMobileSignal(data.utilities.mobileSignal);
  if (Object.keys(utilities).length > 0) fields.utilities_services = utilities;

  // Energy
  const energy: Record<string, unknown> = {};
  if (data.epc?.rating) energy.epc_rating = data.epc.rating;
  if (data.epc?.certificateNumber) energy.epc_certificate_number = data.epc.certificateNumber;
  if (data.epc?.expiryDate) energy.epc_expiry_date = data.epc.expiryDate;
  if (Object.keys(energy).length > 0) fields.energy = energy;

  // Additional Legal (leasehold)
  const legal: Record<string, unknown> = {};
  if (data.leasehold?.remainingYears) legal.has_leasehold_info = data.leasehold.remainingYears;
  if (data.leasehold?.groundRent) legal.ground_rent = data.leasehold.groundRent;
  if (data.leasehold?.serviceCharge) legal.service_charge = data.leasehold.serviceCharge;
  if (data.leasehold?.managementCompany) legal.management_company = data.leasehold.managementCompany;
  if (Object.keys(legal).length > 0) fields.additional_legal = legal;

  return fields;
}

/**
 * Count how many BASPI fields can be prepopulated from Chimnie data
 */
export function countPrepopulatedFields(mapped: Record<string, Record<string, unknown>>): number {
  return Object.values(mapped).reduce((sum, section) => sum + Object.keys(section).length, 0);
}

/**
 * Estimate time saved in minutes (assumes ~0.25 min per question)
 */
export function estimateTimeSaved(fieldCount: number): number {
  return Math.max(1, Math.round(fieldCount * 0.25));
}

// --- Normalisation helpers ---

function toNumber(val: unknown): number | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

function normalisePropertyType(raw: string): string {
  const lower = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (lower.includes('detach') && !lower.includes('semi')) return 'detached';
  if (lower.includes('semi')) return 'semi_detached';
  if (lower.includes('terrac') || lower.includes('mid')) return 'terraced';
  if (lower.includes('flat') || lower.includes('apart') || lower.includes('maisonette')) return 'flat';
  if (lower.includes('bungalow')) return 'bungalow';
  if (lower.includes('cottage')) return 'cottage';
  return '';
}

function normaliseTenure(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('freehold') && lower.includes('share')) return 'share_of_freehold';
  if (lower.includes('freehold')) return 'freehold';
  if (lower.includes('leasehold')) return 'leasehold';
  if (lower.includes('commonhold')) return 'commonhold';
  return '';
}

function normaliseEpcRating(raw: string): string {
  const upper = raw.toUpperCase().trim();
  if (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(upper)) return upper;
  return '';
}

function normaliseSewerageType(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('mains')) return 'mains';
  if (lower.includes('septic')) return 'septic_tank';
  if (lower.includes('cesspit') || lower.includes('cesspool')) return 'cesspit';
  if (lower.includes('treatment')) return 'treatment_plant';
  return '';
}

function normaliseBroadbandType(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('fttp') || lower.includes('full fibre')) return 'fibre_full';
  if (lower.includes('fttc') || lower.includes('fibre')) return 'fibre_cabinet';
  if (lower.includes('cable')) return 'cable';
  if (lower.includes('adsl')) return 'adsl';
  return '';
}

function normaliseMobileSignal(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('good') || lower.includes('strong')) return 'good';
  if (lower.includes('moderate') || lower.includes('average')) return 'moderate';
  if (lower.includes('poor') || lower.includes('weak')) return 'poor';
  if (lower.includes('none') || lower.includes('no')) return 'none';
  return '';
}
