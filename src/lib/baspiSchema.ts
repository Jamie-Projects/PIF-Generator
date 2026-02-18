export type FieldType = 'text' | 'textarea' | 'boolean' | 'date' | 'select' | 'number';

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  helpText?: string;
  options?: { value: string; label: string }[];
  showWhen?: { field: string; value: unknown };
  placeholder?: string;
  quickPick?: number[];
}

export interface FormSectionDef {
  key: string;
  title: string;
  description: string;
  part: 'A' | 'B';
  fields: FormField[];
}

export const BASPI_SECTIONS: FormSectionDef[] = [
  // ============================
  // PART A - MATERIAL FACTS
  // ============================
  {
    key: 'property_details',
    title: 'Property Details',
    description: 'Let\'s start with the basics about your property. This helps the buyer understand exactly what they\'re looking at.',
    part: 'A',
    fields: [
      { key: 'address_line1', label: 'Address Line 1', type: 'text', required: true, placeholder: 'e.g. 42 Acacia Avenue' },
      { key: 'address_line2', label: 'Address Line 2', type: 'text', placeholder: 'e.g. Flat 3', helpText: 'Flat number, building name, or extra detail if needed.' },
      { key: 'city', label: 'Town / City', type: 'text', required: true },
      { key: 'county', label: 'County', type: 'text' },
      { key: 'postcode', label: 'Postcode', type: 'text', required: true, placeholder: 'e.g. SW1A 1AA' },
      { key: 'property_type', label: 'Property Type', type: 'select', required: true, helpText: 'Detached = standalone. Semi = shares one wall. Terraced = shares both.', options: [
        { value: 'detached', label: 'Detached House' },
        { value: 'semi_detached', label: 'Semi-Detached House' },
        { value: 'terraced', label: 'Terraced House' },
        { value: 'flat', label: 'Flat / Apartment' },
        { value: 'maisonette', label: 'Maisonette' },
        { value: 'bungalow', label: 'Bungalow' },
        { value: 'cottage', label: 'Cottage' },
        { value: 'other', label: 'Other' },
      ]},
      { key: 'property_type_other', label: 'Please specify property type', type: 'text', showWhen: { field: 'property_type', value: 'other' } },
      { key: 'tenure', label: 'Tenure', type: 'select', required: true, helpText: 'Freehold = you own it all. Leasehold = you lease it.', options: [
        { value: 'freehold', label: 'Freehold' },
        { value: 'leasehold', label: 'Leasehold' },
        { value: 'share_of_freehold', label: 'Share of Freehold' },
        { value: 'commonhold', label: 'Commonhold' },
      ]},
      { key: 'num_bedrooms', label: 'Number of Bedrooms', type: 'number', required: true, quickPick: [1, 2, 3, 4, 5] },
      { key: 'num_bathrooms', label: 'Number of Bathrooms', type: 'number', helpText: 'Include en-suites and shower rooms.', quickPick: [1, 2, 3, 4] },
      { key: 'num_stories', label: 'Number of Stories', type: 'number', quickPick: [1, 2, 3] },
      { key: 'year_built', label: 'Approximate Year Built', type: 'text', placeholder: 'e.g. 1920', helpText: 'A rough year is fine.' },
      { key: 'has_commercial', label: 'Does the property include any commercial use?', type: 'boolean', helpText: 'Any part used as a shop or office?' },
      { key: 'commercial_details', label: 'Please describe the commercial use', type: 'textarea', showWhen: { field: 'has_commercial', value: true } },
      { key: 'step_free_street', label: 'Is there step-free access from the street?', type: 'boolean', helpText: 'No steps between the street and front door?' },
      { key: 'step_free_throughout', label: 'Is there step-free access throughout the property?', type: 'boolean', helpText: 'No stairs or steps between rooms?' },
    ],
  },
  {
    key: 'seller_details',
    title: 'Seller Details',
    description: 'We need some details about you (and anyone else selling the property). This is used for the legal paperwork.',
    part: 'A',
    fields: [
      { key: 'seller_full_name', label: 'Full Name (Seller 1)', type: 'text', required: true, helpText: 'As it appears on the title deeds.' },
      { key: 'seller_email', label: 'Email Address', type: 'text', required: true },
      { key: 'seller_phone', label: 'Phone Number', type: 'text' },
      { key: 'seller2_full_name', label: 'Full Name (Seller 2, if applicable)', type: 'text', helpText: 'The other owner, if jointly owned.' },
      { key: 'seller2_email', label: 'Email Address (Seller 2)', type: 'text' },
      { key: 'seller_capacity', label: 'Are you selling in any special capacity?', type: 'select', helpText: 'Most people sell as "Owner". Other options are for legal representatives.', options: [
        { value: 'owner', label: 'Owner' },
        { value: 'personal_representative', label: 'Personal Representative' },
        { value: 'trustee', label: 'Trustee' },
        { value: 'attorney', label: 'Attorney' },
        { value: 'other', label: 'Other' },
      ]},
      { key: 'seller_capacity_other', label: 'Please specify capacity', type: 'text', showWhen: { field: 'seller_capacity', value: 'other' } },
    ],
  },
  {
    key: 'disputes_complaints',
    title: 'Disputes & Complaints',
    description: 'Buyers need to know about any disagreements or problems with neighbours or the local area. Be honest — it\'s a legal requirement to share this information.',
    part: 'A',
    fields: [
      { key: 'has_neighbour_disputes', label: 'Have there been any disputes or complaints with neighbours?', type: 'boolean', required: true, helpText: 'Include any disagreement, even if resolved.' },
      { key: 'neighbour_dispute_details', label: 'Please give details of the dispute/complaint', type: 'textarea', showWhen: { field: 'has_neighbour_disputes', value: true }, helpText: 'What happened, when, and was it resolved?' },
      { key: 'has_legal_action', label: 'Has any legal action been taken against the property or by the property owner?', type: 'boolean', required: true, helpText: 'Court cases, solicitor letters, or legal proceedings.' },
      { key: 'legal_action_details', label: 'Please give details of the legal action', type: 'textarea', showWhen: { field: 'has_legal_action', value: true } },
      { key: 'has_antisocial_behaviour', label: 'Are you aware of any anti-social behaviour in the area?', type: 'boolean', required: true, helpText: 'E.g. persistent noise, vandalism, or harassment nearby.' },
      { key: 'antisocial_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_antisocial_behaviour', value: true } },
      { key: 'has_noise_issues', label: 'Are there any noise issues affecting the property?', type: 'boolean', helpText: 'E.g. traffic, construction, flight paths, or railways.' },
      { key: 'noise_details', label: 'Please give details of noise issues', type: 'textarea', showWhen: { field: 'has_noise_issues', value: true } },
    ],
  },
  {
    key: 'alterations',
    title: 'Alterations & Changes',
    description: 'Tell us about any building work or changes that have been made to the property. Buyers and their solicitors will need to check that any work had the right permissions.',
    part: 'A',
    fields: [
      { key: 'has_extensions', label: 'Have any extensions been added to the property?', type: 'boolean', required: true, helpText: 'E.g. conservatory, extra room, or garage conversion.' },
      { key: 'extension_details', label: 'Please describe the extensions', type: 'textarea', showWhen: { field: 'has_extensions', value: true }, helpText: 'What was built and roughly when?' },
      { key: 'extension_approved', label: 'Was planning permission and/or building regulations approval obtained?', type: 'select', showWhen: { field: 'has_extensions', value: true }, helpText: 'Planning = council approval. Building regs = safety standards.', options: [
        { value: 'yes_both', label: 'Yes - both obtained' },
        { value: 'planning_only', label: 'Planning permission only' },
        { value: 'building_regs_only', label: 'Building regulations only' },
        { value: 'neither', label: 'Neither obtained' },
        { value: 'not_required', label: 'Not required (permitted development)' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'has_loft_conversion', label: 'Has a loft conversion been carried out?', type: 'boolean', required: true, helpText: 'Attic turned into a usable room.' },
      { key: 'loft_details', label: 'Please describe and confirm approvals obtained', type: 'textarea', showWhen: { field: 'has_loft_conversion', value: true }, helpText: 'Describe the work and any approvals obtained.' },
      { key: 'has_walls_removed', label: 'Have any internal walls been removed?', type: 'boolean', required: true, helpText: 'Includes knocking through for open-plan spaces.' },
      { key: 'walls_removed_details', label: 'Please describe and confirm if structural and approvals obtained', type: 'textarea', showWhen: { field: 'has_walls_removed', value: true }, helpText: 'Which walls, were they load-bearing, and was approval obtained?' },
      { key: 'has_other_structural', label: 'Have any other structural changes been made?', type: 'boolean', helpText: 'E.g. underpinning, chimney removal, or new openings.' },
      { key: 'other_structural_details', label: 'Please describe', type: 'textarea', showWhen: { field: 'has_other_structural', value: true } },
      { key: 'has_significant_repairs', label: 'Have there been any significant repairs or renewals?', type: 'boolean', helpText: 'E.g. new roof, rewiring, or new plumbing. Not minor repairs.' },
      { key: 'repair_details', label: 'Please describe the repairs/renewals', type: 'textarea', showWhen: { field: 'has_significant_repairs', value: true } },
      { key: 'has_change_of_use', label: 'Has there been any change of use of the property or any part of it?', type: 'boolean', helpText: 'E.g. garage to bedroom, or part used as a business.' },
      { key: 'change_of_use_details', label: 'Please describe', type: 'textarea', showWhen: { field: 'has_change_of_use', value: true } },
    ],
  },
  {
    key: 'notices',
    title: 'Notices',
    description: 'Have you received any official letters or notices from the council or other authorities about the property? These are formal documents that could affect the buyer.',
    part: 'A',
    fields: [
      { key: 'has_planning_notices', label: 'Have you received any planning notices or proposals affecting the property or the area?', type: 'boolean', required: true, helpText: 'Council letters about nearby building or development plans.' },
      { key: 'planning_notice_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_planning_notices', value: true } },
      { key: 'has_building_control_notices', label: 'Have you received any building control notices?', type: 'boolean', required: true, helpText: 'Official notices about building safety or failed inspections.' },
      { key: 'building_control_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_building_control_notices', value: true } },
      { key: 'has_environmental_notices', label: 'Have you received any environmental notices (e.g. contamination, flooding)?', type: 'boolean', required: true, helpText: 'E.g. flood warnings or contaminated land notices.' },
      { key: 'environmental_notice_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_environmental_notices', value: true } },
      { key: 'has_other_notices', label: 'Have you received any other notices or proposals affecting the property?', type: 'boolean', helpText: 'Any other official letters from authorities.' },
      { key: 'other_notice_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_other_notices', value: true } },
    ],
  },
  {
    key: 'specialist_issues',
    title: 'Specialist Issues',
    description: 'This section covers specific problems that can significantly affect a property\'s value or safety. Don\'t worry if you\'re not sure about some of these — just answer as honestly as you can.',
    part: 'A',
    fields: [
      { key: 'has_japanese_knotweed', label: 'Is there or has there been Japanese Knotweed at the property?', type: 'boolean', required: true, helpText: 'An invasive plant that can damage buildings.' },
      { key: 'knotweed_details', label: 'Please give details and any treatment plan', type: 'textarea', showWhen: { field: 'has_japanese_knotweed', value: true } },
      { key: 'has_flooding', label: 'Has the property ever been flooded?', type: 'boolean', required: true, helpText: 'From rivers, heavy rain, or rising groundwater.' },
      { key: 'flooding_details', label: 'Please describe (when, source, severity)', type: 'textarea', showWhen: { field: 'has_flooding', value: true } },
      { key: 'has_subsidence', label: 'Has the property been affected by subsidence, heave or landslip?', type: 'boolean', required: true, helpText: 'Ground sinking or moving beneath the property.' },
      { key: 'subsidence_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_subsidence', value: true } },
      { key: 'has_asbestos', label: 'Are you aware of any asbestos in the property?', type: 'boolean', required: true, helpText: 'Common in pre-2000 buildings. Safe if undisturbed.' },
      { key: 'asbestos_details', label: 'Please describe location and type', type: 'textarea', showWhen: { field: 'has_asbestos', value: true } },
      { key: 'has_radon', label: 'Is the property in a radon-affected area?', type: 'select', helpText: 'A natural gas from the ground. Check ukradon.org if unsure.', options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'has_coastal_erosion', label: 'Is the property affected by or at risk of coastal erosion?', type: 'boolean', helpText: 'Only relevant for coastal properties.' },
      { key: 'coastal_erosion_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_coastal_erosion', value: true } },
      { key: 'has_mining', label: 'Is the property in a mining area?', type: 'select', helpText: 'Old mines can affect properties above. Select "Unknown" if unsure.', options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'has_listed_building', label: 'Is the property listed or in a conservation area?', type: 'boolean', helpText: 'Both can limit what changes you can make.' },
      { key: 'listed_details', label: 'Please give details (grade, restrictions)', type: 'textarea', showWhen: { field: 'has_listed_building', value: true } },
    ],
  },
  {
    key: 'fixtures_fittings',
    title: 'Fixtures & Fittings',
    description: 'What stays and what goes? For each item below, tell us whether it\'s included in the sale price, or whether you\'re taking it with you. This avoids disagreements later.',
    part: 'A',
    fields: [
      { key: 'kitchen_fitted_units', label: 'Fitted kitchen units', type: 'select', required: true, helpText: 'Cupboards, worktops, and built-in units.', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
        { value: 'none', label: 'None at property' },
      ]},
      { key: 'kitchen_appliances', label: 'Kitchen appliances (oven, hob, extractor)', type: 'select', helpText: 'Built-in appliances. Mention freestanding ones in notes.', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
        { value: 'none', label: 'None at property' },
      ]},
      { key: 'light_fittings', label: 'Light fittings', type: 'select', helpText: 'Lampshades, fixtures, and ceiling lights.', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
      ]},
      { key: 'curtains_blinds', label: 'Curtains and blinds', type: 'select', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
        { value: 'none', label: 'None at property' },
      ]},
      { key: 'carpets', label: 'Fitted carpets / floor coverings', type: 'select', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
        { value: 'none', label: 'None at property' },
      ]},
      { key: 'bathroom_fittings', label: 'Bathroom fittings', type: 'select', helpText: 'Bath, shower, toilet, and basin.', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
      ]},
      { key: 'garden_shed_greenhouse', label: 'Garden shed / greenhouse / outbuildings', type: 'select', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
        { value: 'none', label: 'None at property' },
      ]},
      { key: 'satellite_dish_aerial', label: 'TV aerial / satellite dish', type: 'select', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
        { value: 'none', label: 'None at property' },
      ]},
      { key: 'fixtures_notes', label: 'Any additional notes about fixtures and fittings?', type: 'textarea', helpText: 'E.g. freestanding appliances, garden furniture, smart devices.' },
    ],
  },
  {
    key: 'utilities_services',
    title: 'Utilities & Services',
    description: 'Information about the gas, electric, water, heating, and broadband at the property. You can usually find supplier details on your latest bills.',
    part: 'A',
    fields: [
      { key: 'electricity_supplier', label: 'Electricity supplier', type: 'text', helpText: 'Check a recent bill if unsure.' },
      { key: 'gas_connected', label: 'Is mains gas connected?', type: 'boolean', required: true, helpText: 'Not all properties have a gas supply.' },
      { key: 'gas_supplier', label: 'Gas supplier', type: 'text', showWhen: { field: 'gas_connected', value: true } },
      { key: 'water_supplier', label: 'Water supplier', type: 'text', helpText: 'Check a recent bill if unsure.' },
      { key: 'water_meter', label: 'Is there a water meter?', type: 'boolean', helpText: 'With a meter you pay for what you use.' },
      { key: 'sewerage_connection', label: 'How is the property connected to sewerage?', type: 'select', required: true, helpText: 'Most use mains sewer. Rural homes may have a septic tank.', options: [
        { value: 'mains', label: 'Mains sewer' },
        { value: 'septic_tank', label: 'Septic tank' },
        { value: 'cesspit', label: 'Cesspit' },
        { value: 'treatment_plant', label: 'Treatment plant' },
        { value: 'other', label: 'Other' },
      ]},
      { key: 'sewerage_other', label: 'Please describe', type: 'text', showWhen: { field: 'sewerage_connection', value: 'other' } },
      { key: 'heating_type', label: 'Type of central heating', type: 'select', required: true, helpText: 'Most UK homes use gas central heating.', options: [
        { value: 'gas_central', label: 'Gas central heating' },
        { value: 'oil', label: 'Oil-fired' },
        { value: 'electric', label: 'Electric' },
        { value: 'heat_pump_air', label: 'Air source heat pump' },
        { value: 'heat_pump_ground', label: 'Ground source heat pump' },
        { value: 'heat_pump_water', label: 'Water source heat pump' },
        { value: 'solid_fuel', label: 'Solid fuel' },
        { value: 'none', label: 'None' },
        { value: 'other', label: 'Other' },
      ]},
      { key: 'heating_other', label: 'Please describe the heating', type: 'text', showWhen: { field: 'heating_type', value: 'other' } },
      { key: 'boiler_age', label: 'Approximate age of boiler (years)', type: 'number', helpText: 'A rough number is fine.' },
      { key: 'broadband_type', label: 'Broadband availability', type: 'select', helpText: 'Full fibre (FTTP) is the fastest type.', options: [
        { value: 'fibre_full', label: 'Full fibre (FTTP)' },
        { value: 'fibre_cabinet', label: 'Fibre to cabinet (FTTC)' },
        { value: 'adsl', label: 'ADSL' },
        { value: 'cable', label: 'Cable' },
        { value: 'none', label: 'No broadband' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'mobile_signal', label: 'Mobile phone signal coverage', type: 'select', options: [
        { value: 'good', label: 'Good' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'poor', label: 'Poor' },
        { value: 'none', label: 'No coverage' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'solar_panels', label: 'Are there solar panels on the property?', type: 'boolean' },
      { key: 'solar_details', label: 'Please give details (owned/leased, feed-in tariff)', type: 'textarea', showWhen: { field: 'solar_panels', value: true }, helpText: 'Owned or leased? Any feed-in tariff payments?' },
      { key: 'in_ulez', label: 'Is the property within the ULEZ zone? (London only)', type: 'select', helpText: 'London\'s vehicle emission charge zone.', options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_applicable', label: 'Not in London' },
      ]},
    ],
  },
  {
    key: 'insurance',
    title: 'Insurance',
    description: 'Details about the property\'s buildings insurance. This isn\'t about contents insurance (your belongings) — it\'s about the building itself. You can find these details on your insurance policy documents.',
    part: 'A',
    fields: [
      { key: 'buildings_insurance_provider', label: 'Buildings insurance provider', type: 'text', helpText: 'The company insuring the building, not contents.' },
      { key: 'insurance_policy_number', label: 'Policy number', type: 'text', helpText: 'Found on your insurance documents.' },
      { key: 'has_insurance_claims', label: 'Have any insurance claims been made in the last 5 years?', type: 'boolean', required: true, helpText: 'E.g. storm damage, flooding, fire, or subsidence.' },
      { key: 'claims_details', label: 'Please give details of claims', type: 'textarea', showWhen: { field: 'has_insurance_claims', value: true } },
      { key: 'has_insurance_refused', label: 'Has insurance ever been refused, cancelled, or had special terms imposed?', type: 'boolean', required: true },
      { key: 'insurance_refused_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_insurance_refused', value: true } },
      { key: 'has_title_indemnity', label: 'Is there any title defect insurance policy in place?', type: 'boolean', helpText: 'Covers problems with legal ownership. Ask your solicitor.' },
      { key: 'title_indemnity_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_title_indemnity', value: true } },
    ],
  },
  {
    key: 'boundaries',
    title: 'Boundaries',
    description: 'Boundaries are the edges of your property — the fences, walls, or hedges that mark where your land ends and your neighbour\'s begins. This section asks who looks after each boundary.',
    part: 'A',
    fields: [
      { key: 'boundary_front', label: 'Who owns/maintains the front boundary?', type: 'select', required: true, helpText: '"Shared" means you both look after it.', options: [
        { value: 'seller', label: 'Seller' },
        { value: 'neighbour', label: 'Neighbour' },
        { value: 'shared', label: 'Shared' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'boundary_rear', label: 'Who owns/maintains the rear boundary?', type: 'select', required: true, options: [
        { value: 'seller', label: 'Seller' },
        { value: 'neighbour', label: 'Neighbour' },
        { value: 'shared', label: 'Shared' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'boundary_left', label: 'Who owns/maintains the left boundary?', type: 'select', required: true, helpText: 'Left side when facing the property from the street.', options: [
        { value: 'seller', label: 'Seller' },
        { value: 'neighbour', label: 'Neighbour' },
        { value: 'shared', label: 'Shared' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'boundary_right', label: 'Who owns/maintains the right boundary?', type: 'select', required: true, helpText: 'Right side when facing the property from the street.', options: [
        { value: 'seller', label: 'Seller' },
        { value: 'neighbour', label: 'Neighbour' },
        { value: 'shared', label: 'Shared' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'has_boundary_disputes', label: 'Are there any boundary disputes?', type: 'boolean', required: true },
      { key: 'boundary_dispute_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_boundary_disputes', value: true } },
      { key: 'boundary_agreements', label: 'Are there any boundary agreements in place?', type: 'boolean', helpText: 'A written agreement with a neighbour about a boundary.' },
      { key: 'boundary_agreement_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'boundary_agreements', value: true } },
    ],
  },
  {
    key: 'rights_arrangements',
    title: 'Rights & Informal Arrangements',
    description: 'This section is about whether anyone else has the right to use part of your property, or whether you have any informal agreements with neighbours. These things can affect the buyer.',
    part: 'A',
    fields: [
      { key: 'has_rights_of_way', label: 'Are there any rights of way across the property?', type: 'boolean', required: true, helpText: 'Can someone else legally cross your property?' },
      { key: 'rights_of_way_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_rights_of_way', value: true } },
      { key: 'has_shared_access', label: 'Is any access to the property shared with others?', type: 'boolean', required: true, helpText: 'E.g. shared driveway, path, or communal entrance.' },
      { key: 'shared_access_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_shared_access', value: true } },
      { key: 'has_informal_arrangements', label: 'Are there any informal arrangements with neighbours?', type: 'boolean', helpText: 'Unwritten agreements, like shared parking or garden use.' },
      { key: 'informal_arrangement_details', label: 'Please describe the arrangements', type: 'textarea', showWhen: { field: 'has_informal_arrangements', value: true } },
      { key: 'has_easements', label: 'Are there any easements benefiting or burdening the property?', type: 'boolean', helpText: 'A legal right for others to use part of your land.' },
      { key: 'easement_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_easements', value: true } },
    ],
  },
  {
    key: 'environmental',
    title: 'Environmental & Other Issues',
    description: 'A few final questions about potential environmental problems. Just answer honestly — most properties won\'t have any of these issues.',
    part: 'A',
    fields: [
      { key: 'has_contamination', label: 'Are you aware of any contamination on or near the property?', type: 'boolean', required: true, helpText: 'E.g. old fuel tanks, chemical spills, or nearby landfill.' },
      { key: 'contamination_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_contamination', value: true } },
      { key: 'has_trees', label: 'Are there any trees subject to Tree Preservation Orders?', type: 'boolean', helpText: 'Protected trees that can\'t be cut without council permission.' },
      { key: 'tree_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_trees', value: true } },
      { key: 'has_pest_issues', label: 'Have there been any pest infestations (woodworm, dry rot, etc.)?', type: 'boolean', helpText: 'Include any past problems, even if treated.' },
      { key: 'pest_details', label: 'Please give details including treatment', type: 'textarea', showWhen: { field: 'has_pest_issues', value: true } },
      { key: 'has_damp_issues', label: 'Are there any damp issues?', type: 'boolean', helpText: 'E.g. wet patches, black mould, or musty smells.' },
      { key: 'damp_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_damp_issues', value: true } },
      { key: 'other_issues', label: 'Is there anything else a buyer should know about?', type: 'textarea', helpText: 'If in doubt, mention it here.' },
    ],
  },

  // ============================
  // PART B - LEGAL & CONVEYANCING
  // ============================
  {
    key: 'legal_ownership',
    title: 'Legal Ownership',
    description: 'This section is about who legally owns the property. Your solicitor or conveyancer can help you with this if you\'re unsure. Your title deeds contain most of this information.',
    part: 'B',
    fields: [
      { key: 'title_number', label: 'Title Number', type: 'text', required: true, helpText: 'Land Registry reference (e.g. "HD123456") from your title deeds.' },
      { key: 'ownership_type', label: 'Type of ownership', type: 'select', required: true, helpText: 'Joint tenants = equal shares. Tenants in common = can be unequal.', options: [
        { value: 'sole', label: 'Sole owner' },
        { value: 'joint_tenants', label: 'Joint tenants' },
        { value: 'tenants_in_common', label: 'Tenants in common' },
      ]},
      { key: 'all_owners_agree', label: 'Do all legal owners agree to the sale?', type: 'boolean', required: true },
      { key: 'has_restrictions', label: 'Are there any restrictions on the title?', type: 'boolean', required: true, helpText: 'Legal conditions on how the property can be used or sold.' },
      { key: 'restriction_details', label: 'Please give details of any restrictions', type: 'textarea', showWhen: { field: 'has_restrictions', value: true } },
      { key: 'has_charges', label: 'Are there any charges registered against the title (mortgage, etc.)?', type: 'boolean', required: true, helpText: 'If you have a mortgage, answer "Yes".' },
      { key: 'charge_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_charges', value: true }, helpText: 'Name the lender, e.g. "Nationwide mortgage".' },
    ],
  },
  {
    key: 'legal_boundaries',
    title: 'Legal Boundaries',
    description: 'This is about whether the actual fences and walls on the ground match the official map of your property (the "title plan"). Your solicitor can help check this.',
    part: 'B',
    fields: [
      { key: 'boundaries_match_title', label: 'Do the physical boundaries match the title plan?', type: 'boolean', required: true, helpText: 'Usually "Yes" unless you know something has changed.' },
      { key: 'boundary_discrepancy', label: 'Please describe any discrepancies', type: 'textarea', showWhen: { field: 'boundaries_match_title', value: false } },
      { key: 'has_boundary_changes', label: 'Have any boundaries been moved or altered?', type: 'boolean', required: true, helpText: 'Any fence, wall, or hedge moved from its original spot.' },
      { key: 'boundary_change_details', label: 'Please describe what changed and when', type: 'textarea', showWhen: { field: 'has_boundary_changes', value: true } },
    ],
  },
  {
    key: 'services_crossing',
    title: 'Services Crossing Other Property',
    description: 'Sometimes pipes, wires, or drains need to cross through a neighbour\'s land to reach your property (or vice versa). This section asks about that.',
    part: 'B',
    fields: [
      { key: 'has_services_crossing', label: 'Do any pipes, wires, cables or drains cross neighbouring property?', type: 'boolean', required: true, helpText: 'Do your utilities run through a neighbour\'s land?' },
      { key: 'services_crossing_details', label: 'Please describe which services and which properties', type: 'textarea', showWhen: { field: 'has_services_crossing', value: true } },
      { key: 'has_neighbour_services', label: 'Do any neighbouring services cross your property?', type: 'boolean', required: true, helpText: 'Do a neighbour\'s utilities run through your land?' },
      { key: 'neighbour_services_details', label: 'Please describe', type: 'textarea', showWhen: { field: 'has_neighbour_services', value: true } },
      { key: 'has_shared_drains', label: 'Are any drains shared with neighbouring properties?', type: 'boolean', helpText: 'Common with terraced and semi-detached homes.' },
      { key: 'shared_drain_details', label: 'Please describe', type: 'textarea', showWhen: { field: 'has_shared_drains', value: true } },
    ],
  },
  {
    key: 'energy',
    title: 'Energy',
    description: 'Every property for sale needs an Energy Performance Certificate (EPC). It rates how energy-efficient your home is from A (best) to G (worst). You can find your EPC at epcregister.com.',
    part: 'B',
    fields: [
      { key: 'epc_rating', label: 'Current EPC Rating', type: 'select', required: true, helpText: 'A = most efficient, G = least. Check epcregister.com.', options: [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
        { value: 'E', label: 'E' },
        { value: 'F', label: 'F' },
        { value: 'G', label: 'G' },
        { value: 'exempt', label: 'Exempt' },
      ]},
      { key: 'epc_certificate_number', label: 'EPC Certificate Number', type: 'text', helpText: 'Found on your certificate or at epcregister.com.' },
      { key: 'epc_expiry_date', label: 'EPC Expiry Date', type: 'date', helpText: 'Valid for 10 years from issue.' },
      { key: 'has_green_deal', label: 'Is there a Green Deal plan on the property?', type: 'boolean', helpText: 'A government energy loan attached to the property, not the person.' },
      { key: 'green_deal_details', label: 'Please give details of the Green Deal plan', type: 'textarea', showWhen: { field: 'has_green_deal', value: true } },
    ],
  },
  {
    key: 'guarantees_warranties',
    title: 'Guarantees & Warranties',
    description: 'If any work has been done on the property, there may be guarantees or warranties that can be passed on to the buyer. Dig out any paperwork you have — it can add value to your sale.',
    part: 'B',
    fields: [
      { key: 'has_new_build_warranty', label: 'Is there a new build warranty (e.g. NHBC, Premier, LABC)?', type: 'boolean', required: true, helpText: 'Common if built in the last 10 years.' },
      { key: 'new_build_warranty_details', label: 'Provider and expiry date', type: 'textarea', showWhen: { field: 'has_new_build_warranty', value: true } },
      { key: 'has_damp_guarantee', label: 'Is there a damp-proofing guarantee?', type: 'boolean', helpText: 'Usually comes with a 20-30 year guarantee.' },
      { key: 'damp_guarantee_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_damp_guarantee', value: true } },
      { key: 'has_timber_guarantee', label: 'Is there a timber treatment guarantee?', type: 'boolean', helpText: 'From woodworm or rot treatment.' },
      { key: 'timber_guarantee_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_timber_guarantee', value: true } },
      { key: 'has_window_guarantee', label: 'Are there guarantees for windows, doors, or double glazing?', type: 'boolean', helpText: 'Often come with a 10-year guarantee.' },
      { key: 'window_guarantee_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_window_guarantee', value: true } },
      { key: 'has_electrical_guarantee', label: 'Is there an electrical installation certificate?', type: 'boolean', helpText: 'Required for rewiring or major electrical work.' },
      { key: 'electrical_guarantee_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_electrical_guarantee', value: true } },
      { key: 'has_roofing_guarantee', label: 'Is there a roofing guarantee?', type: 'boolean', helpText: 'Typically 10-20 years for roof replacements.' },
      { key: 'roofing_guarantee_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_roofing_guarantee', value: true } },
      { key: 'has_indemnity_policies', label: 'Are there any indemnity insurance policies?', type: 'boolean', helpText: 'Covers legal risks like missing approvals. Ask your solicitor.' },
      { key: 'indemnity_details', label: 'Please give details of indemnity policies', type: 'textarea', showWhen: { field: 'has_indemnity_policies', value: true } },
      { key: 'has_other_guarantees', label: 'Any other guarantees or warranties?', type: 'textarea', helpText: 'E.g. boiler, kitchen, or bathroom warranties.' },
    ],
  },
  {
    key: 'occupiers',
    title: 'Occupiers',
    description: 'This is about who currently lives in the property. The buyer\'s solicitor needs to know so they can make sure everyone will move out before the sale completes.',
    part: 'B',
    fields: [
      { key: 'is_occupied', label: 'Is the property currently occupied?', type: 'boolean', required: true, helpText: 'Including you.' },
      { key: 'occupier_names', label: 'Names of all current occupants (over 17)', type: 'textarea', showWhen: { field: 'is_occupied', value: true }, helpText: 'Include family, partners, and lodgers.' },
      { key: 'has_tenants', label: 'Are there any tenants in the property?', type: 'boolean', required: true, helpText: 'Anyone paying rent to live there.' },
      { key: 'tenant_details', label: 'Please give details of the tenancy', type: 'textarea', showWhen: { field: 'has_tenants', value: true }, helpText: 'Names, agreement type, dates, and rent amount.' },
      { key: 'all_occupiers_will_vacate', label: 'Will all occupiers vacate on or before completion?', type: 'boolean', helpText: 'Will everyone have moved out by the sale date?' },
      { key: 'vacate_details', label: 'Please explain', type: 'textarea', showWhen: { field: 'all_occupiers_will_vacate', value: false }, helpText: 'Who will still be there and why?' },
    ],
  },
  {
    key: 'completion_moving',
    title: 'Completion & Moving',
    description: 'Nearly done! This section is about the practicalities of the sale — when you\'d like to move, whether you\'re buying somewhere else, and your solicitor\'s details.',
    part: 'B',
    fields: [
      { key: 'preferred_completion_date', label: 'Preferred completion date', type: 'date', helpText: 'When you\'d ideally hand over the keys.' },
      { key: 'is_chain', label: 'Are you in a property chain?', type: 'boolean', required: true, helpText: 'Your sale depends on another sale completing.' },
      { key: 'chain_details', label: 'Please describe the chain position', type: 'textarea', showWhen: { field: 'is_chain', value: true }, helpText: 'Describe your position in the chain.' },
      { key: 'has_dependent_purchase', label: 'Is the sale dependent on you purchasing another property?', type: 'boolean', required: true, helpText: 'Do you need sale funds to buy your next home?' },
      { key: 'dependent_purchase_status', label: 'What is the status of your purchase?', type: 'select', showWhen: { field: 'has_dependent_purchase', value: true }, options: [
        { value: 'searching', label: 'Still searching' },
        { value: 'offer_made', label: 'Offer made' },
        { value: 'offer_accepted', label: 'Offer accepted' },
        { value: 'conveyancing', label: 'Conveyancing in progress' },
      ]},
      { key: 'solicitor_name', label: 'Solicitor / Conveyancer name', type: 'text', helpText: 'You can fill this in later if not yet appointed.' },
      { key: 'solicitor_firm', label: 'Solicitor / Conveyancer firm', type: 'text' },
      { key: 'solicitor_email', label: 'Solicitor / Conveyancer email', type: 'text' },
      { key: 'solicitor_phone', label: 'Solicitor / Conveyancer phone', type: 'text' },
      { key: 'solicitor_reference', label: 'Solicitor reference', type: 'text', helpText: 'Your solicitor\'s file reference for this sale.' },
    ],
  },
  {
    key: 'additional_legal',
    title: 'Additional Legal Information',
    description: 'These questions are mainly relevant if the property is leasehold (e.g. a flat with a lease). If you own a freehold house, many of these won\'t apply — just leave them blank.',
    part: 'B',
    fields: [
      { key: 'has_leasehold_info', label: 'If leasehold: remaining lease term (years)', type: 'number', helpText: 'Under 80 years can affect value. Leave blank if freehold.' },
      { key: 'ground_rent', label: 'Annual ground rent (if leasehold)', type: 'text', helpText: 'Yearly payment to the freeholder. Note if it increases.' },
      { key: 'service_charge', label: 'Annual service charge (if applicable)', type: 'text', helpText: 'Yearly fee for shared areas, common with flats.' },
      { key: 'management_company', label: 'Management company name', type: 'text', helpText: 'The company that manages the building.' },
      { key: 'has_freehold_share', label: 'Do you own a share of the freehold?', type: 'boolean', helpText: 'Flat owners sometimes co-own the freehold.' },
      { key: 'reserve_fund', label: 'Reserve/sinking fund amount', type: 'text', helpText: 'Savings for future big repairs like a new roof.' },
      { key: 'annual_contribution', label: 'Annual contribution amount', type: 'text', helpText: 'Yearly payment into the reserve fund.' },
      { key: 'has_transfer_fee', label: 'Is there a transfer fee or admin charge on sale?', type: 'boolean', helpText: 'Some freeholders charge a fee when selling.' },
      { key: 'transfer_fee_details', label: 'Please give details and amount', type: 'textarea', showWhen: { field: 'has_transfer_fee', value: true } },
      { key: 'has_other_legal_info', label: 'Is there any other legal information the buyer should know?', type: 'boolean' },
      { key: 'other_legal_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_other_legal_info', value: true } },
    ],
  },
  {
    key: 'declaration',
    title: 'Declaration',
    description: 'You\'re at the final step. Please confirm that the information you\'ve provided is true and accurate to the best of your knowledge. You\'re not expected to know everything perfectly — just be honest.',
    part: 'B',
    fields: [
      { key: 'declaration_confirmed', label: 'I confirm the information I have provided is accurate and complete to the best of my knowledge', type: 'boolean', required: true, helpText: 'Update your solicitor if anything changes later.' },
      { key: 'declaration_date', label: 'Date of declaration', type: 'date', required: true },
      { key: 'declaration_name', label: 'Full name', type: 'text', required: true, helpText: 'This acts as your signature.' },
    ],
  },
];

export function getSectionByKey(key: string): FormSectionDef | undefined {
  return BASPI_SECTIONS.find(s => s.key === key);
}

export function getPartASections(): FormSectionDef[] {
  return BASPI_SECTIONS.filter(s => s.part === 'A');
}

export function getPartBSections(): FormSectionDef[] {
  return BASPI_SECTIONS.filter(s => s.part === 'B');
}
