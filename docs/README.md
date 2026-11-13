# Project Documentation Index

This documentation set is intended to help developers and AI coding agents understand the current source tree and add features without introducing a different architecture or coding style.

Start with the root [`AGENTS.md`](../AGENTS.md), then read the topic-specific guide relevant to the change:

| Document | Use it for |
|---|---|
| [Architecture](ARCHITECTURE.md) | Understanding modules, dependency direction, and application composition |
| [Feature development](FEATURE-DEVELOPMENT.md) | Adding a CRUD-style feature in the established pattern |
| [Coding conventions](CODING-CONVENTIONS.md) | Matching TypeScript structure, naming, formatting, and controller style |
| [Database and models](DATABASE.md) | Mapping SQL tables to TypeScript models and validation metadata |
| [HTTP API conventions](API.md) | Adding routes and preserving request/response behavior |
| [Build and operations](BUILD-AND-OPERATIONS.md) | Running, building, configuring, and deploying the app |

The documentation describes the source included in this repository and the `users` DDL supplied with the project. Where implementation details of external packages are not present in the repository, the docs explicitly instruct agents to inspect the installed package types/source rather than guessing.
