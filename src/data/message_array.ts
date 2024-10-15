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

	length = () => {
		return this.mainArray.length;
	};

	get = (index: number) => {
		return this.mainArray[index];
	};
};

export default messageArray;