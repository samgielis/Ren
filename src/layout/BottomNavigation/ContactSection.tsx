import { Button, ButtonGroup, Stack, Text } from "@chakra-ui/react";
import { FaEnvelope, FaMapPin, FaPhoneAlt } from "react-icons/fa";
import { ExternalLink } from "../../components/Link/Link";
import { NavigationSection } from "./NavigationSection";

export const ContactSection = () => (
  <NavigationSection title="Contact">
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
  </NavigationSection>
);
