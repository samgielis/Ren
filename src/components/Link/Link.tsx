import {
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
} from "@chakra-ui/react";
import { forwardRef } from "react";
import { Link as RRLink } from "react-router-dom";

export const InternalLink = forwardRef((props: ChakraLinkProps, ref) => (
  <ChakraLink
    as={RRLink}
    {...props}
    to={props.href}
    ref={ref}
    _hover={{ textDecor: "none" }}
  />
));

export const ExternalLink = forwardRef((props: ChakraLinkProps, ref) => (
  <ChakraLink {...props} ref={ref} _hover={{ textDecor: "none" }} />
));
