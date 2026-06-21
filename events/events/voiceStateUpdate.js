const { Events, ChannelType } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
        const HUB = process.env.HUB_CHANNEL_ID;
        const CATEGORY = process.env.CATEGORY_ID;

        // Condition A: User enters the generation hub channel
        if (newState.channelId === HUB) {
            const member = newState.member;
            
            try {
                const newChannel = await newState.guild.channels.create({
                    name: `🔊 ${member.displayName}'s Room`,
                    type: ChannelType.GuildVoice,
                    parent: CATEGORY,
                    permissionOverwrites: [
                        { id: member.id, allow: ['ManageChannels', 'MoveMembers'] }
                    ]
                });

                await member.voice.setChannel(newChannel);
                client.tempChannels.add(newChannel.id);
            } catch (err) {
                console.error("Error generating temporary VC room:", err.message);
            }
        }

        // Condition B: User disconnects or leaves a room
        if (oldState.channelId && oldState.channelId !== newState.channelId) {
            if (client.tempChannels.has(oldState.channelId)) {
                const oldChannel = oldState.channel;
                if (oldChannel && oldChannel.members.size === 0) {
                    try {
                        await oldChannel.delete();
                        client.tempChannels.delete(oldState.channelId);
                    } catch (err) {
                        console.error("Error clearing stale VC room:", err.message);
                    }
                }
            }
        }
    },
};