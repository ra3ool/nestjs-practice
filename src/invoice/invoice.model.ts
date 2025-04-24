interface items {
  sku: string; //Stock Keeping Unit, unique identifier for the item
  qt: string; //Quantity of the item
}
export interface Invoice {
  customer: string; //The name or identifier of the customer
  amount: number; //The total amount of the invoice
  reference: string; //A reference code for the invoice
  date: Date; //The date the invoice was created
  items: items[]; //An array of items in the invoice
}
