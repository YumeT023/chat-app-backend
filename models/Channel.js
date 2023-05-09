const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Channel = sequelize.define('Channel', {
	name: {
		type: DataTypes.STRING(30),
		allowNull: false,
	},
	type: {
		type: DataTypes.STRING(10),
		allowNull: false,
		defaultValue: 'public',
		comment: 'public|private',
	},
});

module.exports = Channel;
