import { ExpressRequest } from '@app/types/expresssRequest.interface';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { JWT_SECRET } from '@app/config';
import { UserService } from '@app/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private readonly userService: UserService) {}

	async use(req: ExpressRequest, _: Response, next: NextFunction) {
		if (!req.headers.authorization) {
			req.user = null;
			next();
			return;
		}

		const token = req.headers.authorization.split(' ')[1];
		try {
			const decode = verify(token, JWT_SECRET);
			const user = await this.userService.findById(decode.id);
			req.user = user;
			next();
		} catch (err) {
			req.user = null;
			next();
		}
	}
}
