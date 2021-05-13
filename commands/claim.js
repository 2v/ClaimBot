const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require('../dbObjects');
const { formatSeconds } = require('../util');
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
            let claim_duration = 24;
            let suffix = "";
            let prefix = "";


            const db_settings = await ClaimSettings.findAll({
                attributes: [
                    'claim_duration',
                    'prefix',
                    'suffix',
                ],
                where: {
                    guild_id : guild.id
                }
            }).then(setting => {
                if(!setting.length) {
                    // no custom settings so we will use default
                    return;
                }

                claim_duration = setting.claim_duration;
                suffix = setting.suffix;
                prefix = setting.prefix;

            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later.');
                return 100;
                // rejection
            });

            const db_channel = await Channel.findAll({
                attributes: [
                    'claimable',
                    'current_owner_id',
                    'claimed_at',
                ],
                where: {
                    [Op.and]: [
                        { guild_id : guild.id },
                        { channel_id : channel.id }
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

                let split_claimed_at = claimed_at.split(':');
                let delta = (current_time[0]*3600 + current_time[1]*60 + current_time[2]) - (split_claimed_at[0]*3600 + split_claimed_at[1]*60+split_claimed_at[0]) - claim_duration * 3600;
                if (delta >= 0) {
                    claimable = true;
                    current_time_str = current_time[0] + ':' + current_time[1] + ':' + current_time[0];
                } else {
                    message.reply('This channel is not claimable for' + formatSeconds(-delta));
                    return 100;
                }

            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later.');
                return 100;
            });


            if(claimable) {
            const db_channel_write = await Channel.create({
                    guild_id: guild.id,
                    channel_id: channel.id,
                    claimable: true,
                    current_owner_id: author.id,
                    claimed_at: current_time
            }).then(channel => {

                console.log("claiming channel");
                message.channel.setName(`${prefix}${author.tag}${suffix}`);
                message.reply(`has successfully claimed the channel.`);
                return 200;
             }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later. 2');
                return 100;
            });
        }
    }
}
