// أنواع المستخدمين في النظام
export type UserRole = 'admin' | 'market_supervisor' | 'us_market_supervisor' | 'employee';

// الصلاحيات المتاحة
export interface Permissions {
  // إدارة المستخدمين
  canManageUsers: boolean;
  canManageEmployees: boolean;
  canAssignPermissions: boolean;
  
  // إدارة الأسواق
  canViewAllMarkets: boolean;
  canManageMarkets: boolean;
  canViewUSMarket: boolean;
  canManageUSMarket: boolean;
  
  // إدارة المؤشرات
  canViewIndices: boolean;
  canManageIndices: boolean;
  canCreateCustomIndex: boolean;
  
  // إدارة الصناديق
  canViewFunds: boolean;
  canManageFunds: boolean;
  
  // إدارة القطاعات
  canViewSectors: boolean;
  canManageSectors: boolean;
  
  // إدارة الشركات
  canViewCompanies: boolean;
  canManageCompanies: boolean;
  canAssignCompanies: boolean;
  
  // الإشعارات
  canViewAccumulationAlerts: boolean;
  canViewDistributionAlerts: boolean;
  canViewTechnicalAnalysis: boolean;
  canSendAlerts: boolean;
  
  // التداول
  canCreateOptionContracts: boolean;
  canViewOptionContracts: boolean;
  canEditOptionContracts: boolean;
  canDeleteOptionContracts: boolean;
  
  // التنبيهات المستقبلية
  canCreateFutureAlerts: boolean;
  canViewFutureAlerts: boolean;
  
  // المحافظ
  canCreatePortfolio: boolean;
  canViewOwnPortfolio: boolean;
  canViewOthersPortfolios: boolean;
  canMakePortfolioPublic: boolean;
  
  // المتابعين
  canViewFollowers: boolean;
  canInteractWithFollowers: boolean;
}

// الصلاحيات الافتراضية لكل دور
export const defaultPermissions: Record<UserRole, Permissions> = {
  admin: {
    canManageUsers: true,
    canManageEmployees: true,
    canAssignPermissions: true,
    canViewAllMarkets: true,
    canManageMarkets: true,
    canViewUSMarket: true,
    canManageUSMarket: true,
    canViewIndices: true,
    canManageIndices: true,
    canCreateCustomIndex: true,
    canViewFunds: true,
    canManageFunds: true,
    canViewSectors: true,
    canManageSectors: true,
    canViewCompanies: true,
    canManageCompanies: true,
    canAssignCompanies: true,
    canViewAccumulationAlerts: true,
    canViewDistributionAlerts: true,
    canViewTechnicalAnalysis: true,
    canSendAlerts: true,
    canCreateOptionContracts: true,
    canViewOptionContracts: true,
    canEditOptionContracts: true,
    canDeleteOptionContracts: true,
    canCreateFutureAlerts: true,
    canViewFutureAlerts: true,
    canCreatePortfolio: true,
    canViewOwnPortfolio: true,
    canViewOthersPortfolios: true,
    canMakePortfolioPublic: true,
    canViewFollowers: true,
    canInteractWithFollowers: true,
  },
  market_supervisor: {
    canManageUsers: false,
    canManageEmployees: true,
    canAssignPermissions: false,
    canViewAllMarkets: true,
    canManageMarkets: true,
    canViewUSMarket: true,
    canManageUSMarket: false,
    canViewIndices: true,
    canManageIndices: true,
    canCreateCustomIndex: true,
    canViewFunds: true,
    canManageFunds: true,
    canViewSectors: true,
    canManageSectors: true,
    canViewCompanies: true,
    canManageCompanies: true,
    canAssignCompanies: true,
    canViewAccumulationAlerts: true,
    canViewDistributionAlerts: true,
    canViewTechnicalAnalysis: true,
    canSendAlerts: true,
    canCreateOptionContracts: true,
    canViewOptionContracts: true,
    canEditOptionContracts: true,
    canDeleteOptionContracts: false,
    canCreateFutureAlerts: true,
    canViewFutureAlerts: true,
    canCreatePortfolio: true,
    canViewOwnPortfolio: true,
    canViewOthersPortfolios: true,
    canMakePortfolioPublic: true,
    canViewFollowers: true,
    canInteractWithFollowers: true,
  },
  us_market_supervisor: {
    canManageUsers: false,
    canManageEmployees: false,
    canAssignPermissions: false,
    canViewAllMarkets: false,
    canManageMarkets: false,
    canViewUSMarket: true,
    canManageUSMarket: true,
    canViewIndices: true,
    canManageIndices: false,
    canCreateCustomIndex: true,
    canViewFunds: true,
    canManageFunds: false,
    canViewSectors: true,
    canManageSectors: false,
    canViewCompanies: true,
    canManageCompanies: false,
    canAssignCompanies: false,
    canViewAccumulationAlerts: true,
    canViewDistributionAlerts: true,
    canViewTechnicalAnalysis: true,
    canSendAlerts: true,
    canCreateOptionContracts: true,
    canViewOptionContracts: true,
    canEditOptionContracts: true,
    canDeleteOptionContracts: false,
    canCreateFutureAlerts: true,
    canViewFutureAlerts: true,
    canCreatePortfolio: true,
    canViewOwnPortfolio: true,
    canViewOthersPortfolios: false,
    canMakePortfolioPublic: true,
    canViewFollowers: true,
    canInteractWithFollowers: true,
  },
  employee: {
    canManageUsers: false,
    canManageEmployees: false,
    canAssignPermissions: false,
    canViewAllMarkets: false,
    canManageMarkets: false,
    canViewUSMarket: false,
    canManageUSMarket: false,
    canViewIndices: true,
    canManageIndices: false,
    canCreateCustomIndex: false,
    canViewFunds: true,
    canManageFunds: false,
    canViewSectors: true,
    canManageSectors: false,
    canViewCompanies: true,
    canManageCompanies: false,
    canAssignCompanies: false,
    canViewAccumulationAlerts: true,
    canViewDistributionAlerts: true,
    canViewTechnicalAnalysis: true,
    canSendAlerts: false,
    canCreateOptionContracts: true,
    canViewOptionContracts: true,
    canEditOptionContracts: true,
    canDeleteOptionContracts: true,
    canCreateFutureAlerts: true,
    canViewFutureAlerts: true,
    canCreatePortfolio: true,
    canViewOwnPortfolio: true,
    canViewOthersPortfolios: false,
    canMakePortfolioPublic: true,
    canViewFollowers: true,
    canInteractWithFollowers: true,
  },
};

// بيانات المستخدم
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permissions;
  assignedIndices: string[];
  assignedFunds: string[];
  assignedSectors: string[];
  assignedCompanies: string[];
  assignedMarkets: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}
