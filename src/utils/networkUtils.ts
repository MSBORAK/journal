/**
 * Network utility functions for handling network errors
 */

export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorName = error?.name?.toLowerCase() || '';
  
  // Common network error patterns
  const networkErrorPatterns = [
    'network request failed',
    'networkerror',
    'failed to fetch',
    'network error',
    'connection',
    'timeout',
    'econnrefused',
    'enotfound',
    'eai_again',
    'socket',
    'offline',
    'no internet',
  ];
  
  return networkErrorPatterns.some(pattern => 
    errorMessage.includes(pattern) || errorName.includes(pattern)
  );
};

export const getNetworkErrorMessage = (error: any, defaultMessage?: string): string => {
  if (isNetworkError(error)) {
    return 'İnternet bağlantınızı kontrol edin. Offline modda çalışıyorsunuz.';
  }
  
  return defaultMessage || error?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

export const shouldRetryNetworkRequest = (error: any, retryCount: number = 0): boolean => {
  if (retryCount >= 3) return false; // Max 3 retries
  return isNetworkError(error);
};

