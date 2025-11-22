# Game Design Document

## Core Concept

An educational adventure game where children (ages 5-9) navigate through visual maps by completing mini-game challenges. The game adapts difficulty based on performance and implements a "Mercy Rule" to prevent frustration while maintaining educational value.

---

## Game Flow

### Phase 0: Setup

**Screen:** Setup Panel

**User Actions:**
1. Select Map Theme (Forest, Space, Candy, etc.)
2. Select Character Avatar (Knight, Astronaut, Bunny, etc.)
3. Click "Let's Go!" button

**System Actions:**
1. Create new session with UUID
2. Save initial state to server
3. Transition to Game Screen

---

### Phase 1: Map Navigation

**Screen:** Game Container with Canvas Map

**Visual Elements:**
- Background theme (colored gradient)
- Path connecting 9 nodes
- Node status indicators:
  - 🔒 Gray = Locked (future nodes)
  - ⭐ Yellow = Current (clickable)
  - ✅ Green = Completed
- Character sprite positioned on current node
- HUD showing:
  - Star count (⭐ X)
  - Level number

**Path Types:**
1. **Winding Path** - Sinusoidal curve across screen
2. **Circular Path** - Nodes arranged in circle

**User Actions:**
- Click on current (yellow) node to start challenge
- Clicking locked/completed nodes has no effect

---

### Phase 2: Challenge Gameplay

**Screen:** Modal Overlay (Dark Background)

**Modal Structure:**
```
┌─────────────────────────────────┐
│  Challenge!                     │  ← Header (Blue)
├─────────────────────────────────┤
│                                 │
│     [Mini-Game Content]         │  ← Game Container
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Mini-Game Interface:**
- Game-specific UI injected into container
- All games follow standard interface
- Audio instructions (optional)
- Interactive elements sized for children

**Example: Math Addition Game**
```
        8 + 5 = ?

    [12]  [13]  [14]
