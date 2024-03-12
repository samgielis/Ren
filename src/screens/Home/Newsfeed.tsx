import {
  Box,
  Button,
  Card,
  Center,
  GridItem,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { format } from "date-fns/format";
import { nlBE } from "date-fns/locale";
import { setDefaultOptions } from "date-fns/setDefaultOptions";
import { useEffect, useState } from "react";
import { FaFacebook } from "react-icons/fa";
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
    <Stack bgColor="accent.100" p={10} spacing={10}>
      <Box>
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
      </Box>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 2, "2xl": 3 }}
        columnGap={10}
        rowGap={10}
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
      <Center>
        <Button
          as={ExternalLink}
          href="https://www.facebook.com/rentessenderlo"
          colorScheme={"accent"}
          size="lg"
          rightIcon={<FaFacebook />}
        >
          Volg ons op Facebook
        </Button>
      </Center>
    </Stack>
  );
};

const NewsFeedPostCard = ({ post }: { post: NewsFeedPost }) => {
  setDefaultOptions({ locale: nlBE });

  return (
    <Card p={6} h="full" bgSize="cover">
      <Stack
        spacing={6}
        align="stretch"
        dir={useBreakpointValue({ base: "column", md: "row" })}
      >
        <Stack spacing={6} flex={1}>
          <Heading size="md" color="accent.500">
            {format(new Date(post.created_time), "PPP")}
          </Heading>
          <Text>{post.message}</Text>
        </Stack>
        {post.full_picture && (
          <Image
            borderRadius={"lg"}
            w={useBreakpointValue({ base: "100%", md: "100%" })}
            src={post.full_picture}
            objectFit={"contain"}
          />
        )}
      </Stack>
    </Card>
  );
};
