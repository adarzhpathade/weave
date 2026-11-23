import { redirect } from "next/navigation";

// Until the Home screen exists, the root sends everyone to the login page.
export default function RootPage() {
  redirect("/login");
}
