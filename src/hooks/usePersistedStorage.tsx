import { useState, useEffect } from "react";
import { LazyStore } from '@tauri-apps/plugin-store';

const store = new LazyStore('settings.json');

export function usePersistedStorage<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>(defaultValue);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        console.log(`[usePersistedStorage] Loading key: ${key}`);
        store.get(key).then((storedValue) => {
            console.log(`[usePersistedStorage] Loaded ${key}:`, storedValue);
            if (storedValue !== undefined && storedValue !== null) {
                setValue(storedValue as T);
            }
            setIsLoaded(true);
        });
    }, [key]);

    useEffect(() => {
        if (!isLoaded) return;

        async function saveValue() {
            const currentValue = await store.get(key);
            console.log(`[usePersistedStorage] Saving ${key}:`, value, `(current: ${currentValue})`);
            if (currentValue !== value) {
                await store.set(key, value);
                console.log(`[usePersistedStorage] Saved ${key}:`, value);
            }
        }

        saveValue();
    }, [value, key, isLoaded]);

    return [value, setValue, isLoaded] as const;
}
