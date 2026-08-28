import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Client, Invoice } from './types';

// Versioned keys so a future schema change can migrate rather than wipe.
export const STORAGE_KEYS = {
  invoices: 'davista_invoices_v1',
  clients: 'davista_clients_v1',
  terms: 'davista_terms_v1',
  addr: 'davista_addr_v1',
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort persistence; nothing actionable on failure
  }
}

export const loadInvoices = () => readJson<Invoice[]>(STORAGE_KEYS.invoices, []);
export const saveInvoices = (v: Invoice[]) => writeJson(STORAGE_KEYS.invoices, v);

export const loadClients = () => readJson<Client[]>(STORAGE_KEYS.clients, []);
export const saveClients = (v: Client[]) => writeJson(STORAGE_KEYS.clients, v);

export const loadDefaultTerms = () => readJson<string | null>(STORAGE_KEYS.terms, null);
export const saveDefaultTerms = (v: string) => writeJson(STORAGE_KEYS.terms, v);

export const loadDefaultAddr = () => readJson<string | null>(STORAGE_KEYS.addr, null);
export const saveDefaultAddr = (v: string) => writeJson(STORAGE_KEYS.addr, v);
