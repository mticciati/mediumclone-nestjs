import {
	ArgumentMetadata,
	HttpException,
	HttpStatus,
	Injectable,
	PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

@Injectable()
export class BackendValidation implements PipeTransform {
	async transform(value: any, metadata: ArgumentMetadata) {
		const object = plainToClass(metadata.metatype, value);
		const errors = await validate(object);

		if (errors.length === 0) {
			return value;
		}

		throw new HttpException(
			{
				errors: this.formatErrors(errors),
			},
			HttpStatus.UNPROCESSABLE_ENTITY,
		);
	}

	formatErrors(errors: ValidationError[]) {
		return errors.reduce((acc, error) => {
			console.log('reduce', acc, error);
			acc[error.property] = Object.values(error.constraints);
			return acc;
		}, {});
	}
}
