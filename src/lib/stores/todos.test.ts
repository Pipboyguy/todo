import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { todos, addTodo, toggleTodo, deleteTodo, clearCompleted, loadTodos, updateTodoTranslation } from './todos';
import type { Todo } from '../types';

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};

// @ts-ignore
global.localStorage = localStorageMock;

describe('Todo Store', () => {
	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks();
		// Reset the store
		todos.set([]);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('addTodo', () => {
		it('should add a new todo with valid text', () => {
			const todoText = 'Buy groceries';
			addTodo(todoText);

			const $todos = get(todos);
			expect($todos).toHaveLength(1);
			expect($todos[0]).toMatchObject({
				text: todoText,
				completed: false
			});
			expect($todos[0].id).toBeTruthy();
			expect($todos[0].createdAt).toBeInstanceOf(Date);
		});

		it('should not add a todo with empty text', () => {
			addTodo('');
			addTodo('   ');

			const $todos = get(todos);
			expect($todos).toHaveLength(0);
		});

		it('should trim whitespace from todo text', () => {
			addTodo('  Buy groceries  ');

			const $todos = get(todos);
			expect($todos[0].text).toBe('Buy groceries');
		});

		it('should save to localStorage after adding', () => {
			addTodo('Test todo');

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'todos',
				expect.any(String)
			);
		});
	});

	describe('toggleTodo', () => {
		it('should toggle todo completion status', () => {
			addTodo('Test todo');
			const $todos = get(todos);
			const todoId = $todos[0].id;

			expect($todos[0].completed).toBe(false);

			toggleTodo(todoId);
			const $todosAfterToggle = get(todos);
			expect($todosAfterToggle[0].completed).toBe(true);

			toggleTodo(todoId);
			const $todosAfterSecondToggle = get(todos);
			expect($todosAfterSecondToggle[0].completed).toBe(false);
		});

		it('should not affect other todos', () => {
			addTodo('Todo 1');
			addTodo('Todo 2');
			const $todos = get(todos);
			const firstId = $todos[0].id;

			toggleTodo(firstId);

			const $todosAfter = get(todos);
			expect($todosAfter[0].completed).toBe(true);
			expect($todosAfter[1].completed).toBe(false);
		});

		it('should save to localStorage after toggling', () => {
			addTodo('Test todo');
			const $todos = get(todos);
			vi.clearAllMocks();

			toggleTodo($todos[0].id);

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'todos',
				expect.any(String)
			);
		});
	});

	describe('deleteTodo', () => {
		it('should delete a todo by id', () => {
			addTodo('Todo 1');
			addTodo('Todo 2');
			const $todos = get(todos);
			const firstId = $todos[0].id;

			deleteTodo(firstId);

			const $todosAfter = get(todos);
			expect($todosAfter).toHaveLength(1);
			expect($todosAfter[0].text).toBe('Todo 2');
		});

		it('should handle deleting non-existent todo', () => {
			addTodo('Todo 1');

			deleteTodo('non-existent-id');

			const $todos = get(todos);
			expect($todos).toHaveLength(1);
		});

		it('should save to localStorage after deleting', () => {
			addTodo('Test todo');
			const $todos = get(todos);
			vi.clearAllMocks();

			deleteTodo($todos[0].id);

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'todos',
				expect.any(String)
			);
		});
	});

	describe('clearCompleted', () => {
		it('should remove all completed todos', () => {
			addTodo('Todo 1');
			addTodo('Todo 2');
			addTodo('Todo 3');
			const $todos = get(todos);

			toggleTodo($todos[0].id);
			toggleTodo($todos[2].id);

			clearCompleted();

			const $todosAfter = get(todos);
			expect($todosAfter).toHaveLength(1);
			expect($todosAfter[0].text).toBe('Todo 2');
		});

		it('should not affect incomplete todos', () => {
			addTodo('Todo 1');
			addTodo('Todo 2');

			clearCompleted();

			const $todos = get(todos);
			expect($todos).toHaveLength(2);
		});

		it('should save to localStorage after clearing', () => {
			addTodo('Test todo');
			const $todos = get(todos);
			toggleTodo($todos[0].id);
			vi.clearAllMocks();

			clearCompleted();

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'todos',
				expect.any(String)
			);
		});
	});

	describe('updateTodoTranslation', () => {
		it('should add a new translation to a todo', () => {
			addTodo('Hello');
			const todoId = get(todos)[0].id;

			updateTodoTranslation(todoId, 'es', 'Hola');

			const $todos = get(todos);
			expect($todos[0].translations).toEqual({ es: 'Hola' });
		});

		it('should add a translation to an existing translations object', () => {
			addTodo('Hello');
			const todoId = get(todos)[0].id;

			updateTodoTranslation(todoId, 'es', 'Hola');
			updateTodoTranslation(todoId, 'fr', 'Bonjour');

			const $todos = get(todos);
			expect($todos[0].translations).toEqual({ es: 'Hola', fr: 'Bonjour' });
		});

		it('should overwrite an existing translation for the same language', () => {
			addTodo('Hello');
			const todoId = get(todos)[0].id;

			updateTodoTranslation(todoId, 'es', 'Hola');
			updateTodoTranslation(todoId, 'es', 'Hola Mundo');

			const $todos = get(todos);
			expect($todos[0].translations).toEqual({ es: 'Hola Mundo' });
		});

		it('should not affect other todos', () => {
			addTodo('Todo 1');
			addTodo('Todo 2');
			const $todos = get(todos);
			const firstId = $todos[0].id;

			updateTodoTranslation(firstId, 'es', 'Hola');

			const $todosAfter = get(todos);
			expect($todosAfter[0].translations).toEqual({ es: 'Hola' });
			expect($todosAfter[1].translations).toBeUndefined();
		});
	});

	describe('loadTodos', () => {
		it('should load todos from localStorage', () => {
			const mockTodos: Todo[] = [
				{
					id: '1',
					text: 'Saved todo',
					completed: false,
					createdAt: new Date('2024-01-01')
				}
			];

			localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos));

			loadTodos();

			const $todos = get(todos);
			expect($todos).toHaveLength(1);
			expect($todos[0].text).toBe('Saved todo');
			expect($todos[0].createdAt).toBeInstanceOf(Date);
		});

		it('should handle invalid localStorage data', () => {
			localStorageMock.getItem.mockReturnValue('invalid json');

			loadTodos();

			const $todos = get(todos);
			expect($todos).toHaveLength(0);
		});

		it('should handle empty localStorage', () => {
			localStorageMock.getItem.mockReturnValue(null);

			loadTodos();

			const $todos = get(todos);
			expect($todos).toHaveLength(0);
		});

		it('should convert date strings to Date objects', () => {
			const mockTodos = [
				{
					id: '1',
					text: 'Test',
					completed: false,
					createdAt: '2024-01-01T00:00:00.000Z'
				}
			];

			localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTodos));

			loadTodos();

			const $todos = get(todos);
			expect($todos[0].createdAt).toBeInstanceOf(Date);
		});
	});

	describe('localStorage integration', () => {
		it('should handle localStorage quota exceeded error', () => {
			localStorageMock.setItem.mockImplementation(() => {
				throw new Error('QuotaExceededError');
			});

			// Should not throw when adding todo
			expect(() => addTodo('Test todo')).not.toThrow();

			const $todos = get(todos);
			expect($todos).toHaveLength(1);
		});
	});
});
