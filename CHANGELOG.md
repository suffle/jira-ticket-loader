# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-10-01

### BREAKING CHANGES
- **Removed built-in templates**: Package no longer includes any template files
- **Template path now mandatory**: Must specify template path when using non-interactive mode
- Package size reduced by removing template files

### Changed
- Template directory must be specified with `-p/--template-path` parameter
- Interactive mode always asks for template directory path
- Package only includes source code, no template files
- Templates kept in repository for testing purposes only

### Improved
- Lighter package size (no template files included)
- More flexible - users provide their own templates
- Clearer separation between tool and content
- Better error messages for missing template path

### Migration Guide
Users upgrading from v1.x.x need to:
1. Save any templates you were using from the package
2. Update CLI commands to include `-p/--template-path` parameter
3. Create your own template directory with `.md` files

## [1.2.0] - 2025-10-01

### Fixed
- **Configuration Path**: Config file now correctly looks in current working directory instead of package directory
- Each project can now have its own `.jira-loaderrc.json` configuration

### Added
- **--config/-c parameter**: Specify custom configuration file path
- Better error messages showing actual config file path being used
- Documentation for configuration file location behavior

### Changed
- ConfigManager now uses `process.cwd()` for default config location
- Improved help text with config parameter and examples

## [1.1.0] - 2025-10-01

### Changed
- **BREAKING**: Configuration file renamed from `config.json` to `.jira-loaderrc.json`
  - Follows modern RC file conventions (like `.eslintrc.json`, `.prettierrc.json`)
  - Prevents conflicts with generic `config.json` files in projects
  - More descriptive and tool-specific naming

### Added
- Example configuration file renamed to `.jira-loaderrc.example.json`
- Updated all documentation to reflect new configuration file name

### Migration Guide
If upgrading from v1.0.x:
1. Rename your `config.json` to `.jira-loaderrc.json`
2. Update any scripts or documentation referencing the old file name

## [1.0.1] - 2025-10-01

### Changed
- **Updated Dependencies**: Major dependency updates for improved security and performance
  - `axios`: ^1.5.0 → ^1.12.2 (security updates and performance improvements)
  - `inquirer`: ^9.2.0 → ^12.9.6 (major version update with enhanced CLI features)
  - `fs-extra`: ^11.1.0 → ^11.3.2 (bug fixes and stability improvements)
  - `jest`: ^29.7.0 → ^30.2.0 (major version update with improved ES modules support)
  - `jest-environment-node`: ^29.7.0 → ^30.2.0 (compatibility with Jest 30)

### Fixed
- All tests continue to pass with updated dependencies
- No breaking changes to existing functionality
- Zero security vulnerabilities

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