import { NextResponse } from 'next/server';

const templates: Record<string, { title: string; description: string; uom: string; target: string }> = {
  'Product Innovation': {
    title: 'Deploy AI-Powered Predictive Analytics Module',
    description: 'Launch a predictive analytics module that improves decision speed for enterprise users and is ready for quarterly adoption tracking.',
    uom: 'Timeline',
    target: '2026-11-15',
  },
  'Operational Excellence': {
    title: 'Reduce Cloud Infrastructure Idle Costs',
    description: 'Identify idle cloud resources, right-size environments, and reduce avoidable monthly infrastructure spend without service degradation.',
    uom: 'Max (Lower is better)',
    target: '15',
  },
  'Revenue Growth': {
    title: 'Expand Enterprise Client Acquisition Pipeline',
    description: 'Create a qualified enterprise pipeline with measurable new-logo opportunities and manager-visible conversion progress.',
    uom: 'Min (Higher is better)',
    target: '12',
  },
};

export async function POST(request: Request) {
  const { category } = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ goal: templates[category] ?? templates['Product Innovation'], source: 'demo-template' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Return one SMART business goal as JSON with title, description, uom, and target. uom must be one of Min (Higher is better), Max (Lower is better), Timeline, Zero-based.' },
          { role: 'user', content: `Generate one concise KPI goal for this category: ${category}` },
        ],
      }),
    });

    if (!response.ok) throw new Error(await response.text());
    const payload = await response.json();
    const goal = JSON.parse(payload.choices?.[0]?.message?.content ?? '{}');
    return NextResponse.json({ goal, source: 'openai' });
  } catch {
    return NextResponse.json({ goal: templates[category] ?? templates['Product Innovation'], source: 'fallback-template' });
  }
}
