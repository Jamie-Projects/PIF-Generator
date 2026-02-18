/**
 * Chimnie Property Data API Client
 *
 * Fetches property data from Chimnie (https://docs.chimnie.com) and maps it
 * to BASPI form fields for prepopulation.
 *
 * Uses Core + Plus tier (2 credits per lookup): fields=property,surroundings,plus
 */

const CHIMNIE_BASE_URL = process.env.CHIMNIE_API_URL || 'https://api.chimnie.com';
const CHIMNIE_API_KEY = process.env.CHIMNIE_API_KEY || '';

// --- Response types matching real Chimnie API ---

export interface ChimnieAutocompleteResponse {
  addresses: string[];
  highlights: string[];
  session: string;
}

export interface ChimniePostcodeResponse {
  addresses: string[];
  session: string;
}

export interface ChimniePropertyResponse {
  property: {
    attributes: {
      status: {
        listed_building?: { is_listed?: boolean };
        listed_buildings?: { grade?: string }[];
        date_of_construction_declared_and_predicted?: string;
      };
      indoor: {
        bedrooms_declared_and_predicted?: number;
        bathrooms_declared_and_predicted?: number;
        extension?: boolean;
        floor_area?: number;
      };
      outdoor: {
        shed?: boolean;
        garage?: boolean;
      };
    };
    bills: {
      energy: {
        current_energy_rating_declared_only?: string;
        expiry_date?: string;
        mains_gas_flag_declared_only?: boolean;
        heating_types?: string[];
      };
      telecoms: {
        maximum_broadband_speed?: number;
      };
    };
    ownership: {
      lease_type?: string;
      occupancy_status?: string;
    };
    value?: {
      sale?: Record<string, unknown>;
    };
  };
  surroundings: {
    environment: {
      flood: {
        flood_risk_rivers_sea?: number;
        distance_from_coast?: number;
        distance_from_river?: number;
      };
      subsidence: {
        subsidence_risk?: string;
      };
      land: {
        radon?: { affected?: boolean };
        in_coal_mining_reporting_area?: boolean;
        historic_landfill?: { affected?: boolean };
      };
    };
  };
  plus: {
    property: {
      attributes: {
        status: {
          address?: string;
          postcode?: string;
          property_type?: string;
          region?: string;
        };
      };
    };
  };
  chimnie_data?: {
    credits_used?: number;
    credits_remaining?: number;
  };
}

// --- Normalised internal types ---

export interface NormalisedPropertyData {
  address?: string;
  postcode?: string;
  propertyType?: string;
  region?: string;
  tenure?: string;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: string;
  hasExtension?: boolean;
  floorArea?: number;
  epcRating?: string;
  epcExpiry?: string;
  gasConnected?: boolean;
  heatingTypes?: string[];
  broadbandSpeed?: number;
  listedBuilding?: boolean;
  listedGrade?: string;
  floodRiskRiversSea?: number;
  distanceFromCoast?: number;
  distanceFromRiver?: number;
  subsidenceRisk?: string;
  radonAffected?: boolean;
  coalMiningArea?: boolean;
  landfillAffected?: boolean;
  creditsUsed?: number;
  creditsRemaining?: number;
}

function getHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${CHIMNIE_API_KEY}`,
    'Accept': 'application/json',
  };
}

/**
 * Autocomplete address search — free when followed by a property lookup within the same session.
 */
export async function autocompleteAddress(
  query: string,
  session?: string
): Promise<ChimnieAutocompleteResponse> {
  if (!CHIMNIE_API_KEY) {
    throw new Error('CHIMNIE_API_KEY not configured');
  }

  const params = new URLSearchParams({ max_results: '7' });
  if (session) params.set('session', session);

  const response = await fetch(
    `${CHIMNIE_BASE_URL}/residential/autocomplete/${encodeURIComponent(query)}?${params}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw new Error(`Chimnie autocomplete failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Search addresses by postcode.
 */
export async function searchPostcode(postcode: string): Promise<ChimniePostcodeResponse> {
  if (!CHIMNIE_API_KEY) {
    throw new Error('CHIMNIE_API_KEY not configured');
  }

  const response = await fetch(
    `${CHIMNIE_BASE_URL}/residential/postcode/${encodeURIComponent(postcode)}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw new Error(`Chimnie postcode search failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get property data by full address string. Primary lookup method.
 * Uses Core + Plus fields (2 credits).
 */
export async function getPropertyByAddress(
  address: string,
  autocompleteSession?: string
): Promise<ChimniePropertyResponse> {
  if (!CHIMNIE_API_KEY) {
    throw new Error('CHIMNIE_API_KEY not configured');
  }

  const params = new URLSearchParams({ fields: 'property,surroundings,plus' });
  if (autocompleteSession) params.set('autocomplete_session', autocompleteSession);

  const response = await fetch(
    `${CHIMNIE_BASE_URL}/residential/address/${encodeURIComponent(address)}?${params}`,
    { headers: getHeaders() }
  );

  if (response.status === 404) {
    const error = new Error('Property not found') as Error & { status: number };
    error.status = 404;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`Chimnie address lookup failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get property data by UPRN. Fallback lookup method.
 * Uses Core + Plus fields (2 credits).
 */
export async function getPropertyByUprn(uprn: string): Promise<ChimniePropertyResponse> {
  if (!CHIMNIE_API_KEY) {
    throw new Error('CHIMNIE_API_KEY not configured');
  }

  const response = await fetch(
    `${CHIMNIE_BASE_URL}/residential/uprn/${encodeURIComponent(uprn)}?fields=property,surroundings,plus`,
    { headers: getHeaders() }
  );

  if (response.status === 404) {
    const error = new Error('Property not found') as Error & { status: number };
    error.status = 404;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`Chimnie UPRN lookup failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Normalise a raw Chimnie API response into a flat structure for easier mapping.
 */
export function normaliseChimnieResponse(raw: ChimniePropertyResponse): NormalisedPropertyData {
  const p = raw.property;
  const s = raw.surroundings;
  const pl = raw.plus;

  const listedBuildings = p.attributes.status.listed_buildings || [];
  const listedGrade = listedBuildings.length > 0 ? listedBuildings[0].grade : undefined;

  return {
    // Plus fields
    address: pl?.property?.attributes?.status?.address,
    postcode: pl?.property?.attributes?.status?.postcode,
    propertyType: pl?.property?.attributes?.status?.property_type,
    region: pl?.property?.attributes?.status?.region,

    // Core property fields
    tenure: p.ownership?.lease_type,
    bedrooms: p.attributes.indoor?.bedrooms_declared_and_predicted,
    bathrooms: p.attributes.indoor?.bathrooms_declared_and_predicted,
    yearBuilt: p.attributes.status?.date_of_construction_declared_and_predicted,
    hasExtension: p.attributes.indoor?.extension,
    floorArea: p.attributes.indoor?.floor_area,

    // Energy / bills
    epcRating: normaliseEpcRating(p.bills?.energy?.current_energy_rating_declared_only || ''),
    epcExpiry: p.bills?.energy?.expiry_date,
    gasConnected: p.bills?.energy?.mains_gas_flag_declared_only,
    heatingTypes: p.bills?.energy?.heating_types,
    broadbandSpeed: p.bills?.telecoms?.maximum_broadband_speed,

    // Environment - listed building
    listedBuilding: p.attributes.status?.listed_building?.is_listed,
    listedGrade,

    // Surroundings
    floodRiskRiversSea: s.environment?.flood?.flood_risk_rivers_sea,
    distanceFromCoast: s.environment?.flood?.distance_from_coast,
    distanceFromRiver: s.environment?.flood?.distance_from_river,
    subsidenceRisk: s.environment?.subsidence?.subsidence_risk,
    radonAffected: s.environment?.land?.radon?.affected,
    coalMiningArea: s.environment?.land?.in_coal_mining_reporting_area,
    landfillAffected: s.environment?.land?.historic_landfill?.affected,

    // Credits
    creditsUsed: raw.chimnie_data?.credits_used,
    creditsRemaining: raw.chimnie_data?.credits_remaining,
  };
}

/**
 * Map normalised Chimnie property data to BASPI form field values.
 * Returns a map of sectionKey -> { fieldKey: value }
 */
export function mapToBaspiFields(data: NormalisedPropertyData): Record<string, Record<string, unknown>> {
  const fields: Record<string, Record<string, unknown>> = {};

  // Property Details
  const propDetails: Record<string, unknown> = {};
  if (data.propertyType) propDetails.property_type = normalisePropertyType(data.propertyType);
  if (data.tenure) propDetails.tenure = normaliseTenure(data.tenure);
  if (data.bedrooms !== undefined) propDetails.num_bedrooms = data.bedrooms;
  if (data.bathrooms !== undefined) propDetails.num_bathrooms = data.bathrooms;
  if (data.yearBuilt) propDetails.year_built = data.yearBuilt;
  if (data.postcode) propDetails.postcode = data.postcode;
  if (Object.keys(propDetails).length > 0) fields.property_details = propDetails;

  // Alterations
  const alterations: Record<string, unknown> = {};
  if (data.hasExtension !== undefined) alterations.has_extensions = data.hasExtension;
  if (Object.keys(alterations).length > 0) fields.alterations = alterations;

  // Specialist Issues
  const specialist: Record<string, unknown> = {};
  if (data.floodRiskRiversSea !== undefined) {
    specialist.has_flooding = data.floodRiskRiversSea > 0;
    if (data.floodRiskRiversSea > 0) {
      const parts: string[] = [`Flood risk (rivers/sea): ${data.floodRiskRiversSea}%`];
      if (data.distanceFromRiver !== undefined) parts.push(`${data.distanceFromRiver}m from nearest river`);
      if (data.distanceFromCoast !== undefined) parts.push(`${data.distanceFromCoast}m from coast`);
      specialist.flooding_details = parts.join('. ');
    }
  }
  if (data.subsidenceRisk !== undefined) {
    specialist.has_subsidence = data.subsidenceRisk !== 'none' && data.subsidenceRisk !== '';
  }
  if (data.radonAffected !== undefined) specialist.has_radon = data.radonAffected ? 'yes' : 'no';
  if (data.coalMiningArea !== undefined) specialist.has_mining = data.coalMiningArea ? 'yes' : 'no';
  if (data.listedBuilding !== undefined) {
    specialist.has_listed_building = data.listedBuilding;
    if (data.listedBuilding && data.listedGrade) {
      specialist.listed_details = `Listed Grade ${data.listedGrade}`;
    }
  }
  if (data.distanceFromCoast !== undefined) {
    specialist.has_coastal_erosion = data.distanceFromCoast < 1000;
  }
  if (Object.keys(specialist).length > 0) fields.specialist_issues = specialist;

  // Environmental
  const environmental: Record<string, unknown> = {};
  if (data.landfillAffected !== undefined) environmental.has_contamination = data.landfillAffected;
  if (Object.keys(environmental).length > 0) fields.environmental = environmental;

  // Utilities & Services
  const utilities: Record<string, unknown> = {};
  if (data.gasConnected !== undefined) utilities.gas_connected = data.gasConnected;
  if (data.heatingTypes && data.heatingTypes.length > 0) {
    utilities.heating_type = normaliseHeatingType(data.heatingTypes);
  }
  if (data.broadbandSpeed !== undefined) {
    utilities.broadband_type = deriveBroadbandType(data.broadbandSpeed);
  }
  if (Object.keys(utilities).length > 0) fields.utilities_services = utilities;

  // Energy
  const energy: Record<string, unknown> = {};
  if (data.epcRating) energy.epc_rating = data.epcRating;
  if (data.epcExpiry) energy.epc_expiry_date = data.epcExpiry;
  if (Object.keys(energy).length > 0) fields.energy = energy;

  // Additional Legal (leasehold)
  const legal: Record<string, unknown> = {};
  if (data.tenure && data.tenure.toLowerCase().includes('leasehold')) {
    legal.has_leasehold_info = true;
  }
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

function normaliseHeatingType(types: string[]): string {
  const joined = types.join(' ').toLowerCase();
  if (joined.includes('gas')) return 'gas';
  if (joined.includes('electric')) return 'electric';
  if (joined.includes('oil')) return 'oil';
  if (joined.includes('heat pump') || joined.includes('heatpump')) return 'heat_pump';
  return types[0] || '';
}

function deriveBroadbandType(speedMbps: number): string {
  if (speedMbps >= 900) return 'fibre_full';
  if (speedMbps >= 30) return 'fibre_cabinet';
  if (speedMbps >= 10) return 'cable';
  return 'adsl';
}
