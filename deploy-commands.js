const { REST, Routes } = require('discord.js');
const config = require('./config');
const commands = require('./commands');

const rest = new REST({ version: '10' }).setToken(config.BOT_TOKEN);

async function deployCommands() {
  try {
    console.log('Started refreshing application (/) commands.');

    const commandsData = Object.values(commands).map(command => command.data);

    await rest.put(
      Routes.applicationCommands(config.CLIENT_ID),
      { body: commandsData }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
}

deployCommands();