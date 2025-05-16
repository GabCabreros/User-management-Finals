const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM(
                'Onboarding', 
                'Department Transfer', 
                'Status Change', 
                'Termination', 
                'Request',
                'AccountCreation',
                'ProfileUpdate',
                'DepartmentCreation',
                'DepartmentUpdate',
                'DepartmentDeletion'
            ),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('Pending', 'In Progress', 'Approved', 'Rejected', 'Completed'),
            allowNull: false,
            defaultValue: 'Pending'
        },
        previousValue: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        newValue: {
            type: DataTypes.TEXT,
            allowNull: true
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
            // include employee with this scope
            withEmployee: { include: ['employee'] }
        }
    };

    return sequelize.define('workflow', attributes, options);
} 