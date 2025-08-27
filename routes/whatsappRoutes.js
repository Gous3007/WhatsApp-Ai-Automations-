const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsappController");

// Routes
router.get("/scanner", whatsappController.getScanner);
router.get("/send", whatsappController.getSendPage);
router.post("/send-messages", whatsappController.sendMessages);

module.exports = router;
