import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

const ListArticlesSchema = z.object({
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of articles per page (max 100)"),
  sort_by: z.string().optional().describe("Field to sort by"),
  sort_order: z.enum(["asc", "desc"]).optional().describe("Sort order (asc or desc)")
});

const GetArticleSchema = z.object({
  id: z.number().describe("Article ID")
});

const CreateArticleSchema = z.object({
  title: z.string().describe("Article title"),
  body: z.string().describe("Article body content (HTML)"),
  section_id: z.number().describe("Section ID where the article will be created"),
  locale: z.string().optional().describe("Article locale (e.g., 'en-us')"),
  draft: z.boolean().optional().describe("Whether the article is a draft"),
  permission_group_id: z.number().optional().describe("Permission group ID for the article"),
  user_segment_id: z.number().optional().describe("User segment ID for the article"),
  label_names: z.array(z.string()).optional().describe("Labels for the article")
});

const UpdateArticleSchema = z.object({
  id: z.number().describe("Article ID to update"),
  title: z.string().optional().describe("Updated article title"),
  body: z.string().optional().describe("Updated article body content (HTML)"),
  locale: z.string().optional().describe("Updated article locale (e.g., 'en-us')"),
  draft: z.boolean().optional().describe("Whether the article is a draft"),
  permission_group_id: z.number().optional().describe("Updated permission group ID"),
  user_segment_id: z.number().optional().describe("Updated user segment ID"),
  label_names: z.array(z.string()).optional().describe("Updated labels")
});

const DeleteArticleSchema = z.object({
  id: z.number().describe("Article ID to delete")
});

async function listArticles(args) {
  try {
    const params = { page: args.page, per_page: args.per_page, sort_by: args.sort_by, sort_order: args.sort_order };
    const result = await zendeskClient.listArticles(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error listing articles: ${error.message}` }], isError: true };
  }
}

async function getArticle(args) {
  try {
    const result = await zendeskClient.getArticle(args.id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error getting article: ${error.message}` }], isError: true };
  }
}

async function createArticle(args) {
  try {
    const { section_id, ...articleData } = args;
    const result = await zendeskClient.createArticle(articleData, section_id);
    return { content: [{ type: "text", text: `Article created successfully!\n\n${JSON.stringify(result, null, 2)}` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error creating article: ${error.message}` }], isError: true };
  }
}

async function updateArticle(args) {
  try {
    const { id, ...articleData } = args;
    const result = await zendeskClient.updateArticle(id, articleData);
    return { content: [{ type: "text", text: `Article updated successfully!\n\n${JSON.stringify(result, null, 2)}` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error updating article: ${error.message}` }], isError: true };
  }
}

async function deleteArticle(args) {
  try {
    await zendeskClient.deleteArticle(args.id);
    return { content: [{ type: "text", text: `Article ${args.id} deleted successfully!` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error deleting article: ${error.message}` }], isError: true };
  }
}

function registerTools(server) {
  server.tool('list_articles', 'List Help Center articles', ListArticlesSchema.shape, listArticles);
  server.tool('get_article', 'Get a specific Help Center article by ID', GetArticleSchema.shape, getArticle);
  server.tool('create_article', 'Create a new Help Center article', CreateArticleSchema.shape, createArticle);
  server.tool('update_article', 'Update an existing Help Center article', UpdateArticleSchema.shape, updateArticle);
  server.tool('delete_article', 'Delete a Help Center article', DeleteArticleSchema.shape, deleteArticle);
}

export default { registerTools };