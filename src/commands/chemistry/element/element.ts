import { ChatInputCommandInteraction as Interaction, SlashCommandBuilder } from 'discord.js';
import {
	lookupFromAtomicNumber,
	lookupFromGroupAndPeriod,
	lookupFromElementName,
	lookupFromElementSymbol
} from '../../../data/chemical-elements/elementLookupHelper';
import { groupCommandOptions } from '../../../data/chemical-elements/groupCommandOptions';


interface ElementData {
	atomicNumber: number,
	symbol: string,
	name: string,
	atomicMass: number,
	isAtomicMassKnown: boolean,
	electronicConfiguration: string,
	electronegativity: number | null,
	oxidationStates: number[] | null,
	groupBlockVI: string,
	period: number,
	group: string,
	groupIUPAC: number;
}


class MessageArray {
	mainArray: string[] = [""];

	push(item: string) {
		if (item.length >= 2000) {
			throw new Error("Cannot append this string because its length is greater than 2000 characters.");
		}

		const currentLength = this.mainArray.length;
		const lastItem = this.mainArray[currentLength - 1];

		if (item.length + lastItem.length >= 1850) {
			this.mainArray.push(item);
		} else {
			this.mainArray.pop();
			this.mainArray.push(lastItem + item);
		}
	};

	extend(list: string[]) {
		for (const item of list) {
			if (item.length >= 2000) {
				throw new Error("Cannot extend with this list because it contains an item whose length is greater than 2000 characters.");
			}
		}

		for (const item of list) {
			this.push(item);
		}
	};

	length() {
		return this.mainArray.length;
	};

	get(index: number) {
		return this.mainArray[index];
	};

	withPageNumber() {
		const totalPageNumber = this.length();
		if (totalPageNumber === 1) return this.mainArray;

		let result: string[] = [];
		for (let i = 0; i < totalPageNumber; ++i) {
			const page = this.mainArray[i];
			const pageWithNumber = page + `-# Trang ${i + 1}/${totalPageNumber}`;
			result.push(pageWithNumber);
		}
		return result;
	};
};


function constructPlainReplyArray(elementData: ElementData) {
	const {
		atomicNumber,
		symbol,
		name,
		atomicMass,
		isAtomicMassKnown,
		electronicConfiguration,
		electronegativity,
		oxidationStates,
		groupBlockVI,
		period,
		group,
		groupIUPAC
	} = elementData;

	const oxidationStatesString: string[] = [];
	if (oxidationStates) {
		for (const oxidationState of oxidationStates) {
			oxidationStatesString.push(oxidationState < 0 ? String(oxidationState) : `+${oxidationState}`);
		}
	}

	const plainReplyArray = [];

	plainReplyArray.push(`# ${name} (${symbol})\n`);
	plainReplyArray.push(`## Vị trí trong bảng tuần hoàn và tính chất vật lý\n`);
	plainReplyArray.push(`- Số hiệu nguyên tử: ${atomicNumber}\n`);
	plainReplyArray.push(`- Nhóm: ${group} (nhóm ${groupIUPAC})\n`);
	plainReplyArray.push(`- Chu kỳ: ${period}\n`);
	plainReplyArray.push(`- Cấu hình electron: ${electronicConfiguration}\n`);
	if (isAtomicMassKnown) {
		plainReplyArray.push(`- Khối lượng nguyên tử: ${atomicMass}\n`);
	} else {
		plainReplyArray.push(`- Khối lượng nguyên tử: [${atomicMass}]\n`);
	}
	plainReplyArray.push(`## Tính chất hoá học\n`);
	plainReplyArray.push(`- Tính chất cơ bản: ${groupBlockVI}\n`);
	plainReplyArray.push(`- Độ âm điện: ${electronegativity ? `χ=${electronegativity}` : 'Chưa xác định'}\n`);
	plainReplyArray.push(`- Số oxy hoá: ${oxidationStatesString.length ? oxidationStatesString.join('; ') : 'Chưa xác định'}\n`);

	return plainReplyArray;
}


function constructPlainReplyArrayFromAtomicNumber(atomicNumber: number) {
	const element = lookupFromAtomicNumber(atomicNumber);
	return constructPlainReplyArray(element);
}


function constructPlainReplyArrayFromElementName(name: string) {
	const element = lookupFromElementName(name);
	if (element) {
		return constructPlainReplyArray(element);
	} else {
		return [];
	}
}


function constructPlainReplyArrayFromElementSymbol(symbol: string) {
	const element = lookupFromElementSymbol(symbol);
	if (element) {
		return constructPlainReplyArray(element);
	} else {
		return [];
	}
}


function constructPlainReplyArrayFromGroupAndPeriod(group: string, period: number) {
	const elements = lookupFromGroupAndPeriod(group, period);
	const plainReplyArray: string[] = [];
	for (const element of elements) {
		const arrayToExtend = constructPlainReplyArray(element);
		plainReplyArray.push(...arrayToExtend);
	}
	return plainReplyArray;
}



