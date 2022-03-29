import { extendTheme } from "@chakra-ui/react";
import { theme as baseTheme } from "@chakra-ui/pro-theme";

import { withProse } from "@nikolovlazar/chakra-ui-prose";

const overrides = {};

export const theme = extendTheme(baseTheme, overrides, withProse());
