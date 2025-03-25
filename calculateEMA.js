function calculateEMA(closingPrices, period = 14) {
    if (closingPrices.length < period) return closingPrices.slice(-1)[0]; // Fallback to last price

    let ema = closingPrices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    const multiplier = 2 / (period + 1);

    for (let i = period; i < closingPrices.length; i++) {
        ema = (closingPrices[i] - ema) * multiplier + ema;
    }
    return ema;
}

module.exports = { calculateEMA };