```

---

### Phase 3: Result Handling

The game implements a **Star-Based Progression System** with adaptive difficulty:

#### Success Scenarios

**1st Attempt Success:**
- ⭐⭐⭐ 3 Stars awarded
- "Awesome! ⭐⭐⭐" feedback message (2 seconds)
- Node turns green (completed)
- Character walks to next node
- Next challenge maintains current difficulty

**2nd Attempt Success:**
- ⭐⭐ 2 Stars awarded
- "Good Job! ⭐⭐" feedback message
- Same progression as above

**3rd Attempt Success:**
- ⭐ 1 Star awarded
- "You did it! ⭐" feedback message
- Same progression as above

#### Failure Scenarios

**1st or 2nd Failure:**
- "Try Again!" feedback message (1 second)
- Modal stays open
- Same challenge repeats
- No penalty to score

**3rd Failure (Mercy Rule):**
- System detects player is stuck
- "Good Try! Let's move on." encouragement
- Node still progresses (unlocks next)
- ⭐ 0 Stars awarded
- **Mercy Mode Flag** set to `true`
- Next challenge will be 1 difficulty level easier

---

## Adaptive Difficulty System

### Difficulty Levels

Each mini-game supports 5 difficulty tiers:

| Level | Description | Example (Math Addition) |
|-------|-------------|------------------------|
| 1 | Very Easy | 1-5 range, single digits |
| 2 | Easy | 5-10 range |
| 3 | Medium | 10-15 range |
| 4 | Hard | 15-20 range |
| 5 | Very Hard | 20+ range, multi-step |

### Difficulty Calculation

**Base Formula:**
```javascript
let difficulty = session.currentLevel; // Starts at 1
```

**Mercy Mode Adjustment:**
```javascript
if (session.mercyMode) {
    difficulty = Math.max(1, difficulty - 1);
}
```

**Example Flow:**
1. Player at Level 2 (difficulty = 2)
2. Fails 3 times → Mercy Rule triggered
3. Next challenge: difficulty = 1 (easier)
4. If player succeeds → mercyMode reset, back to difficulty 2

### Progression Logic

**On Success:**
- Mercy mode resets to `false`
- Difficulty returns to normal for level
- Player builds confidence

**On Repeated Mercy:**
- System maintains easier difficulty
- Prevents cascading frustration
- Allows progress without educational loss

---

## Star Economy

### Earning Stars

**Maximum Possible:**
- 9 nodes × 3 stars = **27 stars per level**

**Actual Earning:**
- Varies based on performance
- Typical range: 15-25 stars

### Star Requirements

**Current Demo:**
- No threshold for progression
- Stars are purely motivational

**Future Enhancements:**
1. **Unlock System**
   - 20+ stars = Gold character skin
   - 15-19 stars = Silver character skin
   - <15 stars = Bronze completion

2. **Replay Incentive**
   - "Can you get all 27 stars?"
   - Replay unlocked nodes for better score

3. **Achievement Badges**
   - "Perfect Level" (27/27 stars)
   - "No Mercy" (never triggered Mercy Rule)
   - "Quick Learner" (all 1st attempt wins)

---

## Mini-Game Design Standards

### Standard Interface

All mini-games must implement:

```javascript
window.GameLibrary["game_id"] = {
    config: {
        id: 'unique_id',
        name: 'Display Name',
        type: 'category'
    },
    start: function(container, difficulty, onComplete) {
        // 1. Clear container
        container.innerHTML = '';
        
        // 2. Generate challenge based on difficulty
        const challenge = generateChallenge(difficulty);
        
        // 3. Create UI elements
        const ui = createGameUI(challenge);
        
        // 4. Attach to container
        container.appendChild(ui);
        
        // 5. Handle user input
        // When game ends, call:
        onComplete(true);  // Success
        // or
        onComplete(false); // Failure
    }
};
```

### Design Guidelines

**Visual:**
- Large, colorful buttons (min 60px height)
- High contrast text (readable for children)
- Emoji/icons for clarity
- Minimal text (audio preferred)

**Interaction:**
- Single-click/tap actions
- Immediate feedback on selection
- No double-click required
- Touch-friendly sizing (40px+ targets)

**Difficulty Scaling:**
- **Tier 1:** 2-3 choices, obvious answers
- **Tier 2:** 3-4 choices, some similarity
- **Tier 3:** 4-5 choices, requires thought
- **Tier 4:** Multi-step problems
- **Tier 5:** Time pressure or complex logic

### Example Games

#### 1. Math Addition (`game_math_add.js`)
**Type:** Arithmetic
**Mechanics:**
- Display: "X + Y = ?"
- 3 multiple choice buttons
- 1 correct answer, 2 wrong (±1 from correct)

**Difficulty Scaling:**
```javascript
const max = difficulty * 4 + 1;
// Diff 1: 1-5
// Diff 2: 1-9
// Diff 3: 1-13
// Diff 4: 1-17
// Diff 5: 1-21
```

#### 2. Memory Flip (Future)
**Type:** Memory
**Mechanics:**
- Grid of face-down cards
- Click 2 to flip and match
- Match all pairs to win

**Difficulty Scaling:**
- Diff 1: 3 pairs (6 cards)
- Diff 2: 4 pairs (8 cards)
- Diff 3: 6 pairs (12 cards)
- Diff 4: 8 pairs (16 cards)
- Diff 5: 10 pairs + time limit

#### 3. Pattern Matching (Future)
**Type:** Logic
**Mechanics:**
- Show pattern: 🔴 🔵 🔴 ?
- Select next in sequence

**Difficulty Scaling:**
- Diff 1: AB pattern (2 elements)
- Diff 2: ABC pattern
- Diff 3: ABBA pattern
- Diff 4: Multi-attribute patterns
- Diff 5: Number sequences

---

## User Experience (UX) Flows

### Happy Path (Success)

```
1. Setup Screen
   ↓ (Select theme + character)
