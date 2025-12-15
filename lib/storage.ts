"use client";

import { DashboardData } from "./pipeline";
import * as idb from "./storage/indexedDb";

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

// Check IndexedDB availability
const isIndexedDBAvailable = (): boolean => {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
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
      try {
        await idb.putLoad(batch);
      } catch (error) {
        console.warn("IndexedDB save failed, falling back to localStorage", error);
        const state = loadFromLocalStorage() || { batches: {}, carga_ativa_id: null };
        state.batches[batch.carga_id] = batch;
        saveToLocalStorage(state);
      }
    } else {
      const state = loadFromLocalStorage() || { batches: {}, carga_ativa_id: null };
      state.batches[batch.carga_id] = batch;
      saveToLocalStorage(state);
    }
  },

  async loadBatch(carga_id: string): Promise<LoadBatch | null> {
    if (isIndexedDBAvailable()) {
      try {
        return await idb.getLoad(carga_id);
      } catch (error) {
        console.warn("IndexedDB load failed, falling back to localStorage", error);
        const state = loadFromLocalStorage();
        return state?.batches[carga_id] || null;
      }
    } else {
      const state = loadFromLocalStorage();
      return state?.batches[carga_id] || null;
    }
  },

  async loadAllBatches(): Promise<LoadBatch[]> {
    if (isIndexedDBAvailable()) {
      try {
        return await idb.getAllLoads();
      } catch (error) {
        console.warn("IndexedDB loadAll failed, falling back to localStorage", error);
        const state = loadFromLocalStorage();
        return state ? Object.values(state.batches) : [];
      }
    } else {
      const state = loadFromLocalStorage();
      return state ? Object.values(state.batches) : [];
    }
  },

  async setActiveBatch(carga_id: string | null): Promise<void> {
    if (isIndexedDBAvailable()) {
      try {
        await idb.setKV("active_id", carga_id);
      } catch (error) {
        console.warn("IndexedDB setActive failed, falling back to localStorage", error);
        const state = loadFromLocalStorage() || { batches: {}, carga_ativa_id: null };
        state.carga_ativa_id = carga_id;
        saveToLocalStorage(state);
      }
    } else {
      const state = loadFromLocalStorage() || { batches: {}, carga_ativa_id: null };
      state.carga_ativa_id = carga_id;
      saveToLocalStorage(state);
    }
  },

  async getActiveBatchId(): Promise<string | null> {
    if (isIndexedDBAvailable()) {
      try {
        return (await idb.getKV<string>("active_id")) || null;
      } catch (error) {
        console.warn("IndexedDB getActive failed, falling back to localStorage", error);
        const state = loadFromLocalStorage();
        return state?.carga_ativa_id || null;
      }
    } else {
      const state = loadFromLocalStorage();
      return state?.carga_ativa_id || null;
    }
  },

  async deleteBatch(carga_id: string): Promise<void> {
    if (isIndexedDBAvailable()) {
      try {
        await idb.deleteLoad(carga_id);
      } catch (error) {
        console.warn("IndexedDB delete failed, falling back to localStorage", error);
        const state = loadFromLocalStorage();
        if (state) {
          delete state.batches[carga_id];
          saveToLocalStorage(state);
        }
      }
    } else {
      const state = loadFromLocalStorage();
      if (state) {
        delete state.batches[carga_id];
        saveToLocalStorage(state);
      }
    }
  },
};
