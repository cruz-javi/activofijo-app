import Constants from 'expo-constants';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, getOrCreateDeviceId } from './secure-store';

const CORE_URL = Constants.expoConfig?.extra?.coreApiUrl || 'http://localhost:3000';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${CORE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    const refreshToken = await getRefreshToken();
    const deviceId = await getOrCreateDeviceId();

    if (refreshToken) {
      const refreshRes = await fetch(`${CORE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken, deviceId }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setAccessToken(data.accessToken);
        await setRefreshToken(data.refreshToken);

        headers['Authorization'] = `Bearer ${data.accessToken}`;
        res = await fetch(`${CORE_URL}${endpoint}`, {
          ...options,
          headers,
        });
      }
    }
  }

  return res;
}
