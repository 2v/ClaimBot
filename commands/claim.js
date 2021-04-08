const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require("../dbObjects');
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

            // first check if the channel can be claimed. If not exit command and display time until channel can be claimed
            await Channel.findAll({
                attributes: [
                    'claimable',
                    'current_owner_id',
                    'claimed_at'
                ],
                where: {
                    [Op.and]: [
                        { guild_id : guild.id },
                        { channel_id : channel.id }
                    ]
                }
            }).then(guildData => {
                if(!guildData.length) {
                    console.log("channel not claimable or failed to access database");
                    return;
                }

                // in the future, add a message describing who currently owns the channel, and how long until the channel will become claimable again
                if(!guildData[0].claimable) {
                    console.log("Channel is explicitly defined to be not claimable, exiting");
                    return;
                }
            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later.');
                return 100;
                // rejection
            });

            // next, channel can be claimed so put new info to database and change channel name. Display an embed with new channel details and claim time.
        }
