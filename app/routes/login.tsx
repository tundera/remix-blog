import { useRef, useEffect } from "react";
import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";
import {
  Form,
  json,
  Link,
  useActionData,
  redirect,
  useSearchParams,
} from "remix";
import {
  Box,
  Flex,
  Button,
  Checkbox,
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

import { Logo } from "~/components/Logo";
import { GitHubIcon } from "~/components/ProviderIcons";
import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { validateEmail } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");
  const remember = formData.get("remember");

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

  const user = await verifyLogin(email, password);

  if (!user) {
    return json<ActionData>(
      { errors: { email: "Invalid email or password" } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/notes",
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/notes";
  const actionData = useActionData() as ActionData;
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
            <Stack spacing="6">
              <Logo />
              <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
                <Heading size={useBreakpointValue({ base: "xs", md: "sm" })}>
                  Log in to your account
                </Heading>
                <Text color="muted">Start making your dreams come true</Text>
              </Stack>
            </Stack>

            <Stack spacing="6">
              <Form method="post">
                <Stack spacing="5" py="4">
                  <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input
                      id="email"
                      placeholder="Enter your email"
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
                  <FormControl>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Input
                      id="password"
                      placeholder="********"
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
                      <FormHelperText>
                        At least 8 characters long
                      </FormHelperText>
                    )}
                  </FormControl>
                </Stack>
                <HStack justify="space-between">
                  <Checkbox defaultIsChecked>Remember me</Checkbox>
                  <Button variant="link" colorScheme="blue" size="sm">
                    Forgot password
                  </Button>
                </HStack>
                <Stack spacing="4">
                  <VisuallyHiddenInput
                    name="redirectTo"
                    defaultValue={redirectTo}
                  />
                  <Button type="submit" variant="solid">
                    Sign in
                  </Button>
                  <Button
                    variant="secondary"
                    leftIcon={<GitHubIcon boxSize="5" />}
                    iconSpacing="3"
                  >
                    Sign in with GitHub
                  </Button>
                </Stack>
              </Form>
            </Stack>
            <HStack spacing="1" justify="center">
              <Text fontSize="sm" color="muted">
                Don't have an account?
              </Text>
              <Button
                as={Link}
                to={{
                  pathname: "/join",
                  search: searchParams.toString(),
                }}
                variant="link"
                colorScheme="blue"
                size="sm"
              >
                Sign up
              </Button>
            </HStack>
          </Stack>
        </Container>
      </Box>
    </Flex>
  );
}
