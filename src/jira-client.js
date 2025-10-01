import axios from "axios";

export class JiraClient {
  constructor(config) {
    this.baseUrl = config.jiraBaseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.email = config.jiraEmail;
    this.apiKey = config.jiraApiKey;

    // Create authenticated axios instance
    this.client = axios.create({
      baseURL: `${this.baseUrl}/rest/api/3`,
      timeout: 30000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      auth: {
        username: this.email,
        password: this.apiKey,
      },
    });

    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const message =
            error.response.data?.errorMessages?.[0] ||
            error.response.statusText;

          switch (status) {
            case 401:
              throw new Error(
                "Authentication failed. Please check your email and API key."
              );
            case 403:
              throw new Error(
                "Permission denied. You may not have access to this ticket."
              );
            case 404:
              throw new Error("Ticket not found. Please check the ticket key.");
            default:
              throw new Error(`JIRA API error (${status}): ${message}`);
          }
        } else if (error.request) {
          // Request was made but no response received
          throw new Error(
            "Unable to connect to JIRA. Please check your network connection and JIRA URL."
          );
        } else {
          // Something else happened
          throw new Error(`Request error: ${error.message}`);
        }
      }
    );
  }

  async testConnection() {
    try {
      const response = await this.client.get("/myself");
      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getTicket(ticketKey) {
    try {
      console.log(`Fetching ticket: ${ticketKey}...`);

      const response = await this.client.get(`/issue/${ticketKey}`, {
        params: {
          expand: "names,schema",
          fields: [
            "summary",
            "description",
            "status",
            "assignee",
            "reporter",
            "created",
            "updated",
            "issuetype",
            "priority",
            "labels",
            "components",
            "fixVersions",
            "versions",
          ].join(","),
        },
      });

      const issue = response.data;

      // Transform the response into a more user-friendly format
      const ticket = {
        key: issue.key,
        id: issue.id,
        summary: issue.fields.summary || "",
        description: this.convertDescription(issue.fields.description),
        status: issue.fields.status?.name || "",
        statusCategory: issue.fields.status?.statusCategory?.name || "",
        assignee: issue.fields.assignee?.displayName || "Unassigned",
        assigneeEmail: issue.fields.assignee?.emailAddress || "",
        reporter: issue.fields.reporter?.displayName || "",
        reporterEmail: issue.fields.reporter?.emailAddress || "",
        created: this.formatDate(issue.fields.created),
        updated: this.formatDate(issue.fields.updated),
        issueType: issue.fields.issuetype?.name || "",
        priority: issue.fields.priority?.name || "",
        labels: issue.fields.labels || [],
        components: issue.fields.components?.map(c => c.name) || [],
        fixVersions: issue.fields.fixVersions?.map(v => v.name) || [],
        affectedVersions: issue.fields.versions?.map(v => v.name) || [],
        url: `${this.baseUrl}/browse/${issue.key}`,
      };

      console.log(
        `Successfully fetched ticket: ${ticket.key} - ${ticket.summary}`
      );
      return ticket;
    } catch (error) {
      throw new Error(`Failed to fetch ticket ${ticketKey}: ${error.message}`);
    }
  }

  convertDescription(description) {
    if (!description) return "";

    // Basic ADF (Atlassian Document Format) to Markdown conversion
    // This is a simplified converter - you might want to use a proper ADF parser for complex content
    if (typeof description === "object" && description.content) {
      return this.convertADFToMarkdown(description);
    }

    // If it's already a string, return as-is
    return description;
  }

  convertADFToMarkdown(adf) {
    if (!adf || !adf.content) return "";

    return adf.content
      .map(node => {
        switch (node.type) {
          case "paragraph":
            return this.convertParagraph(node) + "\\n\\n";
          case "heading":
            const level = "#".repeat(node.attrs?.level || 1);
            const text = this.extractText(node);
            return `${level} ${text}\\n\\n`;
          case "bulletList":
            return this.convertList(node, "-") + "\\n";
          case "orderedList":
            return this.convertList(node, "1.") + "\\n";
          case "codeBlock":
            const code = this.extractText(node);
            const language = node.attrs?.language || "";
            return `\`\`\`${language}\\n${code}\\n\`\`\`\\n\\n`;
          default:
            return this.extractText(node) + "\\n\\n";
        }
      })
      .join("")
      .trim();
  }

  convertParagraph(node) {
    if (!node.content) return "";

    return node.content
      .map(inline => {
        switch (inline.type) {
          case "text":
            let text = inline.text || "";
            if (inline.marks) {
              for (const mark of inline.marks) {
                switch (mark.type) {
                  case "strong":
                    text = `**${text}**`;
                    break;
                  case "em":
                    text = `*${text}*`;
                    break;
                  case "code":
                    text = `\`${text}\``;
                    break;
                }
              }
            }
            return text;
          case "hardBreak":
            return "\\n";
          default:
            return inline.text || "";
        }
      })
      .join("");
  }

  convertList(node, marker) {
    if (!node.content) return "";

    return node.content
      .map(item => {
        const text = this.extractText(item);
        return `${marker} ${text}`;
      })
      .join("\\n");
  }

  extractText(node) {
    if (!node) return "";

    if (node.text) return node.text;

    if (node.content) {
      return node.content.map(child => this.extractText(child)).join("");
    }

    return "";
  }

  formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
