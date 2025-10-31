const { SlashCommandBuilder } = require('discord.js');
const config = require('./config');

module.exports = {
  // Economy Commands
  mine: {
    data: new SlashCommandBuilder()
      .setName('mine')
      .setDescription('Mining coins dengan cooldown 5 menit'),
    execute: async (interaction, economy) => {
      const result = await economy.mine(interaction.user.id, interaction.user.username);
      
      if (!result.success) {
        const minutes = Math.floor(result.timeLeft / 60000);
        const seconds = Math.floor((result.timeLeft % 60000) / 1000);
        return await interaction.reply({ 
          content: `⏳ Tunggu ${minutes}m ${seconds}s sebelum mining lagi!`,
          ephemeral: true 
        });
      }

      const embed = {
        title: '⛏️ Mining Results',
        color: config.COLORS.MINING,
        fields: [
          { name: 'Coins Mined', value: `🪙 ${result.reward}`, inline: true },
          { name: 'EXP Gained', value: `⭐ ${result.exp}`, inline: true },
          { name: 'Total Coins', value: `💰 ${result.reward + (result.specialBonus || 0)}`, inline: true },
          { name: 'Level', value: `📊 ${result.level} (${result.expCurrent}/${result.expNeeded} EXP)`, inline: true }
        ],
        footer: config.FOOTER,
        timestamp: new Date()
      };

      if (result.levelUp) {
        embed.fields.push({ 
          name: 'Achievement', 
          value: '🎉 **LEVEL UP!**', 
          inline: false 
        });
      }

      if (result.specialBonus > 0) {
        embed.fields.push({ 
          name: 'Special Reward', 
          value: `🎁 **BONUS SPECIAL USER:** +${result.specialBonus} Coins!`, 
          inline: false 
        });
      }

      await interaction.reply({ embeds: [embed] });
    }
  },

  daily: {
    data: new SlashCommandBuilder()
      .setName('daily')
      .setDescription('Klaim daily reward coins dan diamonds'),
    execute: async (interaction, economy) => {
      const result = await economy.daily(interaction.user.id, interaction.user.username);
      
      if (!result.success) {
        if (result.reason === 'already_claimed') {
          return await interaction.reply({ 
            content: '🎁 Anda sudah mengklaim daily reward hari ini!',
            ephemeral: true 
          });
        }
        return await interaction.reply({ 
          content: '❌ Terjadi error!',
          ephemeral: true 
        });
      }

      const embed = {
        title: '🎁 Daily Reward',
        color: config.COLORS.DAILY,
        fields: [
          { name: 'Coins', value: `🪙 ${result.coins}`, inline: true },
          { name: 'Diamonds', value: `💎 ${result.diamonds}`, inline: true },
          { name: 'Total Received', value: `💰 ${result.coins + result.specialBonus.coins} coins + 💎 ${result.diamonds + result.specialBonus.diamonds} diamonds`, inline: false }
        ],
        footer: config.FOOTER,
        timestamp: new Date()
      };

      if (result.streakBonus) {
        embed.fields.push({ 
          name: 'Bonus', 
          value: '🔥 Streak Bonus Active! +50%', 
          inline: false 
        });
      }

      if (result.specialBonus.coins > 0) {
        embed.fields.push({ 
          name: 'Special Bonus', 
          value: `🌟 Extra +${result.specialBonus.coins} coins dan +${result.specialBonus.diamonds} diamonds!`, 
          inline: false 
        });
      }

      await interaction.reply({ embeds: [embed] });
    }
  },

  balance: {
    data: new SlashCommandBuilder()
      .setName('balance')
      .setDescription('Cek balance coins dan diamonds')
      .addUserOption(option =>
        option.setName('user')
          .setDescription('User yang ingin dicek balance-nya')
          .setRequired(false)
      ),
    execute: async (interaction, economy, database) => {
      const target = interaction.options.getUser('user') || interaction.user;
      const user = await database.getUser(target.id);

      if (!user) {
        return await interaction.reply({ 
          content: `${target} belum terdaftar di sistem economy!`,
          ephemeral: true 
        });
      }

      const embed = {
        title: `💰 Balance ${target.username}`,
        color: config.COLORS.SUCCESS,
        fields: [
          { name: 'Coins', value: `🪙 ${user.coins}`, inline: true },
          { name: 'Diamonds', value: `💎 ${user.diamonds}`, inline: true },
          { name: 'Level', value: `📊 ${user.level}`, inline: true },
          { name: 'EXP', value: `⭐ ${user.exp}/${user.level * 100}`, inline: true }
        ],
        thumbnail: { url: target.displayAvatarURL() },
        footer: config.FOOTER,
        timestamp: new Date()
      };

      await interaction.reply({ embeds: [embed] });
    }
  },

  // Shop Commands
  shop: {
    data: new SlashCommandBuilder()
      .setName('shop')
      .setDescription('Lihat semua item yang tersedia di shop'),
    execute: async (interaction, economy, database) => {
      const items = await database.getShopItems();
      
      const embed = {
        title: '🛒 Economy Shop',
        description: 'Gunakan `/buy <item_id>` untuk membeli item',
        color: config.COLORS.SHOP,
        fields: items.map(item => ({
          name: `${item.name} (${item.item_id})`,
          value: `Price: 🪙 ${item.price}\nType: ${item.item_type}\n${item.description}`,
          inline: false
        })),
        footer: config.FOOTER,
        timestamp: new Date()
      };

      await interaction.reply({ embeds: [embed] });
    }
  },

  buy: {
    data: new SlashCommandBuilder()
      .setName('buy')
      .setDescription('Beli item dari shop')
      .addStringOption(option =>
        option.setName('item_id')
          .setDescription('ID item yang ingin dibeli')
          .setRequired(true)
          .setAutocomplete(true)
      ),
    execute: async (interaction, economy, database) => {
      const itemId = interaction.options.getString('item_id');

      const result = await economy.buyItem(
        interaction.user.id, 
        interaction.user.username, 
        itemId
      );

      if (!result.success) {
        switch (result.reason) {
          case 'item_not_found':
            return await interaction.reply({ 
              content: '❌ Item tidak ditemukan!',
              ephemeral: true 
            });
          case 'insufficient_coins':
            return await interaction.reply({ 
              content: `❌ Coins tidak cukup! Dibutuhkan 🪙 ${result.item?.price}`,
              ephemeral: true 
            });
          default:
            return await interaction.reply({ 
              content: '❌ Terjadi error!',
              ephemeral: true 
            });
        }
      }

      const embed = {
        title: '🛒 Purchase Successful',
        color: config.COLORS.SUCCESS,
        fields: [
          { name: 'Item', value: result.item.name, inline: true },
          { name: 'Price', value: `🪙 ${result.item.price}`, inline: true },
          { name: 'Remaining Coins', value: `💰 ${result.newBalance}`, inline: true },
          { name: 'Description', value: result.item.description, inline: false }
        ],
        footer: config.FOOTER,
        timestamp: new Date()
      };

      await interaction.reply({ embeds: [embed] });
    },
    autocomplete: async (interaction, database) => {
      const focusedValue = interaction.options.getFocused();
      const items = await database.getShopItems();
      
      const filtered = items.filter(item =>
        item.item_id.toLowerCase().includes(focusedValue.toLowerCase()) ||
        item.name.toLowerCase().includes(focusedValue.toLowerCase())
      ).slice(0, 25);

      await interaction.respond(
        filtered.map(item => ({
          name: `${item.name} (🪙 ${item.price})`,
          value: item.item_id
        }))
      );
    }
  },

  // Game Commands
  slots: {
    data: new SlashCommandBuilder()
      .setName('slots')
      .setDescription('Bermain slot machine')
      .addIntegerOption(option =>
        option.setName('bet')
          .setDescription('Jumlah coins yang dipertaruhkan')
          .setRequired(true)
          .setMinValue(10)
      ),
    execute: async (interaction, economy, database) => {
      const bet = interaction.options.getInteger('bet');
      
      if (bet < 10) {
        return await interaction.reply({ 
          content: '❌ Minimum bet adalah 10 coins!',
          ephemeral: true 
        });
      }

      const user = await database.getUser(interaction.user.id);
      if (!user || user.coins < bet) {
        return await interaction.reply({ 
          content: '❌ Coins tidak cukup untuk bermain slots!',
          ephemeral: true 
        });
      }

      // Slot symbols
      const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
      const slots = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];

      // Calculate win
      let multiplier = 0;
      if (slots[0] === slots[1] && slots[1] === slots[2]) {
        if (slots[0] === '💎') multiplier = 10;
        else if (slots[0] === '7️⃣') multiplier = 5;
        else multiplier = 3;
      } else if (slots[0] === slots[1] || slots[1] === slots[2]) {
        multiplier = 1.5;
      }

      const winAmount = Math.floor(bet * multiplier);
      const newCoins = user.coins - bet + winAmount;

      // Update user
      await database.updateUser(interaction.user.id, interaction.user.username, {
        coins: newCoins
      });

      const embed = {
        title: '🎰 Slot Machine',
        color: config.COLORS.GAMES,
        fields: [
          { name: 'Result', value: `| ${slots[0]} | ${slots[1]} | ${slots[2]} |`, inline: false },
          { name: 'Bet', value: `🪙 ${bet}`, inline: true },
          { name: 'Win', value: `🪙 ${winAmount}`, inline: true },
          { 
            name: 'Result', 
            value: multiplier > 0 ? '🎉 **MENANG!**' : '😢 **KALAH**', 
            inline: false 
          },
          { name: 'New Balance', value: `💰 ${newCoins}`, inline: false }
        ],
        footer: config.FOOTER,
        timestamp: new Date()
      };

      if (multiplier > 0) {
        embed.fields.push({ 
          name: 'Multiplier', 
          value: `x${multiplier}`, 
          inline: true 
        });
      }

      await interaction.reply({ embeds: [embed] });
    }
  },

  coinflip: {
    data: new SlashCommandBuilder()
      .setName('coinflip')
      .setDescription('Bermain coin flip game')
      .addIntegerOption(option =>
        option.setName('bet')
          .setDescription('Jumlah coins yang dipertaruhkan')
          .setRequired(true)
          .setMinValue(1)
      )
      .addStringOption(option =>
        option.setName('choice')
          .setDescription('Pilihan heads atau tails')
          .setRequired(true)
          .addChoices(
            { name: 'Heads', value: 'heads' },
            { name: 'Tails', value: 'tails' }
          )
      ),
    execute: async (interaction, economy, database) => {
      const bet = interaction.options.getInteger('bet');
      const choice = interaction.options.getString('choice');

      const user = await database.getUser(interaction.user.id);
      if (!user || user.coins < bet) {
        return await interaction.reply({ 
          content: '❌ Coins tidak cukup!',
          ephemeral: true 
        });
      }

      // Flip coin
      const result = Math.random() > 0.5 ? 'heads' : 'tails';
      const win = choice === result;

      // Calculate new balance
      const newCoins = win ? user.coins + bet : user.coins - bet;

      await database.updateUser(interaction.user.id, interaction.user.username, {
        coins: newCoins
      });

      const embed = {
        title: '🪙 Coin Flip',
        color: win ? config.COLORS.SUCCESS : config.COLORS.ERROR,
        fields: [
          { name: 'Your Choice', value: choice.toUpperCase(), inline: true },
          { name: 'Result', value: result.toUpperCase(), inline: true },
          { name: 'Bet', value: `🪙 ${bet}`, inline: true },
          { name: 'Result', value: win ? '🎉 **MENANG!**' : '😢 **KALAH**', inline: false },
          { name: 'New Balance', value: `💰 ${newCoins}`, inline: false }
        ],
        footer: config.FOOTER,
        timestamp: new Date()
      };

      await interaction.reply({ embeds: [embed] });
    }
  },

  // Info Commands
  leaderboard: {
    data: new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('Lihat top 10 players berdasarkan coins'),
    execute: async (interaction, economy, database) => {
      const topUsers = await database.getLeaderboard(10);
      
      const embed = {
        title: '🏆 Economy Leaderboard',
        color: config.COLORS.LEADERBOARD,
        description: 'Top 10 Players Berdasarkan Coins',
        fields: topUsers.map((user, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          return {
            name: `${medal} ${user.username}`,
            value: `Coins: 🪙 ${user.coins} | Level: ${user.level} | Diamonds: 💎 ${user.diamonds}`,
            inline: false
          };
        }),
        footer: config.FOOTER,
        timestamp: new Date()
      };

      await interaction.reply({ embeds: [embed] });
    }
  },

  help: {
    data: new SlashCommandBuilder()
      .setName('help')
      .setDescription('Tampilkan semua command yang tersedia'),
    execute: async (interaction, economy, database) => {
      const embed = {
        title: '🎮 Bot Game Economy Help',
        description: 'List semua slash command yang tersedia:',
        color: config.COLORS.PRIMARY,
        fields: [
          {
            name: '💰 Economy Commands',
            value: '`/mine` - Mining coins (5m cooldown)\n`/daily` - Daily reward coins & diamonds\n`/balance` - Cek balance Anda atau user lain'
          },
          {
            name: '🛒 Shop Commands',
            value: '`/shop` - Lihat semua item di shop\n`/buy` - Beli item dari shop'
          },
          {
            name: '🎮 Game Commands',
            value: '`/slots` - Bermain slot machine\n`/coinflip` - Bermain coin flip game'
          },
          {
            name: '🏆 Info Commands',
            value: '`/leaderboard` - Lihat top 10 players\n`/help` - Tampilkan bantuan ini'
          }
        ],
        footer: config.FOOTER,
        timestamp: new Date()
      };

      // Special message for specific user
      if (interaction.user.id === config.SPECIAL_USER_ID) {
        embed.fields.push({
          name: '🌟 Special User Benefits',
          value: 'Anda mendapatkan bonus khusus di semua command!',
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed] });
    }
  }
};