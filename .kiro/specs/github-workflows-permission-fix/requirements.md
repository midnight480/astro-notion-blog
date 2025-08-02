# Requirements Document

## Introduction

GitHub Actionsで権限エラーが発生している問題を解決し、ワークフローを統合・簡素化する。現在、`format.yml`と`lint.yml`が独立して存在し、`format.yml`では`stefanzweifel/git-auto-commit-action@v5`による権限エラーが発生している。これらの重複したワークフローを削除し、`deploy-workers.yml`にlintとformatチェック機能を統合することで、シンプルで効率的なCI/CDパイプラインを実現する。

## Requirements

### Requirement 1

**User Story:** As a developer, I want to consolidate all code quality checks into the main deployment workflow, so that there is a single source of truth for CI/CD processes.

#### Acceptance Criteria

1. WHEN code is pushed to main or feature branches THEN the deploy-workers.yml workflow SHALL run all quality checks
2. WHEN the workflow runs THEN it SHALL include lint, format check, build, and test steps
3. WHEN any quality check fails THEN the entire workflow SHALL fail with clear error messages

### Requirement 2

**User Story:** As a developer, I want to eliminate redundant workflows that cause permission errors, so that the CI/CD pipeline is reliable and secure.

#### Acceptance Criteria

1. WHEN the consolidation is complete THEN format.yml and lint.yml workflows SHALL be completely removed
2. WHEN workflows are removed THEN there SHALL be no git-auto-commit-action usage anywhere
3. WHEN the main workflow runs THEN there SHALL be no permission-related errors

### Requirement 3

**User Story:** As a developer, I want format and lint checks to be validation-only without automatic fixes, so that code changes remain under developer control.

#### Acceptance Criteria

1. WHEN format checking runs THEN it SHALL only validate formatting without modifying files
2. WHEN lint checking runs THEN it SHALL only report issues without auto-fixing
3. WHEN checks fail THEN developers SHALL receive clear instructions for manual resolution