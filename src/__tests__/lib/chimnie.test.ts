import {
  normaliseChimnieResponse,
  mapToBaspiFields,
  countPrepopulatedFields,
  estimateTimeSaved,
  ChimniePropertyResponse,
  NormalisedPropertyData,
} from '@/lib/chimnie';

// Helper to build a minimal valid Chimnie API response
function buildChimnieResponse(
  overrides: Partial<{
    property: Partial<ChimniePropertyResponse['property']>;
    surroundings: Partial<ChimniePropertyResponse['surroundings']>;
    plus: Partial<ChimniePropertyResponse['plus']>;
  }> = {}
): ChimniePropertyResponse {
  return {
    property: {
      attributes: {
        status: {},
        indoor: {},
        outdoor: {},
        ...overrides.property?.attributes,
      },
      bills: {
        energy: {},
        telecoms: {},
        ...overrides.property?.bills,
      },
      ownership: {},
      ...overrides.property,
      // Re-apply nested overrides that got clobbered
      ...(overrides.property?.attributes ? { attributes: { status: {}, indoor: {}, outdoor: {}, ...overrides.property.attributes } } : {}),
      ...(overrides.property?.bills ? { bills: { energy: {}, telecoms: {}, ...overrides.property.bills } } : {}),
    },
    surroundings: {
      environment: {
        flood: {},
        subsidence: {},
        land: {},
        ...overrides.surroundings?.environment,
      },
      ...overrides.surroundings,
      ...(overrides.surroundings?.environment ? { environment: { flood: {}, subsidence: {}, land: {}, ...overrides.surroundings.environment } } : {}),
    },
    plus: {
      property: {
        attributes: {
          status: {},
          ...overrides.plus?.property?.attributes,
        },
        ...overrides.plus?.property,
        ...(overrides.plus?.property?.attributes ? { attributes: { status: {}, ...overrides.plus.property.attributes } } : {}),
      },
      ...overrides.plus,
    },
  };
}

describe('normaliseChimnieResponse', () => {
  test('extracts Plus fields (address, postcode, property_type)', () => {
    const raw = buildChimnieResponse({
      plus: {
        property: {
          attributes: {
            status: {
              address: '42 Acacia Avenue, London',
              postcode: 'SW1A 1AA',
              property_type: 'Semi-Detached',
              region: 'London',
            },
          },
        },
      },
    });

    const result = normaliseChimnieResponse(raw);
    expect(result.address).toBe('42 Acacia Avenue, London');
    expect(result.postcode).toBe('SW1A 1AA');
    expect(result.propertyType).toBe('Semi-Detached');
    expect(result.region).toBe('London');
  });

  test('extracts Core property fields', () => {
    const raw = buildChimnieResponse({
      property: {
        attributes: {
          status: {
            date_of_construction_declared_and_predicted: '1920',
          },
          indoor: {
            bedrooms_declared_and_predicted: 3,
            bathrooms_declared_and_predicted: 2,
            extension: true,
            floor_area: 120,
          },
          outdoor: {},
        },
        ownership: {
          lease_type: 'Freehold',
        },
        bills: { energy: {}, telecoms: {} },
      },
    });

    const result = normaliseChimnieResponse(raw);
    expect(result.tenure).toBe('Freehold');
    expect(result.bedrooms).toBe(3);
    expect(result.bathrooms).toBe(2);
    expect(result.yearBuilt).toBe('1920');
    expect(result.hasExtension).toBe(true);
    expect(result.floorArea).toBe(120);
  });

  test('extracts energy and telecoms data', () => {
    const raw = buildChimnieResponse({
      property: {
        attributes: { status: {}, indoor: {}, outdoor: {} },
        ownership: {},
        bills: {
          energy: {
            current_energy_rating_declared_only: 'C',
            expiry_date: '2030-01-15',
            mains_gas_flag_declared_only: true,
            heating_types: ['gas central heating'],
          },
          telecoms: {
            maximum_broadband_speed: 100,
          },
        },
      },
    });

    const result = normaliseChimnieResponse(raw);
    expect(result.epcRating).toBe('C');
    expect(result.epcExpiry).toBe('2030-01-15');
    expect(result.gasConnected).toBe(true);
    expect(result.heatingTypes).toEqual(['gas central heating']);
    expect(result.broadbandSpeed).toBe(100);
  });

  test('extracts listed building data', () => {
    const raw = buildChimnieResponse({
      property: {
        attributes: {
          status: {
            listed_building: { is_listed: true },
            listed_buildings: [{ grade: 'II' }],
          },
          indoor: {},
          outdoor: {},
        },
        bills: { energy: {}, telecoms: {} },
        ownership: {},
      },
    });

    const result = normaliseChimnieResponse(raw);
    expect(result.listedBuilding).toBe(true);
    expect(result.listedGrade).toBe('II');
  });

  test('extracts surroundings/environment data', () => {
    const raw = buildChimnieResponse({
      surroundings: {
        environment: {
          flood: {
            flood_risk_rivers_sea: 5,
            distance_from_coast: 500,
            distance_from_river: 200,
          },
          subsidence: {
            subsidence_risk: 'moderate',
          },
          land: {
            radon: { affected: true },
            in_coal_mining_reporting_area: true,
            historic_landfill: { affected: false },
          },
        },
      },
    });

    const result = normaliseChimnieResponse(raw);
    expect(result.floodRiskRiversSea).toBe(5);
    expect(result.distanceFromCoast).toBe(500);
    expect(result.distanceFromRiver).toBe(200);
    expect(result.subsidenceRisk).toBe('moderate');
    expect(result.radonAffected).toBe(true);
    expect(result.coalMiningArea).toBe(true);
    expect(result.landfillAffected).toBe(false);
  });
});

