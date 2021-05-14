module.exports = (sequelize, DataTypes) => {
    return sequelize.define('claimsettings', {
        guild_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        claim_duration: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        prefix: {
            type: DataTypes.STRING,
            allowNull: true
        },
        suffix: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: false,
    })
};
