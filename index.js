const readline = require('readline');
const {fetchMarketData} = require("./fetchMarketData");
const {strategyInfo} = require("./strategyInfo");
const {analyzeStrategy} = require("./analyseStrategy");
const express = require('express');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

const cron = require('node-cron');
const nodemailer = require('nodemailer');

// Add this near your other require statements
const previousRecommendations = {}; // Store previous recommendations

// Email configuration (replace with your actual email service credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
        user: 'naveen.akash0904@gmail.com',
        pass: 'wrie smgu nvmn mrrl'
    }
});

app.get("/email", async (req, res) => {
    checkRecommendations();
    res.send()
})

// Function to check recommendations and send email if changed
async function checkRecommendations() {
    const assets = ['nifty', 'gold', 'silver', 'bitcoin'];
    const changes = [];

    for (const asset of assets) {
        try {
            const marketData = await fetchMarketData(asset);
            if (!marketData) continue;

            const analysis = analyzeStrategy(5, marketData); // Using strategy 5 (Combined)
            const currentRecommendation = extractRecommendation(analysis);

            if (previousRecommendations[asset] &&
                previousRecommendations[asset] !== currentRecommendation) {
                changes.push({
                    asset,
                    from: previousRecommendations[asset],
                    to: currentRecommendation,
                    analysis
                });
            }

            previousRecommendations[asset] = currentRecommendation;
        } catch (error) {
            console.error(`Error checking ${asset}:`, error);
        }
    }

    if (changes.length > 0) {
        await sendNotificationEmail(changes);
    }
    // await sendNotificationEmail(changes);


}

// Helper function to extract the recommendation from analysis HTML
function extractRecommendation(analysis) {
    const match = analysis.match(/<div class="recommendation[^"]*">[\s\S]*?<p>([^<]*)<\/p>/);
    return match ? match[1].trim() : null;
}

