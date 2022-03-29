import { theme as baseTheme } from "@chakra-ui/pro-theme";
import { extendTheme } from "@chakra-ui/react";

const overrides = {};

export const theme = extendTheme(baseTheme, overrides);
