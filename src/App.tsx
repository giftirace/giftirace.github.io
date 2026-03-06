import{HashRouter,Routes,Route} from 'react-router-dom'
import './App.css'
import Home from './pages/HomePage'
import Layout from './components/Layout'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import FunnyPage from './pages/FunnyPage'
import GardenPage from './pages/GardenPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='/articles' element={<Articles />} />
          <Route path='/articles/:slug' element={<ArticleDetail />}/>
          <Route path='/funny' element={<FunnyPage />} />
          <Route path='/garden' element={<GardenPage />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
