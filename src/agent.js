import { PublicKey } from '@solana/web3.js';
import { PNPClient } from 'pnp-sdk';
import { getConfig, validateConfig } from './config.js';
import { generatePrivacyMarket, generateMultipleMarkets } from './privacy-markets.js';

export class PrivacyOracleAgent {
    constructor(options = {}) {
        this.config = options.config || getConfig();
        this.client = null;
        this.initialized = false;
        this.verbose = options.verbose || false;
    }

    log(message, level = 'info') {
        if (this.verbose || level === 'error') {
            const prefix = level === 'error' ? '[ERROR]' : '[INFO]';
            console.log(`${prefix} ${message}`);
        }
    }

    async initialize() {
        if (this.initialized) return;

        const validation = validateConfig(this.config);
        
        if (validation.warnings.length > 0) {
            validation.warnings.forEach(w => this.log(w, 'warn'));
        }

        if (!validation.valid && this.config.walletKey) {
            throw new Error(`Configuration errors: ${validation.errors.join(', ')}`);
        }

        this.log(`Connecting to ${this.config.network} via Helius RPC...`);
        
        if (this.config.walletKey) {
            let privateKey = this.config.walletKey;
            
            if (typeof privateKey === 'string') {
                if (privateKey.startsWith('[')) {
                    privateKey = Uint8Array.from(JSON.parse(privateKey));
                }
            }
            
            this.client = new PNPClient(this.config.rpcUrl, privateKey);
            this.log('Client initialized with signer');
        } else {
            this.client = new PNPClient(this.config.rpcUrl);
            this.log('Client initialized in read-only mode');
        }

        this.initialized = true;
    }

    async createMarket(options) {
        await this.initialize();

        if (!this.client.market) {
            throw new Error('Market module not available. Ensure wallet is configured.');
        }

        const question = options.question;
        const durationDays = options.durationDays || this.config.defaultDurationDays;
        const liquidity = options.liquidity || this.config.defaultLiquidity;

        const endTime = BigInt(Math.floor(Date.now() / 1000) + (durationDays * 24 * 60 * 60));

        this.log(`Creating market: "${question}"`);
        this.log(`Duration: ${durationDays} days, Liquidity: ${liquidity}`);

        const result = await this.client.market.createMarket({
            question,
            initialLiquidity: liquidity,
            endTime,
            baseMint: this.config.collateralMint
        });

        return {
            success: true,
            signature: result.signature,
            market: result.market?.toBase58?.() || result.market?.toString?.() || result.market,
            question,
            durationDays,
            liquidity: liquidity.toString()
        };
    }

    async createP2PMarket(options) {
        await this.initialize();

        const question = options.question;
        const side = options.side || 'yes';
        const amount = options.amount || this.config.defaultLiquidity;
        const cap = options.cap || amount * 5n;
        const durationDays = options.durationDays || this.config.defaultDurationDays;

        const endTime = BigInt(Math.floor(Date.now() / 1000) + (durationDays * 24 * 60 * 60));

        this.log(`Creating P2P market: "${question}"`);
        this.log(`Side: ${side}, Amount: ${amount}, Cap: ${cap}`);

        const result = await this.client.createP2PMarketGeneral({
            question,
            initialAmount: amount,
            side,
            creatorSideCap: cap,
            endTime,
            collateralTokenMint: this.config.collateralMint
        });

        return {
            success: true,
            signature: result.signature,
            market: result.market,
            yesTokenMint: result.yesTokenMint,
            noTokenMint: result.noTokenMint,
            question,
            side,
            durationDays
        };
    }

    async createPrivacyMarket(options = {}) {
        const marketIdea = generatePrivacyMarket();
        
        this.log(`Generated market idea: ${marketIdea.category}`);
        
        return this.createMarket({
            question: options.question || marketIdea.question,
            durationDays: options.durationDays || marketIdea.durationDays,
            liquidity: options.liquidity || marketIdea.suggestedLiquidity
        });
    }

    async createBatchMarkets(count = 3) {
        await this.initialize();

        const ideas = generateMultipleMarkets(count);
        const results = [];

        for (const idea of ideas) {
            try {
                this.log(`Creating: "${idea.question}"`);
                
                const result = await this.createMarket({
                    question: idea.question,
                    durationDays: idea.durationDays,
                    liquidity: idea.suggestedLiquidity
                });
                
                results.push({ ...result, category: idea.category });
                
                await this.sleep(2000);
                
            } catch (error) {
                results.push({
                    success: false,
                    question: idea.question,
                    error: error.message
                });
            }
        }

        return results;
    }

    async fetchMarkets() {
        await this.initialize();
        
        try {
            const response = await this.client.fetchMarkets();
            return response;
        } catch (error) {
            this.log(`Error fetching markets: ${error.message}`, 'error');
            throw error;
        }
    }

    async fetchMarketInfo(marketAddress) {
        await this.initialize();

        const market = new PublicKey(marketAddress);
        const info = await this.client.fetchMarket(market);

        return {
            address: marketAddress,
            question: info.account.question,
            creator: new PublicKey(info.account.creator).toBase58(),
            resolved: info.account.resolved,
            resolvable: info.account.resolvable,
            endTime: new Date(Number(info.account.end_time) * 1000),
            winningToken: info.account.winning_token_id || null
        };
    }

    async getMarketAddresses() {
        await this.initialize();
        return this.client.fetchMarketAddresses();
    }

