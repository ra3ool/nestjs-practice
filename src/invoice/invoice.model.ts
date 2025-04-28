interface items {
  sku: string; //Stock Keeping Unit, unique identifier for the item
  qt: number; //Quantity of the item
}
export interface Invoice {
  customer: string; //The name or identifier of the customer
  amount: number; //The total amount of the invoice
  reference: string; //A reference code for the invoice
  date: Date; //The date the invoice was created
  items: items[]; //An array of items in the invoice
}

export interface InvoiceFilters {
  customer: string; //Filter for invoices by customer name or identifier
  date?: Date | { $gte?: Date; $lte?: Date }; //Filter for invoices by date, can be a single date or a range
  amount?: number | { $gte?: number; $lte?: number }; //Filter for invoices by amount, can be a single value or a range
}
