import type { Appointment, AppointmentRequest, AppointmentStatus, CurrentUser, DashboardSummary, FinanceSummary, FinancialTransaction, FinancialTransactionRequest, TenantSettings, AnalyticsSummary, BusinessUnit, ServiceOrder, CashSession, NotificationItem, AssistantAnswer, PublicCatalog, CustomerProfile, Customer, CustomerRequest, CustomerStatus, Employee, EmployeeBlock, EmployeeRequest, EmployeeStatus, ProblemDetails, ServiceOffering, ServiceRequest, ServiceStatus, TokenResponse, WorkSchedule, WorkScheduleRequest, Product, InventoryMovement, CommissionSummary } from '../types'

const ACCESS_TOKEN_KEY = 'agenda-pro.access-token'
const REFRESH_TOKEN_KEY = 'agenda-pro.refresh-token'
const ACCESS_EXPIRES_AT_KEY = 'agenda-pro.access-expires-at'

type RequestOptions = RequestInit & { retryAuth?: boolean }

export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly problem?: ProblemDetails) {
    super(message)
  }
}

export const sessionStorageService = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  save(tokens: TokenResponse) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
    localStorage.setItem(ACCESS_EXPIRES_AT_KEY, tokens.accessTokenExpiresAt)
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(ACCESS_EXPIRES_AT_KEY)
  },
}

async function parseError(response: Response): Promise<ApiError> {
  let problem: ProblemDetails | undefined
  try { problem = await response.json() as ProblemDetails } catch { /* empty response */ }
  return new ApiError(response.status, problem?.detail || problem?.title || `Erro HTTP ${response.status}`, problem)
}

