import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PrintifyOrderAddress, PrintifyOrderItem } from '../services/printify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export interface PrintifyOrder {
  shipping_address: PrintifyOrderAddress;
  items: PrintifyOrderItem[];
  default_address: string;
}
