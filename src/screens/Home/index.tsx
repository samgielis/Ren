import { Box, Button, ButtonGroup, Heading, Stack } from "@chakra-ui/react";
import { FaArrowRight } from "react-icons/fa";
import { InternalLink } from "../../components/Link/Link";
import { ROUTE } from "../../routes";
import { AanpakSection } from "./AanpakSection";
import { Newsfeed } from "./Newsfeed";

export const Home = () => {
  return (
    <Stack spacing={0}>
      <Box
        bgImage={"/img/beachrun.jpg"}
        pos="relative"
        w="full"
        aspectRatio={32 / 15}
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
            <Button as={InternalLink} href={ROUTE.contact}>
              Kom langs in de winkel
            </Button>
            <Button
              colorScheme="accent"
              as={InternalLink}
              href="#aanpak"
              rightIcon={<FaArrowRight />}
            >
              Onze aanpak
            </Button>
          </ButtonGroup>
        </Stack>
      </Box>
      <AanpakSection />
      <Newsfeed />
    </Stack>
  );
};
