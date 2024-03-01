import { UserEntity } from '@app/user/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from '@app/profile/profile.controller';
import { ProfileService } from '@app/profile/profile.service';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity])],
	controllers: [ProfileController],
	providers: [ProfileService],
})
export class ProfileModule {}
