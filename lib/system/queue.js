const queue = []

let busy = false

export function injectQueue(handler) {

  return async (conn, m) => {

    queue.push({ conn, m })

    run(handler)

  }

}

async function run(handler) {

  if (busy || !queue.length) return

  busy = true

  const { conn, m } = queue.shift()

  try { await handler(conn, m) } catch {}

  busy = false

  run(handler)

}