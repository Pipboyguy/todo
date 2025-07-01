import { page } from '@vitest/browser/context';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TodoForm from './TodoForm.svelte';
import * as todoStore from '../stores/todos';

// Mock the todo store
vi.mock('../stores/todos', () => ({
	addTodo: vi.fn()
}));

describe('TodoForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render input and button', async () => {
		render(TodoForm);
		
		const input = page.getByPlaceholder('What needs to be done?');
		const button = page.getByRole('button', { name: 'Add todo' });
		
		await expect.element(input).toBeInTheDocument();
		await expect.element(button).toBeInTheDocument();
	});

	it('should add todo on form submission', async () => {
		render(TodoForm);
		const input = page.getByPlaceholder('What needs to be done?');
		const button = page.getByRole('button', { name: 'Add todo' });

		// Type in the input
		await input.fill('New todo item');
		
		// Submit the form
		await button.click();

		// Check that addTodo was called
		expect(todoStore.addTodo).toHaveBeenCalledWith('New todo item');

		// Input should be cleared
		await expect.element(input).toHaveValue('');
	});

	it('should add todo on Enter key press', async () => {
		render(TodoForm);
		const input = page.getByPlaceholder('What needs to be done?');

		// Type in the input
		await input.fill('Another todo');

		// Press Enter by dispatching keyboard event
		await input.trigger({ type: 'keydown', key: 'Enter' });

		// Check that addTodo was called
		expect(todoStore.addTodo).toHaveBeenCalledWith('Another todo');

		// Input should be cleared
		await expect.element(input).toHaveValue('');
	});

	it('should not add empty todos', async () => {
		render(TodoForm);
		const input = page.getByPlaceholder('What needs to be done?');
		const button = page.getByRole('button', { name: 'Add todo' });

		// Leave input empty and submit
		await button.click();

		// addTodo should not be called
		expect(todoStore.addTodo).not.toHaveBeenCalled();

		// Try with just whitespace
		await input.fill('   ');
		await button.click();

		// addTodo should still not be called  
		expect(todoStore.addTodo).not.toHaveBeenCalled();
	});

	it('should have proper accessibility attributes', async () => {
		render(TodoForm);
		const input = page.getByPlaceholder('What needs to be done?');
		const button = page.getByRole('button', { name: 'Add todo' });

		// Check input attributes
		await expect.element(input).toHaveAttribute('type', 'text');
		await expect.element(input).toHaveAttribute('aria-label', 'New todo');

		// Check button attributes
		await expect.element(button).toHaveAttribute('type', 'submit');
	});

	it('should focus input on mount', async () => {
		render(TodoForm);
		const input = page.getByPlaceholder('What needs to be done?');

		// Input should be focused
		await expect.element(input).toHaveFocus();
	});

	it('should trim whitespace from input', async () => {
		render(TodoForm);
		const input = page.getByPlaceholder('What needs to be done?');
		const button = page.getByRole('button', { name: 'Add todo' });

		// Type with leading and trailing spaces
		await input.fill('  Trimmed todo  ');
		await button.click();

		// Should be called with trimmed value
		expect(todoStore.addTodo).toHaveBeenCalledWith('Trimmed todo');
	});

	it('should handle multiple rapid submissions', async () => {
		render(TodoForm);
		const input = page.getByPlaceholder('What needs to be done?');
		const button = page.getByRole('button', { name: 'Add todo' });

		// Add multiple todos rapidly
		await input.fill('First todo');
		await button.click();
		
		await input.fill('Second todo');
		await button.click();
		
		await input.fill('Third todo');
		await button.click();

		// All should be added
		// Reset mock call count before test
		vi.clearAllMocks();
		
		// Add multiple todos rapidly
		await input.fill('First todo');
		await button.click();
		
		await input.fill('Second todo');
		await button.click();
		
		await input.fill('Third todo');
		await button.click();

		// All should be added
		expect(todoStore.addTodo).toHaveBeenCalledTimes(3);
		expect(todoStore.addTodo).toHaveBeenNthCalledWith(1, 'First todo');
		expect(todoStore.addTodo).toHaveBeenNthCalledWith(2, 'Second todo');
		expect(todoStore.addTodo).toHaveBeenNthCalledWith(3, 'Third todo');
	});

	it('should handle special characters in todo text', async () => {
		render(TodoForm);
		const input = page.getByPlaceholder('What needs to be done?');
		const button = page.getByRole('button', { name: 'Add todo' });

		const specialText = 'Buy milk & eggs @ store #1 (50% off!)';
		await input.fill(specialText);
		await button.click();

		expect(todoStore.addTodo).toHaveBeenCalledWith(specialText);
	});

	it('should clear input after failed submission (empty)', async () => {
		render(TodoForm);
		const input = page.getByPlaceholder('What needs to be done?');
		const button = page.getByRole('button', { name: 'Add todo' });

		// Try to submit empty
		await button.click();
		
		// Now add valid text
		await input.fill('Valid todo');
		
		// Input should still have the text since empty submission doesn't clear
		await expect.element(input).toHaveValue('Valid todo');
	});
});