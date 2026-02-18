# Contributing to Cleros

Thanks for your interest in contributing to Cleros.

## Development Setup

```bash
cd web
npm install
npm run dev
```

## Code Quality

All checks must pass before merging:

```bash
npm run lint         # ESLint, zero warnings allowed
npm run type-check   # TypeScript strict mode
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright end-to-end tests
```

## Architecture Guidelines

- **Service layer separation** -- Oracle (random) and Counsel (semantic) modes must remain independent
- **No server dependencies** -- the app is a pure static SPA, keep it that way
- **Type safety** -- all new code must be fully typed, no untyped `any` without justification
- **Performance** -- consider ML model loading and memory impact for any changes touching the embedding pipeline

## Pull Requests

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Ensure all CI checks pass (`lint`, `type-check`, `test`, `build`)
4. Open a PR with a clear description of the change

## Reporting Issues

Open an issue on GitHub with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and OS information (if relevant)

## License

By contributing, you agree that your contributions will be licensed under CC0 1.0 Universal.