export function run({ interaction }: { interaction: Interaction; }) {
	const subcommand = interaction.options.getSubcommand();
	switch (subcommand) {
		case 'atomic-number': {
			const atomicNumber = interaction.options.getInteger("atomic-number");
			if (!(atomicNumber)) {
				interaction.reply(
					{
						content: "Cannot retrieve atomic number.\n**This should not happen. There might have been an internal error. Please report this error to the developer.**",
						ephemeral: true
					}
				);
				return;
			}

			if (atomicNumber <= 0 || atomicNumber >= 119) {
				interaction.reply(
					{
						content: `No such element with atomic number ${atomicNumber}.\n**This should not happen. There might have been an internal error. Please report this error to the developer.**`,
						ephemeral: true
					}
				);
				return;
			}

			var plainReplyArray = constructPlainReplyArrayFromAtomicNumber(atomicNumber);
			break;
		}


		case 'name': {
			const name = interaction.options.getString('name');

			if (!(name)) {
				interaction.reply(
					{
						content: "Cannot retrieve element name.\n**This should not happen. There might have been an internal error. Please report this error to the developer.**",
						ephemeral: true
					}
				);
				return;
			}

			var plainReplyArray = constructPlainReplyArrayFromElementName(name);

			if (!plainReplyArray.length) {
				interaction.reply(
					{
						content: `No such element with name **${name}**.`,
						ephemeral: true
					}
				);
				return;
			}

			break;
		}


		case 'symbol': {
			const symbol = interaction.options.getString('symbol');

			if (!(symbol)) {
				interaction.reply(
					{
						content: "Cannot retrieve element symbol.\n**This should not happen. There might have been an internal error. Please report this error to the developer.**",
						ephemeral: true
					}
				);
				return;
			}

			var plainReplyArray = constructPlainReplyArrayFromElementSymbol(symbol);

			if (!plainReplyArray.length) {
				interaction.reply(
					{
						content: `No such element with symbol **${symbol}**.`,
						ephemeral: true
					}
				);
				return;
			}

			break;
		}


		case 'group-and-period': {
			const group = interaction.options.getString('group');
			const period = interaction.options.getInteger('period');

			if (!(group && period)) {
				interaction.reply(
					{
						content: "Cannot retrieve group and period.\n**This should not happen. There might have been an internal error. Please report this error to the developer.**",
						ephemeral: true
					}
				);
				return;
			}

			var plainReplyArray = constructPlainReplyArrayFromGroupAndPeriod(group, period);
			break;
		}


		default: {
			interaction.reply(
				{
					content: "Invalid subcommand.\n**This should not happen. There might have been an internal error. Please report this error to the developer.**",
					ephemeral: true
				}
			);
			return;
		}
	}


	const replyArray = new MessageArray();
	replyArray.extend(plainReplyArray);
	const pages = replyArray.withPageNumber();

	(async () => {
		await interaction.reply(pages[0]);
		if (replyArray.length() >= 2) {
			for (let i = 1; i < replyArray.length(); ++i) {
				await interaction.followUp(pages[i]);
			}
		}
	})();
}


export const data = new SlashCommandBuilder()
	.setName("element")
	.setDescription("Show information about 1 or more chemical element(s)")
	.setDescriptionLocalization('vi', "Thông tin về 1 hoặc nhiều nguyên tố hoá học")

	.addSubcommand(subcommand => subcommand
		.setName('atomic-number')
		.setDescription("Search for element(s) with the given atomic number")
		.setDescriptionLocalization('vi', "Tìm kiếm nguyên tố hoá học với số hiệu nguyên tử đã cho")
		.addIntegerOption(option => option
			.setName("atomic-number")
			.setDescription("The atomic number of the element to find")
			.setDescriptionLocalization('vi', "Số hiệu nguyên tử của nguyên tố hoá học cần tìm")
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(118)
		)
	)

	.addSubcommand(subcommand => subcommand
		.setName('name')
		.setDescription("Search for element(s) with the given name")
		.setDescriptionLocalization('vi', "Tìm kiếm nguyên tố hoá học với tên đã cho")
		.addStringOption(option => option
			.setName("name")
			.setDescription("The name of the element to find")
			.setDescriptionLocalization('vi', "Tên của nguyên tố hoá học cần tìm")
			.setRequired(true)
		)
	)

	.addSubcommand(subcommand => subcommand
		.setName('symbol')
		.setDescription("Search for element(s) with the given symbol")
		.setDescriptionLocalization('vi', "Tìm kiếm nguyên tố hoá học với ký hiệu hoá học đã cho")
		.addStringOption(option => option
			.setName("symbol")
			.setDescription("The symbol of the element to find")
			.setDescriptionLocalization('vi', "Ký hiệu của nguyên tố hoá học cần tìm")
			.setRequired(true)
		)
	)

	.addSubcommand(subcommand => subcommand
		.setName('group-and-period')
		.setDescription("Search for element(s) with the given period and group")
		.setDescriptionLocalization('vi', "Tìm kiếm nguyên tố hoá học nằm ở nhóm và chu kỳ đã cho")
		.addStringOption(option => option
			.setName('group')
			.setDescription("The group of element(s) to find")
			.setDescriptionLocalization('vi', "Nhóm của nguyên tố hoá học cần tìm")
			.setRequired(true)
			.setChoices(...groupCommandOptions)
		)
		.addIntegerOption(option => option
			.setName('period')
			.setDescription("The period of element(s) to find")
			.setDescriptionLocalization('vi', "Chu kỳ của nguyên tố hoá học cần tìm")
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(7)
		)
	);


export const option = {
	devOnly: true
};