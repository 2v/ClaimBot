module.exports = (sequelize, DataTypes) => {
    return sequelize.define('claimsettings', {
        guild_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        claim_duration: {
            type: DataTypes.BIGINT,
            allowNull: false
        }
    }, {
        timestamps: false,
    })
};
