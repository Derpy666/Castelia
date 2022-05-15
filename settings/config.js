require("dotenv").config()

// MySQL database
module.exports.mySQL = {
  host: process env.MYSQL_HOST,
  user: process env.MYSQL_USER,
  password: process env.MYSQL_PASS,
  database: process env.MYSQL_NAME,
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