describe('mapToBaspiFields', () => {
  test('maps property type and tenure to property_details', () => {
    const data: NormalisedPropertyData = {
      propertyType: 'Semi-Detached',
      tenure: 'Freehold',
      bedrooms: 3,
      bathrooms: 2,
      yearBuilt: '1920',
      postcode: 'SW1A 1AA',
    };

    const result = mapToBaspiFields(data);
    expect(result.property_details).toBeDefined();
    expect(result.property_details.property_type).toBe('semi_detached');
    expect(result.property_details.tenure).toBe('freehold');
    expect(result.property_details.num_bedrooms).toBe(3);
    expect(result.property_details.num_bathrooms).toBe(2);
    expect(result.property_details.year_built).toBe('1920');
    expect(result.property_details.postcode).toBe('SW1A 1AA');
  });

  test('maps extension to alterations', () => {
    const result = mapToBaspiFields({ hasExtension: true });
    expect(result.alterations).toBeDefined();
    expect(result.alterations.has_extensions).toBe(true);
  });

  test('maps flood risk to specialist_issues', () => {
    const result = mapToBaspiFields({
      floodRiskRiversSea: 5,
      distanceFromRiver: 200,
      distanceFromCoast: 500,
    });

    expect(result.specialist_issues).toBeDefined();
    expect(result.specialist_issues.has_flooding).toBe(true);
    expect(result.specialist_issues.flooding_details).toContain('5%');
    expect(result.specialist_issues.flooding_details).toContain('200m from nearest river');
    expect(result.specialist_issues.has_coastal_erosion).toBe(true); // 500m < 1000m
  });

  test('maps zero flood risk correctly', () => {
    const result = mapToBaspiFields({ floodRiskRiversSea: 0 });
    expect(result.specialist_issues.has_flooding).toBe(false);
  });

  test('maps listed building info', () => {
    const result = mapToBaspiFields({
      listedBuilding: true,
      listedGrade: 'II',
    });

    expect(result.specialist_issues.has_listed_building).toBe(true);
    expect(result.specialist_issues.listed_details).toBe('Listed Grade II');
  });

  test('maps subsidence, radon, mining', () => {
    const result = mapToBaspiFields({
      subsidenceRisk: 'moderate',
      radonAffected: true,
      coalMiningArea: false,
    });

    expect(result.specialist_issues.has_subsidence).toBe(true);
    expect(result.specialist_issues.has_radon).toBe('yes');
    expect(result.specialist_issues.has_mining).toBe('no');
  });

  test('maps landfill to environmental contamination', () => {
    const result = mapToBaspiFields({ landfillAffected: true });
    expect(result.environmental.has_contamination).toBe(true);
  });

  test('maps energy data', () => {
    const result = mapToBaspiFields({
      epcRating: 'C',
      epcExpiry: '2030-01-15',
    });

    expect(result.energy).toBeDefined();
    expect(result.energy.epc_rating).toBe('C');
    expect(result.energy.epc_expiry_date).toBe('2030-01-15');
  });

  test('maps utilities: gas, heating, broadband', () => {
    const result = mapToBaspiFields({
      gasConnected: true,
      heatingTypes: ['gas central heating'],
      broadbandSpeed: 100,
    });

    expect(result.utilities_services).toBeDefined();
    expect(result.utilities_services.gas_connected).toBe(true);
    expect(result.utilities_services.heating_type).toBe('gas');
    expect(result.utilities_services.broadband_type).toBe('fibre_cabinet');
  });

  test('derives broadband type from speed', () => {
    expect(mapToBaspiFields({ broadbandSpeed: 1000 }).utilities_services.broadband_type).toBe('fibre_full');
    expect(mapToBaspiFields({ broadbandSpeed: 50 }).utilities_services.broadband_type).toBe('fibre_cabinet');
    expect(mapToBaspiFields({ broadbandSpeed: 15 }).utilities_services.broadband_type).toBe('cable');
    expect(mapToBaspiFields({ broadbandSpeed: 5 }).utilities_services.broadband_type).toBe('adsl');
  });

  test('maps leasehold tenure to additional_legal', () => {
    const result = mapToBaspiFields({ tenure: 'Leasehold' });
    expect(result.additional_legal).toBeDefined();
    expect(result.additional_legal.has_leasehold_info).toBe(true);
  });

  test('does not create additional_legal for freehold', () => {
    const result = mapToBaspiFields({ tenure: 'Freehold' });
    expect(result.additional_legal).toBeUndefined();
  });

  test('omits sections with no data', () => {
    const result = mapToBaspiFields({});
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('countPrepopulatedFields', () => {
  test('counts total fields across sections', () => {
    const mapped = {
      property_details: { property_type: 'detached', postcode: 'SW1' },
      energy: { epc_rating: 'C' },
    };
    expect(countPrepopulatedFields(mapped)).toBe(3);
  });

  test('returns 0 for empty map', () => {
    expect(countPrepopulatedFields({})).toBe(0);
  });
});

describe('estimateTimeSaved', () => {
  test('returns at least 1 minute', () => {
    expect(estimateTimeSaved(0)).toBe(1);
    expect(estimateTimeSaved(1)).toBe(1);
  });

  test('calculates based on field count', () => {
    expect(estimateTimeSaved(20)).toBe(5);
    expect(estimateTimeSaved(40)).toBe(10);
  });
});
