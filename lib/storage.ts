"use client";

import { DashboardData } from "./pipeline";

export interface LoadBatch {
  carga_id: string; // UUID
  data_carga: string; // ISO string
  tipo_carga: "aprovadas";
  arquivo_nome: string;
  dados_normalizados: DashboardData;
}

export interface StorageState {
  batches: Record<string, LoadBatch>;
  carga_ativa_id: string | null;
}

const STORAGE_KEY = "calceleve_dashboard_storage";
const DB_NAME = "CalceleveDashboard";
const STORE_NAME = "batches";

let dbInstance: IDBDatabase | null = null;

// Open IndexedDB
const openDB = async (): Promise<IDBDatabase> => {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "carga_id" });
      }
    };
  });
};

// Check IndexedDB availability
const isIndexedDBAvailable = (): boolean => {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
};

// Save to IndexedDB
const saveToIndexedDB = async (batch: LoadBatch): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(batch);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Load from IndexedDB
const loadFromIndexedDB = async (carga_id: string): Promise<LoadBatch | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(carga_id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

// Load all batches from IndexedDB
const loadAllFromIndexedDB = async (): Promise<LoadBatch[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

// Delete from IndexedDB
const deleteFromIndexedDB = async (carga_id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(carga_id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Fallback: localStorage
const saveToLocalStorage = (state: StorageState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn("localStorage unavailable");
  }
};

const loadFromLocalStorage = (): StorageState | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Public API
export const storage = {
  async saveBatch(batch: LoadBatch): Promise<void> {
    if (isIndexedDBAvailable()) {
      await saveToIndexedDB(batch);
    } else {
      const state = loadFromLocalStorage() || { batches: {}, carga_ativa_id: null };
      state.batches[batch.carga_id] = batch;
      saveToLocalStorage(state);
    }
  },

  async loadBatch(carga_id: string): Promise<LoadBatch | null> {
    if (isIndexedDBAvailable()) {
      return loadFromIndexedDB(carga_id);
    } else {
      const state = loadFromLocalStorage();
      return state?.batches[carga_id] || null;
    }
  },

  async loadAllBatches(): Promise<LoadBatch[]> {
    if (isIndexedDBAvailable()) {
      return loadAllFromIndexedDB();
    } else {
      const state = loadFromLocalStorage();
      return state ? Object.values(state.batches) : [];
    }
  },

  async setActiveBatch(carga_id: string | null): Promise<void> {
    if (isIndexedDBAvailable()) {
      // In IndexedDB, store active ID separately or in a metadata store
      const db = await openDB();
      const metaStore = db
        .transaction(["metadata"], "readwrite")
        .objectStore("metadata");
      await new Promise<void>((resolve, reject) => {
        const request = metaStore.put({ key: "active_id", value: carga_id });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } else {
      const state = loadFromLocalStorage() || { batches: {}, carga_ativa_id: null };
      state.carga_ativa_id = carga_id;
      saveToLocalStorage(state);
    }
  },

  async getActiveBatchId(): Promise<string | null> {
    if (isIndexedDBAvailable()) {
      try {
        const db = await openDB();
        const metaStore = db.transaction(["metadata"], "readonly").objectStore("metadata");
        return new Promise((resolve) => {
          const request = metaStore.get("active_id");
          request.onsuccess = () => resolve(request.result?.value || null);
          request.onerror = () => resolve(null);
        });
      } catch {
        return null;
      }
    } else {
      const state = loadFromLocalStorage();
      return state?.carga_ativa_id || null;
    }
  },

  async deleteBatch(carga_id: string): Promise<void> {
    if (isIndexedDBAvailable()) {
      await deleteFromIndexedDB(carga_id);
    } else {
      const state = loadFromLocalStorage();
      if (state) {
        delete state.batches[carga_id];
        saveToLocalStorage(state);
      }
    }
  },
};
