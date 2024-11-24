import { ChatInputCommandInteraction as Interaction } from 'discord.js';

class messageArray {
	mainArray: string[] = [""];

	push = (item: string) => {
		if (item.length >= 2000) {
			while (item.length > 1850) {
				const lastSentenceEnd = item.lastIndexOf('.', 1850);
				const splitIndex = lastSentenceEnd !== -1 ? lastSentenceEnd + 1 : 1850;
				const firstPart = item.slice(0, splitIndex);
				const secondPart = item.slice(splitIndex);
				
				const currentLength = this.mainArray.length;
				const lastItem = this.mainArray[currentLength - 1];

				if (lastItem.length + firstPart.length <= 1850) {
					this.mainArray.pop();
					this.mainArray.push(lastItem + firstPart);
				} else {
					this.mainArray.push(firstPart);
				}

				item = secondPart;
			}

			const currentLength = this.mainArray.length;
			const lastItem = this.mainArray[currentLength - 1];

			if (lastItem.length + item.length <= 1850) {
				this.mainArray.pop();
				this.mainArray.push(lastItem + item);
			} else {
				this.mainArray.push(item);
			}
			return;
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
			const pageWithNumber = page + `\n-# Trang ${i + 1}/${totalPageNumber}`;
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