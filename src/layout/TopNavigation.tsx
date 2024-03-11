import {
  Button,
  ButtonGroup,
  Heading,
  HStack,
  Spacer,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { useMatch } from "react-router-dom";
import { InternalLink } from "../components/Link/Link";
import { ROUTE } from "../routes";

export const TopNavigation = () => {
  return (
    <Stack spacing={0} bg="dark" color={"light"} px={5} pt={7}>
      <HStack>
        <InternalLink href={ROUTE.home}>
          <Heading color="light" fontFamily={"Slipstream"} size="4xl" px={3}>
            REN
          </Heading>
        </InternalLink>
        <Spacer />
        <Button
          as={InternalLink}
          href={ROUTE.contact}
          alignSelf={"start"}
          colorScheme={"accent"}
        >
          Contact
        </Button>
      </HStack>
      <ButtonGroup
        colorScheme={"blackAlpha"}
        color="lightish"
        _hover={{ color: "light" }}
        fontSize="xs"
        orientation={useBreakpointValue({ base: "vertical", md: "horizontal" })}
      >
        <NavButton to={ROUTE.home} isActive={!!useMatch(ROUTE.home)}>
          Home
        </NavButton>
        <NavButton to={ROUTE.running} isActive={!!useMatch(ROUTE.running)}>
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
        <NavButton to={ROUTE.services} isActive={!!useMatch(ROUTE.services)}>
          Services
        </NavButton>
        <NavButton to={ROUTE.meer} isActive={!!useMatch(ROUTE.meer)}>
          en zoveel meer
        </NavButton>
      </ButtonGroup>
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
      as={InternalLink}
      href={to}
      px={4}
      py={7}
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
        left: "20px",
        right: "20px",
        height: "3px",
        backgroundColor: "accent.400",
      }}
    >
      {children}
    </Button>
  );
};
