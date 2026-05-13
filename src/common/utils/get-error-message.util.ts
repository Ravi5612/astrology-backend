export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error !== 'object' || error === null) return String(error);
  
  try {
    return JSON.stringify(error)
  } catch{
    return String(error)
  }
}

export function getError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(String(error));
}