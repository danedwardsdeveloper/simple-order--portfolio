import { OrderSummaryInterface } from '@/app/[merchant-slug]/components/OrderItem'

import { bakeryItems } from './bakeryItems'

export const orders: OrderSummaryInterface[] = [
  {
    customerName: `Dan's bakery`,
    dueDate: 'Tomorrow',
    items: [
      { itemDetails: bakeryItems.croissant, quantity: 7 },
      { itemDetails: bakeryItems.sourdough, quantity: 5 },
      { itemDetails: bakeryItems.baguette, quantity: 12 },
      { itemDetails: bakeryItems.muffin, quantity: 22 },
    ],
  },
  {
    customerName: `Kingston Lacy`,
    dueDate: 'Tomorrow',
    items: [
      { itemDetails: bakeryItems.croissant, quantity: 82 },
      { itemDetails: bakeryItems.sourdough, quantity: 20 },
      { itemDetails: bakeryItems.baguette, quantity: 35 },
      { itemDetails: bakeryItems.muffin, quantity: 61 },
    ],
  },
  {
    customerName: 'The Grand Hotel',
    dueDate: 'Tomorrow',
    items: [
      { itemDetails: bakeryItems.croissant, quantity: 48 },
      { itemDetails: bakeryItems.painAuChocolat, quantity: 36 },
      { itemDetails: bakeryItems.danish, quantity: 36 },
      { itemDetails: bakeryItems.brioche, quantity: 12 },
      { itemDetails: bakeryItems.scone, quantity: 60 },
    ],
  },
  {
    customerName: 'Fresh & Wild Cafe',
    dueDate: 'Tomorrow',
    items: [
      { itemDetails: bakeryItems.sourdough, quantity: 8 },
      { itemDetails: bakeryItems.focaccia, quantity: 6 },
      { itemDetails: bakeryItems.cinnamonRoll, quantity: 18 },
    ],
  },
  {
    customerName: 'University Catering Services',
    dueDate: 'Tomorrow',
    items: [
      { itemDetails: bakeryItems.baguette, quantity: 75 },
      { itemDetails: bakeryItems.muffin, quantity: 100 },
      { itemDetails: bakeryItems.croissant, quantity: 80 },
    ],
  },
  {
    customerName: 'Green Fields Farm Shop',
    dueDate: 'Tomorrow',
    items: [
      { itemDetails: bakeryItems.sourdough, quantity: 15 },
      { itemDetails: bakeryItems.brioche, quantity: 10 },
      { itemDetails: bakeryItems.focaccia, quantity: 12 },
    ],
  },
  {
    customerName: 'Seaside Delicatessen',
    dueDate: 'Tomorrow',
    items: [
      { itemDetails: bakeryItems.baguette, quantity: 20 },
      { itemDetails: bakeryItems.croissant, quantity: 30 },
      { itemDetails: bakeryItems.painAuChocolat, quantity: 25 },
      { itemDetails: bakeryItems.danish, quantity: 20 },
    ],
  },
]
