import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { AlertsPanel } from "@/components/alerts-panel";
import { alertsMock } from "@/lib/mock-data";


test("marks an alert as read in the inbox UI", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ ok: true }),
  });
  vi.stubGlobal("fetch", fetchMock);

  render(<AlertsPanel alerts={[alertsMock[0]]} />);

  expect(screen.getByText("NEW")).toBeInTheDocument();
  fireEvent.click(screen.getByTitle("읽음 처리"));

  await waitFor(() => {
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });

  vi.unstubAllGlobals();
});
