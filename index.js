import express from "express";
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/slack/events", express.json());

app.get("/", (req, res) => {
  res.send("🔥 Server Running!");
});


app.post("/slack/events", async (req, res) => {

  // Challenge verify for Slack
  if (req.body.type === "url_verification") {
    console.log("🔐 URL Verified");
    return res.send(req.body.challenge);
  }

  const event = req.body.event;
  if (!event) return res.send("NO EVENT");

  console.log("🔥 Incoming Event:", event);

  try {
    // TEXT message only
    if (event.type === "message" && event.text && !event.files) {
      console.log("💬 Text message:", event.text);
      return res.send("OK");
    }
//url testing
    // FILE received
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      console.log("📁 File uploaded:", file.name);

      // GET real file info
      const fileInfo = await slackAPICall("/files.info", {
        file: file.id
      }, "GET");

      const downloadURL = fileInfo.file.url_private_download;
      const fileName = fileInfo.file.name;

      await saveSlackFile(downloadURL, fileName);

      console.log("✔ FILE SAVED SUCCESSFULLY");
      return res.send("OK");
    }

  } catch (err) {
    console.log("❌ Event handler error:", err);
  }

  res.send("OK");
});



async function slackAPICall(apiURL, data, method = "POST") {
  const requestConfig = {
    url: `https://slack.com/api${apiURL}`,
    method,
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json"
    }
  };

  if (method === "GET") requestConfig.params = data;
  else requestConfig.data = data;

  const response = await axios(requestConfig);

  if (!response.data.ok) throw response.data;

  return response.data;
}


export async function createChannel() {
  try {
    const channelName = `chat-${Date.now()}`;

    const result = await slackAPICall("/conversations.create", {
      name: channelName,
      is_private: false
    }, "POST");

    const channelId = result.channel.id;
    console.log("🔥 Channel Created:", channelId);

    const koKaung = "U0A22RE8ZM3";
    const agentId = "U0A1WJS2S0H";

    await slackAPICall("/conversations.invite", {
      channel: channelId,
      users: `${koKaung},${agentId}`
    }, "POST");

    await slackAPICall("/chat.postMessage", {
      channel: channelId,
      text: `👋 Welcome! Auto created channel`
    }, "POST");

  } catch (err) {
    console.log("❌ Create channel error:", err);
  }
}


async function rename(channelId) {
  await slackAPICall(
    "/conversations.rename",
    {
      channel: channelId,
      name: "kmml-" + Date.now()
    },
    "POST"
  );
}

async function kickUser(channelId, userId) {
  await slackAPICall(
    "/conversations.kick",
    { channel: channelId, user: userId },
    "POST"
  );
}


async function deleteChannel(channelId) {
  try {
    const result = await slackAPICall(
      "/conversations.archive",
      {
        channel: channelId
      },
      "POST"
    );

    console.log("🔥 Channel Deleted/Archived:");
    console.log(result);

  } catch (error) {
    console.log("❌ Delete Channel Error:", error);
  }
}

export async function getUserIdByEmail(email) {
  try {
    const response = await slackAPICall("/users.lookupByEmail", {
      email
    }, "GET");

    console.log("👤 Found user:", response.user.id);

    return response.user.id;

  } catch (err) {
    console.log("❌ Email lookup error:", err);
  }
}



async function saveSlackFile(downloadURL, fileName) {
  try {
    if (!fs.existsSync("./downloads")) fs.mkdirSync("./downloads");

    const filePath = `./downloads/${fileName}`;

    const response = await axios.get(downloadURL, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
      }
    });

    fs.writeFileSync(filePath, response.data);

    console.log("📁 File saved:", filePath);

  } catch (err) {
    console.log("❌ Save file error:", err);
  }
}

// getUserIdByEmail("phoekaung.3819@gmail.com")
createChannel()
// rename("C0A2K7KDCTT")
// kickUser("C0A2K7KDCTT", "U0A22RE8ZM3")


// deleteChannel("C0A2K7KDCTT");



app.listen(PORT, () => {
  console.log(`🌍 Running on http://localhost:${PORT}`);
  console.log("⚡ Ready to receive Slack callback");
});
