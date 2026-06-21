import { useState, useMemo } from "react";

type LocalIconProps = {
  className?: string;
  size?: number | string;
};

function createLocalIcon(glyph: string) {
  return function LocalIcon({ className, size = 16 }: LocalIconProps) {
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        {glyph}
      </span>
    );
  };
}

const ArrowUp = createLocalIcon("↑");
const ArrowDown = createLocalIcon("↓");
const MessageSquare = createLocalIcon("💬");
const Share2 = createLocalIcon("↗");
const Flag = createLocalIcon("⚑");
const Trash2 = createLocalIcon("🗑");
const ShieldBan = createLocalIcon("⛔");
const ChevronDown = createLocalIcon("▾");
const ChevronUp = createLocalIcon("▴");
const Plus = createLocalIcon("+");
const Search = createLocalIcon("⌕");
const Moon = createLocalIcon("◐");
const Sun = createLocalIcon("☼");
const X = createLocalIcon("×");
const ImageIcon = createLocalIcon("▦");
const LinkIcon = createLocalIcon("🔗");
const AlignLeft = createLocalIcon("☰");
const TrendingUp = createLocalIcon("↗");
const Clock = createLocalIcon("◷");
const Award = createLocalIcon("★");
const Users = createLocalIcon("👥");
const AlertTriangle = createLocalIcon("⚠");
const CheckCircle = createLocalIcon("✓");

// ─── Types ─────────────────────────────────────────────────────────────────────

type User = {
  id: string;
  username: string;
  email: string;
  avatarColor: string;
  bio: string;
  karma: number;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: Date;
};

type PostType = "text" | "link" | "image";
type SortMode = "hot" | "new" | "top";
type View = "feed" | "post" | "profile" | "admin";
type AuthMode = "login" | "register";
type PostTab = "text" | "image" | "link";

type Post = {
  id: string;
  authorId: string;
  title: string;
  body: string;
  imageUrl?: string;
  linkUrl?: string;
  type: PostType;
  category: string;
  votes: Record<string, 1 | -1>;
  score: number;
  createdAt: Date;
  commentCount: number;
  isFlagged: boolean;
};

type Comment = {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  body: string;
  votes: Record<string, 1 | -1>;
  score: number;
  createdAt: Date;
  isDeleted: boolean;
};

type Report = {
  id: string;
  contentType: "post" | "comment";
  contentId: string;
  reporterId: string;
  reason: string;
  createdAt: Date;
  resolved: boolean;
};

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const INIT_USERS: User[] = [
  {
    id: "u1", username: "spectral_void", email: "spectral@void.io",
    avatarColor: "#ff4500", bio: "Frontend tinkerer. Dark mode evangelist. I ship things at 2am.",
    karma: 12483, isAdmin: true, isBanned: false, createdAt: new Date("2022-03-14"),
  },
  {
    id: "u2", username: "neon_oracle", email: "oracle@neon.dev",
    avatarColor: "#8b5cf6", bio: "I write code and bad haiku. Mostly bad haiku.",
    karma: 5621, isAdmin: false, isBanned: false, createdAt: new Date("2023-01-08"),
  },
  {
    id: "u3", username: "pixel_drifter", email: "pixel@drift.art",
    avatarColor: "#10b981", bio: "Generative art, procedural worlds, and the occasional existential crisis.",
    karma: 3890, isAdmin: false, isBanned: false, createdAt: new Date("2023-07-22"),
  },
  {
    id: "u4", username: "void_architect", email: "void@arch.io",
    avatarColor: "#f59e0b", bio: "Systems thinker. Building things that scale. Sometimes they do.",
    karma: 8234, isAdmin: false, isBanned: false, createdAt: new Date("2022-11-05"),
  },
  {
    id: "u5", username: "static_noise", email: "static@noise.net",
    avatarColor: "#ec4899", bio: "Chaotic neutral developer. My commits have feelings.",
    karma: 1247, isAdmin: false, isBanned: false, createdAt: new Date("2024-02-18"),
  },
];

const now = new Date();
const h = (hrs: number) => new Date(now.getTime() - hrs * 3600000);

const INIT_POSTS: Post[] = [
  {
    id: "p1", authorId: "u2",
    title: "After 6 months of night shifts, I finally shipped my side project — a terminal habit tracker written in Rust",
    body: "Zero dependencies, sub-millisecond startup, stores data in plain-text files you can grep. Started as a learning exercise and became something I actually use every day. MIT licensed.",
    type: "text", category: "programming",
    votes: { u1: 1, u3: 1, u4: 1, u5: 1 }, score: 847,
    createdAt: h(3), commentCount: 6, isFlagged: false,
  },
  {
    id: "p2", authorId: "u3",
    title: "I trained a model on 50k posts to predict score — here's what actually matters",
    body: "Title length, post time, and the first 10 words account for ~67% of variance. The rest is mostly luck. Full writeup + Colab notebook in the comments.",
    type: "text", category: "machinelearning",
    votes: { u1: 1, u2: 1, u4: -1 }, score: 1203,
    createdAt: h(7), commentCount: 118, isFlagged: false,
  },
  {
    id: "p3", authorId: "u4",
    title: "The case for boring technology in 2025: why I chose Postgres over everything else again",
    body: "Postgres now does vector search, time-series, full-text search, and pub/sub. At some point it becomes easier to ask what it can't do.",
    type: "text", category: "devops",
    votes: { u2: 1, u3: 1, u5: 1 }, score: 631,
    createdAt: h(14), commentCount: 89, isFlagged: false,
  },
  {
    id: "p4", authorId: "u1",
    title: "Show HN: Real-time collaborative code editor in ~800 lines of vanilla JS",
    body: "No WebRTC library, no operational transforms — just a dead-simple CRDT implementation and WebSockets. Performance is surprisingly acceptable.",
    type: "text", category: "programming",
    votes: { u2: 1, u3: 1, u4: 1, u5: -1 }, score: 2041,
    createdAt: h(22), commentCount: 4, isFlagged: false,
  },
  {
    id: "p5", authorId: "u5",
    title: "Stop using console.log for debugging. Here's what I use instead",
    body: "The debugger statement plus conditional breakpoints will save you hours. A short walkthrough of the workflow I wish someone showed me two years ago.",
    type: "text", category: "javascript",
    votes: { u1: -1, u2: 1, u3: 1 }, score: 412,
    createdAt: h(31), commentCount: 67, isFlagged: false,
  },
  {
    id: "p6", authorId: "u2",
    title: "Generative landscape I made with simplex noise — every refresh is different",
    imageUrl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=450&fit=crop&auto=format",
    body: "Palette sourced from a 1974 geological survey. Built with p5.js over a weekend.",
    type: "image", category: "art",
    votes: { u1: 1, u3: 1, u4: 1, u5: 1 }, score: 934,
    createdAt: h(9), commentCount: 44, isFlagged: false,
  },
  {
    id: "p7", authorId: "u4",
    title: "Flash Attention 3 paper dropped — the efficiency improvements are substantial",
    linkUrl: "https://arxiv.org",
    body: "The implementation is actually readable this time. Worth your weekend.",
    type: "link", category: "machinelearning",
    votes: { u1: 1, u2: 1, u3: 1 }, score: 756,
    createdAt: h(5), commentCount: 55, isFlagged: false,
  },
  {
    id: "p8", authorId: "u3",
    title: "git log one-liner that changed how I review my own work",
    body: "git log --oneline --graph --decorate --all — yes, everyone knows this, but the muscle memory takes years.",
    type: "text", category: "tooling",
    votes: { u4: 1, u5: 1 }, score: 189,
    createdAt: h(48), commentCount: 31, isFlagged: true,
  },
];

