# Discord Economy Bot 🎮

<div align="center">

![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**A feature-rich Discord economy bot with slash commands, mining system, shop, and games!**

*Made with ❤️ by Azzam Codex x Nata Dev*

</div>

## ✨ Features

### 💰 Economy System
- **⛏️ Mining** with cooldown system and special bonuses
- **🎁 Daily Rewards** with streak bonuses
- **📊 Level & EXP** progression system
- **💎 Diamond Currency** for premium items

### 🛒 Shop & Inventory
- **🛍️ Interactive Shop** with autocomplete
- **🎒 Inventory System** for tools and boosts
- **⚒️ Pickaxe Upgrades** with mining efficiency bonuses
- **✨ Special Items** and role rewards

### 🎮 Mini Games
- **🎰 Slot Machine** with multiplier rewards
- **🪙 Coin Flip** with 50/50 chance
- **💰 Betting System** with risk management

### 🏆 Social Features
- **📈 Leaderboard** top 10 players
- **👤 User Profiles** with detailed stats
- **🌟 Special User** exclusive benefits

### 🔧 Technical Features
- **⚡ Slash Commands** modern Discord integration
- **💾 SQLite Database** reliable data storage
- **🔄 Cooldown System** balanced gameplay
- **🎨 Custom Embeds** with beautiful footer
- **🚀 Error Handling** smooth user experience

## 📸 Preview

![Mining Command](https://via.placeholder.com/600x200/0099FF/FFFFFF?text=⛏️+Mining+Command+Preview)
![Shop System](https://via.placeholder.com/600x200/00FF00/FFFFFF?text=🛒+Shop+System+Preview)
![Leaderboard](https://via.placeholder.com/600x200/FFD700/000000?text=🏆+Leaderboard+Preview)

## 🚀 Quick Start

### Prerequisites
- Node.js 16.9.0 or higher
- Discord Bot Token
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/discord-economy-bot.git
   cd discord-economy-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configuration**
   - Rename `config.example.js` to `config.js`
   - Fill in your bot credentials:

   ```javascript
   module.exports = {
     BOT_TOKEN: "your-bot-token-here",
     CLIENT_ID: "your-client-id-here",
     SPECIAL_USER_ID: "your-special-user-id",
     // ... other config
   };
   ```

4. **Deploy Commands**
   ```bash
   npm run deploy
   ```

5. **Start the Bot**
   ```bash
   npm start
   ```

   Or use the batch file on Windows:
   ```bash
   start.bat
   ```

## 📋 Command List

### 💰 Economy Commands
| Command | Description | Options |
|---------|-------------|---------|
| `/mine` | Mine for coins (5min cooldown) | None |
| `/daily` | Claim daily rewards | None |
| `/balance` | Check user balance | `user` (optional) |

### 🛒 Shop Commands
| Command | Description | Options |
|---------|-------------|---------|
| `/shop` | View all available items | None |
| `/buy` | Purchase items from shop | `item_id` (autocomplete) |

### 🎮 Game Commands
| Command | Description | Options |
|---------|-------------|---------|
| `/slots` | Play slot machine | `bet` (min 10) |
| `/coinflip` | Coin flip game | `bet`, `choice` (heads/tails) |

### 🏆 Info Commands
| Command | Description | Options |
|---------|-------------|---------|
| `/leaderboard` | Top 10 players | None |
| `/help` | Show help menu | None |

## ⚙️ Configuration

### Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the token to `config.js`
5. Enable required intents:
   - Message Content Intent
   - Server Members Intent

### Invite Bot to Server
Use this invite link (replace CLIENT_ID with your bot's client ID):
```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147485696&scope=bot%20applications.commands
```

## 🗃️ Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| user_id | TEXT PRIMARY KEY | Discord User ID |
| username | TEXT | Discord Username |
| coins | INTEGER | User's coins balance |
| diamonds | INTEGER | User's diamonds balance |
| level | INTEGER | User's current level |
| exp | INTEGER | Current experience points |
| last_mine | TEXT | Last mining timestamp |
| last_daily | TEXT | Last daily reward timestamp |
| inventory | TEXT | JSON string of user's inventory |
| created_at | DATETIME | Account creation date |

### Shop Table
| Column | Type | Description |
|--------|------|-------------|
| item_id | TEXT PRIMARY KEY | Unique item identifier |
| name | TEXT | Display name of item |
| price | INTEGER | Item price in coins |
| item_type | TEXT | Type of item (tool/boost/role) |
| description | TEXT | Item description |

## 🎯 Special Features

### 🌟 Special User Benefits
Users with the configured `SPECIAL_USER_ID` receive:
- **+50 Bonus Coins** on every mine
- **+200 Extra Coins** on daily rewards  
- **+3 Extra Diamonds** on daily rewards
- **Special Messages** and recognition
- **Priority Access** to new features

### ⚒️ Pickaxe System
| Pickaxe | Price | Bonus | Description |
|---------|-------|-------|-------------|
| Basic | 🪙 100 | +10% | Starter pickaxe |
| Iron | 🪙 500 | +25% | Improved efficiency |
| Diamond | 🪙 2000 | +50% | Maximum mining power |

## 🔧 Development

### Project Structure
```
discord-economy-bot/
├── index.js          # Main bot file
├── config.js         # Configuration file
├── commands.js       # Slash commands definitions
├── deploy-commands.js # Command deployment script
├── economyManager.js # Economy system logic
├── database.js       # Database management
├── package.json      # Dependencies and scripts
└── README.md        # This file
```

### Adding New Commands
1. Add command to `commands.js`:
```javascript
newCommand: {
  data: new SlashCommandBuilder()
    .setName('newcommand')
    .setDescription('Command description'),
  execute: async (interaction, economy, database) => {
    // Command logic here
  }
}
```

2. Redeploy commands:
```bash
npm run deploy
```

## 🐛 Troubleshooting

### Common Issues

**❌ Commands not appearing**
- Run `npm run deploy` to register commands
- Wait up to 1 hour for global command propagation

**❌ Bot not responding**
- Check if bot token is correct in `config.js`
- Verify bot has proper permissions in server

**❌ Database errors**
- Ensure write permissions in bot directory
- Check if `economy.db` is not corrupted

**❌ Cooldown not working**
- Verify system time is correct
- Check database connection

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for bugs and feature requests.

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Azzam Codex** - *Initial work & core development*
- **Nata Dev** - *Feature development & maintenance*

## 🙏 Acknowledgments

- Discord.js community for excellent documentation
- Contributors and testers
- Everyone who supported this project

---

<div align="center">

### ⭐ Don't forget to star this repository if you found it helpful!

**Made with ❤️ by Azzam Codex x Nata Dev**

![Footer](https://cdn.discordapp.com/attachments/1007988669807857706/1393547088343601232/Desain_tanpa_judul_66.png)

</div>
