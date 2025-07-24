import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.tsx'
import FillForm from './pages/FillForm.tsx';
import TemplateEditor from './pages/TemplateEditor.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/template/:id" element={<TemplateEditor />} />
        <Route path="/fill/:workflowId/:role" element={<FillForm />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
