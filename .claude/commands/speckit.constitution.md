Generate or update the project constitution at `.speckit/memory/constitution.md`.

The constitution is the set of **immutable principles** that govern how specifications become code
in this project. It is the source of truth for the AI agent and must be consulted before writing
any plan or implementation.

## Steps

1. Read `CLAUDE.md` to understand the project.
2. Read `.speckit/memory/constitution.md` if it exists.
3. If it **does not exist**, create it using the structure below.
4. If it **exists**, review whether any principles need updating based on current project state,
   then propose and apply updates.

## Constitution Structure

```markdown
# [Project Name] Constitution

## Purpose
One-paragraph description of what this project does and for whom.

## Core Principles
Numbered list of non-negotiable truths about how this project is built.

## Architecture Constraints
Things that MUST always be true about the architecture.

## Quality Standards
Testing, linting, type safety, security requirements.

## Workflow Rules
How features flow from idea → spec → plan → tasks → code → PR.

## Out of Scope
Things this project will never do.
```

After writing or updating the constitution, confirm with a summary of what was added or changed.
