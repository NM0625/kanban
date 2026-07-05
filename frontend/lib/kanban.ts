export type Card = {
  id: string;
  title: string;
  details: string;
};

export type Column = {
  id: string;
  name: string;
  cardIds: string[];
};

export type BoardState = {
  columns: Column[];
  cards: Record<string, Card>;
};

export const initialBoard: BoardState = {
  columns: [
    { id: "column-1", name: "Backlog", cardIds: ["card-1", "card-2"] },
    { id: "column-2", name: "Concept", cardIds: ["card-3"] },
    { id: "column-3", name: "In Progress", cardIds: ["card-4", "card-5"] },
    { id: "column-4", name: "Review", cardIds: ["card-6"] },
    { id: "column-5", name: "Launch", cardIds: ["card-7"] },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Refine onboarding copy",
      details: "Tighten hero message and first-run guidance for new teams.",
    },
    "card-2": {
      id: "card-2",
      title: "Collect visual references",
      details: "Shortlist 6 product boards with premium editorial styling.",
    },
    "card-3": {
      id: "card-3",
      title: "Map drag states",
      details: "Define hover, lift, overlay, and empty-column behavior.",
    },
    "card-4": {
      id: "card-4",
      title: "Build board shell",
      details: "Create the single-board layout with five fixed lanes.",
    },
    "card-5": {
      id: "card-5",
      title: "Polish motion timing",
      details: "Balance spring settings for a crisp but calm interaction feel.",
    },
    "card-6": {
      id: "card-6",
      title: "QA keyboard drag flow",
      details: "Verify drag accessibility and focus handling across lanes.",
    },
    "card-7": {
      id: "card-7",
      title: "Prepare MVP handoff",
      details: "Summarize constraints, test coverage, and next iteration ideas.",
    },
  },
};

export function renameColumn(
  board: BoardState,
  columnId: string,
  name: string,
): BoardState {
  return {
    ...board,
    columns: board.columns.map((column) =>
      column.id === columnId ? { ...column, name } : column,
    ),
  };
}

export function addCard(
  board: BoardState,
  columnId: string,
  draft: Pick<Card, "title" | "details">,
): BoardState {
  const id = `card-${crypto.randomUUID()}`;

  return {
    columns: board.columns.map((column) =>
      column.id === columnId
        ? { ...column, cardIds: [...column.cardIds, id] }
        : column,
    ),
    cards: {
      ...board.cards,
      [id]: { id, ...draft },
    },
  };
}

export function deleteCard(board: BoardState, cardId: string): BoardState {
  const nextCards = { ...board.cards };
  delete nextCards[cardId];

  return {
    columns: board.columns.map((column) => ({
      ...column,
      cardIds: column.cardIds.filter((id) => id !== cardId),
    })),
    cards: nextCards,
  };
}

export function moveCard(
  board: BoardState,
  activeId: string,
  overId: string,
): BoardState {
  const fromColumn = board.columns.find((column) =>
    column.cardIds.includes(activeId),
  );
  if (!fromColumn) {
    return board;
  }

  const isColumnTarget = board.columns.some((column) => column.id === overId);
  const toColumn = isColumnTarget
    ? board.columns.find((column) => column.id === overId)
    : board.columns.find((column) => column.cardIds.includes(overId));

  if (!toColumn) {
    return board;
  }

  const sourceIndex = fromColumn.cardIds.indexOf(activeId);
  const targetIndex = isColumnTarget
    ? toColumn.cardIds.length
    : toColumn.cardIds.indexOf(overId);

  if (sourceIndex === -1 || targetIndex === -1) {
    return board;
  }

  return {
    ...board,
    columns: board.columns.map((column) => {
      if (column.id === fromColumn.id && column.id === toColumn.id) {
        const cardIds = [...column.cardIds];
        const [cardId] = cardIds.splice(sourceIndex, 1);
        cardIds.splice(targetIndex, 0, cardId);
        return { ...column, cardIds };
      }

      if (column.id === fromColumn.id) {
        return {
          ...column,
          cardIds: column.cardIds.filter((id) => id !== activeId),
        };
      }

      if (column.id === toColumn.id) {
        const cardIds = [...column.cardIds];
        cardIds.splice(targetIndex, 0, activeId);
        return { ...column, cardIds };
      }

      return column;
    }),
  };
}
