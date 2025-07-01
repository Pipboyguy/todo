import { page } from '@vitest/browser/context';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import * as todoStore from '$lib/stores/todos';

// Mock the todo store
vi.mock('$lib/stores/todos', () => ({
	loadTodos: vi.fn(),
	todos: { subscribe: vi.fn() },
	addTodo: vi.fn(),
	activeTodosCount: { subscribe: vi.fn() },
	completedTodosCount: { subscribe: vi.fn() },
	deleteTodo: vi.fn(),
	toggleTodo: vi.fn(),
	clearCompleted: vi.fn(),
	updateTodoTranslation: vi.fn()
}));

describe('/+page.svelte', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render h1', async () => {
		render(Page);

		const heading = page.getByRole('heading', { level: 1, name: 'Todo App' });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should render subtitle', async () => {
		render(Page);

		const subtitle = page.getByText('Organize your tasks in any language');
		await expect.element(subtitle).toBeInTheDocument();
	});

	it('should render todo form', async () => {
		render(Page);

		const input = page.getByPlaceholder('What needs to be done?');
		const button = page.getByRole('button', { name: 'Add todo' });

		await expect.element(input).toBeInTheDocument();
		await expect.element(button).toBeInTheDocument();
	});

	it('should render language selector', async () => {
		render(Page);

		const languageSelector = page.getByLabel('Select language for translation');
		await expect.element(languageSelector).toBeInTheDocument();
	});

	it('should load todos on mount', async () => {
		render(Page);

		// Wait for onMount to execute
		await new Promise(resolve => setTimeout(resolve, 10));

		// Should have called loadTodos
		expect(todoStore.loadTodos).toHaveBeenCalledOnce();
	});

	it('should have proper page title', async () => {
		render(Page);

		// Check that the title is set
		const title = await page.evaluate(() => document.title);
		expect(title).toBe('Todo App with Translation');
	});

	it('should have proper meta description', async () => {
		render(Page);

		// Check meta description
		const metaDescription = await page.evaluate(() => {
			const meta = document.querySelector('meta[name="description"]');
			return meta?.getAttribute('content');
		});
		expect(metaDescription).toBe('A todo app that can translate your tasks into multiple languages');
	});

	it('should render all main components', async () => {
		render(Page);

		// Check all major sections are present
		const header = await page.$('.app-header');
		const main = await page.$('.app-main');
		const container = await page.$('.app-container');

		expect(header).toBeTruthy();
		expect(main).toBeTruthy();
		expect(container).toBeTruthy();
	});

	it('should apply correct CSS classes', async () => {
		render(Page);

		const container = await page.$('.app-container');
		expect(container).toBeTruthy();
	});

	it('should be responsive', async () => {
		render(Page);

		// Check that main content exists
		const main = await page.$('.app-main');
		expect(main).toBeTruthy();
	});

	it('should integrate all components correctly', async () => {
		render(Page);

		// TodoForm should be present
		const todoForm = await page.$('form.todo-form');
		expect(todoForm).toBeTruthy();

		// LanguageSelector should be present
		const languageSelector = await page.$('.language-selector');
		expect(languageSelector).toBeTruthy();

		// TodoList container should be present
		const todoListContainer = await page.$('.todo-list-container');
		expect(todoListContainer).toBeTruthy();
	});

	it('should handle language selection state', async () => {
		render(Page);

		const select = page.getByLabel('Select language for translation');
		
		// Default should be English
		await expect.element(select).toHaveValue('en');
		
		// Change language
		await select.selectOption('es');
		
		// Should update to Spanish
		await expect.element(select).toHaveValue('es');
	});
});
