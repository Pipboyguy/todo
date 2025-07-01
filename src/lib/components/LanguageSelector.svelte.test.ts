import { page } from '@vitest/browser/context';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LanguageSelector from './LanguageSelector.svelte';
import { SUPPORTED_LANGUAGES } from '../types';

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};

// @ts-ignore
globalThis.localStorage = localStorageMock;

describe('LanguageSelector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorageMock.getItem.mockReturnValue(null);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should render label and select element', async () => {
		render(LanguageSelector, { props: { selectedLanguage: 'en' } });
		
		const label = page.getByText('Translate to:');
		const select = page.getByLabel('Select language for translation');
		
		await expect.element(label).toBeInTheDocument();
		await expect.element(select).toBeInTheDocument();
	});

	it('should render all supported languages as options', async () => {
		render(LanguageSelector, { props: { selectedLanguage: 'en' } });
		
		const select = page.getByLabel('Select language for translation');
		
		// Check that all languages are present
		for (const [code, name] of Object.entries(SUPPORTED_LANGUAGES)) {
			const option = page.getByRole('option', { name });
			await expect.element(option).toBeInTheDocument();
			await expect.element(option).toHaveAttribute('value', code);
		}
	});

	it('should show the correct selected language', async () => {
		render(LanguageSelector, { props: { selectedLanguage: 'es' } });
		
		const select = page.getByLabel('Select language for translation');
		await expect.element(select).toHaveValue('es');
	});

	it('should load saved language preference from localStorage', async () => {
		localStorageMock.getItem.mockReturnValue('fr');
		
		const { component } = render(LanguageSelector, { props: { selectedLanguage: 'en' } });
		
		// Wait for onMount to execute
		await new Promise(resolve => setTimeout(resolve, 10));
		
		// Should have updated to saved language
		expect(component.selectedLanguage).toBe('fr');
	});

	it('should ignore invalid saved language preference', async () => {
		localStorageMock.getItem.mockReturnValue('invalid-lang');
		
		const { component } = render(LanguageSelector, { props: { selectedLanguage: 'en' } });
		
		// Wait for onMount to execute
		await new Promise(resolve => setTimeout(resolve, 10));
		
		// Should keep the original language
		expect(component.selectedLanguage).toBe('en');
	});

	it('should save language preference when changed', async () => {
		render(LanguageSelector, { props: { selectedLanguage: 'en' } });
		
		const select = page.getByLabel('Select language for translation');
		
		// Change language
		await select.selectOption('es');
		
		// Should save to localStorage
		expect(localStorageMock.setItem).toHaveBeenCalledWith('selectedLanguage', 'es');
	});

	it('should update parent component when language changes', async () => {
		let parentSelectedLanguage = 'en';
		
		render(LanguageSelector, { 
			props: { 
				selectedLanguage: parentSelectedLanguage,
				'bind:selectedLanguage': (value: string) => { parentSelectedLanguage = value; }
			} 
		});
		
		const select = page.getByLabel('Select language for translation');
		
		// Change language
		await select.selectOption('de');
		
		// Parent should be updated
		expect(parentSelectedLanguage).toBe('de');
	});

	it('should handle localStorage errors gracefully', async () => {
		localStorageMock.setItem.mockImplementation(() => {
			throw new Error('QuotaExceededError');
		});
		
		render(LanguageSelector, { props: { selectedLanguage: 'en' } });
		
		const select = page.getByLabel('Select language for translation');
		
		// Change language - should not throw
		await expect(select.selectOption('es')).resolves.not.toThrow();
	});

	it('should be keyboard accessible', async () => {
		render(LanguageSelector, { props: { selectedLanguage: 'en' } });
		
		const select = page.getByLabel('Select language for translation');
		
		// Focus the select
		await select.focus();
		
		// Should be focused
		await expect.element(select).toHaveFocus();
		
		// Should be able to navigate with keyboard
		await select.press('ArrowDown');
		await select.press('Enter');
		
		// Language should have changed
		const newValue = await select.evaluate((el: HTMLSelectElement) => el.value);
		expect(newValue).not.toBe('en');
	});

	it('should have proper styling classes', async () => {
		render(LanguageSelector, { props: { selectedLanguage: 'en' } });
		
		const container = page.locator('.language-selector');
		const label = page.locator('.label');
		const select = page.locator('.select');
		
		await expect.element(container).toBeInTheDocument();
		await expect.element(label).toBeInTheDocument();
		await expect.element(select).toBeInTheDocument();
	});

	it('should handle rapid language changes', async () => {
		render(LanguageSelector, { props: { selectedLanguage: 'en' } });
		
		const select = page.getByLabel('Select language for translation');
		
		// Change language multiple times rapidly
		await select.selectOption('es');
		await select.selectOption('fr');
		await select.selectOption('de');
		await select.selectOption('it');
		
		// All changes should be saved
		expect(localStorageMock.setItem).toHaveBeenCalledTimes(4);
		expect(localStorageMock.setItem).toHaveBeenLastCalledWith('selectedLanguage', 'it');
	});

	it('should display language names correctly', async () => {
		render(LanguageSelector, { props: { selectedLanguage: 'en' } });
		
		// Check a few specific language names
		await expect.element(page.getByText('English')).toBeInTheDocument();
		await expect.element(page.getByText('Spanish')).toBeInTheDocument();
		await expect.element(page.getByText('French')).toBeInTheDocument();
		await expect.element(page.getByText('Chinese (Simplified)')).toBeInTheDocument();
		await expect.element(page.getByText('Chinese (Traditional)')).toBeInTheDocument();
	});
});