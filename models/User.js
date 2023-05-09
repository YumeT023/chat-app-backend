const { DataTypes, Model } = require('sequelize');
const sequelize = require('../util/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define(
	'User',
	{
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING(200),
			allowNull: true,
		},
		googleId: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true,
		},
		bio: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		status: {
			type: DataTypes.INTEGER,
			allowNull: false,
			comment: '0: Away, 1: Connected, 2: Do not disturb',
			defaultValue: 0,
		},
	},
	{ timestamps: true, paranoid: true },
);

Model.prototype.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const DEFAULT_SALT_ROUNDS = 10;

User.addHook('beforeCreate', async (user) => {
	const salt = await bcrypt.genSalt(DEFAULT_SALT_ROUNDS);
	user.password = await bcrypt.hash(user.password, salt);
});

User.beforeUpdate(async (user) => {
	if (user.changed('password')) {
		const salt = await bcrypt.genSalt(DEFAULT_SALT_ROUNDS);
		user.password = await bcrypt.hash(user.password, salt);
	}
});
module.exports = User;
