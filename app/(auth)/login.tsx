import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getOrCreateDeviceId } from '../../src/lib/secure-store';
import { authApi, guardarSesion } from '../../src/lib/auth-client';
import { ErrorAutenticacion, esDesafio } from '../../src/lib/auth-api';
import { VerificacionCodigo } from '../../src/components/auth/VerificacionCodigo';
import { ConfiguracionInicial } from '../../src/components/auth/ConfiguracionInicial';
import { estilosAuth as estilos } from '../../src/components/auth/estilos-auth';
import { tokens } from '../../src/theme/tokens';

type PasoLogin =
  | { tipo: 'credenciales' }
  | { tipo: 'verificacion'; desafioToken: string }
  | { tipo: 'configuracion'; desafioToken: string };

const SUBTITULOS: Record<PasoLogin['tipo'], string> = {
  credenciales: 'Aplicación Móvil de Campo',
  verificacion: 'Verificación en dos pasos',
  configuracion: 'Active la verificación en dos pasos',
};

export default function LoginScreen() {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [paso, setPaso] = useState<PasoLogin>({ tipo: 'credenciales' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const ingresar = () => router.replace('/(app)/inventario');

  const volverACredenciales = () => {
    setPassword('');
    setError(null);
    setPaso({ tipo: 'credenciales' });
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const deviceId = await getOrCreateDeviceId();
      const respuesta = await authApi.iniciarSesion(identificador.trim(), password, deviceId);

      if (!esDesafio(respuesta)) {
        await guardarSesion(respuesta);
        ingresar();
        return;
      }

      setPaso(
        'requiere2fa' in respuesta
          ? { tipo: 'verificacion', desafioToken: respuesta.desafioToken }
          : { tipo: 'configuracion', desafioToken: respuesta.desafioToken },
      );
    } catch (err) {
      setError(err instanceof ErrorAutenticacion ? err.message : 'Error al autenticar');
    } finally {
      setLoading(false);
    }
  };

  const puedeEnviar = identificador.trim().length > 0 && password.length > 0 && !loading;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>UAGRM Activo Fijo</Text>
          <Text style={styles.subtitle}>{SUBTITULOS[paso.tipo]}</Text>

          {paso.tipo === 'verificacion' && (
            <VerificacionCodigo desafioToken={paso.desafioToken} onVerificado={ingresar} onVolver={volverACredenciales} />
          )}

          {paso.tipo === 'configuracion' && (
            <ConfiguracionInicial desafioToken={paso.desafioToken} onCompletado={ingresar} onCancelar={volverACredenciales} />
          )}

          {paso.tipo === 'credenciales' && (
            <>
              {error && (
                <View style={estilos.errorBox} accessibilityRole="alert">
                  <Text style={estilos.errorText}>{error}</Text>
                </View>
              )}

              <Text style={estilos.label}>Correo institucional o código de funcionario</Text>
              <TextInput
                style={estilos.input}
                value={identificador}
                onChangeText={setIdentificador}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="username"
                placeholder="funcionario@uagrm.edu.bo"
              />

              <Text style={estilos.label}>Contraseña</Text>
              <TextInput
                style={estilos.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="password"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                style={[estilos.boton, !puedeEnviar && estilos.botonDeshabilitado]}
                onPress={handleLogin}
                disabled={!puedeEnviar}
              >
                {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={estilos.textoBoton}>Iniciar Sesión</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: tokens.spacing.lg,
  },
  card: {
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing.xl,
    borderRadius: tokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: tokens.colors.textMuted,
    marginBottom: tokens.spacing.lg,
  },
});
