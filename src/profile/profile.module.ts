import { UserEntity } from '@app/user/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from '@app/profile/profile.controller';
import { ProfileService } from '@app/profile/profile.service';
import { FollowEntity } from './follow.entity';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, FollowEntity])],
	controllers: [ProfileController],
	providers: [ProfileService],
})
export class ProfileModule {}
