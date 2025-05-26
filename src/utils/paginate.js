export function paginate({ page = 1, limit = 10 }) {
  if (limit === '-1') return {}
  page = Number(page) > 0 ? Number(page) - 1 : 0
  limit = Number(limit)
  const skip = page * limit

  return { skip, limits: limit }
}
