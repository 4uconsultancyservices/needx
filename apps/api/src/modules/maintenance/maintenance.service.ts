import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NeedsService } from '../needs/needs.service';
import { OffersService } from '../offers/offers.service';

const SWEEP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class MaintenanceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('MaintenanceService');
  private intervalRef?: NodeJS.Timeout;

  constructor(
    private readonly needsService: NeedsService,
    private readonly offersService: OffersService,
  ) {}

  onModuleInit() {
    this.logger.log('Maintenance sweeper initialized. Running initial sweep...');
    // Initial async sweep shortly after startup
    setTimeout(() => {
      this.runSweep().catch((err) => {
        this.logger.error(`Initial sweep error: ${err.message}`, err.stack);
      });
    }, 10_000);

    // Set recurring timer
    this.intervalRef = setInterval(() => {
      this.runSweep().catch((err) => {
        this.logger.error(`Recurring sweep error: ${err.message}`, err.stack);
      });
    }, SWEEP_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = undefined;
    }
  }

  async runSweep(): Promise<{ sweptNeeds: number; sweptOffers: number; timestamp: string }> {
    const [sweptNeeds, sweptOffers] = await Promise.all([
      this.needsService.sweepExpiredNeeds(),
      this.offersService.sweepExpiredOffers(),
    ]);

    if (sweptNeeds > 0 || sweptOffers > 0) {
      this.logger.log(
        `Sweeper completed: ${sweptNeeds} stale needs and ${sweptOffers} expired offers transitioned to EXPIRED.`,
      );
    }

    return {
      sweptNeeds,
      sweptOffers,
      timestamp: new Date().toISOString(),
    };
  }
}
