const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ComponentType } = require('discord.js');

module.exports = {
	cooldown: 120,
	data: new SlashCommandBuilder()
		.setName('vote_mute')
		.setDescription('Vote to mute a user in your channel.')
		.addUserOption(option => option.setName('target').setDescription('target').setRequired(true))
		.addIntegerOption(option =>
			option.setName('duration')
				.setDescription('duration (minutes)')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(60)),
	category: 'moderation',
	async execute(interaction) {
		const targetMember = interaction.options.getMember('target');
		const duration = interaction.options.getInteger('duration');

		const yes = new ButtonBuilder()
			.setCustomId('yes')
			.setLabel('STFU!')
			.setStyle(ButtonStyle.Danger);

		const no = new ButtonBuilder()
			.setCustomId('no')
			.setLabel('Keep Preaching!')
			.setStyle(ButtonStyle.Success);

		const row = new ActionRowBuilder()
			.addComponents(no, yes);
		
		const voiceChannelId = targetMember.voice.channelId;
		let numVoters = 1;

		if (voiceChannelId) {
			targetMember.voice.channel.members.each((voter) => {
				//console.log(voter.nickname);
				//console.log(voter.user.username);
			});
			//numVoters = targetMember.voice.channel.members.size;
			//console.log(`user is in ${voiceChannelId} with ${numVoters} voters`);
		} else {
			interaction.reply({
				content: `${targetMember.user} is not in a voice channel`,
				ephemeral: true
			});
			return;
		}

		const response = await interaction.reply({ 
			content: `${interaction.user} started a vote to mute: ${targetMember.user} for ${duration} minutes`, 
			components: [row],
		});

		//const filter = (buttInteraction) => buttInteraction.message.id === interaction.message.id;
		const collector = response.createMessageComponentCollector({componentType: ComponentType.Button, max: numVoters, time: 60000 });

		let y = 0;
		let n = 0;

		const votedMembers = new Set();

		collector.on('collect', async buttonAction => {
			const selection = buttonAction.customId;
			
			if (votedMembers.has(`${buttonAction.user.id}-${buttonAction.message.id}`)) {
				await buttonAction.reply({
					content: `You have already voted!`,
					ephemeral: true
				});
			} else {
				votedMembers.add(`${buttonAction.user.id}-${buttonAction.message.id}`);

				switch(selection) {
					case 'yes': y = y + 1;
						break;
					case 'no': n = n + 1;
						break;
					default:
						console.log("Button customId was invalid.");
				}
				//console.log(typeof(i));
				//console.log(i);
				await buttonAction.reply({
					content: `You have selected ${selection} to muting ${targetMember.user}`,
					ephemeral: true
				});
			}
		});

		collector.on('end', collected => {
			if (y+n >= numVoters/2) {
				if (y >= numVoters/2) {
					interaction.editReply({
						content: `Vote passed! ${targetMember} will be muted for ${duration} minute.`
					});
					
					targetMember.voice.setMute(true);

					setTimeout(() => {
						targetMember.voice.setMute(false);
					}, (duration*60000)); 
						
				} else {
					interaction.editReply({
						content: `Vote failed! ${targetMember} will not be silenced!`
					});
				}
			} else {
				interaction.editReply({
					content: `Not enough votes cast to mute ${targetMember}.`
				});
			}
		});		
	},
};