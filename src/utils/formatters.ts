/**
 * Utility functions for formatting data
 */

/**
 * Format a number as GBP currency
 * @param value Number to format
 * @param minimumFractionDigits Minimum number of decimal places (default: 2)
 * @param maximumFractionDigits Maximum number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | string, minimumFractionDigits = 2, maximumFractionDigits = 2): string {
  // Convert string to number if needed
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle NaN
  if (isNaN(numValue)) return '£0.00';
  
  return `£${numValue.toLocaleString('en-GB', {
    minimumFractionDigits,
    maximumFractionDigits
  })}`;
}

/**
 * Format a date string to UK format (DD/MM/YYYY)
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-GB');
}

/**
 * Format a percentage value
 * @param value Number to format as percentage
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a file size in bytes to human-readable format
 * @param bytes Size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format a duration in seconds to human-readable format
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
}

/**
 * Format a number with thousand separators
 * @param value Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-GB');
}