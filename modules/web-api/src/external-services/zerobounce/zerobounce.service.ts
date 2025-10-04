import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ZEROBOUNCE_API_KEY } from 'src/constants';
import { WinstonLoggerService } from 'src/logger';

@Injectable()
export class ZerobounceService {
  // TODO: use the zerobounce sdk
  private VALIDATE_BATCH_URL = 'https://bulkapi.zerobounce.net/v2/validatebatch';

  constructor(
    private configService: ConfigService,
    private logger: WinstonLoggerService
  ) {
    this.logger.setContext(ZerobounceService.name);
  }

  async validateBatch(emails: Array<string>) {
    this.logger.log(`invoked ${this.validateBatch.name} with ${JSON.stringify({ emails })}`);

    if (emails === undefined) {
      return Promise.reject('Emails are undefined');
    }

    if (emails.length === 0) {
      return [];
    }

    const apiKey = this.configService.get<string>(ZEROBOUNCE_API_KEY);
    if (!apiKey) {
      const errorMessage = `${ZEROBOUNCE_API_KEY} is undefined`;
      this.logger.error(errorMessage);
      return Promise.reject(errorMessage);
    }

    const response = await axios.post(this.VALIDATE_BATCH_URL, {
      api_key: apiKey,
      email_batch: emails.map((e) => ({
        email_address: e // TODO: replace with 'valid@example.com' to test dev changes
      }))
    });

    return response.data;
  }

  isEmailStatusValid(status: string | bigint, subStatus: string | bigint): boolean {
    this.logger.log(`invoked ${this.isEmailStatusValid.name} with ${JSON.stringify({ status, subStatus })}`);

    if (['valid', 'catch-all', 'unknown'].includes(String(status))) return true;
    if (['do_not_mail'].includes(String(status)) && ['role_based', 'role_based_catch_all'].includes(String(subStatus))) return true;
    return false;
  }
}
