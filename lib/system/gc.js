export function startGC() {

  setInterval(() => {

    if (global.gc) global.gc()

  }, 300000)

}