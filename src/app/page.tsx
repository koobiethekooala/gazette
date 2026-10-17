import { SnapFeed } from "@/components/SnapFeed";
import { getIssue } from "@/lib/issue";

export default function Home() {
  const issue = getIssue();
  return <SnapFeed issue={issue} />;
}
