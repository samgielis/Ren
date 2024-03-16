import { Heading, Stack } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

export const NavigationSection = ({
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
