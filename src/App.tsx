import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { MainLayout } from "./layout/MainLayout";
import { ROUTE } from "./routes";
import { Contact } from "./screens/Contact";
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
        Heading: {
          sizes: {
            md: {
              fontWeight: "regular",
            },
            lg: {
              fontWeight: "regular",
            },
            xl: {
              fontWeight: "regular",
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
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
  },
  {
    path: ROUTE.running,
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
  },
  {
    path: ROUTE.tennisAndPadel,
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
  },
  {
    path: ROUTE.sportvoeding,
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
  },
  {
    path: ROUTE.meer,
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
  },
  {
    path: ROUTE.services,
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
  },
  {
    path: ROUTE.contact,
    element: (
      <MainLayout>
        <Contact />
      </MainLayout>
    ),
  },
]);