2. Game Map Loads
   ↓ (Character placed at Node 0)
3. "Let's Go!" message appears
   ↓ (Click Node 0)
4. Challenge Modal Opens
   ↓ (Play mini-game)
5. Win on 1st Try
   ↓ (Award 3 stars)
6. "Awesome! ⭐⭐⭐" feedback
   ↓ (Modal closes)
7. Character walks to Node 1
   ↓ (Repeat steps 3-7 for each node)
8. Complete Node 8
   ↓
9. "VICTORY!" message (5 seconds)
10. Game complete
```

### Struggle Path (Mercy Rule)

```
1-3. [Same as Happy Path]
4. Challenge Modal Opens
   ↓ (Play mini-game)
5. Fail Attempt #1
   ↓ ("Try Again!" message)
6. Modal stays open
   ↓ (Play same mini-game)
7. Fail Attempt #2
   ↓ ("Try Again!" message)
8. Modal stays open
   ↓ (Play same mini-game)
9. Fail Attempt #3
   ↓ (Mercy Rule Triggered)
10. "Good Try! Let's move on." message
    ↓ (mercyMode = true)
11. Modal closes
12. Character walks to Node 1
    ↓ (Next challenge is 1 difficulty lower)
13. Continue with easier game...
```

### Edge Cases

#### All Nodes Use Mercy
**Scenario:** Player fails every challenge
**Outcome:**
- Still completes level (0 stars)
- Every subsequent game is difficulty 1
- Player sees completion message
- No negative feedback shown

#### Mixed Performance
**Scenario:** Some successes, some mercies
**Outcome:**
- mercyMode toggles on/off dynamically
- Difficulty adjusts per node
- Final star count reflects performance
- Positive messaging throughout

---

## Audio System (Future)

### Sound Effects

**Feedback:**
- Success: Cheerful chime
- Failure: Gentle "hmm" sound
- Stars: Twinkle per star
- Character movement: Footsteps

**Ambience:**
- Theme-specific background music
- Soft, non-distracting
- Toggle on/off option

### Voice Instructions

**Challenge Start:**
- Auto-play instructions
- "Match the cards that are the same!"
- Child-friendly voice

**Encouragement:**
- Random positive phrases
- "You can do it!"
- "Keep trying!"

**Controls:**
- Mute button in HUD
- Volume slider in settings

---

## Accessibility Features

### Current Implementation
- High contrast colors
- Large text and buttons
- Simple language
- Visual feedback (colors + animations)

### Recommended Additions
1. **Screen Reader Support**
   - ARIA labels on all buttons
   - Descriptive alt text

2. **Keyboard Navigation**
   - Tab through options
   - Enter to select

3. **Colorblind Mode**
   - Pattern overlays on colors
   - Shape differentiation

4. **Difficulty Override**
   - Parent can set min/max difficulty
   - Lock difficulty at specific level

---

## Analytics & Reporting

### Data Captured

**Per Node:**
- Game type
- Difficulty level
- Attempts before success
- Stars earned
- Mercy flag

**Session Summary:**
- Total stars
- Average attempts per node
- Mercy rule count
- Time spent (future)

### Admin Dashboard (Future)

**Profile View:**
```
Alex's Progress
Level 1 - Forest Theme
━━━━━━━━━━━━━━━━━━━━━━━━━ 8/9 nodes
⭐ 21/27 stars

Performance by Game Type:
  Math Addition:    ⭐⭐⭐ (3 stars avg)
  Memory:           ⭐⭐  (2 stars avg)
  Pattern Matching: ⭐   (1 star avg) ⚠️
  
Recommendations:
  - Practice pattern recognition
  - Increase math difficulty
