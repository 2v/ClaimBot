module.exports = (sequelize, DataTypes) => {
    return sequelize.define('channel', {
        guild_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        channel_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        claimable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        current_owner_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        claimed_at: {
            type: DataTypes.STRING,
            allowNull: true
        },
    })
};
