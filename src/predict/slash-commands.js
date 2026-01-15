// Slash command handlers for Claude Predict

import chalk from 'chalk';
import { printHelp, printGoodbye, printWelcome, printDivider } from './ui/welcome.js';
import { executeTool, getToolsByCategory } from './tools/index.js';
import { formatToolResult } from './ui/renderer.js';
import { getConfig } from '../config.js';

/**
 * Handle slash commands
 * @param {string} input - User input
 * @param {object} context - Command context (agent instance, etc.)
 * @returns {boolean|string} True if handled, false if not a command, or prompt string to send to AI
 */
export async function handleSlashCommand(input, context = {}) {
    const trimmed = input.trim();

    if (!trimmed.startsWith('/')) {
        return false;
    }

    const [command, ...args] = trimmed.slice(1).split(' ');
    const argString = args.join(' ');

    switch (command.toLowerCase()) {
        case 'help':
        case 'h':
        case '?':
            printHelp();
            return true;

        case 'exit':
        case 'quit':
        case 'q':
            printGoodbye();
            process.exit(0);

        case 'clear':
        case 'cls':
            printWelcome();
            if (context.clearHistory) {
                context.clearHistory();
            }
            return true;

        case 'config':
            await showConfig();
            return true;

        case 'generate':
        case 'gen':
            const count = parseInt(args[0]) || 3;
            return `Generate ${count} privacy-themed prediction market ideas. Be creative and focus on current events.`;

        case 'create':
            if (argString) {
                return `Create a prediction market with the question: "${argString}"`;
            }
            return 'Help me create a new prediction market. Ask me what topic I want to create a market about.';

        case 'stats':
            const period = args[0] || '7d';
            return `Show me market statistics for the ${period} period.`;

        case 'news':
            const newsLimit = parseInt(args[0]) || 5;
            return `Fetch and score the top ${newsLimit} recent privacy-related news items for market potential.`;

        case 'markets':
        case 'list':
            const status = args[0] || 'all';
            return `List my ${status} markets.`;

        case 'categories':
        case 'cats':
            await showCategories();
            return true;

        case 'score':
            if (argString) {
                return `Score this news headline for privacy market relevance: "${argString}"`;
            }
            console.log(chalk.yellow('  Usage: /score <news headline>'));
            return true;

        case 'tools':
            await showTools();
            return true;

        default:
            console.log(chalk.yellow(`  Unknown command: /${command}`));
            console.log(chalk.dim('  Type /help for available commands.'));
            return true;
    }
}

/**
 * Show current configuration
 */
async function showConfig() {
    const config = getConfig();

    console.log();
    console.log(chalk.cyan.bold('  Configuration'));
    printDivider();
    console.log();

    const items = [
        ['Network', config.isMainnet ? chalk.red('mainnet') : chalk.green('devnet')],
        ['RPC URL', chalk.dim(config.rpcUrl.slice(0, 40) + '...')],
        ['Helius API', config.heliusKey ? chalk.green('Configured') : chalk.yellow('Not set')],
        ['Anthropic API', config.anthropicApiKey ? chalk.green('Configured') : chalk.yellow('Not set')],
        ['Wallet', config.walletKey ? chalk.green('Configured') : chalk.red('Not set')],
        ['Collateral', config.collateralToken],
        ['Default Liquidity', config.defaultLiquidity.toString()],
        ['Default Duration', `${config.defaultDurationDays} days`]
    ];

    for (const [key, value] of items) {
        console.log(`  ${chalk.dim(key.padEnd(18))} ${value}`);
    }

    console.log();
}

/**
 * Show available market categories
 */
async function showCategories() {
    const result = await executeTool('get_categories', {});

    console.log();
    console.log(chalk.cyan.bold('  Market Categories'));
    printDivider();
    console.log();

    if (result.categories) {
        for (const cat of result.categories) {
            console.log(`  ${chalk.bold(cat.name)} ${chalk.dim(`(${cat.weight}% weight)`)}`);
            console.log(`  ${chalk.dim(cat.description || 'No description')}`);
            console.log(`  ${chalk.dim('Urgency:')} ${cat.urgency}`);
            if (cat.examples && cat.examples.length > 0) {
                console.log(`  ${chalk.dim('Example:')} ${cat.examples[0]}`);
            }
            console.log();
        }
    }
}

/**
 * Show available tools
 */
async function showTools() {
    const categories = getToolsByCategory();

    console.log();
    console.log(chalk.cyan.bold('  Available Tools'));
    printDivider();
    console.log();

    for (const [category, tools] of Object.entries(categories)) {
        console.log(`  ${chalk.bold(category.charAt(0).toUpperCase() + category.slice(1))}`);
        for (const tool of tools) {
            console.log(`    ${chalk.yellow(tool)}`);
        }
        console.log();
    }
}

/**
 * Get list of available commands for help text
 */
export function getCommandList() {
    return [
        { command: '/help', description: 'Show available commands' },
        { command: '/generate [n]', description: 'Generate n market ideas' },
        { command: '/create [question]', description: 'Create a new market' },
        { command: '/stats [period]', description: 'Show market statistics' },
        { command: '/news [limit]', description: 'Fetch recent privacy news' },
        { command: '/markets [status]', description: 'List your markets' },
        { command: '/categories', description: 'Show market categories' },
        { command: '/score <headline>', description: 'Score news headline' },
        { command: '/tools', description: 'Show available tools' },
        { command: '/config', description: 'Show configuration' },
        { command: '/clear', description: 'Clear screen and history' },
        { command: '/exit', description: 'Exit Claude Predict' }
    ];
}
