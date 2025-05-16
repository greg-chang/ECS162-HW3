export interface FormattedDate {
  currentDate: string;
  dayName: string;
  monthName: string;
  dayOfMonth: string;
  year: string;
}

export function getFormattedDate(): FormattedDate {
  const date = new Date();
  
  // Get day name 
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()]; 
  
  // Get month name
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = months[date.getMonth()];
  
  // Get date and year
  const dayOfMonth = date.getDate().toString();
  const year = date.getFullYear().toString();
  
  const currentDate = `${dayName}, ${monthName} ${dayOfMonth}, ${year}`;

  return {
    currentDate,
    dayName,
    monthName,
    dayOfMonth,
    year
  };
} 