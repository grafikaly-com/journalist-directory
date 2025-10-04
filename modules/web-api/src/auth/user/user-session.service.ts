import { Injectable } from '@nestjs/common';
import { PrismaMediamineService } from 'src/db';
import { WinstonLoggerService } from 'src/logger';
import { v4 as uuidv4 } from 'uuid';
import { UserSessionDto } from './dto/user-session.dto';

@Injectable()
export class UserSessionService {
  constructor(
    private prismaMediamine: PrismaMediamineService,
    private logger: WinstonLoggerService
  ) {
    this.logger.setContext(UserSessionService.name);
  }

  async findSession(user_id: bigint): Promise<UserSessionDto | null> {
    this.logger.log(`invoked ${this.findSession.name} with ${JSON.stringify({ user_id })}`);

    return this.prismaMediamine.user_session.findFirst({
      select: {
        id: true,
        is_logged_in: true,
        expires_at: true
      },
      where: {
        user_id
      }
    });
  }

  async createSession(user_id: bigint, jwt_token_id: string, expires_at: number): Promise<UserSessionDto | null> {
    this.logger.log(`invoked ${this.createSession.name} with ${JSON.stringify({ user_id })}`);

    return this.prismaMediamine.user_session.create({
      data: {
        uuid: uuidv4(),
        user_id,
        is_logged_in: true,
        expires_at: new Date(expires_at * 1000), // convert the JWT exp to milliseconds and create a Date object,
        jwt_token_id
      }
    });
  }

  async updateSession(
    session_id: bigint,
    is_logged_in: boolean,
    jwt_token_id?: string,
    expires_at?: number
  ): Promise<UserSessionDto | null> {
    this.logger.log(`invoked ${this.updateSession.name} with ${JSON.stringify({ session_id, is_logged_in })}`);

    return this.prismaMediamine.user_session.update({
      data: {
        is_logged_in,
        ...(expires_at && { expires_at: new Date(expires_at * 1000) }), // convert the JWT exp to milliseconds and create a Date object,
        ...(jwt_token_id && { jwt_token_id })
      },
      where: {
        id: session_id
      }
    });
  }
}
