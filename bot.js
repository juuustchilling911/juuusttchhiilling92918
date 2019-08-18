const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = ".";


client.on("ready", () => {
  client.reactionRoles = [];
});


client.on('message', (message) => {
  if (message.author.bot) return;
  if (message.content.indexOf(prefix) != 0) return;

  const [command, ...args] = message.content.slice(prefix.length).split(/ +/g);
  client[message.guild.id] = client[message.guild.id] || {};
  if (command === "add") {
    if (!message.channel.guild) return message.reply(`**this ~~command~~ __for servers only__**`);
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("sorry you can't do this");
    if (client[message.guild.id].rec) return;
    let role_name = args.join(" ");
    if (!role_name) return message.channel.send(`\`\`${prefix}add <role-name>\`\``);
    let ReactionRole = message.mentions.roles.first() || message.guild.roles.find((role) => {
      return ((role.name == role_name) || (role.name.toLowerCase().startsWith(role_name.toLowerCase())))
    });
    if (!ReactionRole) return message.channel.send("this role not exsits..");
    client[message.guild.id] = { rec: true };
    message.channel.send("now please go add reaction where you want").then(res => {
      client[message.guild.id].rec = true;
      client[message.guild.id].role = ReactionRole; 
    })
  }
});



client.on('raw', raw => {
  if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(raw.t)) return;
  var channel = client.channels.get(raw.d.channel_id);
  if (channel.messages.has(raw.d.message_id)) return;
  channel.fetchMessage(raw.d.message_id).then(message => {
    var reaction = message.reactions.get((raw.d.emoji.id ? `${raw.d.emoji.name}:${raw.d.emoji.id}` : raw.d.emoji.name));
    if (raw.t === 'MESSAGE_REACTION_ADD') return client.emit('messageReactionAdd', reaction, client.users.get(raw.d.user_id));
    if (raw.t === 'MESSAGE_REACTION_REMOVE') return client.emit('messageReactionRemove', reaction, client.users.get(raw.d.user_id));
  });
});

client.on('messageReactionAdd', (reaction, user) => {
  if (user.id == client.user.id) return;
  if (client[reaction.message.guild.id].rec) {
    var done = false;
    client.reactionRoles[reaction.message.id+reaction.emoji.id] = { 
      role: client[reaction.message.guild.id].role, 
      message_id: reaction.message.id, 
      emoji: reaction.emoji 
    };
    client[reaction.message.guild.id].rec = false;
    client[reaction.message.guild.id].role = null;
    reaction.message.react(reaction.emoji.name)
      .catch(err => { done = true; reaction.message.channel.send(`sorry i can't use this emoji but the reaction role done! anyone react will get the role!`) })
    if (done) reaction.remove(user);
  } else {
    var request = client.reactionRoles[reaction.message.id+reaction.emoji.id]
    if (!request) return;
    if (request.emoji.name != reaction.emoji.name) return reaction.remove(user);
    reaction.message.guild.members.get(user.id).addRole(request.role);
  }
});

client.on('messageReactionRemove', (reaction, user) => {
  if (user.id == client.user.id) return;
  if (client[reaction.message.guild.id].rec) return;
  let request = client.reactionRoles[reaction.message.id+reaction.emoji.id];
  if (!request) return;
  reaction.message.guild.members.get(user.id).removeRole(request.role);
})



client.login(process.env.BOT_TOKEN)