// lib/currency.js
/**
 * Currency conversion helpers.
 *
 * Rates are stored relative to the user's MAIN currency, one row per foreign
 * currency, and are always read as:
 *
 *     rate = how many MAIN units 1 unit of the foreign currency is worth
 *
 * So with a main currency of AFN, `{ USD: 65 }` reads as "1 USD = 65 AFN" —
 * the same way you would say it out loud.
 *
 * Everything here is pure, so the server (writing rows) and the browser
 * (previewing a conversion while you type) share one definition.
 */

import { CURRENCY_OPTIONS, formatCurrency } from "@/lib/constants";

export function currencyDecimals(code) {
  return CURRENCY_OPTIONS.find((c) => c.code === code)?.decimals ?? 2;
}

export function currencySymbol(code) {
  return CURRENCY_OPTIONS.find((c) => c.code === code)?.symbol || code;
}

/** Rounds to the number of decimals the currency is actually written with. */
export function roundMoney(amount, currency) {
  const factor = 10 ** currencyDecimals(currency);
  return Math.round((Number(amount) + Number.EPSILON) * factor) / factor;
}

/**
 * Turns exchange_rates rows into a plain `{ USD: 65 }` lookup.
 * @param {Array<{quote_currency: string, rate: number}>} rows
 */
export function buildRateMap(rows = []) {
  const map = {};
  for (const row of rows) {
    map[row.quote_currency] = Number(row.rate);
  }
  return map;
}

/**
 * How many units of `to` one unit of `from` is worth.
 * Returns null when a rate needed for the hop has not been set yet.
 */
export function rateBetween(from, to, mainCurrency, rateMap = {}) {
  if (from === to) return 1;

  if (to === mainCurrency) {
    return rateMap[from] || null;
  }

  if (from === mainCurrency) {
    return rateMap[to] ? 1 / rateMap[to] : null;
  }

  // Neither side is the main currency — cross through it.
  const fromRate = rateMap[from];
  const toRate = rateMap[to];
  if (!fromRate || !toRate) return null;

  return fromRate / toRate;
}

/**
 * Converts an amount between currencies, rounded to `to`'s decimals.
 * Returns null when the rate is unknown, so callers can ask for one rather
 * than silently recording a wrong number.
 */
export function convertAmount(amount, from, to, mainCurrency, rateMap = {}) {
  const rate = rateBetween(from, to, mainCurrency, rateMap);
  if (rate === null) return null;

  return roundMoney(Number(amount) * rate, to);
}

/** True when `currency` can be converted to the main currency today. */
export function hasRate(currency, mainCurrency, rateMap = {}) {
  return rateBetween(currency, mainCurrency, mainCurrency, rateMap) !== null;
}

/**
 * Normalises what a client sent into the four fields a money row stores.
 *
 * The main-currency `amount` is recomputed here rather than trusted, so
 * `amount = originalAmount × exchangeRate` can never drift apart — whatever
 * the client believed it was submitting.
 *
 * @returns {{amount: number, originalAmount: number, originalCurrency: string,
 *            exchangeRate: number} | {error: string}}
 */
export function resolveEntryAmounts({
  amount,
  originalAmount,
  originalCurrency,
  exchangeRate,
  mainCurrency,
}) {
  const currency = originalCurrency || mainCurrency;
  const typed = Number(originalAmount ?? amount);

  if (!Number.isFinite(typed) || typed <= 0) {
    return { error: "Amount must be a number greater than 0" };
  }

  if (currency === mainCurrency) {
    return {
      amount: roundMoney(typed, mainCurrency),
      originalAmount: typed,
      originalCurrency: mainCurrency,
      exchangeRate: 1,
    };
  }

  const rate = Number(exchangeRate);
  if (!Number.isFinite(rate) || rate <= 0) {
    return {
      error: `An exchange rate is required to record a ${currency} amount in ${mainCurrency}`,
    };
  }

  return {
    amount: roundMoney(typed * rate, mainCurrency),
    originalAmount: typed,
    originalCurrency: currency,
    exchangeRate: rate,
  };
}

/**
 * Formats a rate the way it is spoken: "1 USD = 65 AFN".
 */
export function describeRate(quoteCurrency, mainCurrency, rate) {
  if (!rate) return null;
  return `1 ${quoteCurrency} = ${formatCurrency(rate, mainCurrency)}`;
}

export { formatCurrency };
