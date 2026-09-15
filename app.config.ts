import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Activo Fijo UAGRM',
  slug: 'activofijo-app',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'bo.edu.uagrm.activofijo',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'bo.edu.uagrm.activofijo',
  },
  extra: {
    coreApiUrl: process.env.EXPO_PUBLIC_CORE_API_URL || 'http://localhost:3000',
    allowInsecureHttp: process.env.ALLOW_INSECURE_HTTP === 'true',
  },
});
