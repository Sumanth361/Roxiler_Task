import { useState } from 'react'
import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import New from './Components/New'
import TransactionsTable from './Components/TransactionsTable'



function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/main' element={<New/>}></Route>
        <Route path='/transaction' element={<TransactionsTable/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
