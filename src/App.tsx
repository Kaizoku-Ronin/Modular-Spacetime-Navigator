import { Routes, Route } from 'react-router'
import { Layout } from './components/Layout'
import { SimulatorPage } from './pages/SimulatorPage'
import LorePage from './pages/LorePage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SimulatorPage />} />
        <Route path="/lore" element={<LorePage />} />
      </Routes>
    </Layout>
  )
}
