// import pkg from '@slack/bolt';
// const { App } = pkg;
// import dotenv from 'dotenv';
// dotenv.config();

// // Print tokens for debugging
// console.log("BOT TOKEN:", process.env.SLACK_BOT_TOKEN);
// console.log("APP TOKEN:", process.env.SLACK_APP_TOKEN);

// // Start Slack App
// const app = new App({
//   token: process.env.SLACK_BOT_TOKEN,     // xoxb-...
//   appToken: process.env.SLACK_APP_TOKEN,  // xapp-...
//   socketMode: true,
// });

// // Listen ANY type of message
// app.event('message', async ({ event, client }) => {
//   console.log("🔥 EVENT RECEIVED:", event);

//   // Reply back to channel
//   if (event.channel) {
//     await client.chat.postMessage({
//       channel: event.channel,
//       text: `👋 Bot received: "Arr Bwar"`
//     });
//   }
// });

// // Health Check Route
// app.message(async ({ message }) => {
//   console.log("📌 Received through app.message:", message.text);
// });

// (async () => {
//   await app.start(process.env.PORT || 3000);
//   console.log("⚡ Bot is running in Socket Mode!");
// })();


// import pkg from '@slack/bolt';
// const { App } = pkg;
// import dotenv from 'dotenv';
// dotenv.config();

// const app = new App({
//   token: process.env.SLACK_BOT_TOKEN, // xoxb token
//   appToken: process.env.SLACK_APP_TOKEN, // xapp token
//   socketMode: true,
// });

// // When user types: "create group: project-x @U12345 @U88888"
// app.message(/^create group:/i, async ({ message, say, client }) => {
//   try {
//     const text = message.text;
//     const parts = text.split(":")[1].trim().split(/\s+/);

//     const channelName = parts[0]; // project-x
//     const members = parts.slice(1); // [ "<@U123>", "<@U888>" ]

//     console.log("Group Name:", channelName);
//     console.log("Members:", members);

//     // Create private channel
//     const res = await client.conversations.create({
//       name: channelName,
//       is_private: true
//     });

//     const channelId = res.channel.id;
//     console.log("Channel ID:", channelId);

//     // Convert <@U123ABC> into raw user ids
//     const userIds = members
//       .map(m => {
//         const match = m.match(/^<@([A-Z0-9]+)>$/i);
//         return match ? match[1] : null;
//       })
//       .filter(Boolean);

//     // auto invite bot
//     await client.conversations.invite({
//       channel: channelId,
//       users: message.user // <- creator invited
//     });

//     // invite users if exist
//     if (userIds.length > 0) {
//       await client.conversations.invite({
//         channel: channelId,
//         users: userIds.join(',')
//       });
//     }

//     await say(`✔ Created private group <#${channelId}>`);
//   } catch (err) {
//     console.log(err);
//     await say("❌ Error creating group");
//   }
// });

// // Start app
// (async () => {
//   await app.start(process.env.PORT || 3000);
//   console.log("⚡ Bot running for group creation!");
// })();


// import pkg from '@slack/bolt';
// const { App } = pkg;
// import dotenv from 'dotenv';
// dotenv.config();

// const app = new App({
//   token: process.env.SLACK_BOT_TOKEN,   // xoxb-...
//   appToken: process.env.SLACK_APP_TOKEN, // xapp-... for Socket Mode
//   socketMode: true,
// });

// // // Auto-create group when any message is sent
// app.event('message', async ({ event, client }) => {
//   try {
//     // ignore messages from the bot itself
//     const botUserId = process.env.BOT_USER_ID; // put your bot ID in .env
//     if (!event.user || event.user === botUserId) return;

//     const senderUserId = event.user;
//     const text = event.text || '';

//     console.log("New message:", text, "from user:", senderUserId);

//     // Generate a unique group name
//     const channelName = `chat-${Date.now()}`;

//     // Create private group
//     const res = await client.conversations.create({
//       name: channelName,
//       is_private: true
//     });
//     const channelId = res.channel.id;

//     // Invite bot + sender + agent
//     const agentId = 'U0A1WJS2S0H'; // your agent ID
//     const inviteUsers = [senderUserId, agentId];
//     await client.conversations.invite({
//       channel: channelId,
//       users: inviteUsers.join(',')
//     });

//     // Welcome message
//     await client.chat.postMessage({
//       channel: channelId,
//       text: `👋 Welcome! This private group <#${channelId}> has been created automatically.`
//     });

//     console.log(`Group created: ${channelName} (${channelId}) with users: ${inviteUsers.join(', ')}`);

//   } catch (err) {
//     console.error("Error auto-creating group:", err);
//   }
// });


// // Start the bot
// (async () => {
//   await app.start(process.env.PORT || 3000);
//   console.log("⚡ Bolt app running in Socket Mode!");
// })();


import pkg from '@slack/bolt';
const { App } = pkg;
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();


const PORT = process.env.PORT || 3000;
const server = express();

server.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,   // xoxb-...
  appToken: process.env.SLACK_APP_TOKEN, // xapp-... for Socket Mode
  socketMode: true,
});

app.event('message', async ({ event, client }) => {
  console.log("🔥 EVENT RECEIVED:", event);})
  
async function createChannel() {
  try {
    const channelName = `chat-${Date.now()}`;
    const result = await app.client.conversations.create({
    name: channelName,
    is_private: false  // use true for a private channel
  });

 const channelId = result.channel.id;

    // Invite bot + sender + agent
    const koKaung = "U0A22RE8ZM3";
    const agentId = 'U0A1WJS2S0H'; // your agent ID
    const inviteUsers = [koKaung ,agentId];
    await app.client.conversations.invite({
      channel: channelId,
      users: inviteUsers.join(',')
    });

    // Welcome message
    await app.client.chat.postMessage({
      channel: channelId,
      text: `👋 Welcome! This public group <#${channelId}> has been created automatically.`
    });

    console.log(`Group created: ${channelName} (${channelId}) with users: ${inviteUsers.join(', ')}`);

  } catch (error) {
    console.log("error :", error)
  }
}

async function disableUserGroup(userGroupId) {
  try {
    const result = await app.client.usergroups.disable({
      usergroup: userGroupId
    });

    console.log("User group disabled!", result);
  } catch (error) {
    console.log("Error disabling user group:", error);
  }
}

async function getUserIdByEmail(email) {
  try {
    const result = await app.client.users.lookupByEmail({
      email: email,
    });

    console.log("User info:", result.user);
    console.log("User ID:", result.user.id);

    return result.user.id;
  } catch (error) {
    console.log("Error fetching user by email:", error);
  }
}


// createChannel();
// disableUserGroup("C0A30AWP82C");
getUserIdByEmail("phoekaung.3189@gmail.com");



(async () => {
  await app.start(); // Socket Mode starts internally
  console.log('⚡ Bolt app running in Socket Mode!');

  server.listen(PORT, () => {
    console.log(`🌐 Express server running on http://localhost:${PORT}`);
  });
})();
