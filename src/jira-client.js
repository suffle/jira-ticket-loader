import axios from "axios";
import { Parser } from "extended-markdown-adf-parser";

export class JiraClient {
  constructor(config) {
    this.baseUrl = config.jiraBaseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.email = config.jiraEmail;
    this.apiKey = config.jiraApiKey;
    
    // Initialize the ADF to Markdown parser
    this.adfParser = new Parser();

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

    // Handle ADF (Atlassian Document Format) using the comprehensive parser
    if (typeof description === "object" && description.content) {
      try {
        return this.adfParser.adfToMarkdown(description);
      } catch (error) {
        console.warn("Failed to parse ADF description:", error.message);
        // Fallback to basic text extraction
        return this.extractTextFallback(description);
      }
    }

    // If it's already a string, return as-is
    if (typeof description === "string") {
      return description;
    }

    // For other object types without content, return empty
    return "";
  }

  // Fallback method for when ADF parsing fails
  extractTextFallback(adf) {
    if (!adf) return "";
    
    if (adf.text) return adf.text;
    
    if (!adf.content) return "";
    
    return adf.content
      .map(node => {
        if (node.text) return node.text;
        if (node.content) return this.extractTextFallback(node);
        return "";
      })
      .join("\n");
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
