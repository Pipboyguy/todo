import { writable, derived } from 'svelte/store';
import type { Todo } from '../types';

/**
 * Creates a unique ID for new todos
 */
function createId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Main todo store with localStorage persistence
 */
function createTodoStore() {
	const { subscribe, set, update } = writable<Todo[]>([]);

	/**
	 * Saves todos to localStorage, handling quota errors gracefully
	 */
	function saveTodos(todos: Todo[]) {
		try {
			localStorage.setItem('todos', JSON.stringify(todos));
		} catch (error) {
			console.error('Failed to save todos to localStorage:', error);
		}
	}

	return {
		subscribe,
		set: (todos: Todo[]) => {
			set(todos);
			saveTodos(todos);
		},
		update: (fn: (todos: Todo[]) => Todo[]) => {
			update((todos) => {
				const newTodos = fn(todos);
				saveTodos(newTodos);
				return newTodos;
			});
		}
	};
}

export const todos = createTodoStore();

/**
 * Adds a new todo item
 */
export function addTodo(text: string): void {
	const trimmedText = text.trim();
	if (!trimmedText) return;

	const newTodo: Todo = {
		id: createId(),
		text: trimmedText,
		completed: false,
		createdAt: new Date()
	};

	todos.update((items) => [...items, newTodo]);
}

/**
 * Toggles the completion status of a todo
 */
export function toggleTodo(id: string): void {
	todos.update((items) =>
		items.map((todo) =>
			todo.id === id ? { ...todo, completed: !todo.completed } : todo
		)
	);
}

/**
 * Deletes a todo by ID
 */
export function deleteTodo(id: string): void {
	todos.update((items) => items.filter((todo) => todo.id !== id));
}

/**
 * Removes all completed todos
 */
export function clearCompleted(): void {
	todos.update((items) => items.filter((todo) => !todo.completed));
}

/**
 * Loads todos from localStorage on app initialization
 */
export function loadTodos(): void {
	try {
		const stored = localStorage.getItem('todos');
		if (stored) {
			const parsed = JSON.parse(stored);
			// Convert date strings back to Date objects
			const todosWithDates = parsed.map((todo: any) => ({
				...todo,
				createdAt: new Date(todo.createdAt)
			}));
			todos.set(todosWithDates);
		}
	} catch (error) {
		console.error('Failed to load todos from localStorage:', error);
		todos.set([]);
	}
}

/**
 * Updates a todo with a new translation
 */
export function updateTodoTranslation(id: string, language: string, translation: string): void {
	todos.update((items) =>
		items.map((todo) => {
			if (todo.id === id) {
				return {
					...todo,
					translations: {
						...todo.translations,
						[language]: translation
					}
				};
			}
			return todo;
		})
	);
}

/**
 * Derived store for active (incomplete) todos count
 */
export const activeTodosCount = derived(
	todos,
	($todos) => $todos.filter((todo) => !todo.completed).length
);

/**
 * Derived store for completed todos count
 */
export const completedTodosCount = derived(
	todos,
	($todos) => $todos.filter((todo) => todo.completed).length
);