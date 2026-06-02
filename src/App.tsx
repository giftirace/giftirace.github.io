import { HashRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import ArticleDetail from "./pages/ArticleDetail";
import Articles from "./pages/Articles";
import FunnyPage from "./pages/FunnyPage";
import GardenPage from "./pages/GardenPage";
import Home from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import WritePage from "./pages/WritePage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/funny" element={<FunnyPage />} />
          <Route path="/garden" element={<GardenPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
