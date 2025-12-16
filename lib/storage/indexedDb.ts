// /lib/storage/indexedDb.ts
export const DB_NAME = "calceleve_dashboard";
export const DB_VERSION = 2; // <-- incrementa sempre que mudar stores/indexes

export const STORES = {
  loads: "loads",           // cargas (snapshots)
  kv: "kv",                 // chave/valor (ex.: carga_ativa_id)
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      // Cria stores se não existirem
      if (!db.objectStoreNames.contains(STORES.loads)) {
        const loads = db.createObjectStore(STORES.loads, { keyPath: "carga_id" });
        loads.createIndex("by_date", "data_carga", { unique: false });
        loads.createIndex("by_type", "tipo_carga", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.kv)) {
        db.createObjectStore(STORES.kv, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | void> {
  const db = await openDb();

  // Defesa extra: se alguém esquecer de subir version/schema
  if (!db.objectStoreNames.contains(storeName)) {
    db.close();
    throw new Error(
      `IndexedDB schema inválido: objectStore "${storeName}" não existe. ` +
      `Verifique DB_VERSION e onupgradeneeded.`
    );
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    let request: IDBRequest<T> | undefined;
    const result = fn(store);
    if (result && "onsuccess" in result) request = result as IDBRequest<T>;

    tx.oncomplete = () => {
      db.close();
      resolve(request?.result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** API pública (exemplos) */
export async function putLoad<T extends { carga_id: string }>(load: T) {
  return withStore(STORES.loads, "readwrite", (store) => store.put(load));
}

export async function getLoad<T = unknown>(carga_id: string): Promise<T | null> {
  return withStore<T>(STORES.loads, "readonly", (store) => store.get(carga_id)).then((r) => (r ?? null));
}

export async function getAllLoads<T = unknown>(): Promise<T[]> {
  const result = await withStore<T[]>(STORES.loads, "readonly", (store) => store.getAll());
  return result || [];
}

export async function deleteLoad(carga_id: string) {
  return withStore(STORES.loads, "readwrite", (store) => store.delete(carga_id));
}

export async function setKV(key: string, value: unknown) {
  return withStore(STORES.kv, "readwrite", (store) => store.put({ key, value }));
}

export async function getKV<T = unknown>(key: string) {
  return withStore<{ key: string; value: T }>(STORES.kv, "readonly", (store) => store.get(key))
    .then((row) => row?.value as T | undefined);
}
