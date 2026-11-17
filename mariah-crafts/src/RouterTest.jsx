
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'

export default function RouterTest() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Link to="/admin-test">Test Admin Route</Link>}
        />
        <Route
          path="/admin-test"
          element={<h1>Admin Router Works! 💗</h1>}
        />
      </Routes>
    </BrowserRouter>
  )
}
