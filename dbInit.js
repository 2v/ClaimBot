const Sequelize = require('sequelize');
/*
 * DO NOT RUN THIS WITHOUT A DB BACKUP,
 * SHOULD ONLY BE RUN ONCE WHEN FIRST
 * SPAWNING THE BOT
 */

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Channel = require('./models/Channel.js')(sequelize, Sequelize.DataTypes);
const ClaimSettings = require('./models/ClaimSettings.js')(sequelize, Sequelize.DataTypes);
const Prefix = require('./models/Prefix.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
    const claim_init = [
        Channel.upsert({ guild_id:"0", channel_id:0, claimable:false, current_owner_id:0, claimed_at:"NOT_A_REAL_DATE"}),
        Channel.upsert({ guild_id: "719926881448886312", channel_id: "719926881448886316", claimable:true, current_owner_id:0, claimed_at:"04:04:04"}),
        ClaimSettings.upsert({ guild_id:"0", claim_duration: 0, prefix: null, suffix: null }),
        ClaimSettings.upsert({ guild_id: "719926881448886312", claim_duration: 0.01, prefix:"epic_gamer_prefix-", suffix: "-epic_gamer_suffix"}),
        Prefix.upsert({ guild_id:0, prefix: '!' })
    ];
    await Promise.all(claim_init);
    console.log('Database synced');
    sequelize.close();
}).catch(console.error);
