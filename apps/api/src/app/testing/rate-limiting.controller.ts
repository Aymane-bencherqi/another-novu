import { ApiRateLimitCategoryEnum, ApiRateLimitCostEnum } from '@novu/shared';
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ThrottlerCategory, ThrottlerCost } from '../rate-limiting/guards';
import { ExternalApiAccessible } from '../auth/framework/external-api.decorator';
import { RequireAuthentication } from '../auth/framework/auth.decorator';

@Controller('/rate-limiting')
@RequireAuthentication()
@ApiExcludeController()
export class TestApiRateLimitController {
  @ExternalApiAccessible()
  @Get('/no-category-no-cost')
  noCategoryNoCost() {
    return true;
  }

  @ExternalApiAccessible()
  @ThrottlerCost(ApiRateLimitCostEnum.SINGLE)
  @Get('/no-category-single-cost')
  noCategorySingleCost() {
    return true;
  }

  @ExternalApiAccessible()
  @ThrottlerCategory(ApiRateLimitCategoryEnum.GLOBAL)
  @Get('/global-category-no-cost')
  globalCategoryNoCost() {
    return true;
  }

  @ExternalApiAccessible()
  @ThrottlerCategory(ApiRateLimitCategoryEnum.GLOBAL)
  @ThrottlerCost(ApiRateLimitCostEnum.SINGLE)
  @Get('/global-category-single-cost')
  globalCategorySingleCost() {
    return true;
  }

  @ExternalApiAccessible()
  @ThrottlerCategory(ApiRateLimitCategoryEnum.GLOBAL)
  @ThrottlerCost(ApiRateLimitCostEnum.BULK)
  @Get('/global-category-bulk-cost')
  global() {
    return true;
  }

  @ExternalApiAccessible()
  @ThrottlerCategory(ApiRateLimitCategoryEnum.TRIGGER)
  @Get('/trigger-category-no-cost')
  triggerCategoryNoCost() {
    return true;
  }

  @ExternalApiAccessible()
  @ThrottlerCategory(ApiRateLimitCategoryEnum.TRIGGER)
  @ThrottlerCost(ApiRateLimitCostEnum.SINGLE)
  @Get('/trigger-category-single-cost')
  triggerCategorySingleCost() {
    return true;
  }

  @ExternalApiAccessible()
  @ThrottlerCategory(ApiRateLimitCategoryEnum.TRIGGER)
  @ThrottlerCost(ApiRateLimitCostEnum.BULK)
  @Get('/trigger-category-bulk-cost')
  triggerCategoryBulkCost() {
    return true;
  }
}
@ApiExcludeController()
@Controller('/rate-limiting-trigger-bulk')
@RequireAuthentication()
@ThrottlerCategory(ApiRateLimitCategoryEnum.TRIGGER)
@ThrottlerCost(ApiRateLimitCostEnum.BULK)
export class TestApiRateLimitBulkController {
  @ExternalApiAccessible()
  @Get('/no-category-no-cost-override')
  noCategoryNoCostOverride() {
    return true;
  }

  @ExternalApiAccessible()
  @ThrottlerCost(ApiRateLimitCostEnum.SINGLE)
  @Get('/no-category-single-cost-override')
  noCategorySingleCostOverride() {
    return true;
  }

  @ExternalApiAccessible()
  @Get('/global-category-no-cost-override')
  @ThrottlerCategory(ApiRateLimitCategoryEnum.GLOBAL)
  globalCategoryNoCostOverride() {
    return true;
  }
}
