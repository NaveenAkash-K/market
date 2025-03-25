function strategyInfo(strategy) {
    const strategies = {
        1: `<div class="strategy-info">
                <h3>🔹 RSI Strategy (Relative Strength Index)</h3>
                <ul>
                    <li>RSI is a momentum indicator that measures the speed and change of price movements.</li>
                    <li>Values range from <strong>0 to 100</strong>.</li>
                    <li>A stock is considered <strong>oversold</strong> when RSI &lt; 30, signaling a <strong>buy opportunity</strong>.</li>
                    <li>A stock is considered <strong>overbought</strong> when RSI &gt; 70, signaling a <strong>sell opportunity</strong>.</li>
                    <li>Traders often look for <strong>RSI divergence</strong> to predict trend reversals.</li>
                </ul>
            </div>`,
        2: `<div class="strategy-info">
                <h3>🔹 EMA Strategy (Exponential Moving Average)</h3>
                <ul>
                    <li>EMA gives more weight to recent prices, making it <strong>more responsive</strong> than a simple moving average (SMA).</li>
                    <li><strong>Buy Signal:</strong> When price crosses <strong>above</strong> the EMA, indicating upward momentum.</li>
                    <li><strong>Sell Signal:</strong> When price crosses <strong>below</strong> the EMA, suggesting a downtrend.</li>
                    <li>Common EMA periods: <strong>9, 12, 26, 50, 200</strong> (shorter EMAs for fast trades, longer EMAs for trends).</li>
                    <li>Best combined with <strong>trend confirmation indicators</strong> like MACD.</li>
                </ul>
            </div>`,
        3: `<div class="strategy-info">
                <h3>🔹 MACD Strategy (Moving Average Convergence Divergence)</h3>
                <ul>
                    <li>MACD consists of a <strong>MACD line (12 EMA - 26 EMA)</strong> and a <strong>signal line (9 EMA of MACD line)</strong>.</li>
                    <li><strong>Buy Signal:</strong> When MACD <strong>crosses above</strong> the signal line, suggesting <strong>bullish momentum</strong>.</li>
                    <li><strong>Sell Signal:</strong> When MACD <strong>crosses below</strong> the signal line, indicating <strong>bearish momentum</strong>.</li>
                    <li>Traders also look at the <strong>MACD histogram</strong> for divergence and early trend reversals.</li>
                </ul>
            </div>`,
        4: `<div class="strategy-info">
                <h3>🔹 Bollinger Bands Strategy</h3>
                <ul>
                    <li>Uses <strong>3 bands</strong>:
                        <ul>
                            <li><strong>Middle Band:</strong> 20-day SMA</li>
                            <li><strong>Upper Band:</strong> +2 standard deviations from SMA</li>
                            <li><strong>Lower Band:</strong> -2 standard deviations from SMA</li>
                        </ul>
                    </li>
                    <li><strong>Buy Signal:</strong> When price touches or breaks <strong>below</strong> the lower band (potential reversal).</li>
                    <li><strong>Sell Signal:</strong> When price touches or breaks <strong>above</strong> the upper band.</li>
                    <li>Works best in <strong>range-bound markets</strong>, but bands also <strong>expand and contract</strong> based on volatility.</li>
                </ul>
            </div>`,
        5: `<div class="strategy-info">
                <h3>🔹 Combined Strategy (Multi-Indicator Confirmation)</h3>
                <ul>
                    <li>Uses a <strong>weighted approach</strong> combining RSI, EMA, MACD, and Bollinger Bands.</li>
                    <li>Decision-making process:
                        <ol>
                            <li><strong>RSI:</strong> Check if the asset is <strong>overbought (&gt;70) or oversold (&lt;30)</strong>.</li>
                            <li><strong>EMA:</strong> Identify trend direction (<strong>above EMA = bullish, below EMA = bearish</strong>).</li>
                            <li><strong>MACD:</strong> Look for crossover confirmations (<strong>bullish above, bearish below</strong>).</li>
                            <li><strong>Bollinger Bands:</strong> Detect <strong>volatility and price extremes</strong>.</li>
                        </ol>
                    </li>
                </ul>
                <h4>Possible Decisions Based on Indicators:</h4>
                <ul class="decision-list">
                    <li><span class="decision-strong-buy">✅ Strong Buy:</span> RSI &lt; 30, Price above EMA, MACD bullish, Near lower Bollinger Band.</li>
                    <li><span class="decision-buy">📈 Buy:</span> RSI is low, Price crossing EMA upwards, MACD shows mild strength.</li>
                    <li><span class="decision-strong-sell">❌ Strong Sell:</span> RSI &gt; 70, Price below EMA, MACD bearish, Near upper Bollinger Band.</li>
                    <li><span class="decision-sell">🔻 Sell:</span> RSI is high, Price crossing EMA downwards, MACD losing strength.</li>
                    <li><span class="decision-hold">⏳ Hold:</span> Indicators are mixed or neutral.</li>
                </ul>
            </div>`
    };
    return strategies[strategy] || '<div class="error">Invalid Strategy</div>';
}

module.exports = { strategyInfo };