// Function to send email notification
async function sendNotificationEmail(changes) {
    const mailOptions = {
        from: 'naveen.akash0904@gmail.com',
        to: 'naveen.akash0904@gmail.com', // or any recipient
        subject: 'Trading Strategy Recommendation Changes',
        html: buildEmailContent(changes)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Notification email sent');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Function to build HTML email content
function buildEmailContent(changes) {
    let html = `
    <h2>Trading Strategy Recommendation Changes</h2>
    <p>Detected at: ${new Date().toLocaleString()}</p>
    <table border="1" cellpadding="5" cellspacing="0">
      <tr>
        <th>Asset</th>
        <th>From</th>
        <th>To</th>
      </tr>
  `;

    changes.forEach(change => {
        html += `
      <tr>
        <td>${change.asset.toUpperCase()}</td>
        <td>${change.from}</td>
        <td>${change.to}</td>
      </tr>
    `;
    });

    html += `</table>`;

    return html;
}

// Schedule the cron job to run every 10 minutes
cron.schedule('*/10 * * * *', () => {
    console.log('Running recommendation check...');
    checkRecommendations();
});


app.get('/market-data', async (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Market Data Dashboard</title>
        <style>
            body {
                background-color: #121212;
                color: #ffffff;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                color: #00bcd4;
                text-align: center;
                margin-bottom: 30px;
            }
            .asset-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            .asset-card {
                background-color: #1e1e1e;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                transition: transform 0.3s, box-shadow 0.3s;
                border: 1px solid #333;
            }
            .asset-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0, 188, 212, 0.3);
                border-color: #00bcd4;
            }
            .asset-card a {
                color: #ffffff;
                text-decoration: none;
                font-size: 18px;
                display: block;
                height: 100%;
            }
            .asset-card a:hover {
                color: #00bcd4;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Market Data Dashboard</h1>
            <div class="asset-grid">
                <div class="asset-card">
                    <a href="http://localhost:3000/market-data/nifty">Nifty 50</a>
                </div>
                <div class="asset-card">
                    <a href="http://localhost:3000/market-data/gold">Gold</a>
                </div>
                <div class="asset-card">
                    <a href="http://localhost:3000/market-data/silver">Silver</a>
                </div>
                <div class="asset-card">
                    <a href="http://localhost:3000/market-data/bitcoin">Bitcoin</a>
                </div>
            </div>
            <div class="footer">
                Trading Dashboard • ${new Date().toLocaleDateString()}
            </div>
        </div>
    </body>
    </html>
    `);
});

app.get('/market-data/:asset', async (req, res) => {
    const {asset} = req.params;
    const assetNames = {
        nifty: "Nifty 50",
        gold: "Gold",
        silver: "Silver",
        bitcoin: "Bitcoin"
    };

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>${assetNames[asset] || asset} Strategies</title>
        <style>
            body {
                background-color: #121212;
                color: #ffffff;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                color: #00bcd4;
                text-align: center;
                margin-bottom: 30px;
            }
            .strategy-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .strategy-card {
                background-color: #1e1e1e;
                border-radius: 8px;
                padding: 15px 20px;
                transition: transform 0.3s, box-shadow 0.3s;
                border: 1px solid #333;
            }
            .strategy-card:hover {
                transform: translateX(5px);
                box-shadow: 0 5px 15px rgba(0, 188, 212, 0.3);
                border-color: #00bcd4;
            }
            .strategy-card a {
                color: #ffffff;
                text-decoration: none;
                font-size: 16px;
                display: flex;
                align-items: center;
            }
            .strategy-card a:hover {
                color: #00bcd4;
            }
            .strategy-number {
                display: inline-block;
                width: 25px;
                height: 25px;
                background-color: #00bcd4;
                color: #121212;
                border-radius: 50%;
                text-align: center;
                line-height: 25px;
                margin-right: 15px;
                font-weight: bold;
            }
            .back-link {
                display: inline-block;
                margin-top: 20px;
                color: #666;
                text-decoration: none;
            }
            .back-link:hover {
                color: #00bcd4;
            }
            .asset-header {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 20px;
            }
            .asset-icon {
                font-size: 24px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="asset-header">
                <span class="asset-icon">${getAssetIcon(asset)}</span>
                <h1>${assetNames[asset] || asset} Strategies</h1>
            </div>
            
            <div class="strategy-list">
                <div class="strategy-card">
                    <a href="http://localhost:3000/market-data/${asset}/1">
                        <span class="strategy-number">1</span> RSI Strategy
                    </a>
                </div>
                <div class="strategy-card">
                    <a href="http://localhost:3000/market-data/${asset}/2">
                        <span class="strategy-number">2</span> EMA Strategy
                    </a>
                </div>
                <div class="strategy-card">
                    <a href="http://localhost:3000/market-data/${asset}/3">
                        <span class="strategy-number">3</span> MACD Strategy
                    </a>
                </div>
                <div class="strategy-card">
                    <a href="http://localhost:3000/market-data/${asset}/4">
                        <span class="strategy-number">4</span> Bollinger Bands
                    </a>
                </div>
                <div class="strategy-card">
                    <a href="http://localhost:3000/market-data/${asset}/5">
                        <span class="strategy-number">5</span> Combined Strategy
                    </a>
                </div>
            </div>
            
            <a href="http://localhost:3000/market-data" class="back-link">← Back to all assets</a>
        </div>
    </body>
    </html>
    `);
});

// Helper function for asset icons
function getAssetIcon(asset) {
    const icons = {
        nifty: "📈",
        gold: "🥇",
        silver: "🥈",
        bitcoin: "₿"
    };
    return icons[asset] || "💹";
}

app.get('/market-data/:asset/:strategy', async (req, res) => {
    const {asset, strategy} = req.params;
    const marketData = await fetchMarketData(asset);
    if (!marketData) return rl.close();

    let output = "";

    output += `<style>.strategy-info {
        background-color: #f8f9fa;
        border-left: 4px solid #007bff;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 0 4px 4px 0;
    }

        .strategy-info h3 {
            color: #2c3e50;
            margin-top: 0;
        }

        .strategy-info ul, .strategy-info ol {
            padding-left: 20px;
        }

        .decision-list {
            list-style-type: none;
            padding-left: 0;
        }

        .decision-strong-buy { color: #28a745; font-weight: bold; }
        .decision-buy { color: #5cb85c; }
        .decision-strong-sell { color: #dc3545; font-weight: bold; }
        .decision-sell { color: #d9534f; }
        .decision-hold { color: #6c757d; }</style>`

    // output += strategyInfo(parseInt(strategy))
    output += analyzeStrategy(parseInt(strategy), marketData);


    res.send(output);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});