const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require('../dbObjects');
const { formatSeconds } = require('../util');
const { Op } = require("sequelize");

module.exports = {
        name: 'channel_claim_time',
        cooldown: 3,
        variable_cooldown: false,
        admin_cooldown: 3,
        aliases: ['set_claim_time', 'set_claim_duration'],
        admin: true,
        args: true,
        usage: '<claim_duration[hours]>',
        description: 'Changes the duration of claims for the entire guild in hours. Due to API rate limiting, the minimum claim duration is one hour and the maximum is 48 hours.',
        guildOnly: true,
        async execute(message, args) {
            let guild = message.guild;
            let channel = message.channel;
            let author = message.author;
            let exists = false;
            let current_claim_duration = 0;
            let new_claim_duration = parseInt(args[0]);

            if (new_claim_duration < 1 && new_claim_duration >= 0) {
                message.reply('The minimum claim duration is one hour, the one you specified is too low!');
                return 100;
            }

            if (new_claim_duration < 0) {
                message.reply('The claim duration cannot be negative!');
                return 100;
            }

            if (new_claim_duration > 48) {
                message.reply('The maximum claim duration is 48 hours');
                return 100;
            }

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

                exists = true;
                current_claim_duration = setting[0].claim_duration;
                return;
            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later. 1');
            });


            if (exists) {
                await ClaimSettings.update({
                    claim_duration: new_claim_duration
                }, {
                    where: {
                        [Op.and]: [
                            { guild_id : guild.id.toString() },
                        ]
                    }
                }).then(data=> {
                    if(!data.length) {
                        message.reply("could not access database");
                        return 100;
                    }
                    message.reply(`Claim duration successfully changed from ${current_claim_duration} hours to ${new_claim_duration} hours.`);
                }, reason => {
                    message.reply('There was a problem querying the Claimbot database, please try again later. 2');
                    return 100;
                });
            } else {
                try {
                    await ClaimSettings.create({
                        guild_id: guild.id.toString(),
                        claim_duration: new_claim_duration,
                        prefix: null,
                        suffix: null,
                    });
                    message.reply(`Claim duration has been set to ${new_claim_duration} hours.`);
                    return 200;
               }
               catch (e) {
                   console.log(e);
                   message.reply('There was a problem writing to the Claimbot database, please try again later.');
                   return 100;
                }
            }
        }
    }
