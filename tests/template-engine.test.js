/**
 * Template Engine Tests
 * Using Jest with ES modules
 */

// Import the class we want to test
import { TemplateEngine } from "../src/template-engine.js";

// Mock ticket data for testing
const mockTicket = {
  key: "TEST-123",
  id: "12345",
  summary: "Test ticket summary",
  description: "Test ticket description",
  status: "Open",
  statusCategory: "To Do",
  assignee: "John Doe",
  assigneeEmail: "john@example.com",
  reporter: "Jane Smith",
  reporterEmail: "jane@example.com",
  created: "2025-09-27T10:00:00.000Z",
  updated: "2025-09-27T14:00:00.000Z",
  issueType: "Bug",
  priority: "High",
  labels: ["frontend", "urgent"],
  components: ["UI", "API"],
  fixVersions: ["v2.1.0"],
  affectedVersions: ["v2.0.0"],
  url: "https://test.atlassian.net/browse/TEST-123",
};

const emptyTicket = {
  ...mockTicket,
  assignee: "",
  assigneeEmail: "",
  labels: [],
  components: [],
};

describe("TemplateEngine", () => {
  let templateEngine;

  beforeEach(() => {
    templateEngine = new TemplateEngine("./templates", "./output");
  });

  describe("processTemplate", () => {
    test("should replace basic placeholders", () => {
      const template =
        "# {{ticket.key}} - {{ticket.summary}}\\n**Status:** {{ticket.status}}";
      const result = templateEngine.processTemplate(template, mockTicket);

      expect(result).toContain("TEST-123 - Test ticket summary");
      expect(result).toContain("**Status:** Open");
    });

    test("should handle conditional blocks with truthy values", () => {
      const template =
        "{{#if ticket.assignee}}Assigned to: {{ticket.assignee}}{{/if}}";
      const result = templateEngine.processTemplate(template, mockTicket);

      expect(result).toContain("Assigned to: John Doe");
    });

    test("should hide conditional blocks with falsy values", () => {
      const template =
        "{{#if ticket.assignee}}Assigned to: {{ticket.assignee}}{{/if}}";
      const result = templateEngine.processTemplate(template, emptyTicket);

      expect(result).toBe("");
    });

    test("should process loop blocks with arrays", () => {
      const template = "{{#each ticket.labels}}\n- {{this}}{{/each}}";
      const result = templateEngine.processTemplate(template, mockTicket);

      expect(result).toContain("- frontend");
      expect(result).toContain("- urgent");
    });

    test("should handle empty arrays in loops", () => {
      const template = "{{#each ticket.labels}}\n- {{this}}{{/each}}";
      const result = templateEngine.processTemplate(template, emptyTicket);

      expect(result).toBe("");
    });

    test("should add computed date fields", () => {
      const template = "Generated on {{today}} at {{now}}";
      const result = templateEngine.processTemplate(template, mockTicket);

      expect(result).toMatch(/Generated on \w+ \d+, \d{4} at \w+ \d+, \d{4}/);
    });

    test("should handle arrays as comma-separated values", () => {
      const template = "Labels: {{ticket.labels}}";
      const result = templateEngine.processTemplate(template, mockTicket);

      expect(result).toContain("Labels: frontend, urgent");
    });

    test("should handle nested object access", () => {
      const template = "Email: {{ticket.assigneeEmail}}";
      const result = templateEngine.processTemplate(template, mockTicket);

      expect(result).toContain("Email: john@example.com");
    });

    test("should handle missing values gracefully", () => {
      const template = "Missing: {{ticket.nonexistent}}";
      const result = templateEngine.processTemplate(template, mockTicket);

      expect(result).toContain("Missing: ");
    });
  });

  describe("helper methods", () => {
    test("should get nested object values", () => {
      const obj = { ticket: { assignee: { name: "John" } } };
      const value = templateEngine.getNestedValue(obj, "ticket.assignee.name");
      expect(value).toBe("John");
    });

    test("should handle missing nested values", () => {
      const obj = { ticket: {} };
      const value = templateEngine.getNestedValue(obj, "ticket.assignee.name");
      expect(value).toBeUndefined();
    });

    test("should handle null objects", () => {
      const value = templateEngine.getNestedValue(null, "ticket.assignee");
      expect(value).toBeUndefined();
    });
  });

  describe("getAvailablePlaceholders", () => {
    test("should return comprehensive list of placeholders", () => {
      const placeholders = templateEngine.getAvailablePlaceholders();

      expect(placeholders).toContain("ticket.key");
      expect(placeholders).toContain("ticket.summary");
      expect(placeholders).toContain("ticket.description");
      expect(placeholders).toContain("ticket.assignee");
      expect(placeholders).toContain("today");
      expect(placeholders).toContain("now");
      expect(placeholders.length).toBeGreaterThan(15);
    });
  });

  describe("conditional processing", () => {
    test("should handle complex conditional templates", () => {
      const template = `
{{#if ticket.assignee}}
**Assignee:** {{ticket.assignee}}
{{/if}}
{{#if ticket.labels}}
**Labels:** {{ticket.labels}}
{{/if}}`;

      const result = templateEngine.processTemplate(template, mockTicket);

      expect(result).toContain("**Assignee:** John Doe");
      expect(result).toContain("**Labels:** frontend, urgent");
    });

    test("should handle nested conditionals", () => {
      const template = `
{{#if ticket.assignee}}
Assigned to: {{ticket.assignee}}
{{#if ticket.assigneeEmail}}
Email: {{ticket.assigneeEmail}}
{{/if}}
{{/if}}`;

      const result = templateEngine.processTemplate(template, mockTicket);

      expect(result).toContain("Assigned to: John Doe");
      expect(result).toContain("Email: john@example.com");
    });
  });

  describe("loop processing", () => {
    test("should handle multiple loops in same template", () => {
      const template = `
Labels:
{{#each ticket.labels}}
- {{this}}
{{/each}}

Components:
{{#each ticket.components}}
- {{this}}
{{/each}}`;

      const result = templateEngine.processTemplate(template, mockTicket);

      expect(result).toContain("- frontend");
      expect(result).toContain("- urgent");
      expect(result).toContain("- UI");
      expect(result).toContain("- API");
    });
  });
});
