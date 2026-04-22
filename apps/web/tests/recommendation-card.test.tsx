import React from "react";
import { render, screen } from "@testing-library/react";

import { RecommendationCard } from "@/components/recommendation-card";
import { dashboardMock } from "@/lib/mock-data";


test("renders recommendation label and target range", () => {
  render(<RecommendationCard idea={dashboardMock.top_ideas[0]} />);

  expect(screen.getByText("매수")).toBeInTheDocument();
  expect(screen.getAllByText(/목표/).length).toBeGreaterThan(0);
  expect(screen.getByText(dashboardMock.top_ideas[0].name)).toBeInTheDocument();
});
