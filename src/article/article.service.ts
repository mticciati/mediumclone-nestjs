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

	async findAll(
		currentUserId: number,
		query: any,
	): Promise<ArticlesResponseInterface> {
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

		if (query.favorited) {
			const author = await this.userRepository.findOne({
				where: { username: query.favorited },
				relations: ['favorites'],
			});
			const ids = author.favorites.map((fav) => fav.id);

			if (ids.length > 0) {
				queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
			} else {
				queryBuilder.andWhere('0=1');
			}
		}

		let favoriteIds: number[] = [];
		if (currentUserId) {
			const currentUser = this.userRepository.findOne({
				where: { id: currentUserId },
				relations: ['favorites'],
			});
			favoriteIds = (await currentUser).favorites.map((fav) => fav.id);
		}

		queryBuilder.orderBy('articles.createdAt', 'DESC');

		const articles = await queryBuilder.getMany();
		const articlesCount = await queryBuilder.getCount();

		const articlesWithFavorited = articles.map((article) => {
			const favorited = favoriteIds.includes(article.id);
			return { ...article, favorited };
		});

		return {
			articles: articlesWithFavorited,
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

	async addArticleToFavorites(
		currentUserId: number,
		slug: string,
	): Promise<ArticleEntity> {
		const article = await this.findBySlug(slug);
		const user = await this.userRepository.findOne({
			where: { id: currentUserId },
			relations: ['favorites'],
		});

		if (!user.favorites.includes(article)) {
			user.favorites.push(article);
			article.favoritesCount++;
			await this.userRepository.save(user);
			await this.articleRepository.save(article);
		}
		return article;
	}

	async removeArticleFromFavorites(
		currentUserId: number,
		slug: string,
	): Promise<ArticleEntity> {
		const article = await this.findBySlug(slug);
		const user = await this.userRepository.findOne({
			where: { id: currentUserId },
			relations: ['favorites'],
		});

		const favorite = user.favorites.findIndex(
			(fav) => fav.id === article.id,
		);
		console.log('favorite', favorite);
		if (favorite > -1) {
			user.favorites.splice(favorite, 1);
			article.favoritesCount--;
			await this.userRepository.save(user);
			await this.articleRepository.save(article);
		} else {
			throw new HttpException(
				'This article was not in your favorites',
				HttpStatus.NOT_FOUND,
			);
		}

		return article;
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
