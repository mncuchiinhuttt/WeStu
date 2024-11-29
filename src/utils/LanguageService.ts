import { UserLanguage } from '../models/UserLanguageModel';

export class LanguageService {
	private static instance: LanguageService;
	private cache: Map<string, string> = new Map();

	private constructor() {}

	public static getInstance(): LanguageService {
		if (!LanguageService.instance) {
			LanguageService.instance = new LanguageService();
		}
		return LanguageService.instance;
	}

	async getUserLanguage(userId: string): Promise<string> {
		if (this.cache.has(userId)) {
			return this.cache.get(userId)!;
		}

		let userLang = await UserLanguage.findOne({ userId });
		if (!userLang) {
			userLang = await UserLanguage.create({ userId, language: 'en' });
		}

		this.cache.set(userId, userLang.language);
		return userLang.language;
	}

	async setUserLanguage(userId: string, language: string): Promise<void> {
		await UserLanguage.findOneAndUpdate(
			{ userId },
			{ language, updatedAt: new Date() },
			{ upsert: true }
		);
		this.cache.set(userId, language);
	}

	clearCache(userId: string): void {
		this.cache.delete(userId);
	}
}