const {strategyInfo} = require("./strategyInfo");

const fs = require('fs');


function analyzeStrategy(strategy, data) {
    let recommendation = '';
    let recommendationClass = '';
    let explanation = `<p>${strategyInfo(strategy)}</p>`;

    if (strategy === 1) { // RSI Strategy
        if (data.rsi < 30) {
            recommendation = 'BUY';
            recommendationClass = 'buy';
            explanation += `<p>RSI is below 30 (Oversold).</p>`;
        } else if (data.rsi > 70) {
            recommendation = 'SELL';
            recommendationClass = 'sell';
            explanation += `<p>RSI is above 70 (Overbought).</p>`;
        } else {
            recommendation = 'HOLD';
            recommendationClass = 'hold';
            explanation += `<p>RSI is in a neutral zone.</p>`;
        }
    } else if (strategy === 2) { // EMA Strategy
        if (data.price > data.ema) {
            recommendation = 'BUY';
            recommendationClass = 'buy';
            explanation += '<p>Price is above EMA (Bullish).</p>';
        } else {
            recommendation = 'SELL';
            recommendationClass = 'sell';
            explanation += '<p>Price is below EMA (Bearish).</p>';
        }
    } else if (strategy === 3) { // MACD Strategy
        if (data.macd.macdLine > data.macd.signalLine) {
            recommendation = 'BUY';
            recommendationClass = 'buy';
            explanation += '<p>MACD line is above Signal line (Bullish).</p>';
        } else {
            recommendation = 'SELL';
            recommendationClass = 'sell';
            explanation += '<p>MACD line is below Signal line (Bearish).</p>';
        }
    } else if (strategy === 4) { // Bollinger Bands (Improved)
        const {upper, lower} = data.bollinger;
        const price = data.price;
        const rsi = data.rsi;

        // Rule 1: Price must touch/extend beyond bands (strict)
        const isNearLowerBand = price <= lower * 1.02; // 2% buffer for slippage
        const isNearUpperBand = price >= upper * 0.98;

        // Rule 2: RSI confirmation (avoid false breakouts)
        const isOversold = rsi < 30;
        const isOverbought = rsi > 70;

        if (isNearLowerBand && isOversold) {
            recommendation = "BUY";
            recommendationClass = 'buy strong';
            explanation += `<p>Price touched lower band (${lower.toFixed(2)}) + RSI < 30 (Strong reversal signal).</p>`;
        } else if (isNearUpperBand && isOverbought) {
            recommendation = "SELL";
            recommendationClass = 'sell strong';
            explanation += `<p>Price touched upper band (${upper.toFixed(2)}) + RSI > 70 (Strong reversal signal).</p>`;
        } else if (isNearLowerBand) {
            recommendation = "WEAK BUY";
            recommendationClass = 'buy weak';
            explanation += `<p>Price near lower band (${lower.toFixed(2)}), but RSI not oversold. Wait for confirmation.</p>`;
        } else if (isNearUpperBand) {
            recommendation = "WEAK SELL";
            recommendationClass = 'sell weak';
            explanation += `<p>Price near upper band (${upper.toFixed(2)}), but RSI not overbought. Wait for confirmation.</p>`;
        } else {
            recommendation = "HOLD";
            recommendationClass = 'hold';
            explanation += `<p>Price between bands. No strong signal.</p>`;
        }
    } else if (strategy === 5) { // Combined Strategy (Weighted)
        let score = 0;
        console.log(data)

        if (data.rsi < 30) {
            score += 1; // Strong buy signal
        } else if (data.rsi < 40) {
            score += 0.5; // Mild buy signal
        } else if (data.rsi > 70) {
            score -= 1; // Strong sell signal
        } else if (data.rsi > 60) {
            score -= 0.5; // Mild sell signal
        }

        // EMA
        if (data.price > data.ema) score += 1;
        else score -= 1;

        // MACD
        const macdDiff = data.macd.macdLine - data.macd.signalLine;
        if (macdDiff > 0.5) score += 1;       // Strong bullish
        else if (macdDiff > 0.1) score += 0.5; // Mild bullish
        else if (macdDiff < -0.5) score -= 1;   // Strong bearish
        else if (macdDiff < -0.1) score -= 0.5; // Mild bearish

        // Bollinger Bands
        const bbPercent = (data.price - data.bollinger.lower) /
            (data.bollinger.upper - data.bollinger.lower) * 100;

        if (bbPercent < 10) score += 1;       // Very near lower band
        else if (bbPercent < 20) score += 0.5; // Approaching lower band
        else if (bbPercent > 90) score -= 1;   // Very near upper band
        else if (bbPercent > 80) score -= 0.5; // Approaching upper band

        // Recommendation
        if (score >= 3.5) {
            recommendation = 'STRONG BUY';
            recommendationClass = 'buy strong';
            explanation += '<p>Strong bullish consensus across multiple indicators.</p>';
        } else if (score >= 2.5) {
            recommendation = 'BUY';
            recommendationClass = 'buy';
            explanation += '<p>Clear bullish signals from multiple indicators.</p>';
        } else if (score >= 1.5) {
            recommendation = 'WEAK BUY';
            recommendationClass = 'buy weak';
            explanation += '<p>Mild bullish signals, consider confirmation.</p>';
        } else if (score <= -3.5) {
            recommendation = 'STRONG SELL';
            recommendationClass = 'sell strong';
            explanation += '<p>Strong bearish consensus across multiple indicators.</p>';
        } else if (score <= -2.5) {
            recommendation = 'SELL';
            recommendationClass = 'sell';
            explanation += '<p>Clear bearish signals from multiple indicators.</p>';
        } else if (score <= -1.5) {
            recommendation = 'WEAK SELL';
            recommendationClass = 'sell weak';
            explanation += '<p>Mild bearish signals, consider confirmation.</p>';
        } else if (score >= 1) {
            recommendation = 'SLIGHTLY BULLISH';
            recommendationClass = 'buy very-weak';
            explanation += '<p>Very mild bullish bias, but not significant.</p>';
        } else if (score <= -1) {
            recommendation = 'SLIGHTLY BEARISH';
            recommendationClass = 'sell very-weak';
            explanation += '<p>Very mild bearish bias, but not significant.</p>';
        } else {
            recommendation = 'NEUTRAL';
            recommendationClass = 'hold';
            explanation += '<p>Indicators show no clear directional bias.</p>';
        }
        explanation += `<p>Combined indicator score: <strong>${score.toFixed(1)}</strong></p>`;
    }

    const result = `
<style>
.buy.very-weak {
    background-color: rgba(0, 200, 83, 0.05);
    color: #69f0ae;
    border-left: 3px solid #69f0ae;
}

.sell.very-weak {
    background-color: rgba(255, 61, 0, 0.05);
    color: #ff9e80;
    border-left: 3px solid #ff9e80;
}
.strategy-analysis {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.strategy-analysis h2 {
    color: #2c3e50;
    border-bottom: 2px solid #eaeaea;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.explanation {
    background-color: #ffffff;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    line-height: 1.6;
}

.explanation p {
    margin: 10px 0;
}

/* Data Points Section */
.data-points {
    background-color: #e9f5ff;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
}

.data-points h3 {
    color: #2980b9;
    margin-top: 0;
}

.data-points p {
    margin: 8px 0;
    font-size: 15px;
}

/* Recommendation Styles */
.recommendation {
    padding: 15px;
    border-radius: 6px;
    text-align: center;
    font-weight: bold;
    font-size: 18px;
    margin-top: 20px;
}

/* Buy/Sell/Hold Color Coding */
.buy {
    background-color: #e8f5e9;
    color: #2e7d32;
    border-left: 5px solid #4caf50;
}

.buy.strong {
    background-color: #c8e6c9;
    font-size: 20px;
}

.buy.weak {
    background-color: #f1f8e9;
    color: #689f38;
}

.sell {
    background-color: #ffebee;
    color: #c62828;
    border-left: 5px solid #f44336;
}

.sell.strong {
    background-color: #ffcdd2;
    font-size: 20px;
}

.sell.weak {
    background-color: #ffebee;
    color: #e53935;
}

.neutral {
    background-color: rgba(255, 235, 59, 0.05);
    color: #ffd600;
    border-left: 3px solid #ffd600;
}

.hold {
    background-color: #fff8e1;
    color: #ff8f00;
    border-left: 5px solid #ffc107;
}

/* Strategy Info Specific Styles */
.strategy-info {
    margin-bottom: 15px;
}

.strategy-info h3 {
    color: #3f51b5;
    margin-bottom: 10px;
}

.strategy-info ul, .strategy-info ol {
    padding-left: 20px;
    margin: 10px 0;
}

.strategy-info li {
    margin-bottom: 8px;
}

/* Responsive Design */
@media (max-width: 600px) {
    .strategy-analysis {
        padding: 15px;
        margin: 10px;
    }
    
    .recommendation {
        font-size: 16px;
    }
}
</style>
        <div class="strategy-analysis">
            <h2>Strategy ${strategy} Analysis</h2>
            <div class="explanation">${explanation}</div>
            
            <div class="data-points">
                <h3>Market Data</h3>
                <p><strong>Asset Price:</strong> ${data.price}</p>
                <p><strong>RSI:</strong> ${data.rsi.toFixed(2)}</p>
                <p><strong>EMA:</strong> ${data.ema.toFixed(2)}</p>
                <p><strong>MACD:</strong> ${data.macd.macdLine.toFixed(2)} (Signal: ${data.macd.signalLine.toFixed(2)})</p>
                <p><strong>Bollinger Bands:</strong> [Upper: ${data.bollinger.upper.toFixed(2)}, Lower: ${data.bollinger.lower.toFixed(2)}]</p>
            </div>
            
            <div class="recommendation ${recommendationClass}">
                <h3>Recommendation</h3>
                <p>${recommendation}</p>
            </div>
        </div>
    `;

    return result;
}

module.exports = {analyzeStrategy};