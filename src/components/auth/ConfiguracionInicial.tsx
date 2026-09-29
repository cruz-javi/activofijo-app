import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Share, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authApi, guardarSesion } from '../../lib/auth-client';
import { ErrorAutenticacion, type ConfiguracionDosFactores } from '../../lib/auth-api';
import { tokens } from '../../theme/tokens';
import { estilosAuth as estilos } from './estilos-auth';

interface ConfiguracionInicialProps {
  desafioToken: string;
  onCompletado: () => void;
  onCancelar: () => void;
}

const LONGITUD_CODIGO = 6;

function agruparClave(secreto: string): string {
  return secreto.replace(/(.{4})/g, '$1 ').trim();
}

export function ConfiguracionInicial({ desafioToken, onCompletado, onCancelar }: ConfiguracionInicialProps) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionDosFactores | null>(null);
  const [cargando, setCargando] = useState(true);
  const [codigo, setCodigo] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codigosRespaldo, setCodigosRespaldo] = useState<string[] | null>(null);
  const [guardados, setGuardados] = useState(false);
  const [avisoAplicacion, setAvisoAplicacion] = useState<string | null>(null);
  const solicitudEnCurso = useRef(false);

  const preparar = useCallback(async () => {
    // Cada solicitud genera un secreto nuevo en el servidor: evitar duplicados.
    if (solicitudEnCurso.current) return;
    solicitudEnCurso.current = true;
    setCargando(true);
    setError(null);

    try {
      setConfiguracion(await authApi.configurarInicial(desafioToken));
    } catch (err) {
      setError(err instanceof ErrorAutenticacion ? err.message : 'No fue posible preparar la verificación');
    } finally {
      solicitudEnCurso.current = false;
      setCargando(false);
    }
  }, [desafioToken]);

  useEffect(() => {
    preparar();
  }, [preparar]);

  // Escanear un QR con el mismo celular no es posible: se abre la aplicación autenticadora con el enlace otpauth.
  const abrirAplicacion = async () => {
    if (!configuracion) return;
    setAvisoAplicacion(null);
    try {
      await Linking.openURL(configuracion.otpauthUri);
    } catch {
      setAvisoAplicacion('No se encontró una aplicación autenticadora. Instale Google Authenticator o Microsoft Authenticator e ingrese la clave manualmente.');
    }
  };

  const activar = async () => {
    setConfirmando(true);
    setError(null);

    try {
      const activacion = await authApi.activarInicial(desafioToken, codigo);
      await guardarSesion(activacion.sesion);
      setCodigosRespaldo(activacion.codigosRespaldo);
    } catch (err) {
      setError(err instanceof ErrorAutenticacion ? err.message : 'No fue posible activar la verificación');
      setCodigo('');
    } finally {
      setConfirmando(false);
    }
  };

  const compartirCodigos = () => {
    if (codigosRespaldo) {
      Share.share({ message: `Códigos de respaldo UAGRM Activo Fijo:\n${codigosRespaldo.join('\n')}` });
    }
  };

  if (codigosRespaldo) {
    return (
      <View>
        <View style={local.aviso}>
          <Text style={local.avisoTexto}>
            Guarde estos códigos de respaldo. Cada uno sirve una sola vez si pierde acceso a su aplicación autenticadora. No volverán a mostrarse.
          </Text>
        </View>

        <View style={local.grilla}>
          {codigosRespaldo.map((item) => (
            <Text key={item} selectable style={local.codigo}>
              {item}
            </Text>
          ))}
        </View>

        <TouchableOpacity style={estilos.botonSecundario} onPress={compartirCodigos}>
          <Text style={estilos.textoBotonSecundario}>Compartir o guardar códigos</Text>
        </TouchableOpacity>

        <View style={local.confirmacion}>
          <Switch value={guardados} onValueChange={setGuardados} />
          <Text style={local.confirmacionTexto}>Ya los guardé en un lugar seguro</Text>
        </View>

        <TouchableOpacity
          style={[estilos.boton, !guardados && estilos.botonDeshabilitado]}
          onPress={onCompletado}
          disabled={!guardados}
        >
          <Text style={estilos.textoBoton}>Continuar al sistema</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <Text style={estilos.texto}>
        Su rol institucional requiere verificación en dos pasos. Use Google Authenticator o Microsoft Authenticator.
      </Text>

      {error && (
        <View style={estilos.errorBox} accessibilityRole="alert">
          <Text style={estilos.errorText}>{error}</Text>
          {!configuracion && (
            <TouchableOpacity onPress={preparar}>
              <Text style={[estilos.errorText, { fontWeight: '700', marginTop: tokens.spacing.xs }]}>Reintentar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={estilos.label}>1. Agregue su cuenta en la aplicación</Text>
      {cargando || !configuracion ? (
        <ActivityIndicator style={{ marginVertical: tokens.spacing.md }} />
      ) : (
        <>
          <TouchableOpacity style={estilos.botonSecundario} onPress={abrirAplicacion}>
            <Text style={estilos.textoBotonSecundario}>Abrir aplicación autenticadora</Text>
          </TouchableOpacity>
          {avisoAplicacion && <Text style={[estilos.texto, { marginTop: tokens.spacing.sm }]}>{avisoAplicacion}</Text>}
          <Text style={[estilos.texto, { marginTop: tokens.spacing.sm }]}>
            O ingrese esta clave manualmente:
          </Text>
          <Text selectable style={local.clave}>
            {agruparClave(configuracion.secreto)}
          </Text>
        </>
      )}

      <Text style={estilos.label}>2. Ingrese el código de 6 dígitos que muestra la aplicación</Text>
      <TextInput
        style={estilos.inputCodigo}
        value={codigo}
        onChangeText={(valor) => setCodigo(valor.replace(/\D/g, '').slice(0, LONGITUD_CODIGO))}
        keyboardType="number-pad"
        autoCorrect={false}
        textContentType="oneTimeCode"
        placeholder="000000"
        maxLength={LONGITUD_CODIGO}
        editable={!!configuracion && !confirmando}
      />

      <TouchableOpacity
        style={[estilos.boton, (!configuracion || confirmando || codigo.length !== LONGITUD_CODIGO) && estilos.botonDeshabilitado]}
        onPress={activar}
        disabled={!configuracion || confirmando || codigo.length !== LONGITUD_CODIGO}
      >
        {confirmando ? <ActivityIndicator color="#ffffff" /> : <Text style={estilos.textoBoton}>Activar verificación</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onCancelar} disabled={confirmando}>
        <Text style={[estilos.enlace, { fontWeight: '400' }]}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const local = StyleSheet.create({
  clave: {
    fontFamily: 'monospace',
    fontSize: 15,
    color: tokens.colors.text,
    backgroundColor: tokens.colors.background,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
    textAlign: 'center',
  },
  aviso: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
  },
  avisoTexto: {
    fontSize: 12,
    lineHeight: 17,
    color: tokens.colors.text,
  },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  codigo: {
    width: '48%',
    fontFamily: 'monospace',
    fontSize: 13,
    textAlign: 'center',
    color: tokens.colors.text,
    backgroundColor: tokens.colors.background,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.borderRadius.sm,
    paddingVertical: tokens.spacing.sm,
  },
  confirmacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.md,
  },
  confirmacionTexto: {
    fontSize: 13,
    color: tokens.colors.text,
    flex: 1,
  },
});
