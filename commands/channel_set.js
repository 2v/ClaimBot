const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");
const { Channel } = require('../dbObjects');

module.exports = {
    name: 'channel_set',
    cooldown: 3,
    variable_cooldown: false,
    admin_cooldown: 3,
    aliases: ['c_set'],
    admin: true,
    args: false,
    usage: '',
    description: 'Tags the current channel as claimable if applicable.',
    guildOnly: true,
    async execute(message, args) {
        let guild = message.guild;
        let channel = message.channel;
        let exists = false;
        let claimable = false;


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
                if(guildData[0].claimable) {
                    claimable = true;
                    message.reply('This channel is already claimable! Please use channel_unset if you would like it to be non-claimable');
                }
            }

            return;
        }, reason => {
            message.reply('There was a problem querying the Claimbot database, please try again later. 1');
            return 100;
        });


        if (exists && !claimable) {
            // update
            await Channel.update({
                claimable: true
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

                message.reply('Channel is now claimable!');

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
                    claimable: true,
                    current_owner_id: null,
                    claimed_at: null
                });
                message.reply(`Channel is now claimable!`);
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

