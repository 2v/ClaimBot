const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require('../dbObjects');
const { formatSeconds } = require('../util');
const { default_claim_duration } = require('../config.json');
const { Op } = require("sequelize");

module.exports = {
        name: 'claim',
        cooldown: 10,
        admin_cooldown: 3,
        args: false,
        usage: '',
        description: 'Claim the current channel. Changes the name of the channel for a designated period of time. Must be reclaimed before this period of time ends, or after if no other user has claimed it. Only one user can claim a channel at a time.',
        guildOnly: true,
        async execute(message, args) {
            let guild = message.guild;
            let channel = message.channel;
            let author = message.author;
            let today = new Date();
            let current_time = [today.getHours(), today.getMinutes(), today.getSeconds()];
            let current_time_str = null;
            let claimable = false;
            let claim_duration = default_claim_duration;
            let suffix = "";
            let prefix = "";


            await ClaimSettings.findAll({
                attributes: [
                    'claim_duration',
                    'prefix',
                    'suffix',
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
                suffix = setting[0].suffix;
                prefix = setting[0].prefix;

                // console.log('Found an entry: claim_duration: ' + claim_duration + ', suffix: ' + suffix + ', prefix: ' + prefix + '.');

            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later.');
                return 100;
                // rejection
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
                if(!guildData.length) {
                    message.reply("this channel has not been defined as claimable yet!");
                    return 100;
                }

                if(!guildData[0].claimable) {
                    message.reply("this channel is explicitly defined to be not claimable, exiting.");
                    return 100;
                }

                let delta = 0;
                if (!(guildData[0].claimed_at == null)) {
                    delta = today.getTime() - Date.parse(guildData[0].claimed_at) - claim_duration * 3600 * 1000;
                }

                if (delta >= 0) {
                    claimable = true;
                    current_time_str = current_time[0] + ':' + current_time[1] + ':' + current_time[0];
                } else {
                    message.reply('This channel is not claimable for' + formatSeconds(-delta/1000));
                    return 100;
                }

            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later.');
                return 100;
            });


            if (claimable) {
                await Channel.update({
                    current_owner_id: author.id.toString(),
                    claimed_at: today.toString()
                }, {
                    where: {
                        [Op.and]: [
                            { guild_id : guild.id.toString() },
                            { channel_id : channel.id.toString() }
                        ]
                    }
                }).then(data=> {
                    if(!data.length) {
                        message.reply("could not access database");
                        return 100;
                    }
                    message.reply(`has successfully claimed the channel.`);
                }, reason => {
                    message.reply('There was a problem querying the Claimbot database, please try again later.');
                    return 100;
                });

                try {
                    await channel.setName(`${prefix}${author.username}${suffix}`)
                        .catch(console.error);
                } catch(e) {
                    console.log(e);
                }
            }
        }
    }
