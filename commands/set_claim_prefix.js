const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require('../dbObjects');
const { formatSeconds } = require('../util');
const { mysqlEscape } = require('../util');
const { Op } = require("sequelize");

module.exports = {
    name: 'set_claim_prefix',
    cooldown: 3,
    variable_cooldown: false,
    admin_cooldown: 3,
    aliases: ['set_channel_prefix'],
    admin: true,
    args: true,
    usage: '<new_prefix_string>',
    description: 'Sets the global prefix used when renaming claimed channels. By default, once a channel is claimed, the name is changed to /`<prefix><channel_owner_name><suffix>/`.',
    guildOnly: true,
    async execute(message, args) {
        let guild = message.guild;
        let channel = message.channel;
        let author = message.author;
        let old_prefix = null;
        let new_prefix = null;

        let claim_duration = 24; // TODO: make this a value in settings JSON

        let exists = false;

        //TODO: Add string filtering to prefix and suffix
        new_prefix = mysqlEscape(args[0]);
        if(new_prefix.length > 18) {
            message.reply('length of prefix cannot be greater than 18 characters');
            return 100;
        }

        await ClaimSettings.findAll({
            attributes: [
                'prefix'
            ],
            where: {
                guild_id : guild.id.toString()
            }
        }).then(setting => {
            if(!setting.length) {
                return;
            }

            exists = true;
            old_prefix = setting[0].prefix;
        }, reason => {
            message.reply('There was a problem querying the Claimbot database, please try again later.');
        });

        if(exists) {
            await ClaimSettings.update({
                prefix: new_prefix
            }, { where: { guild_id : guild.id.toString() }})
                .then(data=> {
                    if(!data.length) {
                        message.reply("could not access database");
                        return 100;
                    }

                    message.reply(`prefix successfully changed from \`${old_prefix}\` to \`${new_prefix}\`.`);
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
                    prefix: new_prefix,
                    suffix: ""
                });
                message.reply(`successfully changed prefix to \`${new_prefix}\``);
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



