const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const pool = require('../database');
const settings = require('../settings');
const google = require('googleapis-async');
const moment = require('moment');
const utf8 = require('utf8');
const axios = require('axios');
const { momentDateFormat } = require('../helpers/format');
const { discordBot: discordBotConfig } = require('../settings/config');

const { orange } = discordBotConfig;

const youtube = google.youtube({
  version: 'v3',
  auth: settings.youtube.apiKey,
});

const renderTitleWithTagStripped = (title) => {
  const titleFormatted = title.replace(settings.youtube.gameTagToLookFor, '');
  return titleFormatted.trim();
};

const getAccountIdFromDescription = (description) => {
  const descriptionFormatted = description.replace(/\n/g, ' ');
  const descriptionSplitBySpaces = descriptionFormatted.toLowerCase().split(' ');
  let accountId = null;
  descriptionSplitBySpaces.forEach((word) => {
    const referralSyntax = '?referral=';
    if (word.includes(referralSyntax)) {
      const indexOfReferral = word.indexOf(referralSyntax);
      accountId = word.substring(indexOfReferral + referralSyntax.length);
    }
  });

  return accountId;
};

module.exports.run = async (bot, message, args) => {
  if (message.channel.type === 'dm') {
    message.author.send('You cannot run the !newvideo command in a DM!');
    return;
  }
  message.delete();
  if (!message.member.permissions.has('KICK_MEMBERS')) return errors.noPerms(message, 'KICK_MEMBERS');
  if (args[0] === 'help' || args.length !== 1) {
    message.author.send('Usage: !newvideo <video link>');
    return;
  }

  if (!message.member.hasPermission('MANAGE_MESSAGES')) {
    return errors.equalPerms(message, 'MANAGE_MESSAGES');
  }

  // https://www.youtube.com/watch?v=aEb5gNsmGJ8&stuff=wee
  const youtubeLink = args[0];
  let youtubeVideoId = null;
  try {
    const youtubeUrl = new URL(youtubeLink);
    youtubeVideoId = youtubeUrl.searchParams.get('v');
  } catch (err) {
    message.author.send(`Could not parse the youtube URL! Encountered error: ${err}`);
    return;
  }
  if (!youtubeVideoId) {
    message.author.send(`Could not find the video id in the URL of **${youtubeLink}**!`);
    return;
  }

  // eslint-disable-next-line no-await-in-loop
  const { items: [video] } = await youtube.videos.list({
    id: youtubeVideoId,
    part: 'snippet,statistics,liveStreamingDetails',
  });
  if (!video) {
    message.author.send(`Unable to find video id of **${youtubeVideoId}**!`);
    return;
  }
  if (settings.youtube.bannedChannelIds.includes(video.snippet.channelId)) {
    message.author.send('This channel is banned from being able to post community videos!');
    return;
  }
  if (video.liveStreamingDetails) {
    message.author.send('This is a livestream! This does not count as a community video.');
    return;
  }
  if (!video.snippet.title.startsWith(settings.youtube.gameTagToLookFor)) {
    message.author.send(`The title of this video does not start with an ${settings.youtube.gameTagToLookFor} tag!`);
    return;
  }

  let accountIdOfCreator = null;

  try {
    await pool(async (conn) => {
      // Video Thumbnail at 480 x 360 | /hqdefault.jpg
      // Refernece https://developers.google.com/youtube/v3/docs/videos/list
      const thumbnailHighVideo = video.snippet.thumbnails.high.url;
      const thumbnailBaseUrl = thumbnailHighVideo.substr(0, thumbnailHighVideo.indexOf('/hqdefault.jpg'));
      const {
        description,
        publishedAt,
        channelId,
        title,
        channelTitle,
      } = video.snippet;
      const {
        viewCount,
        likeCount,
        dislikeCount,
      } = video.statistics;
      accountIdOfCreator = getAccountIdFromDescription(description);
      const channelResults = await youtube.channels.list({
        id: channelId,
        part: 'snippet',
      });
      const communityVideo = {
        videoId: video.id,
        publishedAt: moment(publishedAt).format(momentDateFormat),
        channelId,
        title: utf8.encode(title),
        thumbnailBaseUrl,
        channelTitle: utf8.encode(channelTitle),
        viewCount,
        likeCount,
        dislikeCount,
        accountIdOfCreator,
        channelThumbnail: channelResults.items[0].snippet.thumbnails.medium.url,
      };
      console.log(`Attempting to insert community video... | Title: ${title}| Channel Title: ${channelTitle}`);
      try {
        await conn.query('INSERT INTO osmwebsite.community_videos SET ?', [communityVideo]);
        let createdDiscordPostWithCreatorsIGN = false;
        if (accountIdOfCreator) {
          let rewardCreator = false;
          const [oldCommunityVideo] = await conn.query('SELECT created FROM osmwebsite.community_videos WHERE accountIdOfCreator = ? AND videoId <> ? ORDER BY created DESC LIMIT 1', [accountIdOfCreator, video.id]);
          if (oldCommunityVideo && oldCommunityVideo.created) {
            const moreThanADay = moment().diff(moment(oldCommunityVideo.created), 'days') > 0;
            if (moreThanADay) {
              rewardCreator = true;
            }
          } else {
            rewardCreator = true;
          }
          if (rewardCreator) {
            const communityVideoReward = {
              accountid: accountIdOfCreator,
              amount: settings.youtube.rewardForCreatingVideo,
              note: `Created a community video. Title: ${title}| Channel Title: ${channelTitle}`,
              cashtype: 'maplecash',
              automatedtype: settings.automatedType.VIDEO,
            };
            await conn.query('INSERT INTO osm.account_cs_transactions SET ?', [communityVideoReward]);

            // Fetch highest level character image of account
            const [characterOfAccount] = await conn.query('SELECT name FROM osm.characters WHERE accountid = ? ORDER BY level DESC, exp DESC LIMIT 1', [accountIdOfCreator]);
            if (characterOfAccount && characterOfAccount.name) {
              const characterImageResult = await axios.post('https://oldschoolmaple.com/api/v1/generate/character/image', {
                ign: characterOfAccount.name,
              });
              const characterImage = characterImageResult.data.result;
              const discordWebhook = new Discord.WebhookClient(
                settings.youtube.discordChannel.id,
                settings.youtube.discordChannel.secret,
              );
              await discordWebhook.edit({ name: characterOfAccount.name, avatar: characterImage });
              const transactionEmbed = new Discord.MessageEmbed()
                .setDescription('**Check out my new community video related to OSM that I posted!**')
                .setColor('#00ff26')
                .setThumbnail(`${characterImage}?name=${characterOfAccount.name}`)
                .addField('Video Title', renderTitleWithTagStripped(title))
                .addField('Channel Title', channelTitle)
                .addField('Video', `https://www.youtube.com/watch?v=${video.id}`)
                .setFooter(characterOfAccount.name, `${characterImage}?name=${characterOfAccount.name}`)
                .setTimestamp(new Date());

              await discordWebhook.send({ embeds: [transactionEmbed] });
              createdDiscordPostWithCreatorsIGN = true;
            }
          }
        }
        if (!createdDiscordPostWithCreatorsIGN) {
          const discordWebhook = new Discord.WebhookClient(
            settings.youtube.discordChannel.id,
            settings.youtube.discordChannel.secret,
          );
          await discordWebhook.edit({ name: 'Cody', avatar: 'https://i.imgur.com/slXSnt7.png' });
          const transactionEmbed = new Discord.MessageEmbed()
            .setDescription(`**Check out ${channelTitle}'s new community video related to OSM that they posted!**`)
            .setColor('#00ff26')
            .setThumbnail('https://i.imgur.com/slXSnt7.png')
            .addField('Video Title', renderTitleWithTagStripped(title))
            .addField('Channel Title', channelTitle)
            .addField('Video', `https://www.youtube.com/watch?v=${video.id}`)
            .setFooter('Cody', 'https://i.imgur.com/slXSnt7.png')
            .setTimestamp(new Date());

          await discordWebhook.send({ embeds: [transactionEmbed] });
        }

        const communityVideoEmbed = new Discord.MessageEmbed()
          .setColor(orange)
          .setDescription('Added a new community video!')
          .addField('YouTube Video', youtubeLink)
          .addField('OSM Account ID of Creator', accountIdOfCreator)
          .setTimestamp(message.createdAt);

        message.author.send({ embeds: [communityVideoEmbed] });
      } catch (insertErr) {
        if (insertErr.code !== 'ER_DUP_ENTRY') {
          console.log(insertErr);
          message.author.send(`Encountered an error: ${insertErr}`);
        } else {
          console.log('Community video is a duplicate.');
          message.author.send('This community video already exists!');
        }
      }
    });
  } catch (dbErr) {
    console.log(dbErr);
  }
};

module.exports.help = {
  name: 'newvideo',
};
