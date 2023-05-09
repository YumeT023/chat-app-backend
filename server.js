const express = require('express');
const morgan = require('morgan');
require('colors');
const bodyParser = require('body-parser');

const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const sequelize = require('./util/database');

const { errorHandler } = require('./middlewares/errorHandler');

// Import Models
const User = require('./models/User');
const Message = require('./models/Message');
const Channel = require('./models/Channel');
const ChannelMember = require('./models/ChannelMember');

const app = express();

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// CORS
const cors = require('cors');
app.use(
	cors({
		origin: '*',
	}),
);
// app.use((req, res, next) => {
// 	res.header('Access-Control-Allow-Origin', '*');
// 	res.header(
// 		'Access-Control-Allow-Headers',
// 		'Origin, X-Requested-With, Content-Type, Accept, Authorization',
// 	);
// 	if (req.method === 'OPTIONS') {
// 		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
// 		return res.status(200).json({});
// 	}
// 	next();
// });

const PORT = process.env.PORT || 8080;

const users = require('./routes/users');
const channels = require('./routes/channels');
const messages = require('./routes/messages');

app.use(users);
app.use(channels);
app.use(messages);

app.use(errorHandler);

// Relations
User.hasMany(Message, {
	foreignKey: 'senderId',
	onDelete: 'CASCADE',
});
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

User.hasMany(Message, {
	foreignKey: 'recipientId',
	onDelete: 'CASCADE',
});
Message.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });

User.hasMany(ChannelMember, {
	foreignKey: 'memberId',
});
ChannelMember.belongsTo(User, { as: 'member', foreignKey: 'memberId' });

User.hasMany(Channel, {
	foreignKey: 'ownerId',
	onDelete: 'CASCADE',
});
Channel.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

Channel.hasMany(ChannelMember, {
	foreignKey: 'channelId',
});
ChannelMember.belongsTo(Channel, { as: 'channel', foreignKey: 'channelId' });

Channel.hasMany(Message, {
	foreignKey: 'channelId',
});
Message.belongsTo(Channel, { as: 'channel', foreignKey: 'channelId' });

const sync = async () =>
	await sequelize.sync({ force: process.env.NODE_ENV === 'development' });

sync().then(() => {
	User.create({
		name: 'Elin Mask',
		email: 'elin.mask@test.com',
		password: 'HardToGuess!1960',
	});
	User.create({
		name: 'Captain Panama',
		email: 'captain.panama@test.com',
		password: 'Jarvis1234',
	});
});

app.listen(PORT, () => {
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
			.bold,
	);
});
