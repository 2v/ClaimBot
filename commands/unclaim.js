const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require('../dbObjects');
const { formatSeconds } = require('../util');
const { default_claim_duration } = require('../config.json');
const { Op } = require("sequelize");

module.exports = {
        name: 'unclaim',
        cooldown: 10,
        admin_cooldown: 3,
        args: false,
        usage: '',
        description: 'Unclaim the current channel. Frees the channel up to be claimed by anyone. *NOTE: Channels can only be unclaimed during the last 10% of the total time of the claim duration. For example, if your server has a claim duration of 1 hour, you will only be able to unclaim your channel during the last 6 minutes of your ownership, or after 54 minutes from the first `!claim` command.*',
        guildOnly: true,
        async execute(message, args) {
            let guild = message.guild;
            let channel = message.channel;
            let author = message.author;
            let valid = false;

            let today = new Date();
            let current_time = [today.getHours(), today.getMinutes(), today.getSeconds()];
            let current_time_str = null;
            let claim_duration = default_claim_duration;

            await ClaimSettings.findAll({
                attributes: [
                    'claim_duration'
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

                if(guildData[0].current_owner_id === message.author.id.toString()) {
                    valid = true;
                } else {
                    message.reply('You cannot unclaim a channel that you do not own');
                    return;
                }

                let delta = 0;
                if (!(guildData[0].claimed_at == null)) {
                    delta = today.getTime() - Date.parse(guildData[0].claimed_at) - claim_duration * 3600 * 1000;
                }

                if (-(delta/1000)-((claim_duration) * 0.1 * 3600) > 0) { // 10 percent of total claim_duration
                    message.reply(`This channel will become unclaimable in ${formatSeconds((-(delta/1000)-((claim_duration) * 0.1 * 3600)))}`);
                    valid = false;
                    return;
                } else {
                    return;
                }


            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later.');
                return 100;
            });

            if (valid) {
                await Channel.update({
                    current_owner_id: null,
                    claimed_at: null
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

                    // TODO: add funtionality so that channel is only claimable during last ten minutes of claim to prevent API rate limiting
                    message.reply(`has successfully un-claimed the channel.`);
                }, reason => {
                    message.reply('There was a problem querying the Claimbot database, please try again later.');
                    return 100;
                });
            }

        }
}
