import { page } from '@vitest/browser/context';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { writable, get } from 'svelte/store';
import TodoList from './TodoList.svelte';
import * as todoStore from '../stores/todos';
import * as translateService from '../services/translate';
import type { Todo } from '../types';

// Mock the stores and services
vi.mock('../stores/todos', () => {
	const mockTodos = writable<Todo[]>([]);
	return {
		todos: mockTodos,
		activeTodosCount: writable(0),
		completedTodosCount: writable(0),
		clearCompleted: vi.fn(),
		updateTodoTranslation: vi.fn(),
		addTodo: vi.fn(),
		toggleTodo: vi.fn(),
		deleteTodo: vi.fn(),
		loadTodos: vi.fn()
	};
});

vi.mock('../services/translate', () => ({
	translateText: vi.fn()
}));

describe('TodoList', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset the todos store
		todoStore.todos.set([]);
	});

	it('should show empty state when no todos', async () => {
		render(TodoList, { props: { selectedLanguage: 'en' } });
		
		const emptyState = page.getByText('No todos yet. Add one above!');
		await expect.element(emptyState).toBeInTheDocument();
	});

	it('should render list of todos', async () => {
		const mockTodos: Todo[] = [
			{
				id: '1',
				text: 'First todo',
				completed: false,
				createdAt: new Date()
			},
			{
				id: '2',
				text: 'Second todo',
				completed: true,
				createdAt: new Date()
			}
		];
		
		todoStore.todos.set(mockTodos);
		todoStore.activeTodosCount.set(1);
		todoStore.completedTodosCount.set(1);
		
		render(TodoList, { props: { selectedLanguage: 'en' } });
		
		// Check todos are rendered
		await expect.element(page.getByText('First todo')).toBeInTheDocument();
		await expect.element(page.getByText('Second todo')).toBeInTheDocument();
		
		// Check footer count
		await expect.element(page.getByText('1 active, 1 completed')).toBeInTheDocument();
	});

	it('should show translate button for non-English languages', async () => {
		const mockTodos: Todo[] = [{
			id: '1',
			text: 'Test todo',
			completed: false,
			createdAt: new Date()
		}];
		
		todoStore.todos.set(mockTodos);
		
		render(TodoList, { props: { selectedLanguage: 'es' } });
		
		const translateButton = page.getByRole('button', { name: 'Translate All' });
		await expect.element(translateButton).toBeInTheDocument();
	});

	it('should not show translate button for English', async () => {
		const mockTodos: Todo[] = [{
			id: '1',
			text: 'Test todo',
			completed: false,
			createdAt: new Date()
		}];
		
		todoStore.todos.set(mockTodos);
		
		render(TodoList, { props: { selectedLanguage: 'en' } });
		
		const translateButton = page.getByRole('button', { name: 'Translate All' });
		await expect.element(translateButton).not.toBeInTheDocument();
	});

	it('should translate all todos when button clicked', async () => {
		const mockTodos: Todo[] = [
			{
				id: '1',
				text: 'Hello',
				completed: false,
				createdAt: new Date()
			},
			{
				id: '2',
				text: 'World',
				completed: false,
				createdAt: new Date()
			}
		];
		
		todoStore.todos.set(mockTodos);
		
		// Mock translation responses
		vi.mocked(translateService.translateText).mockResolvedValueOnce('Hola');
		vi.mocked(translateService.translateText).mockResolvedValueOnce('Mundo');
		
		render(TodoList, { props: { selectedLanguage: 'es' } });
		
		const translateButton = page.getByRole('button', { name: 'Translate All' });
		await translateButton.click();
		
		// Should call translateText for each todo
		expect(translateService.translateText).toHaveBeenCalledTimes(2);
		expect(translateService.translateText).toHaveBeenCalledWith('Hello', 'en', 'es');
		expect(translateService.translateText).toHaveBeenCalledWith('World', 'en', 'es');
		
		// Should update translations
		expect(todoStore.updateTodoTranslation).toHaveBeenCalledTimes(2);
		expect(todoStore.updateTodoTranslation).toHaveBeenCalledWith('1', 'es', 'Hola');
		expect(todoStore.updateTodoTranslation).toHaveBeenCalledWith('2', 'es', 'Mundo');
	});

	it('should show loading state while translating', async () => {
		const mockTodos: Todo[] = [{
			id: '1',
			text: 'Test',
			completed: false,
			createdAt: new Date()
		}];
		
		todoStore.todos.set(mockTodos);
		
		// Mock slow translation
		vi.mocked(translateService.translateText).mockImplementation(
			() => new Promise(resolve => setTimeout(() => resolve('Translated'), 100))
		);
		
		render(TodoList, { props: { selectedLanguage: 'es' } });
		
		const translateButton = page.getByRole('button', { name: 'Translate All' });
		await translateButton.click();
		
		// Should show loading state
		await expect.element(page.getByText('Translating...')).toBeInTheDocument();
		await expect.element(translateButton).toBeDisabled();
		
		// Wait for translation to complete
		await new Promise(resolve => setTimeout(resolve, 150));
		
		// Should return to normal state
		await expect.element(page.getByText('Translate All')).toBeInTheDocument();
		await expect.element(translateButton).not.toBeDisabled();
	});

	it('should skip already translated todos', async () => {
		const mockTodos: Todo[] = [
			{
				id: '1',
				text: 'Hello',
				completed: false,
				createdAt: new Date(),
				translations: { es: 'Hola' }
			},
			{
				id: '2',
				text: 'World',
				completed: false,
				createdAt: new Date()
			}
		];
		
		todoStore.todos.set(mockTodos);
		vi.mocked(translateService.translateText).mockResolvedValue('Mundo');
		
		render(TodoList, { props: { selectedLanguage: 'es' } });
		
		const translateButton = page.getByRole('button', { name: 'Translate All' });
		await translateButton.click();
		
		// Should only translate the second todo
		expect(translateService.translateText).toHaveBeenCalledTimes(1);
		expect(translateService.translateText).toHaveBeenCalledWith('World', 'en', 'es');
	});

	it('should show clear completed button when there are completed todos', async () => {
		const mockTodos: Todo[] = [
			{
				id: '1',
				text: 'Active todo',
				completed: false,
				createdAt: new Date()
			},
			{
				id: '2',
				text: 'Completed todo',
				completed: true,
				createdAt: new Date()
			}
		];
		
		todoStore.todos.set(mockTodos);
		todoStore.completedTodosCount.set(1);
		
		render(TodoList, { props: { selectedLanguage: 'en' } });
		
		const clearButton = page.getByRole('button', { name: 'Clear completed' });
		await expect.element(clearButton).toBeInTheDocument();
	});

	it('should hide clear completed button when no completed todos', async () => {
		const mockTodos: Todo[] = [{
			id: '1',
			text: 'Active todo',
			completed: false,
			createdAt: new Date()
		}];
		
		todoStore.todos.set(mockTodos);
		todoStore.completedTodosCount.set(0);
		
		render(TodoList, { props: { selectedLanguage: 'en' } });
		
		const clearButton = page.getByRole('button', { name: 'Clear completed' });
		await expect.element(clearButton).not.toBeInTheDocument();
	});

	it('should call clearCompleted when clear button clicked', async () => {
		const mockTodos: Todo[] = [
			{
				id: '1',
				text: 'Active todo',
				completed: false,
				createdAt: new Date()
			},
			{
				id: '2',
				text: 'Completed todo',
				completed: true,
				createdAt: new Date()
			}
		];
		
		todoStore.todos.set(mockTodos);
		todoStore.completedTodosCount.set(1);
		
		render(TodoList, { props: { selectedLanguage: 'en' } });
		
		const clearButton = page.getByRole('button', { name: 'Clear completed' });
		await clearButton.click();
		
		expect(todoStore.clearCompleted).toHaveBeenCalledOnce();
	});

	it('should handle empty translation response gracefully', async () => {
		const mockTodos: Todo[] = [{
			id: '1',
			text: 'Test',
			completed: false,
			createdAt: new Date()
		}];
		
		todoStore.todos.set(mockTodos);
		vi.mocked(translateService.translateText).mockResolvedValue('');
		
		render(TodoList, { props: { selectedLanguage: 'es' } });
		
		const translateButton = page.getByRole('button', { name: 'Translate All' });
		await translateButton.click();
		
		// Should still call updateTodoTranslation even with empty result
		expect(todoStore.updateTodoTranslation).toHaveBeenCalledWith('1', 'es', '');
	});
});