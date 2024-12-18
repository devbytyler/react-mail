import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { faker } from "@faker-js/faker";

type Message = {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  read: boolean;
};

const messagesData = Array.from({ length: 100 }, () => ({
  id: faker.string.uuid(),
  from: faker.internet.email(),
  to: "tylerstephens814@gmail.com",
  subject: faker.lorem.sentence(),
  body: faker.lorem.paragraphs(),
  date: faker.date.past(),
  read: false,
}));

function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const local = localStorage.getItem("messages");
    if (local) return JSON.parse(local) as Message[];
    return messagesData;
  });
  const [active, setActive] = useState<Message | null>(null);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filteredMessages = useMemo(() => {
    let newMessages = [...messages];
    if (search && search.trim()) {
      const lowered = search.trim().toLowerCase();
      newMessages = newMessages.filter((m) =>
        m.from.toLowerCase().includes(lowered)
      );
    }
    if (unread) {
      newMessages = newMessages.filter((m) => m.read === false);
    }
    return newMessages;
  }, [messages, search, unread]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (active && active.read === false) {
      setMessages((old) =>
        old.map((m) => {
          if (m.id === active.id) {
            return {
              ...m,
              read: true,
            };
          }
          return m;
        })
      );
    }
  }, [active]);

  const onSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selected);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelected(newSet);
  };

  const markAsRead = () => {
    setMessages((old) =>
      old.map((m) => {
        if (selected.has(m.id)) {
          return {
            ...m,
            read: true,
          };
        }
        return m;
      })
    );
    setSelected(new Set());
  };

  return (
    <>
      <aside className="sidebar">
        <ListHeader
          onSearch={setSearch}
          onMarkAsRead={markAsRead}
          showMarkAsRead={selected.size > 0}
          onFilterByUnread={setUnread}
        />
        <ul>
          {filteredMessages.map((message) => (
            <EmailListItem
              message={message}
              isActive={message.id === active?.id}
              onClick={() => setActive(message)}
              isSelected={selected.has(message.id)}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </aside>
      <main>
        {!active && <div>Nothing Selected</div>}
        {active && (
          <div>
            <div>{active.from}</div>
            <div>{active.subject}</div>
            <hr />
            <div>{active.body}</div>
          </div>
        )}
      </main>
    </>
  );
}

type EmailListItemProps = {
  message: Message;
  isActive: boolean;
  onClick: () => void;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
};

function EmailListItem({
  message,
  isActive,
  onClick,
  isSelected,
  onSelect,
}: EmailListItemProps) {
  return (
    <li
      key={message.id}
      className={`message-list-item ${isActive ? "active" : ""} group`}
      onClick={onClick}
    >
      {message.read ? null : <div className="unread">Unread</div>}
      <strong>{message.from}</strong>
      <div>{message.subject}</div>
      <input
        checked={isSelected}
        className="hidden group-hover:block"
        onChange={(e) => onSelect(message.id, e.target.checked)}
        onClick={(e) => {
          e.stopPropagation();
        }}
        type="checkbox"
      />
    </li>
  );
}

type ListHeaderProps = {
  onSearch: (input: string) => void;
  onMarkAsRead: () => void;
  showMarkAsRead: boolean;
  onFilterByUnread: (checked: boolean) => void;
};

function ListHeader(props: ListHeaderProps) {
  return (
    <div className="sticky-header">
      <input
        placeholder="Search..."
        onChange={(e) => props.onSearch(e.target.value)}
      />
      <label htmlFor="unread">Show unread only</label>
      <input
        id="unread"
        type="checkbox"
        onChange={(e) => {
          props.onFilterByUnread(e.target.checked);
        }}
      />
      {props.showMarkAsRead && (
        <button onClick={props.onMarkAsRead}>Mark as Read</button>
      )}
    </div>
  );
}

export default App;
