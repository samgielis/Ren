import { Heading, Stack } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

export const NavigationSection = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <Stack align="start" spacing={8}>
      <Heading
        size="lg"
        textTransform="uppercase"
        fontWeight={"regular"}
        borderBottom="3px solid"
        pb={2}
        borderColor={"accent.300"}
      >
        {title}
      </Heading>
      {children}
    </Stack>
  );
};
