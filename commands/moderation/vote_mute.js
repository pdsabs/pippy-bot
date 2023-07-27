const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote_mute')
		.setDescription('Vote to mute a user in your channel.'),
    async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
        await interaction.reply(`${interaction.user.username} started a vote to mute <target>!`);
	},
};