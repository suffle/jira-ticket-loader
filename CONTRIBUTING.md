# Contributing to JIRA Ticket Loader

Thank you for your interest in contributing to JIRA Ticket Loader! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/suffle/jira-ticket-loader.git
   cd jira-ticket-loader
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your development environment**:
   ```bash
   # Create a config.json file for testing
   cp config.example.json config.json
   # Edit config.json with your JIRA credentials
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Test the CLI locally**:
   ```bash
   npm link
   jira-loader --help
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding guidelines below

3. **Add or update tests** for your changes

4. **Run the test suite**:
   ```bash
   npm test
   npm run test:coverage
   ```

5. **Test the CLI manually**:
   ```bash
   npm run dev  # Run with file watching
   # or
   jira-loader  # Test global command
   ```

### Coding Guidelines

- **ES Modules**: Use modern JavaScript ES module syntax
- **Error Handling**: Always provide clear, user-friendly error messages
- **Documentation**: Update README.md for any new features
- **Tests**: Maintain test coverage above 70%
- **Code Style**: Follow the existing code style and patterns

### Testing

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **CLI Testing**: Test command-line interface manually
- **Template Testing**: Test with various template configurations

Run tests with:
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

## Types of Contributions

### Bug Reports

When reporting bugs, please include:
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment (Node.js version, OS)
- Error messages (full stack trace if applicable)
- Your config.json structure (without credentials)

### Feature Requests

For new features, please:
- Describe the problem you're trying to solve
- Explain your proposed solution
- Consider backward compatibility
- Provide examples of how it would be used

### Code Contributions

#### Areas for Contribution

1. **New Template Features**:
   - Additional placeholder types
   - Enhanced conditional logic
   - New template processing capabilities

2. **JIRA Integration**:
   - Support for additional JIRA fields
   - Custom field processing
   - Different JIRA authentication methods

3. **CLI Improvements**:
   - New command-line options
   - Better error messages
   - Enhanced user experience

4. **Template Library**:
   - New built-in templates
   - Industry-specific templates
   - Template validation tools

#### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch** from `main`
3. **Make your changes** with appropriate tests
4. **Update documentation** as needed
5. **Ensure all tests pass**
6. **Submit a pull request** with:
   - Clear description of changes
   - Link to any related issues
   - Screenshots for UI changes (if applicable)

## Project Structure

```
src/
├── index.js          # Main CLI application and orchestration
├── config.js         # Configuration management
├── jira-client.js    # JIRA REST API integration
└── template-engine.js # Template processing engine

templates/            # Built-in template library
tests/               # Test suite
├── config.test.js
├── jira-client.test.js
└── template-engine.test.js
```

### Key Components

- **ConfigManager**: Handles JIRA credentials and validation
- **JiraClient**: JIRA API communication and data transformation
- **TemplateEngine**: Markdown template processing with placeholders
- **JiraTicketLoader**: Main application orchestration and CLI

## Release Process

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with new features and fixes
3. **Run full test suite**: `npm test`
4. **Test package build**: `npm pack --dry-run`
5. **Create pull request** for review
6. **After merge**: Tag release and publish to npm

## Getting Help

- **Issues**: Create a GitHub issue for bugs or questions
- **Discussions**: Use GitHub Discussions for general questions
- **Documentation**: Check the README.md for usage examples

## Code of Conduct

Please be respectful and constructive in all interactions. We're building this tool to help developers be more productive, and we want the development experience to be positive for everyone involved.

## License

By contributing to JIRA Ticket Loader, you agree that your contributions will be licensed under the MIT License.