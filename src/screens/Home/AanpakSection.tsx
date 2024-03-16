import { Box, Card, Heading, HStack, Stack, Tag, Text } from "@chakra-ui/react";
import { Section } from "../../components/Section";
import { SectionHeading } from "../../components/SectionHeading";
import { SquareImage } from "../../components/SquareImage";

export const AanpakSection = () => {
  return (
    <Section bg="accent.200">
      <Stack spacing={10}>
        <Stack spacing={5}>
          <Box>
            <SectionHeading>Onze aanpak</SectionHeading>
          </Box>
          <Heading
            fontSize="7xl"
            color="light"
            bg="accent.200"
            display={"inline"}
            fontWeight="bold"
          >
            <h1 id="aanpak">Een schoen voor jouw loopprofiel</h1>
          </Heading>
        </Stack>
        <HStack spacing={10} align="stretch">
          <Card w="full" overflow={"hidden"}>
            <Stack>
              <SquareImage src="https://pmcphysiotherapy.ie/wp-content/uploads/2021/11/phits_insoles_gait_analysis.jpg" />
              <Stack spacing={4} p={5}>
                <Box>
                  <Tag size={"lg"} bg="blue.500" color="light">
                    Footscan
                  </Tag>
                </Box>
                <Text fontSize="lg">
                  Met een geavanceerde <b>Footscan</b> maken we een
                  professionele analyse van je looppatroon. Daarna helpen onze
                  medewerkers je persoonlijk bij het vinden van de perfecte
                  schoen <b>voor jouw voet</b>.
                </Text>
              </Stack>
            </Stack>
          </Card>
          <Card w="full" overflow={"hidden"}>
            <Stack>
              <SquareImage src="https://www.pedimarkt.nl/Files/6/91000/91883/FileBrowser/img/opmaatgemaaktezolen.jpg" />
              <Stack spacing={4} p={5}>
                <Box>
                  <Tag size={"lg"} bg="teal.500" color="light">
                    In-house Podoloog
                  </Tag>
                </Box>
                <Text fontSize={"lg"}>
                  Heb je behoefte aan een oplossing op maat? Onze{" "}
                  <b>in-house podoloog</b> identificeert problemen en biedt op
                  maat gemaakte oplossingen, zoals handgemaakte{" "}
                  <b>steunzolen</b>.
                </Text>
              </Stack>
            </Stack>
          </Card>
          <Card w="full" overflow={"hidden"}>
            <Stack>
              <SquareImage src="https://stoxenergy.com/cdn/shop/files/PLP_Running_Grid2_SS24_Desktop.jpg?v=1709288157&width=2560" />
              <Stack p={5} spacing={4}>
                <Box>
                  <Tag size={"lg"} bg="pink.500" color="light">
                    De juiste sok
                  </Tag>
                </Box>
                <Text fontSize={"lg"}>
                  De juiste sokken bieden extra <b>comfort en ondersteuning</b>,
                  voorkomen blessures en verbeteren je prestaties. We verkopen
                  ook <b>compressiesokken</b> die de bloedcirculatie verbeteren
                  en vermoeide spieren tegengaan.
                </Text>
              </Stack>
            </Stack>
          </Card>
        </HStack>
      </Stack>
    </Section>
  );
};
