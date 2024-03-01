import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from '@app/article/article.entity';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from '@app/article/dto/updateArticleDto.dto';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';

@Injectable()
export class ArticleService {
	constructor(
		@InjectRepository(ArticleEntity)
		private readonly articleRepository: Repository<ArticleEntity>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private dataSource: DataSource,
	) {}

	async findAll(query: any): Promise<ArticlesResponseInterface> {
		const queryBuilder = this.dataSource
			.getRepository(ArticleEntity)
			.createQueryBuilder('articles')
			.leftJoinAndSelect('articles.author', 'author');

		if (query.tag) {
			queryBuilder.andWhere('articles.tagList LIKE :tag', {
				tag: `%${query.tag}%`,
			});
		}

		if (query.limit) {
			queryBuilder.limit(query.limit);
		}
		if (query.offset) {
			queryBuilder.offset(query.offset);
		}

		if (query.author) {
			const author = await this.userRepository.findOne({
				where: { username: query.author },
			});

			if (!author) {
				throw new HttpException(
					'Author not found',
					HttpStatus.NOT_FOUND,
				);
			}
			queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
		}

		queryBuilder.orderBy('articles.createdAt', 'DESC');

		console.log('query', JSON.stringify(query, null, 2));
		const articles = await queryBuilder.getMany();
		const articlesCount = await queryBuilder.getCount();

		return {
			articles,
			articlesCount,
		};
	}

	async createArticle(
		currentUser: UserEntity,
		createArticleDto: CreateArticleDto,
	): Promise<ArticleEntity> {
		const article = new ArticleEntity();
		Object.assign(article, createArticleDto);
		if (!article.tagList) {
			article.tagList = [];
		}

		article.slug = this.getSlug(article.title);
		article.author = currentUser;
		return await this.articleRepository.save(article);
	}

	async findBySlug(slug: string): Promise<ArticleEntity> {
		return await this.articleRepository.findOne({
			where: { slug },
		});
	}

	async updateArticle(
		slug: string,
		currentUserId: number,
		updateArticleDto: UpdateArticleDto,
	): Promise<ArticleEntity> {
		const article = await this.findBySlug(slug);

		if (!article) {
			throw new HttpException(
				'Article cannot be found',
				HttpStatus.NOT_FOUND,
			);
		}

		if (article.author.id !== currentUserId) {
			throw new HttpException(
				'You must be the author of the article to make updates',
				HttpStatus.FORBIDDEN,
			);
		}

		Object.assign(article, updateArticleDto);
		if (updateArticleDto.title !== article.title) {
			article.slug = slugify(updateArticleDto.title);
		}
		return await this.articleRepository.save(article);
	}

	async delete(slug: string, currentUserId: number): Promise<DeleteResult> {
		const article = await this.findBySlug(slug);

		if (!article) {
			throw new HttpException(
				'Article does not exist',
				HttpStatus.NOT_FOUND,
			);
		}

		if (article.author.id !== currentUserId) {
			throw new HttpException(
				'You are not the author',
				HttpStatus.FORBIDDEN,
			);
		}

		return await this.articleRepository.delete({ slug });
	}

	buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
		return { article };
	}

	private getSlug(title: string): string {
		return `${slugify(title, { lower: true })}-${((Math.random() * Math.pow(36, 6)) | 0).toString(36)}`;
	}
}
