// Market tool definitions and implementations for Claude Predict

import { createAgent } from '../../agent.js';
import { createMarketGenerator } from '../../ai/market-generator.js';
import { createResolver } from '../../ai/resolver.js';
import { createMarketStore } from '../../storage/market-store.js';
import { getConfig } from '../../config.js';

// Tool definitions for Claude API
export const marketToolDefinitions = [
    {
        name: 'generate_market',
        description: 'Generate a privacy-themed prediction market question using AI. Returns a market idea with question, category, suggested duration, and liquidity.',
        input_schema: {
            type: 'object',
            properties: {
                topic: {
                    type: 'string',
                    description: 'Optional topic to generate market about (e.g., "GDPR enforcement", "Tornado Cash")'
                },
                category: {
                    type: 'string',
                    enum: ['regulation', 'technology', 'adoption', 'events'],
                    description: 'Market category to focus on'
                },
                count: {
                    type: 'number',
                    description: 'Number of market ideas to generate (default: 1, max: 5)'
                }
            }
        }
    },
    {
        name: 'create_market',
        description: 'Create a prediction market on Solana. Returns market address and transaction signature.',
        input_schema: {
            type: 'object',
            properties: {
                question: {
                    type: 'string',
                    description: 'The YES/NO market question'
                },
                duration_days: {
                    type: 'number',
                    description: 'Market duration in days (default: 30)'
                },
                liquidity_usdc: {
                    type: 'number',
                    description: 'Initial liquidity in USDC (default: 1)'
                },
                type: {
                    type: 'string',
                    enum: ['amm', 'p2p'],
                    description: 'Market type (default: amm)'
                }
            },
            required: ['question']
        }
    },
    {
        name: 'list_markets',
        description: 'List existing prediction markets with optional filters',
        input_schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['active', 'resolved', 'all'],
                    description: 'Filter by market status'
                },
                category: {
                    type: 'string',
                    description: 'Filter by category'
                },
                limit: {
                    type: 'number',
                    description: 'Max markets to return (default: 10)'
                }
            }
        }
    },
    {
        name: 'get_market_info',
        description: 'Get detailed information about a specific market',
        input_schema: {
            type: 'object',
            properties: {
                address: {
                    type: 'string',
                    description: 'Market address on Solana'
                }
            },
            required: ['address']
        }
    },
    {
        name: 'check_resolution',
        description: 'Use AI to analyze if a market can be resolved based on current information',
        input_schema: {
            type: 'object',
            properties: {
                address: {
                    type: 'string',
                    description: 'Market address to analyze'
                }
            },
            required: ['address']
        }
    },
    // ========== TRADING TOOLS ==========
    {
        name: 'buy_tokens',
        description: 'Buy YES or NO tokens on a prediction market using USDC',
        input_schema: {
            type: 'object',
            properties: {
                market_address: {
                    type: 'string',
                    description: 'The market address on Solana'
                },
                side: {
                    type: 'string',
                    enum: ['yes', 'no'],
                    description: 'Which token to buy (yes or no)'
                },
                amount_usdc: {
                    type: 'number',
                    description: 'Amount of USDC to spend'
                }
            },
            required: ['market_address', 'side', 'amount_usdc']
        }
    },
    {
        name: 'sell_tokens',
        description: 'Sell YES or NO tokens from a prediction market for USDC',
        input_schema: {
            type: 'object',
            properties: {
                market_address: {
                    type: 'string',
                    description: 'The market address on Solana'
                },
                side: {
                    type: 'string',
                    enum: ['yes', 'no'],
                    description: 'Which token to sell (yes or no)'
                },
                amount: {
                    type: 'number',
                    description: 'Amount of tokens to sell'
                }
            },
            required: ['market_address', 'side', 'amount']
        }
    },
    {
        name: 'get_market_prices',
        description: 'Get current YES and NO token prices for a market',
        input_schema: {
            type: 'object',
            properties: {
                market_address: {
                    type: 'string',
                    description: 'The market address on Solana'
                }
            },
            required: ['market_address']
        }
    },
    {
        name: 'get_balances',
        description: 'Get your YES and NO token balances for a market',
        input_schema: {
            type: 'object',
            properties: {
                market_address: {
                    type: 'string',
                    description: 'The market address on Solana'
                }
            },
            required: ['market_address']
        }
    },
    // ========== REDEMPTION TOOLS ==========
    {
        name: 'redeem_position',
        description: 'Redeem winning tokens from a resolved market for USDC',
        input_schema: {
            type: 'object',
            properties: {
                market_address: {
                    type: 'string',
                    description: 'The resolved market address'
                }
            },
            required: ['market_address']
        }
    },
    {
        name: 'claim_refund',
        description: 'Claim creator refund from an unresolved/cancelled market',
        input_schema: {
            type: 'object',
            properties: {
                market_address: {
                    type: 'string',
                    description: 'The market address'
                }
            },
            required: ['market_address']
        }
    },
    // ========== URL-AWARE MARKET CREATION ==========
    {
        name: 'create_market_from_source',
        description: 'Create a market linked to a verifiable source (Twitter, YouTube, or DeFi metric)',
        input_schema: {
            type: 'object',
            properties: {
                question: {
                    type: 'string',
                    description: 'The YES/NO market question'
                },
                source_url: {
                    type: 'string',
                    description: 'URL of the source (tweet, video, or DeFi metric identifier)'
                },
                source_type: {
                    type: 'string',
                    enum: ['twitter', 'youtube', 'defi'],
                    description: 'Type of source for verification'
                },
                duration_days: {
                    type: 'number',
                    description: 'Market duration in days (default: 30)'
                },
                liquidity_usdc: {
                    type: 'number',
                    description: 'Initial liquidity in USDC (default: 1)'
                }
            },
            required: ['question', 'source_url', 'source_type']
        }
    }
];

