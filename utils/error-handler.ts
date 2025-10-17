import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface ApiErrorData {
  message: string | string[];
  statusCode: number;
  error: string;
}

function isAxiosErrorWithResponse(error: unknown): error is AxiosError<ApiErrorData> {
  return (
    !!error &&
    typeof error === 'object' &&
    'response' in error &&
    !!(error as AxiosError<ApiErrorData>).response?.data
  );
}

export const handleApiError = (
  err: unknown,
  baseMessage: string,
  toastId?: string
): string => {
  let detailedMessage = baseMessage;
  let consoleOutput = err;
  
  if (isAxiosErrorWithResponse(err)) {
    const data = err.response!.data;
    
    const apiMessage = Array.isArray(data.message) 
      ? data.message.join('; ') 
      : data.message;
        
    detailedMessage = `${baseMessage} Detalle: ${apiMessage || 'Error desconocido del servidor.'}`;
    consoleOutput = data;
  } 
  else if (err instanceof Error) {
    detailedMessage = `${baseMessage}\n\nDetalle técnico: ${err.message}`;
    consoleOutput = err;
  }
  
  toast.error(detailedMessage, { id: toastId, duration: 5000 });
  console.error(consoleOutput);
  
  return detailedMessage;
};