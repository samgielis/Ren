import {
  Box,
  ChakraProvider,
  Code,
  extendTheme,
  Grid,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import "./index.css";
import { MainLayout } from "./layout/MainLayout";
import { Logo } from "./Logo";
import { ROUTE } from "./routes";

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
      },
    })}
  >
    {" "}
    <RouterProvider router={router} />
  </ChakraProvider>
);

const Home = () => {
  return (
    <MainLayout>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            <Logo h="40vmin" pointerEvents="none" />
            <Text>
              Edit <Code fontSize="xl">src/App.tsx</Code> and save to reload.
            </Text>
            <Link
              color="teal.500"
              href="https://chakra-ui.com"
              fontSize="2xl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn Chakra
            </Link>
          </VStack>
        </Grid>
      </Box>
    </MainLayout>
  );
};

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
