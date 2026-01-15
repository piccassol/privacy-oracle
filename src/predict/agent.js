// Main Claude Predict Agent - Agentic loop with streaming

import Anthropic from '@anthropic-ai/sdk';
import * as readline from 'readline';
import chalk from 'chalk';
import { tools, executeTool } from './tools/index.js';
import { renderMarkdown, printToolUse } from './ui/renderer.js';
import { printWelcome, printError } from './ui/welcome.js';
import { handleSlashCommand } from './slash-commands.js';
import { SYSTEM_PROMPT, WELCOME_MESSAGE } from './prompts.js';
import { getConfig } from '../config.js';

export class ClaudePredictAgent {
    constructor(options = {}) {
        const config = getConfig();

        if (!config.anthropicApiKey) {
            throw new Error('ANTHROPIC_API_KEY is required. Set it in your .env file.');
        }

        this.client = new Anthropic({
            apiKey: config.anthropicApiKey
        });
        this.model = options.model || 'claude-opus-4-5-20250514';
        this.messages = [];
        this.tools = tools;
        this.verbose = options.verbose ?? false;
        this.config = config;
    }

    /**
     * Main entry point - run the interactive agent
     */
    async run() {
        printWelcome();
        console.log(chalk.dim(WELCOME_MESSAGE));
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Handle Ctrl+C gracefully
        rl.on('SIGINT', () => {
            console.log(chalk.dim('\n\n  Goodbye!'));
            process.exit(0);
        });

        while (true) {
            try {
                const userInput = await this.prompt(rl);

                if (!userInput.trim()) {
                    continue;
                }

                // Handle slash commands
                const commandResult = await handleSlashCommand(userInput, {
                    clearHistory: () => { this.messages = []; }
                });

                if (commandResult === true) {
                    // Command was handled directly
                    continue;
                } else if (typeof commandResult === 'string') {
                    // Command returned a prompt to send to AI
                    await this.chat(commandResult);
                } else {
                    // Normal chat message
                    await this.chat(userInput);
                }
            } catch (error) {
                if (error.code === 'ERR_USE_AFTER_CLOSE') {
                    break;
                }
                printError(error.message);
                if (this.verbose) {
                    console.error(error);
                }
            }
        }
    }

    /**
     * Prompt user for input
     */
    async prompt(rl) {
        return new Promise((resolve) => {
            rl.question(chalk.cyan('\n> '), (answer) => {
                resolve(answer);
            });
        });
    }

    /**
     * Main chat function - sends message and handles agentic loop
     */
    async chat(userMessage) {
        this.messages.push({
            role: 'user',
            content: userMessage
        });

        // Agentic loop - continue until no more tool calls
        while (true) {
            try {
                const stream = await this.client.messages.stream({
                    model: this.model,
                    max_tokens: 16000,
                    system: SYSTEM_PROMPT,
                    tools: this.tools,
                    messages: this.messages
                });

                // Handle streaming response
                const response = await this.handleStream(stream);

                // Add assistant response to history
                this.messages.push({
                    role: 'assistant',
                    content: response.content
                });

                // Check if we need to execute tools
                if (response.stop_reason !== 'tool_use') {
                    break;
                }

                // Execute tools and add results
                const toolResults = await this.executeTools(response.content);
                this.messages.push({
                    role: 'user',
                    content: toolResults
                });

            } catch (error) {
                if (error.status === 429) {
                    console.log(chalk.yellow('\n  Rate limited. Waiting 10 seconds...'));
                    await new Promise(r => setTimeout(r, 10000));
                    continue;
                }
                throw error;
            }
        }
    }

    /**
     * Handle streaming response from Claude
     */
    async handleStream(stream) {
        let currentToolUse = null;
        let toolInput = '';
        let firstText = true;

        console.log(); // New line before response

        for await (const event of stream) {
            switch (event.type) {
                case 'content_block_start':
                    if (event.content_block.type === 'tool_use') {
                        currentToolUse = event.content_block.name;
                        toolInput = '';
                        printToolUse(currentToolUse);
                    } else if (event.content_block.type === 'text') {
                        if (firstText) {
                            firstText = false;
                        }
                    }
                    break;

                case 'content_block_delta':
                    if (event.delta.type === 'text_delta') {
                        // Stream text to terminal with markdown rendering
                        process.stdout.write(event.delta.text);
                    } else if (event.delta.type === 'input_json_delta') {
                        toolInput += event.delta.partial_json;
                    }
                    break;

                case 'content_block_stop':
                    currentToolUse = null;
                    toolInput = '';
                    break;
            }
        }

        console.log(); // New line after response

        return stream.finalMessage();
    }

    /**
     * Execute tools from response content
     */
    async executeTools(content) {
        const results = [];

        for (const block of content) {
            if (block.type === 'tool_use') {
                console.log(chalk.dim(`  Executing ${block.name}...`));

                const result = await executeTool(block.name, block.input);

                // Log result summary
                if (result.error) {
                    console.log(chalk.red(`  Error: ${result.error}`));
                } else if (result.success !== undefined) {
                    console.log(chalk.green(`  Done.`));
                }

                results.push({
                    type: 'tool_result',
                    tool_use_id: block.id,
                    content: JSON.stringify(result, null, 2)
                });
            }
        }

        return results;
    }

    /**
     * Add a message to history without triggering a response
     */
    addMessage(role, content) {
        this.messages.push({ role, content });
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.messages = [];
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return [...this.messages];
    }
}

// Export factory function
export function createPredictAgent(options = {}) {
    return new ClaudePredictAgent(options);
}
