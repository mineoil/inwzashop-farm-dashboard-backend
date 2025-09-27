const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Node.js จะใช้ PORT ที่ Render กำหนดให้ หรือใช้ 3000 ถ้าทดสอบในเครื่องตัวเอง
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// Enable JSON body parsing for incoming webhooks
app.use(express.json());

// ------------------------------------------------
// 1. Webhook Endpoint (รับ HTTP POST Request จาก Farm App)
// ------------------------------------------------

// WEBHOOK URL: [Your Render URL]/api/webhook/farm-update
app.post('/api/webhook/farm-update', (req, res) => {
    const data = req.body;
    
    if (!data || !data.statistics) {
        return res.status(400).send({ message: "Invalid payload: 'statistics' missing." });
    }

    console.log([INWZASHOP WEBHOOK] Received Update: Gems=${data.statistics.gemsTotal});

    // Prepare payload to send to all connected dashboards
    const statsPayload = {
        type: 'GLOBAL_STATS',
        data: data.statistics 
    };

    // 2. Broadcast (Push) ข้อมูลใหม่ผ่าน WebSocket
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
    console.log('[INWZASHOP WS] New Dashboard connected.');

    // Send initial mock stats upon connection (replace with actual DB load in production)
    const initialStats = {
        gemsTotal: 5330,
        traitsTotal: 24,
        goldTotal: 15075,
        runtime: '00:00:00',
        matchWinRate: '0/0 (0%)',
        completedOrders: 12450,
        totalAccounts: 15
    };

    ws.send(JSON.stringify({ type: 'GLOBAL_STATS', data: initialStats }));

    ws.on('close', () => {
        console.log('[INWZASHOP WS] Dashboard disconnected.');
    });
});

// ------------------------------------------------
// 4. Start Server
// ------------------------------------------------

server.listen(PORT, () => {
    console.log(Inwzashop Server is running on port ${PORT});
    console.log(Webhook Listener Ready at /api/webhook/farm-update);
    console.log(WebSocket Server Ready at /ws);
});
