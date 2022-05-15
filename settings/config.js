require("dotenv").config()

// MySQL database
module.exports.mySQL = {
  host: '66.94.123.179:3306',
  user: 'u91_LJYWnnJ4Hv',
  password: 'lTri0V!4Y^unt82hzZNh=MwX',
  database: 's91_maple',
};

// Discord bot config
module.exports.discordBot = {
  channelName: 'קסטליה',
  token: process.env.TOKEN,
  prefix: '!',
  red: '#b70000',
  orange: '#ff6a00',
  green: '#00ff26',
  purple: '#d604cf',
};
