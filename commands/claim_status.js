const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require('../dbObjects');
const { formatSeconds } = require('../util');
const { Op } = require("sequelize");

module.exports = {
        name: 'claim_status',
        cooldown: 10,
        admin_cooldown: 3,
        args: false,
        usage: '',
        description: 'Gets the status of the current channel. Displays the current owner if there is one.',
        guildOnly: true,
        async execute(message, args) {
            let guild = message.guild;
            let channel = message.channel;
            let author = message.author;
            let current_owner_id = null;
            let user = null;

            let claimable = false;
            let claimed = false;
            let claimed_at = null;
            let current_owner = null;
            let claim_duration = 24; // TODO: make this a value in settings JSON

            let today = new Date();
            let current_time = [today.getHours(), today.getMinutes(), today.getSeconds()];

            let claim_message = 'This channel is not currently claimable.';

            await ClaimSettings.findAll({
                attributes: [
                    'claim_duration',
                ],
                where: {
                    guild_id : guild.id.toString()
                }
            }).then(setting => {
                if(!setting.length) {
                    // no custom settings so we will use default
                    return;
                }

                claim_duration = setting[0].claim_duration;

            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later.');
            });

            await Channel.findAll({
                attributes: [
                    'claimable',
                    'current_owner_id',
                    'claimed_at',
                ],
                where: {
                    [Op.and]: [
                        { guild_id : guild.id.toString() },
                        { channel_id : channel.id.toString() }
                    ]
                }
            }).then(guildData => {
                if(!guildData.length || !guildData[0].claimable) {
                    return;
                }

                current_owner_id = guildData[0].current_owner_id;

                let delta = 0;
                if (!(guildData[0].claimed_at == null)) {
                    delta = today.getTime() - Date.parse(guildData[0].claimed_at) - claim_duration * 3600 * 1000;
                }

                if (delta >= 0) {
                    claimable = true;
                    claim_message = 'This channel is currently claimable!';

                } else {
                    claim_message = 'This channel is not claimable for' + formatSeconds(-delta/1000);
                    claimed = true;
                }

            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later.');
                return 100;
            });

            if(current_owner_id != null) {
                await guild.members.fetch(current_owner_id)
                    .then(guildMember => {
                        user = guildMember.user;
                    }, reason => {
                        message.reply('Failed to fetch member from Discord API');
                        return 100;
                    });
            }

            if(claimed && user != null) {
                const embed = new Discord.MessageEmbed()
                    .setTitle(user.tag + '\'s channel')
                    .setThumbnail(user.displayAvatarURL({ format: "png", dynamic: true }))
                    .setColor(0xffffff)
                    .setFooter(claim_message)

                message.channel.send(embed);
            } else if (claimed && user == null) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle('User no longer in guild')
                        .setColor(0xffffff)
                        .setFooter(claim_message)

                message.channel.send(embed);
            } else {
                const embed = new Discord.MessageEmbed()
                    .setTitle('Non-claimed channel')
                    .setColor(0xffffff)
                    .setFooter(claim_message)

                message.channel.send(embed);
            }

        }
}

