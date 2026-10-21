import { createApp } from './app.js'

const PORT = 3001
createApp().listen(PORT, () => console.log(`Todo API listening on port ${PORT}!`))
