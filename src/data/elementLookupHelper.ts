import elements from './element-data.json';
// import {mapping} from './map';

export const groupOptions = [
	{name: 'Nhóm IA (nhóm 1)', value: 'IA'},
	{name: 'Nhóm IIA (nhóm 2)', value: 'IIA'},
	{name: 'Nhóm IIIB (nhóm 3)', value: 'IIIB'},
	{name: 'Nhóm IVB (nhóm 4)', value: 'IVB'},
	{name: 'Nhóm VB (nhóm 5)', value: 'VB'},
	{name: 'Nhóm VIB (nhóm 6)', value: 'VIB'},
	{name: 'Nhóm VIIB (nhóm 7)', value: 'VIIB'},
	{name: 'Nhóm VIIIB (nhóm 8, 9, 10)', value: 'VIIIB'},
	{name: 'Nhóm IB (nhóm 11)', value: 'IB'},
	{name: 'Nhóm IIB (nhóm 12)', value: 'IIB'},
	{name: 'Nhóm IIIA (nhóm 13)', value: 'IIIA'},
	{name: 'Nhóm IVA (nhóm 14)', value: 'IVA'},
	{name: 'Nhóm VA (nhóm 15)', value: 'VA'},
	{name: 'Nhóm VIA (nhóm 16)', value: 'VIA'},
	{name: 'Nhóm VIIA (nhóm 17)', value: 'VIIA'},
	{name: 'Nhóm VIIIA (nhóm 18)', value: 'VIIIA'}
]


export function lookupFromAtomicNumber(atomicNumber: number) {
	const element = elements[atomicNumber - 1];
	return element;
};


export function lookupFromGroupAndPeriod(group: string, period: number) {
	const elementsToReturn = elements.filter((element) => element.group === group && element.period === period);
	return elementsToReturn
}

