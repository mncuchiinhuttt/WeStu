import { ChatInputCommandInteraction as Interaction, SlashCommandBuilder } from 'discord.js';
import { lookupFromAtomicNumber } from '../../../data/lookupHelper'


class MessageArray {
	mainArray: string[] = [""];

	push = (item: string) => {
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

	// extend = (list: string[]) => {
	// 	for (const item of list) {
	// 		if (item.length >= 2000) {
	// 			throw new Error("Cannot extend with this list because it contains an item whose length is greater than 2000 characters.");
	// 		} 
	// 	}

	// 	for (const item of list) {
	// 		this.push(item);
	// 	}
	// }

	length = () => {
		return this.mainArray.length;
	};

	get = (index: number) => {
		return this.mainArray[index];
	};

	withPageNumber = () => {
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



export function run({ interaction }: { interaction: Interaction }) {
	const specifiedAtomicNumber = interaction.options.getInteger("atomic-number");
	if (!(specifiedAtomicNumber)) {
		interaction.reply(
			{
				content: "Cannot receive atomic number.\n**This should not happen. There might have been an internal error. Please report this error to the developer.**",
				ephemeral: true
			}
		);
		return;
	}

	if (specifiedAtomicNumber <= 0 || specifiedAtomicNumber >= 119) {
		interaction.reply(
			{
				content: `No such element with atomic number ${specifiedAtomicNumber}.\n**This should not happen. There might have been an internal error. Please report this error to the developer.**`,
				ephemeral: true
			}
		);
	}

	const information = lookupFromAtomicNumber(specifiedAtomicNumber);
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
	} = information;

	let replyArray = new MessageArray();

	replyArray.push(`# ${name} (${symbol})\n`);
	replyArray.push(`## Vị trí trong bảng tuần hoàn và tính chất vật lý\n`);
	replyArray.push(`- Số hiệu nguyên tử: ${atomicNumber}\n`);
	replyArray.push(`- Nhóm: ${group} (nhóm ${groupIUPAC})\n`);
	replyArray.push(`- Chu kỳ: ${period}\n`);
	replyArray.push(`- Cấu hình electron: ${electronicConfiguration}\n`);
	if (isAtomicMassKnown) {
		replyArray.push(`- Khối lượng nguyên tử: ${atomicMass}\n`);
	} else {
		replyArray.push(`- Khối lượng nguyên tử: [${atomicMass}]\n`);
	}
	replyArray.push(`## Tính chất hoá học\n`);
	replyArray.push(`- Tính chất cơ bản: ${groupBlockVI}\n`);
	replyArray.push(`- Độ âm điện: ${electronegativity ? electronegativity : 'Chưa xác định'}\n`);
	replyArray.push(`- Số oxy hoá: ${oxidationStates ? oxidationStates.join('; ') : 'Chưa xác định'}\n`);


	interaction.reply(replyArray.withPageNumber()[0]);
}


export const data = new SlashCommandBuilder()
	.setName("element")
	.setDescription("Show information about 1 or more chemical element(s)")
	.setDescriptionLocalization('vi', "Thông tin về 1 hoặc nhiều nguyên tố hoá học")
	.addIntegerOption(option => option
		.setName("atomic-number")
		.setDescription("The atomic number of the element to show information about")
		.setDescriptionLocalization('vi', "Số hiệu nguyên tử của nguyên tố hoá học cần tìm")
		.setRequired(true)
		.setMinValue(1)
		.setMaxValue(118)
	);

export const option = {
	devOnly: true
};