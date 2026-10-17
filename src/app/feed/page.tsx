import { redirect } from "next/navigation";

/** Legacy route — feed is now the home page. */
export default function FeedRedirect() {
  redirect("/");
}
