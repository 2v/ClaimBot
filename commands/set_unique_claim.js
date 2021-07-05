const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require('../dbObjects');
const { formatSeconds } = require('../util');
const { default_claim_duration } = require('../config.json');
const { default_unclaim_duration } = require('../config.json');
const { Op } = require("sequelize");

module.exports = {
    name: 'set_unique_claim',
    cooldown: 3,
    variable_cooldown: false,
    admin_cooldown: 3,
    admin: true,
    args: false,
    usage: '',
    description: 'Global server setting which prevents users from claiming more than one channel at a time.',
    guildOnly: true,
    async execute(message, args) {
        let guild = message.guild;
        let channel = message.channel;
        let author = message.author;

        let claim_duration = default_claim_duration;
        let unclaim_duration = default_unclaim_duration;

        let exists = false;
        
        await ClaimSettings.findAll({
            attributes: [
                'unique_claiming'
            ],
            where: {
                guild_id : guild.id.toString()
            }
        }).then(setting => {
            if(!setting.length) {
                return;
            }

            exists = true;
        }, reason => {
            message.reply('There was a problem querying the Claimbot database, please try again later.');
        });

        if(exists) {
            await ClaimSettings.update({
                unique_claiming: true
            }, { where: { guild_id : guild.id.toString() }})
                .then(data=> {
                    if(!data.length) {
                        message.reply("could not access database");
                        return 100;
                    }

                    message.reply('channels are now uniquely claimable.');
                    return 200;
                }, reason => {
                    message.reply('There was a problem querying the Claimbot database, please try again later.');
                    return 100;
                });
        } else if (!exists) {
            try {
                await ClaimSettings.create({
                    guild_id: guild.id.toString(),
                    claim_duration: claim_duration,
                    unclaim_duration: unclaim_duration,
                    unique_claiming: true,
                    prefix: "",
                    suffix: ""
                });
                message.reply('channels are now uniquely claimable.');
                return 200;
            }
            catch(e) {
                console.log(e);
                message.reply('There was a problem writing to the Claimbot database, please try again later.');
                return 100;
            }
        }
    }
}