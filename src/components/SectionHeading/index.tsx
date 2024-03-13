import { Heading as ChakraHeading, HeadingProps } from "@chakra-ui/react";

export const SectionHeading = (props: HeadingProps) => {
  return (
    <ChakraHeading
      size="md"
      bg="dark"
      p={3}
      color="light"
      display={"inline-block"}
      fontWeight="600"
      {...props}
    />
  );
};
