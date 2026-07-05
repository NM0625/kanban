"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useState } from "react";
import {
  addCard,
  deleteCard,
  initialBoard,
  moveCard,
  renameColumn,
  type Card,
} from "@/lib/kanban";

type DraftState = Record<string, { title: string; details: string }>;

const emptyDraft = { title: "", details: "" };

function CardView({ card, overlay = false }: { card: Card; overlay?: boolean }) {
  return (
    <article className={clsx("card", overlay && "cardOverlay")}>
      <div className="cardEyebrow">Task</div>
      <h3>{card.title}</h3>
      <p>{card.details}</p>
    </article>
  );
}

function SortableCard({
  card,
  onDelete,
}: {
  card: Card;
  onDelete: (cardId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={clsx("cardShell", isDragging && "cardGhost")}
    >
      <button
        type="button"
        className="cardGrab"
        aria-label={`Drag ${card.title}`}
        {...attributes}
        {...listeners}
      >
        <span />
        <span />
        <span />
      </button>
      <CardView card={card} />
      <button
        type="button"
        className="cardDelete"
        onClick={() => onDelete(card.id)}
        aria-label={`Delete ${card.title}`}
      >
        Delete
      </button>
    </div>
  );
}

function ColumnLane({
  columnId,
  title,
  count,
  children,
}: {
  columnId: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <section ref={setNodeRef} className={clsx("lane", isOver && "laneOver")}>
      <div className="laneHeader">
        <div>
          <div className="laneLabel">Column</div>
          <h2>{title}</h2>
        </div>
        <div className="laneCount">{count}</div>
      </div>
      <div className="laneBody">{children}</div>
    </section>
  );
}

export function KanbanBoard() {
  const [board, setBoard] = useState(initialBoard);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftState>(() =>
    Object.fromEntries(initialBoard.columns.map((column) => [column.id, emptyDraft])),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeCard = activeCardId ? board.cards[activeCardId] : null;

  function updateDraft(
    columnId: string,
    key: "title" | "details",
    value: string,
  ) {
    setDrafts((current) => ({
      ...current,
      [columnId]: {
        ...current[columnId],
        [key]: value,
      },
    }));
  }

  function submitCard(columnId: string) {
    const draft = drafts[columnId];
    if (!draft.title.trim() || !draft.details.trim()) {
      return;
    }

    setBoard((current) =>
      addCard(current, columnId, {
        title: draft.title.trim(),
        details: draft.details.trim(),
      }),
    );
    setDrafts((current) => ({ ...current, [columnId]: emptyDraft }));
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveCardId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCardId(null);
    if (!event.over) {
      return;
    }

    const activeId = String(event.active.id);
    const overId = String(event.over.id);

    if (activeId === overId) {
      return;
    }

    setBoard((current) => moveCard(current, activeId, overId));
  }

  return (
    <div className="boardPage">
      <div className="hero">
        <div>
          <p className="eyebrow">Single-board workflow</p>
          <h1>Kanban that feels sharp, fast, and focused.</h1>
        </div>
        <p className="heroText">
          Rename the five fixed lanes, move cards freely, and keep the board clean.
          No clutter, no persistence, just a polished planning surface.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="boardGrid">
          {board.columns.map((column) => {
            const cards = column.cardIds.map((cardId) => board.cards[cardId]);

            return (
              <div key={column.id} className="laneShell">
                <label className="renameField">
                  <span className="srOnly">Rename {column.name}</span>
                  <input
                    aria-label={`Rename ${column.name}`}
                    value={column.name}
                    onChange={(event) =>
                      setBoard((current) =>
                        renameColumn(current, column.id, event.target.value),
                      )
                    }
                  />
                </label>
                <ColumnLane
                  columnId={column.id}
                  title={column.name}
                  count={cards.length}
                >
                  <SortableContext
                    items={column.cardIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="cardList">
                      {cards.map((card) => (
                        <SortableCard
                          key={card.id}
                          card={card}
                          onDelete={(cardId) =>
                            setBoard((current) => deleteCard(current, cardId))
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <div className="composer">
                    <input
                      value={drafts[column.id]?.title ?? ""}
                      onChange={(event) =>
                        updateDraft(column.id, "title", event.target.value)
                      }
                      placeholder="Card title"
                      aria-label={`New card title for ${column.name}`}
                    />
                    <textarea
                      value={drafts[column.id]?.details ?? ""}
                      onChange={(event) =>
                        updateDraft(column.id, "details", event.target.value)
                      }
                      placeholder="Details"
                      aria-label={`New card details for ${column.name}`}
                    />
                    <button type="button" onClick={() => submitCard(column.id)}>
                      Add card
                    </button>
                  </div>
                </ColumnLane>
              </div>
            );
          })}
        </div>
        <DragOverlay>{activeCard ? <CardView card={activeCard} overlay /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
