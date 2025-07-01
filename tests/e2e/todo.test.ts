import { expect, test } from '@playwright/test';

test.describe('Todo App', () => {
	test('should display the app header and form', async ({ page }) => {
		await page.goto('/');
		
		// Check header
		await expect(page.getByRole('heading', { name: 'Todo App' })).toBeVisible();
		await expect(page.getByText('Organize your tasks in any language')).toBeVisible();
		
		// Check form elements
		await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Add todo' })).toBeVisible();
		
		// Check language selector
		await expect(page.getByLabel('Select language for translation')).toBeVisible();
	});

	test('should add a new todo', async ({ page }) => {
		await page.goto('/');
		
		// Add a todo
		const input = page.getByPlaceholder('What needs to be done?');
		await input.fill('Buy groceries');
		await input.press('Enter');
		
		// Check if todo appears
		await expect(page.getByText('Buy groceries')).toBeVisible();
		await expect(page.getByText('1 active, 0 completed')).toBeVisible();
		
		// Input should be cleared
		await expect(input).toHaveValue('');
	});

	test('should toggle todo completion', async ({ page }) => {
		await page.goto('/');
		
		// Add a todo
		await page.getByPlaceholder('What needs to be done?').fill('Test todo');
		await page.getByRole('button', { name: 'Add todo' }).click();
		
		// Toggle completion
		await page.getByRole('checkbox', { name: 'Toggle todo completion' }).click();
		
		// Check status
		await expect(page.getByText('0 active, 1 completed')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
	});

	test('should delete a todo', async ({ page }) => {
		await page.goto('/');
		
		// Add a todo
		await page.getByPlaceholder('What needs to be done?').fill('Todo to delete');
		await page.getByRole('button', { name: 'Add todo' }).click();
		
		// Delete it
		await page.getByRole('button', { name: 'Delete todo' }).click();
		
		// Should show empty state
		await expect(page.getByText('No todos yet. Add one above!')).toBeVisible();
	});

	test('should translate a todo', async ({ page }) => {
		await page.goto('/');
		
		// Add a todo
		await page.getByPlaceholder('What needs to be done?').fill('Hello world');
		await page.getByRole('button', { name: 'Add todo' }).click();
		
		// Select Spanish
		await page.getByLabel('Select language for translation').selectOption('es');
		
		// Translate all todos
		await page.getByRole('button', { name: 'Translate All' }).click();
		
		// Should show loading state briefly, then translation
		// Note: This will fail if API is down or rate limited
		await expect(page.getByText('Hola mundo')).toBeVisible({ timeout: 10000 });
	});

	test('should persist todos on page reload', async ({ page }) => {
		await page.goto('/');
		
		// Add todos
		await page.getByPlaceholder('What needs to be done?').fill('Persistent todo 1');
		await page.getByRole('button', { name: 'Add todo' }).click();
		
		await page.getByPlaceholder('What needs to be done?').fill('Persistent todo 2');
		await page.getByRole('button', { name: 'Add todo' }).click();
		
		// Reload page
		await page.reload();
		
		// Todos should still be there
		await expect(page.getByText('Persistent todo 1')).toBeVisible();
		await expect(page.getByText('Persistent todo 2')).toBeVisible();
	});

	test('should clear completed todos', async ({ page }) => {
		await page.goto('/');
		
		// Add todos
		await page.getByPlaceholder('What needs to be done?').fill('Todo 1');
		await page.getByRole('button', { name: 'Add todo' }).click();
		
		await page.getByPlaceholder('What needs to be done?').fill('Todo 2');
		await page.getByRole('button', { name: 'Add todo' }).click();
		
		// Complete first todo
		await page.getByRole('checkbox', { name: 'Toggle todo completion' }).first().click();
		
		// Clear completed
		await page.getByRole('button', { name: 'Clear completed' }).click();
		
		// Only Todo 2 should remain
		await expect(page.getByText('Todo 1')).not.toBeVisible();
		await expect(page.getByText('Todo 2')).toBeVisible();
		await expect(page.getByText('1 active, 0 completed')).toBeVisible();
	});
});