import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
	UseGuards,
	UsePipes,
} from '@nestjs/common';
import { ArticleService } from '@app/article/article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { UserEntity } from '@app/user/user.entity';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { DeleteResult } from 'typeorm';
import { UpdateArticleDto } from '@app/article/dto/updateArticleDto.dto';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';
import { BackendValidation } from '@app/shared/pipes/backendValidation.pipe';

@Controller('articles')
export class ArticleController {
	constructor(private readonly articleService: ArticleService) {}
	@Get()
	async findAll(
		@User('id') currentUserId: number,
		@Query() query: any,
	): Promise<ArticlesResponseInterface> {
		return await this.articleService.findAll(currentUserId, query);
	}

	@Get('/feed')
	@UseGuards(AuthGuard)
	async getFeed(
		@User('id') currentUserId: number,
		@Query() query: any,
	): Promise<ArticlesResponseInterface> {
		return await this.articleService.getFeed(currentUserId, query);
	}

	@Post()
	@UseGuards(AuthGuard)
	@UsePipes(new BackendValidation())
	async create(
		@User() currentUser: UserEntity,
		@Body('article') createArticleDto: CreateArticleDto,
	): Promise<ArticleResponseInterface> {
		const article = await this.articleService.createArticle(
			currentUser,
			createArticleDto,
		);

		return this.articleService.buildArticleResponse(article);
	}

	@Get(':slug')
	async getArticle(
		@Param('slug') slug: string,
	): Promise<ArticleResponseInterface> {
		const article = await this.articleService.findBySlug(slug);
		return this.articleService.buildArticleResponse(article);
	}

	@Put(':slug')
	@UseGuards(AuthGuard)
	@UsePipes(new BackendValidation())
	async updateArticle(
		@User('id') currentUserId: number,
		@Param('slug') slug: string,
		@Body('article') updateArticleDto: UpdateArticleDto,
	): Promise<ArticleResponseInterface> {
		const article = await this.articleService.updateArticle(
			slug,
			currentUserId,
			updateArticleDto,
		);

		return this.articleService.buildArticleResponse(article);
	}

	@Post(':slug/favorite')
	@UseGuards(AuthGuard)
	async addArticleToFavorites(
		@User('id') currentUserId: number,
		@Param('slug') slug: string,
	): Promise<ArticleResponseInterface> {
		const article = await this.articleService.addArticleToFavorites(
			currentUserId,
			slug,
		);
		return this.articleService.buildArticleResponse(article);
	}

	@Delete(':slug/favorite')
	@UseGuards(AuthGuard)
	async removeArticleFromFavorites(
		@User('id') currentUserId: number,
		@Param('slug') slug: string,
	): Promise<ArticleResponseInterface> {
		const article = await this.articleService.removeArticleFromFavorites(
			currentUserId,
			slug,
		);
		return this.articleService.buildArticleResponse(article);
	}

	@Delete(':slug')
	@UseGuards(AuthGuard)
	async deleteArticle(
		@User('id') currentUserId: number,
		@Param('slug') slug: string,
	): Promise<DeleteResult> {
		return await this.articleService.delete(slug, currentUserId);
	}
}
