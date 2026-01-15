#!/usr/bin/env node
// Demo script for Claude Predict - simulates the interactive experience

import chalk from 'chalk';
import readline from 'readline';

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

// Simulated typing effect
async function typeText(text, delay = 15) {
    for (const char of text) {
        process.stdout.write(char);
        await sleep(delay);
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Demo responses
const demoResponses = {
    generate: {
        toolUse: 'generate_market',
        thinking: "I'll generate some privacy-themed prediction market ideas for you.",
        response: `Here are **3 privacy-themed prediction market ideas**:

**1. Will GDPR fines exceed €5 billion total in 2026?**
   - Category: Regulation
   - Suggested Duration: 180 days
   - Suggested Liquidity: 2,500 USDC
   - *Reasoning: EU enforcement has been accelerating with Meta and TikTok facing major penalties*

**2. Will Tornado Cash sanctions be lifted or modified by Q4 2026?**
   - Category: Technology
   - Suggested Duration: 270 days
   - Suggested Liquidity: 5,000 USDC
   - *Reasoning: Ongoing legal challenges and crypto advocacy efforts*

**3. Will Signal reach 100M monthly active users by end of 2026?**
   - Category: Adoption
   - Suggested Duration: 365 days
   - Suggested Liquidity: 3,000 USDC
   - *Reasoning: Growing privacy awareness driving encrypted messaging adoption*

Would you like me to create any of these markets on Solana?`
    },
    create: {
        toolUse: 'create_market',
        thinking: "I'll create this prediction market on Solana devnet.",
        response: `${chalk.green('✓')} **Market created successfully!**

| Field | Value |
|-------|-------|
| **Question** | Will GDPR fines exceed €5 billion total in 2026? |
| **Address** | \`7xKXw9fZqR8nYpL2mVcD4kJhG5tBwEaS3vN6uFpQrZm1\` |
| **Signature** | \`4vJ7xYzK9mNpL2qRtUwXy5aBcDeFgHiJkLmNoPqRsTuV...\` |
| **Duration** | 180 days |
| **Liquidity** | 2,500 USDC |
| **Type** | AMM |
| **Network** | devnet |

The market is now live! You can view it at:
https://pnp.exchange/market/7xKXw9fZqR8nYpL2mVcD4kJhG5tBwEaS3vN6uFpQrZm1`
    },
    score: {
        toolUse: 'score_news',
        thinking: "I'll analyze this headline for privacy market relevance.",
        response: `**News Relevance Analysis**

| Metric | Value |
|--------|-------|
| **Score** | ${chalk.green('87/100')} |
| **Category** | Regulation |
| **Urgency** | High |
| **Market Potential** | ${chalk.green('Excellent')} |

**Analysis:** This headline about EU encryption regulations directly impacts privacy rights and could create significant market interest. The regulatory angle makes it highly verifiable with clear resolution criteria.

**Suggested Market:** "Will the EU pass mandatory encryption backdoor legislation by 2027?"
- Duration: 365 days
- Liquidity: 5,000 USDC

Would you like me to create this market?`
    },
    stats: {
        toolUse: 'get_stats',
        thinking: "Let me fetch the market statistics.",
        response: `**Market Statistics** (Last 7 days)

\`\`\`
╭─────────────────────────────────────────────────╮
│  Total Markets: 48        Active: 36            │
│  Resolved: 10             Cancelled: 2          │
├─────────────────────────────────────────────────┤
│  By Category:                                   │
│    Regulation   ████████░░ 12 (25%)             │
│    Technology   ██████████ 18 (38%)             │
│    Adoption     ██████░░░░ 11 (23%)             │
│    Events       ████░░░░░░  7 (14%)             │
├─────────────────────────────────────────────────┤
│  This Week: 5 new markets                       │
│  Resolution Rate: 92%                           │
│  Avg Liquidity: 2,450 USDC                      │
╰─────────────────────────────────────────────────╯
\`\`\`

Your most active category is **Technology** with 18 markets. Would you like to generate more markets in underrepresented categories?`
    },
    help: `
${chalk.cyan.bold('Claude Predict Commands')}
${chalk.gray('─'.repeat(50))}

  ${chalk.yellow('/help')}              Show this help message
  ${chalk.yellow('/generate [n]')}      Generate n market ideas
  ${chalk.yellow('/create [q]')}        Create a new market
  ${chalk.yellow('/stats')}             Show market statistics
  ${chalk.yellow('/news')}              Fetch and score recent news
  ${chalk.yellow('/markets')}           List your markets
  ${chalk.yellow('/score <headline>')} Score news for relevance
  ${chalk.yellow('/config')}            Show configuration
  ${chalk.yellow('/exit')}              Exit Claude Predict

  ${chalk.dim('Or just chat naturally - ask me to generate markets,')}
  ${chalk.dim('score news, or create predictions about privacy topics.')}
`
};

// Demo flow
const demoFlow = [
    {
        input: 'Generate 3 market ideas about privacy regulations',
        response: demoResponses.generate
    },
    {
        input: 'Create the first one with 2500 USDC liquidity',
        response: demoResponses.create
    },
    {
        input: '/score EU proposes mandatory encryption backdoors for law enforcement',
        response: demoResponses.score
    },
    {
        input: '/stats',
        response: demoResponses.stats
    }
];

async function printWelcome() {
    console.clear();
    console.log(chalk.cyan(LOGO));
    console.log(chalk.dim('  Privacy Prediction Markets • Powered by Claude Opus 4.5'));
    console.log();
    console.log(chalk.gray('─'.repeat(60)));
    console.log(
        `  ${chalk.dim('Network:')} ${chalk.green('devnet')}` +
        `  ${chalk.dim('│')}  ` +
        `${chalk.dim('Wallet:')} ${chalk.white('7xKXw...9fZq')}` +
        `  ${chalk.dim('│')}  ` +
        `${chalk.dim('Helius:')} ${chalk.green('✓')}`
    );
    console.log(chalk.gray('─'.repeat(60)));
    console.log();
    console.log(chalk.dim('  Type a message or use /help for commands.'));
    console.log();
}

async function simulateResponse(response) {
    if (typeof response === 'string') {
        // Simple response (like /help)
        console.log(response);
        return;
    }

    // Show tool usage
    console.log(chalk.dim(`\n  [Using ${response.toolUse}...]`));
    await sleep(800);
    console.log(chalk.dim(`  Executing ${response.toolUse}...`));
    await sleep(600);
    console.log(chalk.green(`  Done.`));
    await sleep(300);

    // Stream the response with typing effect
    console.log();
    await typeText(response.response, 8);
    console.log();
}

async function runDemo() {
    await printWelcome();
    await sleep(1500);

    for (let i = 0; i < demoFlow.length; i++) {
        const { input, response } = demoFlow[i];

        // Show user input with typing effect
        process.stdout.write(chalk.cyan('\n> '));
        await typeText(input, 40);
        console.log();
        await sleep(500);

        // Show AI response
        await simulateResponse(response);
        await sleep(2000);
    }

    // Final message
    console.log();
    console.log(chalk.cyan('─'.repeat(60)));
    console.log(chalk.dim('\n  Demo complete! Claude Predict is ready for autonomous'));
    console.log(chalk.dim('  prediction market creation on Solana.'));
    console.log();
    console.log(chalk.cyan('  github.com/piccassol/privacy-oracle'));
    console.log(chalk.dim('  Solana Privacy Hackathon 2026'));
    console.log();
}

async function runInteractive() {
    await printWelcome();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const prompt = () => {
        rl.question(chalk.cyan('\n> '), async (input) => {
            const trimmed = input.trim().toLowerCase();

            if (trimmed === '/exit' || trimmed === '/quit') {
                console.log(chalk.dim('\n  Goodbye!\n'));
                rl.close();
                return;
            }

            if (trimmed === '/help') {
                console.log(demoResponses.help);
            } else if (trimmed.startsWith('/stats')) {
                await simulateResponse(demoResponses.stats);
            } else if (trimmed.startsWith('/score')) {
                await simulateResponse(demoResponses.score);
            } else if (trimmed.includes('generate') || trimmed.startsWith('/generate')) {
                await simulateResponse(demoResponses.generate);
            } else if (trimmed.includes('create') || trimmed.startsWith('/create')) {
                await simulateResponse(demoResponses.create);
            } else {
                // Generic response
                console.log(chalk.dim(`\n  [Processing...]`));
                await sleep(500);
                console.log(`\nI can help you with privacy prediction markets! Try:\n`);
                console.log(`  • "Generate 3 market ideas about GDPR"`);
                console.log(`  • "Create a market about Tornado Cash"`);
                console.log(`  • "/score <news headline>"`);
                console.log(`  • "/stats" to see analytics`);
                console.log(`  • "/help" for all commands`);
            }

            prompt();
        });
    };

    prompt();
}

// Check args
const args = process.argv.slice(2);
if (args.includes('--auto') || args.includes('-a')) {
    runDemo();
} else {
    runInteractive();
}
