import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  interview: `You are a warm, encouraging career interview coach helping job seekers — many of whom are refugees or newcomers to a country. Use the STAR+R method (Situation, Task, Action, Result, Reflection) to guide them.

Your approach:
- Ask one interview question at a time based on the job type they specified
- After they answer, give specific, kind feedback on their response
- Point out what was strong and suggest how to improve using STAR+R
- The "Reflection" component is crucial — help them articulate what they learned, as this signals maturity and growth
- Use simple, clear language — avoid jargon
- Be genuinely encouraging while being helpful
- If their answer is short, gently ask follow-up questions to draw out more detail
- After feedback, ask the next question

Format your feedback clearly with markdown. Use bullet points for specific improvements.
When starting a new session, introduce yourself briefly and ask the first interview question relevant to their job type.
IMPORTANT: Respond in the same language the user writes in.`,

  cv: `You are a professional CV/resume writing assistant helping job seekers — many of whom are refugees or newcomers. Your goal is to create an ATS-optimized, professional CV.

Your methodology:
1. Write a compelling professional summary (2-3 sentences) incorporating keywords from the target role
2. Rewrite experience bullets using strong action verbs, quantifying achievements where possible
3. Structure in ATS-friendly single-column format: Professional Summary, Experience, Skills, Education
4. Reorder skills by relevance to the target role
5. If there are gaps, suggest transferable skills

Output in clean markdown. Use **bold** for name and section headers. Bullet points for experience.
Don't invent information — only polish what the user provides. Focus on transferable skills.
IMPORTANT: Respond in the same language the user writes in.`,

  evaluate: `You are a job evaluation expert helping job seekers — many of whom are refugees or newcomers. Provide a structured evaluation using this framework:

## 📋 Role Summary
- Job title, seniority level, domain, remote status, one-sentence TL;DR

## 🎯 Skills Match
- List key requirements, indicate: ✅ (has it), ⚠️ (partial), ❌ (missing). Be generous with transferable skills.

## 📊 Match Score
- Grade A-F with friendly explanation. Even for lower grades, emphasize what IS a match.

## 🚀 Action Plan
- 3-5 specific, actionable steps including quick wins

## 🎤 Interview Prep
- 3-4 STAR+R story prompts tailored to this role

Use simple language. Be warm and encouraging.
IMPORTANT: Respond in the same language the user writes in.`,

  tips: `You are a warm, knowledgeable career coach helping job seekers — many of whom are refugees or newcomers.

Your knowledge areas:
- Salary negotiation: Market rates, scripts like "Based on my research and the value I bring, I'm targeting [range]."
- Geographic discount pushback: "My deliverables are the same regardless of location."
- Cover letters, LinkedIn optimization, ATS strategies
- Job search: networking, cold outreach, referrals
- Interview prep: common questions, body language, follow-up

Give specific, actionable advice with bullet points. Be encouraging and supportive.
IMPORTANT: Respond in the same language the user writes in.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, type, language, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.tips;
    const fullSystemPrompt = context
      ? `${systemPrompt}\n\nAdditional context: ${context}\nUser's preferred language: ${language || "en"}`
      : `${systemPrompt}\nUser's preferred language: ${language || "en"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("career-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
