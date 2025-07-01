import type { TranslationCache } from '../types';

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

/**
 * Translates text using MyMemory API with caching.
 * Falls back to original text on API failure to ensure app remains functional.
 *
 * @param text - Source text to translate
 * @param fromLang - ISO 639-1 language code (default: 'en')
 * @param toLang - Target language ISO 639-1 code
 * @returns Translated text or original text if translation fails
 */
export async function translateText(
	text: string,
	fromLang: string = 'en',
	toLang: string
): Promise<string> {
	// Normalize text for consistent caching
	const normalizedText = text.trim().toLowerCase();
	const cacheKey = `${fromLang}-${toLang}-${normalizedText}`;

	// Check cache
	const cached = getCachedTranslation(cacheKey);
	if (cached) {
		return cached;
	}

	try {
		// Call MyMemory API
		const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
			text
		)}&langpair=${fromLang}|${toLang}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`API response not ok: ${response.status}`);
		}

		const data = await response.json();
		const translatedText = data.responseData?.translatedText || text;

		// Update cache
		setCachedTranslation(cacheKey, translatedText);

		return translatedText;
	} catch (error) {
		console.error('Translation failed:', error);
		return text; // Fallback to original text
	}
}

/**
 * Gets cached translation if it exists and is not expired
 */
function getCachedTranslation(cacheKey: string): string | null {
	if (!isBrowser) return null;
	try {
		const cacheData = localStorage.getItem('translationCache');
		if (!cacheData) return null;

		const cache: TranslationCache = JSON.parse(cacheData);
		const entry = cache[cacheKey];

		if (!entry) return null;

		// Check if cache entry is expired
		if (Date.now() - entry.timestamp > CACHE_DURATION) {
			return null;
		}

		return entry.translation;
	} catch (error) {
		console.error('Failed to read translation cache:', error);
		return null;
	}
}

/**
 * Stores translation in cache
 */
function setCachedTranslation(cacheKey: string, translation: string): void {
	if (!isBrowser) return;
	try {
		const cacheData = localStorage.getItem('translationCache');
		const cache: TranslationCache = cacheData ? JSON.parse(cacheData) : {};

		cache[cacheKey] = {
			translation,
			timestamp: Date.now()
		};

		localStorage.setItem('translationCache', JSON.stringify(cache));
	} catch (error) {
		console.error('Failed to update translation cache:', error);
	}
}

/**
 * Clears the translation cache
 */
export function clearTranslationCache(): void {
	if (!isBrowser) return;
	try {
		localStorage.removeItem('translationCache');
	} catch (error) {
		console.error('Failed to clear translation cache:', error);
	}
}
