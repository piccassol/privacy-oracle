#!/usr/bin/env node
// Demo script for Privacy Oracle - runs a scripted demo for video recording
// No API key required - uses simulated responses

import chalk from 'chalk';
import { printWelcome } from '../src/predict/ui/welcome.js';

// Purple color definitions
const purple = chalk.hex('#A855F7');
const purpleBright = chalk.hex('#C084FC');
const purpleDim = chalk.hex('#7C3AED');
const violet = chalk.hex('#8B5CF6');

// Demo script with pre-written responses
const DEMO_SCRIPT = [
    {
        delay: 2000,
        message: "What can you do?",
        description: "Introduction",
        response: `I'm **Privacy Oracle**, an AI agent for prediction markets on Solana's PNP Exchange.

Here's what I can help you with:

**Market Creation**
◆ Create AMM markets with liquidity pools
◆ Create P2P markets for direct betting
◆ Set custom starting odds
◆ Link markets to Twitter, YouTube, or DeFi metrics

**Market Discovery**
◆ Browse ALL markets on PNP Exchange
◆ Get detailed market info, prices, and metadata

**Trading**
◆ Buy and sell YES/NO tokens
◆ Check prices and your balances
◆ Redeem winning positions

**PNP Oracle Integration**
◆ Fetch AI-generated settlement criteria
◆ Get resolution data from PNP's LLM oracle
◆ Settle markets (with authority)

**News & Analytics**
◆ Score news headlines for privacy relevance (0-100)
◆ Generate market ideas from current events
◆ Track market statistics

All markets focus on **privacy topics**: regulations, ZK tech, encryption, data breaches, and more.

What would you like to do?`
    },
    {
        delay: 3000,
        message: "Discover all markets on PNP Exchange",
        description: "Market Discovery",
        tools: ["discover_all_markets"],
        toolResults: {
            discover_all_markets: {
                success: true,
                v2_markets: [
                    "7xKXw9fZq8mHvXrE2cNdJpYBn4QW6aRsT5uVwK9yZabc",
                    "3nPQr8sT2wXyZaB4cDeFgH5iJkLmN6oP7qRsT8uVwXyz",
                    "9aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aBcd"
                ],
                v3_markets: [
                    "2wX3yZ4aBcD5eF6gH7iJ8kL9mN0oP1qR2sT3uV4wXyZa",
                    "5eF6gH7iJ8kL9mN0oP1qR2sT3uV4wX5yZ6aBcD7eFgHi"
                ],
                total: 5
            }
        },
        response: `Found **5 markets** on PNP Exchange:

**V2 Markets (AMM)** - 3 markets
◆ \`7xKXw9fZq8mH...abc\`
◆ \`3nPQr8sT2wXy...xyz\`
◆ \`9aB2cD3eF4gH...Bcd\`

**V3 Markets (P2P)** - 2 markets
◆ \`2wX3yZ4aBcD5...yZa\`
◆ \`5eF6gH7iJ8kL...gHi\`

Use \`/info <address>\` to get details on any market, or ask me to check prices and settlement criteria!`
    },
    {
        delay: 3000,
        message: "Generate 3 market ideas about GDPR and privacy regulations",
        description: "AI Market Generation",
        tools: ["generate_market"],
        response: `Here are **3 privacy regulation market ideas**:

**1. Will GDPR fines exceed €5 billion total in 2026?**
◆ Category: Regulation
◆ Duration: 365 days
◆ Suggested Liquidity: 500 USDC
◆ Reasoning: GDPR enforcement has accelerated with Meta and TikTok facing major fines

**2. Will the US pass a federal privacy law by December 2026?**
◆ Category: Regulation
◆ Duration: 330 days
◆ Suggested Liquidity: 1000 USDC
◆ Reasoning: APRA has bipartisan momentum but faces lobbying opposition

**3. Will any G7 nation ban end-to-end encryption by 2027?**
◆ Category: Regulation
◆ Duration: 545 days
◆ Suggested Liquidity: 500 USDC
◆ Reasoning: UK Online Safety Act and EU proposals threaten E2E encryption

Want me to create any of these markets on-chain?`
    },
    {
        delay: 3000,
        message: "Score this news: 'EU proposes mandatory encryption backdoors for messaging apps'",
        description: "News Scoring",
        tools: ["score_news"],
        toolResults: {
            score_news: {
                score: 94,
                category: "regulation",
                urgency: "breaking",
                market_potential: true,
                reasoning: "Direct privacy regulation impact on encryption - highly relevant for prediction market"
            }
        },
        response: `**Privacy Relevance Score: 94/100** 🔥

◆ **Category:** Regulation
◆ **Urgency:** Breaking News
◆ **Market Potential:** High

**Analysis:** This is a critical privacy development. EU encryption backdoor mandates would fundamentally impact messaging security for millions. The news directly affects:
- End-to-end encryption providers (Signal, WhatsApp)
- Privacy-focused companies operating in EU
- Precedent for other jurisdictions

**Suggested Markets:**
1. "Will EU encryption backdoor law pass by Q4 2026?"
2. "Will Signal exit the EU market if backdoors mandated?"
3. "Will Apple comply with EU encryption requirements by 2027?"

Want me to create a market based on this news?`
    },
    {
        delay: 3000,
        message: "What tools do you have for trading and settlement?",
        description: "Trading & Settlement Tools",
        response: `Here are my **trading and settlement tools**:

**Trading Tools**
◆ \`buy_tokens\` - Buy YES/NO tokens with USDC
◆ \`sell_tokens\` - Sell tokens back for USDC
◆ \`buy_v3_tokens\` - Buy on V3/P2P markets
◆ \`get_market_prices\` - Current YES/NO prices
◆ \`get_balances\` - Your token holdings

**PNP Oracle & Settlement**
◆ \`get_settlement_criteria\` - AI-generated resolution criteria
◆ \`get_settlement_data\` - Resolution result from LLM oracle
◆ \`wait_for_settlement\` - Poll until criteria available
◆ \`settle_market\` - Execute settlement (requires authority)

**Redemption**
◆ \`redeem_position\` - Claim winnings from resolved markets
◆ \`redeem_v3_position\` - Redeem from V3 markets
◆ \`redeem_p2p_position\` - Redeem from P2P markets
◆ \`claim_refund\` - Get refund from cancelled markets
◆ \`claim_p2p_refund\` - P2P market refunds

**Example workflow:**
\`\`\`
1. /discover          → Find markets
2. /info <address>    → Check details & prices
3. /buy <addr> yes 10 → Buy 10 USDC of YES
4. /oracle <addr>     → Check settlement criteria
5. /redeem <addr>     → Claim winnings
\`\`\`

Ready to trade?`
    }
];

