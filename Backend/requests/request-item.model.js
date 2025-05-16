const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        requestId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Completed'),
            allowNull: false,
            defaultValue: 'Pending'
        },
        created: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: [] }
        },
        scopes: {
            // include request with this scope
            withRequest: { include: ['request'] }
        }
    };

    return sequelize.define('requestItem', attributes, options);
} 