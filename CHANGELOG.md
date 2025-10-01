# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-01

### Added
- Initial release of JIRA Ticket Loader
- Interactive CLI mode for guided template and ticket selection
- Non-interactive mode for automation and VS Code integration
- Built-in AI prompt templates for different engineering roles:
  - Frontend Engineer analysis prompts
  - Backend Engineer analysis prompts
  - QA Engineer testing prompts
  - DevOps Engineer deployment prompts
- JIRA REST API integration with authentication
- Template processing engine with placeholders, conditionals, and loops
- Comprehensive test suite (39 tests)
- VS Code tasks integration support
- Configuration management for JIRA credentials
- CLI command: `jira-loader`

### Features
- **Template System**: Markdown templates with JIRA data placeholders
- **Dual Modes**: Interactive prompts or automated execution
- **VS Code Integration**: Ready-to-use tasks configuration
- **Flexible Templates**: Support for custom template directories and files
- **Silent Mode**: Clean output for automation scenarios
- **Error Handling**: Comprehensive validation and user-friendly error messages

### Supported Placeholders
- Basic ticket info: `{{ticket.key}}`, `{{ticket.summary}}`, `{{ticket.description}}`
- Status and type: `{{ticket.status}}`, `{{ticket.issueType}}`, `{{ticket.priority}}`
- People: `{{ticket.assignee}}`, `{{ticket.reporter}}`
- Dates: `{{ticket.created}}`, `{{ticket.updated}}`
- Arrays: `{{ticket.labels}}`, `{{ticket.components}}`
- Advanced: Conditionals `{{#if}}` and loops `{{#each}}`