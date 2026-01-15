'use client';

export const AUTH_TOKEN_KEY = 'authToken';
export const AUTH_USER_KEY = 'authUser';
export const ADMIN_EMAIL = 'admin@example.com';
export const STORE_EMAIL = 'test@example.com';

interface StoredUserPayload {
  email?: string;
  tokenType?: string;
}

export interface StoredAuth {
  token: string;
  email: string;
  tokenType: string;
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userRaw = localStorage.getItem(AUTH_USER_KEY);

  if (!token || !userRaw) {
    return null;
  }

  try {
    const parsed = JSON.parse(userRaw) as StoredUserPayload;
    if (!parsed?.email) {
      return null;
    }
    return {
      token,
      email: parsed.email,
      tokenType: parsed.tokenType ?? 'Bearer',
    };
  } catch (error) {
    console.warn('Failed to parse auth user payload', error);
    return null;
  }
}

export function clearStoredAuth(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function isAdminEmail(email: string): boolean {
  return email === ADMIN_EMAIL;
}

export function isStoreEmail(email: string): boolean {
  return email === STORE_EMAIL;
}

export function getLandingPath(email: string): string {
  return isAdminEmail(email) ? '/admin/products' : '/orders';
}
