import fs from "fs-extra";
import path from "path";

export class TemplateEngine {
  constructor(templatePath, outputPath) {
    this.templatePath = templatePath;
    this.outputPath = outputPath;
  }

  async getAvailableTemplates() {
    try {
      if (!(await fs.pathExists(this.templatePath))) {
        throw new Error(
          `Template directory does not exist: ${this.templatePath}`
        );
      }

      const files = await fs.readdir(this.templatePath);
      const templates = files
        .filter(file => file.endsWith(".md"))
        .map(file => ({
          name: file,
          displayName: path.basename(file, ".md"),
          path: path.join(this.templatePath, file),
        }));

      if (templates.length === 0) {
        throw new Error(`No markdown templates found in: ${this.templatePath}`);
      }

      return templates;
    } catch (error) {
      throw new Error(`Failed to read templates: ${error.message}`);
    }
  }

  async loadTemplate(templateName) {
    try {
      let templatePath;

      // Check if templateName is already an absolute path or relative path with directory separators
      if (
        path.isAbsolute(templateName) ||
        templateName.includes("/") ||
        templateName.includes("\\")
      ) {
        // Use the path as-is for custom template files
        templatePath = path.resolve(templateName);
      } else {
        // Join with template directory for template names
        templatePath = path.join(this.templatePath, templateName);
      }

      if (!(await fs.pathExists(templatePath))) {
        throw new Error(`Template not found: ${templatePath}`);
      }

      const content = await fs.readFile(templatePath, "utf-8");
      return content;
    } catch (error) {
      throw new Error(
        `Failed to load template ${templateName}: ${error.message}`
      );
    }
  }

  processTemplate(templateContent, ticketData) {
    try {
      let processed = templateContent;

      // Replace ticket data placeholders
      const replacements = {
        "ticket.key": ticketData.key,
        "ticket.id": ticketData.id,
        "ticket.summary": ticketData.summary,
        "ticket.description": ticketData.description,
        "ticket.status": ticketData.status,
        "ticket.statusCategory": ticketData.statusCategory,
        "ticket.assignee": ticketData.assignee,
        "ticket.assigneeEmail": ticketData.assigneeEmail,
        "ticket.reporter": ticketData.reporter,
        "ticket.reporterEmail": ticketData.reporterEmail,
        "ticket.created": ticketData.created,
        "ticket.updated": ticketData.updated,
        "ticket.issueType": ticketData.issueType,
        "ticket.priority": ticketData.priority,
        "ticket.url": ticketData.url,

        // Array fields - join with commas
        "ticket.labels": ticketData.labels.join(", "),
        "ticket.components": ticketData.components.join(", "),
        "ticket.fixVersions": ticketData.fixVersions.join(", "),
        "ticket.affectedVersions": ticketData.affectedVersions.join(", "),

        // Additional computed fields
        today: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        now: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Replace all placeholders
      for (const [key, value] of Object.entries(replacements)) {
        const placeholder = new RegExp(
          `{{\\s*${key.replace(".", "\\.")}\\s*}}`,
          "g"
        );
        processed = processed.replace(placeholder, value || "");
      }

      // Handle conditional sections
      processed = this.processConditionals(processed, ticketData);

      // Handle loops/iterations
      processed = this.processLoops(processed, ticketData);

      return processed;
    } catch (error) {
      throw new Error(`Failed to process template: ${error.message}`);
    }
  }

  processConditionals(content, ticketData) {
    // Handle {{#if ticket.assignee}} ... {{/if}} blocks
    const ifPattern = /{{#if\s+(\w+(?:\.\w+)*)}}\s*([\s\S]*?)\s*{{\/if}}/g;

    return content.replace(ifPattern, (match, condition, block) => {
      const value = this.getNestedValue(
        ticketData,
        condition.replace("ticket.", "")
      );

      // Check if value exists and is not empty
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        return block;
      }
      return "";
    });
  }

  processLoops(content, ticketData) {
    // Handle {{#each ticket.labels}} ... {{/each}} blocks
    const eachPattern = /{{#each\s+(\w+(?:\.\w+)*)}}\n([\s\S]*?){{\/each}}/g;

    return content.replace(eachPattern, (match, arrayPath, block) => {
      const array = this.getNestedValue(
        ticketData,
        arrayPath.replace("ticket.", "")
      );

      if (!Array.isArray(array) || array.length === 0) {
        return "";
      }

      // Process each item and preserve the block structure
      const processedItems = array.map(item => {
        // Replace {{this}} with the current item
        return block.replace(/{{\s*this\s*}}/g, item);
      });

      // Join without adding extra content, the block already contains formatting
      return processedItems.join("").trimEnd();
    });
  }

  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  async saveOutput(content, ticketKey, templateName) {
    try {
      // Ensure output directory exists
      await fs.ensureDir(this.outputPath);

      // Generate filename
      const templateBaseName = path.basename(templateName, ".md");
      const filename = `${ticketKey}-${templateBaseName}.md`;
      const outputPath = path.join(this.outputPath, filename);

      // Write the file
      await fs.writeFile(outputPath, content, "utf-8");

      console.log(`✓ Generated: ${outputPath}`);
      return outputPath;
    } catch (error) {
      throw new Error(`Failed to save output: ${error.message}`);
    }
  }

  async processTicket(templateName, ticketData) {
    try {
      console.log(`Processing template: ${templateName}`);

      // Load template
      const templateContent = await this.loadTemplate(templateName);

      // Process template with ticket data
      const processedContent = this.processTemplate(
        templateContent,
        ticketData
      );

      // Save output
      const outputPath = await this.saveOutput(
        processedContent,
        ticketData.key,
        templateName
      );

      return {
        success: true,
        outputPath,
        templateName,
        ticketKey: ticketData.key,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        templateName,
        ticketKey: ticketData?.key,
      };
    }
  }

  getAvailablePlaceholders() {
    return [
      "ticket.key",
      "ticket.id",
      "ticket.summary",
      "ticket.description",
      "ticket.status",
      "ticket.statusCategory",
      "ticket.assignee",
      "ticket.assigneeEmail",
      "ticket.reporter",
      "ticket.reporterEmail",
      "ticket.created",
      "ticket.updated",
      "ticket.issueType",
      "ticket.priority",
      "ticket.labels",
      "ticket.components",
      "ticket.fixVersions",
      "ticket.affectedVersions",
      "ticket.url",
      "today",
      "now",
    ];
  }
}
