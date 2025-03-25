function calculateBollingerBands(closingPrices, period = 20) {
    if (closingPrices.length < period) return {upper: null, lower: null};

    const sma = closingPrices.slice(-period).reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(closingPrices.slice(-period).reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period);

    return {
        upper: sma + 2 * stdDev,
        lower: sma - 2 * stdDev
    };
}
module.exports = { calculateBollingerBands };