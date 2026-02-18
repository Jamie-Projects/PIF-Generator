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
      { key: 'address_line1', label: 'Address Line 1', type: 'text', required: true, placeholder: 'e.g. 42 Acacia Avenue', helpText: 'The street number and name of your property.' },
      { key: 'address_line2', label: 'Address Line 2', type: 'text', placeholder: 'e.g. Flat 3', helpText: 'If applicable — a flat number, building name, or any extra address detail.' },
      { key: 'city', label: 'Town / City', type: 'text', required: true },
      { key: 'county', label: 'County', type: 'text' },
      { key: 'postcode', label: 'Postcode', type: 'text', required: true, placeholder: 'e.g. SW1A 1AA' },
      { key: 'property_type', label: 'Property Type', type: 'select', required: true, helpText: 'What kind of property is it? If you\'re not sure, "Detached" means a standalone house, "Semi-Detached" shares one wall with a neighbour, and "Terraced" shares walls on both sides.', options: [
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
      { key: 'tenure', label: 'Tenure', type: 'select', required: true, helpText: 'This is about how you own the property. "Freehold" means you own the building and the land. "Leasehold" means you own the right to live there for a set number of years (common with flats). Check your title deeds if you\'re unsure.', options: [
        { value: 'freehold', label: 'Freehold' },
        { value: 'leasehold', label: 'Leasehold' },
        { value: 'share_of_freehold', label: 'Share of Freehold' },
        { value: 'commonhold', label: 'Commonhold' },
      ]},
      { key: 'num_bedrooms', label: 'Number of Bedrooms', type: 'number', required: true },
      { key: 'num_bathrooms', label: 'Number of Bathrooms', type: 'number', helpText: 'Include all bathrooms, shower rooms, and en-suites.' },
      { key: 'num_stories', label: 'Number of Stories', type: 'number', helpText: 'How many floors does the property have? A ground floor only counts as 1.' },
      { key: 'year_built', label: 'Approximate Year Built', type: 'text', placeholder: 'e.g. 1920', helpText: 'A rough year is fine — you don\'t need to know the exact date.' },
      { key: 'has_commercial', label: 'Does the property include any commercial use?', type: 'boolean', helpText: 'For example, is any part of the property used as a shop, office, or business premises?' },
      { key: 'commercial_details', label: 'Please describe the commercial use', type: 'textarea', showWhen: { field: 'has_commercial', value: true } },
      { key: 'step_free_street', label: 'Is there step-free access from the street?', type: 'boolean', helpText: 'Can someone get from the street to the front door without going up or down any steps?' },
      { key: 'step_free_throughout', label: 'Is there step-free access throughout the property?', type: 'boolean', helpText: 'Can someone move between all rooms without using stairs or steps?' },
    ],
  },
  {
    key: 'seller_details',
    title: 'Seller Details',
    description: 'We need some details about you (and anyone else selling the property). This is used for the legal paperwork.',
    part: 'A',
    fields: [
      { key: 'seller_full_name', label: 'Full Name (Seller 1)', type: 'text', required: true, helpText: 'Your full legal name as it appears on the property title deeds.' },
      { key: 'seller_email', label: 'Email Address', type: 'text', required: true },
      { key: 'seller_phone', label: 'Phone Number', type: 'text' },
      { key: 'seller2_full_name', label: 'Full Name (Seller 2, if applicable)', type: 'text', helpText: 'If the property is owned jointly, enter the other owner\'s name here.' },
      { key: 'seller2_email', label: 'Email Address (Seller 2)', type: 'text' },
      { key: 'seller_capacity', label: 'Are you selling in any special capacity?', type: 'select', helpText: 'Most people sell as the owner. "Personal Representative" means you\'re selling on behalf of someone who has died. "Trustee" or "Attorney" means you\'re acting on behalf of someone else legally.', options: [
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
      { key: 'has_neighbour_disputes', label: 'Have there been any disputes or complaints with neighbours?', type: 'boolean', required: true, helpText: 'This includes any disagreement, even if it was resolved. For example: noise complaints, parking issues, fence disagreements, or boundary arguments.' },
      { key: 'neighbour_dispute_details', label: 'Please give details of the dispute/complaint', type: 'textarea', showWhen: { field: 'has_neighbour_disputes', value: true }, helpText: 'Describe what happened, when, and how (or if) it was resolved.' },
      { key: 'has_legal_action', label: 'Has any legal action been taken against the property or by the property owner?', type: 'boolean', required: true, helpText: 'This means any court cases, solicitor letters, or formal legal proceedings related to the property.' },
      { key: 'legal_action_details', label: 'Please give details of the legal action', type: 'textarea', showWhen: { field: 'has_legal_action', value: true } },
      { key: 'has_antisocial_behaviour', label: 'Are you aware of any anti-social behaviour in the area?', type: 'boolean', required: true, helpText: 'Anti-social behaviour means things like persistent noise, vandalism, harassment, or other disruptive activity in the neighbourhood.' },
      { key: 'antisocial_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_antisocial_behaviour', value: true } },
      { key: 'has_noise_issues', label: 'Are there any noise issues affecting the property?', type: 'boolean', helpText: 'For example: traffic noise, nearby construction, noisy neighbours, pubs, clubs, flight paths, railways, etc.' },
      { key: 'noise_details', label: 'Please give details of noise issues', type: 'textarea', showWhen: { field: 'has_noise_issues', value: true } },
    ],
  },
  {
    key: 'alterations',
    title: 'Alterations & Changes',
    description: 'Tell us about any building work or changes that have been made to the property. Buyers and their solicitors will need to check that any work had the right permissions.',
    part: 'A',
    fields: [
      { key: 'has_extensions', label: 'Have any extensions been added to the property?', type: 'boolean', required: true, helpText: 'An extension is any building work that made the property bigger — like a conservatory, extra room, or garage conversion.' },
      { key: 'extension_details', label: 'Please describe the extensions', type: 'textarea', showWhen: { field: 'has_extensions', value: true }, helpText: 'Describe what was built and roughly when.' },
      { key: 'extension_approved', label: 'Was planning permission and/or building regulations approval obtained?', type: 'select', showWhen: { field: 'has_extensions', value: true }, helpText: '"Planning permission" is approval from the council to build. "Building regulations" confirms the work meets safety standards. Some small works are "permitted development" and don\'t need planning permission.', options: [
        { value: 'yes_both', label: 'Yes - both obtained' },
        { value: 'planning_only', label: 'Planning permission only' },
        { value: 'building_regs_only', label: 'Building regulations only' },
        { value: 'neither', label: 'Neither obtained' },
        { value: 'not_required', label: 'Not required (permitted development)' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'has_loft_conversion', label: 'Has a loft conversion been carried out?', type: 'boolean', required: true, helpText: 'A loft conversion is when the attic/loft space has been turned into a usable room.' },
      { key: 'loft_details', label: 'Please describe and confirm approvals obtained', type: 'textarea', showWhen: { field: 'has_loft_conversion', value: true }, helpText: 'Describe the conversion and say whether planning permission and building regulations approval were obtained.' },
      { key: 'has_walls_removed', label: 'Have any internal walls been removed?', type: 'boolean', required: true, helpText: 'This includes knocking through between rooms to make an open-plan space. If a wall was load-bearing (holding up the building), special steel beams (RSJs) would have been needed.' },
      { key: 'walls_removed_details', label: 'Please describe and confirm if structural and approvals obtained', type: 'textarea', showWhen: { field: 'has_walls_removed', value: true }, helpText: 'Say which walls, whether they were structural (load-bearing), and if building regulations sign-off was obtained.' },
      { key: 'has_other_structural', label: 'Have any other structural changes been made?', type: 'boolean', helpText: 'Any other work that changed the structure of the building — like underpinning, chimney removal, new openings, etc.' },
      { key: 'other_structural_details', label: 'Please describe', type: 'textarea', showWhen: { field: 'has_other_structural', value: true } },
      { key: 'has_significant_repairs', label: 'Have there been any significant repairs or renewals?', type: 'boolean', helpText: 'Major work like a new roof, rewiring, new plumbing, or replacing the damp-proof course. You don\'t need to mention routine decorating or minor repairs.' },
      { key: 'repair_details', label: 'Please describe the repairs/renewals', type: 'textarea', showWhen: { field: 'has_significant_repairs', value: true } },
      { key: 'has_change_of_use', label: 'Has there been any change of use of the property or any part of it?', type: 'boolean', helpText: 'For example, converting a garage into a bedroom, turning a house into flats, or using part of it as a business.' },
      { key: 'change_of_use_details', label: 'Please describe', type: 'textarea', showWhen: { field: 'has_change_of_use', value: true } },
    ],
  },
  {
    key: 'notices',
    title: 'Notices',
    description: 'Have you received any official letters or notices from the council or other authorities about the property? These are formal documents that could affect the buyer.',
    part: 'A',
    fields: [
      { key: 'has_planning_notices', label: 'Have you received any planning notices or proposals affecting the property or the area?', type: 'boolean', required: true, helpText: 'These are letters from the local council about nearby building plans, road changes, or development proposals. You might have received one through the post or seen a notice on a lamppost.' },
      { key: 'planning_notice_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_planning_notices', value: true } },
      { key: 'has_building_control_notices', label: 'Have you received any building control notices?', type: 'boolean', required: true, helpText: 'Building control notices are official documents about the safety or standards of building work at the property. If you\'ve had work done and it didn\'t pass inspection, that would be relevant here.' },
      { key: 'building_control_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_building_control_notices', value: true } },
      { key: 'has_environmental_notices', label: 'Have you received any environmental notices (e.g. contamination, flooding)?', type: 'boolean', required: true, helpText: 'For example, official flood warnings, contaminated land notices, or any letters from the Environment Agency.' },
      { key: 'environmental_notice_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_environmental_notices', value: true } },
      { key: 'has_other_notices', label: 'Have you received any other notices or proposals affecting the property?', type: 'boolean', helpText: 'Any other official letters or notices from authorities that relate to the property.' },
      { key: 'other_notice_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_other_notices', value: true } },
    ],
  },
  {
    key: 'specialist_issues',
    title: 'Specialist Issues',
    description: 'This section covers specific problems that can significantly affect a property\'s value or safety. Don\'t worry if you\'re not sure about some of these — just answer as honestly as you can.',
    part: 'A',
    fields: [
      { key: 'has_japanese_knotweed', label: 'Is there or has there been Japanese Knotweed at the property?', type: 'boolean', required: true, helpText: 'Japanese Knotweed is an invasive plant with bamboo-like stems and heart-shaped leaves. It grows very fast and can damage buildings and drains. If you\'ve ever seen it or had treatment, say yes.' },
      { key: 'knotweed_details', label: 'Please give details and any treatment plan', type: 'textarea', showWhen: { field: 'has_japanese_knotweed', value: true } },
      { key: 'has_flooding', label: 'Has the property ever been flooded?', type: 'boolean', required: true, helpText: 'This means any time water came into the property from outside — from rivers, heavy rain, burst pipes outside, or rising groundwater.' },
      { key: 'flooding_details', label: 'Please describe (when, source, severity)', type: 'textarea', showWhen: { field: 'has_flooding', value: true }, helpText: 'Tell us roughly when it happened, where the water came from, and how bad it was.' },
      { key: 'has_subsidence', label: 'Has the property been affected by subsidence, heave or landslip?', type: 'boolean', required: true, helpText: 'Subsidence means the ground beneath the property is sinking or moving. Signs include cracks in walls (especially diagonal ones around windows and doors), doors or windows that stick, or uneven floors.' },
      { key: 'subsidence_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_subsidence', value: true } },
      { key: 'has_asbestos', label: 'Are you aware of any asbestos in the property?', type: 'boolean', required: true, helpText: 'Asbestos is a material that was commonly used in buildings before the year 2000. It can be found in roof tiles, pipe insulation, artex ceilings, and floor tiles. It\'s safe if undisturbed, but harmful if broken or drilled into.' },
      { key: 'asbestos_details', label: 'Please describe location and type', type: 'textarea', showWhen: { field: 'has_asbestos', value: true } },
      { key: 'has_radon', label: 'Is the property in a radon-affected area?', type: 'select', helpText: 'Radon is a natural radioactive gas that comes from the ground. Some areas of the country have higher levels. You can check your area at ukradon.org. If you don\'t know, select "Unknown".', options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'has_coastal_erosion', label: 'Is the property affected by or at risk of coastal erosion?', type: 'boolean', helpText: 'This is only relevant if your property is near the coast. Coastal erosion means the land is being worn away by the sea.' },
      { key: 'coastal_erosion_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_coastal_erosion', value: true } },
      { key: 'has_mining', label: 'Is the property in a mining area?', type: 'select', helpText: 'Some parts of the UK were used for coal or other mining. Old mines underground can sometimes affect properties above. If you don\'t know, select "Unknown".', options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'has_listed_building', label: 'Is the property listed or in a conservation area?', type: 'boolean', helpText: 'A "listed building" is one that is officially recognised as having special historical or architectural interest. A "conservation area" is a neighbourhood with extra planning rules to protect its character. Both can limit what changes you can make.' },
      { key: 'listed_details', label: 'Please give details (grade, restrictions)', type: 'textarea', showWhen: { field: 'has_listed_building', value: true } },
    ],
  },
  {
    key: 'fixtures_fittings',
    title: 'Fixtures & Fittings',
    description: 'What stays and what goes? For each item below, tell us whether it\'s included in the sale price, or whether you\'re taking it with you. This avoids disagreements later.',
    part: 'A',
    fields: [
      { key: 'kitchen_fitted_units', label: 'Fitted kitchen units', type: 'select', required: true, helpText: 'The cupboards, worktops, and built-in units in the kitchen.', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
        { value: 'none', label: 'None at property' },
      ]},
      { key: 'kitchen_appliances', label: 'Kitchen appliances (oven, hob, extractor)', type: 'select', helpText: 'Built-in appliances like the oven, hob (cooktop), and extractor fan. Freestanding appliances like a fridge or washing machine can also be mentioned in the notes below.', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
        { value: 'none', label: 'None at property' },
      ]},
      { key: 'light_fittings', label: 'Light fittings', type: 'select', helpText: 'This means the lampshades, light fixtures, and ceiling lights. If you\'re taking any special light fittings with you, select "Excluded".', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
      ]},
      { key: 'curtains_blinds', label: 'Curtains and blinds', type: 'select', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
        { value: 'none', label: 'None at property' },
      ]},
      { key: 'carpets', label: 'Fitted carpets / floor coverings', type: 'select', helpText: 'Carpets, laminate, vinyl, or tiles that are fitted to the floor.', options: [
        { value: 'included', label: 'Included in sale' },
        { value: 'excluded', label: 'Excluded from sale' },
        { value: 'none', label: 'None at property' },
      ]},
      { key: 'bathroom_fittings', label: 'Bathroom fittings', type: 'select', helpText: 'The bath, shower, toilet, and basin. These are almost always included.', options: [
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
      { key: 'fixtures_notes', label: 'Any additional notes about fixtures and fittings?', type: 'textarea', helpText: 'Mention any other items — e.g. freestanding appliances, garden furniture, smart home devices, or anything you want to negotiate separately.' },
    ],
  },
  {
    key: 'utilities_services',
    title: 'Utilities & Services',
    description: 'Information about the gas, electric, water, heating, and broadband at the property. You can usually find supplier details on your latest bills.',
    part: 'A',
    fields: [
      { key: 'electricity_supplier', label: 'Electricity supplier', type: 'text', helpText: 'The company you pay for electricity — check a recent bill if unsure.' },
      { key: 'gas_connected', label: 'Is mains gas connected?', type: 'boolean', required: true, helpText: 'Does the property have a gas supply from the street? Not all properties do — some use electricity or oil for heating instead.' },
      { key: 'gas_supplier', label: 'Gas supplier', type: 'text', showWhen: { field: 'gas_connected', value: true } },
      { key: 'water_supplier', label: 'Water supplier', type: 'text', helpText: 'The company that supplies your water — check a recent bill if unsure.' },
      { key: 'water_meter', label: 'Is there a water meter?', type: 'boolean', helpText: 'A water meter measures how much water you use. If you have one, you pay for what you use. If not, you pay a fixed annual amount.' },
      { key: 'sewerage_connection', label: 'How is the property connected to sewerage?', type: 'select', required: true, helpText: 'Most properties connect to "mains sewer" (the public drainage system). Rural properties may have a septic tank (underground waste treatment) or cesspit (underground waste storage that needs emptying).', options: [
        { value: 'mains', label: 'Mains sewer' },
        { value: 'septic_tank', label: 'Septic tank' },
        { value: 'cesspit', label: 'Cesspit' },
        { value: 'treatment_plant', label: 'Treatment plant' },
        { value: 'other', label: 'Other' },
      ]},
      { key: 'sewerage_other', label: 'Please describe', type: 'text', showWhen: { field: 'sewerage_connection', value: 'other' } },
      { key: 'heating_type', label: 'Type of central heating', type: 'select', required: true, helpText: 'How is the property heated? Most UK homes use gas central heating. A heat pump uses outside air or ground heat (like a fridge in reverse).', options: [
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
      { key: 'boiler_age', label: 'Approximate age of boiler (years)', type: 'number', helpText: 'A rough number is fine. Boilers usually last 10-15 years. If you don\'t know, check the installation date on the boiler label.' },
      { key: 'broadband_type', label: 'Broadband availability', type: 'select', helpText: 'If you\'re not sure, check your current broadband speed or ask your provider. "Full fibre" is the fastest and most modern type.', options: [
        { value: 'fibre_full', label: 'Full fibre (FTTP)' },
        { value: 'fibre_cabinet', label: 'Fibre to cabinet (FTTC)' },
        { value: 'adsl', label: 'ADSL' },
        { value: 'cable', label: 'Cable' },
        { value: 'none', label: 'No broadband' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'mobile_signal', label: 'Mobile phone signal coverage', type: 'select', helpText: 'How well does your mobile phone work at the property? Can you make calls and use the internet easily?', options: [
        { value: 'good', label: 'Good' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'poor', label: 'Poor' },
        { value: 'none', label: 'No coverage' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'solar_panels', label: 'Are there solar panels on the property?', type: 'boolean', helpText: 'Solar panels on the roof that generate electricity.' },
      { key: 'solar_details', label: 'Please give details (owned/leased, feed-in tariff)', type: 'textarea', showWhen: { field: 'solar_panels', value: true }, helpText: 'Do you own the panels, or are they leased from a company? Are you receiving any payments for electricity generated (feed-in tariff)?' },
      { key: 'in_ulez', label: 'Is the property within the ULEZ zone? (London only)', type: 'select', helpText: 'ULEZ is London\'s Ultra Low Emission Zone — a charge applies to older, more polluting vehicles. Only relevant for London properties.', options: [
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
      { key: 'buildings_insurance_provider', label: 'Buildings insurance provider', type: 'text', helpText: 'The company that insures the building (not your contents). If you\'re leasehold, the freeholder may arrange this.' },
      { key: 'insurance_policy_number', label: 'Policy number', type: 'text', helpText: 'Found on your insurance certificate or policy documents.' },
      { key: 'has_insurance_claims', label: 'Have any insurance claims been made in the last 5 years?', type: 'boolean', required: true, helpText: 'Have you claimed on your buildings insurance in the past 5 years? For example, for storm damage, flooding, fire, theft damage, or subsidence.' },
      { key: 'claims_details', label: 'Please give details of claims', type: 'textarea', showWhen: { field: 'has_insurance_claims', value: true }, helpText: 'Describe what happened and roughly when.' },
      { key: 'has_insurance_refused', label: 'Has insurance ever been refused, cancelled, or had special terms imposed?', type: 'boolean', required: true, helpText: 'Has any insurance company ever refused to insure the property, cancelled the policy, or added special conditions (like a higher excess for flooding)?' },
      { key: 'insurance_refused_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_insurance_refused', value: true } },
      { key: 'has_title_indemnity', label: 'Is there any title defect insurance policy in place?', type: 'boolean', helpText: 'Title defect insurance is a special policy that protects against problems with the legal ownership of the property. Your solicitor may have arranged this previously.' },
      { key: 'title_indemnity_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_title_indemnity', value: true } },
    ],
  },
  {
    key: 'boundaries',
    title: 'Boundaries',
    description: 'Boundaries are the edges of your property — the fences, walls, or hedges that mark where your land ends and your neighbour\'s begins. This section asks who looks after each boundary.',
    part: 'A',
    fields: [
      { key: 'boundary_front', label: 'Who owns/maintains the front boundary?', type: 'select', required: true, helpText: 'The fence, wall, or hedge at the front of your property (facing the street). "Shared" means you and your neighbour both look after it.', options: [
        { value: 'seller', label: 'Seller' },
        { value: 'neighbour', label: 'Neighbour' },
        { value: 'shared', label: 'Shared' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'boundary_rear', label: 'Who owns/maintains the rear boundary?', type: 'select', required: true, helpText: 'The fence, wall, or hedge at the back of your property.', options: [
        { value: 'seller', label: 'Seller' },
        { value: 'neighbour', label: 'Neighbour' },
        { value: 'shared', label: 'Shared' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'boundary_left', label: 'Who owns/maintains the left boundary?', type: 'select', required: true, helpText: 'The boundary on the left side when you face the front of the property from the street.', options: [
        { value: 'seller', label: 'Seller' },
        { value: 'neighbour', label: 'Neighbour' },
        { value: 'shared', label: 'Shared' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'boundary_right', label: 'Who owns/maintains the right boundary?', type: 'select', required: true, helpText: 'The boundary on the right side when you face the front of the property from the street.', options: [
        { value: 'seller', label: 'Seller' },
        { value: 'neighbour', label: 'Neighbour' },
        { value: 'shared', label: 'Shared' },
        { value: 'unknown', label: 'Unknown' },
      ]},
      { key: 'has_boundary_disputes', label: 'Are there any boundary disputes?', type: 'boolean', required: true, helpText: 'Any disagreement with a neighbour about where the boundary line is, or about a fence/wall/hedge.' },
      { key: 'boundary_dispute_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_boundary_disputes', value: true } },
      { key: 'boundary_agreements', label: 'Are there any boundary agreements in place?', type: 'boolean', helpText: 'A formal or written agreement between you and a neighbour about the boundary — for example, about maintaining a shared fence.' },
      { key: 'boundary_agreement_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'boundary_agreements', value: true } },
    ],
  },
  {
    key: 'rights_arrangements',
    title: 'Rights & Informal Arrangements',
    description: 'This section is about whether anyone else has the right to use part of your property, or whether you have any informal agreements with neighbours. These things can affect the buyer.',
    part: 'A',
    fields: [
      { key: 'has_rights_of_way', label: 'Are there any rights of way across the property?', type: 'boolean', required: true, helpText: 'A right of way means someone else has the legal right to walk or drive across your property — for example, a neighbour using your driveway to reach their house.' },
      { key: 'rights_of_way_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_rights_of_way', value: true } },
      { key: 'has_shared_access', label: 'Is any access to the property shared with others?', type: 'boolean', required: true, helpText: 'For example, a shared driveway, shared path, or communal entrance that you use together with neighbours.' },
      { key: 'shared_access_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_shared_access', value: true } },
      { key: 'has_informal_arrangements', label: 'Are there any informal arrangements with neighbours?', type: 'boolean', helpText: 'Any unwritten agreements — for example, a neighbour parks in your space, you use part of their garden, or you share maintenance costs for something.' },
      { key: 'informal_arrangement_details', label: 'Please describe the arrangements', type: 'textarea', showWhen: { field: 'has_informal_arrangements', value: true } },
      { key: 'has_easements', label: 'Are there any easements benefiting or burdening the property?', type: 'boolean', helpText: 'An easement is a legal right for someone to use part of your land for a specific purpose — like utility companies running cables under your garden, or a neighbour having the right to drain water across your land. Check your title deeds or ask your solicitor.' },
      { key: 'easement_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_easements', value: true } },
    ],
  },
  {
    key: 'environmental',
    title: 'Environmental & Other Issues',
    description: 'A few final questions about potential environmental problems. Just answer honestly — most properties won\'t have any of these issues.',
    part: 'A',
    fields: [
      { key: 'has_contamination', label: 'Are you aware of any contamination on or near the property?', type: 'boolean', required: true, helpText: 'This could include things like old fuel tanks, chemical spills, or the property being near a former industrial site or landfill.' },
      { key: 'contamination_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_contamination', value: true } },
      { key: 'has_trees', label: 'Are there any trees subject to Tree Preservation Orders?', type: 'boolean', helpText: 'A Tree Preservation Order (TPO) means a tree on or near your property is legally protected by the council. You can\'t cut it down or significantly prune it without permission.' },
      { key: 'tree_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_trees', value: true } },
      { key: 'has_pest_issues', label: 'Have there been any pest infestations (woodworm, dry rot, etc.)?', type: 'boolean', helpText: 'Woodworm (tiny holes in timber), dry rot (crumbling wood from fungus), wet rot, mice, rats, or any other pest problems — even if they were treated.' },
      { key: 'pest_details', label: 'Please give details including treatment', type: 'textarea', showWhen: { field: 'has_pest_issues', value: true } },
      { key: 'has_damp_issues', label: 'Are there any damp issues?', type: 'boolean', helpText: 'Signs of damp include wet patches on walls, peeling wallpaper, black mould, musty smells, or condensation on windows.' },
      { key: 'damp_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_damp_issues', value: true } },
      { key: 'other_issues', label: 'Is there anything else a buyer should know about?', type: 'textarea', helpText: 'Anything else that might affect someone\'s decision to buy. If in doubt, mention it here — it\'s better to say too much than too little.' },
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
      { key: 'title_number', label: 'Title Number', type: 'text', required: true, helpText: 'This is a unique reference number from the Land Registry (e.g. "HD123456"). It\'s on your title deeds. If you don\'t have your deeds, your solicitor or mortgage lender may have them.' },
      { key: 'ownership_type', label: 'Type of ownership', type: 'select', required: true, helpText: '"Sole owner" means one person owns it. "Joint tenants" means two or more people own it equally (if one dies, the other inherits). "Tenants in common" means two or more people own shares (which can be unequal and can be left in a will).', options: [
        { value: 'sole', label: 'Sole owner' },
        { value: 'joint_tenants', label: 'Joint tenants' },
        { value: 'tenants_in_common', label: 'Tenants in common' },
      ]},
      { key: 'all_owners_agree', label: 'Do all legal owners agree to the sale?', type: 'boolean', required: true, helpText: 'Everyone named on the title deeds must agree to sell.' },
      { key: 'has_restrictions', label: 'Are there any restrictions on the title?', type: 'boolean', required: true, helpText: 'Restrictions are legal conditions attached to the property — for example, restrictions on how the property can be used, or a requirement to get someone else\'s consent before selling. Check your title deeds or ask your solicitor.' },
      { key: 'restriction_details', label: 'Please give details of any restrictions', type: 'textarea', showWhen: { field: 'has_restrictions', value: true } },
      { key: 'has_charges', label: 'Are there any charges registered against the title (mortgage, etc.)?', type: 'boolean', required: true, helpText: 'A "charge" is usually a mortgage — the bank has a legal claim on the property until the mortgage is paid off. If you have a mortgage, answer "Yes".' },
      { key: 'charge_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_charges', value: true }, helpText: 'Name the lender (e.g. "Nationwide Building Society mortgage").' },
    ],
  },
  {
    key: 'legal_boundaries',
    title: 'Legal Boundaries',
    description: 'This is about whether the actual fences and walls on the ground match the official map of your property (the "title plan"). Your solicitor can help check this.',
    part: 'B',
    fields: [
      { key: 'boundaries_match_title', label: 'Do the physical boundaries match the title plan?', type: 'boolean', required: true, helpText: 'Does where the fences/walls actually are match where the official Land Registry map says they should be? If you\'ve never checked, it\'s usually "Yes" unless you know something has changed.' },
      { key: 'boundary_discrepancy', label: 'Please describe any discrepancies', type: 'textarea', showWhen: { field: 'boundaries_match_title', value: false } },
      { key: 'has_boundary_changes', label: 'Have any boundaries been moved or altered?', type: 'boolean', required: true, helpText: 'Has any fence, wall, or hedge been moved from its original position? For example, if you or a neighbour moved a fence.' },
      { key: 'boundary_change_details', label: 'Please describe what changed and when', type: 'textarea', showWhen: { field: 'has_boundary_changes', value: true } },
    ],
  },
  {
    key: 'services_crossing',
    title: 'Services Crossing Other Property',
    description: 'Sometimes pipes, wires, or drains need to cross through a neighbour\'s land to reach your property (or vice versa). This section asks about that.',
    part: 'B',
    fields: [
      { key: 'has_services_crossing', label: 'Do any pipes, wires, cables or drains cross neighbouring property?', type: 'boolean', required: true, helpText: 'Do any of your water pipes, electricity cables, gas pipes, or drains run through or under a neighbour\'s land to connect to your property?' },
      { key: 'services_crossing_details', label: 'Please describe which services and which properties', type: 'textarea', showWhen: { field: 'has_services_crossing', value: true } },
      { key: 'has_neighbour_services', label: 'Do any neighbouring services cross your property?', type: 'boolean', required: true, helpText: 'The opposite — do any of your neighbour\'s pipes, cables, or drains run through or under your land?' },
      { key: 'neighbour_services_details', label: 'Please describe', type: 'textarea', showWhen: { field: 'has_neighbour_services', value: true } },
      { key: 'has_shared_drains', label: 'Are any drains shared with neighbouring properties?', type: 'boolean', helpText: 'Some properties share drainage pipes — this is common with terraced houses and semi-detached homes.' },
      { key: 'shared_drain_details', label: 'Please describe', type: 'textarea', showWhen: { field: 'has_shared_drains', value: true } },
    ],
  },
  {
    key: 'energy',
    title: 'Energy',
    description: 'Every property for sale needs an Energy Performance Certificate (EPC). It rates how energy-efficient your home is from A (best) to G (worst). You can find your EPC at epcregister.com.',
    part: 'B',
    fields: [
      { key: 'epc_rating', label: 'Current EPC Rating', type: 'select', required: true, helpText: 'A to G rating showing the energy efficiency of the property. A is the most efficient, G is the least. You can look up your property\'s rating for free at epcregister.com.', options: [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
        { value: 'E', label: 'E' },
        { value: 'F', label: 'F' },
        { value: 'G', label: 'G' },
        { value: 'exempt', label: 'Exempt' },
      ]},
      { key: 'epc_certificate_number', label: 'EPC Certificate Number', type: 'text', helpText: 'A unique reference number on your EPC certificate. You can find this on the certificate itself or at epcregister.com.' },
      { key: 'epc_expiry_date', label: 'EPC Expiry Date', type: 'date', helpText: 'EPCs are valid for 10 years from the date they were issued.' },
      { key: 'has_green_deal', label: 'Is there a Green Deal plan on the property?', type: 'boolean', helpText: 'The Green Deal was a government loan scheme for energy improvements (like insulation or new boilers). The loan is attached to the property, not the person — so the buyer would take over the repayments. Most properties don\'t have one.' },
      { key: 'green_deal_details', label: 'Please give details of the Green Deal plan', type: 'textarea', showWhen: { field: 'has_green_deal', value: true } },
    ],
  },
  {
    key: 'guarantees_warranties',
    title: 'Guarantees & Warranties',
    description: 'If any work has been done on the property, there may be guarantees or warranties that can be passed on to the buyer. Dig out any paperwork you have — it can add value to your sale.',
    part: 'B',
    fields: [
      { key: 'has_new_build_warranty', label: 'Is there a new build warranty (e.g. NHBC, Premier, LABC)?', type: 'boolean', required: true, helpText: 'If the property was built within the last 10 years, it probably came with a new-build warranty (usually from NHBC). This protects against structural defects. Check your paperwork from when you bought the property.' },
      { key: 'new_build_warranty_details', label: 'Provider and expiry date', type: 'textarea', showWhen: { field: 'has_new_build_warranty', value: true } },
      { key: 'has_damp_guarantee', label: 'Is there a damp-proofing guarantee?', type: 'boolean', helpText: 'If damp-proofing work was done (injecting chemicals into walls to stop damp rising), it usually comes with a long guarantee (e.g. 20-30 years).' },
      { key: 'damp_guarantee_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_damp_guarantee', value: true } },
      { key: 'has_timber_guarantee', label: 'Is there a timber treatment guarantee?', type: 'boolean', helpText: 'If timber was treated for woodworm or rot, there may be a guarantee from the treatment company.' },
      { key: 'timber_guarantee_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_timber_guarantee', value: true } },
      { key: 'has_window_guarantee', label: 'Are there guarantees for windows, doors, or double glazing?', type: 'boolean', helpText: 'New windows and doors often come with a 10-year guarantee. Check any paperwork from when they were installed.' },
      { key: 'window_guarantee_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_window_guarantee', value: true } },
      { key: 'has_electrical_guarantee', label: 'Is there an electrical installation certificate?', type: 'boolean', helpText: 'If the property was rewired or had significant electrical work, there should be an electrical certificate from a qualified electrician. This shows the work meets safety standards.' },
      { key: 'electrical_guarantee_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_electrical_guarantee', value: true } },
      { key: 'has_roofing_guarantee', label: 'Is there a roofing guarantee?', type: 'boolean', helpText: 'If the roof was replaced or repaired, there may be a guarantee from the roofer — typically 10-20 years.' },
      { key: 'roofing_guarantee_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_roofing_guarantee', value: true } },
      { key: 'has_indemnity_policies', label: 'Are there any indemnity insurance policies?', type: 'boolean', helpText: 'Indemnity insurance covers specific legal risks — for example, if building regulations sign-off is missing for previous work, or if there\'s a risk of someone claiming a right over the property. Your solicitor may have arranged these.' },
      { key: 'indemnity_details', label: 'Please give details of indemnity policies', type: 'textarea', showWhen: { field: 'has_indemnity_policies', value: true } },
      { key: 'has_other_guarantees', label: 'Any other guarantees or warranties?', type: 'textarea', helpText: 'Any other guarantee or warranty documents for work done at the property — boiler, kitchen, bathroom, etc.' },
    ],
  },
  {
    key: 'occupiers',
    title: 'Occupiers',
    description: 'This is about who currently lives in the property. The buyer\'s solicitor needs to know so they can make sure everyone will move out before the sale completes.',
    part: 'B',
    fields: [
      { key: 'is_occupied', label: 'Is the property currently occupied?', type: 'boolean', required: true, helpText: 'Does anyone currently live in the property? (Including you)' },
      { key: 'occupier_names', label: 'Names of all current occupants (over 17)', type: 'textarea', showWhen: { field: 'is_occupied', value: true }, helpText: 'List everyone over 17 who lives at the property — including family members, partners, and lodgers. Each person may need to agree to vacate before the sale completes.' },
      { key: 'has_tenants', label: 'Are there any tenants in the property?', type: 'boolean', required: true, helpText: 'A tenant is someone who pays rent to live in the property (or part of it) under a tenancy agreement.' },
      { key: 'tenant_details', label: 'Please give details of the tenancy', type: 'textarea', showWhen: { field: 'has_tenants', value: true }, helpText: 'Include tenant names, the type of tenancy agreement, start and end dates, and the monthly rent amount.' },
      { key: 'all_occupiers_will_vacate', label: 'Will all occupiers vacate on or before completion?', type: 'boolean', helpText: '"Completion" is the day the sale officially goes through and the buyer gets the keys. Will everyone currently living there have moved out by that date?' },
      { key: 'vacate_details', label: 'Please explain', type: 'textarea', showWhen: { field: 'all_occupiers_will_vacate', value: false }, helpText: 'Explain who will still be in the property and why. This is important for the buyer to know.' },
    ],
  },
  {
    key: 'completion_moving',
    title: 'Completion & Moving',
    description: 'Nearly done! This section is about the practicalities of the sale — when you\'d like to move, whether you\'re buying somewhere else, and your solicitor\'s details.',
    part: 'B',
    fields: [
      { key: 'preferred_completion_date', label: 'Preferred completion date', type: 'date', helpText: 'When would you ideally like the sale to go through? This is the date you\'d hand over the keys. It\'s just a preference — the actual date is agreed between both sides.' },
      { key: 'is_chain', label: 'Are you in a property chain?', type: 'boolean', required: true, helpText: 'A "chain" means your sale depends on another sale. For example, if you need to sell your house before you can buy your next one, and the person buying yours also needs to sell theirs — that\'s a chain. Chains can slow things down.' },
      { key: 'chain_details', label: 'Please describe the chain position', type: 'textarea', showWhen: { field: 'is_chain', value: true }, helpText: 'Explain your position — e.g. "I am buying a property from someone who is also buying elsewhere" or "First-time buyer purchasing, no chain below."' },
      { key: 'has_dependent_purchase', label: 'Is the sale dependent on you purchasing another property?', type: 'boolean', required: true, helpText: 'Do you need the money from this sale to buy your next home? If you\'re moving into rented accommodation, or already own another property, select "No".' },
      { key: 'dependent_purchase_status', label: 'What is the status of your purchase?', type: 'select', showWhen: { field: 'has_dependent_purchase', value: true }, helpText: 'How far along are you with buying your next home?', options: [
        { value: 'searching', label: 'Still searching' },
        { value: 'offer_made', label: 'Offer made' },
        { value: 'offer_accepted', label: 'Offer accepted' },
        { value: 'conveyancing', label: 'Conveyancing in progress' },
      ]},
      { key: 'solicitor_name', label: 'Solicitor / Conveyancer name', type: 'text', helpText: 'The name of the lawyer handling your sale. If you haven\'t appointed one yet, you can come back and fill this in later.' },
      { key: 'solicitor_firm', label: 'Solicitor / Conveyancer firm', type: 'text' },
      { key: 'solicitor_email', label: 'Solicitor / Conveyancer email', type: 'text' },
      { key: 'solicitor_phone', label: 'Solicitor / Conveyancer phone', type: 'text' },
      { key: 'solicitor_reference', label: 'Solicitor reference', type: 'text', helpText: 'Your solicitor\'s file reference number for this sale — they can give you this.' },
    ],
  },
  {
    key: 'additional_legal',
    title: 'Additional Legal Information',
    description: 'These questions are mainly relevant if the property is leasehold (e.g. a flat with a lease). If you own a freehold house, many of these won\'t apply — just leave them blank.',
    part: 'B',
    fields: [
      { key: 'has_leasehold_info', label: 'If leasehold: remaining lease term (years)', type: 'number', helpText: 'How many years are left on your lease? This is very important — leases under 80 years can affect the property\'s value and mortgage-ability. Check your lease or ask your solicitor. Leave blank if you own the freehold.' },
      { key: 'ground_rent', label: 'Annual ground rent (if leasehold)', type: 'text', helpText: 'Ground rent is a yearly payment you make to the freeholder (the person who owns the land your property sits on). Check your lease for the amount. If it increases over time, mention that too.' },
      { key: 'service_charge', label: 'Annual service charge (if applicable)', type: 'text', helpText: 'A yearly fee for the upkeep of shared areas — common with flats. This covers things like cleaning communal hallways, maintaining the roof, and buildings insurance.' },
      { key: 'management_company', label: 'Management company name', type: 'text', helpText: 'The company that manages the building — they collect service charges and arrange maintenance of shared areas.' },
      { key: 'has_freehold_share', label: 'Do you own a share of the freehold?', type: 'boolean', helpText: 'Some flat owners club together to buy the freehold of their building. If you own a share, it usually means you have more control over service charges and building decisions.' },
      { key: 'reserve_fund', label: 'Reserve/sinking fund amount', type: 'text', helpText: 'A pot of money saved for future big repairs (like a new roof). If there\'s a reserve fund, say how much is in it. This is usually mentioned in your service charge accounts.' },
      { key: 'annual_contribution', label: 'Annual contribution amount', type: 'text', helpText: 'How much you pay each year into the reserve fund.' },
      { key: 'has_transfer_fee', label: 'Is there a transfer fee or admin charge on sale?', type: 'boolean', helpText: 'Some freeholders or management companies charge a fee when a property is sold. This is sometimes called a "transfer fee", "deed of covenant fee", or "notice fee".' },
      { key: 'transfer_fee_details', label: 'Please give details and amount', type: 'textarea', showWhen: { field: 'has_transfer_fee', value: true } },
      { key: 'has_other_legal_info', label: 'Is there any other legal information the buyer should know?', type: 'boolean', helpText: 'Anything else that a buyer or their solicitor should be aware of about the legal aspects of the property.' },
      { key: 'other_legal_details', label: 'Please give details', type: 'textarea', showWhen: { field: 'has_other_legal_info', value: true } },
    ],
  },
  {
    key: 'declaration',
    title: 'Declaration',
    description: 'You\'re at the final step. Please confirm that the information you\'ve provided is true and accurate to the best of your knowledge. You\'re not expected to know everything perfectly — just be honest.',
    part: 'B',
    fields: [
      { key: 'declaration_confirmed', label: 'I confirm the information I have provided is accurate and complete to the best of my knowledge', type: 'boolean', required: true, helpText: 'By selecting "Yes", you\'re saying that everything you\'ve filled in is true as far as you know. If you find out something is wrong later, you should let your solicitor and estate agent know.' },
      { key: 'declaration_date', label: 'Date of declaration', type: 'date', required: true, helpText: 'Today\'s date.' },
      { key: 'declaration_name', label: 'Full name', type: 'text', required: true, helpText: 'Your full legal name — this acts as your signature.' },
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
