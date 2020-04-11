import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [crawl, setCrawl] = useState({
    link: '',
    levels: 0,
  })
  const [results, setResults] = useState([])
  const [error, setError] = useState()

  const handleChange = e => {
    setCrawl({ ...crawl, [e.target.name]: e.target.name === 'levels' ? parseInt(e.target.value) : e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
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
    const res = await axios.post('http://localhost:4000/search', payload)
    return res.data
  }
  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        {error && <div>{error}</div>}
        {results.length >0 && results.map(link => <div>{`${link.name}: ${link.link}`}</div>)}
        <br />
        <form onSubmit={handleSubmit}>
          <label>
            URL{' '}
            <input
              type='text'
              name='link'
              placeholder='http://xxx'
              value={crawl.link}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Levels <input type='number' name='levels' value={crawl.levels} onChange={handleChange} required />
          </label>
          <button>Crawl!</button>
        </form>
      </header>
    </div>
  )
}

export default App
