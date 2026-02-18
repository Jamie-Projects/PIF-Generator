import { BASPI_SECTIONS, getSectionByKey } from './baspiSchema';

export type RiskLevel = 'red' | 'amber' | 'green';

export interface RiskFlag {
  level: RiskLevel;
  section: string;
  sectionKey: string;
  field: string;
  fieldKey: string;
  summary: string;
  advice: string;
}

export interface ConveyancerSummary {
  propertyAddress: string;
  sellerName: string;
  generatedAt: string;
  redFlags: RiskFlag[];
  amberFlags: RiskFlag[];
  greenCount: number;
  totalChecked: number;
}

interface SectionData {
  sectionKey: string;
  data: Record<string, unknown>;
}

type RiskRule = {
  sectionKey: string;
  fieldKey: string;
  evaluate: (value: unknown, allSectionData: Record<string, unknown>) => RiskFlag | null;
};

function flag(
  level: RiskLevel,
  sectionKey: string,
  fieldKey: string,
  summary: string,
  advice: string
): RiskFlag {
  const sectionDef = getSectionByKey(sectionKey);
  const fieldDef = sectionDef?.fields.find(f => f.key === fieldKey);
  return {
    level,
    section: sectionDef?.title || sectionKey,
    sectionKey,
    field: fieldDef?.label || fieldKey,
    fieldKey,
    summary,
    advice,
  };
}

