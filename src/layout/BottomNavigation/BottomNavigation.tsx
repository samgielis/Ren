import {
  Button,
  Container,
  Heading,
  HStack,
  Spacer,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { InternalLink } from "../../components/Link/Link";
import { ROUTE } from "../../routes";
import { ContactSection } from "./ContactSection";
import { SiteNavSection } from "./SiteNavSection";

export const BottomNavigation = () => {
  return (
    <Container bg="dark" maxW="full" color="light" px={{ base: 4, sm: 10 }}>
      <Stack
        divider={<StackDivider opacity={0.2} />}
        py={{ base: 5, sm: 10 }}
        spacing={10}
      >
        <Stack
          w="full"
          spacing={20}
          align="start"
          direction={{ base: "column", md: "row" }}
        >
          <ContactSection />
          <SiteNavSection />
        </Stack>

        <BrandFooter />
      </Stack>
    </Container>
  );
};

const BrandFooter = () => (
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
);
