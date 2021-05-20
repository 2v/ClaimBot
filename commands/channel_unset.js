const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");
const { Channel } = require('../dbObjects');

module.exports = {
    name: 'channel_unset',
    cooldown: 3,
    variable_cooldown: false,
    admin_cooldown: 3,
    aliases: ['c_unset', 'unset_claimable', 'unset_channel_claimable', 'channel_set_unclaimable'],
    admin: true,
    args: false,
    usage: '',
    description: 'Tags the current channel as unclaimable if applicable.',
    guildOnly: true,
    async execute(message, args) {
        let guild = message.guild;
        let channel = message.channel;
        let exists = false;
        let claimable = true;

        await Channel.findAll({
            attributes: [
                'claimable',
            ],
            where: {
                [Op.and]: [
                    { guild_id : guild.id.toString() },
                    { channel_id : channel.id.toString() }
                ]
            }
        }).then(guildData => {
            if(guildData.length) {
                exists = true;
                if(!guildData[0].claimable) {
                    claimable = false;
                    message.reply('This channel is already non-claimable! Please use channel_set if you would like it to be claimable');
                }
            }

            return;
        }, reason => {
            message.reply('There was a problem querying the Claimbot database, please try again later. 1');
            return 100;
        });


        if (exists && claimable) {
            // update
            await Channel.update({
                claimable: false
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
                message.reply('Channel is now non-claimable!');
                return 200;

            }, reason => {
                message.reply('There was a problem querying the Claimbot database, please try again later.');
                return 100;
            });
        } else if (!exists) {
            // create a new entry
            try {
                await Channel.create({
                    guild_id: guild.id.toString(),
                    channel_id: channel.id.toString(),
                    claimable: false,
                    current_owner_id: null,
                    claimed_at: null
                });
                message.reply(`Channel has been instantiated as non-claimable!`);
                return 200;
           }
           catch (e) {
               console.log(e);
                message.reply('There was a problem writing to the Claimbot database, please try again later.');
                return 100;
            }
        }
    },
};

