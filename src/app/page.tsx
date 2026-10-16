import { Newspaper } from "@/components/Newspaper";
import { getIssue } from "@/lib/issue";

export default function Home() {
  const issue = getIssue();
  return <Newspaper issue={issue} />;
}
