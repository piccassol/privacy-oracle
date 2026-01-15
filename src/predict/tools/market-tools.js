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

        default:
            return { error: `Unknown market tool: ${name}` };
    }
}
