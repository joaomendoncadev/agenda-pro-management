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
