import { Stack } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { TopNavigation } from "./TopNavigation";

export const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Stack spacing={0}>
        <TopNavigation />
        {children}
      </Stack>
    </>
  );
};
