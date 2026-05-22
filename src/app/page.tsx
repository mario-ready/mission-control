"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type JSX,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

// ════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════

type Activity = Doc<"activities">;

const PX = 4; // pixel scale for sprites
const MARIO_W = 16 * PX;
const MARIO_H = 16 * PX;
const GROUND_H = 96;
const BLOCK_SIZE = 48;
const BLOCK_SPACING = 220;
const BLOCK_Y = 160; // above ground
const WORLD_PAD = 280;
const WALK_SPEED = 4.5;
const JUMP_VEL = 13;
const GRAVITY = 0.58;
const HUD_H = 56;

// ════════════════════════════════════════════════════════════
// SPRITE DATA — 16×16 pixel art, . = transparent
// ════════════════════════════════════════════════════════════

const CLR: Record<string, string> = {
  r: "#E44332",
  n: "#6B3400",
  s: "#FFAC5C",
  b: "#2038EC",
  y: "#FFD800",
};

/* prettier-ignore */ const S_IDLE = [
  '................',
  '.....rrrrr......',
  '....rrrrrrrrr...',
  '....nnnssns.....',
  '...nsnsssnsss...',
  '...nsnnsssns....',
  '...nnssssnnn....',
  '.....ssssss.....',
  '....rrrrrr......',
  '...rrsbbbrr.....',
  '..rrrsbybbrr....',
  '..ssrbbbbbrss...',
  '..sssbbbbbbss...',
  '....bbb.bbb.....',
  '...nnn...nnn....',
  '..nnnn...nnnn...',
];
/* prettier-ignore */ const S_RUN1 = [
  '................',
  '.....rrrrr......',
  '....rrrrrrrrr...',
  '....nnnssns.....',
  '...nsnsssnsss...',
  '...nsnnsssns....',
  '...nnssssnnn....',
  '.....ssssss.....',
  '....rrrrrr......',
  '...rrsbbbrr.....',
  '..rrrsbybbrr....',
  '..ssrbbbbbrss...',
  '..sssbbbbbbss...',
  '...bbb..........',
  '..nnn...bbb.....',
  '.nnnn..nnnn.....',
];
/* prettier-ignore */ const S_RUN2 = [
  '................',
  '.....rrrrr......',
  '....rrrrrrrrr...',
  '....nnnssns.....',
  '...nsnsssnsss...',
  '...nsnnsssns....',
  '...nnssssnnn....',
  '.....ssssss.....',
  '....rrrrrr......',
  '...rrsbbbrr.....',
  '..rrrsbybbrr....',
  '..ssrbbbbbrss...',
  '..sssbbbbbbss...',
  '..........bbb...',
  '.....bbb..nnn...',
  '.....nnnn..nnnn.',
];
/* prettier-ignore */ const S_JUMP = [
  '.....ss.........',
  '.....rrrrr......',
  '....rrrrrrrrr...',
  '....nnnssns.....',
  '...nsnsssnsss...',
  '...nsnnsssns....',
  '...nnssssnnn....',
  '.....ssssss.....',
  '...rrrbbrrr.....',
  '..rrrbbybbrr....',
  '.rrrrbbbbbrrr...',
  '.ssrbbbbbbbrss..',
  '..sbbbbbbbbs....',
  '..bbb....bbb....',
  '.nnn......nnn...',
  'nnnn......nnnn..',
];

const SPRITES = [S_IDLE, S_RUN1, S_RUN2, S_JUMP];

