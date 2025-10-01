import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(__dirname, "..", "config.json");

const DEFAULT_CONFIG = {
  jiraBaseUrl: "",
  jiraApiKey: "",
  jiraEmail: "",
};

export class ConfigManager {
  constructor() {
    this.config = null;
  }

  async loadConfig() {
    try {
      if (await fs.pathExists(CONFIG_FILE)) {
        const configData = await fs.readJson(CONFIG_FILE);
        this.config = { ...DEFAULT_CONFIG, ...configData };
      } else {
        console.log("Creating default config.json file...");
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
    await fs.writeJson(CONFIG_FILE, DEFAULT_CONFIG, { spaces: 2 });
    console.log(
      `Created ${CONFIG_FILE} - please update it with your JIRA settings.`
    );
  }

  validateConfig() {
    const required = ["jiraBaseUrl", "jiraApiKey", "jiraEmail"];
    const missing = required.filter(key => !this.config[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required configuration: ${missing.join(
          ", "
        )}. Please update config.json`
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
