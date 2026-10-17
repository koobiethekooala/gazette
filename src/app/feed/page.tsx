import { SnapFeed } from "@/components/SnapFeed";
import { getIssue } from "@/lib/issue";

export default function FeedPage() {
  const issue = getIssue();
  return <SnapFeed issue={issue} />;
}
