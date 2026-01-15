// Welcome screen for Claude Predict

import chalk from 'chalk';
import { getConfig } from '../../config.js';

const LOGO = `
 ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗
██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝
██║     ██║     ███████║██║   ██║██║  ██║█████╗
██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝
╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗
 ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝

██████╗ ██████╗ ███████╗██████╗ ██╗ ██████╗████████╗
██╔══██╗██╔══██╗██╔════╝██╔══██╗██║██╔════╝╚══██╔══╝
██████╔╝██████╔╝█████╗  ██║  ██║██║██║        ██║
██╔═══╝ ██╔══██╗██╔══╝  ██║  ██║██║██║        ██║
██║     ██║  ██║███████╗██████╔╝██║╚██████╗   ██║
╚═╝     ╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝ ╚═════╝   ╚═╝
`;

export function printWelcome(options = {}) {
    const config = getConfig();
    const walletKey = config.walletKey;
    const walletDisplay = walletKey
        ? `${walletKey.slice(0, 6)}...${walletKey.slice(-4)}`
        : chalk.yellow('Not configured');

    console.clear();

    // Logo
    console.log(chalk.cyan(LOGO));

    // Tagline
    console.log(chalk.dim('  Privacy Prediction Markets • Powered by Claude Opus 4.5'));
    console.log();

    // Status bar
    const networkColor = config.isMainnet ? chalk.red : chalk.green;
    const networkLabel = config.isMainnet ? 'mainnet' : 'devnet';

    console.log(chalk.gray('─'.repeat(60)));
    console.log(
        `  ${chalk.dim('Network:')} ${networkColor(networkLabel)}` +
        `  ${chalk.dim('│')}  ` +
        `${chalk.dim('Wallet:')} ${chalk.white(walletDisplay)}` +
        `  ${chalk.dim('│')}  ` +
        `${chalk.dim('Helius:')} ${config.heliusKey ? chalk.green('✓') : chalk.yellow('○')}`
    );
    console.log(chalk.gray('─'.repeat(60)));
    console.log();

    // Help hint
    console.log(chalk.dim('  Type a message or use /help for commands.'));
    console.log();
}

export function printHelp() {
    console.log();
    console.log(chalk.cyan.bold('  Claude Predict Commands'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log();

    const commands = [
        ['/help', 'Show this help message'],
        ['/generate [n]', 'Generate n market ideas'],
        ['/create', 'Create a market interactively'],
        ['/stats', 'Show market statistics'],
        ['/news', 'Fetch and score recent news'],
        ['/markets', 'List your markets'],
        ['/categories', 'Show market categories'],
        ['/config', 'Show configuration'],
        ['/clear', 'Clear the screen'],
        ['/exit', 'Exit Claude Predict']
    ];

    for (const [cmd, desc] of commands) {
        console.log(`  ${chalk.yellow(cmd.padEnd(18))} ${chalk.dim(desc)}`);
    }

    console.log();
    console.log(chalk.dim('  Or just chat naturally - ask me to generate markets,'));
    console.log(chalk.dim('  score news, or create predictions about privacy topics.'));
    console.log();
}

export function printGoodbye() {
    console.log();
    console.log(chalk.cyan('  Thanks for using Claude Predict!'));
    console.log(chalk.dim('  May your predictions be profitable.'));
    console.log();
}

export function printError(message) {
    console.log();
    console.log(chalk.red(`  Error: ${message}`));
    console.log();
}

export function printDivider() {
    console.log(chalk.gray('─'.repeat(60)));
}
