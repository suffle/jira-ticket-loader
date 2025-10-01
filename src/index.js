#!/usr/bin/env node

import inquirer from "inquirer";
import path from "path";
import { ConfigManager } from "./config.js";
import { JiraClient } from "./jira-client.js";
import { TemplateEngine } from "./template-engine.js";

class JiraTicketLoader {
  constructor(options = {}) {
    this.configManager = new ConfigManager(options.configPath);
    this.config = null;
    this.jiraClient = null;
    this.templateEngine = null;

    // CLI options for non-interactive mode
    this.options = {
      ticketKey: options.ticketKey,
      template: options.template,
      templatePath: options.templatePath,
      outputPath: options.outputPath,
      configPath: options.configPath,
      silent: options.silent || false,
      interactive: !options.ticketKey || !options.template, // Interactive if missing required params
    };
  }

  getDefaultOutputPath() {
    return this.options.outputPath || path.resolve(process.cwd(), "output");
  }

  log(message) {
    if (!this.options.silent) {
      console.log(message);
    }
  }

  async initialize() {
    try {
      if (!this.options.silent) {
        this.log("🚀 JIRA Ticket Loader");
        this.log("====================\\n");
      }

      // Load configuration
      if (!this.options.silent) {
        this.log("Loading configuration...");
      }
      this.config = await this.configManager.loadConfig();

      // Initialize clients
      this.jiraClient = new JiraClient(this.config);

      // Template engine will be initialized when we know the template path
      if (!this.options.interactive && this.options.templatePath) {
        this.templateEngine = new TemplateEngine(
          this.options.templatePath,
          this.getDefaultOutputPath()
        );
      }

      // Test JIRA connection
      if (!this.options.silent) {
        this.log("Testing JIRA connection...");
      }
      const connectionTest = await this.jiraClient.testConnection();

      if (!connectionTest.success) {
        throw new Error(connectionTest.error);
      }

      if (!this.options.silent) {
        this.log(`✓ Connected to JIRA as: ${connectionTest.user.displayName}`);
        this.log();
      }

      return true;
    } catch (error) {
      console.error("❌ Initialization failed:", error.message);

      if (error.message.includes(".jira-loaderrc.json")) {
        console.log(
          "\\n💡 Please update your .jira-loaderrc.json file with the correct JIRA settings."
        );
        console.log("   Example configuration:");
        console.log("   {");
        console.log(
          '     "jiraBaseUrl": "https://your-company.atlassian.net",'
        );
        console.log('     "jiraApiKey": "your-api-token",');
        console.log('     "jiraEmail": "your-email@company.com",');
        console.log('     "templatePath": "./templates",');
        console.log('     "outputPath": "./output"');
        console.log("   }\\n");
      }

      return false;
    }
  }

  async selectTemplate() {
    try {
      // If template provided via CLI, handle it as a file path
      if (this.options.template) {
        // Template path is required when template is specified
        if (!this.options.templatePath) {
          throw new Error("Template path (-p/--template-path) is required when using template (-e/--template)");
        }

        this.templateEngine = new TemplateEngine(
          this.options.templatePath,
          this.getDefaultOutputPath()
        );

        // Check if it's a direct file path
        if (this.options.template.endsWith(".md")) {
          if (!this.options.silent) {
            this.log(`Using template file: ${this.options.template}`);
          }
          return this.options.template;
        }

        // Otherwise treat it as a template name and look for it
        const templates = await this.templateEngine.getAvailableTemplates();
        const selectedTemplate = templates.find(
          t =>
            t.name === this.options.template ||
            t.displayName === this.options.template ||
            t.name === `${this.options.template}.md`
        );

        if (!selectedTemplate) {
          throw new Error(
            `Template "${
              this.options.template
            }" not found in ${this.options.templatePath}. Available: ${templates
              .map(t => t.displayName)
              .join(", ")}`
          );
        }

        if (!this.options.silent) {
          this.log(`Using template: ${selectedTemplate.displayName}`);
        }
        return selectedTemplate.name;
      }

      // Interactive mode - ask for template directory first, then template
      const templateDirAnswer = await inquirer.prompt([
        {
          type: "input",
          name: "templatePath",
          message: "Enter template directory path:",
          validate: async input => {
            const fs = await import("fs-extra");
            if (!(await fs.pathExists(input))) {
              return "Directory does not exist";
            }
            return true;
          },
        },
      ]);

      this.templateEngine = new TemplateEngine(
        templateDirAnswer.templatePath,
        this.getDefaultOutputPath()
      );

      const templates = await this.templateEngine.getAvailableTemplates();

      if (templates.length === 1) {
        this.log(`Using template: ${templates[0].displayName}`);
        return templates[0].name;
      }

      const answer = await inquirer.prompt([
        {
          type: "list",
          name: "template",
          message: "Select a template:",
          choices: templates.map(t => ({
            name: `${t.displayName} (${t.name})`,
            value: t.name,
          })),
        },
      ]);

      return answer.template;
    } catch (error) {
      throw new Error(`Template selection failed: ${error.message}`);
    }
  }

