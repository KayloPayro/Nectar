export interface Benefit {
  _id?: string;
  benefitId: string;
  businessId: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  terms: string;
  isActive: boolean;
  maxUsage?: {
    total?: number;
    perCustomer?: number;
    perPeriod?: {
      times: number;
      period: string;
    };
  };
  usageCount: number;
  rewardAmount: number;
  createdAt: string;
}
