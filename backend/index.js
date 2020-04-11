const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
const cheerio = require('cheerio')

const server = express()
const port = process.env.PORT || 4000

//helper functions
function validateUrl(value) {
  return /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/.test(value);
}

const getSites = async url => {
  try {
  const response = await fetch(url)
  const list = crawlSite(await response.text())
  return list.filter((item)=> validateUrl(item.link))
  } catch {
    return
  }
}

const crawlSite = site => {
  const $ = cheerio.load(site)
  const links = $('a')
  let list = []
  links.map((i, link) => {
    list.push({ name: $(link).text(), link: $(link).attr('href') })
  })
  return list
}

const webCrawl = async (urls, levels, currentLevel = 0, list = []) => {
  //console.log("urls: ", urls,"\nlist: ", list, currentLevel)
  if (currentLevel === levels) {
    console.log("Escape", list)
    return list
  } else {
    const getList = async () => {
      return Promise.all(
        urls.map(async url => {
          if (url && url.link) {
          return await getSites(url.link)}
          return
        })
      )
    }
    _results = await getList()
    results = _results.flat(Infinity)
    const newlist = [...list, ...results]
    newLevel = currentLevel+1
    return webCrawl(results, levels, newLevel, newlist)
   //return newlist
  }
}

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

// search endpoint
server.post('/search', async (req, res, next) => {
  try {
    const { link, levels } = req.body
    const _list = await webCrawl([{ link }], levels)
    _listFlat = _list[0] === typeof(Array) ? _list.flat(Infinity): _list
    const list = _listFlat.filter(each => each && each.link != undefined)
    res.json(list)
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
