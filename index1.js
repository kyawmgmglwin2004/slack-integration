  import express from "express";
  import axios from "axios";

  const app = express();

  app.get("/slack/callback", async (req, res) => {
    const code = req.query.code; // Slack gives code here

    // Then exchange code for access token
    const result = await axios.post("https://slack.com/api/oauth.v2.access", null, {
      params: {
        code,
        client_id: 10045331936723.10042740265351,
        client_secret: "5d92c7400d6ae84d1eb70a2b318d37eb",
      }
    });

    console.log(result.data);

    res.send("Authorization successful! You can close this window.");
  });

  app.listen(3000, () => console.log("App running on port 3000"));

// app.js
// import pkg from '@slack/bolt';
// const { App } = pkg;

// import dotenv from 'dotenv';
// dotenv.config();

// const app = new App({
//   token: process.env.SLACK_BOT_TOKEN,
//   signingSecret: process.env.SLACK_SIGNING_SECRET
// });

// // 1️⃣ Simple test message on startup
// (async () => {
//   try {
//     await app.start(process.env.PORT || 3000);
//     console.log('⚡️ Slack Bot is running!');

//     // Send a test message
//     await app.client.chat.postMessage({
//       channel: process.env.CHANNEL_ID,
//       text: 'Hello from my Node.js bot!'
//     });

//     console.log('✅ Test message sent!');
//   } catch (error) {
//     console.error(error);
//   }
// })();

// // 2️⃣ Listen to messages and auto-reply
// app.message(/hello/i, async ({ message, say }) => {
//   await say(`Hi <@${message.user}>! I am your bot 🤖`);
// });

// import pkg from '@slack/bolt';
// const { App } = pkg;

// import dotenv from 'dotenv';
// dotenv.config();

// const app = new App({
//   token: process.env.SLACK_BOT_TOKEN,
//   signingSecret: process.env.SLACK_SIGNING_SECRET
// });

// (async () => {
//   await app.start(process.env.PORT || 3000);
//   console.log('⚡ Bot Started');
// })();

// // Create channel
// async function createGroup(name, isPrivate = false) {
//   try {
//     const res = await app.client.conversations.create({
//       name,
//       is_private: isPrivate
//     });
//     console.log("🎉 Group created:", res.channel.name);
//     return res.channel;
//   } catch (err) {
//     console.log("❌ Failed creating group:", err.data?.error || err);
//   }
// }

// /**
//  * 🚀 When someone sends message:
//  * 1) bot auto joins channel
//  * 2) bot creates new group
//  * 3) bot replies back
//  */
// app.message(async ({ message, say, client }) => {

//   if (message.subtype === 'bot_message') return;

//   console.log("📩 Message received:", message.text);

//   // 1️⃣ Auto invite bot into channel
//   try {
//     await client.conversations.join({
//       channel: message.channel
//     });
//     console.log("🤖 Bot auto joined channel");
//   } catch (err) {
//     console.log("⚠ Bot may already be in channel:", err.data?.error || err);
//   }

//   // 2️⃣ Create a new group
//   const groupName = `auto-${message.user}-${Date.now()}`;
//   const channel = await createGroup(groupName, false);

//   // 3️⃣ Reply back
//   if (channel?.id) {
//     await say(`🎯 Auto created channel 👉 <#${channel.id}>`);
//   }
// });