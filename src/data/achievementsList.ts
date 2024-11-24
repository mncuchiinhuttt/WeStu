export interface AchievementCriteria {
  name: string;
  description: string;
  check: (totalDuration: number, streak: number, sessions: any[]) => boolean;
}

export const achievementsList: AchievementCriteria[] = [
	{
		name: 'Beginner',
		description: 'Complete your first study session.',
		check: (totalDuration) => totalDuration >= 0, // Awarded on first session
	},
	{
		name: 'Novice',
		description: 'Study for a total of 10 hours.',
		check: (totalDuration) => totalDuration >= 36000, // 10 hours in seconds
	},
	{
		name: 'Intermediate',
		description: 'Study for a total of 50 hours.',
		check: (totalDuration) => totalDuration >= 180000, // 50 hours
	},
	{
		name: 'Advanced',
		description: 'Study for a total of 100 hours.',
		check: (totalDuration) => totalDuration >= 360000, // 100 hours
	},
	{
		name: 'Streak Starter',
		description: 'Maintain a study streak for 5 consecutive days.',
		check: (_, streak) => streak >= 5,
	},
	{
		name: 'Dedicated',
		description: 'Maintain a study streak for 20 consecutive days.',
		check: (_, streak) => streak >= 20,
	},
	{
		name: 'Marathon',
		description: 'Study for a total of 200 hours.',
		check: (totalDuration) => totalDuration >= 720000, // 200 hours
	},
	{
    name: 'Beginner',
    description: 'Complete your first study session.',
    check: (totalDuration) => totalDuration >= 0, // Awarded on first session
  },
  {
    name: 'Novice',
    description: 'Study for a total of 10 hours.',
    check: (totalDuration) => totalDuration >= 36000, // 10 hours in seconds
  },
  {
    name: 'Intermediate',
    description: 'Study for a total of 50 hours.',
    check: (totalDuration) => totalDuration >= 180000, // 50 hours in seconds
  },
  {
    name: 'Advanced',
    description: 'Study for a total of 100 hours.',
    check: (totalDuration) => totalDuration >= 360000, // 100 hours in seconds
  },
  {
    name: 'Streak Starter',
    description: 'Maintain a study streak for 5 consecutive days.',
    check: (_, streak) => streak >= 5,
  },
  {
    name: 'Dedicated',
    description: 'Maintain a study streak for 20 consecutive days.',
    check: (_, streak) => streak >= 20,
  },
  {
    name: 'Marathon',
    description: 'Study for a total of 200 hours.',
    check: (totalDuration) => totalDuration >= 720000, // 200 hours in seconds
  },
  {
    name: 'Weekend Warrior',
    description: 'Complete study sessions on both Saturday and Sunday in a single week.',
    check: (_, __, sessions) => {
      const daysStudied = new Set(
        sessions
          .filter(session => session.finishTime)
          .map(session => new Date(session.beginTime).getDay()) // 0 = Sunday, ..., 6 = Saturday
      );
      return daysStudied.has(0) && daysStudied.has(6); // Sunday and Saturday
    },
  },
  {
    name: 'Deep Thinker',
    description: 'Accumulate 50 hours of deep study (sessions without breaks).',
    check: (totalDuration, _, sessions) => {
      const deepStudySeconds = sessions
        .filter(session => !session.hasBreak) // Assume 'hasBreak' indicates if there were breaks
        .reduce((acc, session) => acc + session.duration, 0);
      return deepStudySeconds >= 180000; // 50 hours in seconds
    },
  },
  {
    name: 'Explorer',
    description: 'Study in 5 different subjects/topics.',
    check: (_, __, sessions) => {
      const subjects = new Set(sessions.map(session => session.subject)); // Assume 'subject' field exists
      return subjects.size >= 5;
    },
  },
  {
    name: 'Master',
    description: 'Complete 100 study sessions.',
    check: (totalDuration, __, sessions) => sessions.length >= 100,
  },
  {
    name: 'Perseverance',
    description: 'Continue studying despite 10 missed streak days.',
    check: (totalDuration, __, sessions) => {
      // This requires tracking missed streak days; assuming a 'missedStreakDays' field exists
      const missedDays = sessions[0]?.missedStreakDays || 0; // Adjust based on your data model
      return missedDays >= 10;
    },
  },
  {
    name: 'Night Owl',
    description: 'Complete a study session after 10 PM.',
    check: (_, __, sessions) => {
      return sessions.some(session => {
        const hour = new Date(session.beginTime).getHours();
        return hour >= 22;
      });
    },
  },
  {
    name: 'Early Bird',
    description: 'Complete a study session before 6 AM.',
    check: (_, __, sessions) => {
      return sessions.some(session => {
        const hour = new Date(session.beginTime).getHours();
        return hour < 6;
      });
    },
  },
  {
    name: 'Consistency',
    description: 'Complete at least one study session every day for a week.',
    check: (_, streak) => streak >= 7,
  },
  {
    name: 'Focused',
    description: 'Complete a study session of 4 hours without breaks.',
    check: (_, __, sessions) => {
      return sessions.some(session => session.duration >= 14400 && !session.hasBreak); // 4 hours in seconds
    },
  },
];