import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileType } from '@app/profile/types/profile.type';
import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { FollowEntity } from '@app/profile/follow.entity';

@Injectable()
export class ProfileService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(FollowEntity)
		private readonly followRespository: Repository<FollowEntity>,
	) {}

	async get(
		currentUserId: number | null,
		username: string,
	): Promise<ProfileType> {
		const user = await this.userRepository.findOne({
			where: { username },
		});

		if (!user) {
			throw new HttpException(
				'Sorry! We could not find a user with that username',
				HttpStatus.NOT_FOUND,
			);
		}

		let following = false;

		if (currentUserId) {
			const currentUser = await this.userRepository.findOne({
				where: { id: currentUserId },
			});

			if (!currentUser) {
				throw new HttpException(
					'Something went wrong, please login and try again!',
					HttpStatus.FORBIDDEN,
				);
			}
			const isFollowing = await this.followRespository.findOne({
				where: { followerId: currentUserId, followingId: user.id },
			});

			if (isFollowing) {
				following = true;
			}
		}

		return {
			...user,
			following,
		};
	}

	async followUser(
		currentUserId: number,
		username: string,
	): Promise<ProfileType> {
		const user = await this.userRepository.findOne({
			where: { username },
		});

		if (!user) {
			throw new HttpException(
				`We could not find a user with username ${username}`,
				HttpStatus.NOT_FOUND,
			);
		}
		if (user.id === currentUserId) {
			throw new HttpException(
				'Follower and Following cannot be equal',
				HttpStatus.BAD_REQUEST,
			);
		}

		const follows = await this.followRespository.findOne({
			where: { followerId: currentUserId, followingId: user.id },
		});

		if (!follows) {
			const newFollow = new FollowEntity();
			newFollow.followerId = currentUserId;
			newFollow.followingId = user.id;
			await this.followRespository.save(newFollow);
		}

		return {
			...user,
			following: true,
		};
	}

	async unfollowUser(
		currentUserId: number,
		username: string,
	): Promise<ProfileType> {
		const user = await this.userRepository.findOne({
			where: { username },
		});

		if (!user) {
			throw new HttpException(
				`We could not find a user with username ${username}`,
				HttpStatus.NOT_FOUND,
			);
		}
		if (user.id === currentUserId) {
			throw new HttpException(
				'Follower and Following cannot be equal :)',
				HttpStatus.BAD_REQUEST,
			);
		}

		await this.followRespository.delete({
			followerId: currentUserId,
			followingId: user.id,
		});

		return {
			...user,
			following: false,
		};
	}

	buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
		delete profile.email;
		return { profile };
	}
}
