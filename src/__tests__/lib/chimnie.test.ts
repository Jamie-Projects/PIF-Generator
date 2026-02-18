import { mapToBaspiFields, countPrepopulatedFields, estimateTimeSaved } from '@/lib/chimnie';

describe('mapToBaspiFields', () => {
  test('maps address fields to property_details', () => {
    const result = mapToBaspiFields({
      address: {
        line1: '42 Acacia Avenue',
        line2: 'Flat 3',
        city: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA',
      },
    });

    expect(result.property_details).toBeDefined();
    expect(result.property_details.address_line1).toBe('42 Acacia Avenue');
    expect(result.property_details.address_line2).toBe('Flat 3');
    expect(result.property_details.city).toBe('London');
    expect(result.property_details.county).toBe('Greater London');
    expect(result.property_details.postcode).toBe('SW1A 1AA');
  });

  test('maps property type and tenure', () => {
    const result = mapToBaspiFields({
      property: {
        type: 'semi_detached',
        tenure: 'freehold',
        bedrooms: 3,
        bathrooms: 2,
        stories: 2,
        yearBuilt: 1920,
      },
    });

    expect(result.property_details.property_type).toBe('semi_detached');
    expect(result.property_details.tenure).toBe('freehold');
    expect(result.property_details.num_bedrooms).toBe(3);
    expect(result.property_details.num_bathrooms).toBe(2);
    expect(result.property_details.num_stories).toBe(2);
    expect(result.property_details.year_built).toBe('1920');
  });

  test('maps EPC data to energy section', () => {
    const result = mapToBaspiFields({
      epc: {
        rating: 'C',
        certificateNumber: 'CERT-123',
        expiryDate: '2030-01-01',
      },
    });

    expect(result.energy).toBeDefined();
    expect(result.energy.epc_rating).toBe('C');
    expect(result.energy.epc_certificate_number).toBe('CERT-123');
    expect(result.energy.epc_expiry_date).toBe('2030-01-01');
  });

  test('maps flood data to specialist_issues', () => {
    const result = mapToBaspiFields({
      flood: { hasFlooded: true },
    });

    expect(result.specialist_issues).toBeDefined();
    expect(result.specialist_issues.has_flooding).toBe(true);
  });

  test('maps environment data to specialist_issues and environmental', () => {
    const result = mapToBaspiFields({
      environment: {
        listedBuilding: true,
        listedGrade: 'II',
        conservationArea: true,
        coastalErosionRisk: false,
        contamination: true,
        treePreservation: true,
      },
    });

    expect(result.specialist_issues.has_listed_building).toBe(true);
    expect(result.specialist_issues.listed_details).toContain('Grade II');
    expect(result.specialist_issues.listed_details).toContain('conservation area');
    expect(result.specialist_issues.has_coastal_erosion).toBe(false);
    expect(result.environmental.has_contamination).toBe(true);
    expect(result.environmental.has_trees).toBe(true);
  });

  test('maps utilities to utilities_services', () => {
    const result = mapToBaspiFields({
      utilities: {
        gasConnected: true,
        waterSupplier: 'Thames Water',
        sewerageType: 'mains',
        broadbandType: 'fttp',
        mobileSignal: 'good',
      },
    });

    expect(result.utilities_services.gas_connected).toBe(true);
    expect(result.utilities_services.water_supplier).toBe('Thames Water');
    expect(result.utilities_services.sewerage_connection).toBe('mains');
    expect(result.utilities_services.broadband_type).toBe('fibre_full');
    expect(result.utilities_services.mobile_signal).toBe('good');
  });

  test('maps leasehold data to additional_legal', () => {
    const result = mapToBaspiFields({
      leasehold: {
        remainingYears: 85,
        groundRent: '£250',
        serviceCharge: '£1200',
        managementCompany: 'ABC Management',
      },
    });

    expect(result.additional_legal).toBeDefined();
    expect(result.additional_legal.has_leasehold_info).toBe(85);
    expect(result.additional_legal.ground_rent).toBe('£250');
    expect(result.additional_legal.service_charge).toBe('£1200');
    expect(result.additional_legal.management_company).toBe('ABC Management');
  });

  test('omits sections with no data', () => {
    const result = mapToBaspiFields({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  test('omits fields with falsy/empty values', () => {
    const result = mapToBaspiFields({
      address: {
        line1: '',
        city: '',
        postcode: '',
      },
    });
    // Empty strings are falsy, so property_details should have no fields
    expect(result.property_details).toBeUndefined();
  });
});

describe('countPrepopulatedFields', () => {
  test('counts total fields across sections', () => {
    const mapped = {
      property_details: { address_line1: '123', city: 'London', postcode: 'SW1' },
      energy: { epc_rating: 'C' },
    };
    expect(countPrepopulatedFields(mapped)).toBe(4);
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
