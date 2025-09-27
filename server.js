const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Node.js will use the PORT set by Render, or use 3000 for local testing
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// Enable JSON body parsing for incoming webhooks
app.use(express.json());

// ------------------------------------------------
// 1. Webhook Endpoint (Receives HTTP POST Request from Farm App)
// ------------------------------------------------

// WEBHOOK URL:https://inwzashop-farm-dashboard-backend-1.onrender.com/api/webhook/farm-update
app.post('/api/webhook/farm-update', (req, res) => {
    const data = req.body;
    
    if (!data || !data.statistics) {
        return res.status(400).send({ message: "Invalid payload: 'statistics' missing." });
    }

    // Log the received update
    console.log(`[INWZASHOP LOG] Received Update: Gems=${data.statistics.gemsTotal}`);

    // Prepare payload to send to all connected dashboards
    const statsPayload = {
        type: 'GLOBAL_STATS',
        data: data.statistics 
    };

    // 2. Broadcast (Push) the new data via WebSocket
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(statsPayload));
        }
    });

    res.status(200).send({ message: "Webhook received and data broadcasted successfully." });
});

// ------------------------------------------------
// 3. WebSocket Server Initialization
// ------------------------------------------------

// WebSocket URL: [Your Render URL]/ws
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
    console.log('[INWZASHOP LOG] New Dashboard connected.');

    // Send initial mock stats upon connection
    const initialStats = {
        gemsTotal: 5330,
        traitsTotal: 24,
        goldTotal: 15075,
        runtime: '03:30:00',
        matchWinRate: '18/20 (90%)',
        completedOrders: 12450,
        totalAccounts: 15
    };

    ws.send(JSON.stringify({ type: 'GLOBAL_STATS', data: initialStats }));

    ws.on('close', () => {
        console.log('[INWZASHOP LOG] Dashboard disconnected.');
    });
});

// ------------------------------------------------
// 4. Start Server
// ------------------------------------------------

server.listen(PORT, () => {
    console.log(`Inwzashop Server is running on port ${PORT}`);
    console.log(`Webhook Listener Ready at /api/webhook/farm-update`);
    console.log(`WebSocket Server Ready at /ws`);
});
