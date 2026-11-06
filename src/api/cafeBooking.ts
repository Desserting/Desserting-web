import { api, type ApiResponse } from '@/lib/axios';

export interface MapCoordinate {
  lat: number;
  lng: number;
}

export interface ThemeStreet {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  center: MapCoordinate | null;
  boundary: MapCoordinate[];
  storeCount: number | null;
}

export interface CafeStore {
  storeId: number;
  name: string;
  address: string;
  coverImageUrl: string | null;
  themeStreetId: number | null;
  themeStreetName: string | null;
  dessertTypes: string[];
  distanceKm: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface StoreMenu {
  menuId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  soldOut: boolean;
  category: 'DESSERT' | 'DRINK' | 'SET';
}

export interface CafeStoreDetail extends Omit<CafeStore, 'distanceKm'> {
  businessHours: string | null;
  contact: string | null;
  partnerDiscountNotice: string | null;
  menus: StoreMenu[];
}

export interface ReservationDate {
  date: string;
  available: boolean;
  remainingCount: number;
}

export interface ReservationSlot {
  slotId: number;
  storeId: number;
  slotDate: string;
  slotTime: string;
  maxCapacity: number;
  currentReservedCount: number;
  isAvailable: boolean;
}

export interface CafeReservation {
  reservationId: number;
  storeId: number;
  storeName: string;
  storeAddress: string;
  chatRoomId: number | null;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
  statusDescription: string;
  finalAmount: number;
}

export interface OrderItem {
  menuId: number;
  quantity: number;
}

export interface OrderPreview {
  reservationId: number;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  guestCount: number;
  couponName: string | null;
  items: (OrderItem & {
    menuName: string;
    unitPrice: number;
    lineAmount: number;
  })[];
}

export interface CafeOrder extends OrderPreview {
  orderId: number;
  storeId: number;
  storeName: string;
  reservationDate: string;
  reservationTime: string;
  reservationStatus: CafeReservation['status'];
  reservationStatusDescription: string;
  orderStatus: 'PAID' | 'REFUNDED';
  orderStatusDescription: string;
  paidAt: string;
  currentStep: 'RECEIVED' | 'PREPARING' | 'READY' | null;
  progressSteps: {
    step: 'RECEIVED' | 'PREPARING' | 'READY';
    label: string;
    done: boolean;
    at: string | null;
  }[];
}

export const cafeKeys = {
  themes: ['cafes', 'themes'] as const,
  theme: (id: number) => ['cafes', 'theme', id] as const,
  stores: (themeId: number) => ['cafes', 'stores', themeId] as const,
  detail: (storeId: number) => ['cafes', 'detail', storeId] as const,
  dates: (storeId: number, from: string, to: string) =>
    ['cafes', 'dates', storeId, from, to] as const,
  slots: (storeId: number, date: string) =>
    ['cafes', 'slots', storeId, date] as const,
  reservations: ['cafes', 'reservations'] as const,
  reservation: (id: number) => ['cafes', 'reservation', id] as const,
  orders: ['cafes', 'orders'] as const,
  receipt: (id: number) => ['cafes', 'receipt', id] as const,
};

async function getData<T>(
  path: string,
  params?: Record<string, string | number>,
) {
  const { data } = await api.get<ApiResponse<T>>(path, { params });
  return data.data;
}

type ThemeStreetResponse = Partial<ThemeStreet> & {
  themeStreetId?: number;
  name: string;
};

export function isMapCoordinate(value: unknown): value is MapCoordinate {
  if (!value || typeof value !== 'object') return false;
  const coordinate = value as Partial<MapCoordinate>;
  return (
    typeof coordinate.lat === 'number' &&
    Number.isFinite(coordinate.lat) &&
    Math.abs(coordinate.lat) <= 90 &&
    typeof coordinate.lng === 'number' &&
    Number.isFinite(coordinate.lng) &&
    Math.abs(coordinate.lng) <= 180
  );
}

function normalizeTheme(theme: ThemeStreetResponse): ThemeStreet {
  return {
    id: positiveId(theme.id ?? theme.themeStreetId),
    name: theme.name,
    description: theme.description ?? null,
    isActive: theme.isActive ?? true,
    center: isMapCoordinate(theme.center) ? theme.center : null,
    boundary: Array.isArray(theme.boundary)
      ? theme.boundary.filter(isMapCoordinate)
      : [],
    storeCount:
      typeof theme.storeCount === 'number' && theme.storeCount >= 0
        ? theme.storeCount
        : null,
  };
}

export async function fetchCafeThemes(): Promise<ThemeStreet[]> {
  const themes = await getData<ThemeStreetResponse[]>('/v1/themes');
  return themes.map(normalizeTheme).filter((theme) => theme.id > 0);
}
export async function fetchCafeThemeDetail(id: number) {
  const result = await getData<{
    themeStreet: ThemeStreetResponse;
    stores: CafeStore[];
  }>(`/v1/themes/${id}`);
  return {
    themeStreet: normalizeTheme(result.themeStreet),
    stores: result.stores,
  };
}
export const fetchAreaStores = (id: number) =>
  getData<CafeStore[]>('/v1/stores', { themeStreetId: id });
export const fetchCafeDetail = (id: number) =>
  getData<CafeStoreDetail>(`/v1/stores/${id}`);
export const fetchReservationDates = (id: number, from: string, to: string) =>
  getData<ReservationDate[]>(`/v1/stores/${id}/reservation-dates`, {
    from,
    to,
  });

// Spring의 실제 시간 문자열과 OpenAPI의 LocalTime 객체 표기를 모두 처리한다.
export function normalizeCafeTime(
  value: string | { hour: number; minute: number },
) {
  return typeof value === 'string'
    ? value.slice(0, 5)
    : `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
}

export async function fetchReservationSlots(id: number, date: string) {
  const slots = await getData<
    (Partial<Omit<ReservationSlot, 'slotTime'>> & {
      slotId: number;
      slotTime?: string | { hour: number; minute: number };
      time?: string | { hour: number; minute: number };
      capacity?: number;
      remaining?: number;
      available?: boolean;
    })[]
  >(`/v1/stores/${id}/reservation-slots`, { date });
  return slots.map((slot): ReservationSlot => {
    const time = slot.slotTime ?? slot.time;
    if (time == null) throw new Error('예약 시간대에 시간 정보가 없어요.');
    const capacity = slot.maxCapacity ?? slot.capacity ?? 0;
    return {
      slotId: slot.slotId,
      storeId: slot.storeId ?? id,
      slotDate: slot.slotDate ?? date,
      slotTime: normalizeCafeTime(time),
      maxCapacity: capacity,
      currentReservedCount:
        slot.currentReservedCount ?? capacity - (slot.remaining ?? 0),
      isAvailable: slot.isAvailable ?? slot.available ?? false,
    };
  });
}

export async function createCafeReservation(request: {
  slotId: number;
  guestCount: number;
  chatRoomId?: number;
}) {
  const { data } = await api.post<ApiResponse<CafeReservation>>(
    '/v1/reservations',
    request,
  );
  return data.data;
}

export const fetchCafeReservation = (id: number) =>
  getData<CafeReservation>(`/v1/reservations/${id}`);

export const fetchCafeOrder = (reservationId: number) =>
  getData<CafeOrder>(`/v1/reservations/${reservationId}/order`);

export async function previewCafeOrder(id: number, items: OrderItem[]) {
  const { data } = await api.post<ApiResponse<OrderPreview>>(
    `/v1/reservations/${id}/order/preview`,
    { items },
  );
  return data.data;
}

export async function placeCafeOrder(
  id: number,
  request: {
    items: OrderItem[];
    paymentMethod: 'CARD' | 'EASY_PAY';
    paymentType: 'COMBINED';
  },
) {
  const { data } = await api.post<ApiResponse<CafeOrder>>(
    `/v1/reservations/${id}/order`,
    request,
  );
  return data.data;
}

export function positiveId(value: string | number | null | undefined): number {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : 0;
}
