import { ChatInputCommandInteraction as Interaction } from 'discord.js';

class messageArray {
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

	length = () => {
		return this.mainArray.length;
	};

	get = (index: number) => {
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

	isEmpty() {
		if ((this.length() === 1) && !(this.mainArray[0])) return true;
		else return false;
	}
};

export function replyWithArray(interaction: Interaction, replyArray: messageArray) {
	const arrayToReply = replyArray.withPageNumber();
	const arrayLength = replyArray.length();
	interaction.reply(arrayToReply[0]);

	if (arrayLength >= 2) {
		for (let i = 1; i <= arrayLength - 1; i++) {
			interaction.followUp(arrayToReply[i]);
		}
	}
}

export default messageArray;