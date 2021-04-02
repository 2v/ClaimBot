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
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        claimed_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
    })
};

