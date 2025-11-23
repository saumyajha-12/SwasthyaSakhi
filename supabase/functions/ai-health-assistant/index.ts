import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, language = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an AI health assistant for Community Health Workers (CHWs) in rural India. 
Your role is to provide protocol-based medical guidance following WHO and Indian RCH standards.

Key responsibilities:
- Provide clear, actionable advice for pregnancy care (ANC/PNC)
- Guide on child health, vaccination schedules
- Help identify danger signs and when to refer patients
- Offer nutrition guidance
- Support decision-making for common illnesses

CRITICAL: Always flag high-risk conditions that require immediate referral.
Language: Respond in ${language === 'en' ? 'English' : 'the local language requested'}.
Keep responses concise, practical, and easy to understand for field workers.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI gateway error:', error);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Check for high-risk keywords
    const highRiskKeywords = ['bleeding', 'unconscious', 'convulsion', 'severe', 'emergency', 'refer immediately'];
    const isHighRisk = highRiskKeywords.some(keyword => 
      aiResponse.toLowerCase().includes(keyword)
    );

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        isHighRisk 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in ai-health-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
