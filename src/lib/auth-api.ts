export interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
  permisos: string[];
}

export interface SesionCore {
  accessToken: string;
  refreshToken: string;
  user: UsuarioSesion;
}

export type RespuestaLogin =
  | SesionCore
  | { requiere2fa: true; desafioToken: string }
  | { requiereConfiguracion2fa: true; desafioToken: string };

export interface ConfiguracionDosFactores {
  secreto: string;
  otpauthUri: string;
}

export interface ActivacionInicial {
  codigosRespaldo: string[];
  sesion: SesionCore;
}

export class ErrorAutenticacion extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ErrorAutenticacion';
  }
}

export function esDesafio(
  respuesta: RespuestaLogin,
): respuesta is Extract<RespuestaLogin, { desafioToken: string }> {
  return 'desafioToken' in respuesta;
}

async function publicar<T>(baseUrl: string, ruta: string, cuerpo: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });

  const texto = await res.text();
  const data = texto ? JSON.parse(texto) : {};
  if (!res.ok) {
    throw new ErrorAutenticacion(data.message || 'No fue posible completar la operación', res.status);
  }
  return data as T;
}

export function crearClienteAuth(baseUrl: string) {
  return {
    iniciarSesion: (identificador: string, password: string, deviceId: string) =>
      publicar<RespuestaLogin>(baseUrl, '/auth/login', { identificador, password, deviceId }),

    verificarCodigo: (desafioToken: string, codigo: string) =>
      publicar<SesionCore>(baseUrl, '/auth/2fa/verificar', { desafioToken, codigo }),

    configurarInicial: (desafioToken: string) =>
      publicar<ConfiguracionDosFactores>(baseUrl, '/auth/2fa/inicial/configurar', { desafioToken }),

    activarInicial: (desafioToken: string, codigo: string) =>
      publicar<ActivacionInicial>(baseUrl, '/auth/2fa/inicial/activar', { desafioToken, codigo }),
  };
}
