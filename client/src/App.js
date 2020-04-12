import React, { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import axios from 'axios'

const initialState = {
  link: 'http://',
  levels: 1,
  page: 1,
}

function App() {
  const [crawl, setCrawl] = useState(initialState)
  const [results, setResults] = useState([])
  const [error, setError] = useState()

  useEffect(() => {
    handleSubmit()
  }, [handleSubmit, crawl.page])

  const handleChange = e => {
    setCrawl({ ...crawl, [e.target.name]: e.target.name === 'levels' ? parseInt(e.target.value) : e.target.value })
  }

  const handleSubmit = async e => {
    e && e.preventDefault()
    try {
      const results = await crawlSite(crawl)
      setResults(results)
    } catch (error) {
      const status = error.response && error.response.status
      switch (status) {
        case 404:
          setError('Not Found!')
          break
        default:
          setError(error.response)
      }
    }
  }
  const crawlSite = async payload => {
    const res = await axios.post('/search', payload)
    return res.data
  }

  const clear = () => {
    setResults([])
    setCrawl({...crawl, page: 1})
  }

  const prev = () => {
    crawl.page > 1 ? setCrawl({ ...crawl, page: crawl.page - 1 }): null
  }
  const next = () => {
    results.length > 0 ? setCrawl({ ...crawl, page: crawl.page + 1 }): null
  }

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        {error && <div>{error}</div>}
        <br />
        <form onSubmit={handleSubmit}>
          <label>
            URL{' '}
            <input
              type='text'
              name='link'
              placeholder='http://hazardsof.com'
              value={crawl.link}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Levels <input type='number' name='levels' value={crawl.levels} onChange={handleChange} required />
          </label>
          <br />
          <button>Crawl!</button>
        </form>
        <button onClick={clear}>Clear!</button>
        <br />
        <br />
        {results.length > 0 && (
          <div>
            <button onClick={prev}>Prev</button>
            <button onClick={next}>Next</button>
            {results.map((link, index) => (
              <div key={index}>{`${link.name}: ${link.link}`}</div>
            ))}
          </div>
        )}
      </header>
    </div>
  )
}

export default App
