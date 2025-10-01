/**
 * Config Manager Tests
 */

import { ConfigManager } from "../src/config.js";

describe("ConfigManager", () => {
  let configManager;

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  describe("validateConfig", () => {
    test("should pass validation for valid config", () => {
      configManager.config = {
        jiraBaseUrl: "https://test.atlassian.net",
        jiraApiKey: "test-api-key",
        jiraEmail: "test@example.com",
      };

      expect(() => configManager.validateConfig()).not.toThrow();
    });

    test("should reject config with missing required fields", () => {
      configManager.config = {
        jiraBaseUrl: "",
        jiraApiKey: "test-api-key",
        jiraEmail: "test@example.com",
      };

      expect(() => configManager.validateConfig()).toThrow(
        "Missing required configuration"
      );
    });

    test("should reject config with invalid URL", () => {
      configManager.config = {
        jiraBaseUrl: "not-a-url",
        jiraApiKey: "test-api-key",
        jiraEmail: "test@example.com",
      };

      expect(() => configManager.validateConfig()).toThrow(
        "Invalid jiraBaseUrl"
      );
    });

    test("should reject config with invalid email", () => {
      configManager.config = {
        jiraBaseUrl: "https://test.atlassian.net",
        jiraApiKey: "test-api-key",
        jiraEmail: "invalid-email",
      };

      expect(() => configManager.validateConfig()).toThrow("Invalid jiraEmail");
    });
  });

  describe("getConfig", () => {
    test("should return config when loaded", () => {
      const testConfig = {
        jiraBaseUrl: "https://test.atlassian.net",
        jiraApiKey: "test-api-key",
        jiraEmail: "test@example.com",
      };

      configManager.config = testConfig;
      expect(configManager.getConfig()).toEqual(testConfig);
    });

    test("should throw error when config not loaded", () => {
      expect(() => configManager.getConfig()).toThrow(
        "Configuration not loaded"
      );
    });
  });

  describe("default paths", () => {
    test("should provide default output path", () => {
      const outputPath = configManager.getDefaultOutputPath();
      expect(outputPath).toContain("output");
    });
  });
});
