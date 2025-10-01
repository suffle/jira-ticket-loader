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
    test("should extract text from simple nodes", () => {
      const node = { text: "Hello World" };
      const result = jiraClient.extractText(node);
      expect(result).toBe("Hello World");
    });

    test("should extract text from nested nodes", () => {
      const node = {
        content: [{ text: "Hello " }, { text: "World" }],
      };
      const result = jiraClient.extractText(node);
      expect(result).toBe("Hello World");
    });

    test("should handle empty nodes", () => {
      expect(jiraClient.extractText(null)).toBe("");
      expect(jiraClient.extractText({})).toBe("");
      expect(jiraClient.extractText({ content: [] })).toBe("");
    });
  });

  describe("ADF conversion helpers", () => {
    test("should convert paragraphs with formatting", () => {
      const node = {
        content: [
          {
            type: "text",
            text: "Bold text",
            marks: [{ type: "strong" }],
          },
          {
            type: "text",
            text: " and ",
          },
          {
            type: "text",
            text: "italic text",
            marks: [{ type: "em" }],
          },
        ],
      };

      const result = jiraClient.convertParagraph(node);
      expect(result).toContain("**Bold text**");
      expect(result).toContain("*italic text*");
    });

    test("should convert code blocks", () => {
      const node = {
        content: [
          {
            type: "text",
            text: 'console.log("hello");',
          },
        ],
      };

      const result = jiraClient.extractText(node);
      expect(result).toBe('console.log("hello");');
    });

    test("should convert lists", () => {
      const node = {
        content: [
          { content: [{ type: "text", text: "Item 1" }] },
          { content: [{ type: "text", text: "Item 2" }] },
        ],
      };

      const result = jiraClient.convertList(node, "-");
      expect(result).toContain("- Item 1");
      expect(result).toContain("- Item 2");
    });
  });
});
