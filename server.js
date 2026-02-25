const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const TWELVE_API_KEY = "b7b421d465994b5f97f146413c036fd6";

app.post('/get-signal', async (req, res) => {
    const { symbol } = req.body;
    try {
        const response = await axios.get(`https://api.twelvedata.com/time_series`, {
            params: { symbol, interval: "5min", outputsize: 50, apikey: TWELVE_API_KEY }
        });

        const candles = response.data.values || [];
        if (!candles || candles.length < 2) return res.json({ signal: "HOLD", rsi: 50 });

        const lastClose = parseFloat(candles[0].close);
        const prevClose = parseFloat(candles[1].close);
        const momentum = ((lastClose - prevClose) / prevClose) * 100;

        let signal = "HOLD";
        if (momentum > 0.05) signal = "BUY";
        if (momentum < -0.05) signal = "SELL";

        res.json({ signal, rsi: momentum });
    } catch (err) {
        res.status(500).json({ error: "API Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Brain live on port ${PORT}`));

