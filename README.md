# JIRA Ticket Loader

A Node.js package that downloads JIRA ticket content and populates markdown templates with ticket data. Perfect for generating AI prompts, documentation, or automated ticket summaries.

## Features

- 🎯 Download ticket data from JIRA REST API
- 📝 Template-based markdown generation with placeholders
- 🤖 Built-in AI prompt templates for different engineering roles
- 🔧 Interactive CLI and automated execution modes
- ⚡ VS Code integration for seamless workflow
- 🧪 Comprehensive test suite (39 tests)
- 📦 Distributable package for multiple projects

## Installation

### Global Installation (Recommended)

Install globally to use the `jira-loader` command anywhere:

```bash
npm install -g @suffle/jira-ticket-loader
```

### Local Installation

Install as a project dependency:

```bash
npm install @suffle/jira-ticket-loader
```

### From Source

Clone and install from source for development:

```bash
git clone https://github.com/suffle/jira-ticket-loader.git
cd jira-ticket-loader
npm install
npm link  # For global CLI access
```

## Quick Start

### Global Usage (After `npm install -g`)

1. **Configure JIRA connection** by creating `.jira-loaderrc.json` in your working directory:
   ```json
   {
     "jiraBaseUrl": "https://your-company.atlassian.net",
     "jiraApiKey": "your-api-key",
     "jiraEmail": "your-email@company.com"
   }
   ```

2. **Run the tool**:
   ```bash
   # Interactive mode
   jira-loader
   
   # Automated mode
   jira-loader -t PROJ-123 -e ai-prompt-frontend -s
   ```

### Local Package Usage

If you're using this tool in your project:

1. **Install the package** in your project:
   ```bash
   npm install @suffle/jira-ticket-loader
   ```

2. **Configure JIRA connection** by creating `.jira-loaderrc.json`:
   ```json
   {
     "jiraBaseUrl": "https://your-company.atlassian.net",
     "jiraApiKey": "your-api-key",
     "jiraEmail": "your-email@company.com"
   }
   ```

3. **Run the tool**:
   ```bash
   # Interactive mode
   npx jira-loader
   
   # Automated mode
   npx jira-loader -t PROJ-123 -e ai-prompt-frontend -s
   
   # Or use via npm scripts
   npm run jira-doc  # (if you add it to your package.json scripts)
   ```

### For Development

If you're working on the package itself:

1. **Clone and setup**:
   ```bash
   git clone <repo-url>
   cd jira-ticket-loader
   npm install
   ```

2. **Development commands**:
   ```bash
   npm run dev           # Run with file watching
   npm test              # Run test suite
   npm run test:watch    # Run tests with file watching
   npm run test:coverage # Run tests with coverage report
   npm run clean         # Clean output directories
   ```

## Configuration

### JIRA Connection Settings

Create a `.jira-loaderrc.json` file with your JIRA credentials:

```json
{
  "jiraBaseUrl": "https://your-company.atlassian.net",
  "jiraApiKey": "your-api-key",
  "jiraEmail": "your-email@company.com"
}
```

**Getting your JIRA API Key:**
1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Copy the generated token

### Configuration File Location

By default, the tool looks for `.jira-loaderrc.json` in your **current working directory**. This allows you to have different configurations for different projects.

**Default behavior:**
```bash
# Looks for ./.jira-loaderrc.json in current directory
jira-loader -t PROJ-123 -e ai-prompt-frontend
```

**Custom config file:**
```bash
# Use a specific config file
jira-loader -t PROJ-123 -e ai-prompt-frontend -c /path/to/my-config.json
```

**Note**: Template and output paths are specified via command line, not in configuration.

## Templates

Templates are markdown files with placeholders that get replaced with JIRA ticket data.

### Built-in Templates

The package includes specialized AI prompt templates:

- `ai-prompt-frontend.md` - Frontend Engineer analysis prompts
- `ai-prompt-backend.md` - Backend Engineer analysis prompts  
- `ai-prompt-qa.md` - QA Engineer testing prompts
- `ai-prompt-devops.md` - DevOps Engineer deployment prompts

### Template Syntax

#### Basic Placeholders
- `{{ticket.key}}` - Ticket key (e.g., "TASK-123")
- `{{ticket.summary}}` - Ticket title/summary
- `{{ticket.description}}` - Full ticket description
- `{{ticket.status}}` - Current status (In Progress, Done, etc.)
- `{{ticket.assignee}}` - Assigned user display name
- `{{ticket.reporter}}` - Reporter display name
- `{{ticket.created}}` - Creation date (formatted)
- `{{ticket.updated}}` - Last updated date (formatted)
- `{{ticket.priority}}` - Priority level (High, Medium, Low)
- `{{ticket.issueType}}` - Issue type (Bug, Story, Task, etc.)
- `{{ticket.labels}}` - Labels (comma-separated)

