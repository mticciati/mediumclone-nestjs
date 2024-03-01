import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { LoginUserDto } from '@app/user/dto/loginUser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) {}
	async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
		const userByEmail = await this.userRepository.findOne({
			where: { email: createUserDto.email },
		});
		const userByUsername = await this.userRepository.findOne({
			where: { username: createUserDto.username },
		});

		if (userByEmail || userByUsername) {
			throw new HttpException(
				'Email or username are taken',
				HttpStatus.UNPROCESSABLE_ENTITY,
			);
		}
		const newUser = new UserEntity();
		Object.assign(newUser, createUserDto);
		return await this.userRepository.save(newUser);
	}

	async updateUser(
		id: number,
		updateUserDto: UpdateUserDto,
	): Promise<UserEntity> {
		const user = await this.findById(id);
		Object.assign(user, updateUserDto);
		return await this.userRepository.save(user);
	}

	async findById(id: number): Promise<UserEntity> {
		return await this.userRepository.findOne({
			where: { id },
		});
	}

	async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
		const user = await this.userRepository.findOne({
			where: { email: loginUserDto.email },
			select: ['id', 'username', 'email', 'image', 'password'],
		});

		if (!user) {
			throw new HttpException(
				'Credentials are not valid',
				HttpStatus.UNPROCESSABLE_ENTITY,
			);
		}

		const isPasswordCorrect = await compare(
			loginUserDto.password,
			user.password,
		);

		if (!isPasswordCorrect) {
			throw new HttpException(
				'Credentials are not valid',
				HttpStatus.UNPROCESSABLE_ENTITY,
			);
		}

		delete user.password;
		return user;
	}

	generateJwt(user: UserEntity): string {
		return sign(
			{
				id: user.id,
				username: user.username,
				email: user.email,
			},
			JWT_SECRET,
		);
	}

	buildUserResponse(user: UserEntity): UserResponseInterface {
		return {
			user: {
				...user,
				token: this.generateJwt(user),
			},
		};
	}
}
