import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authApi, guardarSesion } from '../../lib/auth-client';
import { ErrorAutenticacion } from '../../lib/auth-api';
import { estilosAuth as estilos } from './estilos-auth';

interface VerificacionCodigoProps {
  desafioToken: string;
  onVerificado: () => void;
  onVolver: () => void;
}

type ModoCodigo = 'app' | 'respaldo';

const LONGITUD_APP = 6;
const LONGITUD_RESPALDO = 14;

function normalizar(valor: string, modo: ModoCodigo): string {
  return modo === 'app'
    ? valor.replace(/\D/g, '').slice(0, LONGITUD_APP)
    : valor.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, LONGITUD_RESPALDO);
}

function estaCompleto(valor: string, modo: ModoCodigo): boolean {
  return modo === 'app' ? valor.length === LONGITUD_APP : valor.replace(/-/g, '').length === 12;
}

export function VerificacionCodigo({ desafioToken, onVerificado, onVolver }: VerificacionCodigoProps) {
  const [codigo, setCodigo] = useState('');
  const [modo, setModo] = useState<ModoCodigo>('app');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cambiarModo = () => {
    setModo((actual) => (actual === 'app' ? 'respaldo' : 'app'));
    setCodigo('');
    setError(null);
  };

  const verificar = async () => {
    setLoading(true);
    setError(null);

    try {
      const sesion = await authApi.verificarCodigo(desafioToken, codigo);
      await guardarSesion(sesion);
      onVerificado();
    } catch (err) {
      setError(err instanceof ErrorAutenticacion ? err.message : 'No fue posible verificar el código');
      setCodigo('');
    } finally {
      setLoading(false);
    }
  };

  const desafioExpirado = error?.includes('expiró') ?? false;

  return (
    <View>
      <Text style={estilos.texto}>
        {modo === 'app'
          ? 'Ingrese el código de 6 dígitos que muestra su aplicación autenticadora.'
          : 'Ingrese uno de los códigos de respaldo que guardó al activar la verificación.'}
      </Text>

      {error && (
        <View style={estilos.errorBox} accessibilityRole="alert">
          <Text style={estilos.errorText}>{error}</Text>
        </View>
      )}

      <Text style={estilos.label}>{modo === 'app' ? 'Código de verificación' : 'Código de respaldo'}</Text>
      <TextInput
        style={estilos.inputCodigo}
        value={codigo}
        onChangeText={(valor) => setCodigo(normalizar(valor, modo))}
        keyboardType={modo === 'app' ? 'number-pad' : 'default'}
        autoCapitalize="characters"
        autoCorrect={false}
        textContentType="oneTimeCode"
        placeholder={modo === 'app' ? '000000' : 'XXXX-XXXX-XXXX'}
        editable={!loading && !desafioExpirado}
        maxLength={modo === 'app' ? LONGITUD_APP : LONGITUD_RESPALDO}
        autoFocus
      />

      <TouchableOpacity
        style={[estilos.boton, (loading || desafioExpirado || !estaCompleto(codigo, modo)) && estilos.botonDeshabilitado]}
        onPress={verificar}
        disabled={loading || desafioExpirado || !estaCompleto(codigo, modo)}
      >
        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={estilos.textoBoton}>Verificar e ingresar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={cambiarModo} disabled={loading}>
        <Text style={estilos.enlace}>{modo === 'app' ? 'Usar un código de respaldo' : 'Usar mi aplicación autenticadora'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onVolver} disabled={loading}>
        <Text style={[estilos.enlace, { fontWeight: '400' }]}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