  async getTicketKey() {
    // If ticket key provided via CLI, validate and use it
    if (this.options.ticketKey) {
      const trimmed = this.options.ticketKey.trim();
      if (!trimmed) {
        throw new Error("Ticket key cannot be empty");
      }
      // Basic validation for JIRA ticket format
      if (!/^[A-Z][A-Z0-9_]*-\d+$/i.test(trimmed)) {
        throw new Error("Invalid ticket key format. Expected format: PROJ-123");
      }

      if (!this.options.silent) {
        this.log(`Using ticket: ${trimmed.toUpperCase()}`);
      }
      return trimmed.toUpperCase();
    }

    // Interactive mode
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "ticketKey",
        message: "Enter JIRA ticket key (e.g., PROJ-123):",
        validate: input => {
          const trimmed = input.trim();
          if (!trimmed) {
            return "Please enter a ticket key";
          }
          // Basic validation for JIRA ticket format - project key (letters/numbers) followed by dash and number
          if (!/^[A-Z][A-Z0-9_]*-\d+$/i.test(trimmed)) {
            return "Please enter a valid ticket key format (e.g., PROJ-123, SCRUM-1)";
          }
          return true;
        },
        filter: input => input.trim().toUpperCase(),
      },
    ]);

    return answer.ticketKey;
  }

  async processTicket() {
    try {
      // Select template
      const templateName = await this.selectTemplate();

      // Get ticket key
      const ticketKey = await this.getTicketKey();

      if (!this.options.silent) {
        this.log("\\n📥 Processing ticket...");
      }

      // Fetch ticket data
      const ticketData = await this.jiraClient.getTicket(ticketKey);

      // Process template
      const result = await this.templateEngine.processTicket(
        templateName,
        ticketData
      );

      if (result.success) {
        if (!this.options.silent) {
          this.log("\\n✅ Success!");
          this.log(`   Template: ${result.templateName}`);
          this.log(`   Ticket: ${result.ticketKey}`);
          this.log(`   Output: ${result.outputPath}`);
        }

        // Return result for programmatic use
        return {
          success: true,
          templateName: result.templateName,
          ticketKey: result.ticketKey,
          outputPath: result.outputPath,
          continue: false, // In non-interactive mode, don't continue
        };
      } else {
        if (!this.options.silent) {
          console.error("\\n❌ Processing failed:", result.error);
        }
        return {
          success: false,
          error: result.error,
          continue: false,
        };
      }
    } catch (error) {
      if (!this.options.silent) {
        console.error("\\n❌ Error processing ticket:", error.message);
      }
      return {
        success: false,
        error: error.message,
        continue: false,
      };
    }
  }

  async processTicketInteractive() {
    try {
      const result = await this.processTicket();

      if (result.success) {
        this.log("\\n✅ Success!");
        this.log(`   Template: ${result.templateName}`);
        this.log(`   Ticket: ${result.ticketKey}`);
        this.log(`   Output: ${result.outputPath}`);

        // Ask if user wants to process another ticket
        const continueAnswer = await inquirer.prompt([
          {
            type: "confirm",
            name: "continue",
            message: "Process another ticket?",
            default: false,
          },
        ]);

        return continueAnswer.continue;
      } else {
        console.error("\\n❌ Processing failed:", result.error);
        return false;
      }
    } catch (error) {
      console.error("\\n❌ Error processing ticket:", error.message);
      return false;
    }
  }

  async showHelp() {
    console.log("\\n📖 Available placeholders for templates:");
    console.log("==========================================");

    const placeholders = this.templateEngine.getAvailablePlaceholders();
    const grouped = {
      "Basic Info": [
        "ticket.key",
        "ticket.summary",
        "ticket.description",
        "ticket.url",
      ],
      "Status & Type": [
        "ticket.status",
        "ticket.statusCategory",
        "ticket.issueType",
        "ticket.priority",
      ],
      People: [
        "ticket.assignee",
        "ticket.assigneeEmail",
        "ticket.reporter",
        "ticket.reporterEmail",
      ],
      Dates: ["ticket.created", "ticket.updated", "today", "now"],
      Arrays: [
        "ticket.labels",
        "ticket.components",
        "ticket.fixVersions",
        "ticket.affectedVersions",
      ],
    };

    for (const [category, items] of Object.entries(grouped)) {
      console.log(`\\n${category}:`);
      items.forEach(item => {
        console.log(`  {{${item}}}`);
      });
    }

    console.log("\\nConditional blocks:");
    console.log("  {{#if ticket.assignee}}...{{/if}}");

    console.log("\\nLoop blocks:");
    console.log("  {{#each ticket.labels}}{{this}}{{/each}}");
    console.log();
  }

  async run() {
    try {
      // Initialize the application
      const initialized = await this.initialize();
      if (!initialized) {
        process.exit(1);
      }

      // If not interactive (all params provided), run once and exit
      if (!this.options.interactive) {
        const result = await this.processTicket();
        if (result.success) {
          if (!this.options.silent) {
            this.log(`✅ Generated: ${result.outputPath}`);
          }
          process.exit(0);
        } else {
          console.error(`❌ Failed: ${result.error}`);
          process.exit(1);
        }
      }

      // Interactive mode - main loop
      let continueProcessing = true;

      while (continueProcessing) {
        const action = await inquirer.prompt([
          {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
              { name: "📝 Process a ticket", value: "process" },
              { name: "📖 Show template help", value: "help" },
              { name: "🚪 Exit", value: "exit" },
            ],
          },
        ]);

        switch (action.action) {
          case "process":
            const result = await this.processTicketInteractive();
            continueProcessing = result.continue;
            break;
          case "help":
            await this.showHelp();
            break;
          case "exit":
            continueProcessing = false;
            break;
        }
      }

      this.log("\\n👋 Goodbye!");
    } catch (error) {
      console.error("\\n💥 Unexpected error:", error.message);
      process.exit(1);
    }
  }
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--ticket":
      case "-t":
        options.ticketKey = args[++i];
        break;
      case "--template":
      case "-e":
        options.template = args[++i];
        break;
      case "--template-path":
      case "-p":
        options.templatePath = args[++i];
        break;
      case "--output":
      case "-o":
        options.outputPath = args[++i];
        break;
      case "--config":
      case "-c":
        options.configPath = args[++i];
        break;
      case "--silent":
      case "-s":
        options.silent = true;
        break;
      case "--help":
      case "-h":
        showHelp();
        process.exit(0);
        break;
      default:
        if (arg.startsWith("-")) {
          console.error(`Unknown option: ${arg}`);
          showHelp();
          process.exit(1);
        }
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🎯 JIRA Ticket Loader

