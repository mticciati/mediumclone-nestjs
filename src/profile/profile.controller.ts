import { User } from '@app/user/decorators/user.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { ProfileService } from '@app/profile/profile.service';
import { ProfileType } from './types/profile.type';

@Controller('profiles')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get(':username')
	async getProfile(
		@User('id') currentUserId: number | null,
		@Param('username') username: string,
	): Promise<ProfileType> {
		return await this.profileService.get(currentUserId, username);
	}
}
