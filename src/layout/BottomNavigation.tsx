import {
  Button,
  ButtonGroup,
  Container,
  Heading,
  HStack,
  Spacer,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { FaEnvelope, FaMapPin, FaPhoneAlt } from "react-icons/fa";
import { useMatch } from "react-router-dom";
import { ExternalLink, InternalLink } from "../components/Link/Link";
import { ROUTE } from "../routes";

export const BottomNavigation = () => {
  return (
    <Container bg="dark" maxW="full" color="light">
      <Stack
        divider={<StackDivider opacity={0.2} />}
        p={{ base: 5, sm: 10 }}
        spacing={10}
      >
        <Stack
          w="full"
          spacing={20}
          align="start"
          direction={{ base: "column", md: "row" }}
        >
          <NavigationGroup title="Contact">
            <Stack spacing={4}>
              <Text fontSize="lg" fontWeight={"bold"}>
                Christel Rogiers
              </Text>
              <Text>Geelsebaan 155, 3980 Tessenderlo</Text>
              <Stack>
                <Button
                  as={ExternalLink}
                  leftIcon={<FaMapPin />}
                  href="https://maps.app.goo.gl/ThkeKzGYG85YzZyE9"
                >
                  Routebeschrijving
                </Button>
                <ButtonGroup>
                  <Button
                    as={ExternalLink}
                    leftIcon={<FaEnvelope />}
                    href="mailto:info@rensport.be"
                  >
                    info@rensport.be
                  </Button>
                  <Button leftIcon={<FaPhoneAlt />}> 013 66 74 60</Button>
                </ButtonGroup>
              </Stack>
              <Text>BTW - BE 0463.922.690</Text>
            </Stack>
          </NavigationGroup>
          <NavigationGroup title="Navigatie">
            <ButtonGroup orientation="vertical" alignItems={"start"}>
              <NavButton to={ROUTE.home} isActive={!!useMatch(ROUTE.home)}>
                Home
              </NavButton>
              <NavButton
                to={ROUTE.running}
                isActive={!!useMatch(ROUTE.running)}
              >
                Running
              </NavButton>
              <NavButton
                to={ROUTE.tennisAndPadel}
                isActive={!!useMatch(ROUTE.tennisAndPadel)}
              >
                Tennis & Padel
              </NavButton>
              <NavButton
                to={ROUTE.sportvoeding}
                isActive={!!useMatch(ROUTE.sportvoeding)}
              >
                Sportvoeding
              </NavButton>
              <NavButton
                to={ROUTE.services}
                isActive={!!useMatch(ROUTE.services)}
              >
                Services
              </NavButton>
              <NavButton to={ROUTE.meer} isActive={!!useMatch(ROUTE.meer)}>
                en zoveel meer
              </NavButton>
            </ButtonGroup>
          </NavigationGroup>
        </Stack>

        <HStack w="full" align={"center"}>
          <Stack spacing={0}>
            <Heading size="2xl" fontFamily={"Slipstream"}>
              REN
            </Heading>
            <Text size="sm" color="lightish">
              All-in voor jouw loopcomfort.
            </Text>
          </Stack>
          <Spacer />
          <Button as={InternalLink} href={ROUTE.contact} colorScheme="accent">
            Contact
          </Button>
        </HStack>
      </Stack>
    </Container>
  );
};

const NavigationGroup = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <Stack align="start" spacing={8}>
      <Heading size="lg" textTransform="uppercase" fontWeight={"regular"}>
        {title}
      </Heading>
      {children}
    </Stack>
  );
};
const NavButton = ({
  children,
  isActive,
  to,
}: PropsWithChildren<{ isActive?: boolean; to: string }>) => {
  return (
    <Button
      variant="ghost"
      as={InternalLink}
      href={to}
      p={2}
      isActive={isActive}
      textTransform="uppercase"
      fontSize={"sm"}
      color="lightish"
      fontWeight={"bold"}
      textDecor="none"
      _active={{ color: "light" }}
      _hover={{ color: "light" }}
      _after={{
        content: isActive ? '""' : undefined,
        position: "absolute",
        bottom: "0",
        left: "10px",
        right: "20px",
        height: "3px",
        backgroundColor: "accent.400",
      }}
    >
      {children}
    </Button>
  );
};
