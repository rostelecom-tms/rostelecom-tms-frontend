import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter} from "react-router";
import {ConfigProvider} from "antd";
import ruRu from "antd/locale/ru_RU";
import {App} from "./App.tsx";
import {init} from "./init.ts";

init()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <ConfigProvider
              locale={ruRu}
              theme={{
                  token: {
                      colorPrimary: '#1677ff',
                      borderRadius: 8,
                  },
              }}
          >
              <App />
          </ConfigProvider>
      </BrowserRouter>
  </StrictMode>,
)
