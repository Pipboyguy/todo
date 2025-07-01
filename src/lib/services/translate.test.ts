import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { translateText, clearTranslationCache } from './translate';
import type { TranslationCache } from '../types';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};

// @ts-ignore
global.localStorage = localStorageMock;

describe('Translation Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset localStorage mock responses
		localStorageMock.getItem.mockReturnValue(null);
		// Reset setItem to default behavior
		localStorageMock.setItem.mockImplementation(() => {});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('translateText', () => {
		it('should translate text successfully', async () => {
			const mockResponse = {
				responseData: {
					translatedText: 'Hola mundo'
				},
				matches: []
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			});

			const result = await translateText('Hello world', 'en', 'es');
			expect(result).toBe('Hola mundo');

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('api.mymemory.translated.net'),
				expect.any(Object)
			);
		});

		it('should use cache for repeated translations', async () => {
			const cacheKey = 'en-es-hello world';
			const cachedTranslation = {
				translation: 'Hola mundo',
				timestamp: Date.now()
			};

			const cache: TranslationCache = {
				[cacheKey]: cachedTranslation
			};

			localStorageMock.getItem.mockImplementation((key: string) => {
				if (key === 'translationCache') return JSON.stringify(cache);
				return null;
			});

			const result = await translateText('hello world', 'en', 'es');
			expect(result).toBe('Hola mundo');
			expect(global.fetch).not.toHaveBeenCalled();
		});

		it('should handle API errors gracefully', async () => {
			(global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

			const result = await translateText('Hello world', 'en', 'es');
			expect(result).toBe('Hello world');
		});

		it('should handle non-ok responses', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 500
			});

			const result = await translateText('Hello world', 'en', 'es');
			expect(result).toBe('Hello world');
		});

		it('should normalize text for cache key', async () => {
			const mockResponse = {
				responseData: {
					translatedText: 'Hola mundo'
				}
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			});

			await translateText('  Hello WORLD  ', 'en', 'es');

			// Check that the cache key is normalized
			const calls = localStorageMock.setItem.mock.calls;
			const cacheCall = calls.find(call => call[0] === 'translationCache');
			expect(cacheCall).toBeTruthy();
			const cache = JSON.parse(cacheCall[1]);
			expect(Object.keys(cache)[0]).toBe('en-es-hello world');
		});

		it('should handle localStorage errors gracefully', async () => {
			localStorageMock.setItem.mockImplementation(() => {
				throw new Error('QuotaExceededError');
			});

			const mockResponse = {
				responseData: {
					translatedText: 'Hola mundo'
				}
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			});

			const result = await translateText('Hello world', 'en', 'es');
			expect(result).toBe('Hola mundo');
		});
	});

	describe('clearTranslationCache', () => {
		it('should clear the translation cache', () => {
			clearTranslationCache();

			expect(localStorageMock.removeItem).toHaveBeenCalledWith('translationCache');
		});
	});

	describe('cache expiration', () => {
		it('should not use expired cache entries', async () => {
			const cacheKey = 'en-es-hello world';
			const expiredTranslation = {
				translation: 'Old translation',
				timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000) // 8 days old
			};

			const cache: TranslationCache = {
				[cacheKey]: expiredTranslation
			};

			localStorageMock.getItem.mockImplementation((key: string) => {
				if (key === 'translationCache') return JSON.stringify(cache);
				return null;
			});

			const mockResponse = {
				responseData: {
					translatedText: 'Hola mundo'
				}
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			});

			const result = await translateText('hello world', 'en', 'es');
			expect(result).toBe('Hola mundo');
			expect(global.fetch).toHaveBeenCalled();
		});
	});
});

