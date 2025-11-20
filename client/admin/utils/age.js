// Compute age from a YYYY-MM-DD string. Returns null on invalid or out-of-range age.
const calculateAge = (birthDateStr) => {
  if (!birthDateStr) return null;

  // Parse using components to avoid timezone offsets that can shift the day
  let birthDate;
  if (/^\d{4}-\d{2}-\d{2}$/.test(birthDateStr)) {
    const [yearStr, monthStr, dayStr] = birthDateStr.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
    birthDate = new Date(year, month - 1, day);
  } else {
    // Fallback parsing for other formats
    birthDate = new Date(birthDateStr);
  }

  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age < 0 || age > 125 ? null : age;
};

export { calculateAge };