// ════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "JUST NOW";
  if (m < 60) return `${m}M AGO`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}H AGO`;
  return `${Math.floor(h / 24)}D AGO`;
}

function activityIcon(type: string): string {
  return (
    ({
      "gtm-brief": "⭐",
      "research-signal": "🍄",
      "slack-alert": "🔥",
      "post-sent": "🪙",
      "campaign-sent": "🌟",
    } as Record<string, string>)[type] ?? "❓"
  );
}

function activityLabel(type: string): string {
  return (
    ({
      "gtm-brief": "GTM BRIEF",
      "research-signal": "RESEARCH",
      "slack-alert": "SIGNAL",
      "post-sent": "POST",
      "campaign-sent": "CAMPAIGN",
    } as Record<string, string>)[type] ?? type.toUpperCase()
  );
}

// ════════════════════════════════════════════════════════════
// PIXEL SPRITE (SVG)
// ════════════════════════════════════════════════════════════

function Sprite({ data, scale = PX }: { data: string[]; scale?: number }) {
  const rows = data.length;
  const cols = data[0].length;
  const rects: JSX.Element[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = CLR[data[y][x]];
      if (c)
        rects.push(
          <rect key={`${x}_${y}`} x={x} y={y} width={1.02} height={1.02} fill={c} />,
        );
    }
  }
  return (
    <svg
      width={cols * scale}
      height={rows * scale}
      viewBox={`0 0 ${cols} ${rows}`}
      className="pixel-render"
    >
      {rects}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
// HUD
// ════════════════════════════════════════════════════════════

function HUD({ count, score }: { count: number; score: number }) {
  return (
    <div
      className="relative z-30 flex items-end justify-between px-4 sm:px-8 bg-black shrink-0 select-none"
      style={{ height: HUD_H }}
    >
      <div className="pb-2">
        <p className="font-retro text-white text-[7px] sm:text-[9px] tracking-wider">MARIO</p>
        <p className="font-retro text-white text-[9px] sm:text-[11px]">
          {String(score).padStart(6, "0")}
        </p>
      </div>
      <div className="flex items-center gap-1.5 pb-2">
        <span className="text-mario-coin text-sm">●</span>
        <p className="font-retro text-white text-[9px] sm:text-[11px]">
          ×{String(count).padStart(2, "0")}
        </p>
      </div>
      <div className="text-center pb-2">
        <p className="font-retro text-white text-[7px] sm:text-[9px] tracking-wider">WORLD</p>
        <p className="font-retro text-white text-[9px] sm:text-[11px]">1-1</p>
      </div>
      <div className="text-right pb-2 hidden sm:block">
        <p className="font-retro text-white text-[7px] sm:text-[9px] tracking-wider">TIME</p>
        <p className="font-retro text-white text-[9px] sm:text-[11px]">∞</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// WORLD ELEMENTS
// ════════════════════════════════════════════════════════════

function Cloud({ w }: { w: number }) {
  const h = w * 0.45;
  return (
    <div className="relative" style={{ width: w, height: h }}>
      <div
        className="absolute bg-white rounded-full"
        style={{ bottom: 0, left: "10%", width: "80%", height: "55%" }}
      />
      <div
        className="absolute bg-white rounded-full"
        style={{ bottom: "20%", left: "18%", width: "32%", height: "80%" }}
      />
      <div
        className="absolute bg-white rounded-full"
        style={{ bottom: "15%", left: "48%", width: "30%", height: "72%" }}
      />
    </div>
  );
}

function Pipe({ h }: { h: number }) {
  return (
    <div className="relative" style={{ width: 64, height: h + 20 }}>
      {/* lip */}
      <div
        className="absolute top-0 -left-[6px] rounded-t-md"
        style={{
          width: 76,
          height: 20,
          background:
            "linear-gradient(90deg, #006800 0%, #00A800 18%, #48D848 50%, #00A800 82%, #006800 100%)",
          borderTop: "3px solid #60F060",
        }}
      />
      {/* body */}
      <div
        className="absolute top-[20px] left-0"
        style={{
          width: 64,
          height: h,
          background:
            "linear-gradient(90deg, #006800 0%, #00A800 18%, #48D848 50%, #00A800 82%, #006800 100%)",
        }}
      />
    </div>
  );
}

function QuestionBlock({
  bumped,
  animating,
}: {
  bumped: boolean;
  animating: boolean;
}) {
  if (bumped) {
    return (
      <div
        className="w-full h-full"
        style={{
          background: "#886830",
          borderWidth: 4,
          borderStyle: "solid",
          borderTopColor: "#A08050",
          borderLeftColor: "#A08050",
          borderBottomColor: "#604018",
          borderRightColor: "#604018",
        }}
      />
    );
  }
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        animation: animating ? "block-bump 0.3s ease-out" : undefined,
        background: "#FAC000",
        borderWidth: 4,
        borderStyle: "solid",
        borderTopColor: "#FFE060",
        borderLeftColor: "#FFE060",
        borderBottomColor: "#C89800",
        borderRightColor: "#C89800",
        boxShadow: "inset 2px 2px 0 rgba(255,255,255,0.25)",
      }}
    >
      <span
        className="font-retro text-[#A07028] text-lg animate-float select-none"
        style={{ textShadow: "1px 1px 0 #C89800" }}
      >
        ?
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ACTIVITY DETAIL MODAL
// ════════════════════════════════════════════════════════════

function DetailModal({
  activity,
  onClose,
}: {
  activity: Activity;
  onClose: () => void;
}) {
  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/65" />

      {/* dialog */}
      <motion.div
        className="relative bg-black border-[5px] border-white p-5 sm:p-7 max-w-md mx-4 w-full"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        transition={{ type: "spring", damping: 22, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "8px 8px 0 rgba(0,0,0,0.4)" }}
      >
        {/* header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{activityIcon(activity.type)}</span>
          <span className="font-retro text-mario-block text-[9px] sm:text-[10px] uppercase tracking-wider">
            {activityLabel(activity.type)}
          </span>
        </div>

        {/* body */}
        <p className="font-retro text-white text-[8px] sm:text-[9px] leading-[2] mb-5">
          {activity.description}
        </p>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-white/20 pt-3">
          <span className="font-retro text-white/40 text-[6px] sm:text-[7px]">
            {timeAgo(activity.timestamp)} · {activity.agent.toUpperCase()}
          </span>
          {activity.url && (
            <a
              href={activity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-retro text-mario-coin text-[7px] sm:text-[8px] hover:underline"
            >
              VIEW →
            </a>
          )}
        </div>

        {/* close hint */}
        <p className="font-retro text-white/25 text-[6px] text-center mt-5">
          ESC OR CLICK OUTSIDE TO CLOSE
        </p>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
// PHYSICS STATE
// ════════════════════════════════════════════════════════════

interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dir: 1 | -1;
  jumping: boolean;
  frame: number;
  tick: number;
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════

export default function MissionControl() {
  // ── Convex data ──
  const activities = useQuery(api.functions.listActivities);

  // ── UI state ──
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [bumpedIds, setBumpedIds] = useState<Set<string>>(new Set());
  const [bumpAnimIds, setBumpAnimIds] = useState<Set<string>>(new Set());
  const [coinBursts, setCoinBursts] = useState<{ id: number; x: number }[]>([]);
  const [spriteFrame, setSpriteFrame] = useState(0);
  const [facingRight, setFacingRight] = useState(true);
  const [viewW, setViewW] = useState(1200);
  const [, setViewH] = useState(700);
  const [score, setScore] = useState(0);

  // ── Refs ──
  const marioRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const physRef = useRef<PhysicsState>({
    x: 120,
    y: 0,
    vx: 0,
    vy: 0,
    dir: 1,
    jumping: false,
    frame: 0,
    tick: 0,
  });
  const keysRef = useRef<Set<string>>(new Set());
  const activitiesRef = useRef(activities);
  const bumpedRef = useRef(bumpedIds);
  const prevFrameRef = useRef(0);
  const prevDirRef = useRef(true);

  // keep refs fresh
  useEffect(() => {
    activitiesRef.current = activities;
  }, [activities]);
  useEffect(() => {
    bumpedRef.current = bumpedIds;
  }, [bumpedIds]);

  // ── Derived ──
  const worldWidth = useMemo(() => {
    const count = activities?.length ?? 0;
    const contentW = count > 0 ? WORLD_PAD * 2 + count * BLOCK_SPACING : 0;
    return Math.max(viewW, contentW, 1200);
  }, [activities?.length, viewW]);

  // ── Decorations (deterministic) ──
  const decorations = useMemo(() => {
    const clouds: { id: number; x: number; y: number; w: number }[] = [];
    const seeds = [0.08, 0.24, 0.42, 0.61, 0.78, 0.93];
    const ys = [25, 65, 35, 55, 20, 50];
    const ws = [100, 70, 120, 80, 95, 75];
    for (let i = 0; i < seeds.length; i++) {
      clouds.push({ id: i, x: seeds[i] * worldWidth, y: ys[i], w: ws[i] });
    }

    const hills: { id: number; x: number; w: number; h: number }[] = [];
    const hSeeds = [0.02, 0.22, 0.45, 0.68, 0.88];
    const hW = [220, 140, 280, 120, 200];
    const hH = [100, 65, 120, 55, 90];
    for (let i = 0; i < hSeeds.length; i++) {
      hills.push({ id: i, x: hSeeds[i] * worldWidth, w: hW[i], h: hH[i] });
    }

    return { clouds, hills };
  }, [worldWidth]);

  // ── Viewport resize ──
  useEffect(() => {
    const update = () => {
      setViewW(window.innerWidth);
      setViewH(window.innerHeight - HUD_H);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Keyboard ──
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    const blur = () => keysRef.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // ── Block bump handler ──
  const doBump = useCallback(
    (activity: Activity, index: number) => {
      const id = activity._id;
      if (bumpedRef.current.has(id)) {
        // already bumped — just re-show detail
        setSelectedActivity(activity);
        return;
      }
      setBumpedIds((prev) => new Set(prev).add(id));
      setBumpAnimIds((prev) => new Set(prev).add(id));
      setScore((s) => s + 200);

      const coinId = Date.now();
      setCoinBursts((prev) => [
        ...prev,
        { id: coinId, x: WORLD_PAD + index * BLOCK_SPACING },
      ]);

      setTimeout(() => setSelectedActivity(activity), 280);
      setTimeout(
        () =>
          setBumpAnimIds((prev) => {
            const s = new Set(prev);
            s.delete(id);
            return s;
          }),
        350,
      );
      setTimeout(
        () => setCoinBursts((prev) => prev.filter((c) => c.id !== coinId)),
        750,
      );
    },
    [],
  );
  const doBumpRef = useRef(doBump);
  useEffect(() => {
    doBumpRef.current = doBump;
  }, [doBump]);

  // ── Game loop ──
  useEffect(() => {
    let rafId: number;
    const ww = worldWidth;
    const vw = viewW;

    const loop = () => {
      const s = physRef.current;
      const keys = keysRef.current;

      // ── Input ──
      const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D");
      const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
      const jump =
        keys.has("ArrowUp") || keys.has(" ") || keys.has("w") || keys.has("W");

      if (right) {
        s.vx = WALK_SPEED;
        s.dir = 1;
      } else if (left) {
        s.vx = -WALK_SPEED;
        s.dir = -1;
      } else {
        s.vx *= 0.7; // friction
        if (Math.abs(s.vx) < 0.3) s.vx = 0;
      }

      if (jump && !s.jumping) {
        s.vy = JUMP_VEL;
        s.jumping = true;
      }

      // ── Physics ──
      s.x += s.vx;
      s.vy -= GRAVITY;
      s.y += s.vy;

      if (s.y <= 0) {
        s.y = 0;
        s.vy = 0;
        s.jumping = false;
      }
      s.x = Math.max(0, Math.min(ww - MARIO_W, s.x));

      // ── Block collision ──
      if (s.vy > 0) {
        const head = s.y + MARIO_H;
        const acts = activitiesRef.current;
        if (acts) {
          for (let i = 0; i < acts.length; i++) {
            if (bumpedRef.current.has(acts[i]._id)) continue;
            const bx = WORLD_PAD + i * BLOCK_SPACING;
            const bL = bx - BLOCK_SIZE / 2;
            const bR = bx + BLOCK_SIZE / 2;
            if (
              head >= BLOCK_Y &&
              head <= BLOCK_Y + BLOCK_SIZE &&
              s.x + MARIO_W > bL &&
              s.x < bR
            ) {
              doBumpRef.current(acts[i], i);
              s.vy = -Math.abs(s.vy) * 0.25;
              break;
            }
          }
        }
      }

      // ── Animation frame ──
      s.tick++;
      if (s.jumping) {
        s.frame = 3;
      } else if (Math.abs(s.vx) > 0.5) {
        if (s.tick % 7 === 0) s.frame = s.frame === 1 ? 2 : 1;
      } else {
        s.frame = 0;
      }

      // ── Apply to DOM ──
      if (marioRef.current) {
        marioRef.current.style.left = `${s.x}px`;
        marioRef.current.style.bottom = `${GROUND_H + s.y}px`;
      }
      const camX = Math.max(0, Math.min(ww - vw, s.x - vw / 2 + MARIO_W / 2));
      if (worldRef.current) {
        worldRef.current.style.transform = `translateX(${-camX}px)`;
      }

      // ── Throttled React state ──
      if (s.frame !== prevFrameRef.current) {
        prevFrameRef.current = s.frame;
        setSpriteFrame(s.frame);
      }
      const nowRight = s.dir > 0;
      if (nowRight !== prevDirRef.current) {
        prevDirRef.current = nowRight;
        setFacingRight(nowRight);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [worldWidth, viewW]);

  // ── Block click handler ──
  const handleBlockClick = useCallback(
    (activity: Activity, index: number) => {
      doBump(activity, index);
    },
    [doBump],
  );

  // ── Current sprite ──
  const currentSprite = SPRITES[spriteFrame] ?? S_IDLE;

  // ── Loading state ──
  const isLoading = activities === undefined;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-black select-none">
      <HUD count={activities?.length ?? 0} score={score} />

      {/* ── GAME VIEWPORT ── */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #5C94FC 0%, #9CC4FC 70%, #B4D8FC 100%)",
        }}
      >
        {/* ── WORLD LAYER ── */}
        <div
          ref={worldRef}
          className="absolute top-0 bottom-0 will-change-transform"
          style={{ width: worldWidth }}
        >
          {/* ── Hills (background) ── */}
          {decorations.hills.map((h) => (
            <div
              key={`h${h.id}`}
              className="absolute rounded-t-full"
              style={{
                left: h.x,
                bottom: GROUND_H,
                width: h.w,
                height: h.h,
                background: `radial-gradient(ellipse at 50% 90%, #48A828 0%, #2D8A14 100%)`,
              }}
            >
              {/* hill spots */}
              <div
                className="absolute rounded-full bg-[#5CC03C]"
                style={{
                  width: h.w * 0.18,
                  height: h.h * 0.2,
                  top: "20%",
                  left: "30%",
                }}
              />
              <div
                className="absolute rounded-full bg-[#5CC03C]"
                style={{
                  width: h.w * 0.12,
                  height: h.h * 0.15,
                  top: "35%",
                  left: "60%",
                }}
              />
            </div>
          ))}

          {/* ── Clouds (background) ── */}
          {decorations.clouds.map((c) => (
            <div key={`c${c.id}`} className="absolute" style={{ left: c.x, top: c.y }}>
              <Cloud w={c.w} />
            </div>
          ))}

          {/* ── Pipe at end ── */}
          {worldWidth > viewW && (
            <div
              className="absolute"
              style={{ left: worldWidth - 140, bottom: GROUND_H }}
            >
              <Pipe h={96} />
            </div>
          )}

          {/* ── Starting pipe ── */}
          <div className="absolute" style={{ left: 40, bottom: GROUND_H }}>
            <Pipe h={64} />
          </div>

          {/* ── Question Blocks ── */}
          {(activities ?? []).map((activity, i) => (
            <button
              key={activity._id}
              className="absolute cursor-pointer focus:outline-none"
              style={{
                left: WORLD_PAD + i * BLOCK_SPACING - BLOCK_SIZE / 2,
                bottom: GROUND_H + BLOCK_Y,
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleBlockClick(activity, i);
              }}
            >
              <QuestionBlock
                bumped={bumpedIds.has(activity._id)}
                animating={bumpAnimIds.has(activity._id)}
              />
            </button>
          ))}

          {/* ── Coin bursts ── */}
          {coinBursts.map((cb) => (
            <div
              key={cb.id}
              className="absolute pointer-events-none"
              style={{
                left: cb.x - 6,
                bottom: GROUND_H + BLOCK_Y + BLOCK_SIZE,
              }}
            >
              <div className="animate-coin">
                <div className="w-3 h-4 rounded-sm bg-mario-coin border border-[#C8A000]" />
              </div>
            </div>
          ))}

          {/* ── Decorative brick row above ground ── */}
          {(activities?.length ?? 0) === 0 && (
            <div
              className="absolute flex gap-0"
              style={{ left: viewW * 0.3, bottom: GROUND_H + 80 }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    background: "#C84C0C",
                    borderWidth: 3,
                    borderStyle: "solid",
                    borderTopColor: "#E09848",
                    borderLeftColor: "#E09848",
                    borderBottomColor: "#A43000",
                    borderRightColor: "#A43000",
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Mario ── */}
          <div
            ref={marioRef}
            className="absolute z-20 will-change-[left,bottom]"
            style={{ left: 120, bottom: GROUND_H }}
          >
            <div style={{ transform: facingRight ? undefined : "scaleX(-1)" }}>
              <Sprite data={currentSprite} />
            </div>
          </div>

          {/* ── Ground ── */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: GROUND_H }}
          >
            {/* surface line */}
            <div className="h-[4px] bg-[#48A828]" />
            {/* bricks */}
            <div
              className="h-full"
              style={{
                background: "#C84C0C",
                backgroundImage: [
                  "repeating-linear-gradient(90deg, #A43000 0px, #A43000 2px, transparent 2px, transparent 48px)",
                  "repeating-linear-gradient(0deg, #A43000 0px, #A43000 2px, transparent 2px, transparent 24px)",
                ].join(", "),
              }}
            />
          </div>

          {/* ── Empty state overlay ── */}
          {!isLoading && activities?.length === 0 && (
            <div
              className="absolute inset-x-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ top: 0, bottom: GROUND_H + 80 }}
            >
              <motion.p
                className="font-retro text-white text-xs sm:text-sm tracking-wider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ textShadow: "2px 2px 0 #000" }}
              >
                NO ACTIVITIES YET
              </motion.p>
              <motion.p
                className="font-retro text-mario-coin text-[7px] sm:text-[8px] mt-4 animate-blink"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{ textShadow: "1px 1px 0 #000" }}
              >
                WAITING FOR MARIO... 🤌
              </motion.p>
            </div>
          )}

          {/* ── Loading ── */}
          {isLoading && (
            <div
              className="absolute inset-x-0 flex items-center justify-center pointer-events-none"
              style={{ top: 0, bottom: GROUND_H }}
            >
              <motion.p
                className="font-retro text-white text-[10px]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ textShadow: "2px 2px 0 #000" }}
              >
                LOADING WORLD 1-1...
              </motion.p>
            </div>
          )}
        </div>

        {/* ── Keyboard hint ── */}
        <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none z-10 hidden sm:block">
          <p
            className="font-retro text-white/30 text-[6px] tracking-wider"
            style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.4)" }}
          >
            ← → MOVE &nbsp;&nbsp; SPACE JUMP &nbsp;&nbsp; CLICK ? BLOCKS
          </p>
        </div>
      </div>

      {/* ── Activity detail modal ── */}
      <AnimatePresence>
        {selectedActivity && (
          <DetailModal
            key="detail"
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile controls ── */}
      <div className="fixed bottom-5 inset-x-0 flex justify-between items-end px-5 z-40 md:hidden pointer-events-none">
        <div className="flex gap-2.5 pointer-events-auto">
          <button
            onPointerDown={() => keysRef.current.add("ArrowLeft")}
            onPointerUp={() => keysRef.current.delete("ArrowLeft")}
            onPointerLeave={() => keysRef.current.delete("ArrowLeft")}
            className="w-[52px] h-[52px] rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-lg active:bg-white/30 select-none touch-none"
          >
            ◀
          </button>
          <button
            onPointerDown={() => keysRef.current.add("ArrowRight")}
            onPointerUp={() => keysRef.current.delete("ArrowRight")}
            onPointerLeave={() => keysRef.current.delete("ArrowRight")}
            className="w-[52px] h-[52px] rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-lg active:bg-white/30 select-none touch-none"
          >
            ▶
          </button>
        </div>
        <button
          onPointerDown={() => keysRef.current.add(" ")}
          onPointerUp={() => keysRef.current.delete(" ")}
          onPointerLeave={() => keysRef.current.delete(" ")}
          className="w-14 h-14 rounded-full bg-mario-red/50 backdrop-blur-sm flex items-center justify-center text-white font-retro text-[10px] active:bg-mario-red/70 select-none touch-none pointer-events-auto"
        >
          A
        </button>
      </div>
    </div>
  );
}
