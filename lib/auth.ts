import { PortalUser } from './supabase';

const AUTH_KEY = 'officepro_user';

export function getUser(): PortalUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setUser(user: PortalUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === 'admin';
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

export function getMegaEmbedUrl(link: string): string {
  if (!link) return '';
  return link.replace('mega.nz/file/', 'mega.nz/embed/');
}
