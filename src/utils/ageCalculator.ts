/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date string in ISO format (YYYY-MM-DD) or Date object
 * @returns Age in years, or null if dateOfBirth is invalid
 */
export const calculateAge = (dateOfBirth: string | Date | null | undefined): number | null => {
  if (!dateOfBirth) return null;
  
  let birthDate: Date;
  
  if (typeof dateOfBirth === 'string') {
    birthDate = new Date(dateOfBirth);
  } else {
    birthDate = dateOfBirth;
  }
  
  if (isNaN(birthDate.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calculate age from individual date components
 * @param day - Day of month (1-31)
 * @param month - Month (1-12)
 * @param year - Full year (e.g., 1990)
 * @returns Age in years, or null if any component is invalid
 */
export const calculateAgeFromComponents = (day: string | number, month: string | number, year: string | number): number | null => {
  if (!day || !month || !year) return null;
  
  const birthDate = new Date(
    parseInt(year.toString()), 
    parseInt(month.toString()) - 1, 
    parseInt(day.toString())
  );
  
  if (isNaN(birthDate.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};