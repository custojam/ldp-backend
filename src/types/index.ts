import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export type LeadStatus = 'sent' | 'unsent' | 'duplicate' | 'failed';

export type WorkingDay =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface BrokerWithDistributionSettings {
  id: number;
  name: string;
  isActive: boolean;
  dailyCap: number;
  timezone: string;
  openingTime: string;
  closingTime: string;
  workingDays: WorkingDay[];
  percentage: number;
  isActiveInDistribution: boolean;
  sentToday: number;
}

export interface DeficitResult {
  broker: BrokerWithDistributionSettings;
  deficit: number;
}
