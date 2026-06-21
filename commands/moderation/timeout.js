const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Mutes/Timeouts a member and logs the action to the database.')
        .addUserOption(opt => opt.setName('target').setDescription('The user to timeout').setRequired(true))
        .addIntegerOption(opt => opt.setName('duration').setDescription('Duration in minutes').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for the timeout').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getMember('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason specified';

        if (!targetUser) {
            return interaction.reply({ content: '❌ User could not be found or is not in this server.', ephemeral: true });
        }

        if (!targetUser.moderatable) {
            return interaction.reply({ content: '❌ I cannot timeout this user. Check role hierarchies.', ephemeral: true });
        }

        try {
            // Apply the actual timeout via Discord API (minutes converted to milliseconds)
            await targetUser.timeout(duration * 60000, reason);

            // Log securely into SQLite database
            const statement = db.prepare(`
                INSERT INTO mod_logs (userId, guildId, moderatorId, action, reason)
                VALUES (?, ?, ?, ?, ?)
            `);
            statement.run(targetUser.id, interaction.guild.id, interaction.user.id, `TIMEOUT (${duration}m)`, reason);

            await interaction.reply({ 
                content: `🚨 **${targetUser.user.tag}** has been timed out for **${duration} minutes**. Infraction logged.` 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to process the timeout command.', ephemeral: true });
        }
    },
};