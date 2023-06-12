import { ApiVersions } from '@/src/constants';
import { Controller, Post } from '@nestjs/common';
import { ApiKeysService } from './apiKeys.service';
import { ActiveUserData, UserRoles } from '../types';
import { Roles } from '@/lib/decorators/roles.decorator';
import { ActiveUser } from '@/lib/decorators/activeUser.decorator';

@Controller({
  version: ApiVersions.V1,
  path: 'apikey',
})
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Roles(UserRoles.admin)
  @Post('')
  async handleApiKeyCreation(@ActiveUser() user: ActiveUserData) {
    return this.apiKeysService.createApiKey(user);
  }
}
