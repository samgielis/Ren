import { Box, Button, ButtonGroup, Heading, Stack } from "@chakra-ui/react";
import { FaArrowRight } from "react-icons/fa";
import { MainLayout } from "../../layout/MainLayout";
import { Newsfeed } from "./Newsfeed";

export const Home = () => {
  return (
    <MainLayout>
      <Stack spacing={0}>
        <Box
          bgImage={"/img/beachrun.jpg"}
          pos="relative"
          w="full"
          aspectRatio={16 / 7}
          backgroundSize="cover"
        >
          <Stack pos="absolute" top={"40%"} left={10} spacing={4}>
            <Heading
              bg="dark"
              p={4}
              fontWeight="regular"
              size="2xl"
              color="light"
            >
              All-in voor jouw loopcomfort
            </Heading>
            <ButtonGroup size="lg" spacing={4}>
              <Button>Kom langs in de winkel</Button>
              <Button colorScheme="accent" rightIcon={<FaArrowRight />}>
                Onze aanpak
              </Button>
            </ButtonGroup>
          </Stack>
        </Box>
        <Newsfeed />
      </Stack>
    </MainLayout>
  );
};
