export function getRandomElement<T>(list: T[]): T {
	const randomIndex = Math.floor(Math.random() * list.length);
	return list[randomIndex];
}

export function getRandomElements<T>(list: T[], quantity: number): T[] {
	const randomIndex = (() => Math.floor(Math.random() * list.length));
	const randomElements = [];
	while (randomElements.length < quantity) {
		const j = randomIndex();
		randomElements.push(list[j]);
		list.splice(j, 1);
	}
	return randomElements;
}