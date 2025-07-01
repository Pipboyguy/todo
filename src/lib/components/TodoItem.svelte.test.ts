import { page } from '@vitest/browser/context';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TodoItem from './TodoItem.svelte';
import * as todoStore from '../stores/todos';
import type { Todo } from '../types';

// Mock the todo store
vi.mock('../stores/todos', () => ({
	toggleTodo: vi.fn(),
	deleteTodo: vi.fn()
}));

describe('TodoItem', () => {
	const mockTodo: Todo = {
		id: '123',
		text: 'Test todo',
		completed: false,
		createdAt: new Date('2024-01-01'),
		translations: {}
	};

	const mockLanguage = 'es';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render todo text and controls', async () => {
		render(TodoItem, { props: { todo: mockTodo, selectedLanguage: mockLanguage } });
		
		const todoText = page.getByText('Test todo');
		const checkbox = page.getByRole('checkbox', { name: /toggle todo/i });
		const deleteButton = page.getByRole('button', { name: /delete/i });
		
		await expect.element(todoText).toBeInTheDocument();
		await expect.element(checkbox).toBeInTheDocument();
		await expect.element(deleteButton).toBeInTheDocument();
	});

	it('should show completed state correctly', async () => {
		const completedTodo = { ...mockTodo, completed: true };
		render(TodoItem, { props: { todo: completedTodo, selectedLanguage: mockLanguage } });
		
		const checkbox = page.getByRole('checkbox', { name: /toggle todo/i });
		await expect.element(checkbox).toBeChecked();
		
		// Check for line-through styling
		const todoText = page.getByText('Test todo');
		await expect.element(todoText).toHaveClass(/line-through/);
	});

	it('should toggle todo on checkbox click', async () => {
		render(TodoItem, { props: { todo: mockTodo, selectedLanguage: mockLanguage } });
		
		const checkbox = page.getByRole('checkbox', { name: /toggle todo/i });
		await checkbox.click();
		
		expect(todoStore.toggleTodo).toHaveBeenCalledWith('123');
	});

	it('should delete todo on delete button click', async () => {
		render(TodoItem, { props: { todo: mockTodo, selectedLanguage: mockLanguage } });
		
		const deleteButton = page.getByRole('button', { name: /delete/i });
		await deleteButton.click();
		
		expect(todoStore.deleteTodo).toHaveBeenCalledWith('123');
	});

	it('should show cached translation if available', async () => {
		const todoWithTranslation = {
			...mockTodo,
			translations: { es: 'Tarea en español' }
		};
		
		render(TodoItem, { props: { todo: todoWithTranslation, selectedLanguage: mockLanguage } });
		
		// Should show translation immediately
		const translatedText = page.getByText('Tarea en español');
		await expect.element(translatedText).toBeInTheDocument();
	});

	it('should show both original and translated text', async () => {
		const todoWithTranslation = {
			...mockTodo,
			translations: { es: 'Tarea traducida' }
		};
		
		render(TodoItem, { props: { todo: todoWithTranslation, selectedLanguage: mockLanguage } });
		
		// Should show both texts
		const originalText = page.getByText('Test todo');
		const translatedText = page.getByText('Tarea traducida');
		
		await expect.element(originalText).toBeInTheDocument();
		await expect.element(translatedText).toBeInTheDocument();
	});

	it('should not show translation for English language', async () => {
		const todoWithTranslation = {
			...mockTodo,
			translations: { es: 'Tarea en español', en: 'Test todo' }
		};
		
		render(TodoItem, { props: { todo: todoWithTranslation, selectedLanguage: 'en' } });
		
		// Should only show original text, not translation
		const originalText = page.getByText('Test todo');
		await expect.element(originalText).toBeInTheDocument();
		
		// Should not show any translated text
		const translatedTexts = await page.$$('.translated-text');
		expect(translatedTexts).toHaveLength(0);
	});

	it('should handle very long todo text gracefully', async () => {
		const longTodo = {
			...mockTodo,
			text: 'This is a very long todo item that contains a lot of text to test how the component handles word wrapping and layout when the content exceeds normal boundaries'
		};
		
		render(TodoItem, { props: { todo: longTodo, selectedLanguage: mockLanguage } });
		
		const todoText = page.getByText(longTodo.text);
		await expect.element(todoText).toBeInTheDocument();
	});

	it('should apply correct styles for completed todos', async () => {
		const completedTodo = { ...mockTodo, completed: true };
		render(TodoItem, { props: { todo: completedTodo, selectedLanguage: mockLanguage } });
		
		// Check that the list item has completed class
		const listItems = await page.$$('li.todo-item.completed');
		expect(listItems).toHaveLength(1);
	});

	it('should handle rapid toggle clicks', async () => {
		render(TodoItem, { props: { todo: mockTodo, selectedLanguage: mockLanguage } });
		
		const checkbox = page.getByRole('checkbox', { name: /toggle todo/i });
		
		// Click multiple times rapidly
		await checkbox.click();
		await checkbox.click();
		await checkbox.click();
		
		// Should have been called 3 times
		expect(todoStore.toggleTodo).toHaveBeenCalledTimes(3);
		expect(todoStore.toggleTodo).toHaveBeenCalledWith('123');
	});

	it('should show emoji delete button', async () => {
		render(TodoItem, { props: { todo: mockTodo, selectedLanguage: mockLanguage } });
		
		const deleteButton = page.getByRole('button', { name: /delete/i });
		await expect.element(deleteButton).toBeInTheDocument();
		
		// Check that it contains the trash emoji
		const text = await deleteButton.element()?.textContent;
		expect(text).toBe('🗑️');
	});

	it('should handle missing translations gracefully', async () => {
		render(TodoItem, { props: { todo: mockTodo, selectedLanguage: 'fr' } });
		
		// Should show original text
		const originalText = page.getByText('Test todo');
		await expect.element(originalText).toBeInTheDocument();
		
		// Should not show any translation
		const translatedTexts = await page.$$('.translated-text');
		expect(translatedTexts).toHaveLength(0);
	});

	it('should maintain checkbox state with completed prop', async () => {
		const { rerender } = render(TodoItem, { 
			props: { todo: mockTodo, selectedLanguage: mockLanguage } 
		});
		
		const checkbox = page.getByRole('checkbox', { name: /toggle todo/i });
		await expect.element(checkbox).not.toBeChecked();
		
		// Update to completed
		await rerender({ 
			props: { 
				todo: { ...mockTodo, completed: true }, 
				selectedLanguage: mockLanguage 
			} 
		});
		
		await expect.element(checkbox).toBeChecked();
	});
});
