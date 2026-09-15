import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../../src/lib/api';
import { getDatabase } from '../../../src/db/sqlite';
import { clearRefreshToken, setAccessToken } from '../../../src/lib/secure-store';
import { tokens } from '../../../src/theme/tokens';

interface ActivoLocal {
  id: string;
  codigo: string;
  descripcion: string;
  grupo_contable: string;
  ubicacion: string;
  estado: string;
  valor: number;
  version: number;
}

export default function InventarioScreen() {
  const [items, setItems] = useState<ActivoLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'network' | 'sqlite'>('network');
  const router = useRouter();

  const loadData = async () => {
    setLoading(true);
    const db = await getDatabase();

    try {
      const res = await apiFetch('/activos?limit=50');
      if (res.ok) {
        const body = await res.json();
        const networkItems = body.data || [];

        // Update SQLite cache
        for (const item of networkItems) {
          await db.runAsync(
            `INSERT OR REPLACE INTO activo_local 
             (id, codigo, descripcion, grupo_contable, ubicacion, estado, valor, version, synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              item.id,
              item.codigo,
              item.descripcion,
              item.grupoContable,
              item.ubicacion,
              item.estado,
              item.valor,
              item.version,
              new Date().toISOString(),
            ]
          );
        }
        setSource('network');
      }
    } catch {
      // Offline fallback
      setSource('sqlite');
    }

    // Load from local SQLite cache
    const rows = await db.getAllAsync<ActivoLocal>('SELECT * FROM activo_local ORDER BY codigo ASC;');
    setItems(rows);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await clearRefreshToken();
    setAccessToken(null);
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>
            {items.length} activos ({source === 'network' ? 'Sincronizado' : 'Modo Offline'})
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={tokens.colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: tokens.spacing.md }}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemCode}>{item.codigo}</Text>
                <Text style={styles.itemStatus}>{item.estado}</Text>
              </View>
              <Text style={styles.itemDesc}>{item.descripcion}</Text>
              <Text style={styles.itemMeta}>{item.ubicacion} • {item.grupo_contable}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  subtitle: {
    fontSize: 13,
    color: tokens.colors.textMuted,
  },
  logoutButton: {
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
  },
  logoutText: {
    fontSize: 12,
    color: tokens.colors.error,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: tokens.spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.xs,
  },
  itemCode: {
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 12,
    color: tokens.colors.primary,
  },
  itemStatus: {
    fontSize: 11,
    color: tokens.colors.textMuted,
  },
  itemDesc: {
    fontSize: 14,
    color: tokens.colors.text,
    fontWeight: '500',
    marginBottom: tokens.spacing.xs,
  },
  itemMeta: {
    fontSize: 12,
    color: tokens.colors.textMuted,
  },
});
