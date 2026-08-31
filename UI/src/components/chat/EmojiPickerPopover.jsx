import { useState, useRef, useEffect } from "react";
import { Search, X, Smile, ThumbsUp, Heart, Trophy, Coffee, Dog } from "lucide-react";

const EMOJI_CATEGORIES = [
  {
    id: "smileys",
    name: "Smileys",
    icon: <Smile size={16} />,
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
      "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
      "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖",
      "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯",
      "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔",
      "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦",
      "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴",
    ],
  },
  {
    id: "gestures",
    name: "Gestures",
    icon: <ThumbsUp size={16} />,
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
      "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👍", "👎",
      "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏",
      "✍️", "💪", "🦾", "👀", "👁️", "🧠", "🗣️", "🫂", "🏃", "🚶",
    ],
  },
  {
    id: "hearts",
    name: "Hearts & Symbols",
    icon: <Heart size={16} />,
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "✨", "⭐",
      "🌟", "💫", "🔥", "💥", "💯", "🎉", "🎊", "💡", "⚡", "🌈",
      "☀️", "🌙", "☁️", "🌧️", "❄️", "🔔", "📍", "🏆", "🎯", "💬",
    ],
  },
  {
    id: "sports",
    name: "Activities",
    icon: <Trophy size={16} />,
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓",
      "🏸", "🏒", "🏏", "⛳", "🥊", "🥋", "🛹", "🛼", "🏋️", "🚴",
      "🚵", "🧗", "🧘", "🏊", "🎮", "🎲", "🎨", "🎭", "🎤", "🎧",
    ],
  },
  {
    id: "food",
    name: "Food & Drinks",
    icon: <Coffee size={16} />,
    emojis: [
      "☕", "🍵", "🧋", "🥤", "🍺", "🍻", "🥂", "🍷", "🍕", "🍔",
      "🍟", "🌭", "🥪", "🌮", "🌯", "🥗", "🍝", "🍜", "🍲", "🍛",
      "🍣", "🍱", "🥟", "🍤", "🍦", "🍧", "🍨", "🍩", "🍪", "🎂",
      "🍫", "🍬", "🍿", "🍎", "🍌", "🍉", "🍇", "🍓", "🥑", "🥥",
    ],
  },
  {
    id: "nature",
    name: "Animals & Nature",
    icon: <Dog size={16} />,
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦆", "🦅",
      "🦉", "🐺", "🐴", "🦄", "🐝", "🦋", "🌲", "🌳", "🌴", "🌵",
      "🌾", "🌿", "🍀", "🍁", "🍂", "🍃", "🌸", "🌺", "🌻", "🌹",
    ],
  },
];

export default function EmojiPickerPopover({ onSelectEmoji, onClose }) {
  const [activeCategory, setActiveCategory] = useState("smileys");
  const [search, setSearch] = useState("");
  const popoverRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Filter emojis if search is present
  const allEmojis = EMOJI_CATEGORIES.flatMap((cat) => cat.emojis);
  const filteredEmojis = search.trim()
    ? allEmojis.filter((e) => e.includes(search.trim()))
    : null;

  const currentCategory = EMOJI_CATEGORIES.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-14 right-2 z-50 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      style={{ maxHeight: "360px" }}
    >
      {/* Header with Search */}
      <div className="p-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search emoji..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none text-slate-800 placeholder:text-slate-400"
            autoFocus
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Category Tabs */}
      {!search && (
        <div className="flex items-center justify-around px-1 py-1.5 border-b border-slate-100 bg-white">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`p-2 rounded-xl transition ${
                activeCategory === cat.id
                  ? "bg-purple-100 text-purple-700 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              }`}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="flex-1 overflow-y-auto p-2.5 h-56">
        <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
          {(filteredEmojis || currentCategory?.emojis || []).map(
            (emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectEmoji(emoji);
                }}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-purple-50 hover:scale-125 rounded-lg transition-transform duration-100 active:scale-95"
              >
                {emoji}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
