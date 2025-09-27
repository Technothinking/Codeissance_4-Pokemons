const moment = require('moment-timezone');

/**
 * Converts time from "HH:mm" string to minutes since midnight
 * @param {string} timeStr - Time string in "HH:mm" format
 * @returns {number} minutes since midnight
 */
function timeStrToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts minutes since midnight to "HH:mm" string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} time string
 */
function minutesToTimeStr(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Checks if two time intervals overlap
 * @param {string} start1 - Start time of first interval "HH:mm"
 * @param {string} end1 - End time of first interval "HH:mm"
 * @param {string} start2 - Start time of second interval "HH:mm"
 * @param {string} end2 - End time of second interval "HH:mm"
 * @returns {boolean} whether the intervals overlap
 */
function intervalsOverlap(start1, end1, start2, end2) {
  const s1 = timeStrToMinutes(start1);
  const e1 = timeStrToMinutes(end1);
  const s2 = timeStrToMinutes(start2);
  const e2 = timeStrToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

/**
 * Formats a date to given timezone and "YYYY-MM-DD" format
 * @param {Date|string} date - date object or ISO string
 * @param {string} timezone - IANA timezone string like "America/New_York"
 * @returns {string} formatted date string
 */
function formatDateInTimezone(date, timezone) {
  return moment(date).tz(timezone).format('YYYY-MM-DD');
}

/**
 * Generate random string of given length (for tokens)
 * @param {number} length - desired string length
 * @returns {string}
 */
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for(let i=0; i<length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  timeStrToMinutes,
  minutesToTimeStr,
  intervalsOverlap,
  formatDateInTimezone,
  generateRandomString
};
