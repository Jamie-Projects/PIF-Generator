import {
  BASPI_SECTIONS,
  getSectionByKey,
  getPartASections,
  getPartBSections,
} from '@/lib/baspiSchema';

describe('BASPI Schema', () => {
  test('has all 21 sections defined', () => {
    expect(BASPI_SECTIONS.length).toBe(21);
  });

  test('has both Part A and Part B sections', () => {
    const partA = getPartASections();
    const partB = getPartBSections();
    expect(partA.length).toBeGreaterThan(0);
    expect(partB.length).toBeGreaterThan(0);
    expect(partA.length + partB.length).toBe(BASPI_SECTIONS.length);
  });

  test('Part A covers material facts sections', () => {
    const partA = getPartASections();
    const keys = partA.map(s => s.key);
    expect(keys).toContain('property_details');
    expect(keys).toContain('seller_details');
    expect(keys).toContain('disputes_complaints');
    expect(keys).toContain('alterations');
    expect(keys).toContain('notices');
    expect(keys).toContain('specialist_issues');
    expect(keys).toContain('fixtures_fittings');
    expect(keys).toContain('utilities_services');
    expect(keys).toContain('insurance');
    expect(keys).toContain('boundaries');
    expect(keys).toContain('rights_arrangements');
    expect(keys).toContain('environmental');
  });

  test('Part B covers legal & conveyancing sections', () => {
    const partB = getPartBSections();
    const keys = partB.map(s => s.key);
    expect(keys).toContain('legal_ownership');
    expect(keys).toContain('legal_boundaries');
    expect(keys).toContain('services_crossing');
    expect(keys).toContain('energy');
    expect(keys).toContain('guarantees_warranties');
    expect(keys).toContain('occupiers');
    expect(keys).toContain('completion_moving');
    expect(keys).toContain('declaration');
  });

  test('getSectionByKey returns correct section', () => {
    const section = getSectionByKey('property_details');
    expect(section).toBeDefined();
    expect(section?.title).toBe('Property Details');
    expect(section?.part).toBe('A');
  });

  test('getSectionByKey returns undefined for invalid key', () => {
    const section = getSectionByKey('nonexistent');
    expect(section).toBeUndefined();
  });

  test('each section has unique key', () => {
    const keys = BASPI_SECTIONS.map(s => s.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  test('each section has title, description, part, and fields', () => {
    for (const section of BASPI_SECTIONS) {
      expect(section.title).toBeTruthy();
      expect(section.description).toBeTruthy();
      expect(['A', 'B']).toContain(section.part);
      expect(section.fields.length).toBeGreaterThan(0);
    }
  });

  test('each field has key, label, and type', () => {
    for (const section of BASPI_SECTIONS) {
      for (const field of section.fields) {
        expect(field.key).toBeTruthy();
        expect(field.label).toBeTruthy();
        expect(['text', 'textarea', 'boolean', 'date', 'select', 'number']).toContain(field.type);
      }
    }
  });

  test('select fields have options defined', () => {
    for (const section of BASPI_SECTIONS) {
      for (const field of section.fields) {
        if (field.type === 'select') {
          expect(field.options).toBeDefined();
          expect(field.options!.length).toBeGreaterThan(0);
          for (const option of field.options!) {
            expect(option.value).toBeTruthy();
            expect(option.label).toBeTruthy();
          }
        }
      }
    }
  });

  test('showWhen references valid field keys within the same section', () => {
    for (const section of BASPI_SECTIONS) {
      const fieldKeys = section.fields.map(f => f.key);
      for (const field of section.fields) {
        if (field.showWhen) {
          expect(fieldKeys).toContain(field.showWhen.field);
        }
      }
    }
  });

  test('property_details section has required address and property type fields', () => {
    const section = getSectionByKey('property_details');
    expect(section).toBeDefined();

    const requiredKeys = section!.fields
      .filter(f => f.required)
      .map(f => f.key);

    expect(requiredKeys).toContain('address_line1');
    expect(requiredKeys).toContain('city');
    expect(requiredKeys).toContain('postcode');
    expect(requiredKeys).toContain('property_type');
    expect(requiredKeys).toContain('tenure');
  });

  test('declaration section has required confirmation field', () => {
    const section = getSectionByKey('declaration');
    expect(section).toBeDefined();

    const requiredKeys = section!.fields
      .filter(f => f.required)
      .map(f => f.key);

    expect(requiredKeys).toContain('declaration_confirmed');
    expect(requiredKeys).toContain('declaration_date');
    expect(requiredKeys).toContain('declaration_name');
  });
});
