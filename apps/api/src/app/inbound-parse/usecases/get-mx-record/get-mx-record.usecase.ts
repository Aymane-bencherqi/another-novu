import { Injectable, Scope, BadRequestException } from '@nestjs/common';
import { promises, type MxRecord } from 'node:dns';
import { EnvironmentEntity, EnvironmentRepository } from '@novu/dal';

import { GetMxRecordCommand } from './get-mx-record.command';
import { GetMxRecordResponseDto } from '../../dtos/get-mx-record.dto';

@Injectable({
  scope: Scope.REQUEST,
})
export class GetMxRecord {
  constructor(private environmentRepository: EnvironmentRepository) {}

  async execute(command: GetMxRecordCommand): Promise<GetMxRecordResponseDto> {
    const env = await this.environmentRepository.findOne({ _id: command.environmentId });
    if (!env) throw new BadRequestException('Environment is not found');

    const inboundParseDomain = env.dns?.inboundParseDomain;

    if (!inboundParseDomain) return { mxRecordConfigured: false };

    const mxRecordExist = await this.checkMxRecordExistence(inboundParseDomain);
    const res: GetMxRecordResponseDto = { mxRecordConfigured: mxRecordExist };
    const updateNotNeeded = mxRecordExist === env.dns?.mxRecordConfigured;

    if (updateNotNeeded) return res;

    await this.updateMxRecord(mxRecordExist, command);

    return res;
  }

  private async updateMxRecord(mxRecordExist: boolean, command: GetMxRecordCommand) {
    const updatePayload: Partial<EnvironmentEntity> = {};

    updatePayload[`dns.mxRecordConfigured`] = mxRecordExist;

    await this.environmentRepository.update(
      {
        _id: command.environmentId,
        _organizationId: command.organizationId,
      },
      { $set: updatePayload }
    );
  }

  private async checkMxRecordExistence(inboundParseDomain: string) {
    const relativeDnsRecords = await this.getMxRecords(inboundParseDomain);
    const INBOUND_DOMAIN = process.env.MAIL_SERVER_DOMAIN?.replace('https://', '').replace('/', '');
    if (!INBOUND_DOMAIN) {
      throw new BadRequestException('MAIL_SERVER_DOMAIN is not defined as an environment variable');
    }

    return relativeDnsRecords.some((record: MxRecord) => record.exchange === INBOUND_DOMAIN);
  }

  async getMxRecords(domain: string): Promise<MxRecord[]> {
    try {
      return await promises.resolveMx(domain);
    } catch (e) {
      return [];
    }
  }
}
