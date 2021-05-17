const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require('../dbObjects');
const { formatSeconds } = require('../util');
const { Op } = require("sequelize");

module.exports = {
        name: 'unclaim',
        cooldown: 10,
        admin_cooldown: 3,
        args: false,
        usage: '',
        description: 'Unclaim the current channel. Frees the channel up to be claimed by anyone.',
        guildOnly: true,
        async execute(message, args) {
            let guild = message.guild;
            let channel = message.channel;
            let author = message.author;
            let valid = false;

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

                if(guildData[0].current_owner_id = message.author.toString()) {
                    valid = true;
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
