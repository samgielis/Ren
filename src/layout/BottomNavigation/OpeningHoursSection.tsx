import { Table, TableContainer, Tbody, Td, Tr } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { NavigationSection } from "./NavigationSection";

type Day = { name: string; key: string };
const weekdays: Day[] = [
  { name: "Maandag", key: "mon_" },
  { name: "Dinsdag", key: "tue_" },
  { name: "Woensdag", key: "wed_" },
  { name: "Donderdag", key: "thu_" },
  { name: "Vrijdag", key: "fri_" },
  { name: "Zaterdag", key: "sat_" },
  { name: "Zondag", key: "sun_" },
];

function getOpeningHoursString(
  day: Day,
  hours: OpeningHours
): string | undefined {
  const hoursOnDayKeys = Object.keys(hours.hours).filter((key) =>
    key.startsWith(day.key)
  );

  if (!hoursOnDayKeys?.length) return undefined;

  const firstPartOfDayKeys = hoursOnDayKeys.filter((key) =>
    key.includes("_1_")
  );
  const secondPartOfDayKeys = hoursOnDayKeys.filter((key) =>
    key.includes("_2_")
  );

  if (!secondPartOfDayKeys.length) {
    return `${hours.hours[firstPartOfDayKeys[0]]} - ${
      hours.hours[firstPartOfDayKeys[1]]
    }`;
  }
  return `${hours.hours[firstPartOfDayKeys[0]]} - ${
    hours.hours[firstPartOfDayKeys[1]]
  }, ${hours.hours[secondPartOfDayKeys[0]]} - ${
    hours.hours[secondPartOfDayKeys[1]]
  }`;
}

type OpeningHours = {
  hours: { [key: string]: string };
};
export const OpeningHoursSection = () => {
  const [hours, setHours] = useState<OpeningHours>({ hours: {} });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    fetch("https://ren-fb-proxy.netlify.app/.netlify/functions/hours")
      .then((response) => response.json())
      .then(setHours)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <NavigationSection title="Openingsuren">
      <TableContainer>
        <Table
          variant="simple"
          colorScheme={"accent"}
          borderColor="lightish"
          size="md"
        >
          <Tbody>
            {weekdays.map((day) => {
              const hoursOnDay = getOpeningHoursString(day, hours);
              return (
                <Tr key={day.key} color={!!hoursOnDay ? "light" : "lightish"}>
                  <Td pl={0} py={3} borderColor="gray.900" fontWeight={"bold"}>
                    {day.name}
                  </Td>
                  <Td py={3} borderColor="gray.900">
                    {hoursOnDay ?? "Gesloten"}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </NavigationSection>
  );
};
