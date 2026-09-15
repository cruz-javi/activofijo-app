import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0f172a',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="(auth)/login" options={{ title: 'Iniciar Sesión', headerShown: false }} />
      <Stack.Screen name="(app)/inventario/index" options={{ title: 'Inventario de Campo' }} />
    </Stack>
  );
}
