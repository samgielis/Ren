import {
  AspectRatio,
  Box,
  Button,
  Card,
  Container,
  GridItem,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { format } from "date-fns/format";
import { nlBE } from "date-fns/locale";
import { setDefaultOptions } from "date-fns/setDefaultOptions";
import { useEffect, useState } from "react";
import { FaExternalLinkAlt, FaFacebook } from "react-icons/fa";
import { ExternalLink } from "../../components/Link/Link";

type NewsFeedPost = {
  full_picture: string;
  is_hidden: boolean;
  is_published: boolean;
  permalink_url: string;
  from: {
    name: string;
    id: string;
  };
  created_time: string;
  id: string;
  message: string;
};
type NewsFeed = {
  data: NewsFeedPost[];
};
export const Newsfeed = () => {
  const [data, setData] = useState<NewsFeed>({ data: [] });

  useEffect(() => {
    fetch("https://ren-fb-proxy.netlify.app/.netlify/functions/news")
      .then((response) => response.json())
      .then(setData);
  }, []);

  return (
    <Container
      maxW={"full"}
      bgColor="accent.100"
      py={10}
      px={{ base: 4, sm: 10 }}
    >
      <Stack spacing={10}>
        <HStack>
          <Heading
            size="md"
            bg="dark"
            p={3}
            color="light"
            display={"inline-block"}
            fontWeight="normal"
          >
            Updates
          </Heading>
          <Spacer />
          <Button
            as={ExternalLink}
            href="https://www.facebook.com/rentessenderlo"
            colorScheme={"accent"}
            size="lg"
            rightIcon={<FaFacebook />}
          >
            Volg ons op Facebook
          </Button>
        </HStack>
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3, "2xl": 4 }}
          columnGap={5}
          rowGap={5}
          alignItems="stretch"
        >
          {data.data
            .filter((p) => !!p.message)
            .slice(0, 6)
            .map((post) => (
              <GridItem key={post.id} w="full" h="full">
                <NewsFeedPostCard post={post} />
              </GridItem>
            ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

const NewsFeedPostCard = ({ post }: { post: NewsFeedPost }) => {
  setDefaultOptions({ locale: nlBE });

  return (
    <Card p={5} h="full" bgSize="cover">
      <Stack
        h="full"
        spacing={2}
        align="stretch"
        dir={useBreakpointValue({ base: "column", md: "row" })}
      >
        <Stack spacing={4} flex={1}>
          <HStack>
            <Heading size="md" color="accent.500">
              {format(new Date(post.created_time), "PPP")}
            </Heading>
            <Spacer />
            <Button
              size="sm"
              variant="ghost"
              as={ExternalLink}
              href={post.permalink_url}
              colorScheme="accent"
              rightIcon={<FaExternalLinkAlt />}
            >
              bekijk post
            </Button>
          </HStack>
          <Text>{post.message}</Text>
        </Stack>
        <Spacer />
        <AlwaysSquareImage src={post.full_picture} />
      </Stack>
    </Card>
  );
};

const AlwaysSquareImage = ({ src }: { src: string }) => {
  return (
    <Box bg="accent.100" borderRadius={"lg"} overflow="hidden">
      <AspectRatio ratio={1 / 1}>
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
      </AspectRatio>
    </Box>
  );
};
