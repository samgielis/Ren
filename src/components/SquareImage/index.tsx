import { AspectRatio, Box, BoxProps, Image } from "@chakra-ui/react";

export const SquareImage = ({
  src,
  borderRadius,
}: {
  src: string;
  borderRadius?: BoxProps["borderRadius"];
}) => {
  return (
    <Box bg="accent.100" overflow="hidden" borderRadius={borderRadius}>
      <AspectRatio ratio={1 / 1}>
        <>
          {src && (
            <Box pos="relative">
              <Image
                pos="absolute"
                src={src}
                w="full"
                h="full"
                filter="blur(10px)"
                objectFit={"cover"}
                opacity={0.5}
              />
              <Image
                pos="absolute"
                zIndex={2}
                objectFit={"contain"}
                src={src}
                w="full"
                h="full"
              />
            </Box>
          )}
        </>
      </AspectRatio>
    </Box>
  );
};
