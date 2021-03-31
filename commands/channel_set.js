const { v4: uuidv4 } = require('uuid');
// const { Reputation } = require('../dbObjects');
const { isAllowedString } = require('../util')

module.exports = {
    name: 'channel_set',
    cooldown: 3,
    variable_cooldown: false,
    admin_cooldown: 3,
    aliases: ['c_set'],
    admin: true,
    args: true,
    usage: '',
    description: 'Tags the current channel as claimable if applicable.',
    guildOnly: true,
    async execute(message, args) {
        let guild = message.guild;

        // update database
        try {
            const reputation = await Reputation.create({
                rep_id: reputation_id,
                guild_id: message.guild.id,
                user_id: taggedUser.id,
                user_name: taggedUser.tag,
                rep_given_by: message.author.tag,
                rep_given_by_id: message.author.id,
                rep_positive: true,
                description: repDescription
            });
            message.reply(`Rep added to ${taggedUser.tag} successfully.`);
            return 200;
       }
       catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                message.reply('That rep UUID already exists.');
                return 100;
            }
            message.reply('Something went wrong with adding reputation.');
            return 100;
        }
    },
};