const INIT_COMMENTS: Comment[] = [
  {
    id: "c1", postId: "p1", parentId: null, authorId: "u1",
    body: "This is exactly the kind of project that makes me love open source. Zero-dep constraints force you to really understand what you're building.",
    votes: { u2: 1, u3: 1, u4: 1 }, score: 156, createdAt: h(2.5), isDeleted: false,
  },
  {
    id: "c2", postId: "p1", parentId: "c1", authorId: "u3",
    body: "Agreed. The 'no dependencies' constraint is underrated as a learning technique. You end up writing 80% of the same code, but you understand all of it.",
    votes: { u1: 1, u4: 1 }, score: 87, createdAt: h(2), isDeleted: false,
  },
  {
    id: "c3", postId: "p1", parentId: "c2", authorId: "u4",
    body: "The other side: you end up with better APIs because you designed them for your use case, not a general audience.",
    votes: { u1: 1 }, score: 43, createdAt: h(1.5), isDeleted: false,
  },
  {
    id: "c4", postId: "p1", parentId: null, authorId: "u5",
    body: "What's the data format for habit entries? Wondering if it's compatible with org-mode.",
    votes: { u2: 1 }, score: 34, createdAt: h(2), isDeleted: false,
  },
  {
    id: "c5", postId: "p1", parentId: "c4", authorId: "u2",
    body: "From the repo: each day is a line in a .txt file, checkboxes are [ ] and [x] prefixes. Very org-mode adjacent.",
    votes: { u5: 1, u1: 1, u3: 1 }, score: 72, createdAt: h(1.8), isDeleted: false,
  },
  {
    id: "c6", postId: "p1", parentId: null, authorId: "u3",
    body: "Have you considered adding a TUI visualization? Something like a heatmap calendar ala GitHub contributions would be sick.",
    votes: { u1: 1, u2: 1 }, score: 61, createdAt: h(1.2), isDeleted: false,
  },
  {
    id: "c7", postId: "p4", parentId: null, authorId: "u3",
    body: "The CRDT implementation is where I'd love more detail. Most 'simple' CRDT explanations I've seen still require a PhD to parse.",
    votes: { u1: 1, u2: 1, u4: 1, u5: 1 }, score: 203, createdAt: h(20), isDeleted: false,
  },
  {
    id: "c8", postId: "p4", parentId: "c7", authorId: "u1",
    body: "OP here. I'm using Last-Write-Wins at the character level. Not perfect — concurrent deletes cause occasional weirdness — but conflicts are rare enough in practice.",
    votes: { u3: 1, u2: 1 }, score: 118, createdAt: h(19), isDeleted: false,
  },
  {
    id: "c9", postId: "p4", parentId: "c8", authorId: "u4",
    body: "Have you looked at Yjs? It handles this edge case well, and the protocol is actually auditable.",
    votes: { u1: 1, u3: 1 }, score: 67, createdAt: h(18), isDeleted: false,
  },
  {
    id: "c10", postId: "p4", parentId: null, authorId: "u5",
    body: "800 lines is genuinely impressive for this feature set. What's the approach for cursor sync?",
    votes: { u1: 1 }, score: 44, createdAt: h(19.5), isDeleted: false,
  },
];

