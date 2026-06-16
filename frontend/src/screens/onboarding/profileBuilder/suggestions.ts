/**
 * Quick-pick suggestion chips. Tapping one pre-fills the entry's primary field;
 * the user still confirms / edits the row. Source: spec §5 constants block.
 */

export const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa drugs',
  'Aspirin',
  'Ibuprofen',
  'Codeine',
  'Morphine',
  'Latex',
  'Peanuts',
  'Tree nuts',
  'Shellfish',
  'Eggs',
  'Dairy/Milk',
  'Soy',
  'Wheat/Gluten',
  'Bee stings',
];

export const COMMON_MEDICATIONS: { name: string; purpose: string }[] = [
  { name: 'Metformin', purpose: 'Diabetes' },
  { name: 'Insulin', purpose: 'Diabetes' },
  { name: 'Lisinopril', purpose: 'Blood Pressure' },
  { name: 'Atorvastatin', purpose: 'Cholesterol' },
  { name: 'Levothyroxine', purpose: 'Thyroid' },
  { name: 'Albuterol', purpose: 'Asthma' },
  { name: 'Warfarin', purpose: 'Blood Thinner' },
  { name: 'Aspirin 81mg', purpose: 'Heart' },
  { name: 'Omeprazole', purpose: 'Reflux' },
  { name: 'Metoprolol', purpose: 'Heart' },
];

export const COMMON_CONDITIONS = [
  'Type 2 Diabetes',
  'Type 1 Diabetes',
  'High Blood Pressure',
  'High Cholesterol',
  'Asthma',
  'COPD',
  'Heart Disease',
  'Epilepsy',
  'Stroke History',
  'Kidney Disease',
  'Liver Disease',
];
