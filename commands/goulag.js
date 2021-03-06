const { getServerGoulagId } = require('../utils/config_utils');

const { getIdFromMention } = require('../utils/message_utils');
const { joinAndPlayAudio } = require('../utils/audio_utils');
const permissions = require('../utils/permissions');

module.exports = {
	name: 'goulag',
	description: 'puts the tagged user in the goulag channel and blasts russian music for him',
	usage: '`goulag @user`. user needs to be a in voice channel',
	permission: permissions.WHITELIST,
	async execute(message, args) {
		const channel = message.guild.me.voice.channel;
		if (channel) {
			return message.reply('Already in a channel, please disconnect me first');
		}
		if (args[0]) {

			const goulagId = getIdFromMention(args[0]) || args[0];

			const goulaged = message.guild.members.resolve(goulagId);
			if(!goulaged) {
				return message.reply('Couldn\'t find the user you specified, try again');
			}

			// to get from config
			const goulagServerId = getServerGoulagId(message.guild.id);
			if (goulagServerId === '0') {
				return message.reply('No goulag channel defined for this server, use goulagsetup to define one');
			}
			const isAVoiceChannel = message.guild.channels.resolve(goulagServerId);
			if (isAVoiceChannel) {
				await goulaged.voice.setChannel(goulagServerId);
				await goulaged.voice.channel.join();
				joinAndPlayAudio(goulaged.voice.channel, 'goulaged.mp3', () => {
					message.channel.send('GOULAG');
				}, () => {
					message.channel.send('GOULAGED');
				});
			}
			else {
				message.reply('Can\'t find voice channel');
			}
		}
		else {
			message.reply('You need to specify an argument : user');
		}
		return;
	},
};
