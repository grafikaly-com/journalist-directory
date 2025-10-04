import { PartialType } from '@nestjs/swagger';
import { CreateRoleTypeDto } from './create-role-type.dto';

export class UpdateRoleTypeDto extends PartialType(CreateRoleTypeDto) {}
