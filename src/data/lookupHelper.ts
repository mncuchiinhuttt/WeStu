import elements from './element-data.json';
// import {mapping} from './map';


export function lookupFromAtomicNumber(atomicNumber: number) {
	const element = elements[atomicNumber - 1];
	return element;
};


export function lookupFromGroupAndPeriod(group: string, period: number) {
	const elementsToReturn = elements.find((element) => element.group === group && element.period === period)
}
