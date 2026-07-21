export interface AddressResponse {
  addressId: number;
  recipientName: string;
  phone: string;
  zipcode: string;
  address: string;
  detailAddress: string;
  normalDeliveryRequest: string;
  rocketDeliveryRequest: string;
  isDefault: boolean;
}

export interface AddressRequest {
  recipientName: string;
  phone: string;
  zipcode: string;
  address: string;
  detailAddress: string;
  normalDeliveryRequest: string;
  rocketDeliveryRequest: string;
  isDefault: boolean;
}
