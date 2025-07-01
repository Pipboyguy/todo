<script lang="ts">
	import { toggleTodo, deleteTodo } from '../stores/todos';
	import type { Todo } from '../types';

	export let todo: Todo;
	export let selectedLanguage: string;

	$: translation = todo.translations?.[selectedLanguage] || '';
</script>

<li class="todo-item {todo.completed ? 'completed' : ''}">
	<div class="todo-content">
		<label class="checkbox-label">
			<input
				type="checkbox"
				checked={todo.completed}
				on:change={() => toggleTodo(todo.id)}
				aria-label="Toggle todo completion"
			/>
			<span class="checkmark" style="pointer-events: none;"></span>
		</label>
		
		<div class="todo-text">
			<p class={todo.completed ? 'line-through' : ''}>{todo.text}</p>
			{#if translation && selectedLanguage !== 'en'}
				<p class="translated-text">{translation}</p>
			{/if}
		</div>
	</div>

	<div class="todo-actions">
		<button
			on:click={() => deleteTodo(todo.id)}
			aria-label="Delete todo"
			class="delete-button"
		>
			🗑️
		</button>
	</div>
</li>

<style>
	.todo-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background-color: var(--nord1);
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.2s;
	}

	.todo-item:hover {
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
		background-color: var(--nord2);
	}

	.todo-item.completed {
		opacity: 0.7;
	}

	.todo-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.checkbox-label {
		position: relative;
		display: inline-block;
		width: 24px;
		height: 24px;
		cursor: pointer;
	}

	.checkbox-label input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
	}

	.checkmark {
		position: absolute;
		top: 0;
		left: 0;
		width: 24px;
		height: 24px;
		background-color: var(--nord3);
		border: 2px solid var(--nord3);
		border-radius: 0.375rem;
		transition: all 0.2s;
	}

	.checkbox-label:hover .checkmark {
		background-color: var(--nord4);
	}

	.checkbox-label input:checked ~ .checkmark {
		background-color: var(--nord10);
		border-color: var(--nord10);
	}

	.checkbox-label input:checked ~ .checkmark:after {
		content: '';
		position: absolute;
		display: block;
		left: 8px;
		top: 4px;
		width: 6px;
		height: 10px;
		border: solid var(--nord6);
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
	}

	.todo-text {
		flex: 1;
	}

	.todo-text p {
		margin: 0;
		word-break: break-word;
	}

	.line-through {
		text-decoration: line-through;
		color: var(--nord4);
	}

	.translated-text {
		font-size: 0.875rem;
		color: var(--nord8);
		margin-top: 0.25rem !important;
		font-style: italic;
	}

	.todo-actions {
		display: flex;
		gap: 0.5rem;
	}

	.delete-button {
		padding: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.25rem;
		border-radius: 0.375rem;
		transition: all 0.2s;
	}

	.delete-button:hover {
		background-color: var(--nord11);
	}

	@media (max-width: 640px) {
		.todo-item {
			padding: 0.75rem;
		}

		.todo-content {
			gap: 0.75rem;
		}
	}
</style>