#### Advanced Features
- **Conditionals**: `{{#if ticket.assignee}}Assigned to: {{ticket.assignee}}{{/if}}`
- **Loops**: `{{#each ticket.labels}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}`
- **Arrays**: Automatically converted to comma-separated strings

#### Custom Templates

Create your own templates by following the same pattern:

```markdown
# {{ticket.key}}: {{ticket.summary}}

**Status**: {{ticket.status}}
**Priority**: {{ticket.priority}}

{{#if ticket.assignee}}
**Assigned to**: {{ticket.assignee}}
{{/if}}

## Description
{{ticket.description}}

{{#if ticket.labels}}
## Labels
{{#each ticket.labels}}
- {{this}}
{{/each}}
{{/if}}
```

## Usage

### Interactive Mode

```bash
# Run from package directory
node src/index.js

# Run from your project (adjust path as needed)
node jira-ticket-loader/src/index.js
```

The tool will prompt you to:
1. Select a template (or enter a custom path)
2. Enter a JIRA ticket key
3. Choose output location

### Automated Mode

```bash
# Basic usage
node src/index.js --ticket PROJ-123 --template ai-prompt-frontend

# Silent mode (no console output)
node src/index.js -t PROJ-123 -e ai-prompt-backend --silent

# Custom template directory
node src/index.js -t PROJ-123 -e my-template -p /custom/templates

# Specific template file
node src/index.js -t PROJ-123 -e /path/to/custom-template.md

# Custom output directory
node src/index.js -t PROJ-123 -e ai-prompt-qa -o /output/path
```

### CLI Parameters

```
-t, --ticket <key>        JIRA ticket key (e.g., PROJ-123)
-e, --template <name>     Template name or file path
-p, --template-path <dir> Template directory path (default: ./templates)
-o, --output <path>       Output directory (default: ./output)
-c, --config <path>       Config file path (default: ./.jira-loaderrc.json)
-s, --silent             Silent mode (no console output)
-h, --help               Show help
```

## VS Code Integration

### Method 1: Tasks (Recommended)

Add this to your project's `.vscode/tasks.json`:

#### For Global Installation:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Generate JIRA Ticket Doc",
      "type": "shell",
      "command": "jira-loader",
      "args": [
        "--ticket",
        "${input:ticketKey}",
        "--template", 
        "${input:template}",
        "--output",
        "${workspaceFolder}/docs",
        "--silent"
      ],
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "shared"
      },
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "ticketKey",
      "type": "promptString",
      "description": "Enter JIRA ticket key (e.g., PROJ-123)"
    },
    {
      "id": "template",
      "type": "pickString", 
      "description": "Select template",
      "options": [
        {"label": "Frontend Engineer", "value": "ai-prompt-frontend"},
        {"label": "Backend Engineer", "value": "ai-prompt-backend"},
        {"label": "QA Engineer", "value": "ai-prompt-qa"},
        {"label": "DevOps Engineer", "value": "ai-prompt-devops"}
      ]
    }
  ]
}
```

#### For Local Installation:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Generate JIRA Ticket Doc",
      "type": "shell",
      "command": "npx",
      "args": [
        "jira-loader",
        "--ticket",
        "${input:ticketKey}",
        "--template", 
        "${input:template}",
        "--output",
        "${workspaceFolder}/docs",
        "--silent"
      ],
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "shared"
      },
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "ticketKey",
      "type": "promptString",
      "description": "Enter JIRA ticket key (e.g., PROJ-123)"
    },
    {
      "id": "template",
      "type": "pickString", 
      "description": "Select template",
      "options": [
        {"label": "Frontend Engineer", "value": "ai-prompt-frontend"},
        {"label": "Backend Engineer", "value": "ai-prompt-backend"},
        {"label": "QA Engineer", "value": "ai-prompt-qa"},
        {"label": "DevOps Engineer", "value": "ai-prompt-devops"}
      ]
    }
  ]
}
```

**Usage**: **Ctrl+Shift+P** → **Tasks: Run Task** → **Generate JIRA Ticket Doc**

### Method 2: NPM Scripts

Add to your project's `package.json`:

#### For Global Installation:
```json
{
  "scripts": {
    "jira-doc": "jira-loader",
    "jira-frontend": "jira-loader -e ai-prompt-frontend",
    "jira-backend": "jira-loader -e ai-prompt-backend"
  }
}
```

#### For Local Installation:
```json
{
  "scripts": {
    "jira-doc": "npx jira-loader",
    "jira-frontend": "npx jira-loader -e ai-prompt-frontend",
    "jira-backend": "npx jira-loader -e ai-prompt-backend"
  }
}
```

**Usage**: Run from VS Code terminal: `npm run jira-doc`

## Distribution Across Projects

