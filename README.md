# Privacy Oracle Agent
![images (1)](https://github.com/user-attachments/assets/8912f5bb-d77d-46da-b1ab-e968a741b3bd)

An AI-powered agent for creating privacy-themed prediction markets on Solana using the PNP Exchange protocol and Helius infrastructure.

**Powered by Opus 4.5**.

## Features

- **Claude AI-powered market generation** - Uses Claude API to generate relevant, verifiable prediction markets from news and topics
- **AI news scoring** - Automatically scores incoming news for privacy relevance (0-100)
- **AI resolution helper** - Analyzes markets to determine if conditions have been met
- Multiple market categories: regulation, technology, adoption, events
- Supports both AMM and P2P market creation
- **Autonomous daemon mode** with configurable schedules (cron or interval)
- **News monitoring** via RSS feeds for timely market generation
- **Webhook server** for Helius transaction events
- Market analytics and statistics tracking
- Privacy token collateral support (Token-2022 confidential transfers)
- Interactive CLI wizard for guided market creation
- Full Helius RPC integration for reliable Solana access

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```bash
# Required for market creation
WALLET_PRIVATE_KEY=your_base58_private_key_or_array

# Helius API key (recommended)
HELIUS_API_KEY=your_helius_api_key

# Anthropic API key for AI features
ANTHROPIC_API_KEY=your_anthropic_api_key

# Network (devnet or mainnet)
NETWORK=devnet

# Optional defaults
DEFAULT_LIQUIDITY=1000000
DEFAULT_DURATION_DAYS=30

# Daemon settings
DAEMON_SCHEDULE=1h
DAEMON_MARKETS_PER_ROUND=1
DAEMON_STORAGE_PATH=./data/markets.db

# News monitoring
NEWS_ENABLED=false

# Webhook server
WEBHOOK_ENABLED=false
WEBHOOK_PORT=3000
WEBHOOK_AUTH_TOKEN=

# Privacy collateral
COLLATERAL_TOKEN=USDC
```

Get a free Helius API key at [helius.dev](https://helius.dev)

## Usage

### CLI Commands

```bash
# Generate market ideas (no wallet needed)
npm run agent generate -c 5

# Generate from specific category
npm run agent generate -k technology -c 3

# Show market categories
npm run agent categories

# Create a single privacy-themed market
npm run agent create

# Create with custom question
npm run agent create -q "Will GDPR fines exceed $5B in 2026?"

# Create multiple markets
npm run agent batch -c 3

# List existing markets
npm run agent list

# Get market info
npm run agent info <market_address>

# Show config
npm run agent config

# Interactive mode (guided wizard)
npm run agent interactive

# View market statistics
npm run agent stats --period 7d

# List supported collateral tokens
npm run agent tokens

# Check if a mint supports confidential transfers
npm run agent tokens --check <mint_address>
```

### AI-Powered Commands

```bash
# Generate markets using Claude AI
npm run agent ai-generate -c 3

# Generate markets about a specific topic
npm run agent ai-generate -t "Tornado Cash sanctions" -c 2

# Generate and create markets on-chain
npm run agent ai-generate -c 3 --create

# Score news headlines for privacy relevance
npm run agent ai-score "EU proposes new encryption regulations" "Bitcoin hits new high"

# Analyze markets for potential resolution
npm run agent ai-resolve --all
npm run agent ai-resolve -m <market_address>
```

### Claude Predict - Interactive AI Agent

Run the Claude Code-like interactive CLI powered by Claude Opus 4.5:

```bash
# Start Claude Predict
npm run predict

# Or use the binary directly
npx claude-predict
```

Claude Predict provides an interactive chat interface where you can:
- Generate market ideas through natural conversation
- Create markets on Solana with simple commands
- Score news headlines for market potential
- Analyze markets for resolution
- Execute shell commands and file operations

**Slash Commands:**
| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/generate [n]` | Generate n market ideas |
| `/create [question]` | Create a new market |
| `/stats [period]` | Show market statistics |
| `/news [limit]` | Fetch recent privacy news |
| `/markets [status]` | List your markets |
| `/score <headline>` | Score news for relevance |
| `/config` | Show configuration |
| `/exit` | Exit Claude Predict |

**Example Session:**
```
> Generate 3 market ideas about GDPR

[Claude Predict generates ideas using AI...]

1. Will GDPR fines exceed €5B total in 2026?
2. Will Meta receive another GDPR fine by Q3 2026?
3. Will the EU approve the AI Act privacy provisions by June 2026?

> Create the first one with 1000 USDC liquidity

[Creating market on Solana...]

✓ Market created successfully!
Address: 7xKXw9fZq...abc123
```

### Daemon Mode

Run as an autonomous daemon that creates markets on a schedule:

```bash
# Basic daemon (1 market per hour)
npm run daemon

# Custom schedule with news monitoring
npm run agent daemon -s 30m -c 2 --news

# With webhook server for Helius events
npm run agent daemon -s 1h --webhooks --webhook-port 3000

# Dry run (generate without creating on-chain)
npm run agent daemon --dry-run

# Limited iterations
npm run agent daemon -n 10 -s 5m
```

Daemon options:
- `-s, --schedule <schedule>` - Cron expression or interval (30m, 1h, 24h)
- `-n, --iterations <count>` - Max iterations (infinite if omitted)
- `-c, --count <count>` - Markets per cycle (default: 1)
- `--dry-run` - Generate without creating on-chain
- `--news` - Enable news monitoring for timely markets
- `--webhooks` - Enable webhook server
- `--webhook-port <port>` - Webhook port (default: 3000)

### Programmatic Usage

```javascript
import { createAgent, generatePrivacyMarket } from 'privacy-oracle-agent';

// Create an agent
const agent = await createAgent({ verbose: true });

// Generate and create a privacy market
const result = await agent.createPrivacyMarket();
console.log('Created market:', result.market);

// Or create with custom question
const custom = await agent.createMarket({
    question: 'Will Tornado Cash sanctions be lifted by 2027?',
    durationDays: 365,
    liquidity: 5000000n
});

// Batch create markets
const batch = await agent.createBatchMarkets(5);
```

### Quick Create

```javascript
import { quickCreate } from 'privacy-oracle-agent';

// Auto-generate a privacy market
const market = await quickCreate();

// Or with custom question
const custom = await quickCreate('Will the US pass federal privacy law by 2027?', {
    durationDays: 365
});
```

### Daemon API

```javascript
import { startDaemon } from 'privacy-oracle-agent';

// Start daemon programmatically
const daemon = await startDaemon({
    daemon: {
        schedule: '1h',
        marketsPerRound: 2
    },
    news: { enabled: true }
});

// Stop daemon
await daemon.stop();
```

## Market Categories

| Category | Weight | Urgency | Examples |
|----------|--------|---------|----------|
| Privacy Regulation | 25% | Timely | GDPR fines, federal privacy laws, encryption bans |
| Privacy Technology | 30% | Evergreen | ZK adoption, Tornado Cash, confidential transactions |
| Privacy Adoption | 25% | Timely | Signal users, privacy coin delistings, enterprise ZK |
| Privacy Events | 20% | Breaking | Data breaches, surveillance scandals, hackathon wins |

## Architecture

```
privacy-oracle-agent/
  bin/
    claude-predict.js     # Claude Predict entry point
  src/
    agent.js              # Core agent class with PNP SDK integration
    cli.js                # Command line interface
    config.js             # Environment and configuration handling
    privacy-markets.js    # Market templates and AI generation
    index.js              # Public API exports
    predict/
      agent.js            # Claude Predict agentic loop
      prompts.js          # System prompts
      slash-commands.js   # /help, /generate, etc.
      tools/
        index.js          # Tool registry & executor
        market-tools.js   # Market generation & creation
        news-tools.js     # News scoring & fetching
        analytics-tools.js # Statistics tools
        file-tools.js     # File operations
        bash-tool.js      # Shell command execution
      ui/
        welcome.js        # Welcome screen
        renderer.js       # Markdown & output rendering
    helius/
      client.js           # Helius API wrapper (DAS, webhooks, etc.)
      transaction-tracker.js  # Transaction confirmation tracking
      webhooks.js         # Express server for Helius webhooks
    daemon/
      index.js            # Main daemon orchestrator
      scheduler.js        # Cron-style scheduling
      lifecycle.js        # Graceful shutdown handling
    storage/
      market-store.js     # SQLite persistence layer
    monitoring/
      news-monitor.js     # RSS feed monitoring
      news-scorer.js      # Relevance scoring algorithm
    ai/
      market-generator.js # Claude AI market generation
      scorer.js           # AI news relevance scoring
      resolver.js         # AI market resolution helper
      index.js            # AI module exports
    analytics/
      aggregator.js       # Dashboard data aggregation
    collateral/
      privacy-tokens.js   # Privacy token support
    events/
      emitter.js          # Central event bus
    utils/
      spinner.js          # CLI spinners and progress
  test/
    *.test.js             # Test suites
```

## How It Works

1. **AI Market Generation**: Uses Claude API to generate verifiable YES/NO prediction market questions from news headlines or topics, with appropriate timeframes and liquidity suggestions.

2. **News Scoring**: AI scores incoming news items 0-100 for privacy relevance, filtering high-score items for market generation.

3. **Resolution Analysis**: AI analyzes markets to determine if conditions have been met, providing confidence scores and suggested actions.

4. **Template Fallback**: When AI is unavailable, uses weighted random selection across privacy-themed categories with dynamic template filling.

5. **Helius Integration**: All Solana RPC calls go through Helius for reliability, speed, and better transaction landing rates.

6. **PNP SDK**: Markets are created on the PNP Exchange protocol, supporting both AMM pools and P2P betting.

7. **Daemon Mode**: Autonomous operation with configurable schedules, news monitoring, and webhook integration.

8. **Privacy Tokens**: Support for Token-2022 confidential transfers as collateral.

## Privacy Focus

All generated markets focus on privacy-related topics:

- Regulatory developments around data protection
- Zero-knowledge technology adoption
- Privacy tool usage metrics
- Significant privacy events and breaches

This creates a focused prediction market ecosystem around privacy topics, helping gauge community sentiment on important privacy developments.

## Testing

```bash
npm test
```

## Contributing

Contributions welcome! Areas of interest:

- Additional market categories and templates
- Integration with more privacy protocols
- Enhanced AI market generation
- Market monitoring and analytics

- ## Bounties Targeted

- **Helius ($5,000)** - Best privacy project leveraging Helius RPCs and developer tooling
- **PNP Exchange ($2,500)** - AI agents creating prediction markets with privacy-focused tokens

## License

MIT

## Links

- [PNP Exchange](https://pnp.exchange)
- [Helius](https://helius.dev)
- [Solana Privacy Hackathon](https://solana.com/privacyhack)
