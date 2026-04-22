import React from "react";
import { render, screen } from "@testing-library/react";

import { AppShell } from "@/components/app-shell";


test("shows primary analyst desk navigation", () => {
  render(<AppShell title="대시보드"><div>body</div></AppShell>);

  expect(screen.getAllByText("대시보드").length).toBeGreaterThan(0);
  expect(screen.getByText("탐색")).toBeInTheDocument();
  expect(screen.getByText("관심/포트폴리오")).toBeInTheDocument();
  expect(screen.getByText("알림")).toBeInTheDocument();
  expect(screen.getByText("설정")).toBeInTheDocument();
});
