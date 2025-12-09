import express from "express";
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/slack/events", express.json());
app.get("/", (req, res) => {
    res.send("Hello")
})

// =================== SLACK CALLBACK ===================
app.post("/slack/events", async (req, res) => {
  // Slack verification
  if (req.body.type === "url_verification") {
    console.log("🔐 Challenge Verified");
    return res.send(req.body.challenge);
  }

  const event = req.body.event;
  if (!event) return res.send("NO EVENT");

  console.log("🔥 EVENT RECEIVED:", event);

  try {
    // TEXT ONLY
    if (event.type === "message" && event.text && !event.files) {
      console.log("💬 TEXT:", event.text);
      return res.send("OK");
    }

    // FILE RECEIVED
    if (event.files && event.files.length > 0) {
      const file = event.files[0];

      console.log("📁 File Received:", file.name);

      // Get file info
      const fileInfo = await slackAPICall("/files.info", {
        file: file.id
      });

      const downloadURL = fileInfo.file.url_private_download;
      const fileName = fileInfo.file.name;

      await saveSlackFile(downloadURL, fileName);
      console.log("✔ FILE SAVED SUCCESSFULLY");
      return res.send("OK");
    }

  } catch (error) {
    console.log("❌ Error:", error);
  }

  res.send("OK");
});


// ======================= FUNCTIONS =======================

// Unified API caller
async function slackAPICall(apiURL, data) {
  const response = await axios.post(`https://slack.com/api${apiURL}`, data, {
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.data.ok) throw response.data;
  return response.data;
}



// 1️⃣ Create channel
export async function createChannel() {
  try {
    const channelName = `chat-${Date.now()}`;

    const response = await slackAPICall("/conversations.create", {
      name: channelName,
      is_private: false
    });

    const channelId = response.channel.id;

    console.log("🔥 Channel Created:", channelId);

    // INVITE USERS
    const koKaung = "U0A22RE8ZM3";
    const agentId = 'U0A1WJS2S0H'; // your agent ID
    const inviteUsers = [koKaung ,agentId];
    await slackAPICall("/conversations.invite", {
      channel: channelId,
      users: inviteUsers.join(',') // your users here
    });

    // SEND WELCOME MESSAGE
    await slackAPICall("/chat.postMessage", {
      channel: channelId,
      text: `Welcome! Group created automatically.`
    });

  } catch (err) {
    console.log("❌ Channel Create Error:", err);
  }
}



// 2️⃣ Disable User Group
export async function disableUserGroup(userGroupId) {
  try {
    const result = await slackAPICall("/usergroups.disable", {
      usergroup: userGroupId
    });

    console.log("🚫 Usergroup Disabled", result);

  } catch (err) {
    console.log("❌ Disable Error", err);
  }
}



// 3️⃣ Get userId from email
export async function getUserIdByEmail(email) {
  try {
    const result = await slackAPICall("/users.lookupByEmail", {
      email: email
    });

    console.log("👤 USER FOUND:", result.user.id);

    return result.user.id;

  } catch (err) {
    console.log("❌ Email lookup error", err);
  }
}



// 4️⃣ Save File Function
async function saveSlackFile(downloadURL, filename) {
  try {
    if (!fs.existsSync("./downloads")) fs.mkdirSync("./downloads");

    const path = `./downloads/${filename}`;

    const response = await axios.get(downloadURL, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
      }
    });

    fs.writeFileSync(path, response.data);
    console.log("📁 File saved at:", path);

  } catch (err) {
    console.log("❌ File save error:", err);
  }
}

// createChannel();
// disableUserGroup("C0A235UCUKG");
getUserIdByEmail("phoekaung.3819@gmail.com")

// ======================= SERVER RUN =======================
app.listen(PORT, () => {
  console.log(`🌍 Server Started on http://localhost:${PORT}`);
});
