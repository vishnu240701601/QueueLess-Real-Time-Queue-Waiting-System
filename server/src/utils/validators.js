// =====================================================================
// QueueLess – Input Validation Helpers
// =====================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(uuid) {
  if (typeof uuid !== 'string') return false;
  return UUID_REGEX.test(uuid.trim());
}

function sanitizeString(str, maxLength = 255) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

module.exports = {
  isValidUUID,
  sanitizeString
};