```

**Curriculum Builder:**
- Select specific game types per level
- Set difficulty ranges
- Create custom progressions

---

## Victory Conditions

### Level Completion
**Requirement:** Complete all 9 nodes
**Rewards:**
- Star count display
- Completion message
- Unlock next level (future)

### Perfect Score
**Requirement:** 27/27 stars
**Rewards:**
- Special "Perfect!" animation
- Gold trophy icon
- Character skin unlock

### Bronze Completion
**Requirement:** <10 stars
**Message:** "You finished! Want to try again for more stars?"
**Encouragement:** Replay option highlighted

---

## Game Modes (Future)

### Story Mode (Current)
- Linear progression
- Unlocks sequentially
- Save/resume capability

### Practice Mode
- Select any unlocked game
- No progression
- Instant replay
- Used for skill building

### Challenge Mode
- Time-limited challenges
- Leaderboards
- Compete for high scores
- Boss-level difficulty

### Multiplayer Mode
- Turn-based challenges
- Race to finish map
- Shared screen on tablet
- Cooperative option

---

## Themes & Characters

### Available Themes

1. **Forest** (Whispering Woods)
   - Colors: Green gradients
   - Path: Winding
   - Aesthetic: Nature, trees

2. **Space** (Galactic Route)
   - Colors: Dark blue with stars
   - Path: Circular orbit
   - Aesthetic: Sci-fi, planets

3. **Candy** (Sugar Rush Land)
   - Colors: Pink and pastels
   - Path: Winding
   - Aesthetic: Sweets, playful

4. **Ocean** (Deep Sea Quest)
   - Colors: Blue gradients
   - Path: Wavy
   - Aesthetic: Underwater

5. **Volcano** (Lava Summit)
   - Colors: Red and orange
   - Path: Steep climb
   - Aesthetic: Fire, intensity

6. **Sky** (Cloud Kingdom)
   - Colors: Light blue with clouds
   - Path: Floating platforms
   - Aesthetic: Airy, fluffy

7. **Desert** (Dune Caravan)
   - Colors: Yellow and tan
   - Path: Sandy curves
   - Aesthetic: Oasis, adventure

8. **Ice** (Frozen Frontier)
   - Colors: White and light blue
   - Path: Slippery zigzag
   - Aesthetic: Snow, crystals

### Character Selection

Each theme includes 3 themed characters:
- **Forest:** Knight 🛡️, Ranger 🏹, Bear 🐻
- **Space:** Astronaut 👨‍🚀, Alien 👽, Robot 🤖
- **Candy:** Gingerbread 🍪, Queen 👸, Gummy Bear 🧸
- (Etc.)

**Unlocking:**
- All characters available initially (demo)
- Future: Earn via star thresholds

---

## Retention & Engagement

### Session Length
**Target:** 10-15 minutes per level
- 9 nodes × ~1 minute each
- Includes challenge + navigation time

### Progress Saving
**Auto-Save:** After each node completion
**Resume:** Return to exact node/level

### Motivation Loops

**Short-Term:**
- Immediate star feedback
- Node completion satisfaction
- Character movement reward

**Medium-Term:**
- Level completion
- Star count goals
- Character unlocks

**Long-Term:**
- Complete all themes
- Perfect score achievements
- Skill mastery recognition

---

## Educational Value

### Learning Objectives

**Math Skills:**
- Basic arithmetic
- Number recognition
- Mental math

**Memory Skills:**
- Pattern recognition
- Visual memory
- Sequencing

**Logic Skills:**
- Problem solving
- Deductive reasoning
- Critical thinking

### Pedagogy

**Growth Mindset:**
- Mistakes are learning opportunities
- Mercy Rule prevents learned helplessness
- Positive reinforcement only

**Scaffolded Learning:**
- Adaptive difficulty ensures challenge
- Not too hard (frustration)
- Not too easy (boredom)
- "Zone of proximal development"

**Engagement:**
- Visual appeal
- Immediate feedback
- Sense of progress
- Autonomy in choices
