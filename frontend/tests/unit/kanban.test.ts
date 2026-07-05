import { addCard, deleteCard, initialBoard, moveCard, renameColumn } from "@/lib/kanban";

describe("kanban helpers", () => {
  it("renames a column", () => {
    const updated = renameColumn(initialBoard, "column-1", "Ideas");
    expect(updated.columns[0]?.name).toBe("Ideas");
  });

  it("adds a card to the target column", () => {
    const updated = addCard(initialBoard, "column-2", {
      title: "Draft release notes",
      details: "Keep the message brief and useful.",
    });

    expect(updated.columns[1]?.cardIds).toHaveLength(2);
    expect(Object.values(updated.cards).some((card) => card.title === "Draft release notes")).toBe(true);
  });

  it("deletes a card from the board", () => {
    const updated = deleteCard(initialBoard, "card-1");
    expect(updated.cards["card-1"]).toBeUndefined();
    expect(updated.columns[0]?.cardIds.includes("card-1")).toBe(false);
  });

  it("moves a card across columns", () => {
    const updated = moveCard(initialBoard, "card-1", "card-3");
    expect(updated.columns[0]?.cardIds.includes("card-1")).toBe(false);
    expect(updated.columns[1]?.cardIds[0]).toBe("card-1");
  });
});
