# Todo App with Translation

This project is a modern todo application built with SvelteKit. It allows users to manage their tasks and translate them into multiple languages using the MyMemory Translation API.

## Live Demo

A live version of the application is available at [todosuper.vercel.app](https://todosuper.vercel.app).

## Core Functionality

The application provides full CRUD (Create, Read, Update, Delete) functionality for todo items. Users can translate tasks into over 12 languages, with a client-side rate limit of 30 translations per day to prevent API abuse. The app is mobile-responsive and uses `localStorage` for persistent storage, ensuring that tasks are saved between sessions.

## Technical Architecture

The application is built on a modern, lightweight tech stack.

- **Framework**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest for unit testing and Playwright for end-to-end testing.
- **Translation**: MyMemory API (free tier, no API key required).
- **Deployment**: Vercel.

The project follows a standard SvelteKit structure, with components, stores, and services organized within the `src/lib` directory.

```
src/
└── lib/
    ├── components/
    ├── services/
    └── stores/
```

Data flow is managed by a Svelte writable store that synchronizes with `localStorage` on every change. Translation results are cached to minimize API calls, and a client-side rate limit is tracked in `localStorage`.

## Setup Instructions

### Prerequisites

- Node.js 18+ or Bun
- Git

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Pipboyguy/todo.git
    cd todo
    ```

2.  Install dependencies:
    ```bash
    bun install
    # or
    npm install
    ```

3.  Start the development server:
    ```bash
    bun run dev
    ```

4.  Open `http://localhost:5173` in your browser.

## API Documentation

### Translation Service

The application uses the MyMemory API for translations. The core function is:
`translateText(text: string, fromLang: string, toLang: string): Promise<string>`

This service includes a rate limit of 30 translations per day, which resets at midnight. Cached translations do not count against this limit and are stored for 7 days. Supported languages include English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Russian, Arabic, and Hindi.

### Store API

The todo store exposes the following functions for managing state:
- `addTodo(text: string): void`
- `toggleTodo(id: string): void`
- `deleteTodo(id: string): void`
- `clearCompleted(): void`
- `loadTodos(): void`

## Testing Guide

To run all tests, execute `bun test`. For specific test suites, use `bun run test:unit` or `bun run test:e2e`.

The test suite provides comprehensive coverage, including unit tests for store operations and the translation service (API calls, caching, and rate limiting). It also includes component tests for user interactions and end-to-end tests covering the complete todo management workflow.

## Deployment Process

The application is configured for Vercel and deploys automatically on pushes to the main branch. To deploy manually, connect the repository to a Vercel account and use the default settings. The app requires no environment variables as the MyMemory API does not need authentication.

## Project Rationale

The technical choices for this project prioritize performance, developer experience, and simplicity. SvelteKit was chosen for its small bundle sizes and excellent TypeScript support. For the backend, `localStorage` provides a simple, effective persistence layer without requiring a dedicated server. The MyMemory API was selected for its generous free tier and ease of use.

Performance is enhanced through translation caching, which reduces API calls, and minimal dependencies to ensure a fast initial load. Security considerations include sanitizing all user input by default (a feature of Svelte), implementing client-side rate limiting to prevent API abuse, and using HTTPS for all external communication.

## Known Limitations

This application relies on a free-tier API, which has a global limit of 5,000 words per day. As with any machine translation, the quality may not always be perfect. An internet connection is required for new translations, and the browser's `localStorage` capacity (typically 5-10MB) limits the number of todos that can be stored.

## Contributing

1.  Fork the repository.
2.  Create a new feature branch.
3.  Add tests for any new features.
4.  Ensure all existing tests pass.
5.  Submit a pull request for review.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/Pipboyguy/todo/issues).
