export function validRole(roleName) {
  if (roleName === 'waiter' || roleName === 'cashier' || roleName === 'chef') {
    return { success: false, message: '403 Forbidden.' }
  }
  return { success: true, message: '' }
}
