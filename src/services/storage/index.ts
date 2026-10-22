import { IStorageService, StorageMode, AppStorageData } from './types';
import { LocalStorageService } from './localStorageService';
import { SupabaseStorageService } from './supabaseStorageService';
import { isSupabaseConfigured } from '../supabaseClient';

export * from './types';
export * from './localStorageService';
export * from './supabaseStorageService';

let storageInstance: IStorageService | null = null;

export function getStorageService(): IStorageService {
  if (!storageInstance) {
    if (isSupabaseConfigured()) {
      storageInstance = new SupabaseStorageService();
    } else {
      storageInstance = new LocalStorageService();
    }
  }
  return storageInstance;
}

export function getCurrentStorageMode(): StorageMode {
  return getStorageService().mode;
}
