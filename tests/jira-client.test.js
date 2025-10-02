/**
 * JIRA Client Tests
 */

import { JiraClient } from "../src/jira-client.js";

const mockConfig = {
  jiraBaseUrl: "https://test.atlassian.net",
  jiraApiKey: "test-api-key",
  jiraEmail: "test@example.com",
};

describe("JiraClient", () => {
  let jiraClient;

  beforeEach(() => {
    jiraClient = new JiraClient(mockConfig);
  });

  describe("constructor", () => {
    test("should handle trailing slash in base URL", () => {
      const configWithSlash = {
        ...mockConfig,
        jiraBaseUrl: "https://test.atlassian.net/",
      };

      const client = new JiraClient(configWithSlash);
      expect(client.baseUrl).toBe("https://test.atlassian.net");
    });

    test("should store configuration correctly", () => {
      expect(jiraClient.baseUrl).toBe("https://test.atlassian.net");
      expect(jiraClient.email).toBe("test@example.com");
      expect(jiraClient.apiKey).toBe("test-api-key");
    });
  });

  describe("date formatting", () => {
    test("should format dates correctly", () => {
      const dateString = "2025-09-27T10:30:00.000Z";
      const result = jiraClient.formatDate(dateString);

      expect(result).toMatch(/September \d+, 2025/);
      expect(result).toContain("7:30");
    });

    test("should handle empty date strings", () => {
      expect(jiraClient.formatDate("")).toBe("");
      expect(jiraClient.formatDate(null)).toBe("");
      expect(jiraClient.formatDate(undefined)).toBe("");
    });

    test("should handle invalid dates gracefully", () => {
      const result = jiraClient.formatDate("invalid-date");
      expect(result).toMatch(/Invalid Date|NaN/);
    });
  });

  describe("description conversion", () => {
    test("should handle string descriptions", () => {
      const result = jiraClient.convertDescription("Simple string description");
      expect(result).toBe("Simple string description");
    });

    test("should handle empty descriptions", () => {
      expect(jiraClient.convertDescription(null)).toBe("");
      expect(jiraClient.convertDescription("")).toBe("");
      expect(jiraClient.convertDescription(undefined)).toBe("");
    });

    test("should handle ADF paragraph conversion", () => {
      const adfContent = {
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Test paragraph" }],
          },
        ],
      };

      const result = jiraClient.convertDescription(adfContent);
      expect(result).toContain("Test paragraph");
    });

    test("should handle complex ADF with headings", () => {
      const adfContent = {
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Main Title" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Some content" }],
          },
        ],
      };

      const result = jiraClient.convertDescription(adfContent);
      expect(result).toContain("# Main Title");
      expect(result).toContain("Some content");
    });
  });

  describe("text extraction", () => {
    test("should extract text fallback from simple nodes", () => {
      const node = { text: "Hello World" };
      const result = jiraClient.extractTextFallback(node);
      expect(result).toBe("Hello World");
    });

    test("should extract text fallback from nested nodes", () => {
      const node = {
        content: [{ text: "Hello " }, { text: "World" }],
      };
      const result = jiraClient.extractTextFallback(node);
      expect(result).toBe("Hello \nWorld");
    });

    test("should handle empty nodes in fallback", () => {
      expect(jiraClient.extractTextFallback(null)).toBe("");
      expect(jiraClient.extractTextFallback({})).toBe("");
      expect(jiraClient.extractTextFallback({ content: [] })).toBe("");
    });
  });

  describe("ADF conversion", () => {
    test("should convert simple ADF to markdown using comprehensive parser", () => {
      const adf = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Hello World" }
            ]
          }
        ]
      };

      const result = jiraClient.convertDescription(adf);
      expect(result).toContain("Hello World");
    });

    test("should handle ADF with links using comprehensive parser", () => {
      const adf = {
        type: "doc", 
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Visit our site",
                marks: [
                  {
                    type: "link",
                    attrs: { href: "https://example.com" }
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = jiraClient.convertDescription(adf);
      expect(result).toContain("Visit our site");
      expect(result).toContain("https://example.com");
    });

    test("should handle string descriptions", () => {
      const description = "Plain text description";
      const result = jiraClient.convertDescription(description);
      expect(result).toBe("Plain text description");
    });

    test("should handle empty/null descriptions", () => {
      expect(jiraClient.convertDescription(null)).toBe("");
      expect(jiraClient.convertDescription("")).toBe("");
      expect(jiraClient.convertDescription({})).toBe("");
    });

    test("should fallback gracefully on parser errors", () => {
      // Mock the parser to throw an error
      const originalParser = jiraClient.adfParser;
      jiraClient.adfParser = {
        adfToMarkdown: () => { throw new Error("Parser error"); }
      };

      const adf = {
        type: "doc",
        version: 1, 
        content: [
          { type: "text", text: "Fallback test" }
        ]
      };

      const result = jiraClient.convertDescription(adf);
      expect(result).toContain("Fallback test");
      
      // Restore original parser
      jiraClient.adfParser = originalParser;
    });
  });
});
