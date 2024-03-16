import { Button, ButtonGroup } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { useMatch } from "react-router-dom";
import { InternalLink } from "../../components/Link/Link";
import { ROUTE } from "../../routes";
import { NavigationSection } from "./NavigationSection";

export const SiteNavSection = () => (
  <NavigationSection title="Navigatie">
    <ButtonGroup orientation="vertical" alignItems={"start"}>
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
  </NavigationSection>
);

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
