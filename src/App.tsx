import React from 'react';
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./assets/styles/index.css";
import { useAlert } from "./components/Alert";
import BasedTemplate from "./components/BasedTemplate";
import EditTest from "./components/EditTest/EditTest";
import Navbar from "./components/Navbar";
import NewTest from "./components/NewTest";
import useNetworkState from "./hooks/useNetworkState";
import useThemeState from "./hooks/useThemeState";
import PendingTests from "./pages/PendingTests";
import Appearance from "./pages/Settings/Appearance";
import ArchivedTests from "./pages/Settings/ArchivedTests";
import Branches from "./pages/Settings/Branches";
import MailRecipients from "./pages/Settings/MailRecipients";
import Presets from "./pages/Settings/Presets";
import Products from "./pages/Settings/Products";
import Sidebar from "./pages/Settings/Sidebar";
import Templates from "./pages/Settings/Templates";
import Users from "./pages/Settings/Users";
import Validation from "./pages/Validation";
import CompletedTests from "./pages/CompletedTests";

function App() {
  const { currentTheme } = useThemeState();
  const { subscribe } = useNetworkState();
  const { addAlert } = useAlert();
  const html = document.querySelector("html");
  if (html) {
    html.setAttribute("data-theme", currentTheme);
  }

  useEffect(() => {
    if (!subscribe) {
      return;
    }
    const callback = (event: Event) => {
      const time = new Date().toLocaleTimeString();
      addAlert({
        id: time,
        position: "top-center",
        duration: 1200,
        title: "Network status changed",
        message: `${time}: Check your connection: You're now ${event.type === "online" ? "online" : "offline"}`,
      });
    };

    const cleanup = subscribe(callback);

    return () => {
      cleanup();
    };
  }, [subscribe]);

  return (
    <div className=" page-responsive">
      <Navbar />
      <div className="application-main">
        <Routes>
          <Route path="/" element={<Navigate to={"/tests/pending"} replace />} />
          <Route path="tests">
            <Route index element={<Navigate to={"pending"} />} />
            <Route path="new-test" element={<NewTest />} />
            <Route path="new-test/:testId" element={<NewTest template={true} previousPage={true} />} />
            <Route path=":id" element={<EditTest />} />
            <Route path="pending" element={<PendingTests />} />
            <Route path="completed" element={<CompletedTests />} />
            <Route path="validated-releases" element={<Validation />} />
          </Route>
          <Route path="settings" element={<Sidebar />}>
            <Route index element={<Navigate to={"appearance"} replace />} />
            <Route path="appearance" element={<Appearance />} />
            <Route path="templates" element={<Templates />} />
            <Route path="templates/based/:testId" element={<BasedTemplate />} />
            <Route path="users" element={<Users />} />
            <Route path="branches" element={<Branches />} />
            <Route path="mail-recipients" element={<MailRecipients />} />
            <Route path="products" element={<Products />} />
            <Route path="presets" element={<Presets />} />
            <Route path="archived" element={<ArchivedTests />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
