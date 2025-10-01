import fs from "fs-extra";
import path from "path";

const DEFAULT_CONFIG = {
  jiraBaseUrl: "",
  jiraApiKey: "",
  jiraEmail: "",
};

export class ConfigManager {
  constructor(configPath = null) {
    this.config = null;
    this.configPath = configPath || path.join(process.cwd(), ".jira-loaderrc.json");
  }

  async loadConfig() {
    try {
      if (await fs.pathExists(this.configPath)) {
        const configData = await fs.readJson(this.configPath);
        this.config = { ...DEFAULT_CONFIG, ...configData };
      } else {
        console.log(`Creating default .jira-loaderrc.json file at ${this.configPath}...`);
        await this.createDefaultConfig();
        this.config = DEFAULT_CONFIG;
      }

      this.validateConfig();
      return this.config;
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  async createDefaultConfig() {
    await fs.writeJson(this.configPath, DEFAULT_CONFIG, { spaces: 2 });
    console.log(
      `Created ${this.configPath} - please update it with your JIRA settings.`
    );
  }

  validateConfig() {
    const required = ["jiraBaseUrl", "jiraApiKey", "jiraEmail"];
    const missing = required.filter(key => !this.config[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required configuration: ${missing.join(
          ", "
        )}. Please update ${this.configPath}`
      );
    }

    // Validate URL format
    try {
      new URL(this.config.jiraBaseUrl);
    } catch {
      throw new Error("Invalid jiraBaseUrl - must be a valid URL");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.config.jiraEmail)) {
      throw new Error("Invalid jiraEmail - must be a valid email address");
    }
  }

  getConfig() {
    if (!this.config) {
      throw new Error("Configuration not loaded. Call loadConfig() first.");
    }
    return this.config;
  }

  getDefaultTemplatePath() {
    return path.resolve(process.cwd(), "templates");
  }

  getDefaultOutputPath() {
    return path.resolve(process.cwd(), "output");
  }
}
