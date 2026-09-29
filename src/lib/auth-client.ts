import Constants from 'expo-constants';
import { crearClienteAuth, type SesionCore } from './auth-api';
import { setAccessToken, setRefreshToken } from './secure-store';

const CORE_URL = Constants.expoConfig?.extra?.coreApiUrl || 'http://localhost:3000';

export const authApi = crearClienteAuth(CORE_URL);

export async function guardarSesion(sesion: SesionCore): Promise<void> {
  setAccessToken(sesion.accessToken);
  await setRefreshToken(sesion.refreshToken);
}
