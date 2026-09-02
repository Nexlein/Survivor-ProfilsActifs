"use client";

import { KeyboardEvent, ReactNode, useRef, useState } from "react";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTabId?: string;
};

export function Tabs({ tabs, defaultTabId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function focusTab(index: number) {
    const tab = tabs[index];
    if (!tab) return;
    setActiveId(tab.id);
    tabRefs.current[tab.id]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab((index + 1) % tabs.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab((index - 1 + tabs.length) % tabs.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(tabs.length - 1);
    }
  }

  const activeTab = tabs.find((tab) => tab.id === activeId);

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`px-4 py-2.5 border-b-2 font-bold text-sm font-heading ${
                isActive ? "border-primary text-primary" : "border-transparent text-text-secondary"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {activeTab && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab.id}`}
          aria-labelledby={`tab-${activeTab.id}`}
          className="text-sm text-text-secondary pt-4"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
