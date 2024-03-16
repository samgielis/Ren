import {
  Button,
  Card,
  GridItem,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
  SkeletonText,
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
import { Section } from "../../components/Section";
import { SectionHeading } from "../../components/SectionHeading";
import { SquareImage } from "../../components/SquareImage";

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
  data: NewsFeedPost[] | undefined;
};
export const Newsfeed = () => {
  const [data, setData] = useState<NewsFeed>({ data: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("https://ren-fb-proxy.netlify.app/.netlify/functions/news")
      .then((response) => response.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Section bgColor="accent.100">
      <Stack spacing={10}>
        <HStack>
          <SectionHeading>Updates</SectionHeading>
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
          {isLoading ? (
            <NewsFeedItemSkeleton />
          ) : (
            <NewsFeedItems posts={data.data ?? []} />
          )}
        </SimpleGrid>
      </Stack>
    </Section>
  );
};

const NewsFeedItemSkeleton = () => {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((id) => (
        <GridItem key={id} w="full" h="full">
          <NewsFeedPostCardLayout asSkeleton />
        </GridItem>
      ))}
    </>
  );
};

const NewsFeedItems = ({ posts }: { posts: NewsFeedPost[] }) => {
  return (
    <>
      {posts
        .filter((p) => !!p.message)
        .slice(0, 6)
        .map((post) => (
          <GridItem key={post.id} w="full" h="full">
            <NewsFeedPostCard post={post} />
          </GridItem>
        ))}
    </>
  );
};

const NewsFeedPostCard = ({ post }: { post: NewsFeedPost }) => {
  setDefaultOptions({ locale: nlBE });

  return (
    <NewsFeedPostCardLayout
      message={post.message}
      imgUrl={post.full_picture}
      permaLink={post.permalink_url}
      dateString={format(new Date(post.created_time), "PPP")}
    />
  );
};

const NewsFeedPostCardLayout = ({
  dateString,
  permaLink,
  message,
  imgUrl,
  asSkeleton,
}: {
  dateString?: string;
  permaLink?: string;
  message?: string;
  imgUrl?: string;
  asSkeleton?: boolean;
}) => {
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
              <SkeletonText isLoaded={!asSkeleton} noOfLines={1}>
                {dateString}
              </SkeletonText>
            </Heading>
            <Spacer />
            <Button
              size="sm"
              variant="ghost"
              as={ExternalLink}
              href={permaLink}
              colorScheme="accent"
              rightIcon={<FaExternalLinkAlt />}
            >
              bekijk post
            </Button>
          </HStack>
          <Text>
            <SkeletonText
              isLoaded={!asSkeleton}
              noOfLines={Math.floor(Math.random() * 5) + 2}
            >
              {message}
            </SkeletonText>
          </Text>
        </Stack>
        <Spacer />
        <Skeleton isLoaded={!asSkeleton} borderRadius="md">
          <SquareImage borderRadius={"lg"} src={imgUrl ?? ""} />
        </Skeleton>
      </Stack>
    </Card>
  );
};
