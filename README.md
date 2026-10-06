# Mantelzorg Navigator (prototype)

Webprototype voor mantelzorgers van een naaste met dementie: intake, persoonlijke tijdlijn (Nu / Binnenkort / Later),
kennisbank per fase, expertblok en een AI-chatbot die de tijdlijn aanpast. Interface in het Nederlands.

## Installatie

```bash
npm install
cp .env.example .env.local   # vul ANTHROPIC_API_KEY in
npm run dev                  # http://localhost:3000
```

| Variabele | Verplicht | Uitleg |
|---|---|---|
| `ANTHROPIC_API_KEY` | ja voor echte chat | Alleen gebruikt in `src/app/api/chat/route.ts` (server-side), nooit in de browser. |
| `ANTHROPIC_MODEL` | nee | Standaard `claude-sonnet-5-5`. |

Zonder sleutel (of bij een storing) valt de chat terug op gescripte antwoorden voor de 3 voorbeeldvragen. Andere vragen geven dan een vriendelijke foutmelding met "Opnieuw proberen". De tijdlijn blijft altijd intact.

Deployen: Vercel of vergelijkbaar, zet `ANTHROPIC_API_KEY` als omgevingsvariabele.

## Demo-instructies (2 minuten)

1. **Welkomstscherm** → "Bekijk demo met Sanne" (of doorloop "Start" voor de 10 intakevragen).
2. **Resultaat**: Sanne zit in fase 3 met 3 eerste acties → "Naar mijn overzicht".
3. **Tijdlijn**: 15 taken verdeeld over Nu/Binnenkort/Later. Klik "Waarom nu?", "Afvinken" of "Laat expert dit doen".
4. **Chat** (knop rechtsonder): klik een voorbeeldvraag, bekijk "Ik heb je tijdlijn aangepast", klik "Bekijk wijzigingen" en probeer "Ongedaan maken".
5. **Expert**: "Vraag een expert" → formulier → taak krijgt status *Expert bezig*.
6. **Kennisbank**: tabs per fase en zoekbalk (probeer "CIZ").
7. Klaar? Knop **Demo resetten** in de header.

## Hoe wordt de fase bepaald?

Zie `bepaalFase` in `src/lib/intake.ts` (de eerste regel die past wint): laatste levensfase/overleden → 5; Wlz aangevraagd/toegekend of verpleeghuis → 4; diagnose én hulp (of snelle achteruitgang) → 3; onderzoek of diagnose zonder hulp → 2; anders → 1.
Taken uit de volgende fase verschijnen als "ook relevant" (zie `src/lib/seed.ts`).

## Structuur

- `src/lib/` – types, intake en fasebepaling, takenbibliotheek en seed (Sanne), kennisbank, store (localStorage), tijdlijnupdates (`apply.ts`), JSON-parser en system prompt voor de chat.
- `src/app/api/chat/route.ts` – serverroute naar de Anthropic API.
- `src/components/` – schermen en onderdelen.

## Beperkingen

Prototype: geen medisch of juridisch advies, geen echte persoonsgegevens (alleen lokale opslag), bedragen voor experts zijn placeholders.
