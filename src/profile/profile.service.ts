import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileType } from './types/profile.type';

@Injectable()
export class ProfileService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) {}

	async get (
		currentUserId: number | null,
		username: string,
	): Promise<ProfileType> {
		const user = await this.userRepository.findOne({
			select: {
				id: true,
				username: true,
				bio: true,
				image: true,
			},
			where: { username },
		});

		if (!user) {
			throw new HttpException(
				'Sorry! We could not find a user with that username',
				HttpStatus.NOT_FOUND,
			);
		}

		//TODO update with following feature
		const following = false;

		if (currentUserId) {
			const currentUser = await this.userRepository.findOne({
				where: { id: currentUserId },
			});
			console.log(currentUser);
		}

		return {
			profile: {
				...user,
				following,
			},
		};
	}
}
