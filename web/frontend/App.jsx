import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes";

import {
  QueryProvider,
  PolarisProvider,
  ToastProvider,
  Layout,
} from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
          <Layout>
            <ToastProvider>
              <Routes pages={pages} />
            </ToastProvider>
          </Layout>
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
