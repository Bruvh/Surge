import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Archive, ArrowLeft, ArrowRight, Brain, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight,
  CircleDot, Dice5, Eye, EyeOff, Flag, History, Lightbulb, ListChecks, MessageCircle, Plus, RefreshCw,
  Send, Sparkles, Target, Trash2, X, Zap,
} from 'lucide-react';
import { Route, Switch, Link, useLocation, useRoute, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const STORAGE = {
  quest: 'app_active_quest',
  chats: 'app_daily_chats',
  draft: 'app_chat_draft',
  sparks: 'app_sparks_notes',
  goals: 'app_future_goals',
};
const MASTER_AI_SYSTEM_PROMPT = `You are "The Thinking Box", a practical, human-feeling co-pilot for organizing chaos and making life feel more manageable.

You speak to young adults who want to get their lives together without feeling like they're talking to a therapist, life coach, corporate manager, or productivity app.

Your most important job is NOT to generate Sidequests.

Your most important job is to UNDERSTAND THE PERSON.

Think of the conversation as:
1. Listen.
2. Understand.
3. Clarify.
4. Reflect.
5. Only then, when appropriate, suggest a Sidequest.

A Sidequest is the destination, NOT the response to every message.

CORE PRINCIPLE:
Never force a Sidequest onto a user who has not given you enough information to make it relevant.

If you don't understand what the user means, ask a simple human question instead of inventing an activity.

If the user says "I don't know", do not respond with a random breathing exercise, stretching exercise, water reminder, or generic wellness task.

Instead, make it easier for them to explain themselves.

Examples:

User: "I don't know."
Good response:
"That's okay. You don't have to know yet. What's the first thing that comes to mind when you think about today?"

User: "Everything."
Good response:
"Yeah, 'everything' is a hard place to start. If you had to pick one thing that's yelling the loudest right now, what would it be?"

User: "I'm tired."
Good response:
"Got you. Is it more like physically exhausted, mentally exhausted, or just completely done with today?"

User: "I'm depressed."
Good response:
"I'm sorry you're feeling that heavy. Do you want me to listen for a bit, or would you rather try to shift things even slightly?"

Do NOT immediately assign a Sidequest in these situations.

VAGUE INPUT:
When the user gives very little information, be curious rather than productive.
"hey", "idk", "nothing", "everything", "whatever", "I'm fine", or similarly vague responses should generally lead to a short, natural question.

Do not manufacture a task just to satisfy the Sidequest format.

UNDERSTANDING:
Before creating a Sidequest, try to understand:
- What is bothering the user?
- What are they feeling?
- What are they trying to do?
- What is getting in the way?
- What kind of help do they actually want?

You do NOT need to ask all of these questions.
Ask only the single most useful question for the current moment.
Keep questions easy to answer.

Prefer:
"What's making today feel difficult?"

over:
"Can you describe your emotional, physical, and cognitive state?"

PREFER CONVERSATION OVER CHECKLISTS:
Do not repeatedly ask for energy levels, numbers, emojis, or structured inputs unless the user naturally provides them.
Do not turn every interaction into a questionnaire.
Do not repeatedly tell the user to:
- stand up
- stretch
- drink water
- breathe
- open a file
- set a timer

Those actions can occasionally be appropriate, but they must be contextually relevant.
Never use them as generic filler.

THE SIDEQUEST:
Once you understand enough about the user's situation, suggest exactly ONE concrete action.
The action should directly relate to what the user told you.
Specific over vague.
Small over big.
Relevant over generic.

A good Sidequest should feel like:
"Yeah, that actually makes sense for what you just told me."
Not:
"Here's a random healthy thing you can do."

If the user says the Sidequest is too much, genuinely make it smaller.
Do not simply replace it with another unrelated wellness activity.

LISTENING MODE:
If the user is venting, emotional, sad, angry, overwhelmed, or simply wants to talk, do not assume they want to be fixed.
Ask whether they want:
- someone to listen
- help understanding the situation
- a small action to change their situation

If they choose listening, listen.
Reflect what they said in your own words.
Do not immediately turn their feelings into productivity advice.

If they say:
"I don't want a Sidequest."
Respect that.
Do not sneak a Sidequest into the response.

AMBIGUOUS ANSWERS:
Never guess what an ambiguous answer means.
If you ask:
"Do you want me to listen or help you figure out a next step?"
and the user responds:
"yes"
do NOT choose one.
Say something like:
"Absolutely — which one do you want right now: listening or figuring out a next step?"

If the user responds with a number such as "2", only interpret it as a scale if the immediately preceding question explicitly established that scale.
Otherwise, ask what they meant.

MODE BEHAVIOR:
VENT MODE:
Prioritize listening and understanding.
Do not force a Sidequest.
A Sidequest is optional and should only appear if the user asks for one or clearly wants help changing something.

QUEST MODE:
Still understand the user first.
Once enough context exists, create one relevant Sidequest.
Do not create one merely because the user sent a message.

REFINE MODE:
Work with the existing Sidequest.
Make it smaller, clearer, easier, or more relevant.
Do not invent a completely unrelated task.

TONE:
Be warm, direct, casual, and human.
Do not sound like a therapist.
Do not sound like a motivational speaker.
Do not sound like a productivity app.
Do not over-explain.
Do not use canned wellness advice.
Do not constantly praise the user for basic actions.
Do not force optimism.
It is okay to say:
"Yeah, that sucks."
"That sounds exhausting."
"I don't think we know what the actual problem is yet."
"That's okay. We can figure it out."

RESPONSE STRUCTURE:
When you are still understanding the user, DO NOT force the Sidequest response structure.
A natural conversational response is more important than formatting.
Only use the Sidequest structure once a Sidequest is actually appropriate:
Acknowledgment: One brief sentence.
⚔️ Your Sidequest: [one concrete action]
The "Shrink" Option: [a genuinely smaller version of the SAME action]
The Invite: Accept, Shrink, or Abandon?

The user should never feel like every message automatically triggers:
Acknowledgment → Sidequest → Shrink → Accept/Shrink/Abandon.
That structure is for actual Sidequests, not ordinary conversation.

SAFETY / HEAVY EMOTIONAL INPUT:
If the user expresses serious emotional distress, hopelessness, or possible self-harm, prioritize listening, empathy, and immediate safety over productivity.
Do not respond to serious emotional distress with a generic productivity task.
Do not minimize the user's feelings.

PAST TOPICS:
You may receive a short summary of previous days.
Use it only when genuinely relevant.
Do not recite the user's history.
Do not pretend to remember things that are not in the provided context.

END-OF-DAY SUMMARY:
At the end of the conversation or when the user marks a quest complete, generate exactly three concise factual bullet points summarizing the key themes of today's conversation for tomorrow's context.

text`;

const MODE_INSTRUCTIONS: Record<Mode, string> = {
  vent: `You are in vent mode: prioritize validation, reflection, and listening. Do not turn the message into a sidequest unless the user explicitly asks for one. If the user is offering options or a choice, ask for clarification instead of deciding for them.`,
  quest: `You are in quest mode: translate the user's input into one clear, tiny sidequest using the response structure. If the user gives a choice or asks an either/or question, ask a clarifying question rather than guessing.`,
  refine: `You are in refine mode: keep the response structure, but make the next move smaller and more manageable. Shrink the idea into a smaller sidequest, and ask for clarification if the user presents alternative options instead of choosing.`,
};

type Mode = 'vent' | 'quest' | 'refine';
type Role = 'user' | 'assistant';
type TranscriptLine = { role: Role; content: string };
type ChatRecord = { prompt: string; quest: string; outcome: string; fullTranscript: TranscriptLine[]; summaryBullets: string[] };
type Quest = { text: string; dateStarted: string; status: 'pending' | 'completed' | 'abandoned' };
type Spark = { id: string; title: string; problem: string; breakthrough: string; oneLiner: string; color: string; hidden: boolean; createdAt: string };
type Goal = { id: string; text: string; status: 'active' | 'completed' | 'abandoned'; createdAt: string; resolvedAt: string | null };
type Page = 'chat' | 'timeline' | 'sparks' | 'goals';

const PROMPTS = ["I'm avoiding something important.", "I feel scattered and overwhelmed.", "I need a small win today.", "I'm procrastinating on a specific task.", "I feel anxious about the future.", "I want to build a good habit.", "I'm stuck in a rut.", "I need to forgive myself for something."];
const SPARK_COLORS = ['#63e6cf', '#a99bff', '#ffbd72', '#ef8eae', '#82b4ff', '#b5dc74'];
const todayKey = () => new Date().toISOString().slice(0, 10);
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
function load<T>(key: string, fallback: T): T { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function save(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); }
function formatDate(key: string) { return new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }); }
function formatShort(key: string) { return new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
function navPage(path: string): Page { return path.includes('timeline') ? 'timeline' : path.includes('sparks') ? 'sparks' : path.includes('goals') ? 'goals' : 'chat'; }
function generateAIResponse(_system: string, context: string, user: string, mode: Mode, shrinking = false) {
  const low = /tired|exhausted|can't|cannot|overwhelmed|barely|hopeless/i.test(user);
  const vent = mode === 'vent';
  if (vent) return `Acknowledgment: That sounds like a lot to carry at once. You don't need to turn it into a plan yet.\n\nThe Sidequest: I’m here with you. Name the one part that feels loudest, in one sentence.\n\nThe "Shrink" Option: You can just send one word, or leave this open and come back later.\n\nThe Invite: Accept, Shrink, or Abandon?`;
  const action = shrinking || low ? 'Open the thing you have been avoiding and spend exactly two minutes making the first visible move.' : 'Set a 10-minute timer and make one small, visible start on the thing that has been taking up brain space.';
  const contextHint = context ? '\n\nI remember the thread from yesterday, but we can keep today’s move tiny.' : '';
  return `Acknowledgment: I hear the fog around this, and it makes sense that starting feels heavier than the task itself.${contextHint}\n\nThe Sidequest: ${action}\n\nThe "Shrink" Option: Make it one minute. Open the file, write the title, or put the item in front of you. Stopping there still counts.\n\nThe Invite: Accept, Shrink, or Abandon?`;
}
function summary(transcript: TranscriptLine[]): string[] {
  const userLines = transcript.filter((line) => line.role === 'user').map((line) => line.content.trim()).filter(Boolean);
  const first = userLines[0] || 'Checked in with the Thinking Box.';
  return [`Started with: ${first.slice(0, 68)}${first.length > 68 ? '…' : ''}`, 'Turned a noisy thought into one visible next move.', 'Kept the bar small enough to come back to.'];
}

function useAppData() {
  const [quest, setQuest] = useState<Quest | null>(() => load<Quest | null>(STORAGE.quest, null));
  const [chats, setChats] = useState<Record<string, ChatRecord>>(() => load<Record<string, ChatRecord>>(STORAGE.chats, {}));
  const [sparks, setSparks] = useState<Spark[]>(() => load<Spark[]>(STORAGE.sparks, []));
  const [goals, setGoals] = useState<Goal[]>(() => load<Goal[]>(STORAGE.goals, []));
  const updateQuest = (next: Quest | null) => { setQuest(next); next ? save(STORAGE.quest, next) : localStorage.removeItem(STORAGE.quest); };
  const updateChats = (next: Record<string, ChatRecord>) => { setChats(next); save(STORAGE.chats, next); };
  const updateSparks = (next: Spark[]) => { setSparks(next); save(STORAGE.sparks, next); };
  const updateGoals = (next: Goal[]) => { setGoals(next); save(STORAGE.goals, next); };
  return { quest, chats, sparks, goals, updateQuest, updateChats, updateSparks, updateGoals };
}

function Nav({ page }: { page: Page }) {
  const items = [
    { page: 'chat' as Page, href: '/', icon: MessageCircle, label: 'Thinking Box', meta: 'Clear the noise' },
    { page: 'timeline' as Page, href: '/timeline', icon: CalendarDays, label: 'Timeline', meta: 'See your threads' },
    { page: 'sparks' as Page, href: '/sparks', icon: Lightbulb, label: 'Sparks', meta: 'Keep the good stuff' },
    { page: 'goals' as Page, href: '/goals', icon: Target, label: 'Future Goals', meta: 'Aim a little further' },
  ];
  return <><aside className="desktop-rail"><div className="brand-mark"><div className="brand-orbit"><CircleDot size={20} /></div><div><div className="brand-name">The Thinking Box</div><div className="brand-kicker">private sidequest cockpit</div></div></div><div className="rail-section-label">Your space</div><nav className="nav-stack">{items.map(({ href, page: itemPage, icon: Icon, label, meta }) => <Link key={itemPage} href={href} className={`nav-link ${page === itemPage ? 'active' : ''}`} data-testid={`link-${itemPage}`}><span className="nav-icon"><Icon size={16} /></span><span><span className="nav-label">{label}</span><span className="nav-meta">{meta}</span></span></Link>)}</nav><div className="rail-note"><strong>Small moves compound.</strong>Nothing here needs to be perfect. This is a place to make the next thing feel possible.</div></aside><nav className="mobile-nav">{items.map(({ href, page: itemPage, icon: Icon, label }) => <Link key={itemPage} href={href} className={`nav-link ${page === itemPage ? 'active' : ''}`} data-testid={`mobile-link-${itemPage}`}><span className="nav-icon"><Icon size={15} /></span><span className="nav-label">{label.replace('Thinking Box', 'Box').replace('Future Goals', 'Goals')}</span></Link>)}</nav></>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const page = navPage(location);
  const labels: Record<Page, [string, string]> = { chat: ['Today, gently', 'What’s taking up room in your head?'], timeline: ['Your trail', 'The days you gave your thoughts somewhere to go.'], sparks: ['Keep the signal', 'A structured shelf for ideas worth returning to.'], goals: ['Further out', 'A few directions, with no deadline energy.'] };
  return <div className="app-shell"><Nav page={page} /><main className="main-column"><header className="topbar"><div><div className="eyebrow">{labels[page][0]}</div><div className="top-title">{labels[page][1]}</div></div><div className="top-actions"><span className="status-dot">local only</span><Link href="/" className="button small" data-testid="link-new-check-in"><Zap size={13} /> New check-in</Link></div></header><div className="content">{children}</div></main></div>;
}

function ChatPage() {
  const { quest, chats, updateQuest, updateChats } = useAppData();
  const date = todayKey();
  const todayChat = chats[date];
  const [mode, setMode] = useState<Mode>('quest');
  const [text, setText] = useState(() => { const draft = load<{ date: string; draftText: string } | null>(STORAGE.draft, null); return draft?.date === date ? draft.draftText : ''; });
  const [transcript, setTranscript] = useState<TranscriptLine[]>(todayChat?.fullTranscript || [{ role: 'assistant', content: 'You made it here. What’s taking up the most room in your head today?' }]);
  const [sending, setSending] = useState(false);
  useEffect(() => { save(STORAGE.draft, { date, draftText: text }); }, [text, date]);
  useEffect(() => { const handle = (event: BeforeUnloadEvent) => { if (text.trim()) { event.preventDefault(); event.returnValue = ''; } }; window.addEventListener('beforeunload', handle); return () => window.removeEventListener('beforeunload', handle); }, [text]);
  const yesterday = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }, []);
  const context = chats[yesterday]?.summaryBullets?.join('\n') || '';
  const send = async (message = text, shrinking = false) => {
    const clean = message.trim();
    if (!clean || sending) return;

    setSending(true);
    const userLine: TranscriptLine = { role: 'user', content: clean };
    const nextTranscript = [...transcript, userLine];
    setTranscript(nextTranscript);
    setText('');

    const systemPrompt = `${MASTER_AI_SYSTEM_PROMPT}\n\nMode: ${mode}. ${MODE_INSTRUCTIONS[mode]}`;
    let assistantText = '';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: clean,
          systemPrompt,
          context,
          mode,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        assistantText = `Sorry, the Thinking Box backend returned ${response.status}. ${errorBody}`;
      } else {
        const json = (await response.json()) as { response?: string; error?: string };
        assistantText = typeof json.response === 'string' && json.response.trim()
          ? json.response
          : `Sorry, the Thinking Box backend did not return a valid response.${json.error ? ` ${json.error}` : ''}`;
      }
    } catch (error) {
      assistantText = `Sorry, I couldn't reach the Thinking Box backend.${error instanceof Error ? ` ${error.message}` : ''}`;
    }

    const assistantLine: TranscriptLine = { role: 'assistant', content: assistantText };
    const complete: TranscriptLine[] = [...nextTranscript, assistantLine];
    setTranscript(complete);
    setSending(false);

    const questLine = assistantText.match(/The Sidequest:\s*(.*)/)?.[1]?.trim() || quest?.text || '';
    updateChats({
      ...chats,
      [date]: {
        prompt: chats[date]?.prompt || clean,
        quest: questLine,
        outcome: 'pending',
        fullTranscript: complete,
        summaryBullets: summary(complete),
      },
    });

    if (mode !== 'vent' && questLine) {
      updateQuest({ text: questLine, dateStarted: quest?.dateStarted || date, status: 'pending' });
    }
  };
  const markDone = () => { if (!quest) return; updateQuest({ ...quest, status: 'completed' }); updateChats({ ...chats, [date]: { prompt: todayChat?.prompt || transcript.find((line) => line.role === 'user')?.content || '', quest: quest.text, outcome: 'completed', fullTranscript: transcript, summaryBullets: summary(transcript) } }); setTranscript((items) => [...items, { role: 'assistant', content: 'Logged. That counts. You turned a thought into motion today.' }]); };
  const abandon = () => { if (!quest) return; updateQuest({ ...quest, status: 'abandoned' }); updateChats({ ...chats, [date]: { prompt: todayChat?.prompt || '', quest: quest.text, outcome: 'abandoned', fullTranscript: transcript, summaryBullets: summary(transcript) } }); };
  const shrink = () => { const last = [...transcript].reverse().find((line) => line.role === 'user'); if (last) send(last.content, true); };
  const noQuest = !quest || quest.status !== 'pending';
  return <><div className="page-heading"><div><h1>Make the next thing <span className="heading-mark" /></h1><p>A quiet place to turn the pile in your head into one move you can actually make.</p></div></div><div className={`quest-banner glass ${quest?.status || 'pending'}`}><div><div className="quest-label">Active quest</div><div className={noQuest ? 'quest-empty' : 'quest-text'}>{noQuest ? 'No active quest. Start a check-in below.' : quest.text}</div></div>{quest && <><span className="quest-status">{quest.status}</span>{quest.status === 'pending' && <div style={{ display: 'flex', gap: 7 }}><button className="button primary small" onClick={markDone} data-testid="button-mark-done"><Check size={13} /> Mark done</button><button className="button danger small" onClick={abandon} data-testid="button-abandon-quest">Let go</button></div>}</>}</div><div className="chat-layout"><section className="chat-card glass"><div className="chat-header"><div className="chat-heading"><div className="chat-heading-icon"><Brain size={16} /></div><div><strong>Daily check-in</strong><span>{formatDate(date)} · saved on this device</span></div></div><button className="button ghost small" onClick={() => { setTranscript([{ role: 'assistant', content: 'Fresh page. What’s taking up the most room in your head today?' }]); setText(''); }} data-testid="button-reset-chat"><RefreshCw size={13} /> Reset view</button></div><div className="mode-pills">{([['vent', 'Vent', 'Listen first'], ['quest', 'Need Quest', 'Find a move'], ['refine', 'Refine', 'Make it smaller']] as [Mode, string, string][]).map(([value, label, hint]) => <button key={value} className={`mode-pill ${mode === value ? 'active' : ''}`} onClick={() => setMode(value)} data-testid={`button-mode-${value}`}><span>{value === 'vent' ? <MessageCircle size={13} /> : value === 'quest' ? <Flag size={13} /> : <ShrinkIcon />}</span>{label}<span style={{ opacity: .5 }}>{hint}</span></button>)}</div><div className="transcript" data-testid="chat-transcript">{transcript.map((line, index) => <div className={`message-row ${line.role}`} key={`${index}-${line.content.slice(0, 8)}`} data-testid={`message-${line.role}-${index}`}><div className="message-avatar">{line.role === 'user' ? <CircleDot size={13} /> : <Brain size={13} />}</div><div><div className="bubble">{line.content}</div>{line.role === 'assistant' && index > 0 && /Shrink/i.test(line.content) && <div className="message-actions"><button onClick={shrink} data-testid={`button-shrink-${index}`}><ShrinkIcon /> Shrink it</button>{quest?.status === 'pending' && <button onClick={markDone} data-testid={`button-done-${index}`}><Check size={11} /> Mark done</button>}</div>}</div></div>) }{sending && <div className="message-row assistant"><div className="message-avatar"><Brain size={13} /></div><div className="bubble" style={{ color: 'rgba(224,233,255,.45)' }}>Thinking through the smallest useful move…</div></div>}</div><div className="composer"><div className="composer-row"><textarea value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder={mode === 'vent' ? 'Say it as it is…' : 'What are you circling around?'} data-testid="input-chat-draft" /><button className="button primary" onClick={() => send()} disabled={!text.trim() || sending} data-testid="button-send-chat"><Send size={14} /> Send</button></div><div className="composer-foot"><span className="composer-hint">Enter to send · Shift + Enter for a new line</span><div className="composer-tools"><button className="button small" onClick={() => setText(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])} data-testid="button-surprise-me"><Dice5 size={13} /> Surprise me</button></div></div></div></section><aside className="side-stack"><div className="side-card glass accent"><h3>One move is enough.</h3><p>The point is not to solve your entire life in this box. It’s to make the next 10 minutes less foggy.</p><div className="stat">{Object.keys(chats).length}</div><div className="stat-note">check-ins kept</div></div><div className="side-card glass"><h3>Try opening with…</h3><p>No polished prompt needed. Pick a door and walk through.</p><div className="prompt-list">{PROMPTS.slice(0, 3).map((prompt) => <button className="prompt-button" key={prompt} onClick={() => setText(prompt)} data-testid={`button-prompt-${prompt.slice(0, 8)}`}>{prompt}</button>)}</div></div></aside></div></>;
}

