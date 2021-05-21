const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require('../dbObjects');
const { formatSeconds } = require('../util');
const { default_claim_duration } = require('../config.json');
const { Op } = require("sequelize");

module.exports = {
        name: 'transfer_claim',
        cooldown: 3,
        variable_cooldown: false,
        admin_cooldown: 3,
        args: true,
        admin: true,
        usage: '<taggedUser>',
        description: 'Transfers ownership directly to another user. Note: this can only be done during the last 50% of the current owner\'s claim. Although this might not be very convenient, it is to prevent API abuse.',
        guildOnly: true,
        async execute(message, args) {
            let guild = message.guild;
            let channel = message.channel;

            let today = new Date();
            let current_time = [today.getHours(), today.getMinutes(), today.getSeconds()];
            let current_time_str = null;
            let claimable = false;
            let claim_duration = default_claim_duration;
            let suffix = "";
            let prefix = "";

            if (!message.mentions.users.size) {
                message.reply('you need to tag a user in order to transfer a channel to them!');
                return 100;
            }

            const new_owner = message.mentions.users.first();

            if (new_owner.bot) {
                message.reply('you cannot transfer ownership to a bot!');
                return 100;
            }

            if (!guild.member(new_owner)) {
                message.reply('The user must be in the guild to check their reputation!');
                return 100;
            }

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

                if (-(delta/1000)-((claim_duration) * 0.5 * 3600) > 0) { // 50 percent of total claim_duration
                    message.reply(`This channel will become transferable in ${formatSeconds((-(delta/1000)-((claim_duration) * 0.5 * 3600)))}`);
                    claimable = false;
                    return;
                } else {
                    claimable = true;
                    return;
                }


            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later.');
                return 100;
            });


            if (claimable) {
                await Channel.update({
                    current_owner_id: new_owner.id.toString(),
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
                    message.reply(`Channel has successfully been transferred to ${new_owner.username}`);
                }, reason => {
                    message.reply('There was a problem querying the Claimbot database, please try again later.');
                    return 100;
                });

                try {
                    await channel.setName(`${prefix}${new_owner.username}${suffix}`)
                        .then(newChannel => console.log(`Channel's new name is ${newChannel.name}`))
                        .catch(console.error);
                } catch(e) {
                    console.log(e);
                }
            }
        }
    }
