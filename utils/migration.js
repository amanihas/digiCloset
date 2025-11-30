import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../api";

/**
 * Migration utility to sync local AsyncStorage closet data to backend
 * This should be called once after user logs in to migrate their old data
 */
export const migrateLocalClosetToBackend = async (username, token) => {
  try {
    // Try to get the old local closet data
    const localClosetKey = `closet_${username}`;
    const localClosetData = await AsyncStorage.getItem(localClosetKey);

    if (!localClosetData) {
      console.log("No local closet data to migrate");
      return { success: true, migrated: 0 };
    }

    const localItems = JSON.parse(localClosetData);

    if (!Array.isArray(localItems) || localItems.length === 0) {
      console.log("No items to migrate");
      return { success: true, migrated: 0 };
    }

    console.log(`Found ${localItems.length} items to migrate...`);

    // Upload each item to the backend
    let migrated = 0;
    let failed = 0;

    for (const item of localItems) {
      try {
        await axios.post(
          `${API_BASE}/clothes`,
          {
            name: item.name,
            image: item.image,
            material: item.material || "N/A",
            category: item.category || "N/A",
            color: item.color,
            brand: item.brand,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        migrated++;
      } catch (err) {
        console.error(`Failed to migrate item: ${item.name}`, err.message);
        failed++;
      }
    }

    // After successful migration, remove the old local data
    if (migrated > 0) {
      await AsyncStorage.removeItem(localClosetKey);
      console.log(`Migration complete: ${migrated} items migrated, ${failed} failed`);
    }

    return { success: true, migrated, failed };
  } catch (err) {
    console.error("Migration error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Check if user has local data that needs migration
 */
export const hasLocalDataToMigrate = async (username) => {
  try {
    const localClosetKey = `closet_${username}`;
    const localClosetData = await AsyncStorage.getItem(localClosetKey);

    if (!localClosetData) return false;

    const localItems = JSON.parse(localClosetData);
    return Array.isArray(localItems) && localItems.length > 0;
  } catch (err) {
    console.error("Check migration error:", err);
    return false;
  }
};
