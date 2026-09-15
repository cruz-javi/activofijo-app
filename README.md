# activofijo-app — Aplicación Móvil de Campo (UAGRM)

Aplicación móvil offline-first para relevamiento, inventario y auditoría de activos fijos en facultades y predios de la UAGRM.

## Arquitectura

- **Framework**: Expo 57 (React Native 0.86, React 19).
- **Navegación**: `expo-router`.
- **Persistencia Local**: `expo-sqlite` (almacenamiento local con cursor de sincronización `global_position`).
- **Seguridad**: Refresh token almacenado en Keychain/Keystore mediante `expo-secure-store`, access token únicamente en memoria volátil.
- **Contratos**: Cliente tipado generado con `openapi-typescript` y `openapi-fetch`.

## Requisitos previos

- Node.js >= 22.12
- pnpm >= 10.x
- Expo Go en dispositivo móvil o emulador Android/iOS configurado.

## Arranque rápido

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```

3. Iniciar servidor Metro:
   ```bash
   pnpm start
   ```
