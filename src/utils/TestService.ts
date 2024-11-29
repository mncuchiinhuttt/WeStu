import { Test, QuestionType, ITestQuestion } from "../models/TestModel";
import { LanguageService } from "./LanguageService";
import { Visibility } from "../models/FlashcardModel";

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

	static async removeQuestion (
		test_id: string,
		question_id: string
	) {
		const test = await Test.findById(test_id);
		if (!test) return null;
		const question = test.questions.find((q: any) => q.flashcardId === question_id);
		if (!question) return null;
		return await Test.findByIdAndUpdate(
			test_id,
			{
				$pull: {
					questions: question
				},
				$inc: {
					totalPoints: -question.points
				}
			}
		)
	}

	static async updateQuestion (
		test_id: string,
		question_id: string,
		updatedQuestion: ITestQuestion
	) {
		const test = await Test.findById(test_id);
		if (!test) return null;
		const question = test.questions.find((q: any) => q.flashcardId === question_id);
		if (!question) return null;
		return await Test.updateOne(
			{ _id: test_id, 'questions.flashcardId': question_id },
			{
				$set: {
					'questions.$': updatedQuestion,
					$inc: {
						totalPoints: updatedQuestion.points - question.points
					}
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

	static async shareTest (
		test_id: string,
		group_id: string
	) {
		return await Test.findByIdAndUpdate(
			test_id,
			{
				$push: {
					groupIds: group_id
				}
			}
		);
	}

	static async unshareTest (
		test_id: string,
		group_id: string
	) {
		return await Test.findByIdAndUpdate(
			test_id,
			{
				$pull: {
					groupIds: group_id
				}
			}
		);
	}
}