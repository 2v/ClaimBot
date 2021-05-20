const Discord = require('discord.js');
const { Channel } = require('../dbObjects');
const { ClaimSettings } = require('../dbObjects');
const { formatSeconds } = require('../util');
const { mysqlEscape } = require('../util');
const { Op } = require("sequelize");

module.exports = {
    name: 'set_claim_suffix',
    cooldown: 3,
    variable_cooldown: false,
    admin_cooldown: 3,
    aliases: ['set_channel_suffix'],
    admin: true,
    args: true,
    usage: '<new_suffix_string>',
    description: 'Sets the global suffix used when renaming claimed channels. By default, once a channel is claimed, the name is changed to /`<suffix><channel_owner_name><suffix>/`.',
    guildOnly: true,
    async execute(message, args) {
        let guild = message.guild;
        let channel = message.channel;
        let author = message.author;
        let old_suffix = null;
        let new_suffix = null;

        let claim_duration = 24; // TODO: make this a value in settings JSON

        let exists = false;

        //TODO: Add string filtering to suffix and suffix
        new_suffix = mysqlEscape(args[0]);
        if(new_suffix.length > 18) {
            message.reply('length of suffix cannot be greater than 18 characters');
            return 100;
        }

        await ClaimSettings.findAll({
            attributes: [
                'suffix'
            ],
            where: {
                guild_id : guild.id.toString()
            }
        }).then(setting => {
            if(!setting.length) {
                return;
            }

            exists = true;
            old_suffix = setting[0].suffix;
        }, reason => {
            message.reply('There was a problem querying the Claimbot database, please try again later.');
        });

        if(exists) {
            await ClaimSettings.update({
                suffix: new_suffix
            }, { where: { guild_id : guild.id.toString() }})
                .then(data=> {
                    if(!data.length) {
                        message.reply("could not access database");
                        return 100;
                    }

                    message.reply(`suffix successfully changed from \`${old_suffix}\` to \`${new_suffix}\`.`);
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
                    prefix: "",
                    suffix: new_suffix
                });
                message.reply(`successfully changed suffix to \`${new_suffix}\``);
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



