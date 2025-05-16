const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        accountId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('Equipment', 'Leave', 'Resources', 'Other'),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Completed'),
            allowNull: false,
            defaultValue: 'Pending'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true
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
            // include items with this scope
            withItems: { include: ['items'] },
            // include account with this scope
            withAccount: { include: ['account'] },
            // include both
            withAll: { include: ['items', 'account'] }
        }
    };

    return sequelize.define('request', attributes, options);
} 