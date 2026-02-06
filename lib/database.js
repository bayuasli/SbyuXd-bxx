import Database from 'better-sqlite3'

const sqlite = new Database('./database.db')

sqlite.exec(`

CREATE TABLE IF NOT EXISTS data (

  key TEXT PRIMARY KEY,

  value TEXT

);

`)

function loadData() {

  const rows = sqlite.prepare("SELECT * FROM data").all()

  const obj = {}

  for (const r of rows) obj[r.key] = JSON.parse(r.value)

  return obj

}

function saveKey(key, value) {

  sqlite.prepare("INSERT OR REPLACE INTO data VALUES (?, ?)").run(key, JSON.stringify(value))

}

global.db = {

  data: loadData(),

  write() {

    for (const key of Object.keys(this.data)) {

      saveKey(key, this.data[key])

    }

  }

}

global.db.data ||= {

  users: {},

  groups: {},

  settings: {},

  fq: {}

}

setInterval(() => global.db.write(), 30000)