### Local Installation (Recommended)

1. **Install globally once**:
   ```bash
   npm install -g @suffle/jira-ticket-loader
   ```

2. **Use in any project**:
   ```bash
   cd your-project
   # Create .jira-loaderrc.json with your JIRA credentials
   jira-loader
   ```

### Local Package Installation

1. **Install in your project**:
   ```bash
   npm install @suffle/jira-ticket-loader
   ```

2. **Configure for your JIRA instance**:
   ```bash
   cp .jira-loaderrc.example.json .jira-loaderrc.json
   # Edit .jira-loaderrc.json with your JIRA details
   ```

3. **Add to your project's .gitignore**:
   ```gitignore
   jira-ticket-loader/.jira-loaderrc.json
   jira-ticket-loader/output/
   jira-ticket-loader/node_modules/
   ```

4. **Set up VS Code integration** (optional but recommended)

### Team Sharing

- Share the package directory structure
- Each team member creates their own `.jira-loaderrc.json`
- Templates can be customized per project
- VS Code tasks provide consistent team experience

## Development Guide

### Project Structure

```
jira-ticket-loader/
├── src/
│   ├── index.js          # Main CLI entry point & orchestration
│   ├── config.js         # Configuration management
│   ├── jira-client.js    # JIRA REST API client
│   └── template-engine.js # Template processing engine
├── templates/            # Built-in markdown templates
│   ├── ai-prompt-frontend.md
│   ├── ai-prompt-backend.md
│   ├── ai-prompt-qa.md
│   └── ai-prompt-devops.md
├── tests/               # Jest test suite
│   ├── config.test.js
│   ├── jira-client.test.js
│   ├── template-engine.test.js
│   └── integration.test.js
├── output/              # Generated files (gitignored)
├── .jira-loaderrc.json   # JIRA credentials (gitignored)
├── config.example.json  # Configuration template
└── package.json         # Package definition
```

### Key Modules

#### `src/index.js` - Main Application
- **Purpose**: CLI orchestration and user interaction
- **Key Classes**: `JiraTicketLoader`
- **Responsibilities**: Argument parsing, interactive prompts, workflow coordination

#### `src/config.js` - Configuration Management
- **Purpose**: JIRA credential management and path resolution
- **Key Classes**: `ConfigManager`
- **Responsibilities**: Config validation, default paths, credential loading

#### `src/jira-client.js` - JIRA Integration
- **Purpose**: JIRA REST API communication
- **Key Classes**: `JiraClient`
- **Responsibilities**: Authentication, ticket fetching, data transformation

#### `src/template-engine.js` - Template Processing
- **Purpose**: Markdown template processing with placeholder replacement
- **Key Classes**: `TemplateEngine`
- **Responsibilities**: Template parsing, conditional logic, data binding

### Testing

The project includes a comprehensive test suite with 39 tests:

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# Test specific template rendering
npm run test-templates
```

**Test Categories**:
- Unit tests for each module
- Integration tests for end-to-end workflows
- Template rendering tests with mock data
- Error handling and edge cases

### Adding Features

1. **New Template Placeholders**: Modify `src/jira-client.js` data transformation
2. **New Template Features**: Extend `src/template-engine.js` processing logic
3. **New CLI Options**: Update `src/index.js` argument parsing
4. **New Configuration**: Extend `src/config.js` validation

Always add tests for new features and run the full test suite before committing.

## Troubleshooting

### Common Issues

**"Authentication failed"**
- Verify your email and API token in `.jira-loaderrc.json`
- Check if the API token has expired
- Ensure your JIRA base URL is correct

**"Ticket not found" or "403 Forbidden"**
- Verify the ticket key format (e.g., "PROJ-123")
- Ensure you have read access to the JIRA project
- Check if the ticket exists and is visible to your account

**"Template not found"**
- Verify template name or file path
- Check if using custom template directory with `-p` option
- Ensure template file has `.md` extension

**"Module not found" errors**
- Run `npm install` in the package directory
- Ensure you're using Node.js 16+ (check with `node --version`)
- Verify the package path in your commands

### Development Issues

**Jest/Testing Issues**
- Ensure Node.js 16+ for ES modules support
- Tests require `NODE_OPTIONS=--experimental-vm-modules`
- Check `package.json` scripts for proper Jest configuration

**VS Code Integration Issues**
- Verify absolute paths in `tasks.json`
- Check if the package directory path is correct
- Ensure proper escaping in JSON configurations

### Debug Mode

Run with additional logging:

```bash
# Enable debug output
DEBUG=jira-ticket-loader node src/index.js -t PROJ-123 -e ai-prompt-frontend

# Test configuration
node src/index.js --help
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

For questions or issues, please create a GitHub issue with:
- Your Node.js version
- Complete error messages
- Steps to reproduce the problem