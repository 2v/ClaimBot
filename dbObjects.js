const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

/* Channel DB object contains information on each claimable channel mapped to each guild */
const Channel = require('./models/Channel.js')(sequelize, Sequelize.DataTypes);

/* ClaimSettings DB object contains global claim settings for each guild, such
 * as the duration of claims and the desired prefix and suffix to pad the user's name
 * (default is void). */
const ClaimSettings = require('./models/ClaimSettings.js')(sequelize, Sequelize.DataTypes);

/* Prefix DB object maps a custom command prefix to a guild ID if one is specified. Once specified entry will not be deleted, even if it is reverted to the default prefix */
const Prefix = require('./models/Prefix.js')(sequelize, Sequelize.DataTypes);

module.exports = { Channel, ClaimSettings, Prefix };
