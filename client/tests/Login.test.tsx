import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, test, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "../src/pages/Login";
import { AuthProvider } from "../src/contexts/AuthContext";
import api from "../src/api/axios";

vi.mock("../src/api/axios");

test("shows error on failed login", async () => {
  (api.post as any).mockRejectedValueOnce(new Error("401"));
  
  render(
    <AuthProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthProvider>
  );
  
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText("Email"), "bad@test.com");
  await user.type(screen.getByPlaceholderText("Password"), "wrong");
  await user.click(screen.getByRole("button", { name: /login/i }));
  
  await waitFor(() => {
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });
});
