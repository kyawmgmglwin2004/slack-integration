import pkg from '@slack/bolt';
const { App } = pkg;
import express from 'express';
import fs from 'fs';
import axios from 'axios';
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
  try {
    console.log("🔥 Event:", event);

   
    if (event.text && !event.files) {
      await client.chat.postMessage({
        channel: event.channel,
        text: `Message Received: ${event.text}`
      });
      return;
    }

    if (event.files && event.files.length > 0) {
      const file = event.files[0];

      console.log("📂 Step1: Raw file:", file);

      
      const fileInfo = await client.files.info({ file: file.id });

      const realFile = fileInfo.file;
      const downloadURL = realFile.url_private_download;
      const fileName = realFile.name;
      

      console.log("🔗 Real Download URL:", downloadURL);

      const savedPath = await saveSlackFile(downloadURL, fileName);

      await client.chat.postMessage({
        channel: event.channel,
        text: `✔ File saved at ${savedPath}`
      });

    }

  } catch (err) {
    console.log("❌ Error:", err);
  }
});



  
async function createChannel() {
  try {
    const channelName = `chat-${Date.now()}`;
    const result = await app.client.conversations.create({
    name: channelName,
    is_private: false  // use true for a private channel
  });

 const channelId = result.channel.id;

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
async function saveSlackFile(downloadURL, filename) {
  try {
    if (!fs.existsSync("./downloads")) fs.mkdirSync("./downloads");

    const filePath = `./downloads/${filename}`;

    const response = await axios.get(downloadURL, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
      }
    });

    fs.writeFileSync(filePath, response.data);
    console.log("📁 File saved:", filePath);

    return filePath;

  } catch (error) {
    console.log("❌ Save error:", error);
  }
}


// createChannel();
// disableUserGroup("C0A30AWP82C");
// getUserIdByEmail("phoekaung.3819@gmail.com");



(async () => {
  await app.start(); // Socket Mode starts internally
  console.log('⚡ Bolt app running in Socket Mode!');

  server.listen(PORT, () => {
    console.log(`🌐 Express server running on http://localhost:${PORT}`);
  });
})();
