<script lang="ts">
	import { onMount } from 'svelte';
	import { addTodo } from '../stores/todos';

	let inputValue = '';
	let inputElement: HTMLInputElement;

	function handleSubmit(event: Event) {
		event.preventDefault();
		const trimmedValue = inputValue.trim();
		
		if (trimmedValue) {
			addTodo(trimmedValue);
			inputValue = '';
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSubmit(event);
		}
	}

	onMount(() => {
		inputElement.focus();
	});
</script>

<form on:submit={handleSubmit} class="todo-form">
	<input
		bind:this={inputElement}
		bind:value={inputValue}
		on:keydown={handleKeyDown}
		type="text"
		placeholder="What needs to be done?"
		aria-label="New todo"
		class="todo-input"
	/>
	<button
		type="submit"
		aria-label="Add todo"
		class="add-button"
	>
		Add todo
	</button>
</form>

<style>
	.todo-form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.todo-input {
		flex: 1;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		border: 2px solid var(--nord3);
		border-radius: 0.5rem;
		transition: border-color 0.2s;
		background-color: var(--nord1);
		color: var(--nord6);
	}

	.todo-input:focus {
		outline: none;
		border-color: var(--nord8);
	}

	.todo-input::placeholder {
		color: var(--nord4);
	}

	.add-button {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 500;
		color: var(--nord6);
		background-color: var(--nord10);
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.add-button:hover {
		background-color: var(--nord9);
	}

	.add-button:active {
		background-color: var(--nord8);
	}
</style>