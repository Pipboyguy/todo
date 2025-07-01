<script lang="ts">
	import { todos, activeTodosCount, completedTodosCount, clearCompleted, updateTodoTranslation } from '../stores/todos';
	import { translateText } from '../services/translate';
	import TodoItem from './TodoItem.svelte';

	export let selectedLanguage: string;

	let isTranslating = false;

	async function translateAll() {
		if (selectedLanguage === 'en' || isTranslating) return;

		isTranslating = true;
		const promises = $todos.map(async (todo) => {
			if (!todo.translations?.[selectedLanguage]) {
				const translatedText = await translateText(todo.text, 'en', selectedLanguage);
				updateTodoTranslation(todo.id, selectedLanguage, translatedText);
			}
		});

		await Promise.all(promises);
		isTranslating = false;
	}
</script>

<div class="todo-list-container">
	{#if $todos.length === 0}
		<p class="empty-state">No todos yet. Add one above!</p>
	{:else}
		<div class="list-header">
			{#if selectedLanguage !== 'en'}
				<button
					on:click={translateAll}
					class="translate-all-button"
					disabled={isTranslating}
				>
					{isTranslating ? 'Translating...' : 'Translate All'}
				</button>
			{/if}
		</div>
		<ul class="todo-list">
			{#each $todos as todo (todo.id)}
				<TodoItem {todo} {selectedLanguage} />
			{/each}
		</ul>

		<div class="todo-footer">
			<span class="todo-count">
				{$activeTodosCount} active, {$completedTodosCount} completed
			</span>
			
			{#if $completedTodosCount > 0}
				<button
					on:click={clearCompleted}
					class="clear-button"
					aria-label="Clear completed todos"
				>
					Clear completed
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.list-header {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.translate-all-button {
		padding: 0.5rem 1rem;
		background-color: var(--nord8);
		color: var(--nord0);
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.translate-all-button:hover:not(:disabled) {
		background-color: var(--nord7);
	}

	.translate-all-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	.todo-list-container {
		margin-top: 2rem;
	}

	.empty-state {
		text-align: center;
		color: var(--nord4);
		padding: 3rem 1rem;
		background-color: var(--nord1);
		border-radius: 0.5rem;
	}

	.todo-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.todo-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1.5rem;
		padding: 1rem;
		background-color: var(--nord1);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		color: var(--nord4);
	}

	.todo-count {
		font-weight: 500;
	}

	.clear-button {
		padding: 0.5rem 1rem;
		background-color: var(--nord11);
		color: var(--nord6);
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.clear-button:hover {
		background-color: var(--nord12);
	}

	.clear-button:active {
		background-color: var(--nord13);
	}

	@media (max-width: 640px) {
		.todo-footer {
			flex-direction: column;
			gap: 0.75rem;
			text-align: center;
		}

		.clear-button {
			width: 100%;
		}
	}
</style>
