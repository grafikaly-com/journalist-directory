import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { UserService } from 'src/auth/user/user.service';
import { WinstonLoggerService } from 'src/logger/winston/winston-logger.service';
import { TokenUserPayload } from './dto/auth.dto';
import { UserDto } from './user/dto/user.dto';
import { UserSessionService } from './user/user-session.service';

const matchPasswordFormat01 = (password: string) => password.match(/{SHA-256}({[^}]+})([a-fA-F0-9]+)/);
const matchPasswordFormat02 = (password: string) => password.match(/{SHA-256}([a-fA-F0-9]+)/);
const matchPasswordFormat03 = (password: string) => password.match(/([a-fA-F0-9]+)/);

const checkPasswordMatch = (password: string, encoded = '', salt = '') => {
  if (
    encoded !==
    createHash('sha256')
      .update(password + salt)
      .digest('hex')
  ) {
    throw new UnauthorizedException();
  }
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private userSessionService: UserSessionService,
    private jwtService: JwtService,
    private logger: WinstonLoggerService
  ) {
    this.logger.setContext(AuthService.name);
  }

  private async validateCredentials(username: string, password: string): Promise<UserDto> {
    const user = await this.userService.findOne(username);

    if (!user?.password) {
      this.logger.error(`Missing password in db for user: ${user?.username}`);
      throw new UnauthorizedException();
    }

    const matches = matchPasswordFormat01(user?.password);
    this.logger.debug(`Checking for password format: '{SHA-256}{salt}encoded'`);
    if (matches && matches.length >= 3) {
      checkPasswordMatch(password, matches?.[2], matches?.[1]);
      this.logger.debug(`Authenticated using password format: '{SHA-256}{salt}encoded'`);
    } else {
      const matches = matchPasswordFormat02(user?.password);
      this.logger.debug(`Checking for password format: '{SHA-256}encoded'`);
      if (matches && matches.length >= 2) {
        checkPasswordMatch(password, matches?.[1]);
        this.logger.debug(`Authenticated using password format: '{SHA-256}encoded'`);
      } else {
        const matches = matchPasswordFormat03(user?.password);
        this.logger.debug(`Checking for password format: 'encoded'`);
        if (matches && matches.length >= 2) {
          checkPasswordMatch(password, matches?.[1]);
          this.logger.debug(`Authenticated using password format: 'encoded'`);
        }
      }
    }

    // TODO: deprecated
    // if (user?.password !== createHash('sha256').update(password).digest('hex')) {
    //   throw new UnauthorizedException();
    // }
    this.logger.log(`Authentication successful for user: ${user.username}`);

    return user;
  }

  async validateSession(username: string, password: string): Promise<any> {
    const user = await this.validateCredentials(username, password);
    this.logger.log(`Authentication successful for user: ${user.username}`);

    const session = await this.userSessionService.findSession(user.id);
    if (session) {
      if (
        session.is_logged_in
        // TODO: account for session expiration in case user closes browser without logging out
        //  && new Date(session.expires_at) > new Date()
      ) {
        throw new ForbiddenException('User is already logged in');
      }
    }

    return {
      username: user.username
    };
  }

  async login(username: string, password: string): Promise<any> {
    const user = await this.validateCredentials(username, password);

    this.logger.log(`Logged in as user: ${user.username}`);

    const payload: TokenUserPayload = { sub: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);
    this.logger.log(`Creating token: ${token.slice(0, 10)}...`);

    const decodedToken = await this.jwtService.decode(token);

    // TODO: confirm the code below is correct
    const session = await this.userSessionService.findSession(user.id);
    if (session && !session?.is_logged_in) {
      await this.userSessionService.updateSession(session.id, true, token, decodedToken.exp);
    }
    if (!session) {
      await this.userSessionService.createSession(user.id, token, decodedToken.exp);
    }

    return {
      token,
      username: user.username,
      editor: user.editor
    };
  }

  async logout(username: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if the user is logged in
    const session = await this.userSessionService.findSession(user.id);
    if (!session || !session.is_logged_in) {
      throw new ForbiddenException('User is not logged in');
    }

    // Mark the session as logged out
    await this.userSessionService.updateSession(session.id, false);

    this.logger.log(`User ${username} has been logged out successfully.`);
    return { message: 'Logged out successfully' };
  }
}
