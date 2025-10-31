const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const config = require('./config');
const Database = require('./database');
const EconomyManager = require('./economyManager');
const commands = require('./commands');

class EconomyBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });

    this.db = new Database();
    this.economy = new EconomyManager(this.db);
    this.commands = new Collection();

    this.setupCommands();
    this.setupEvents();
  }

  setupCommands() {
    // Register all commands
    for (const [name, command] of Object.entries(commands)) {
      this.commands.set(command.data.name, command);
    }
  }

  setupEvents() {
    this.client.on('ready', () => {
      console.log(`✅ Bot ${this.client.user.tag} siap!`);
      console.log(`🌟 Special features enabled for user: ${config.SPECIAL_USER_ID}`);
      console.log(`📊 Total commands: ${this.commands.size}`);
      
      // Set bot activity
      this.client.user.setActivity({
        name: '/help • Made By Natakenshi Dev',
        type: 0
      });
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      try {
        if (interaction.isAutocomplete()) {
          await command.autocomplete(interaction, this.db);
        } else {
          await command.execute(interaction, this.economy, this.db);
        }
      } catch (error) {
        console.error('Error handling interaction:', error);
        
        const errorEmbed = {
          title: '❌ Error',
          description: 'Terjadi error saat menjalankan command!',
          color: config.COLORS.ERROR,
          footer: config.FOOTER,
          timestamp: new Date()
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      }
    });

    this.client.on('error', (error) => {
      console.error('Client error:', error);
    });
  }

  start() {
    this.client.login(config.BOT_TOKEN);
  }
}

// Start the bot
const bot = new EconomyBot();
bot.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down bot...');
  bot.db.close();
  process.exit(0);
});