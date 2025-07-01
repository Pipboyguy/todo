<script lang="ts">
	import { onMount } from 'svelte';
	import { loadTodos } from '$lib/stores/todos';
	import TodoForm from '$lib/components/TodoForm.svelte';
	import TodoList from '$lib/components/TodoList.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import type { LanguageCode } from '$lib/types';

	let selectedLanguage: LanguageCode = 'en';

	// Load todos from localStorage on mount
	onMount(() => {
		loadTodos();
	});
</script>

<svelte:head>
	<title>Todo App with Translation</title>
	<meta name="description" content="A todo app that can translate your tasks into multiple languages" />
</svelte:head>

<div class="app-container">
	<header class="app-header">
		<h1>Todo App</h1>
		<p class="subtitle">Organize your tasks in any language</p>
	</header>

	<main class="app-main">
		<LanguageSelector bind:selectedLanguage />
		<TodoForm />
		<TodoList {selectedLanguage} />
	</main>

	
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		background-color: var(--nord0);
		color: var(--nord6);
	}

	:global(*) {
		box-sizing: border-box;
	}

	.app-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.app-header {
		background-color: var(--nord1);
		color: var(--nord6);
		padding: 2rem 1rem;
		text-align: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.app-header h1 {
		margin: 0;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.subtitle {
		margin: 0.5rem 0 0;
		font-size: 1.125rem;
		opacity: 0.9;
	}

	.app-main {
		flex: 1;
		max-width: 48rem;
		margin: 0 auto;
		padding: 2rem 1rem;
		width: 100%;
	}

	@media (max-width: 640px) {
		.app-header h1 {
			font-size: 2rem;
		}

		.subtitle {
			font-size: 1rem;
		}

		.app-main {
			padding: 1rem;
		}
	}
</style>