import * as React from "react";
import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";
import {
  Form,
  Link,
  redirect,
  useSearchParams,
  json,
  useActionData,
} from "remix";
import {
  Box,
  Flex,
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  useBreakpointValue,
  VisuallyHiddenInput,
} from "@chakra-ui/react";

import { createUser, getUserByEmail } from "~/models/user.server";
import { Logo } from "~/components/Logo";
import { GitHubIcon } from "~/components/ProviderIcons";
import { createUserSession, getUserId } from "~/session.server";
import { validateEmail } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

interface ActionData {
  errors: {
    email?: string;
    password?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }

  if (typeof password !== "string") {
    return json<ActionData>(
      { errors: { password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json<ActionData>(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json<ActionData>(
      { errors: { email: "A user already exists with this email" } },
      { status: 400 }
    );
  }

  const user = await createUser(email, password);

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Flex
      direction="column"
      minHeight="100vh"
      width="full"
      justify="center"
      bgGradient={{ sm: "linear(to-r, blue.600, purple.600)" }}
      py={{ base: "12", md: "24" }}
    >
      <Box>
        <Container
          maxW="md"
          py={{ base: "0", sm: "8" }}
          px={{ base: "4", sm: "10" }}
          bg={useBreakpointValue({ base: "transparent", sm: "bg-surface" })}
          boxShadow={{ base: "none", sm: "xl" }}
          borderRadius={{ base: "none", sm: "xl" }}
        >
          <Stack spacing="8">
            <Stack spacing="6" align="center">
              <Logo />
              <Stack spacing="3" textAlign="center">
                <Heading size={useBreakpointValue({ base: "xs", md: "sm" })}>
                  Create an account
                </Heading>
                <Text color="muted">Start making your dreams come true</Text>
              </Stack>
            </Stack>

            <Stack spacing="6">
              <Form method="post">
                <Stack spacing="5">
                  <FormControl isRequired>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input
                      id="email"
                      ref={emailRef}
                      autoFocus={true}
                      name="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={
                        actionData?.errors?.email ? true : undefined
                      }
                      aria-describedby="email-error"
                    />
                    {actionData?.errors?.email ? (
                      <FormErrorMessage id="email-error" pt="1" color="red.700">
                        {actionData.errors.email}
                      </FormErrorMessage>
                    ) : (
                      <FormHelperText>Email address required</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Input
                      id="password"
                      ref={passwordRef}
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      aria-invalid={
                        actionData?.errors?.password ? true : undefined
                      }
                      aria-describedby="password-error"
                    />
                    {actionData?.errors?.password ? (
                      <FormErrorMessage
                        id="password-error"
                        pt="1"
                        color="red.700"
                      >
                        {actionData.errors.password}
                      </FormErrorMessage>
                    ) : (
                      <FormHelperText color="muted">
                        At least 8 characters long
                      </FormHelperText>
                    )}
                  </FormControl>
                </Stack>
                <Stack spacing="4">
                  <VisuallyHiddenInput
                    name="redirectTo"
                    defaultValue={redirectTo}
                  />
                  <Button type="submit" variant="solid">
                    Create account
                  </Button>
                  <Button
                    variant="secondary"
                    leftIcon={<GitHubIcon boxSize="5" />}
                    iconSpacing="3"
                  >
                    Sign up with GitHub
                  </Button>
                </Stack>
              </Form>
            </Stack>

            <HStack justify="center" spacing="1">
              <Text fontSize="sm" color="muted">
                Already have an account?
              </Text>
              <Button
                as={Link}
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
                variant="link"
                colorScheme="blue"
                size="sm"
              >
                Log in
              </Button>
            </HStack>
          </Stack>
        </Container>
      </Box>
    </Flex>
  );
}
