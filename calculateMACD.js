const { calculateEMA } = require("./calculateEMA");

function calculateMACD(closingPrices) {
    const macdLine = calculateEMA(closingPrices, 12) - calculateEMA(closingPrices, 26);
    const signalLine = calculateEMA(closingPrices.slice(-26), 9); // EMA of MACD Line
    const histogram = macdLine - signalLine;

    return {macdLine, signalLine, histogram};
}

module.exports = { calculateMACD };