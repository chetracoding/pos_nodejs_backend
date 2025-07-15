export function paginate({ page = 1, limit = 10 }) {
  page = Number(page) > 0 ? Number(page) - 1 : 0
  limit = Number(limit)
  const skip = page * limit

  // const skip = (page - 1) * limit

  return { skip, limit }
}
