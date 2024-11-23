import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // or './main.css'
import App from "./App";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import Store from "./components/redux/Store"
import { PersistGate } from "redux-persist/integration/react";
import persistStore from "redux-persist/es/persistStore";

let persistor = persistStore(Store)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={Store}>
      <PersistGate loading={null} persistor={persistor}>
      <App />
      <Toaster />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
