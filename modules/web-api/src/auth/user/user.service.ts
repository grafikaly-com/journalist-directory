import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(username: string): Promise<UserDto | null> {
    return this.prisma.app_user.findFirst({
      select: {
        id: true,
        username: true,
        password: true,
        editor: true
      },
      where: {
        username
      }
    });
  }
}
