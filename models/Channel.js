module.exports = (sequelize, DataTypes) => {
    return sequelize.define('channel', {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        channel_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        claimable: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        current_owner_id: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        claimed_at: {
            type: DataTypes.STRING,
            allowNull: false
        },
    })
};

