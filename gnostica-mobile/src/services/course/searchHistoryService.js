import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@gnostica_recent_searches';

export const getRecentSearches = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (jsonValue != null) {
            const parsed = JSON.parse(jsonValue);
            return Array.isArray(parsed) ? parsed : [];
        }
        return [];
    } catch (e) {
        console.error('Error reading recent searches:', e);
        return [];
    }
};

export const addRecentSearch = async (query) => {
    if (!query || typeof query !== 'string' || !query.trim()) return [];
    const trimmed = query.trim();
    try {
        const currentList = await getRecentSearches();
        const filtered = currentList.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
        const updated = [trimmed, ...filtered].slice(0, 5);
        await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('Error adding recent search:', e);
        return [];
    }
};

export const clearRecentSearches = async () => {
    try {
        await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
        return [];
    } catch (e) {
        console.error('Error clearing recent searches:', e);
        return [];
    }
};

export default {
    getRecentSearches,
    addRecentSearch,
    clearRecentSearches,
};
