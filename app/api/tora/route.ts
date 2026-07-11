import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are Tora, the friendly AI productivity assistant built into a student task-management app called Taskora.
You help students: break big tasks into smaller steps, estimate how long tasks will take, suggest the best time of day to do them,
build study plans before exams, summarize weekly productivity, give personalized suggestions, and answer general productivity questions.
Be concise, warm, and practical. Use short paragraphs or bullet points. Avoid generic filler.`;

function fallbackReply(message: string, context: string) {
  const lower = message.toLowerCase();
  if (lower.includes('break') || lower.includes('steps')) {
    return "Here's a simple way to break that down:\n\n1. Clarify the end goal in one sentence.\n2. List the 3-5 concrete steps needed to get there.\n3. Put a realistic time estimate on each step.\n4. Schedule the first step today — momentum matters more than a perfect plan.\n\n(Note: Tora is running in offline mode — add an ANTHROPIC_API_KEY on the server for fully personalized breakdowns.)";
  }
  if (lower.includes('study plan') || lower.includes('exam')) {
    return "A solid pre-exam plan:\n\n• Days 1-2: Skim all topics, flag weak areas.\n• Days 3-5: Deep-focus sessions (45 min work / 10 min break) on weak areas first.\n• Day 6: Practice past papers under timed conditions.\n• Day 7: Light review only — no new material, get real sleep.\n\n(Tora is running in offline mode — add an ANTHROPIC_API_KEY for a plan tailored to your actual tasks.)";
  }
  if (lower.includes('best time') || lower.includes('when should')) {
    return "For focused academic work, mornings or right after a break tend to work best — willpower is highest then. Save low-focus chores or entertainment for the evening. Try scheduling your hardest task first, before energy dips.";
  }
  if (lower.includes('estimate') || lower.includes('how long')) {
    return "A good rule of thumb: estimate the time, then add 25% buffer — most tasks take longer than expected once you include setup and interruptions.";
  }
  return `Thanks for the question! Tora is currently running in offline fallback mode (no ANTHROPIC_API_KEY set on the server), so responses are rule-based rather than fully personalized. Here's what I can tell from your task context: ${context.slice(0, 200) || 'no tasks shared yet.'} — try asking me to break down a task, build a study plan, or suggest the best time for something.`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: fallbackReply(message, context ?? '') });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Context about the student's current tasks:\n${context ?? 'none provided'}\n\nQuestion: ${message}`
          }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Anthropic API error:', errText);
      return NextResponse.json({ reply: fallbackReply(message, context ?? '') });
    }

    const data = await res.json();
    const text = data.content?.map((b: any) => b.text ?? '').join('\n') ?? '';
    return NextResponse.json({ reply: text || fallbackReply(message, context ?? '') });
  } catch (err) {
    console.error('Tora API route error:', err);
    return NextResponse.json({ error: 'Something went wrong talking to Tora.' }, { status: 500 });
  }
}
