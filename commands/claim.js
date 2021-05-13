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
            let current_time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            let claimable = false;


            // first get basic info about guild, such as the global claim time, prefix, suffix



            // check if the channel can be claimed. If not exit command and display time until channel can be claimed
            const result = await Channel.findAll({
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
                    return;
                }

                if(!guildData[0].claimable) {
                    message.reply("this channel is explicitly defined to be not claimable, exiting.");
                    return;
                }

               // TODO: add logic to check now if the channel can be claimed by users other than the current owner

            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later.');
                return 100;
                // rejection
            });

            // next, channel can be claimed so put new info to database and change channel name. Display an embed with new channel details and claim time.


            if(claimable) {
            const result2 = await Channel.create({
                    guild_id: guild.id,
                    channel_id: channel.id,
                    claimable: true,
                    current_owner_id: author.id,
                    claimed_at: current_time
            }).then(channel => {

                console.log("claiming channel");
                message.channel.setName(`different-name-than-what-the-name-was-before`);
                message.reply(`has successfully claimed the channel.`);
                return 200;
             }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later. 2');
                return 100;
                // rejection
            });
            }

            }
        }
