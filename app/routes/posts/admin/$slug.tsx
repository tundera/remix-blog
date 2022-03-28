import type { ActionFunction, LoaderFunction } from "remix";
import {
  Form,
  redirect,
  json,
  useLoaderData,
  useActionData,
  useTransition,
} from "remix";
import invariant from "tiny-invariant";

import type { Post } from "~/models/post.server";
import { getPost, updatePost, deletePost } from "~/models/post.server";

type LoaderData = { post: Post };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, `params.slug is required`);

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  return json<LoaderData>({ post });
};

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request, params }) => {
  // TODO: remove me
  await new Promise((res) => setTimeout(res, 1000));

  invariant(params.slug, `params.slug is required`);

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "update": {
      const title = formData.get("title");
      const slug = formData.get("slug");
      const markdown = formData.get("markdown");

      const errors: ActionData = {
        title: title ? null : "Title is required",
        slug: slug ? null : "Slug is required",
        markdown: markdown ? null : "Markdown is required",
      };

      const hasErrors = Object.values(errors).some(
        (errorMessage) => errorMessage
      );
      if (hasErrors) {
        return json<ActionData>(errors);
      }

      invariant(typeof title === "string", "title must be a string");
      invariant(typeof slug === "string", "slug must be a string");
      invariant(typeof markdown === "string", "markdown must be a string");

      await updatePost(params.slug, { slug, title, markdown });

      return redirect("/posts/admin");
    }
    case "delete": {
      // do your delete
      await deletePost(params.slug);

      return redirect("/posts/admin");
    }
    default: {
      throw new Error("Unexpected action");
    }
  }
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function NewPost() {
  const { post } = useLoaderData() as LoaderData;
  const errors = useActionData();

  const transition = useTransition();
  const isUpdating = Boolean(transition.submission);

  return (
    <div className="flex flex-col space-y-4">
      <Form method="post">
        <p className="text-right">
          <button
            type="submit"
            name="action"
            value="delete"
            className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
            disabled={isUpdating}
          >
            {isUpdating ? "Deleting..." : "Delete Post"}
          </button>
        </p>
      </Form>
      <Form method="post">
        <p>
          <label>
            Post Title:{" "}
            {errors?.title ? (
              <em className="text-red-600">{errors.title}</em>
            ) : null}
            <input
              type="text"
              name="title"
              className={inputClassName}
              defaultValue={post.title}
            />
          </label>
        </p>
        <p>
          <label>
            Post Slug:{" "}
            {errors?.slug ? (
              <em className="text-red-600">{errors.slug}</em>
            ) : null}
            <input
              type="text"
              name="slug"
              className={inputClassName}
              defaultValue={post.slug}
            />
          </label>
        </p>
        <p>
          <label htmlFor="markdown">
            Markdown:{" "}
            {errors?.markdown ? (
              <em className="text-red-600">{errors.markdown}</em>
            ) : null}
          </label>
          <br />
          <textarea
            id="markdown"
            rows={20}
            name="markdown"
            className={`${inputClassName} font-mono`}
            defaultValue={post.markdown}
          />
        </p>
        <p className="text-right">
          <button
            type="submit"
            name="action"
            value="update"
            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Post"}
          </button>
        </p>
      </Form>
    </div>
  );
}
