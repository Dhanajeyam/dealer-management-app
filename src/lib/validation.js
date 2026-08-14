/**
 * GSTIN Format Validator
 * Standard Indian GSTIN: 15 alphanumeric characters
 * Example: 33ABCDE1234F1Z5
 * Returns true if empty/null (optional) or matches standard 15-char GSTIN pattern.
 */
export const isValidGstin = (gstin) => {
  if (!gstin || !gstin.trim()) return true
  const trimmed = gstin.trim().toUpperCase()
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstinRegex.test(trimmed)
}
