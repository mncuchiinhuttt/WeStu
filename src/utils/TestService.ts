import { Test, QuestionType, ITestQuestion } from "../models/Test";
import { LanguageService } from "./LanguageService";
import { Visibility } from "../models/Flashcard";

export class TestService {
	static async createTest (
		title: string,
		description: string,
		visibility: Visibility,
		creator: string,
	) {
		return await Test.create({
			title,
			description,
			visibility,
			creator,
			questions: [],
			totalPoints: 0
		});
	}

	static async deleteTest (
		test_id: string,
		creator: string
	) {
		return await Test.findOneAndDelete({ _id: test_id });
	}

	static async addQuestion (
		test_id: string,
		question: ITestQuestion
	) {
		return await Test.findByIdAndUpdate(
			test_id,
			{
				$push: {
					questions: question
				},
				$inc: {
					totalPoints: question.points
				}
			}
		);
	}

	static async updateTestSettings (
		test_id: string,
		settings: {
			title?: string,
			description?: string,
			time_limit?: number,
			passing_score?: number,
			tag?: string
		}
	) {
		return await Test.findByIdAndUpdate(
			test_id,
			{
				$set: settings
			}
		);
	}
}