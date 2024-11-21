import { StudyGoalTarget, GoalStatus } from '../../models/StudyGoalTarget';
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

export async function manageGoals(interaction: any) {
	const subcommand = interaction.options.getString('action');

	switch(subcommand) {
		case 'set':
			await setNewGoal(interaction);
			break;
		case 'view':
			await viewGoals(interaction);
			break;
		case 'update':
			await updateGoalProgress(interaction);
			break;
		case 'milestone':
			await manageMilestone(interaction);
			break;
	}
}

async function setNewGoal(interaction: any) {
	try {
		const description = interaction.options.getString('description');
		const category = interaction.options.getString('category');
		const targetHours = interaction.options.getNumber('target_hours');
		const priority = interaction.options.getString('priority') || 'medium';
		const deadline = interaction.options.getString('deadline');
		const recurring = interaction.options.getBoolean('recurring') || false;

		const goal = await StudyGoalTarget.create({
			userId: interaction.user.id,
			description,
			category,
			targetHours,
			priority,
			deadline: deadline ? new Date(deadline) : undefined,
			recurring,
			recurrenceInterval: recurring ? category : undefined
		});

		await interaction.reply({
			content: `✅ Study goal set: **${description}**\nTarget: ${targetHours}h`,
			ephemeral: true
		});
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'Failed to set goal',
			ephemeral: true
		});
	}
}

async function viewGoals(interaction: any) {
	try {
		const goals = await StudyGoalTarget.find({
			userId: interaction.user.id,
			status: { $ne: 'completed' }
		}).sort({ deadline: 1 });

		const embed = new EmbedBuilder()
			.setTitle('📚 Study Goals')
			.setColor('#00ff00');

		if (goals.length === 0) {
			embed.setDescription('No active goals');
		} else {
			goals.forEach(goal => {
				const progress = Math.round((goal.currentHours / goal.targetHours) * 100);
				const deadline = goal.deadline ? `\nDeadline: ${goal.deadline.toLocaleDateString()}` : '';
				
				embed.addFields({
					name: `${getStatusEmoji(goal.status)} ${goal.description}`,
					value: [
						`Category: ${goal.category}`,
						`Priority: ${goal.priority}`,
						`Progress: ${progress}% (${goal.currentHours}/${goal.targetHours}h)`,
						`Streak: ${goal.streakCount} days (Best: ${goal.bestStreak})`,
						deadline
					].join('\n')
				});
			});
		}

		await interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'Failed to view goals',
			ephemeral: true
		});
	}
}

async function updateGoalProgress(interaction: any) {
	try {
		const goalId = interaction.options.getString('goal_id');
		const hours = interaction.options.getNumber('hours');

		const goal = await StudyGoalTarget.findById(goalId);
		if (!goal) {
			await interaction.reply({
				content: 'Goal not found',
				ephemeral: true
			});
			return;
		}

		goal.currentHours += hours;
		
		// Update streak
		const today = new Date().toDateString();
		if (!goal.lastStudyDate || goal.lastStudyDate.toDateString() !== today) {
			goal.streakCount++;
			goal.bestStreak = Math.max(goal.streakCount, goal.bestStreak);
		}
		goal.lastStudyDate = new Date();

		// Check completion
		if (goal.currentHours >= goal.targetHours) {
			goal.status = GoalStatus.COMPLETED;
			goal.completedAt = new Date();
		}

		await goal.save();

		await interaction.reply({
			content: `✅ Updated progress for **${goal.description}**\nCurrent: ${goal.currentHours}h/${goal.targetHours}h`,
			ephemeral: true
		});
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'Failed to update progress',
			ephemeral: true
		});
	}
}

function getStatusEmoji(status: GoalStatus): string {
  switch(status) {
    case GoalStatus.COMPLETED: return '✅';
    case GoalStatus.FAILED: return '❌';
    case GoalStatus.IN_PROGRESS: return '⏳';
    default: return '📌';
  }
}

// Add to manageGoals.ts
async function manageMilestone(interaction: any) {
	try {
		const action = interaction.options.getString('milestone_action');
		const goalId = interaction.options.getString('goal_id');
		
		const goal = await StudyGoalTarget.findOne({
			_id: goalId,
			userId: interaction.user.id
		});

		if (!goal) {
			await interaction.reply({
				content: 'Goal not found',
				ephemeral: true
			});
			return;
		}

		switch (action) {
			case 'add':
				const description = interaction.options.getString('description');
				const targetValue = interaction.options.getNumber('target_value');

				goal.milestones.push({
					description,
					targetValue,
					currentValue: 0,
					completed: false
				});
				await goal.save();

				await interaction.reply({
					content: `✅ Added milestone to **${goal.description}**:\n${description} (Target: ${targetValue}h)`,
					ephemeral: true
				});
				break;

			case 'update':
				const milestoneId = interaction.options.getString('milestone_id');
				const progress = interaction.options.getNumber('progress');

				const milestone = goal.milestones.id(milestoneId);
				if (!milestone) {
					await interaction.reply({
						content: 'Milestone not found',
						ephemeral: true
					});
					return;
				}

				milestone.currentValue = progress;
				if (milestone.currentValue >= (milestone.targetValue ?? 0)) {
					milestone.completed = true;
					milestone.completedAt = new Date();
				}
				await goal.save();

				await interaction.reply({
					content: `✅ Updated milestone progress: ${milestone.currentValue}/${milestone.targetValue}h`,
					ephemeral: true
				});
				break;

			case 'view':
				const embed = new EmbedBuilder()
					.setTitle(`📊 Milestones for: ${goal.description}`)
					.setColor('#00ff00');

				if (goal.milestones.length === 0) {
					embed.setDescription('No milestones set');
				} else {
					goal.milestones.forEach(m => {
						const progress = Math.round((m.currentValue / (m.targetValue ?? 1)) * 100);
						embed.addFields({
							name: `${m.completed ? '✅' : '⏳'} ${m.description}`,
							value: `Progress: ${progress}% (${m.currentValue}/${m.targetValue}h)${
								m.completedAt ? `\nCompleted: ${m.completedAt.toLocaleDateString()}` : ''
							}`
						});
					});
				}

				await interaction.reply({
					embeds: [embed],
					ephemeral: true
				});
				break;
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'Failed to manage milestone',
			ephemeral: true
		});
	}
}