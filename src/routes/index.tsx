import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Create account - Nova" },
      {
        name: "description",
        content: "Create your Nova account to access the crypto investment platform.",
      },
    ],
  }),
  component: () => <Navigate to="/login" replace />,
});