USAGE:
  jira-loader [options]

OPTIONS:
  -t, --ticket <key>        JIRA ticket key (e.g., PROJ-123)
  -e, --template <name>     Template name or file path (e.g., my-template.md or /path/to/template.md)
  -p, --template-path <dir> Template directory path (required with -e)
  -o, --output <path>       Output directory (default: ./output)
  -c, --config <path>       Config file path (default: ./.jira-loaderrc.json)
  -s, --silent             Silent mode (no console output)
  -h, --help               Show this help

MODES:
  Interactive mode:         jira-loader
  Non-interactive mode:     jira-loader -t PROJ-123 -e my-template.md -p ./templates

EXAMPLES:
  # Interactive mode
  jira-loader

  # Use template from directory
  jira-loader --ticket PROJ-123 --template my-template.md --template-path ./templates

  # Use specific template file
  jira-loader -t PROJ-123 -e /path/to/my-template.md -p ./

  # Use templates from custom directory
  jira-loader -t PROJ-123 -e frontend-template.md -p /custom/templates

  # Silent mode for automation
  jira-loader -t PROJ-123 -e my-template.md -p ./templates -s

  # Custom output directory
  jira-loader -t PROJ-123 -e my-template.md -p ./templates -o ./docs/jira-tickets

  # Custom config file
  jira-loader -t PROJ-123 -e my-template.md -p ./templates -c /path/to/custom-config.json
`);
}

// Run the application
const options = parseArgs();
const app = new JiraTicketLoader(options);
app.run().catch(error => {
  console.error("💥 Fatal error:", error.message);
  process.exit(1);
});
