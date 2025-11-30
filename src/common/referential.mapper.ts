import { AbstractReferentialMapper } from './abstractions/abstract-referential.mapper';
import { ReferentialEntity } from './abstractions/referential.entity.interface';
import { Referential } from './dto/referential';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReferentialMapper extends AbstractReferentialMapper<ReferentialEntity, Referential> {}
