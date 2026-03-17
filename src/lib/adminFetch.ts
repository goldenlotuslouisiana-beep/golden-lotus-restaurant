/**
 * Authenticated fetch wrapper for admin API calls.
 * Reads the admin JWT from localStorage (key: admin_jwt),
 * injects the Authorization header, and redirects to /admin/login on 401.
 */
export const adminFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('admin_jwt');

  if (!token) {
    window.location.href = '/admin/login';
    throw new Error('No admin token found');
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      // Allow callers to override / extend headers
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('admin_jwt');
    window.location.href = '/admin/login';
    throw new Error('Session expired. Please log in again.');
  }

  return res;
};
