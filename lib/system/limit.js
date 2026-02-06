const rate = new Map()

export function checkLimit(id, delay = 1500) {

  if (rate.has(id)) return true

  rate.set(id, true)

  setTimeout(() => rate.delete(id), delay)

  return false

}