// Tool implementations
export async function executeMarketTool(name, input) {
    const config = getConfig();

    switch (name) {
        case 'generate_market': {
            const generator = createMarketGenerator();
            const count = Math.min(input.count || 1, 5);

            if (count === 1) {
                const result = await generator.generateFromTopic(
                    input.topic || 'privacy technology',
                    input.category
                );
                return result;
            } else {
                const results = [];
                for (let i = 0; i < count; i++) {
                    const result = await generator.generateFromTopic(
                        input.topic || 'privacy technology',
                        input.category
                    );
                    results.push(result);
                }
                return { markets: results, count: results.length };
            }
        }

        case 'create_market': {
            const agent = await createAgent({ verbose: false });
            const result = await agent.createMarket({
                question: input.question,
                durationDays: input.duration_days || 30,
                liquidity: BigInt(Math.floor((input.liquidity_usdc || 1) * 1_000_000)),
                marketType: input.type || 'amm'
            });

            return {
                success: true,
                market: result.market,
                signature: result.signature,
                question: input.question,
                duration_days: input.duration_days || 30,
                liquidity_usdc: input.liquidity_usdc || 1,
                type: input.type || 'amm',
                network: config.network
            };
        }

        case 'list_markets': {
            const store = createMarketStore();
            let markets = store.getAllMarkets();

            // Apply filters
            if (input.status && input.status !== 'all') {
                markets = markets.filter(m => m.status === input.status);
            }
            if (input.category) {
                markets = markets.filter(m => m.category === input.category);
            }

            // Apply limit
            const limit = input.limit || 10;
            markets = markets.slice(0, limit);

            return {
                markets,
                total: markets.length,
                filters: {
                    status: input.status || 'all',
                    category: input.category || 'all'
                }
            };
        }

        case 'get_market_info': {
            const agent = await createAgent({ verbose: false });
            const info = await agent.fetchMarketInfo(input.address);
            return info;
        }

        case 'check_resolution': {
            const store = createMarketStore();
            const market = store.getMarket(input.address);

            if (!market) {
                return { error: 'Market not found in local database' };
            }

            const resolver = createResolver();
            const analysis = await resolver.analyzeResolution(market);
            return analysis;
        }

        // ========== TRADING TOOLS ==========

        case 'buy_tokens': {
            const agent = await createAgent({ verbose: false });
            const result = await agent.buyTokens({
                marketAddress: input.market_address,
                side: input.side,
                amountUsdc: input.amount_usdc
            });
            return result;
        }

        case 'sell_tokens': {
            const agent = await createAgent({ verbose: false });
            const result = await agent.sellTokens({
                marketAddress: input.market_address,
                side: input.side,
                amount: input.amount
            });
            return result;
        }

        case 'get_market_prices': {
            const agent = await createAgent({ verbose: false });
            const result = await agent.getMarketPrices(input.market_address);
            return result;
        }

        case 'get_balances': {
            const agent = await createAgent({ verbose: false });
            const result = await agent.getBalances(input.market_address);
            return result;
        }

        // ========== REDEMPTION TOOLS ==========

        case 'redeem_position': {
            const agent = await createAgent({ verbose: false });
            const result = await agent.redeemPosition(input.market_address);
            return result;
        }

        case 'claim_refund': {
            const agent = await createAgent({ verbose: false });
            const result = await agent.claimRefund(input.market_address);
            return result;
        }

        // ========== URL-AWARE MARKET CREATION ==========

        case 'create_market_from_source': {
            const agent = await createAgent({ verbose: false });
            const result = await agent.createMarketFromSource({
                question: input.question,
                sourceUrl: input.source_url,
                sourceType: input.source_type,
                durationDays: input.duration_days || 30,
                liquidity: BigInt(Math.floor((input.liquidity_usdc || 1) * 1_000_000))
            });
            return {
                ...result,
                duration_days: input.duration_days || 30,
                liquidity_usdc: input.liquidity_usdc || 1,
                network: config.network
            };
        }

        default:
            return { error: `Unknown market tool: ${name}` };
    }
}