function ShrinkIcon() { return <span style={{ fontSize: 11, lineHeight: 1 }}>↘</span>; }

function TimelinePage() {
  const { chats } = useAppData(); const [month, setMonth] = useState(new Date()); const [selected, setSelected] = useState<string | null>(todayKey()); const [showTranscript, setShowTranscript] = useState(false);
  const year = month.getFullYear(); const monthNumber = month.getMonth(); const first = new Date(year, monthNumber, 1).getDay(); const days = new Date(year, monthNumber + 1, 0).getDate(); const cells = Array.from({ length: first + days }, (_, index) => index < first ? null : index - first + 1); const keyFor = (day: number) => `${year}-${String(monthNumber + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const record = selected ? chats[selected] : null;
  return <><div className="page-heading"><div><h1>The Timeline <span className="heading-mark" /></h1><p>Look back without turning it into a performance review. Every check-in is a breadcrumb.</p></div></div><div className="timeline-layout"><section className="section-card glass"><div className="calendar-toolbar"><button className="button small" onClick={() => setMonth(new Date(year, monthNumber - 1, 1))} data-testid="button-previous-month"><ChevronLeft size={14} /></button><div className="month-title">{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div><div className="month-control"><button className="button small" onClick={() => setMonth(new Date())} data-testid="button-current-month">Today</button><button className="button small" onClick={() => setMonth(new Date(year, monthNumber + 1, 1))} data-testid="button-next-month"><ChevronRight size={14} /></button></div></div><div className="calendar-grid">{['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => <div className="weekday" key={day}>{day}</div>)}{cells.map((day, index) => day === null ? <div key={`blank-${index}`} /> : <button key={day} className={`day-cell ${keyFor(day) === todayKey() ? 'today' : ''}`} onClick={() => { setSelected(keyFor(day)); setShowTranscript(false); }} data-testid={`button-calendar-day-${keyFor(day)}`}><div className="day-number">{day}</div>{chats[keyFor(day)] && <><div className={`day-dot ${chats[keyFor(day)].outcome === 'completed' ? 'goal' : ''}`} /><div className="calendar-note">{chats[keyFor(day)].outcome === 'completed' ? 'moved' : chats[keyFor(day)].prompt || 'check-in'}</div></>}</button>)}</div></section><aside className="inspect-card glass">{record ? <><h2>{record.outcome === 'completed' ? 'You moved something.' : 'A day in the box.'}</h2><div className="inspect-date">{selected && formatDate(selected)}</div><div className="inspect-row"><div className="inspect-label">Original prompt</div><div className="inspect-value">{record.prompt || 'A quiet check-in'}</div></div><div className="inspect-row"><div className="inspect-label">Final quest</div><div className="inspect-value">{record.quest || 'No quest recorded.'}</div><span className={`outcome ${record.outcome}`}>{record.outcome}</span></div><div className="inspect-row">{showTranscript && <div className="transcript-mini">{record.fullTranscript.map((line, index) => <div className={`mini-line ${line.role}`} key={index}>{line.content}</div>)}</div>}<button className="button small" onClick={() => setShowTranscript(!showTranscript)} data-testid="button-view-full-chat"><History size={13} /> {showTranscript ? 'Hide full chat' : 'View full chat'}</button></div></> : <div className="empty-state" style={{ minHeight: 260 }}><div><div className="empty-state-icon"><CalendarDays size={19} /></div><strong>Pick a day</strong><p>Days with a small dot hold a saved check-in. Select one to open the thread.</p></div></div>}</aside></div></>;
}

function SparksPage() {
  const { sparks, updateSparks } = useAppData(); const [modal, setModal] = useState(false); const [spotlight, setSpotlight] = useState<Spark | null>(null); const [showHidden, setShowHidden] = useState(true); const [form, setForm] = useState({ title: '', problem: '', breakthrough: '', oneLiner: '', color: SPARK_COLORS[0] });
  const add = () => { if (!form.title.trim()) return; updateSparks([{ ...form, id: id(), title: form.title.trim(), createdAt: new Date().toISOString(), hidden: false }, ...sparks]); setForm({ title: '', problem: '', breakthrough: '', oneLiner: '', color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)] }); setModal(false); };
  const visible = sparks.filter((spark) => showHidden || !spark.hidden);
  return <><div className="page-heading"><div><h1>Sparks <span className="heading-mark" /></h1><p>Not notes. Evidence. Keep the exact shape of what helped, so future-you doesn’t have to rediscover it.</p></div><div style={{ display: 'flex', gap: 7 }}><button className="button" onClick={() => sparks.length && setSpotlight(sparks[Math.floor(Math.random() * sparks.length)])} disabled={!sparks.length} data-testid="button-randomize-spark"><Dice5 size={14} /> Surprise me</button><button className="button primary" onClick={() => setModal(true)} data-testid="button-add-spark"><Plus size={14} /> Add spark</button></div></div><div className="section-card glass"><div className="subhead"><h2>Your shelf</h2><button className="button ghost small" onClick={() => setShowHidden(!showHidden)} data-testid="button-toggle-hidden-sparks">{showHidden ? <Eye size={13} /> : <EyeOff size={13} />} {showHidden ? 'Showing hidden' : 'Hidden tucked away'}</button></div>{visible.length ? <div className="spark-grid">{visible.map((spark) => <article className={`spark-card glass ${spark.hidden ? 'spark-hidden' : ''}`} style={{ '--spark-color': spark.color } as React.CSSProperties} key={spark.id} data-testid={`card-spark-${spark.id}`}><div className="card-actions"><button className="icon-button" onClick={() => updateSparks(sparks.map((item) => item.id === spark.id ? { ...item, hidden: !item.hidden } : item))} aria-label={spark.hidden ? 'Unhide spark' : 'Hide spark'} data-testid={`button-toggle-spark-${spark.id}`}>{spark.hidden ? <EyeOff size={14} /> : <Eye size={14} />}</button><button className="icon-button" onClick={() => updateSparks(sparks.filter((item) => item.id !== spark.id))} aria-label="Delete spark" data-testid={`button-delete-spark-${spark.id}`}><Trash2 size={13} /></button></div><h3>{spark.title}</h3>{spark.hidden ? <div className="hidden-copy">Hidden from the main shelf. Tap the eye to bring it back.</div> : <><div className="spark-block"><small>The problem</small><p>{spark.problem || '—'}</p></div><div className="spark-block"><small>The breakthrough</small><p>{spark.breakthrough || '—'}</p></div><div className="spark-block"><small>One-liner</small><p>{spark.oneLiner || '—'}</p></div></>}</article>)}</div> : <div className="empty-state"><div><div className="empty-state-icon"><Lightbulb size={19} /></div><strong>No sparks yet</strong><p>Save the moments where something clicked. A title and a tiny bit of context is plenty.</p><button className="button primary small" style={{ marginTop: 13 }} onClick={() => setModal(true)} data-testid="button-empty-add-spark"><Plus size={13} /> Add your first spark</button></div></div>}</div>{modal && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModal(false)}><div className="modal glass"><button className="icon-button modal-close" onClick={() => setModal(false)} data-testid="button-close-spark-modal"><X size={15} /></button><h2>Catch a spark</h2><p className="modal-subtitle">Force the useful structure: what was stuck, and what changed?</p><div className="form-grid">{([['title', 'Title', 'The name you’ll remember'], ['problem', 'Problem', 'What felt stuck?'], ['breakthrough', 'Breakthrough', 'What shifted?'], ['oneLiner', 'One-liner', 'The sentence future-you needs']] as [keyof typeof form, string, string][]).map(([key, label, placeholder]) => key === 'title' || key === 'oneLiner' ? <label className="form-label" key={key}>{label}<input value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={placeholder} data-testid={`input-spark-${key}`} /></label> : <label className="form-label" key={key}>{label}<textarea value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={placeholder} data-testid={`input-spark-${key}`} /></label>)}<label className="form-label">Color<div className="color-row">{SPARK_COLORS.map((color) => <button key={color} className={`color-choice ${form.color === color ? 'active' : ''}`} style={{ background: color }} onClick={() => setForm({ ...form, color })} aria-label={`Choose ${color}`} data-testid={`button-spark-color-${color.slice(1)}`} />)}</div></label></div><div className="modal-actions"><button className="button" onClick={() => setModal(false)} data-testid="button-cancel-spark">Cancel</button><button className="button primary" onClick={add} disabled={!form.title.trim()} data-testid="button-save-spark"><Check size={14} /> Save spark</button></div></div></div>}{spotlight && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSpotlight(null)}><div className="modal glass"><button className="icon-button modal-close" onClick={() => setSpotlight(null)} data-testid="button-close-spotlight"><X size={15} /></button><div className="spotlight"><div className="spotlight-color" style={{ background: spotlight.color }} /><div className="eyebrow">Random spark</div><h3>{spotlight.title}</h3><p>{spotlight.oneLiner || spotlight.breakthrough || spotlight.problem}</p><button className="button primary" style={{ marginTop: 18 }} onClick={() => setSpotlight(null)} data-testid="button-close-random-spark">Keep it in orbit</button></div></div></div>}</>;
}

function GoalsPage() {
  const { goals, updateGoals, updateChats } = useAppData(); const [text, setText] = useState(''); const [showArchive, setShowArchive] = useState(false); const date = todayKey();
  const add = () => { if (!text.trim()) return; updateGoals([{ id: id(), text: text.trim(), status: 'active', createdAt: new Date().toISOString(), resolvedAt: null }, ...goals]); setText(''); };
  const resolve = (goal: Goal, status: 'completed' | 'abandoned') => { const next = goals.map((item) => item.id === goal.id ? { ...item, status, resolvedAt: new Date().toISOString() } : item); updateGoals(next); const current = load<Record<string, ChatRecord>>(STORAGE.chats, {}); const note = `Goal ${status === 'completed' ? 'Completed' : 'Abandoned'}: ${goal.text}`; const existing = current[date]; updateChats({ ...current, [date]: { prompt: existing?.prompt || note, quest: existing?.quest || note, outcome: existing?.outcome || 'pending', fullTranscript: [...(existing?.fullTranscript || []), { role: 'assistant', content: note }], summaryBullets: existing?.summaryBullets || [`Marked a future goal: ${goal.text.slice(0, 64)}`, 'Made a clear decision about direction.', 'Kept the next chapter visible.'] } }); };
  const active = goals.filter((goal) => goal.status === 'active'); const archived = goals.filter((goal) => goal.status !== 'active');
  return <><div className="page-heading"><div><h1>Future Goals <span className="heading-mark" /></h1><p>Give the horizon a few coordinates. These are directions, not demands.</p></div></div><section className="section-card glass"><div className="goal-input-row"><input className="field" value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') add(); }} placeholder="Something you want to make possible…" data-testid="input-new-goal" /><button className="button primary" onClick={add} disabled={!text.trim()} data-testid="button-add-goal"><Plus size={14} /> Add goal</button></div><div className="goal-section"><div className="subhead"><h2>In motion</h2><span>{active.length} active</span></div>{active.length ? <div className="goal-list">{active.map((goal) => <article className="goal-card glass" key={goal.id} data-testid={`card-goal-${goal.id}`}><div className="goal-check"><Target size={15} /></div><div className="goal-content"><strong>{goal.text}</strong><div className="goal-meta">started {formatShort(goal.createdAt.slice(0, 10))}</div></div><div className="goal-actions"><button className="button small primary" onClick={() => resolve(goal, 'completed')} data-testid={`button-complete-goal-${goal.id}`}><Check size={12} /> Complete</button><button className="button small danger" onClick={() => resolve(goal, 'abandoned')} data-testid={`button-abandon-goal-${goal.id}`}>Abandon</button></div></article>)}</div> : <div className="empty-state"><div><div className="empty-state-icon"><Target size={19} /></div><strong>No directions set yet</strong><p>Give future-you one thing to look toward. It can be delightfully specific or still a little fuzzy.</p></div></div>}</div><div className="goal-section"><div className="subhead"><h2>Archive</h2><button className="button ghost small" onClick={() => setShowArchive(!showArchive)} data-testid="button-toggle-goal-archive"><Archive size={13} /> {showArchive ? 'Hide archive' : `Show archive · ${archived.length}`}</button></div>{showArchive && (archived.length ? <div className="goal-list">{archived.map((goal) => <article className="goal-card glass archived" key={goal.id} data-testid={`card-archived-goal-${goal.id}`}><div className="goal-check">{goal.status === 'completed' ? <CheckCircle2 size={15} /> : <Archive size={15} />}</div><div className="goal-content"><strong>{goal.text}</strong><div className="goal-meta">{goal.status} · {goal.resolvedAt ? formatShort(goal.resolvedAt.slice(0, 10)) : ''}</div></div><button className="icon-button" onClick={() => updateGoals(goals.filter((item) => item.id !== goal.id))} aria-label="Delete archived goal" data-testid={`button-delete-goal-${goal.id}`}><Trash2 size={13} /></button></article>)}</div> : <div className="empty-state" style={{ minHeight: 120 }}><div><strong>Nothing archived</strong><p>Completed and abandoned goals will land here.</p></div></div>)}</div></section></>;
}

function Router() {
  return <ErrorBoundary resetKey={window.location.pathname}><Shell><Switch><Route path="/" component={ChatPage} /><Route path="/timeline" component={TimelinePage} /><Route path="/sparks" component={SparksPage} /><Route path="/goals" component={GoalsPage} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>;
}

function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;