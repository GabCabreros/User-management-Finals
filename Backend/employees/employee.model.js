const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        employeeId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        accountId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        departmentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        position: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hireDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.ENUM('Active', 'Inactive', 'On Leave', 'Terminated'),
            allowNull: false,
            defaultValue: 'Active'
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
            // include hash with this scope
            withAssociations: { include: ['account', 'department'] }
        }
    };

    return sequelize.define('employee', attributes, options);
} 