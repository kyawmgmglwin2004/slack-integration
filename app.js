// // app.js
// import { App } from '@slack/bolt';
// import dotenv from 'dotenv';
// dotenv.config();

// const app = new App({
//   token: process.env.SLACK_BOT_TOKEN,
//   signingSecret: process.env.SLACK_SIGNING_SECRET
// });

// // ------------------------------------------------------------------
// // 1️⃣ START SERVER
// // ------------------------------------------------------------------
// (async () => {
//   try {
//     await app.start(process.env.PORT || 3000);
//     console.log('⚡️ Slack Bot is running!');

//     // Send a test message
//     await sendTestMessage();
//   } catch (error) {
//     console.error(error);
//   }
// })();

// // ------------------------------------------------------------------
// // Test message
// // ------------------------------------------------------------------
// async function sendTestMessage() {
//   try {
//     await app.client.chat.postMessage({
//       channel: process.env.CHANNEL_ID,
//       text: 'Hello from my Node.js bot!'
//     });

//     console.log('✅ Test message sent');
//   } catch (err) {
//     console.error('❌ Cannot send test message', err);
//   }
// }

// // ------------------------------------------------------------------
// // 2️⃣ CREATE GROUP / CHANNEL
// // ------------------------------------------------------------------
// export async function createGroup(name, isPrivate = false) {
//   try {
//     const result = await app.client.conversations.create({
//       name,
//       is_private: isPrivate
//     });

//     console.log('🎉 Group Created:', result.channel.id, result.channel.name);
//     return result.channel;
//   } catch (err) {
//     console.error('❌ Cannot create group =>', err.data?.error || err);
//   }
// }

// // example run:
// // createGroup('my-dev-group', false);
// // createGroup('secret-group', true);

// // ------------------------------------------------------------------
// // 3️⃣ DELETE GROUP
// // 👉 Slack deletes by ARCHIVE
// // ------------------------------------------------------------------
// export async function deleteGroup(channelId) {
//   try {
//     const result = await app.client.conversations.archive({
//       channel: channelId
//     });

//     console.log('🗑 Deleted Group:', channelId);
//     return result;
//   } catch (err) {
//     console.error('❌ Cannot delete group =>', err.data?.error || err);
//   }
// }

// // example run:
// // deleteGroup("C012345FSD"); 

// // ------------------------------------------------------------------
// // 4️⃣ LISTEN MESSAGE & SHOW IN CONSOLE
// // ------------------------------------------------------------------
// app.message(async ({ message }) => {
//   console.log("📩 Incoming message: ", message.text);
// });

// // ------------------------------------------------------------------
// // 5️⃣ LISTEN "hello" and reply
// // ------------------------------------------------------------------
// app.message(/hello/i, async ({ message, say }) => {
//   await say(`Hi <@${message.user}>! I am your bot 🤖`);
// });
 

import pkg from '@slack/bolt';
const { App } = pkg;

import dotenv from 'dotenv';
dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡ Bot Started');
})();

// Create channel
async function createGroup(name, isPrivate = false) {
  try {
    const res = await app.client.conversations.create({
      name,
      is_private: isPrivate
    });
    console.log("🎉 Group created:", res.channel.name);
    return res.channel;
  } catch (err) {
    console.log("❌ Failed creating group:", err.data?.error || err);
  }
}

/**
 * 🚀 When someone sends message:
 * 1) bot auto joins channel
 * 2) bot creates new group
 * 3) bot replies back
 */
app.message(async ({ message, say, client }) => {

  if (message.subtype === 'bot_message') return;

  console.log("📩 Message received:", message.text);

  // 1️⃣ Auto invite bot into channel
  try {
    await client.conversations.join({
      channel: message.channel
    });
    console.log("🤖 Bot auto joined channel");
  } catch (err) {
    console.log("⚠ Bot may already be in channel:", err.data?.error || err);
  }

  // 2️⃣ Create a new group
  const groupName = `auto-${message.user}-${Date.now()}`;
  const channel = await createGroup(groupName, false);

  // 3️⃣ Reply back
  if (channel?.id) {
    await say(`🎯 Auto created channel 👉 <#${channel.id}>`);
  }
});