const MODULE_ID = "crimson-lounge";           // Your module ID
const MAP_JSON_PATH = "modules/crimson-lounge/content/crimson-lounge-map.json";

// --- Step 1: Register a setting to store the license key ---
Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "licenseKey", {
    name: "License Key",
    scope: "world",
    config: false,   // hidden from settings UI
    type: String,
    default: ""
  });
});

// --- Step 2: Prompt GM for key on world ready ---
Hooks.once("ready", async () => {
  if (!game.user.isGM) return;  // Only GM unlocks content

  let key = game.settings.get(MODULE_ID, "licenseKey");

  if (!key || !validateKey(key)) {
    await promptForKey();
  } else {
    await unlockMap();
  }
});

// --- Step 3: Validate the key ---
function validateKey(key) {
  // Replace these with your own keys
  const VALID_KEYS = [
    "CRIMSON-1234-ABCD",
    "CRIMSON-5678-EFGH"
  ];
  return VALID_KEYS.includes(key);
}

// --- Step 4: Prompt dialog for entering key ---
async function promptForKey() {
  return new Promise(resolve => {
    new Dialog({
      title: "Crimson Lounge – Premium",
      content: `
        <p>Enter your license key to unlock the Crimson Lounge map:</p>
        <input id="cl-key" type="text" style="width:100%">
      `,
      buttons: {
        unlock: {
          label: "Unlock",
          callback: async (html) => {
            const key = html.find("#cl-key").val().trim();
            if (!validateKey(key)) {
              ui.notifications.error("Invalid license key!");
              resolve(promptForKey());  // Retry
              return;
            }

            await game.settings.set(MODULE_ID, "licenseKey", key);
            ui.notifications.info("License key valid! Unlocking map...");
            await unlockMap();
            resolve();
          }
        }
      },
      default: "unlock",
      close: () => resolve()
    }).render(true);
  });
}

// --- Step 5: Unlock the map scene ---
async function unlockMap() {
  try {
    const response = await fetch(MAP_JSON_PATH);
    if (!response.ok) throw new Error("Failed to fetch map JSON");
    const sceneData = await response.json();

    // Avoid duplicates
    if (!game.scenes.find(s => s.name === sceneData.name)) {
      await Scene.create(sceneData);
      ui.notifications.info("Crimson Lounge map unlocked!");
      console.log("Crimson Lounge map unlocked");
    }
  } catch (err) {
    console.error("Failed to unlock Crimson Lounge map:", err);
    ui.notifications.error("Failed to unlock map. Check console.");
  }
}