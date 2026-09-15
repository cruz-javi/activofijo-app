import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  const db = await SQLite.openDatabaseAsync('activofijo.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS activo_local (
      id TEXT PRIMARY KEY NOT NULL,
      codigo TEXT NOT NULL UNIQUE,
      descripcion TEXT NOT NULL,
      grupo_contable TEXT NOT NULL,
      ubicacion TEXT NOT NULL,
      estado TEXT NOT NULL,
      valor REAL NOT NULL,
      version INTEGER NOT NULL,
      synced_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      processed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sync_cursor (
      key TEXT PRIMARY KEY NOT NULL,
      last_global_position INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  dbInstance = db;
  return db;
}
