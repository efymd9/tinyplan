import { redirect } from "next/navigation";

export default function AuthRequestPage() {
  redirect("/auth/login");
}
