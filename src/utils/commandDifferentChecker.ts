interface Choice {
	name: string;
	value: any;
}

interface Option {
	name: string;
	description: string;
	type: string;
	required?: boolean;
	choices?: Choice[];
}

interface Command {
	description: string;
	options?: Option[];
}
  
const areChoicesDifferent = (existingChoices: Choice[] = [], localChoices: Choice[] = []): boolean => {
	for (const localChoice of localChoices) {
		const existingChoice = existingChoices.find(
			(choice) => choice.name === localChoice.name
		);

		if (!existingChoice) {
			return true;
		}

		if (localChoice.value !== existingChoice.value) {
			return true;
		}
	}
	return false;
};
  
const areOptionsDifferent = (existingOptions: Option[] = [], localOptions: Option[] = []): boolean => {
	for (const localOption of localOptions) {
		const existingOption = existingOptions.find(
			(option) => option.name === localOption.name
		);

		if (!existingOption) {
			return true;
		}

		if (
			localOption.description !== existingOption.description ||
			localOption.type !== existingOption.type ||
			(localOption.required || false) !== existingOption.required ||
			(localOption.choices?.length || 0) !==
			(existingOption.choices?.length || 0) ||
			areChoicesDifferent(
				localOption.choices || [],
				existingOption.choices || []
			)
		) {
			return true;
		}
	}
	return false;
};
  
const commandDifferentChecker = (existingCommand: Command, localCommand: Command): boolean => {
	if (
		existingCommand.description !== localCommand.description ||
		existingCommand.options?.length !== (localCommand.options?.length || 0) ||
		areOptionsDifferent(existingCommand.options || [], localCommand.options || [])
	) {
		return true;
	}

	return false;
};
  
export default commandDifferentChecker;