/**
 * Test script to verify Daily.co integration
 * Run with: node test-daily-integration.js
 */

require("dotenv").config({ path: ".env.local" });

const DAILY_API_KEY = process.env.DAILY_API_KEY;

if (!DAILY_API_KEY) {
  console.error("❌ DAILY_API_KEY is not set in .env.local");
  console.log("\n📝 Please add your Daily.co API key to .env.local:");
  console.log("   DAILY_API_KEY=your-daily-api-key-here");
  console.log(
    "\n🔗 Get your API key from: https://dashboard.daily.co/developers"
  );
  process.exit(1);
}

console.log("🔍 Testing Daily.co API Integration...\n");

async function testDailyAPI() {
  try {
    // Test 1: Create a test room
    console.log("1️⃣ Creating test room...");
    const createResponse = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `test-room-${Date.now()}`,
        privacy: "private",
        properties: {
          enable_recording: "cloud",
          enable_transcription: false,
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          enable_screenshare: true,
          enable_chat: true,
        },
      }),
    });

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      console.error("❌ Failed to create room:", createData);
      console.log("\n🔍 Common issues:");
      console.log("   - Invalid API key");
      console.log("   - Exceeded room limits (10 rooms on free tier)");
      console.log(
        "   - Check your Daily.co dashboard: https://dashboard.daily.co/"
      );
      process.exit(1);
    }

    console.log("✅ Room created successfully!");
    console.log(`   Room URL: ${createData.url}`);
    console.log(`   Room Name: ${createData.name}`);
    console.log(`   Recording: ${createData.config.enable_recording}`);

    // Test 2: Get room details
    console.log("\n2️⃣ Fetching room details...");
    const getResponse = await fetch(
      `https://api.daily.co/v1/rooms/${createData.name}`,
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
      }
    );

    const getData = await getResponse.json();

    if (!getResponse.ok) {
      console.error("❌ Failed to fetch room:", getData);
      process.exit(1);
    }

    console.log("✅ Room fetched successfully!");
    console.log(
      `   Created at: ${new Date(getData.created_at).toLocaleString()}`
    );

    // Test 3: Delete test room
    console.log("\n3️⃣ Cleaning up test room...");
    const deleteResponse = await fetch(
      `https://api.daily.co/v1/rooms/${createData.name}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
      }
    );

    if (!deleteResponse.ok) {
      console.warn(
        "⚠️  Failed to delete test room (might need manual cleanup)"
      );
    } else {
      console.log("✅ Test room deleted successfully!");
    }

    // Test 4: Check account limits
    console.log("\n4️⃣ Checking account limits...");
    const roomsResponse = await fetch("https://api.daily.co/v1/rooms", {
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    const roomsData = await roomsResponse.json();

    if (!roomsResponse.ok) {
      console.warn("⚠️  Could not fetch account info");
    } else {
      const totalRooms = roomsData.total_count || 0;
      console.log("✅ Account info:");
      console.log(`   Active rooms: ${totalRooms}`);
      console.log(`   Limit (free tier): 10 rooms`);

      if (totalRooms >= 9) {
        console.warn("\n⚠️  WARNING: You're approaching the room limit!");
        console.log(
          "   Consider cleaning up old rooms in your Daily.co dashboard."
        );
      }
    }

    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ All Daily.co API tests passed!");
    console.log("=".repeat(60));
    console.log("\n✨ Your Daily.co integration is ready!");
    console.log("\n📋 Next steps:");
    console.log("   1. Start your dev server: npm run dev");
    console.log("   2. Create a session in your dashboard");
    console.log('   3. Click "Start Video Call"');
    console.log('   4. Look for the red "Recording" indicator');
    console.log("\n🎥 The video call component will:");
    console.log("   - Create a room automatically");
    console.log("   - Enable cloud recording");
    console.log("   - Show camera/audio controls");
    console.log("   - Process recording after call ends");
  } catch (error) {
    console.error("\n❌ Error testing Daily.co API:");
    console.error(error.message);
    console.log("\n🔍 Troubleshooting:");
    console.log("   - Check your internet connection");
    console.log("   - Verify API key in .env.local");
    console.log("   - Visit: https://dashboard.daily.co/developers");
    process.exit(1);
  }
}

testDailyAPI();
