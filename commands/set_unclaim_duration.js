const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require('../dbObjects');
const { formatSeconds } = require('../util');
const { default_claim_duration } = require('../config.json');
const { default_unclaim_duration } = require('../config.json');
const { Op } = require("sequelize");

module.exports = {
    name: 'set_unclaim_duration',
    cooldown: 3,
    variable_cooldown: false,
    admin_cooldown: 3,
    admin: true,
    args: true,
    usage: '<percentage_duration>',
    description: 'An integer between 0 and 50 which represents the percentage of the latter half of the claim period in which a user can unclaim their channel. For example, if set to 30, a user must wait until the last 30% of their claim to be able to unclaim their channel. This is a global variable which affects all channels in a guild.',
    guildOnly: true,
    async execute(message, args) {
        let guild = message.guild;
        let channel = message.channel;
        let author = message.author;

        let claim_duration = default_claim_duration;
        let unclaim_duration = default_unclaim_duration;

        let exists = false;
        let old_unclaim_duration = null;
        let new_unclaim_duration = parseInt(args[0]);

        if(new_unclaim_duration === null || isNaN(new_unclaim_duration) || new_unclaim_duration < 0 || new_unclaim_duration > 50) {
            message.reply('Claim duration must be an integer between 0 and 50.');
            return 100;
        }

        await ClaimSettings.findAll({
            attributes: [
                'unclaim_duration'
            ],
            where: {
                guild_id : guild.id.toString()
            }
        }).then(setting => {
            if(!setting.length) {
                return;
            }

            exists = true;
            old_unclaim_duration = setting[0].unclaim_duration;
        }, reason => {
            message.reply('There was a problem querying the Claimbot database, please try again later.');
        });

        if(exists) {
            await ClaimSettings.update({
                unclaim_duration: new_unclaim_duration
            }, { where: { guild_id : guild.id.toString() }})
                .then(data=> {
                    if(!data.length) {
                        message.reply("could not access database");
                        return 100;
                    }

                    message.reply(`unclaim_duration successfully changed from \`${old_unclaim_duration}\` to \`${new_unclaim_duration}\`.`);
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
                    unclaim_duration: new_unclaim_duration,
                    prefix: "",
                    suffix: ""
                });
                message.reply(`successfully changed unclaim duration to \`${new_unclaim_duration}\``);
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



