import { Container, ContainerProps } from "@chakra-ui/react";

export const Section = (props: ContainerProps) => {
  return (
    <Container
      maxW={"full"}
      py={{ base: 10, sm: 40 }}
      px={{ base: 4, sm: 20 }}
      {...props}
    />
  );
};
