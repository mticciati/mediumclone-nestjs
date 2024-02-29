import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '@app/ormconfig';
import { UserModule } from '@app/user/user.module';
import { TagModule } from '@app/tag/tag.module';
import { AuthMiddleware } from '@app/user/middlewares/auth.middleware';

@Module({
	imports: [TypeOrmModule.forRoot(config), UserModule, TagModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes({
			path: '*',
			method: RequestMethod.ALL,
		});
	}
}
