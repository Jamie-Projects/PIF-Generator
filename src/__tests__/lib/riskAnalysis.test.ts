import { analyseRisks } from '@/lib/riskAnalysis';

function makeSections(overrides: Record<string, Record<string, unknown>> = []) {
  const defaults: Record<string, Record<string, unknown>> = {
    property_details: {},
    seller_details: {},
    disputes_complaints: {},
    alterations: {},
    notices: {},
    specialist_issues: {},
    fixtures_fittings: {},
    utilities_services: {},
    insurance: {},
    boundaries: {},
    rights_arrangements: {},
    environmental: {},
    legal_ownership: {},
    legal_boundaries: {},
    services_crossing: {},
    energy: {},
    guarantees_warranties: {},
    occupiers: {},
    completion_moving: {},
    additional_legal: {},
    declaration: {},
  };

  const merged = { ...defaults, ...overrides };
  return Object.entries(merged).map(([sectionKey, data]) => ({ sectionKey, data }));
}

describe('analyseRisks', () => {
  test('returns empty summary when no data is answered', () => {
    const result = analyseRisks(makeSections(), '123 Main St', 'John');
    expect(result.redFlags).toEqual([]);
    expect(result.amberFlags).toEqual([]);
    expect(result.greenCount).toBe(0);
    expect(result.totalChecked).toBe(0);
    expect(result.propertyAddress).toBe('123 Main St');
    expect(result.sellerName).toBe('John');
    expect(result.generatedAt).toBeTruthy();
  });

  test('counts green when risk fields answered with safe values', () => {
    const result = analyseRisks(makeSections({
      disputes_complaints: {
        has_neighbour_disputes: false,
        has_legal_action: false,
        has_antisocial_behaviour: false,
        has_noise_issues: false,
      },
    }), '', '');

    expect(result.redFlags).toHaveLength(0);
    expect(result.amberFlags).toHaveLength(0);
    expect(result.greenCount).toBe(4);
    expect(result.totalChecked).toBe(4);
  });

  // === RED FLAG TESTS ===

  test('flags neighbour dispute as red', () => {
    const result = analyseRisks(makeSections({
      disputes_complaints: { has_neighbour_disputes: true },
    }), '', '');

    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].fieldKey).toBe('has_neighbour_disputes');
    expect(result.redFlags[0].level).toBe('red');
    expect(result.redFlags[0].section).toBe('Disputes & Complaints');
  });

  test('flags legal action as red', () => {
    const result = analyseRisks(makeSections({
      disputes_complaints: { has_legal_action: true },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].fieldKey).toBe('has_legal_action');
  });

  test('flags extension with no approvals as red', () => {
    const result = analyseRisks(makeSections({
      alterations: { has_extensions: true, extension_approved: 'neither' },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].fieldKey).toBe('extension_approved');
    expect(result.redFlags[0].summary).toContain('without planning permission');
  });

  test('flags unknown extension approval as red', () => {
    const result = analyseRisks(makeSections({
      alterations: { has_extensions: true, extension_approved: 'unknown' },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].summary).toContain('unknown');
  });

  test('extension_approved is skipped when has_extensions is false', () => {
    const result = analyseRisks(makeSections({
      alterations: { has_extensions: false, extension_approved: 'neither' },
    }), '', '');
    expect(result.redFlags).toHaveLength(0);
  });

  test('flags building control notices as red', () => {
    const result = analyseRisks(makeSections({
      notices: { has_building_control_notices: true },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].fieldKey).toBe('has_building_control_notices');
  });

  test('flags environmental notices as red', () => {
    const result = analyseRisks(makeSections({
      notices: { has_environmental_notices: true },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].fieldKey).toBe('has_environmental_notices');
  });

  test('flags japanese knotweed as red', () => {
    const result = analyseRisks(makeSections({
      specialist_issues: { has_japanese_knotweed: true },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].fieldKey).toBe('has_japanese_knotweed');
  });

  test('flags flooding as red', () => {
    const result = analyseRisks(makeSections({
      specialist_issues: { has_flooding: true },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].fieldKey).toBe('has_flooding');
  });

  test('flags subsidence as red', () => {
    const result = analyseRisks(makeSections({
      specialist_issues: { has_subsidence: true },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].fieldKey).toBe('has_subsidence');
  });

  test('flags coastal erosion as red', () => {
    const result = analyseRisks(makeSections({
      specialist_issues: { has_coastal_erosion: true },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
  });

  test('flags insurance refused as red', () => {
    const result = analyseRisks(makeSections({
      insurance: { has_insurance_refused: true },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].fieldKey).toBe('has_insurance_refused');
  });

  test('flags boundary disputes as red', () => {
    const result = analyseRisks(makeSections({
      boundaries: { has_boundary_disputes: true },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
  });

  test('flags not all owners agree as red', () => {
    const result = analyseRisks(makeSections({
      legal_ownership: { all_owners_agree: false },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].summary).toContain('Not all legal owners');
  });

  test('flags boundaries not matching title as red', () => {
    const result = analyseRisks(makeSections({
      legal_boundaries: { boundaries_match_title: false },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
  });

  test('flags tenants as red', () => {
    const result = analyseRisks(makeSections({
      occupiers: { has_tenants: true },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
  });

  test('flags occupiers not vacating as red', () => {
    const result = analyseRisks(makeSections({
      occupiers: { all_occupiers_will_vacate: false },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
  });

  test('flags contamination as red', () => {
    const result = analyseRisks(makeSections({
      environmental: { has_contamination: true },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
  });

  test('flags dependent purchase still searching as red', () => {
    const result = analyseRisks(makeSections({
      completion_moving: {
        has_dependent_purchase: true,
        dependent_purchase_status: 'searching',
      },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].summary).toContain('still searching');
  });

  test('flags short lease under 80 years as red', () => {
    const result = analyseRisks(makeSections({
      additional_legal: { has_leasehold_info: 65 },
    }), '', '');
    expect(result.redFlags).toHaveLength(1);
    expect(result.redFlags[0].summary).toContain('65 years');
  });

  // === AMBER FLAG TESTS ===

  test('flags antisocial behaviour as amber', () => {
    const result = analyseRisks(makeSections({
      disputes_complaints: { has_antisocial_behaviour: true },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
    expect(result.amberFlags[0].level).toBe('amber');
  });

  test('flags noise issues as amber', () => {
    const result = analyseRisks(makeSections({
      disputes_complaints: { has_noise_issues: true },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
  });

  test('flags extension with planning only as amber', () => {
    const result = analyseRisks(makeSections({
      alterations: { has_extensions: true, extension_approved: 'planning_only' },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
  });

  test('flags extension with building regs only as amber', () => {
    const result = analyseRisks(makeSections({
      alterations: { has_extensions: true, extension_approved: 'building_regs_only' },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
  });

  test('flags loft conversion as amber', () => {
    const result = analyseRisks(makeSections({
      alterations: { has_loft_conversion: true },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
  });

  test('flags walls removed as amber', () => {
    const result = analyseRisks(makeSections({
      alterations: { has_walls_removed: true },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
  });

  test('flags listed building as amber', () => {
    const result = analyseRisks(makeSections({
      specialist_issues: { has_listed_building: true },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
  });

  test('flags insurance claims as amber', () => {
    const result = analyseRisks(makeSections({
      insurance: { has_insurance_claims: true },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
  });

  test('flags rights of way as amber', () => {
    const result = analyseRisks(makeSections({
      rights_arrangements: { has_rights_of_way: true },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
  });

  test('flags property in chain as amber', () => {
    const result = analyseRisks(makeSections({
      completion_moving: { is_chain: true },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
  });

  test('flags EPC F/G as amber', () => {
    const resultF = analyseRisks(makeSections({
      energy: { epc_rating: 'F' },
    }), '', '');
    expect(resultF.amberFlags).toHaveLength(1);

    const resultG = analyseRisks(makeSections({
      energy: { epc_rating: 'G' },
    }), '', '');
    expect(resultG.amberFlags).toHaveLength(1);
  });

  test('EPC A-E is green (no flag)', () => {
    for (const rating of ['A', 'B', 'C', 'D', 'E']) {
      const result = analyseRisks(makeSections({
        energy: { epc_rating: rating },
      }), '', '');
      expect(result.amberFlags).toHaveLength(0);
      expect(result.greenCount).toBe(1);
    }
  });

  test('flags lease 80-90 years as amber', () => {
    const result = analyseRisks(makeSections({
      additional_legal: { has_leasehold_info: 85 },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
    expect(result.amberFlags[0].summary).toContain('85 years');
  });

  test('lease over 90 years is green', () => {
    const result = analyseRisks(makeSections({
      additional_legal: { has_leasehold_info: 120 },
    }), '', '');
    expect(result.redFlags).toHaveLength(0);
    expect(result.amberFlags).toHaveLength(0);
    expect(result.greenCount).toBe(1);
  });

  test('flags non-mains drainage as amber', () => {
    const result = analyseRisks(makeSections({
      utilities_services: { sewerage_connection: 'septic_tank' },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
    expect(result.amberFlags[0].summary).toContain('septic tank');
  });

  test('flags commercial use as amber', () => {
    const result = analyseRisks(makeSections({
      property_details: { has_commercial: true },
    }), '', '');
    expect(result.amberFlags).toHaveLength(1);
  });

  // === COMBINED TESTS ===

  test('handles multiple flags across sections', () => {
    const result = analyseRisks(makeSections({
      disputes_complaints: { has_neighbour_disputes: true, has_noise_issues: true },
      specialist_issues: { has_japanese_knotweed: true },
      energy: { epc_rating: 'F' },
      legal_ownership: { all_owners_agree: true },
    }), '10 Downing Street', 'PM');

    expect(result.redFlags).toHaveLength(2); // dispute + knotweed
    expect(result.amberFlags).toHaveLength(2); // noise + EPC
    expect(result.greenCount).toBe(1); // all_owners_agree = true
    expect(result.totalChecked).toBe(5);
  });

  test('skips unanswered fields (undefined, null, empty string)', () => {
    const result = analyseRisks(makeSections({
      disputes_complaints: {
        has_neighbour_disputes: undefined,
        has_legal_action: null,
        has_antisocial_behaviour: '',
      },
    }), '', '');
    expect(result.totalChecked).toBe(0);
  });

  test('each flag has required fields populated', () => {
    const result = analyseRisks(makeSections({
      specialist_issues: { has_japanese_knotweed: true },
    }), '', '');

    const flag = result.redFlags[0];
    expect(flag.level).toBe('red');
    expect(flag.section).toBeTruthy();
    expect(flag.sectionKey).toBe('specialist_issues');
    expect(flag.field).toBeTruthy();
    expect(flag.fieldKey).toBe('has_japanese_knotweed');
    expect(flag.summary).toBeTruthy();
    expect(flag.advice).toBeTruthy();
  });
});