const INIT_REPORTS: Report[] = [
  {
    id: "r1", contentType: "post", contentId: "p8",
    reporterId: "u3", reason: "Low-effort / spam content",
    createdAt: h(5), resolved: false,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function hotScore(score: number, createdAt: Date): number {
  const hours = (Date.now() - createdAt.getTime()) / 3600000;
  return score / Math.pow(hours + 2, 1.8);
}

function sortPosts(posts: Post[], mode: SortMode): Post[] {
  return [...posts].sort((a, b) => {
    if (mode === "hot") return hotScore(b.score, b.createdAt) - hotScore(a.score, a.createdAt);
    if (mode === "new") return b.createdAt.getTime() - a.createdAt.getTime();
    return b.score - a.score;
  });
}

function timeAgo(date: Date): string {
  const s = (Date.now() - date.getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── Avatar ──────────────────────────────────────────────────────────────────────

function Avatar({ user, size = 32 }: { user: User; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, backgroundColor: user.avatarColor, fontSize: size * 0.38 }}
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none uppercase"
    >
      {user.username.slice(0, 2)}
    </div>
  );
}

// ─── VoteButtons ─────────────────────────────────────────────────────────────────

function VoteButtons({
  score, userVote, onUpvote, onDownvote, vertical = true,
}: {
  score: number; userVote: 1 | -1 | 0;
  onUpvote: () => void; onDownvote: () => void; vertical?: boolean;
}) {
  return (
    <div className={`flex ${vertical ? "flex-col items-center gap-0.5" : "flex-row items-center gap-1"}`}>
      <button
        onClick={onUpvote}
        className={`p-1 rounded transition-colors ${userVote === 1 ? "text-orange-500" : "text-muted-foreground hover:text-orange-500"}`}
      >
        <ArrowUp size={15} strokeWidth={2.5} />
      </button>
      <span
        className={`font-mono text-xs font-medium tabular-nums min-w-[2ch] text-center ${userVote === 1 ? "text-orange-500" : userVote === -1 ? "text-blue-400" : "text-foreground/80"}`}
      >
        {fmt(score)}
      </span>
      <button
        onClick={onDownvote}
        className={`p-1 rounded transition-colors ${userVote === -1 ? "text-blue-400" : "text-muted-foreground hover:text-blue-400"}`}
      >
        <ArrowDown size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────────

function PostCard({
  post, users, currentUser, onVote, onOpenPost, onOpenProfile, onFlag, onDelete,
}: {
  post: Post; users: User[]; currentUser: User | null;
  onVote: (id: string, dir: 1 | -1) => void;
  onOpenPost: (id: string) => void;
  onOpenProfile: (id: string) => void;
  onFlag: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const author = users.find((u) => u.id === post.authorId)!;
  const userVote = currentUser ? ((post.votes[currentUser.id] ?? 0) as 1 | -1 | 0) : 0;

  return (
    <div className={`flex gap-3 p-3 bg-card border rounded-lg hover:border-border/80 transition-all group ${post.isFlagged ? "border-l-2 border-l-amber-500/80 border-border/60" : "border-border"}`}>
      <VoteButtons
        score={post.score}
        userVote={userVote}
        onUpvote={() => currentUser && onVote(post.id, 1)}
        onDownvote={() => currentUser && onVote(post.id, -1)}
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
          <button
            className="text-orange-400 font-medium hover:text-orange-300 transition-colors"
            onClick={() => onOpenProfile(author.id)}
          >
            {author.username}
          </button>
          <span className="opacity-40">·</span>
          <span className="font-mono">{timeAgo(post.createdAt)} ago</span>
          <span className="opacity-40">·</span>
          <span className="bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold">
            {post.category}
          </span>
          {post.isFlagged && (
            <span className="text-amber-500 flex items-center gap-0.5 text-[10px]">
              <AlertTriangle size={9} /> flagged
            </span>
          )}
        </div>

        <h2
          className="text-sm font-semibold leading-snug mb-2 cursor-pointer hover:text-orange-400 transition-colors"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.01em", fontSize: "0.95rem" }}
          onClick={() => onOpenPost(post.id)}
        >
          {post.title}
        </h2>

        {post.type === "image" && post.imageUrl && (
          <div className="mb-2 rounded-md overflow-hidden max-h-44 bg-muted cursor-pointer" onClick={() => onOpenPost(post.id)}>
            <img src={post.imageUrl} alt={post.title} className="w-full object-cover max-h-44" />
          </div>
        )}
        {post.type === "link" && post.linkUrl && (
          <div className="flex items-center gap-1.5 mb-2 text-[11px] text-blue-400">
            <LinkIcon size={10} />
            <span className="truncate">{post.linkUrl}</span>
          </div>
        )}
        {post.body && (
          <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">
            {post.body}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenPost(post.id)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare size={12} />
            <span>{post.commentCount} comments</span>
          </button>
          <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            <Share2 size={12} />
            <span>Share</span>
          </button>
          {currentUser && (
            <button
              onClick={() => onFlag(post.id)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-amber-500 transition-colors"
            >
              <Flag size={12} />
              <span>Report</span>
            </button>
          )}
          {(currentUser?.isAdmin || currentUser?.id === post.authorId) && (
            <button
              onClick={() => onDelete(post.id)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-red-500 transition-colors ml-auto"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CommentNode ──────────────────────────────────────────────────────────────────

function CommentNode({
  comment, allComments, users, currentUser, depth,
  onVote, onDelete, onReply,
}: {
  comment: Comment; allComments: Comment[]; users: User[];
  currentUser: User | null; depth: number;
  onVote: (id: string, dir: 1 | -1) => void;
  onDelete: (id: string) => void;
  onReply: (parentId: string, body: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const children = allComments.filter((c) => c.parentId === comment.id);
  const author = users.find((u) => u.id === comment.authorId);
  const userVote = currentUser ? ((comment.votes[currentUser.id] ?? 0) as 1 | -1 | 0) : 0;

  if (comment.isDeleted) {
    return (
      <div style={{ marginLeft: depth > 0 ? 16 : 0 }} className={depth > 0 ? "pl-3 border-l border-border/30" : ""}>
        <p className="text-[11px] text-muted-foreground/50 italic py-1">[deleted]</p>
        {children.map((c) => (
          <CommentNode key={c.id} comment={c} allComments={allComments} users={users} currentUser={currentUser} depth={depth + 1} onVote={onVote} onDelete={onDelete} onReply={onReply} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0 }} className={depth > 0 ? "pl-3 border-l border-border/30" : ""}>
      <div className="py-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          {author && <Avatar user={author} size={18} />}
          <span className="text-[11px] font-semibold text-orange-400">{author?.username}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(comment.createdAt)} ago</span>
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            {collapsed ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
          </button>
        </div>
        {!collapsed && (
          <>
            <p className="text-[13px] text-foreground/90 leading-relaxed mb-2">{comment.body}</p>
            <div className="flex items-center gap-3">
              <VoteButtons
                score={comment.score} userVote={userVote}
                onUpvote={() => currentUser && onVote(comment.id, 1)}
                onDownvote={() => currentUser && onVote(comment.id, -1)}
                vertical={false}
              />
              {currentUser && (
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <MessageSquare size={11} /> Reply
                </button>
              )}
              {(currentUser?.isAdmin || currentUser?.id === comment.authorId) && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-[11px] text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1 ml-auto"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
            {showReply && (
              <div className="mt-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full text-[13px] bg-muted/40 border border-border rounded-lg p-2.5 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-orange-500/40 min-h-[72px]"
                />
                <div className="flex gap-2 mt-1.5">
                  <button
                    onClick={() => {
                      if (replyText.trim()) {
                        onReply(comment.id, replyText.trim());
                        setReplyText(""); setShowReply(false);
                      }
                    }}
                    className="text-xs bg-orange-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Reply
                  </button>
                  <button onClick={() => { setShowReply(false); setReplyText(""); }} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {!collapsed && children.map((c) => (
        <CommentNode key={c.id} comment={c} allComments={allComments} users={users} currentUser={currentUser} depth={depth + 1} onVote={onVote} onDelete={onDelete} onReply={onReply} />
      ))}
    </div>
  );
}

// ─── AuthModal ────────────────────────────────────────────────────────────────────

function AuthModal({
  mode, onClose, onLogin, onRegister,
}: {
  mode: AuthMode; onClose: () => void;
  onLogin: (u: string, p: string) => boolean;
  onRegister: (u: string, e: string, p: string) => boolean;
}) {
  const [tab, setTab] = useState<AuthMode>(mode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (tab === "login") {
      if (!onLogin(username, password)) setError("Invalid username. Try: spectral_void, neon_oracle, pixel_drifter…");
    } else {
      if (username.length < 3) { setError("Username must be at least 3 characters."); return; }
      if (!email.includes("@")) { setError("Enter a valid email."); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (!onRegister(username, email, password)) setError("Username already taken.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-5">
            {(["login", "register"] as AuthMode[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${tab === t ? "text-orange-500 border-orange-500" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", letterSpacing: "0.04em" }}
              >
                {t === "login" ? "LOG IN" : "SIGN UP"}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="your_username" required />
          </div>
          {tab === "register" && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="you@example.com" required />
            </div>
          )}
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="••••••••" required />
          </div>
          {error && <p className="text-[12px] text-red-400 leading-relaxed">{error}</p>}
          <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors mt-1" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em", fontSize: "0.95rem" }}>
            {tab === "login" ? "LOG IN" : "CREATE ACCOUNT"}
          </button>
        </form>
        {tab === "login" && (
          <p className="text-[11px] text-muted-foreground/60 text-center mt-4">
            Demo accounts: spectral_void (admin), neon_oracle, pixel_drifter, void_architect, static_noise — any password works
          </p>
        )}
      </div>
    </div>
  );
}

// ─── CreatePostModal ──────────────────────────────────────────────────────────────

function CreatePostModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (p: Omit<Post, "id" | "authorId" | "votes" | "score" | "createdAt" | "commentCount" | "isFlagged">) => void;
}) {
  const [tab, setTab] = useState<PostTab>("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("programming");
  const [error, setError] = useState("");
  const cats = ["programming", "machinelearning", "javascript", "devops", "tooling", "art", "discuss"];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (title.length > 300) { setError("Title must be under 300 characters."); return; }
    if (tab === "link" && !linkUrl.trim()) { setError("URL is required for link posts."); return; }
    onSubmit({
      title: title.trim(), body: body.trim(), type: tab, category,
      imageUrl: tab === "image" ? imageUrl : undefined,
      linkUrl: tab === "link" ? linkUrl : undefined,
    });
  }

  const tabs: [PostTab, string, React.ElementType][] = [
    ["text", "Text", AlignLeft],
    ["image", "Image", ImageIcon],
    ["link", "Link", LinkIcon],
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em", fontSize: "1.15rem" }}>CREATE POST</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1 mb-4">
          {tabs.map(([t, label, Icon]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">Community</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-orange-500/50">
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="An interesting title..." required />
            <div className="text-right text-[10px] text-muted-foreground/50 mt-0.5">{title.length}/300</div>
          </div>
          {tab === "text" && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">Body (optional)</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-orange-500/50 transition-colors min-h-[110px]" placeholder="What's on your mind?" />
            </div>
          )}
          {tab === "image" && (
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">Image URL</label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="https://..." />
            </div>
          )}
          {tab === "link" && (
            <>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">URL</label>
                <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/50 transition-colors" placeholder="https://..." required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">Description (optional)</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-orange-500/50 transition-colors min-h-[80px]" placeholder="Brief description..." />
              </div>
            </>
          )}
          {error && <p className="text-[12px] text-red-400">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-border text-muted-foreground text-sm font-medium py-2.5 rounded-xl hover:text-foreground hover:border-foreground/30 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>POST</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────────

function Navbar({
  currentUser, isDark, onToggleDark, onNavigate, onAuth, onLogout, onCreatePost,
}: {
  currentUser: User | null; isDark: boolean;
  onToggleDark: () => void; onNavigate: (v: View) => void;
  onAuth: (m: AuthMode) => void; onLogout: () => void; onCreatePost: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-12 bg-card/95 backdrop-blur border-b border-border flex items-center px-4 gap-3">
      <button onClick={() => onNavigate("feed")} className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-black text-sm leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>V</span>
        </div>
        <span className="font-black text-sm tracking-widest hidden sm:block" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>
          VOID<span className="text-orange-500">TALK</span>
        </span>
      </button>

      <div className="flex-1 max-w-xs mx-auto relative hidden sm:block">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full bg-muted/60 border border-border rounded-xl pl-7 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/40 transition-colors"
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {currentUser && (
          <button onClick={onCreatePost} className="flex items-center gap-1.5 text-[11px] font-bold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl transition-colors" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>
            <Plus size={13} strokeWidth={2.5} />
            <span className="hidden sm:block">NEW POST</span>
          </button>
        )}
        <button onClick={onToggleDark} className="text-muted-foreground hover:text-foreground p-2 rounded-xl transition-colors">
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        {currentUser?.isAdmin && (
          <button onClick={() => onNavigate("admin")} className="text-muted-foreground hover:text-orange-500 p-2 rounded-xl transition-colors" title="Admin">
            <ShieldBan size={15} />
          </button>
        )}
        {currentUser ? (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-1">
              <Avatar user={currentUser} size={26} />
              <ChevronDown size={11} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-xl w-40 py-1 z-50">
                <button onClick={() => { onNavigate("profile"); setMenuOpen(false); }} className="w-full text-left text-xs px-3 py-2 hover:bg-muted/50 text-foreground">Profile</button>
                <button onClick={() => { onLogout(); setMenuOpen(false); }} className="w-full text-left text-xs px-3 py-2 hover:bg-muted/50 text-muted-foreground">Log out</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button onClick={() => onAuth("login")} className="text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-xl border border-border hover:border-foreground/20 transition-colors">Log in</button>
            <button onClick={() => onAuth("register")} className="text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1.5 rounded-xl transition-colors" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>SIGN UP</button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── HomeFeed ──────────────────────────────────────────────────────────────────────

function HomeFeed({
  posts, users, currentUser, sort, onSort, onVote, onOpenPost, onOpenProfile, onFlag, onDelete, onAuth, onCreatePost,
}: {
  posts: Post[]; users: User[]; currentUser: User | null;
  sort: SortMode; onSort: (s: SortMode) => void;
  onVote: (id: string, d: 1 | -1) => void;
  onOpenPost: (id: string) => void; onOpenProfile: (id: string) => void;
  onFlag: (id: string) => void; onDelete: (id: string) => void;
  onAuth: (m: AuthMode) => void; onCreatePost: () => void;
}) {
  const sorted = useMemo(() => sortPosts(posts, sort), [posts, sort]);
  const sortTabs: [SortMode, string, React.ElementType][] = [
    ["hot", "Hot", TrendingUp], ["new", "New", Clock], ["top", "Top", Award],
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 pt-14 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_268px] gap-5 mt-5">
        <div>
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 w-fit mb-4">
            {sortTabs.map(([s, label, Icon]) => (
              <button
                key={s}
                onClick={() => onSort(s)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${sort === s ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground"}`}
                style={{ fontFamily: sort === s ? "'Barlow Condensed', sans-serif" : undefined, letterSpacing: sort === s ? "0.05em" : undefined }}
              >
                <Icon size={12} /> {label.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {sorted.map((post) => (
              <PostCard key={post.id} post={post} users={users} currentUser={currentUser} onVote={onVote} onOpenPost={onOpenPost} onOpenProfile={onOpenProfile} onFlag={onFlag} onDelete={onDelete} />
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-4">
          <div className="sticky top-14 flex flex-col gap-4">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="h-14 bg-gradient-to-br from-orange-500/20 via-orange-400/5 to-transparent" />
              <div className="px-4 pb-4 -mt-5">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                  <span className="text-white font-black text-lg" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>V</span>
                </div>
                <h3 className="font-black text-sm tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>VOIDTALK</h3>
                <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">
                  A community for developers, designers, and thinkers. Share what you&apos;re building, learning, or questioning.
                </p>
                <div className="flex gap-5 mt-3 py-3 border-t border-border">
                  <div>
                    <div className="font-mono text-sm font-bold">{fmt(posts.length * 847)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Members</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                      2.1k
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Online</div>
                  </div>
                </div>
                {currentUser ? (
                  <button onClick={onCreatePost} className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-xl transition-colors" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>
                    CREATE POST
                  </button>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => onAuth("register")} className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-xl transition-colors" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>JOIN COMMUNITY</button>
                    <button onClick={() => onAuth("login")} className="w-full border border-border text-muted-foreground text-xs font-medium py-2 rounded-xl hover:text-foreground hover:border-foreground/20 transition-colors">Log in</button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>Top Contributors</h3>
              <div className="flex flex-col gap-2.5">
                {users.sort((a, b) => b.karma - a.karma).slice(0, 4).map((user, i) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground/60 w-3 text-right">{i + 1}</span>
                    <Avatar user={user} size={22} />
                    <span className="text-[12px] font-medium flex-1 truncate">{user.username}</span>
                    <span className="font-mono text-[11px] text-orange-400 font-bold">{fmt(user.karma)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>Community Rules</h3>
              <ol className="flex flex-col gap-2">
                {["Be constructive, not combative", "No spam or self-promotion", "Cite your sources", "Respect all skill levels", "Keep posts relevant"].map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                    <span className="font-mono text-orange-500/80 shrink-0 font-bold">{i + 1}.</span>
                    {rule}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PostPage ──────────────────────────────────────────────────────────────────────

function PostPage({
  post, users, comments, currentUser, onBack, onVotePost, onVoteComment, onDeleteComment, onAddComment, onOpenProfile,
}: {
  post: Post; users: User[]; comments: Comment[]; currentUser: User | null;
  onBack: () => void; onVotePost: (d: 1 | -1) => void;
  onVoteComment: (id: string, d: 1 | -1) => void;
  onDeleteComment: (id: string) => void;
  onAddComment: (parentId: string | null, body: string) => void;
  onOpenProfile: (id: string) => void;
}) {
  const [newComment, setNewComment] = useState("");
  const author = users.find((u) => u.id === post.authorId)!;
  const userVote = currentUser ? ((post.votes[currentUser.id] ?? 0) as 1 | -1 | 0) : 0;
  const rootComments = comments.filter((c) => c.postId === post.id && c.parentId === null);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-14 pb-12">
      <button onClick={onBack} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mt-4 mb-4 transition-colors">
        ← Back to feed
      </button>

      <div className="bg-card border border-border rounded-2xl p-5 mb-3">
        <div className="flex gap-4">
          <VoteButtons score={post.score} userVote={userVote} onUpvote={() => currentUser && onVotePost(1)} onDownvote={() => currentUser && onVotePost(-1)} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
              <button className="text-orange-400 font-semibold hover:text-orange-300 transition-colors" onClick={() => onOpenProfile(author.id)}>{author.username}</button>
              <span className="opacity-40">·</span>
              <span className="font-mono">{timeAgo(post.createdAt)} ago</span>
              <span className="opacity-40">·</span>
              <span className="bg-muted/80 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold">{post.category}</span>
            </div>
            <h1 className="font-black leading-tight mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.02em", fontSize: "1.4rem" }}>
              {post.title}
            </h1>
            {post.type === "image" && post.imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden bg-muted max-h-96">
                <img src={post.imageUrl} alt={post.title} className="w-full object-cover max-h-96" />
              </div>
            )}
            {post.type === "link" && post.linkUrl && (
              <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mb-3 bg-muted/40 rounded-xl px-3 py-2 border border-border/60">
                <LinkIcon size={13} /><span className="truncate">{post.linkUrl}</span>
              </a>
            )}
            {post.body && <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.body}</p>}
          </div>
        </div>
      </div>

      {currentUser ? (
        <div className="bg-card border border-border rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Avatar user={currentUser} size={22} />
            <span className="text-[11px] text-muted-foreground">as <span className="text-orange-400 font-semibold">{currentUser.username}</span></span>
          </div>
          <textarea
            value={newComment} onChange={(e) => setNewComment(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full text-sm bg-muted/40 border border-border rounded-xl p-3 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-orange-500/40 transition-colors min-h-[90px]"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => { if (newComment.trim()) { onAddComment(null, newComment.trim()); setNewComment(""); } }}
              disabled={!newComment.trim()}
              className="text-xs font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-xl transition-colors"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}
            >
              COMMENT
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-4 mb-3 text-center text-[12px] text-muted-foreground">
          Log in to leave a comment
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-4">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>
          {rootComments.length} Comments
        </h2>
        {rootComments.length === 0 ? (
          <p className="text-[12px] text-muted-foreground text-center py-8">No comments yet. Be the first.</p>
        ) : (
          <div className="divide-y divide-border/30">
            {rootComments.map((c) => (
              <CommentNode key={c.id} comment={c} allComments={comments} users={users} currentUser={currentUser} depth={0} onVote={onVoteComment} onDelete={onDeleteComment} onReply={onAddComment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── UserProfile ───────────────────────────────────────────────────────────────────

function UserProfile({
  profileUser, posts, comments, users, currentUser, onOpenPost, onVote, onOpenProfile, onFlag, onDelete, onBack, onBan,
}: {
  profileUser: User; posts: Post[]; comments: Comment[]; users: User[];
  currentUser: User | null; onOpenPost: (id: string) => void;
  onVote: (id: string, d: 1 | -1) => void; onOpenProfile: (id: string) => void;
  onFlag: (id: string) => void; onDelete: (id: string) => void;
  onBack: () => void; onBan: (id: string) => void;
}) {
  const [tab, setTab] = useState<"posts" | "comments">("posts");
  const userPosts = posts.filter((p) => p.authorId === profileUser.id);
  const userComments = comments.filter((c) => c.authorId === profileUser.id && !c.isDeleted);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-14 pb-12">
      <button onClick={onBack} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mt-4 mb-4 transition-colors">← Back</button>

      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-4">
        <div className="h-16 bg-gradient-to-br from-orange-500/15 via-purple-500/8 to-transparent" />
        <div className="px-5 pb-5 -mt-7 flex items-end gap-4">
          <Avatar user={profileUser} size={60} />
          <div className="flex-1 pb-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em", fontSize: "1.2rem" }}>
                {profileUser.username.toUpperCase()}
              </h2>
              {profileUser.isAdmin && <span className="text-[9px] font-black bg-orange-500/15 text-orange-500 px-1.5 py-0.5 rounded uppercase tracking-widest">Admin</span>}
              {profileUser.isBanned && <span className="text-[9px] font-black bg-red-500/15 text-red-500 px-1.5 py-0.5 rounded uppercase tracking-widest">Banned</span>}
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">{profileUser.bio || "No bio yet."}</p>
          </div>
          {currentUser?.isAdmin && currentUser.id !== profileUser.id && (
            <button
              onClick={() => onBan(profileUser.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border shrink-0 transition-colors ${profileUser.isBanned ? "border-green-500/30 text-green-500 hover:bg-green-500/10" : "border-red-500/30 text-red-500 hover:bg-red-500/10"}`}
            >
              {profileUser.isBanned ? "Unban" : "Ban"}
            </button>
          )}
        </div>
        <div className="px-5 pb-4 flex gap-6 border-t border-border pt-3">
          {[["karma", fmt(profileUser.karma)], ["posts", userPosts.length], ["comments", userComments.length], ["joined", profileUser.createdAt.getFullYear()]].map(([label, val]) => (
            <div key={label as string}>
              <div className={`font-mono text-sm font-bold ${label === "karma" ? "text-orange-400" : ""}`}>{val}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit mb-4">
        {(["posts", "comments"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs font-bold px-4 py-1.5 rounded-lg transition-colors capitalize ${tab === t ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground"}`}
            style={tab === t ? { fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" } : undefined}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <div className="flex flex-col gap-2">
          {userPosts.length === 0
            ? <p className="text-sm text-muted-foreground text-center py-10">No posts yet.</p>
            : userPosts.map((p) => <PostCard key={p.id} post={p} users={users} currentUser={currentUser} onVote={onVote} onOpenPost={onOpenPost} onOpenProfile={onOpenProfile} onFlag={onFlag} onDelete={onDelete} />)
          }
        </div>
      )}

      {tab === "comments" && (
        <div className="flex flex-col gap-2">
          {userComments.length === 0
            ? <p className="text-sm text-muted-foreground text-center py-10">No comments yet.</p>
            : userComments.map((c) => {
              const p = posts.find((pp) => pp.id === c.postId);
              return (
                <div key={c.id} className="bg-card border border-border rounded-2xl p-4">
                  {p && <button onClick={() => onOpenPost(p.id)} className="text-[11px] text-muted-foreground hover:text-foreground mb-2 block truncate w-full text-left">In: <span className="text-orange-400">{p.title.slice(0, 65)}…</span></button>}
                  <p className="text-sm text-foreground/90 leading-relaxed">{c.body}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-mono text-[11px] text-orange-400 font-bold">↑ {c.score}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(c.createdAt)} ago</span>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────────

function AdminDashboard({
  posts, comments, users, reports, onBack, onDeletePost, onDeleteComment, onBanUser, onResolveReport,
}: {
  posts: Post[]; comments: Comment[]; users: User[]; reports: Report[];
  onBack: () => void; onDeletePost: (id: string) => void;
  onDeleteComment: (id: string) => void; onBanUser: (id: string) => void;
  onResolveReport: (id: string) => void;
}) {
  const [tab, setTab] = useState<"overview" | "reports" | "users" | "content">("overview");
  const flagged = posts.filter((p) => p.isFlagged);
  const pending = reports.filter((r) => !r.resolved);

  const stats = [
    { label: "Posts", value: posts.length, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Users", value: users.length, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Flagged", value: flagged.length, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Reports", value: pending.length, color: "text-red-400", bg: "bg-red-400/10" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-14 pb-12">
      <div className="flex items-center gap-3 mt-4 mb-6">
        <button onClick={onBack} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">← Back</button>
        <div className="flex items-center gap-2">
          <ShieldBan size={16} className="text-orange-500" />
          <h1 className="font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em", fontSize: "1.1rem" }}>ADMIN DASHBOARD</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map(({ label, value, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`text-[10px] font-black uppercase tracking-widest ${color} mb-2`} style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>{label}</div>
            <div className={`font-mono text-2xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit mb-4">
        {(["overview", "reports", "users", "content"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${tab === t ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground"}`}
            style={tab === t ? { fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" } : undefined}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>Recent Posts</h3>
            <div className="flex flex-col gap-2">
              {posts.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-start gap-2 text-[11px]">
                  <span className="text-muted-foreground font-mono shrink-0">{timeAgo(p.createdAt)}</span>
                  <span className="text-foreground/80 truncate">{p.title.slice(0, 48)}…</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.12em" }}>Score Distribution</h3>
            {[["2000+", posts.filter((p) => p.score > 2000).length], ["1000–2000", posts.filter((p) => p.score >= 1000 && p.score <= 2000).length], ["500–1000", posts.filter((p) => p.score >= 500 && p.score < 1000).length], ["< 500", posts.filter((p) => p.score < 500).length]].map(([r, c]) => (
              <div key={r as string} className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-muted-foreground font-mono w-16 shrink-0">{r}</span>
                <div className="flex-1 bg-muted/40 rounded-full h-1.5">
                  <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.max(4, ((c as number) / posts.length) * 100)}%` }} />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-4">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="flex flex-col gap-2">
          {pending.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center">
              <CheckCircle size={22} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No pending reports</p>
            </div>
          ) : pending.map((report) => {
            const reporter = users.find((u) => u.id === report.reporterId);
            return (
              <div key={report.id} className="bg-card border border-amber-500/20 rounded-2xl p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">{report.contentType}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(report.createdAt)} ago</span>
                  </div>
                  <p className="text-sm text-foreground">{report.reason}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">by {reporter?.username}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => { if (report.contentType === "post") onDeletePost(report.contentId); else onDeleteComment(report.contentId); onResolveReport(report.id); }}
                    className="text-xs text-red-500 hover:bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20 transition-colors font-medium"
                  >Remove</button>
                  <button onClick={() => onResolveReport(report.id)} className="text-xs text-green-500 hover:bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20 transition-colors font-medium">Dismiss</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "users" && (
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <div key={user.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <Avatar user={user} size={34} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{user.username}</span>
                  {user.isAdmin && <span className="text-[9px] font-black text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Admin</span>}
                  {user.isBanned && <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Banned</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">{user.email}</span>
                  <span className="text-[11px] font-mono text-orange-400 font-bold">{fmt(user.karma)}</span>
                </div>
              </div>
              {!user.isAdmin && (
                <button
                  onClick={() => onBanUser(user.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors ${user.isBanned ? "border-green-500/30 text-green-500 hover:bg-green-500/10" : "border-red-500/30 text-red-500 hover:bg-red-500/10"}`}
                >
                  {user.isBanned ? "Unban" : "Ban"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "content" && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-1.5" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
            <AlertTriangle size={11} /> Flagged Posts ({flagged.length})
          </p>
          {flagged.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-[12px] text-muted-foreground">No flagged posts</div>
          ) : flagged.map((post) => {
            const author = users.find((u) => u.id === post.authorId);
            return (
              <div key={post.id} className="bg-card border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{post.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">by {author?.username} · score: {post.score}</p>
                </div>
                <button onClick={() => onDeletePost(post.id)} className="text-xs text-red-500 hover:bg-red-500/10 px-2.5 py-1 rounded-xl border border-red-500/20 transition-colors font-medium shrink-0">Remove</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────────

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<View>("feed");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>(INIT_POSTS);
  const [comments, setComments] = useState<Comment[]>(INIT_COMMENTS);
  const [users, setUsers] = useState<User[]>(INIT_USERS);
  const [showAuth, setShowAuth] = useState<AuthMode | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sort, setSort] = useState<SortMode>("hot");
  const [reports, setReports] = useState<Report[]>(INIT_REPORTS);

  function handleLogin(username: string, _pw: string): boolean {
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.isBanned) return false;
    setCurrentUser(user); setShowAuth(null); return true;
  }

  function handleRegister(username: string, email: string, _pw: string): boolean {
    if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) return false;
    const colors = ["#ff4500", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];
    const newUser: User = {
      id: `u${Date.now()}`, username, email,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      bio: "", karma: 1, isAdmin: false, isBanned: false, createdAt: new Date(),
    };
    setUsers((p) => [...p, newUser]);
    setCurrentUser(newUser); setShowAuth(null); return true;
  }

  function handleVotePost(postId: string, dir: 1 | -1) {
    if (!currentUser) return;
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      const nv = { ...p.votes };
      if (nv[currentUser.id] === dir) delete nv[currentUser.id]; else nv[currentUser.id] = dir;
      const score = Object.values(nv).reduce((a, v) => a + v, 0) + 100;
      return { ...p, votes: nv, score };
    }));
  }

  function handleVoteComment(commentId: string, dir: 1 | -1) {
    if (!currentUser) return;
    setComments((prev) => prev.map((c) => {
      if (c.id !== commentId) return c;
      const nv = { ...c.votes };
      if (nv[currentUser.id] === dir) delete nv[currentUser.id]; else nv[currentUser.id] = dir;
      const score = Object.values(nv).reduce((a, v) => a + v, 0) + 20;
      return { ...c, votes: nv, score };
    }));
  }

  function handleDeletePost(postId: string) {
    setPosts((p) => p.filter((pp) => pp.id !== postId));
    if (view === "post") setView("feed");
  }

  function handleDeleteComment(commentId: string) {
    setComments((p) => p.map((c) => c.id === commentId ? { ...c, isDeleted: true } : c));
  }

  function handleFlagPost(postId: string) {
    if (!currentUser) return;
    setPosts((p) => p.map((pp) => pp.id === postId ? { ...pp, isFlagged: true } : pp));
    setReports((p) => [...p, { id: `r${Date.now()}`, contentType: "post", contentId: postId, reporterId: currentUser.id, reason: "Reported by user", createdAt: new Date(), resolved: false }]);
  }

  function handleAddComment(parentId: string | null, body: string) {
    if (!currentUser || !selectedPostId) return;
    const nc: Comment = {
      id: `c${Date.now()}`, postId: selectedPostId, parentId,
      authorId: currentUser.id, body, votes: {}, score: 1,
      createdAt: new Date(), isDeleted: false,
    };
    setComments((p) => [...p, nc]);
    setPosts((p) => p.map((pp) => pp.id === selectedPostId ? { ...pp, commentCount: pp.commentCount + 1 } : pp));
    setUsers((p) => p.map((u) => u.id === currentUser.id ? { ...u, karma: u.karma + 1 } : u));
  }

  function handleCreatePost(data: Omit<Post, "id" | "authorId" | "votes" | "score" | "createdAt" | "commentCount" | "isFlagged">) {
    if (!currentUser) return;
    const np: Post = { ...data, id: `p${Date.now()}`, authorId: currentUser.id, votes: { [currentUser.id]: 1 }, score: 1, createdAt: new Date(), commentCount: 0, isFlagged: false };
    setPosts((p) => [np, ...p]);
    setShowCreatePost(false);
  }

  function handleBanUser(userId: string) {
    setUsers((p) => p.map((u) => u.id === userId ? { ...u, isBanned: !u.isBanned } : u));
  }

  const selectedPost = posts.find((p) => p.id === selectedPostId);
  const selectedProfile = users.find((u) => u.id === (selectedUserId ?? currentUser?.id));

  const commonProps = {
    users, currentUser,
    onVote: handleVotePost,
    onOpenPost: (id: string) => { setSelectedPostId(id); setView("post"); },
    onOpenProfile: (id: string) => { setSelectedUserId(id); setView("profile"); },
    onFlag: handleFlagPost,
    onDelete: handleDeletePost,
  };

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Figtree', sans-serif" }}>
        <Navbar
          currentUser={currentUser} isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          onNavigate={(v) => { if (v === "profile") setSelectedUserId(currentUser?.id ?? null); setView(v); }}
          onAuth={setShowAuth}
          onLogout={() => { setCurrentUser(null); setView("feed"); }}
          onCreatePost={() => currentUser ? setShowCreatePost(true) : setShowAuth("login")}
        />

        {view === "feed" && (
          <HomeFeed posts={posts} sort={sort} onSort={setSort} onAuth={setShowAuth} onCreatePost={() => setShowCreatePost(true)} {...commonProps} />
        )}

        {view === "post" && selectedPost && (
          <PostPage
            post={selectedPost} comments={comments} currentUser={currentUser} users={users}
            onBack={() => setView("feed")}
            onVotePost={(d) => handleVotePost(selectedPost.id, d)}
            onVoteComment={handleVoteComment}
            onDeleteComment={handleDeleteComment}
            onAddComment={handleAddComment}
            onOpenProfile={(id) => { setSelectedUserId(id); setView("profile"); }}
          />
        )}

        {view === "profile" && selectedProfile && (
          <UserProfile
            profileUser={selectedProfile} posts={posts} comments={comments} users={users} currentUser={currentUser}
            onBack={() => setView("feed")}
            onBan={handleBanUser}
            {...commonProps}
          />
        )}

        {view === "admin" && currentUser?.isAdmin && (
          <AdminDashboard
            posts={posts} comments={comments} users={users} reports={reports}
            onBack={() => setView("feed")}
            onDeletePost={handleDeletePost} onDeleteComment={handleDeleteComment}
            onBanUser={handleBanUser}
            onResolveReport={(id) => setReports((p) => p.map((r) => r.id === id ? { ...r, resolved: true } : r))}
          />
        )}

        {showAuth && <AuthModal mode={showAuth} onClose={() => setShowAuth(null)} onLogin={handleLogin} onRegister={handleRegister} />}
        {showCreatePost && currentUser && <CreatePostModal onClose={() => setShowCreatePost(false)} onSubmit={handleCreatePost} />}
      </div>
    </div>
  );
}
