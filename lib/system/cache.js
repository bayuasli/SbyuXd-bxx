global.__CACHE = new Map()

export function cacheGet(k) {

  return global.__CACHE.get(k)

}

export function cacheSet(k, v, ttl = 60000) {

  global.__CACHE.set(k, v)

  setTimeout(() => global.__CACHE.delete(k), ttl)

}