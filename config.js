module.exports = {
  // Ganti dengan token bot Anda
  BOT_TOKEN: "MTQzMzcxMTEzOTc0MDQ1MDgxOA.GxODZ0.4IxLGHhnxLzBkscAzasp9Tt3gUtNKfFf4KrUs4",
  
  // Client ID bot Anda
  CLIENT_ID: "1433711139740450818",
  
  // User ID khusus yang dapat bonus
  SPECIAL_USER_ID: "1433676167554011166",
  
  // Footer configuration
  FOOTER: {
    text: "Made By Natakenshi Dev",
    iconURL: "https://cdn.discordapp.com/attachments/1007988669807857706/1393547088343601232/Desain_tanpa_judul_66.png"
  },
  
  // Embed colors
  COLORS: {
    PRIMARY: 0x0099FF,
    SUCCESS: 0x00FF00,
    WARNING: 0xFFD700,
    ERROR: 0xFF0000,
    MINING: 0x00FF00,
    DAILY: 0xFFD700,
    SHOP: 0x0099FF,
    GAMES: 0xFF69B4,
    LEADERBOARD: 0xFFD700
  },
  
  // Database settings
  DATABASE: {
    name: "economy.db",
    table: {
      users: "users",
      shop: "shop"
    }
  },
  
  // Economy settings
  ECONOMY: {
    // Mining settings
    mining: {
      cooldown: 5 * 60 * 1000, // 5 menit dalam ms
      minReward: 20,
      maxReward: 80,
      expReward: { min: 5, max: 15 }
    },
    
    // Daily reward settings
    daily: {
      baseCoins: { min: 100, max: 300 },
      baseDiamonds: { min: 1, max: 5 },
      streakBonus: 1.5
    },
    
    // Level settings
    level: {
      baseExp: 100,
      expMultiplier: 1.0
    }
  }
};