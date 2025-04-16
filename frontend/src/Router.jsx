import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Booking } from "./pages/Booking";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";
import { Layout } from "./pages/Layout";


export const router = createBrowserRouter([
{ path: "/", element: <Layout />, children: [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/booking",
    element: <Booking />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
]
}
]);
