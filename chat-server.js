// سيرفر دردشة WebSocket بسيط — يبث رسائل لكل من يتصل.
// شغّله على جهازك/VPS الخاص بك (ليس داخل الـ dylib)، ثم ضع عنوانه في زر
// «الدردشة المباشرة» داخل التطبيق (مثال: 1.2.3.4:8080).
//
// تشغيل:
//   npm init -y && npm install ws
//   node chat-server.js

const WebSocket = require("ws");

const PORT = 8080;
const server = new WebSocket.Server({ port: PORT });

const clients = new Set();

server.on("connection", (socket) => {
  clients.add(socket);
  console.log(`عميل جديد متصل (${clients.size} متصل الآن)`);

  socket.on("message", (data) => {
    // أي رسالة تصل من أي عميل تُعاد بثها لكل المتصلين (اختياري)
    let text = data.toString();
    try {
      const j = JSON.parse(text);
      if (j && typeof j.text === "string") text = j.text;
    } catch (_) {}
    sendToAllOnline(text);
  });

  socket.on("close", () => {
    clients.delete(socket);
    console.log(`عميل خرج (${clients.size} متصل الآن)`);
  });
});

function sendToAllOnline(message) {
  let sent = 0;

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "message",
        text: message
      }));

      sent++;
    }
  }

  console.log(`تم الإرسال إلى ${sent} مستخدم`);
}

sendToAllOnline("مرحباً بالجميع!");

console.log(`Chat server running on port ${PORT}`);
