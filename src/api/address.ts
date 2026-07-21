import instance from '@/api/instance';
import type { AddressRequest, AddressResponse } from '@/types/address';

export const getAddresses = async () => {
  const { data } = await instance.get<AddressResponse[]>('/api/addresses');
  return data;
};

export const createAddress = async (payload: AddressRequest) => {
  const { data } = await instance.post<AddressResponse>('/api/addresses', payload);
  return data;
};

export const updateAddress = async (addressId: number, payload: AddressRequest) => {
  const { data } = await instance.patch<AddressResponse>(`/api/addresses/${addressId}`, payload);
  return data;
};

export const deleteAddress = async (addressId: number) => {
  await instance.delete<void>(`/api/addresses/${addressId}`);
};
