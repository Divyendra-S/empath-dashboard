/**
 * Debug script to test Daily.co API key
 * Run with: node debug-daily-api.js
 */

const fs = require("fs");
const path = require("path");

// Read .env.local file manually
const envPath = path.join(__dirname, ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local file not found!");
  console.log("\n📝 Please create .env.local with your Daily.co API key:");
  console.log("\nCreate the file at:", envPath);
  console.log("\nAnd add:");
  console.log("DAILY_API_KEY=your-daily-api-key-here");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const lines = envContent.split("\n");
let DAILY_API_KEY = null;

for (const line of lines) {
  if (line.startsWith("DAILY_API_KEY=")) {
    DAILY_API_KEY = line.split("=")[1].trim();
    break;
  }
}

console.log("🔍 Daily.co API Key Debug\n");
console.log("=".repeat(60));

if (!DAILY_API_KEY) {
  console.error("❌ DAILY_API_KEY not found in .env.local");
  console.log("\n📝 Current .env.local content:");
  console.log(envContent);
  console.log("\n💡 Add this line to .env.local:");
  console.log("DAILY_API_KEY=your-daily-api-key-here");
  process.exit(1);
}

console.log("✅ API Key found in .env.local");
console.log(`   Length: ${DAILY_API_KEY.length} characters`);
console.log(`   First 10 chars: ${DAILY_API_KEY.substring(0, 10)}...`);
console.log(`   Last 5 chars: ...${DAILY_API_KEY.slice(-5)}`);

// Test the API key
async function testDailyAPI() {
  console.log("\n" + "=".repeat(60));
  console.log("Testing Daily.co API...\n");

  try {
    // Test 1: List existing rooms (simpler test)
    console.log("1️⃣ Testing API key by listing rooms...");
    const listResponse = await fetch("https://api.daily.co/v1/rooms", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    const listData = await listResponse.json();

    console.log(`   Status: ${listResponse.status} ${listResponse.statusText}`);

    if (!listResponse.ok) {
      console.error("❌ API key is INVALID or has issues!");
      console.error("   Response:", JSON.stringify(listData, null, 2));
      console.log("\n🔍 Common issues:");
      console.log("   1. API key is incorrect");
      console.log("   2. API key doesn't have permissions");
      console.log("   3. Account suspended or expired");
      console.log("\n📝 To fix:");
      console.log("   1. Go to: https://dashboard.daily.co/developers");
      console.log("   2. Create a new API key");
      console.log("   3. Update .env.local with the new key");
      process.exit(1);
    }

    console.log("✅ API key is VALID!");
    console.log(`   Total rooms: ${listData.total_count || 0}`);

    if (listData.data && listData.data.length > 0) {
      console.log("\n   Existing rooms:");
      listData.data.slice(0, 3).forEach((room) => {
        console.log(`   - ${room.name} (${room.privacy})`);
      });
    }

    // Test 2: Try creating a room
    console.log("\n2️⃣ Creating test room...");
    const testRoomName = `test-room-${Date.now()}`;

    const createResponse = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: testRoomName,
        privacy: "private",
        properties: {
          enable_recording: "cloud",
          enable_transcription: false,
          exp: Math.floor(Date.now() / 1000) + 3600,
          enable_screenshare: true,
          enable_chat: true,
        },
      }),
    });

    const createData = await createResponse.json();

    console.log(
      `   Status: ${createResponse.status} ${createResponse.statusText}`
    );

    if (!createResponse.ok) {
      console.error("❌ Failed to create room!");
      console.error("   Response:", JSON.stringify(createData, null, 2));

      if (createResponse.status === 429) {
        console.log("\n⚠️  Rate limit exceeded!");
        console.log("   Wait a few minutes and try again.");
      } else if (createResponse.status === 403) {
        console.log("\n⚠️  Permission denied!");
        console.log(
          "   Your API key might not have room creation permissions."
        );
      } else if (createData.error === "room-exists") {
        console.log("\n⚠️  Room name already exists!");
        console.log("   This is actually OK - your API works!");
      } else if (createData.info?.includes("limit")) {
        console.log("\n⚠️  Room limit reached!");
        console.log("   Free tier: 10 rooms maximum");
        console.log("   Delete old rooms at: https://dashboard.daily.co/rooms");
      }

      // Don't exit if room already exists
      if (createData.error !== "room-exists") {
        process.exit(1);
      }
    } else {
      console.log("✅ Room created successfully!");
      console.log(`   URL: ${createData.url}`);
      console.log(`   Name: ${createData.name}`);

      // Clean up
      console.log("\n3️⃣ Cleaning up test room...");
      await fetch(`https://api.daily.co/v1/rooms/${testRoomName}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
      });
      console.log("✅ Test room deleted");
    }

    // Final result
    console.log("\n" + "=".repeat(60));
    console.log("✅ Daily.co API is working correctly!");
    console.log("=".repeat(60));
    console.log("\n✨ Your integration is ready!");
    console.log("\n📋 Next steps:");
    console.log("   1. Restart your dev server: npm run dev");
    console.log("   2. Try starting a video call again");
    console.log("   3. Check browser console for errors");
  } catch (error) {
    console.error("\n❌ Network or connection error:");
    console.error("   ", error.message);
    console.log("\n🔍 Troubleshooting:");
    console.log("   - Check your internet connection");
    console.log("   - Try again in a few seconds");
    console.log("   - Check if Daily.co is down: https://status.daily.co/");
    process.exit(1);
  }
}

testDailyAPI();
