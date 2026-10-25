import { MaintenanceService } from './maintenance.service';
import type { NeedsService } from '../needs/needs.service';
import type { OffersService } from '../offers/offers.service';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let mockNeedsService: Partial<NeedsService>;
  let mockOffersService: Partial<OffersService>;

  beforeEach(() => {
    mockNeedsService = {
      sweepExpiredNeeds: jest.fn().mockResolvedValue(3),
    };
    mockOffersService = {
      sweepExpiredOffers: jest.fn().mockResolvedValue(5),
    };

    service = new MaintenanceService(
      mockNeedsService as NeedsService,
      mockOffersService as OffersService,
    );
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  it('runs sweep and returns the count of swept needs and offers', async () => {
    const result = await service.runSweep();

    expect(mockNeedsService.sweepExpiredNeeds).toHaveBeenCalledTimes(1);
    expect(mockOffersService.sweepExpiredOffers).toHaveBeenCalledTimes(1);
    expect(result.sweptNeeds).toBe(3);
    expect(result.sweptOffers).toBe(5);
    expect(result.timestamp).toBeDefined();
  });
});
