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


createChannel();
// disableUserGroup("C0A30AWP82C");


(async () => {
  await app.start(); // Socket Mode starts internally
  console.log('⚡ Bolt app running in Socket Mode!');

  server.listen(PORT, () => {
    console.log(`🌐 Express server running on http://localhost:${PORT}`);
  });
})();
