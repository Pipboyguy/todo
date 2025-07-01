<script lang="ts">
	import { onMount } from 'svelte';
	import { SUPPORTED_LANGUAGES, type LanguageCode } from '../types';

	export let selectedLanguage: LanguageCode = 'en';

	// Load saved language preference
	onMount(() => {
		const saved = localStorage.getItem('selectedLanguage');
		if (saved && saved in SUPPORTED_LANGUAGES) {
			selectedLanguage = saved as LanguageCode;
		}
	});

	// Save language preference when it changes
	$: if (typeof window !== 'undefined') {
		localStorage.setItem('selectedLanguage', selectedLanguage);
	}
</script>

<div class="language-selector">
	<label for="language-select" class="label">
		Translate to:
	</label>
	<select
		id="language-select"
		bind:value={selectedLanguage}
		class="select"
		aria-label="Select language for translation"
	>
		{#each Object.entries(SUPPORTED_LANGUAGES) as [code, name]}
			<option value={code}>{name}</option>
		{/each}
	</select>
</div>

<style>
	.language-selector {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
		padding: 1rem;
		background-color: var(--nord1);
		border-radius: 0.5rem;
		flex-wrap: wrap;
	}

	.label {
		font-weight: 500;
		color: var(--nord4);
	}

	.select {
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		background-color: var(--nord2);
		border: 2px solid var(--nord3);
		border-radius: 0.375rem;
		font-size: 1rem;
		color: var(--nord6);
		cursor: pointer;
		background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23d8dee9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
		background-position: right 0.5rem center;
		background-repeat: no-repeat;
		background-size: 1.5rem 1.5rem;
		appearance: none;
		transition: border-color 0.2s;
	}

	.select:focus {
		outline: none;
		border-color: var(--nord8);
		box-shadow: 0 0 0 3px rgba(136, 192, 208, 0.1);
	}

	@media (max-width: 640px) {
		.language-selector {
			flex-direction: column;
			align-items: stretch;
		}

		.select {
			width: 100%;
		}
	}
</style>