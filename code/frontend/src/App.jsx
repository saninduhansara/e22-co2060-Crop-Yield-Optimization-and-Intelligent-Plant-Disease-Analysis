
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminPage from './pages/adminPage'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <BrowserRouter>
      <div className='w-full h-screen flex justify-center items-center '>
        <Toaster position='top-right' />
        <Routes path="/">

          <Route path="/admin/*" element={<AdminPage/>}/>

        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
