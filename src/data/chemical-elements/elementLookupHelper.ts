import elements from './element-data.json';


export function properCase(str: string) {
	if (str.length === 1) {
		return str.toUpperCase();
	}

	const lowered = str.toLowerCase();
	return lowered[0].toUpperCase() + lowered.slice(1);
}


export function lookupFromAtomicNumber(atomicNumber: number) {
	const element = elements[atomicNumber - 1];
	return element;
};


export function lookupFromGroupAndPeriod(group: string, period: number) {
	const elementsToReturn = elements.filter((element) => element.group === group && element.period === period);
	return elementsToReturn;
}


export function lookupFromElementName(name: string) {
	const properName = properCase(name);
	var elementsToReturn = elements.find((element) => element.name === properName);

	return elementsToReturn ?? false;
}


export function lookupFromElementSymbol(name: string) {
	const properSymbol = properCase(name);
	var elementsToReturn = elements.find((element) => element.symbol === properSymbol);

	return elementsToReturn ?? false;
}