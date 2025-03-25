const { calculateRSI } = require("./calculateRSI");
const { calculateEMA } = require("./calculateEMA");
const { calculateMACD } = require("./calculateMACD");
const { calculateBollingerBands } = require("./calculateBollingerBands");

const yahooFinance = require('yahoo-finance2').default;

async function fetchMarketData(asset) {
    let ticker;
    if (asset === 'nifty') ticker = '^NSEI';
    else if (asset === 'gold') ticker = 'GC=F';
    else if (asset === 'silver') ticker = 'SI=F';
    else if (asset === 'bitcoin') ticker = 'BTC-USD';
    else return console.log('Invalid asset selection!');

    try {
        const data = await yahooFinance.quote(ticker);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const history = await yahooFinance.chart(ticker, {
            period1: threeMonthsAgo,
            interval: '1d'
        });

        const closingPrices = history.quotes.map(quote => quote.close).filter(price => price !== null);

        return {
            price: data.regularMarketPrice,
            high: data.regularMarketDayHigh,
            low: data.regularMarketDayLow,
            volume: data.regularMarketVolume,
            rsi: calculateRSI(closingPrices, 14),
            ema: calculateEMA(closingPrices, 14),
            macd: calculateMACD(closingPrices),
            bollinger: calculateBollingerBands(closingPrices)
        };
    } catch (error) {
        console.error('Error fetching market data:', error);
    }
}

module.exports = { fetchMarketData };