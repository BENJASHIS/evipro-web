export function generateTicketCode(sequence: number): string {
  const year = new Date().getFullYear()
  const padded = String(sequence).padStart(5, '0')
  return `EVP-${year}-${padded}`
}

export function generateTicketBatch(qty: number, startSequence: number): string[] {
  return Array.from({ length: qty }, (_, i) =>
    generateTicketCode(startSequence + i)
  )
}
