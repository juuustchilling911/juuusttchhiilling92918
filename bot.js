const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = ".";

//مسح رسائل
client.on('message', message => {  
    if (message.author.bot) return; 
    if (message.content.startsWith(prefix + 'clear')) { 
    if(!message.channel.guild) return message.reply(`** This Command For Servers Only**`); 
     if(!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`** You don't have Premissions!**`);
     if(!message.guild.member(client.user).hasPermission('MANAGE_GUILD')) return message.channel.send(`**I don't have Permission!**`);
    let args = message.content.split(" ").slice(1)
    let messagecount = parseInt(args);
    if (args > 100) return message.reply(`** The number can't be more than **100** .**`).then(messages => messages.delete(5000))
    if(!messagecount) args = '100';
    message.channel.fetchMessages({limit: messagecount}).then(messages => message.channel.bulkDelete(messages)).then(msgs => {
    message.channel.send(`** Done , Deleted \`${msgs.size}\` messages.**`).then(messages => messages.delete(5000));
    })
  }
});


//رول برياكشن

client.on('message', message =>{
  if(message.content.startsWith(prefix + 'add')) {
    let args = message.content.split(" ").slice(1).join(" ");
    if(!args) return message.channel.send('**Please type the emoji ID after the command!**')
    if(args.length < "18" || args.length > "18" || isNaN(args)) return message.channel.send(`**This emoji Can't be Found :x:**`)
    message.guild.createEmoji(`https://cdn.discordapp.com/emojis/${args}.png`, `${args}`).catch(mstry => {
     return message.channel.send(`**This emoji Can't be Found :x:**`)
    })
    message.channel.send(`**Successfully Added The Emoji ✅**`)
  }
});


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


//افتار اي شخص بالعالم

﻿﻿client.on("message", message => {
if(message.content.startsWith(prefix + "avatar")){
if(message.author.bot || message.channel.type == "dm") return;
var args = message.content.split(" ")[1];
var avt = args || message.author.id;
client.fetchUser(avt)
.then((user) => {
avt = user
let avtEmbed = new Discord.RichEmbed()
.setColor("#36393e")
.setAuthor(`${avt.username}'s Avatar`, message.author.avatarURL)
.setImage(avt.avatarURL)
.setFooter(`PrimeBot.`, message.client.user.avatarURL);
message.channel.send(avtEmbed);
})
.catch(() => message.channel.send(`Error`));
} 
}); 


//الوان

const Discord = require('discord.js');
const palette = require("google-palette");

client.on("message", async (message) => {
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) != 0) return;

    const [command, ...args] = message.content.slice(prefix.length).split(/ +/g);
    if (command == 'colors') {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("تنقصك صلاحيات ادمن لاستخدم هذا الامر")
        order = args.shift();
        if (command == 'generate') {
            let size = args.shift() || 10;
            if (size < 10 || size > 50) return message.channel.send('يمكن ادخال رقم ما بين العشرة والخمسين فقط');
            let colors = palette('rainbow', size);
            colors.map((color, idx) => {
                setTimeout(() => {
                    message.guild.createRole({ name: idx + 1, color, permissions: [] }).catch(console.error);
                }, idx * 200)
            });
        }
        else if (order == 'clear') {
            let timer = 0;
            message.guild.roles.filter(role => !isNaN(role.name)).map(role => {
                setTimeout(() => {
                    role.delete();
                }, ++timer * 200);
            })
        }
    }
});




client.login(process.env.BOT_TOKEN)