const RISK_RULES: RiskRule[] = [
  // === DISPUTES & COMPLAINTS ===
  {
    sectionKey: 'disputes_complaints',
    fieldKey: 'has_neighbour_disputes',
    evaluate: (v) => v === true
      ? flag('red', 'disputes_complaints', 'has_neighbour_disputes',
          'Active or historical neighbour dispute disclosed',
          'Request full details, dates, and any correspondence. Check if dispute is ongoing or resolved. Consider whether indemnity insurance is needed.')
      : null,
  },
  {
    sectionKey: 'disputes_complaints',
    fieldKey: 'has_legal_action',
    evaluate: (v) => v === true
      ? flag('red', 'disputes_complaints', 'has_legal_action',
          'Legal action associated with the property',
          'Obtain full details of litigation. Check court records. Assess whether this affects title or creates ongoing liability for buyer.')
      : null,
  },
  {
    sectionKey: 'disputes_complaints',
    fieldKey: 'has_antisocial_behaviour',
    evaluate: (v) => v === true
      ? flag('amber', 'disputes_complaints', 'has_antisocial_behaviour',
          'Anti-social behaviour reported in the area',
          'Request details and check local authority records. May affect property value and buyer satisfaction.')
      : null,
  },
  {
    sectionKey: 'disputes_complaints',
    fieldKey: 'has_noise_issues',
    evaluate: (v) => v === true
      ? flag('amber', 'disputes_complaints', 'has_noise_issues',
          'Noise issues affecting the property',
          'Request specifics (source, frequency). Check local authority noise complaints register.')
      : null,
  },

  // === ALTERATIONS ===
  {
    sectionKey: 'alterations',
    fieldKey: 'extension_approved',
    evaluate: (v, data) => {
      if (data.has_extensions !== true) return null;
      if (v === 'neither') return flag('red', 'alterations', 'extension_approved',
        'Extension built without planning permission or building regulations',
        'High risk. Obtain retrospective approval or arrange indemnity insurance. May need regularisation certificate. Lender may refuse mortgage.');
      if (v === 'planning_only') return flag('amber', 'alterations', 'extension_approved',
        'Extension has planning permission but no building regulations sign-off',
        'Building regulations completion certificate is needed. May need retrospective approval or indemnity insurance.');
      if (v === 'building_regs_only') return flag('amber', 'alterations', 'extension_approved',
        'Extension has building regulations but no planning permission',
        'Check if permitted development applies. May need a certificate of lawfulness or indemnity insurance.');
      if (v === 'unknown') return flag('red', 'alterations', 'extension_approved',
        'Extension approval status is unknown',
        'Investigate urgently. Request any available documentation. Lender will likely require evidence of compliance.');
      return null;
    },
  },
  {
    sectionKey: 'alterations',
    fieldKey: 'has_loft_conversion',
    evaluate: (v) => v === true
      ? flag('amber', 'alterations', 'has_loft_conversion',
          'Loft conversion carried out',
          'Verify building regulations completion certificate exists. Check fire safety compliance (fire doors, escape route). Confirm structural calculations were done.')
      : null,
  },
  {
    sectionKey: 'alterations',
    fieldKey: 'has_walls_removed',
    evaluate: (v) => v === true
      ? flag('amber', 'alterations', 'has_walls_removed',
          'Internal walls removed',
          'Confirm whether walls were load-bearing. If so, check structural engineer\'s certificate and building regulations sign-off.')
      : null,
  },
  {
    sectionKey: 'alterations',
    fieldKey: 'has_change_of_use',
    evaluate: (v) => v === true
      ? flag('amber', 'alterations', 'has_change_of_use',
          'Change of use has occurred',
          'Verify planning permission was obtained for the change. Check building regulations compliance.')
      : null,
  },

  // === NOTICES ===
  {
    sectionKey: 'notices',
    fieldKey: 'has_planning_notices',
    evaluate: (v) => v === true
      ? flag('amber', 'notices', 'has_planning_notices',
          'Planning notices received affecting property or area',
          'Request copies of all notices. Check local planning portal for details of proposed development.')
      : null,
  },
  {
    sectionKey: 'notices',
    fieldKey: 'has_building_control_notices',
    evaluate: (v) => v === true
      ? flag('red', 'notices', 'has_building_control_notices',
          'Building control notices received',
          'Obtain full details immediately. May indicate safety or compliance failures. Could affect insurability and mortgage.')
      : null,
  },
  {
    sectionKey: 'notices',
    fieldKey: 'has_environmental_notices',
    evaluate: (v) => v === true
      ? flag('red', 'notices', 'has_environmental_notices',
          'Environmental notices received (contamination/flooding)',
          'Obtain environmental search results. Check flood risk maps. May require specialist survey and affect insurance/mortgage.')
      : null,
  },

  // === SPECIALIST ISSUES ===
  {
    sectionKey: 'specialist_issues',
    fieldKey: 'has_japanese_knotweed',
    evaluate: (v) => v === true
      ? flag('red', 'specialist_issues', 'has_japanese_knotweed',
          'Japanese Knotweed present or previously found',
          'This is a major issue. Obtain professional treatment plan and insurance-backed guarantee. Most lenders require a management plan. Can cause structural damage.')
      : null,
  },
  {
    sectionKey: 'specialist_issues',
    fieldKey: 'has_flooding',
    evaluate: (v) => v === true
      ? flag('red', 'specialist_issues', 'has_flooding',
          'Property has previously flooded',
          'Obtain detailed flood history. Check Environment Agency flood maps. Buildings insurance may be costly or have exclusions. Recommend flood risk assessment.')
      : null,
  },
  {
    sectionKey: 'specialist_issues',
    fieldKey: 'has_subsidence',
    evaluate: (v) => v === true
      ? flag('red', 'specialist_issues', 'has_subsidence',
          'Subsidence, heave, or landslip has affected the property',
          'Obtain full structural engineer\'s report and any underpinning certificates. Check insurance claims history. Lender may require specialist survey.')
      : null,
  },
  {
    sectionKey: 'specialist_issues',
    fieldKey: 'has_asbestos',
    evaluate: (v) => v === true
      ? flag('amber', 'specialist_issues', 'has_asbestos',
          'Asbestos present in the property',
          'Request asbestos survey report if available. Note location and condition. Safe if undisturbed but removal needed before any renovation work.')
      : null,
  },
  {
    sectionKey: 'specialist_issues',
    fieldKey: 'has_coastal_erosion',
    evaluate: (v) => v === true
      ? flag('red', 'specialist_issues', 'has_coastal_erosion',
          'Property at risk of coastal erosion',
          'Major long-term risk. Check Environment Agency shoreline management plan. May affect property value and insurability. Lender may decline mortgage.')
      : null,
  },
  {
    sectionKey: 'specialist_issues',
    fieldKey: 'has_listed_building',
    evaluate: (v) => v === true
      ? flag('amber', 'specialist_issues', 'has_listed_building',
          'Property is listed or in a conservation area',
          'Restrictions apply to alterations. Verify any past works had listed building consent. Ongoing maintenance obligations may apply.')
      : null,
  },

  // === INSURANCE ===
  {
    sectionKey: 'insurance',
    fieldKey: 'has_insurance_claims',
    evaluate: (v) => v === true
      ? flag('amber', 'insurance', 'has_insurance_claims',
          'Insurance claims made in the last 5 years',
          'Request details of all claims. May indicate recurring issues (flooding, subsidence). Could affect future premiums.')
      : null,
  },
  {
    sectionKey: 'insurance',
    fieldKey: 'has_insurance_refused',
    evaluate: (v) => v === true
      ? flag('red', 'insurance', 'has_insurance_refused',
          'Insurance has been refused, cancelled, or had special terms',
          'Serious concern. Buyer may struggle to obtain buildings insurance. Investigate reasons and check current insurability before exchange.')
      : null,
  },

  // === BOUNDARIES ===
  {
    sectionKey: 'boundaries',
    fieldKey: 'has_boundary_disputes',
    evaluate: (v) => v === true
      ? flag('red', 'boundaries', 'has_boundary_disputes',
          'Boundary dispute exists',
          'Obtain full details. May need mediation or legal resolution before sale. Check title plan against physical boundaries.')
      : null,
  },

  // === RIGHTS & ARRANGEMENTS ===
  {
    sectionKey: 'rights_arrangements',
    fieldKey: 'has_rights_of_way',
    evaluate: (v) => v === true
      ? flag('amber', 'rights_arrangements', 'has_rights_of_way',
          'Rights of way exist across the property',
          'Verify details and check title entries. Buyer should understand the practical impact on their use of the property.')
      : null,
  },
  {
    sectionKey: 'rights_arrangements',
    fieldKey: 'has_informal_arrangements',
    evaluate: (v) => v === true
      ? flag('amber', 'rights_arrangements', 'has_informal_arrangements',
          'Informal arrangements with neighbours',
          'These are not legally binding and may not transfer to buyer. Consider whether formal agreements should be put in place.')
      : null,
  },

  // === ENVIRONMENTAL ===
  {
    sectionKey: 'environmental',
    fieldKey: 'has_contamination',
    evaluate: (v) => v === true
      ? flag('red', 'environmental', 'has_contamination',
          'Contamination reported on or near the property',
          'Environmental search essential. May need specialist contamination survey. Could affect development potential and insurance.')
      : null,
  },
  {
    sectionKey: 'environmental',
    fieldKey: 'has_pest_issues',
    evaluate: (v) => v === true
      ? flag('amber', 'environmental', 'has_pest_issues',
          'Pest infestation (woodworm, dry rot, etc.) reported',
          'Check if treatment was carried out and obtain guarantee. May need specialist survey if issue is recent or ongoing.')
      : null,
  },
  {
    sectionKey: 'environmental',
    fieldKey: 'has_damp_issues',
    evaluate: (v) => v === true
      ? flag('amber', 'environmental', 'has_damp_issues',
          'Damp issues reported',
          'Recommend damp survey. Check if treatment was carried out. Could indicate structural or drainage problems.')
      : null,
  },

  // === LEGAL OWNERSHIP ===
  {
    sectionKey: 'legal_ownership',
    fieldKey: 'all_owners_agree',
    evaluate: (v) => v === false
      ? flag('red', 'legal_ownership', 'all_owners_agree',
          'Not all legal owners agree to the sale',
          'Sale cannot proceed without all owners\' consent. Urgent legal advice needed. May require court order if ownership is disputed.')
      : null,
  },
  {
    sectionKey: 'legal_ownership',
    fieldKey: 'has_restrictions',
    evaluate: (v) => v === true
      ? flag('amber', 'legal_ownership', 'has_restrictions',
          'Title restrictions exist',
          'Review official copies of title register. Restrictions may limit use or require consent for sale. May need restriction to be removed or complied with.')
      : null,
  },

  // === LEGAL BOUNDARIES ===
  {
    sectionKey: 'legal_boundaries',
    fieldKey: 'boundaries_match_title',
    evaluate: (v) => v === false
      ? flag('red', 'legal_boundaries', 'boundaries_match_title',
          'Physical boundaries do not match the title plan',
          'This is a significant issue. May indicate adverse possession, encroachment, or error. Will likely need resolution before sale can complete.')
      : null,
  },

  // === OCCUPIERS ===
  {
    sectionKey: 'occupiers',
    fieldKey: 'has_tenants',
    evaluate: (v) => v === true
      ? flag('red', 'occupiers', 'has_tenants',
          'Tenants currently in the property',
          'Obtain full tenancy details. Check notice periods and whether tenancy will be terminated before completion. May affect buyer\'s mortgage offer.')
      : null,
  },
  {
    sectionKey: 'occupiers',
    fieldKey: 'all_occupiers_will_vacate',
    evaluate: (v) => v === false
      ? flag('red', 'occupiers', 'all_occupiers_will_vacate',
          'Not all occupiers will vacate by completion',
          'Critical issue. All occupiers must sign a waiver of rights or vacate. Buyer\'s lender will almost certainly require vacant possession.')
      : null,
  },

  // === COMPLETION & MOVING ===
  {
    sectionKey: 'completion_moving',
    fieldKey: 'is_chain',
    evaluate: (v) => v === true
      ? flag('amber', 'completion_moving', 'is_chain',
          'Property is in a chain',
          'Increases risk of delays and fall-throughs. Monitor chain progress closely. Consider break clauses.')
      : null,
  },
  {
    sectionKey: 'completion_moving',
    fieldKey: 'has_dependent_purchase',
    evaluate: (v, data) => {
      if (v !== true) return null;
      if (data.dependent_purchase_status === 'searching')
        return flag('red', 'completion_moving', 'has_dependent_purchase',
          'Seller has dependent purchase but is still searching',
          'High risk of delay. Sale may fall through if seller cannot find a property. Set timeline expectations.');
      if (data.dependent_purchase_status === 'offer_made')
        return flag('amber', 'completion_moving', 'has_dependent_purchase',
          'Seller has dependent purchase with offer made but not yet accepted',
          'Moderate risk. Monitor progress of seller\'s purchase. Consider timeline implications.');
      return flag('amber', 'completion_moving', 'has_dependent_purchase',
        'Sale is dependent on seller purchasing another property',
        'Track progress of the onward purchase. Align completion dates where possible.');
    },
  },

  // === ADDITIONAL LEGAL (LEASEHOLD) ===
  {
    sectionKey: 'additional_legal',
    fieldKey: 'has_leasehold_info',
    evaluate: (v) => {
      if (v === null || v === undefined || v === '') return null;
      const years = Number(v);
      if (isNaN(years)) return null;
      if (years < 80) return flag('red', 'additional_legal', 'has_leasehold_info',
        `Short lease: ${years} years remaining`,
        'Under 80 years is a serious concern. Lease extension will be needed — costs increase significantly below 80 years. Most lenders require 70+ years. Negotiate extension before exchange.');
      if (years < 90) return flag('amber', 'additional_legal', 'has_leasehold_info',
        `Lease has ${years} years remaining`,
        'Approaching the 80-year threshold. Recommend buyer negotiates lease extension. Premium increases significantly once under 80 years.');
      return null;
    },
  },

  // === ENERGY ===
  {
    sectionKey: 'energy',
    fieldKey: 'epc_rating',
    evaluate: (v) => {
      if (v === 'F' || v === 'G') return flag('amber', 'energy', 'epc_rating',
        `Low EPC rating: ${v}`,
        'Property has poor energy efficiency. May not meet minimum energy standards for letting. Buyer should budget for energy improvements.');
      return null;
    },
  },
  {
    sectionKey: 'energy',
    fieldKey: 'has_green_deal',
    evaluate: (v) => v === true
      ? flag('amber', 'energy', 'has_green_deal',
          'Green Deal plan attached to the property',
          'Financial obligation transfers to new owner. Buyer must be informed before exchange. Check outstanding balance and repayment terms.')
      : null,
  },

  // === UTILITIES ===
  {
    sectionKey: 'utilities_services',
    fieldKey: 'sewerage_connection',
    evaluate: (v) => {
      if (v === 'septic_tank' || v === 'cesspit' || v === 'treatment_plant')
        return flag('amber', 'utilities_services', 'sewerage_connection',
          `Non-mains drainage: ${v === 'septic_tank' ? 'septic tank' : v === 'cesspit' ? 'cesspit' : 'treatment plant'}`,
          'Check compliance with Environment Agency regulations. May need General Binding Rules registration. Buyer should understand maintenance responsibilities.');
      return null;
    },
  },

  // === SERVICES CROSSING ===
  {
    sectionKey: 'services_crossing',
    fieldKey: 'has_services_crossing',
    evaluate: (v) => v === true
      ? flag('amber', 'services_crossing', 'has_services_crossing',
          'Property services cross neighbouring land',
          'Check for formal easements. If informal, consider negotiating a formal right before sale.')
      : null,
  },

  // === PROPERTY DETAILS ===
  {
    sectionKey: 'property_details',
    fieldKey: 'has_commercial',
    evaluate: (v) => v === true
      ? flag('amber', 'property_details', 'has_commercial',
          'Property includes commercial use',
          'Check planning permission for mixed use. May affect residential mortgage. Different insurance requirements may apply.')
      : null,
  },
];

export function analyseRisks(
  sections: SectionData[],
  propertyAddress: string,
  sellerName: string
): ConveyancerSummary {
  const redFlags: RiskFlag[] = [];
  const amberFlags: RiskFlag[] = [];
  let greenCount = 0;
  let totalChecked = 0;

  // Build a map of section data for easy access
  const sectionDataMap: Record<string, Record<string, unknown>> = {};
  for (const section of sections) {
    sectionDataMap[section.sectionKey] = section.data || {};
  }

  for (const rule of RISK_RULES) {
    const data = sectionDataMap[rule.sectionKey];
    if (!data) continue;

    const value = data[rule.fieldKey];
    // Skip unanswered questions
    if (value === undefined || value === null || value === '') continue;

    totalChecked++;
    const result = rule.evaluate(value, data);

    if (result) {
      if (result.level === 'red') {
        redFlags.push(result);
      } else if (result.level === 'amber') {
        amberFlags.push(result);
      }
    } else {
      greenCount++;
    }
  }

  return {
    propertyAddress,
    sellerName,
    generatedAt: new Date().toISOString(),
    redFlags,
    amberFlags,
    greenCount,
    totalChecked,
  };
}
