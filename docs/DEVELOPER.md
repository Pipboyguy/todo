# Developer Documentation

This document provides technical guidance for developers working on the todo application.

## Getting Started

### Prerequisites

A developer should have Node.js (version 18+ or Bun) and Git installed. A basic understanding of Svelte, SvelteKit, and TypeScript is also required.

### Local Development Setup

To set up the local development environment, first clone the repository and navigate into the project directory.

```bash
git clone https://github.com/Pipboyguy/todo.git
cd todo
```

Next, install the dependencies using your preferred package manager.

```bash
bun install
```

Finally, start the development server. The application will be available at `http://localhost:5173`.

```bash
bun run dev
```

To run tests in watch mode during development, use `bun test --watch`.

## Architecture Overview

The application's architecture is designed for simplicity and maintainability. The main application page (`+page.svelte`) serves as the entry point, composing the `LanguageSelector`, `TodoForm`, and `TodoList` components. The `TodoList` in turn renders a list of `TodoItem` components.

Data flow follows a standard Svelte pattern: user actions in a component trigger functions in the central store. The store updates its state and persists it to `localStorage`. Components subscribed to the store automatically re-render to reflect the new state.

State management is handled by Svelte's built-in stores. A writable store holds the array of todos, and derived stores are used to compute values like the count of active and completed todos.

```typescript
// Main todo store
const todos = writable<Todo[]>([]);

// Derived stores for computed values
const activeTodosCount = derived(todos, $todos => 
  $todos.filter(todo => !todo.completed).length
);
```

## Component Documentation

The application is composed of several key components. `TodoForm` handles the creation of new todos via user input. `TodoList` acts as a container for all todo items and includes footer actions like clearing completed tasks. `TodoItem` displays an individual todo, providing controls for toggling completion, deleting, and initiating translation. Finally, `LanguageSelector` allows the user to pick a target language for translation and displays the remaining API rate limit.

## Service Documentation

### Translation Service

The translation service, located in `src/lib/services/translate.ts`, manages all interactions with the MyMemory API. Its primary function, `translateText`, handles the translation of a given text string. The service also includes functions for managing the API rate limit (`getRateLimitInfo`, `resetRateLimit`) and the translation cache (`clearTranslationCache`).

The caching strategy uses a key composed of the source language, target language, and the normalized (lowercase, trimmed) text. Cache entries are stored in `localStorage` and expire after seven days. The error handling is designed to be robust; network errors or invalid API responses will cause the service to fall back to the original text, ensuring the application remains functional.

### Store Functions

The core application state is managed in `src/lib/stores/todos.ts`. The store provides functions for all todo operations. `addTodo` validates input, generates a unique ID, and adds the new todo to the store. `toggleTodo` flips the completion status of a specific todo. `deleteTodo` removes a todo by its ID, and `clearCompleted` filters out all completed todos. Each of these operations automatically persists the updated state to `localStorage`.

## Testing Guide

The project includes a comprehensive test suite. To run all tests, use `bun test`. To run unit or end-to-end tests specifically, use `bun run test:unit` or `bun run test:e2e`. You can also target a specific test file, for example: `bun test src/lib/stores/todos.test.ts`.

The testing strategy is organized by file type. Unit tests for services and stores are located in `*.test.ts` files. Component tests are in `*.svelte.test.ts` files, and end-to-end tests for user flows are in the `e2e/` directory. Test examples for the store and components can be found in the respective test files, demonstrating how to mock dependencies and assert outcomes.

## Build and Deployment

The application is configured for deployment on Vercel. The build process is automated and triggered by a push to the `main` branch on GitHub.

To manually build the application for production, run `bun run build`. You can preview the production build locally with `bun run preview`. The project also includes commands for type checking (`bun run check`) and linting (`bun run lint`).

For a manual deployment, install the Vercel CLI (`npm i -g vercel`) and run `vercel --prod` from the project root.

## Code Style and Conventions

The project adheres to a strict code style to ensure consistency and readability. For TypeScript, we use explicit types for function parameters and prefer interfaces over type aliases for objects. In Svelte, components are kept small (ideally under 200 lines), complex logic is extracted into separate functions, and stores are preferred over local component state for any data that needs to be shared. For styling, Tailwind CSS utilities are used whenever possible, with any necessary custom CSS scoped to its component.

## Debugging and Performance

When debugging, common issues to check are `localStorage` quota errors, failed translation API calls (via the network tab), and state persistence problems. The Svelte DevTools browser extension is invaluable for inspecting component state.

Performance is optimized through several mechanisms. Translation caching significantly reduces API calls. The SvelteKit build process provides code splitting by default. The use of Svelte's reactivity model ensures minimal DOM updates, and debounced `localStorage` writes prevent performance issues from rapid state changes.

## Security

Security is handled through several layers. Svelte automatically escapes all user input rendered in the DOM, preventing XSS attacks. The translation service implements client-side rate limiting to prevent API abuse. No sensitive user data is transmitted or stored. All API communication occurs over HTTPS.

## Contributing

Contributions are welcome. The process involves forking the repository, creating a feature branch, and submitting a pull request. All new features should be accompanied by tests, and the existing test suite must pass. Before submitting, ensure no `console.log` statements remain and that the changes are accessible and mobile-responsive.