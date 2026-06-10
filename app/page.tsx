import { AuthProvider } from "@/components/AuthProvider";
import { BookStudio } from "@/components/BookStudio";

export default function Home() {
  return <AuthProvider><BookStudio /></AuthProvider>;
}
