export function generateCalendarFile(sessions: any[]): string {
	let calendarData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourBotName//EN
`;

	sessions.forEach(session => {
		const uid = session._id;
		const dtStart = session.beginTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
		const dtEnd = session.finishTime
			? session.finishTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
			: dtStart;

		calendarData += `
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtStart}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:Study Session
END:VEVENT
`;
	});

	calendarData += 'END:VCALENDAR';

	return calendarData;
}