class DemoRunner {
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async typeText(text, delay = 40) {
        for (const char of text) {
            process.stdout.write(char);
            await this.sleep(delay);
        }
    }

    async streamResponse(text, delay = 8) {
        for (const char of text) {
            process.stdout.write(char);
            await this.sleep(delay);
        }
    }

    async simulateToolUse(tools, toolResults) {
        for (const tool of tools) {
            console.log(purpleDim(`\n  ◆ ${tool}`));
            await this.sleep(300);
            console.log(purpleDim(`  ◆ Executing ${tool}...`));
            await this.sleep(800);
            console.log(purple(`  ✓ Done`));
            await this.sleep(200);
        }
    }

    async run() {
        printWelcome();

        console.log(purpleDim('  ◆ Demo Mode - Privacy Oracle Showcase\n'));
        await this.sleep(2000);

        for (const step of DEMO_SCRIPT) {
            // Show step description
            console.log(violet(`\n  ━━━ ${step.description} ━━━\n`));
            await this.sleep(1000);

            // Type out the user message
            process.stdout.write(purple('❯ '));
            await this.typeText(step.message, 35);
            console.log();
            await this.sleep(500);

            // Simulate tool usage if any
            if (step.tools) {
                await this.simulateToolUse(step.tools, step.toolResults);
            }

            // Stream the response
            console.log();
            await this.streamResponse(step.response, 6);
            console.log('\n');

            // Wait before next step
            await this.sleep(step.delay);
        }

        console.log(violet('\n  ━━━ Demo Complete ━━━\n'));
        console.log(purple('  ◆ Thanks for watching!'));
        console.log(chalk.dim('  ◆ Run ') + purple('npm run predict') + chalk.dim(' to try it yourself.\n'));
    }
}

// Run the demo
const demo = new DemoRunner();
demo.run().catch(console.error);
