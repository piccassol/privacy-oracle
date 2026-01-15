// Tool registry and executor for Claude Predict

import { marketToolDefinitions, executeMarketTool } from './market-tools.js';
import { newsToolDefinitions, executeNewsTool } from './news-tools.js';
import { analyticsToolDefinitions, executeAnalyticsTool } from './analytics-tools.js';
import { fileToolDefinitions, executeFileTool } from './file-tools.js';
import { bashToolDefinition, executeBashTool } from './bash-tool.js';

// Combine all tool definitions for Claude API
export const tools = [
    ...marketToolDefinitions,
    ...newsToolDefinitions,
    ...analyticsToolDefinitions,
    ...fileToolDefinitions,
    bashToolDefinition
];

// Tool name to executor mapping
const toolExecutors = {
    // Market tools
    generate_market: executeMarketTool,
    create_market: executeMarketTool,
    list_markets: executeMarketTool,
    get_market_info: executeMarketTool,
    check_resolution: executeMarketTool,
    // Trading tools
    buy_tokens: executeMarketTool,
    sell_tokens: executeMarketTool,
    get_market_prices: executeMarketTool,
    get_balances: executeMarketTool,
    // Redemption tools
    redeem_position: executeMarketTool,
    claim_refund: executeMarketTool,
    // URL-aware market creation
    create_market_from_source: executeMarketTool,
    // News tools
    score_news: executeNewsTool,
    fetch_news: executeNewsTool,
    generate_from_news: executeNewsTool,
    // Analytics tools
    get_stats: executeAnalyticsTool,
    get_categories: executeAnalyticsTool,
    // File tools
    read_file: executeFileTool,
    write_file: executeFileTool,
    list_files: executeFileTool,
    // Bash tool
    run_command: executeBashTool
};

/**
 * Execute a tool by name with given input
 * @param {string} name - Tool name
 * @param {object} input - Tool input parameters
 * @returns {Promise<object>} Tool result
 */
export async function executeTool(name, input) {
    const executor = toolExecutors[name];

    if (!executor) {
        return {
            error: `Unknown tool: ${name}`,
            available_tools: Object.keys(toolExecutors)
        };
    }

    try {
        const startTime = Date.now();
        const result = await executor(name, input);
        const duration = Date.now() - startTime;

        return {
            ...result,
            _meta: {
                tool: name,
                duration_ms: duration
            }
        };
    } catch (error) {
        return {
            error: error.message,
            stack: process.env.DEBUG ? error.stack : undefined,
            tool: name
        };
    }
}

/**
 * Get tool definition by name
 * @param {string} name - Tool name
 * @returns {object|null} Tool definition
 */
export function getToolDefinition(name) {
    return tools.find(t => t.name === name) || null;
}

/**
 * List all available tools
 * @returns {string[]} Tool names
 */
export function listTools() {
    return tools.map(t => t.name);
}

/**
 * Get tools grouped by category
 * @returns {object} Tools by category
 */
export function getToolsByCategory() {
    return {
        market: marketToolDefinitions.map(t => t.name),
        news: newsToolDefinitions.map(t => t.name),
        analytics: analyticsToolDefinitions.map(t => t.name),
        file: fileToolDefinitions.map(t => t.name),
        system: [bashToolDefinition.name]
    };
}
