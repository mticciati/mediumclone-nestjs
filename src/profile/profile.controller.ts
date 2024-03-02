import { User } from '@app/user/decorators/user.decorator';
import {
	Controller,
	Get,
	Post,
	Param,
	UseGuards,
	Delete,
} from '@nestjs/common';
import { ProfileService } from '@app/profile/profile.service';
import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { AuthGuard } from '@app/user/guards/auth.guard';

@Controller('profiles')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get(':username')
	async getProfile(
		@User('id') currentUserId: number | null,
		@Param('username') username: string,
	): Promise<ProfileResponseInterface> {
		const profile = await this.profileService.get(currentUserId, username);

		return this.profileService.buildProfileResponse(profile);
	}

	@Post(':username/follow')
	@UseGuards(AuthGuard)
	async followUser(
		@User('id') currentUserId: number,
		@Param('username') username: string,
	): Promise<ProfileResponseInterface> {
		const profile = await this.profileService.followUser(
			currentUserId,
			username,
		);
		return this.profileService.buildProfileResponse(profile);
	}

	@Delete(':username/unfollow')
	@UseGuards(AuthGuard)
	async unfollowUser(
		@User('id') currentUserId: number,
		@Param('username') username: string,
	): Promise<ProfileResponseInterface> {
		const profile = await this.profileService.unfollowUser(
			currentUserId,
			username,
		);
		return this.profileService.buildProfileResponse(profile);
	}
}
