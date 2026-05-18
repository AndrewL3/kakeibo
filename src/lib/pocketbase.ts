import PocketBase from 'pocketbase';

const fallbackPocketBaseUrl = 'http://localhost:8090';

export const pocketBaseUrl = process.env.EXPO_PUBLIC_POCKETBASE_URL ?? fallbackPocketBaseUrl;

export const pocketBase = new PocketBase(pocketBaseUrl);

export async function clearPocketBaseAuth(): Promise<void> {
  try {
    pocketBase.authStore.clear();
  } catch (error) {
    console.warn('Failed to clear PocketBase auth store', error);
  }
}
