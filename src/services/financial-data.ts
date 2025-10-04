'use server';
import { logger } from '@/lib/logger';
import yahooFinance from 'yahoo-finance2';

/**
 * @fileOverview Service for fetching real financial data using yahoo-finance2.
 */

/**
 * Fetches the current stock price for a given ticker symbol.
 * @param {string} ticker The stock ticker symbol.
 * @returns {Promise<number>} A promise that resolves to the current stock price.
 */
export async function getStockPrice(ticker: string): Promise<number> {
  logger.debug(`Fetching real stock price for ${ticker}`, undefined, 'FinancialData');
  try {
    const quote = await yahooFinance.quote(ticker);
    const price = quote.regularMarketPrice;
    if (price === undefined) {
      throw new Error(`Price for ${ticker} is not available.`);
    }
    return price;
  } catch (error) {
    logger.error(`Error fetching stock price for ${ticker}:`, error, 'FinancialData');
    throw new Error(`Could not fetch stock price for ${ticker}.`);
  }
}

/**
 * Fetches recent market news for a given ticker symbol.
 * @param {string} ticker The stock ticker symbol.
 * @returns {Promise<string[]>} A promise that resolves to an array of news headlines.
 */
export async function getMarketNews(ticker: string): Promise<string[]> {
    logger.debug(`Fetching real market news for ${ticker}`, undefined, 'FinancialData');
    try {
        const news = await yahooFinance.search(ticker, { newsCount: 5 });
        return news.news.map(item => item.title);
    } catch (error) {
        logger.error(`Error fetching market news for ${ticker}:`, error, 'FinancialData');
        throw new Error(`Could not fetch market news for ${ticker}.`);
    }
}

/**
 * Fetches the exchange rate between two currencies.
 * @param {string} fromCurrency The currency to convert from (e.g., 'USD').
 * @param {string} toCurrency The currency to convert to (e.g., 'THB').
 * @returns {Promise<number>} A promise that resolves to the exchange rate.
 */
export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  const ticker = `${fromCurrency}${toCurrency}=X`;
  logger.debug(`Fetching exchange rate for ${ticker}`, undefined, 'FinancialData');
  try {
    const quote = await yahooFinance.quote(ticker);
    const rate = quote.regularMarketPrice;
    if (rate === undefined) {
      throw new Error(`Exchange rate for ${ticker} is not available.`);
    }
    return rate;
  } catch (error) {
    logger.error(`Error fetching exchange rate for ${ticker}:`, error, 'FinancialData');
    throw new Error(`Could not fetch exchange rate for ${ticker}.`);
  }
}

/**
 * Fetches the current price of gold.
 * @returns {Promise<number>} A promise that resolves to the current gold price.
 */
export async function getGoldPrice(): Promise<number> {
  const ticker = 'GC=F'; // Gold Futures
  logger.debug(`Fetching gold price for ${ticker}`, undefined, 'FinancialData');
  try {
    const quote = await yahooFinance.quote(ticker);
    const price = quote.regularMarketPrice;
    if (price === undefined) {
      throw new Error(`Gold price for ${ticker} is not available.`);
    }
    return price;
  } catch (error) {
    logger.error(`Error fetching gold price for ${ticker}:`, error, 'FinancialData');
    throw new Error(`Could not fetch gold price for ${ticker}.`);
  }
}