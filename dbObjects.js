const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Reputation = sequelize.import('models/Channel');
const RepThresholdSettings = sequelize.import('models/ClaimSettings');
const Prefix = sequelize.import('models/Prefix.js');

module.exports = { Channel, ClaimSettings, Prefix };
