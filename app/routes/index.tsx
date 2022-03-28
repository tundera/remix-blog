import { Link } from "remix";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <div className="mx-auto mt-16 max-w-7xl text-center">
      <Link to="/posts" className="text-xl text-blue-600 underline">
        Blog Posts
      </Link>
    </div>
  );
}
