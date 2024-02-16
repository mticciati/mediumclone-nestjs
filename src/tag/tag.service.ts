import { Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
    findAll(): string[] {
        return ['legends', 'of', 'pom'];
    }
}