async function refreshSession(): Promise<boolean> {
  const refreshToken = sessionStorageService.getRefreshToken()
  if (!refreshToken) return false
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!response.ok) {
    sessionStorageService.clear()
    return false
  }
  sessionStorageService.save(await response.json() as TokenResponse)
  return true
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const accessToken = sessionStorageService.getAccessToken()
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const response = await fetch(path, { ...options, headers })
  if (response.status === 401 && options.retryAuth !== false && await refreshSession()) {
    return request<T>(path, { ...options, retryAuth: false })
  }
  if (!response.ok) throw await parseError(response)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  async login(email: string, password: string) {
    const tokens = await request<TokenResponse>('/api/v1/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }), retryAuth: false,
    })
    sessionStorageService.save(tokens)
    return tokens
  },
  async logout() {
    const refreshToken = sessionStorageService.getRefreshToken()
    try {
      if (refreshToken) await request<void>('/api/v1/auth/logout', {
        method: 'POST', body: JSON.stringify({ refreshToken }), retryAuth: false,
      })
    } finally { sessionStorageService.clear() }
  },
  me: () => request<CurrentUser>('/api/v1/users/me'),
  listEmployees: () => request<Employee[]>('/api/v1/employees'),
  getEmployee: (id: string) => request<Employee>(`/api/v1/employees/${id}`),
  createEmployee: (payload: EmployeeRequest) => request<Employee>('/api/v1/employees', { method: 'POST', body: JSON.stringify(payload) }),
  updateEmployee: (id: string, payload: EmployeeRequest) => request<Employee>(`/api/v1/employees/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  changeEmployeeStatus: (id: string, status: EmployeeStatus) => request<Employee>(`/api/v1/employees/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  listSchedules: (id: string) => request<WorkSchedule[]>(`/api/v1/employees/${id}/work-schedules`),
  saveSchedule: (id: string, payload: WorkScheduleRequest) => request<WorkSchedule>(`/api/v1/employees/${id}/work-schedules`, { method: 'PUT', body: JSON.stringify(payload) }),
  listBlocks: (id: string) => request<EmployeeBlock[]>(`/api/v1/employees/${id}/blocks`),
  createBlock: (id: string, payload: { startsAt: string; endsAt: string; reason: string }) => request<EmployeeBlock>(`/api/v1/employees/${id}/blocks`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteBlock: (id: string, blockId: string) => request<void>(`/api/v1/employees/${id}/blocks/${blockId}`, { method: 'DELETE' }),
  listCustomers: () => request<Customer[]>('/api/v1/customers'),
  getCustomer: (id: string) => request<Customer>(`/api/v1/customers/${id}`),
  createCustomer: (payload: CustomerRequest) => request<Customer>('/api/v1/customers', { method: 'POST', body: JSON.stringify(payload) }),
  updateCustomer: (id: string, payload: CustomerRequest) => request<Customer>(`/api/v1/customers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  changeCustomerStatus: (id: string, status: CustomerStatus) => request<Customer>(`/api/v1/customers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  listServices: () => request<ServiceOffering[]>('/api/v1/services'),
  createService: (payload: ServiceRequest) => request<ServiceOffering>('/api/v1/services', { method: 'POST', body: JSON.stringify(payload) }),
  updateService: (id: string, payload: ServiceRequest) => request<ServiceOffering>(`/api/v1/services/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  changeServiceStatus: (id: string, status: ServiceStatus) => request<ServiceOffering>(`/api/v1/services/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  listAppointments: (from: string, to: string) => request<Appointment[]>(`/api/v1/appointments?from=${from}&to=${to}`),
  createAppointment: (payload: AppointmentRequest) => request<Appointment>('/api/v1/appointments', { method: 'POST', body: JSON.stringify(payload) }),
  updateAppointment: (id: string, payload: AppointmentRequest) => request<Appointment>(`/api/v1/appointments/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  changeAppointmentStatus: (id: string, status: AppointmentStatus) => request<Appointment>(`/api/v1/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  dashboard: () => request<DashboardSummary>('/api/v1/dashboard'),
  listTransactions: (from:string,to:string) => request<FinancialTransaction[]>(`/api/v1/finance/transactions?from=${from}&to=${to}`),
  financeSummary: (from:string,to:string) => request<FinanceSummary>(`/api/v1/finance/summary?from=${from}&to=${to}`),
  createTransaction: (payload:FinancialTransactionRequest) => request<FinancialTransaction>('/api/v1/finance/transactions',{method:'POST',body:JSON.stringify(payload)}),
  deleteTransaction: (id:string) => request<void>(`/api/v1/finance/transactions/${id}`,{method:'DELETE'}),

  analytics: (from:string,to:string) => request<AnalyticsSummary>(`/api/v1/analytics?from=${from}&to=${to}`),
  customerProfile: (id:string) => request<CustomerProfile>(`/api/v1/customers/${id}/profile`),
  listUnits: () => request<BusinessUnit[]>('/api/v1/units'),
  createUnit: (payload:{name:string;slug:string;address?:string;phone?:string}) => request<BusinessUnit>('/api/v1/units',{method:'POST',body:JSON.stringify(payload)}),
  listOrders: () => request<ServiceOrder[]>('/api/v1/orders'),
  getOrder: (id:string) => request<ServiceOrder>(`/api/v1/orders/${id}`),
  createOrder: (payload:{customerId:string;employeeId?:string;appointmentId?:string;notes?:string}) => request<{id:string;status:string}>('/api/v1/orders',{method:'POST',body:JSON.stringify(payload)}),
  addOrderItem: (id:string,payload:{itemType:string;referenceId?:string;description:string;quantity:number;unitPrice:number}) => request<void>(`/api/v1/orders/${id}/items`,{method:'POST',body:JSON.stringify(payload)}),
  closeOrder: (id:string,paymentMethod:string) => request<void>(`/api/v1/orders/${id}/close`,{method:'POST',body:JSON.stringify({paymentMethod})}),
  currentCash: () => request<CashSession>('/api/v1/cash/current'),
  openCash: (openingBalance:number) => request<CashSession>('/api/v1/cash/open',{method:'POST',body:JSON.stringify({openingBalance})}),
  closeCash: (id:string,closingBalance:number,notes?:string) => request<void>(`/api/v1/cash/${id}/close`,{method:'POST',body:JSON.stringify({closingBalance,notes})}),
  listNotifications: () => request<NotificationItem[]>('/api/v1/notifications'),
  queueReminders: (hours=24) => request<{queued:number;providerConfigured:boolean;message:string}>(`/api/v1/notifications/reminders?hours=${hours}`,{method:'POST'}),
  askAssistant: (question:string) => request<AssistantAnswer>('/api/v1/assistant/query',{method:'POST',body:JSON.stringify({question})}),
  getPublicBookingSettings: () => request<{enabled:boolean;slug?:string;message?:string}>('/api/v1/public-booking/settings'),
  updatePublicBookingSettings: (payload:{enabled:boolean;slug:string;message?:string}) => request<Record<string,unknown>>('/api/v1/public-booking/settings',{method:'PUT',body:JSON.stringify(payload)}),
  publicCatalog: (slug:string) => request<PublicCatalog>(`/api/public/${slug}`,{retryAuth:false}),
  publicBook: (slug:string,payload:Record<string,unknown>) => request<Record<string,unknown>>(`/api/public/${slug}/book`,{method:'POST',body:JSON.stringify(payload),retryAuth:false}),

  listProducts: () => request<Product[]>('/api/v1/products'),
  createProduct: (payload:{name:string;sku?:string;category?:string;salePrice:number;costPrice:number;initialStock:number;minimumStock:number}) => request<{id:string;name:string;active:boolean}>('/api/v1/products',{method:'POST',body:JSON.stringify(payload)}),
  moveStock: (id:string,payload:{type:string;quantity:number;unitCost?:number;reason:string}) => request<void>(`/api/v1/products/${id}/movements`,{method:'POST',body:JSON.stringify(payload)}),
  listInventoryMovements: () => request<InventoryMovement[]>('/api/v1/inventory/movements'),
  commissions: (from:string,to:string) => request<CommissionSummary>(`/api/v1/commissions?from=${from}&to=${to}`),
  generateCommission: (employeeId:string,payload:{description:string;baseAmount:number;percentage:number;occurredOn:string}) => request<{id:string;commissionAmount:number;status:string}>(`/api/v1/commissions/${employeeId}/generate`,{method:'POST',body:JSON.stringify(payload)}),
  payCommissions: (employeeId:string,payload:{from:string;to:string}) => request<{paidEntries:number;amount:number}>(`/api/v1/commissions/${employeeId}/pay`,{method:'POST',body:JSON.stringify(payload)}),
  getSettings: () => request<TenantSettings>('/api/v1/settings'),
  updateSettings: (payload:TenantSettings) => request<TenantSettings>('/api/v1/settings',{method:'PUT',body:JSON.stringify(payload)}),
}

