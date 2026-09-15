import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { setAccessToken, setRefreshToken, getOrCreateDeviceId } from '../../src/lib/secure-store';
import { tokens } from '../../src/theme/tokens';
import Constants from 'expo-constants';

export default function LoginScreen() {
  const [email, setEmail] = useState('admin@uagrm.edu.bo');
  const [password, setPassword] = useState('AdminPass2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const coreUrl = Constants.expoConfig?.extra?.coreApiUrl || 'http://localhost:3000';

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const deviceId = await getOrCreateDeviceId();
      const res = await fetch(`${coreUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al autenticar');
      }

      setAccessToken(data.accessToken);
      await setRefreshToken(data.refreshToken);

      router.replace('/(app)/inventario');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>UAGRM Activo Fijo</Text>
        <Text style={styles.subtitle}>Aplicación Móvil de Campo</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>Correo Institucional</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
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
  errorBox: {
    backgroundColor: tokens.colors.errorBg,
    padding: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.sm,
    marginBottom: tokens.spacing.md,
  },
  errorText: {
    color: tokens.colors.error,
    fontSize: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.sm,
    fontSize: 14,
    marginBottom: tokens.spacing.md,
  },
  button: {
    backgroundColor: tokens.colors.primary,
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    alignItems: 'center',
    marginTop: tokens.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
