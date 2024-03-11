import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { ROUTE } from "./routes";
import { Home } from "./screens/Home";

export const App = () => (
  <ChakraProvider
    theme={extendTheme({
      colors: {
        dark: "#030303",
        light: "#fff",
        lightish: "#fff9",
        accent: {
          "50": "#f2f7f9",
          "100": "#dee9ef",
          "200": "#c1d5e0",
          "300": "#96b7ca",
          "400": "#6c96b1",
          "500": "#487492",
          "600": "#3f607b",
          "700": "#385066",
          "800": "#344556",
          "900": "#2f3c4a",
          "950": "#1b2531",
        },
      },
      fonts: {
        body: `'Open Sans', sans-serif`,
        heading: `'Open Sans', sans-serif`,
      },
      components: {
        Button: {
          sizes: {
            lg: {
              borderRadius: "none",
            },
            md: {
              borderRadius: "none",
            },
          },
        },
      },
    })}
  >
    {" "}
    <RouterProvider router={router} />
  </ChakraProvider>
);

const router = createBrowserRouter([
  {
    path: ROUTE.home,
    element: <Home />,
  },
  {
    path: ROUTE.running,
    element: <Home />,
  },
  {
    path: ROUTE.tennisAndPadel,
    element: <Home />,
  },
  {
    path: ROUTE.sportvoeding,
    element: <Home />,
  },
  {
    path: ROUTE.meer,
    element: <Home />,
  },
  {
    path: ROUTE.services,
    element: <Home />,
  },
  {
    path: ROUTE.contact,
    element: <Home />,
  },
]);
