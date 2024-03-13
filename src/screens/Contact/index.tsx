import { AspectRatio, chakra, Container, Stack } from "@chakra-ui/react";
import { SectionHeading } from "../../components/SectionHeading";

export const Contact = () => {
  return (
    <Container maxW={"full"} p={{ base: 4, sm: 10 }}>
      <Stack alignItems="start" w="full">
        <SectionHeading>Locatie</SectionHeading>
        <AspectRatio ratio={{ base: 1 / 1, sm: 16 / 9, md: 16 / 7 }} w="full">
          <chakra.iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2506.651719560959!2d5.074344077276721!3d51.07797897171884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c137f2f5838627%3A0xbd567da8a55b85a6!2sRen%20Sport!5e0!3m2!1sen!2sbe!4v1710353109499!5m2!1sen!2sbe"
            width="full"
            height="full"
            border={"none"}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></chakra.iframe>
        </AspectRatio>
      </Stack>
    </Container>
  );
};
