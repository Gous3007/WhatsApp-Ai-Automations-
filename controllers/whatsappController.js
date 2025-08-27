const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

let client;
let isConnected = false;
let ioInstance;

// WhatsApp Init Function
const initWhatsApp = (io) => {
    ioInstance = io;

    client = new Client({
        authStrategy: new LocalAuth({ clientId: "multiDeviceBot" }),
        puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] }
    });

    client.on("qr", async (qr) => {
        const qrImage = await qrcode.toDataURL(qr);
        io.emit("qr", qrImage);
    });

    client.on("ready", () => {
        isConnected = true;
        io.emit("connected", true);
    });

    client.initialize();
};

// Scanner Page
exports.getScanner = (req, res) => {
    if (isConnected) {
        return res.redirect("/send");
    }
    res.render("scanner");
};

// Send Page
exports.getSendPage = (req, res) => {
    if (!isConnected) {
        return res.redirect("/scanner");
    }
    res.render("send");
};
// Send Message Controller
exports.sendMessages = async (req, res) => {
    try {
        let { numbers, message } = req.body;
        if (typeof numbers === "string") {
            numbers = numbers.split(/\s+/).filter(n => n.trim() !== "");
        }

        let counter = 0;

        numbers.forEach((num, index) => {
            setTimeout(async () => {
                try {
                    const chatId = num.includes("@c.us") ? num : `${num}@c.us`;
                    await client.sendMessage(chatId, message);

                    counter++;
                    ioInstance.emit("progress", { sent: counter, total: numbers.length });

                } catch (error) {
                    console.error(`❌ Failed to send to ${num}:`, error.message);
                }
            }, index * 3000); // 3 sec per msg
        });

        res.json({ status: "started", total: numbers.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports.initWhatsApp = initWhatsApp;
