import { StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';

export const estilosAuth = StyleSheet.create({
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
  inputCodigo: {
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.md,
    fontSize: 22,
    letterSpacing: 6,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    marginBottom: tokens.spacing.md,
  },
  texto: {
    fontSize: 13,
    color: tokens.colors.textMuted,
    lineHeight: 19,
    marginBottom: tokens.spacing.md,
  },
  boton: {
    backgroundColor: tokens.colors.primary,
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    alignItems: 'center',
    marginTop: tokens.spacing.sm,
  },
  botonSecundario: {
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginTop: tokens.spacing.sm,
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  textoBoton: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  textoBotonSecundario: {
    color: tokens.colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  enlace: {
    color: tokens.colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: tokens.spacing.sm,
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
    lineHeight: 17,
  },
});
