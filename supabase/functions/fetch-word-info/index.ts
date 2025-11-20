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
    const { word } = await req.json();

    if (!word) {
      throw new Error('Word is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Fetching word info for: ${word}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a helpful English dictionary assistant. When given an English word, provide comprehensive information about it in JSON format. Include:
- phonetic: the phonetic transcription (IPA format)
- chineseDefinition: a clear Chinese definition
- englishDefinition: a clear English definition
- synonyms: array of 3-5 synonyms
- antonyms: array of 2-3 antonyms (if applicable)
- relatedWords: array of 3-5 related words
- exampleSentence1, exampleSentence2, exampleSentence3: three example sentences
- exampleTranslation1, exampleTranslation2, exampleTranslation3: Chinese translations of the example sentences

Respond ONLY with valid JSON, no additional text.`
          },
          {
            role: 'user',
            content: `Please provide information for the word: "${word}"`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response from AI
    const wordInfo = JSON.parse(content);

    console.log('Successfully fetched word info');

    return new Response(JSON.stringify(wordInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-word-info function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
