function calculateRSI(closingPrices, period = 14) {
    if (closingPrices.length < period) return 50; // Neutral if insufficient data

    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
        const diff = closingPrices[i] - closingPrices[i - 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period || 0.001; // Avoid division by zero
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

module.exports = { calculateRSI };