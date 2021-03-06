const express = require('express')
const cors = require('cors')
const path = require('path')

const { webCrawl, resultsByPage } = require('./helper')

const server = express()
const port = process.env.PORT || 4000

// rudimentary search history cache
const searchHistory = []
const searchResults = []

// logger middleware
const logger = () => (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}]: ${req.method} - ${req.url} `,
    req.params ? req.params : null` - ${req.ip} \n`,
    req.body
  )
  next()
}

// init middleware
server.use(cors())
server.use(express.json())
server.use(logger())

// serve react app
server.use(express.static(path.join(__dirname, 'client/build')))

// Handle client-side routing, return all requests to React app
server.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
})

// search endpoint
server.post('/search', async (req, res, next) => {
  try {
    const { link, levels, page } = req.body
    !searchHistory.includes(link) && searchHistory.push(link)
    let useCache = { exists: false, results: [] }
    searchResults.map(async each => {
      if (typeof each[`${levels}${link}`] !== 'undefined') {
        useCache = { exists: true, results: each[`${levels}${link}`] }
      }
    })

    if (useCache.exists) {
      // use cache if it exists
      const list = resultsByPage(useCache.results, page)
      console.log('using cache', list)
      res.json({ results: list, total: useCache.results.length })
    } else {
      // else make the http request
      const _list = await webCrawl([{ link }], levels)
      const _listFlat = _list[0] === typeof Array ? _list.flat(Infinity) : _list
      const list = _listFlat.filter(each => each && each.link != undefined)
      // cache results
      searchResults.push({ [`${levels}${link}`]: list })
      res.json({ results: resultsByPage(list, page), total: list.length })
    }
  } catch (err) {
    next(err)
  }
})

// error fallback
server.use((err, req, res, next) => {
  console.log(err)
})

// check if running in a test or not
if (!module.parent) {
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

// export the server for testing
module.exports = server
