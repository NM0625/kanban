import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanBoard } from "@/app/kanban-board";

describe("KanbanBoard", () => {
  it("renders the seeded board", () => {
    render(<KanbanBoard />);
    expect(screen.getByRole("heading", { name: /kanban that feels sharp/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Backlog")).toBeInTheDocument();
    expect(screen.getByText("Refine onboarding copy")).toBeInTheDocument();
  });

  it("adds and deletes cards through the UI", async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);

    await user.type(screen.getByLabelText("New card title for Backlog"), "Plan launch email");
    await user.type(screen.getByLabelText("New card details for Backlog"), "Coordinate copy with marketing.");
    await user.click(screen.getAllByRole("button", { name: "Add card" })[0]!);

    expect(screen.getByText("Plan launch email")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete Plan launch email" }));
    expect(screen.queryByText("Plan launch email")).not.toBeInTheDocument();
  });
});