    // ========== TRADING METHODS ==========

    async buyTokens(options) {
        await this.initialize();

        const { marketAddress, side, amountUsdc } = options;
        const market = new PublicKey(marketAddress);

        this.log(`Buying ${side.toUpperCase()} tokens for ${amountUsdc} USDC on ${marketAddress}`);

        if (!this.client.trading) {
            throw new Error('Trading module not available. Ensure wallet is configured.');
        }

        const result = await this.client.trading.buyTokensUsdc({
            market,
            usdcAmount: BigInt(Math.floor(amountUsdc * 1_000_000)),
            tokenId: side === 'yes' ? 0 : 1
        });

        return {
            success: true,
            signature: result.signature,
            market: marketAddress,
            side,
            amountUsdc,
            tokensReceived: result.tokensReceived?.toString() || 'unknown'
        };
    }

    async sellTokens(options) {
        await this.initialize();

        const { marketAddress, side, amount } = options;
        const market = new PublicKey(marketAddress);

        this.log(`Selling ${amount} ${side.toUpperCase()} tokens on ${marketAddress}`);

        if (!this.client.trading) {
            throw new Error('Trading module not available. Ensure wallet is configured.');
        }

        const result = await this.client.trading.sellTokensBase({
            market,
            tokenAmount: BigInt(Math.floor(amount * 1_000_000)),
            tokenId: side === 'yes' ? 0 : 1
        });

        return {
            success: true,
            signature: result.signature,
            market: marketAddress,
            side,
            amount,
            usdcReceived: result.usdcReceived?.toString() || 'unknown'
        };
    }

    async getMarketPrices(marketAddress) {
        await this.initialize();

        const market = new PublicKey(marketAddress);

        if (this.client.trading?.getPrices) {
            const prices = await this.client.trading.getPrices(market);
            return {
                market: marketAddress,
                yesPrice: prices.yesPrice || prices[0],
                noPrice: prices.noPrice || prices[1],
                timestamp: new Date().toISOString()
            };
        }

        // Fallback: fetch market info and calculate from pool
        const info = await this.client.fetchMarket(market);
        return {
            market: marketAddress,
            yesPrice: 'N/A - use fetchMarket for pool data',
            noPrice: 'N/A - use fetchMarket for pool data',
            raw: info
        };
    }

    async getBalances(marketAddress) {
        await this.initialize();

        const market = new PublicKey(marketAddress);

        if (this.client.trading?.getBalances) {
            const balances = await this.client.trading.getBalances(market);
            return {
                market: marketAddress,
                yesBalance: balances.yesBalance?.toString() || '0',
                noBalance: balances.noBalance?.toString() || '0'
            };
        }

        return {
            market: marketAddress,
            yesBalance: '0',
            noBalance: '0',
            note: 'Balance check requires wallet connection'
        };
    }

    // ========== REDEMPTION METHODS ==========

    async redeemPosition(marketAddress) {
        await this.initialize();

        const market = new PublicKey(marketAddress);

        this.log(`Redeeming position on ${marketAddress}`);

        const result = await this.client.redeemPosition(market);

        return {
            success: true,
            signature: result.signature,
            market: marketAddress,
            amountRedeemed: result.amount?.toString() || 'unknown'
        };
    }

    async claimRefund(marketAddress) {
        await this.initialize();

        const market = new PublicKey(marketAddress);

        this.log(`Claiming refund on ${marketAddress}`);

        const result = await this.client.claimMarketRefund(market);

        return {
            success: true,
            signature: result.signature,
            market: marketAddress,
            amountRefunded: result.amount?.toString() || 'unknown'
        };
    }

    // ========== URL-AWARE MARKET CREATION ==========

    async createMarketFromSource(options) {
        await this.initialize();

        const { question, sourceUrl, sourceType, durationDays, liquidity } = options;
        const endTime = BigInt(Math.floor(Date.now() / 1000) + ((durationDays || 30) * 24 * 60 * 60));
        const amount = liquidity || this.config.defaultLiquidity;

        this.log(`Creating ${sourceType || 'standard'} market: "${question}"`);

        let result;

        if (sourceType === 'twitter' && this.client.createMarketTwitter) {
            result = await this.client.createMarketTwitter({
                question,
                tweetUrl: sourceUrl,
                initialLiquidity: amount,
                endTime,
                baseMint: this.config.collateralMint
            });
        } else if (sourceType === 'youtube' && this.client.createMarketYoutube) {
            result = await this.client.createMarketYoutube({
                question,
                youtubeUrl: sourceUrl,
                initialLiquidity: amount,
                endTime,
                baseMint: this.config.collateralMint
            });
        } else if (sourceType === 'defi' && this.client.createMarketDefiLlama) {
            result = await this.client.createMarketDefiLlama({
                question,
                metric: sourceUrl,
                initialLiquidity: amount,
                endTime,
                baseMint: this.config.collateralMint
            });
        } else {
            // Fallback to standard market creation
            result = await this.client.market.createMarket({
                question,
                initialLiquidity: amount,
                endTime,
                baseMint: this.config.collateralMint
            });
        }

        return {
            success: true,
            signature: result.signature,
            market: result.market?.toBase58?.() || result.market?.toString?.() || result.market,
            question,
            sourceType: sourceType || 'standard',
            sourceUrl
        };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export async function createAgent(options = {}) {
    const agent = new PrivacyOracleAgent(options);
    await agent.initialize();
    return agent;
}
