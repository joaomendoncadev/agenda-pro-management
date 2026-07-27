export type EmployeeStatus = 'ACTIVE' | 'INACTIVE'

export interface TokenResponse {
  tokenType: string
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export interface CurrentUser {
  id: string
  tenantId: string
  name: string
  email: string
  roles: string[]
}

export interface Employee {
  id: string
  name: string
  position: string
  email: string | null
  phone: string | null
  photoUrl: string | null
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface EmployeeRequest {
  name: string
  position: string
  email: string | null
  phone: string | null
  photoUrl: string | null
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export interface WorkSchedule {
  id: string
  dayOfWeek: DayOfWeek
  working: boolean
  startTime: string | null
  endTime: string | null
  breakStart: string | null
  breakEnd: string | null
}

export interface WorkScheduleRequest {
  dayOfWeek: DayOfWeek
  working: boolean
  startTime: string | null
  endTime: string | null
  breakStart: string | null
  breakEnd: string | null
}

export interface EmployeeBlock {
  id: string
  startsAt: string
  endsAt: string
  reason: string
  createdAt: string
}

export interface ProblemDetails {
  title?: string
  detail?: string
  status?: number
  code?: string
  errors?: Record<string, string>
}

export type CustomerStatus = 'ACTIVE' | 'INACTIVE'
export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  birthDate: string | null
  notes: string | null
  status: CustomerStatus
  createdAt: string
  updatedAt: string
}
export interface CustomerRequest {
  name: string
  email: string | null
  phone: string | null
  birthDate: string | null
  notes: string | null
}

export type ServiceStatus = 'ACTIVE' | 'INACTIVE'
export interface ServiceOffering { id:string; name:string; description:string|null; durationMinutes:number; price:number; category:string|null; commissionPercentage:number|null; status:ServiceStatus; createdAt:string; updatedAt:string }
export interface ServiceRequest { name:string; description:string|null; durationMinutes:number; price:number; category:string|null; commissionPercentage:number|null }
export type AppointmentStatus = 'SCHEDULED'|'CONFIRMED'|'COMPLETED'|'CANCELLED'|'NO_SHOW'
export interface Appointment { id:string; customerId:string; customerName:string; employeeId:string; employeeName:string; serviceId:string; serviceName:string; startsAt:string; endsAt:string; status:AppointmentStatus; notes:string|null; price:number; createdAt:string; updatedAt:string }
export interface AppointmentRequest { customerId:string; employeeId:string; serviceId:string; startsAt:string; notes:string|null }

export type TransactionType = 'INCOME'|'EXPENSE'
export type TransactionStatus = 'PENDING'|'PAID'|'CANCELLED'
export interface FinancialTransaction { id:string; type:TransactionType; category:string; description:string; amount:number; occurredOn:string; status:TransactionStatus; createdAt:string; updatedAt:string }
export interface FinancialTransactionRequest { type:TransactionType; category:string; description:string; amount:number; occurredOn:string; status:TransactionStatus }
export interface FinanceSummary { income:number; expenses:number; balance:number; pendingCount:number }
export interface DashboardSummary { appointmentsToday:number; completedToday:number; customers:number; activeEmployees:number; revenueToday:number; nextAppointment:string|null; nextCustomer:string|null; nextEmployee:string|null }
export interface TenantSettings { businessName:string; phone:string|null; timezone:string; currency:string; bookingIntervalMinutes:number; cancellationHours:number }

export interface AnalyticsSummary { from:string; to:string; revenue:number; averageTicket:number; completed:number; cancelled:number; noShows:number; revenueByEmployee:Array<{label:string;value:number}>; appointmentsByService:Array<{label:string;value:number}>; heatmap:Array<{day:number;hour:number;value:number}> }
export interface BusinessUnit { id:string; name:string; slug:string; address?:string; phone?:string; active:boolean }
export interface ServiceOrderItem { id:string; itemType:string; referenceId?:string; description:string; quantity:number; unitPrice:number; total:number }
export interface ServiceOrder { id:string; customerId:string; customerName:string; status:string; total:number; discount:number; paymentMethod?:string; openedAt:string; closedAt?:string; items?:ServiceOrderItem[] }
export interface CashSession { id?:string; status:'OPEN'|'CLOSED'; openedAt?:string; openingBalance?:number; expectedBalance?:number; incomeToday?:number; expensesToday?:number }
export interface NotificationItem { id:string; channel:string; recipient:string; template:string; status:string; scheduledAt:string; sentAt?:string; attempts:number }
export interface AssistantAnswer { answer:string; data:Array<Record<string,unknown>> }
export interface PublicCatalog { business:Record<string,unknown>; services:ServiceOffering[]; employees:Employee[] }

export interface CustomerHistoryItem { id:string; startsAt:string; endsAt:string; status:AppointmentStatus; price:number; serviceName:string; employeeName:string }
export interface CustomerProfile { customer:Record<string,unknown>; history:CustomerHistoryItem[]; totalSpent:number; completedVisits:number }

export interface Product { id:string; name:string; sku?:string; category?:string; salePrice:number; costPrice:number; stockQuantity:number; minimumStock:number; active:boolean; createdAt:string; updatedAt:string }
export interface InventoryMovement { id:string; productId:string; productName:string; type:'ENTRY'|'EXIT'|'ADJUSTMENT'; quantity:number; unitCost?:number; reason:string; occurredAt:string }
export interface CommissionEmployeeSummary { employeeId:string; employeeName:string; pending:number; paid:number; total:number }
export interface CommissionSummary { from:string; to:string; pending:number; paid:number; total:number; employees:CommissionEmployeeSummary[] }
