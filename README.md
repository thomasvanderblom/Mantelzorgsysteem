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

### Demo-modus (zonder API-sleutel)

Is `ANTHROPIC_API_KEY` **niet** ingesteld, dan draait de chat automatisch in *Demo-modus*: gescripte scenario's met trefwoordherkenning (`src/lib/demoEngine.ts`, 20 scenario's, o.a. vallen, Wlz/CIZ, overbelasting, volmacht, mentorschap, werk en verlof, dagbesteding, respijtzorg, Wmo, dwalen, medicatie, gedrag, slaap, casemanager, kosten, verpleeghuis, levenseinde, vergeetachtigheid, expert, "waar begin ik" en "maak ongedaan"). Elk scenario geeft dezelfde tijdlijnupdates terug als de echte API (toevoegen, verplaatsen, urgentie, afronden, expert voorstellen, fase) en is ongedaan te maken, ook met de zin "maak dat ongedaan". Onbekende vragen krijgen een eerlijk antwoord met verwijzing naar huisarts, casemanager of expert.

In de chatkop staat een kleine indicator "Demo-modus" (te verbergen met "verberg", terug te halen met "Demo-modus tonen"). Zodra je de sleutel instelt en de server herstart, schakelt de app zelf over naar de echte API en verdwijnt de indicator. De status komt van `GET /api/chat`. Bij een storing in de echte API toont de chat een vriendelijke foutmelding met "Opnieuw proberen"; de tijdlijn blijft intact.

Deployen: Vercel of vergelijkbaar, zet `ANTHROPIC_API_KEY` als omgevingsvariabele.

## Demo-instructies (2 minuten)

1. **Welkomstscherm** → "Bekijk demo met Sanne" (of doorloop "Start" voor de 10 intakevragen).
2. **Resultaat**: Sanne zit in fase 3 met 3 eerste acties → "Naar mijn overzicht".
3. **Tijdlijn**: 15 taken verdeeld over Nu/Binnenkort/Later. Klik "Waarom nu?", "Afvinken" of "Laat expert dit doen".
4. **Chat** (knop rechtsonder): klik een voorbeeldvraag, bekijk "Ik heb je tijdlijn aangepast", klik "Bekijk wijzigingen" en probeer "Ongedaan maken".
5. **Expert**: "Vraag een expert" → formulier → taak krijgt status *Expert bezig*.
6. **Kennisbank**: tabs per fase en zoekbalk (probeer "CIZ").
7. Klaar? Knop **Demo resetten** in de header.

## Bronnen en betrouwbaarheid

- `src/lib/bronnen.ts` is het **bronnenregister** (Alzheimer Nederland, Dementie.nl, Zorginstituut Nederland, CIZ, Rijksoverheid, Regelhulp, MantelzorgNL, Notaris.nl, De Rechtspraak, Zorgkaart Nederland, Palliaweb). Taken (`TAAK_BRONNEN` in `seed.ts`), de kennisbank (`bronnen` per fase) en chatantwoorden verwijzen met een id naar dit register. In de UI zie je "Meer informatie bij: ...".
- **Live chat:** `src/lib/retrieval.ts` zoekt per vraag de best passende fragmenten in kennisbank en takenbibliotheek en stuurt die met hun bron-id's mee (BRONNENCONTEXT). De system prompt verplicht het model om feiten daaruit te halen, eerlijk te zeggen wat er niet in staat en het veld `bronnen` te vullen. Onbekende bron-id's van het model worden in `chatParse.ts` weggefilterd.
- **Demo-modus:** elk scenario heeft vaste bronnen.
- **Let op:** de links wijzen naar de hoofdsite van de organisatie en de teksten in de app zijn eigen samenvattingen, geen citaten. Controleer inhoud en termijnen voor gebruik bij de bron en voeg diepe links toe zodra je ze hebt geverifieerd.

## Hoe wordt de fase bepaald?

Zie `bepaalFase` in `src/lib/intake.ts` (de eerste regel die past wint): laatste levensfase/overleden → 5; Wlz aangevraagd/toegekend of verpleeghuis → 4; diagnose én hulp (of snelle achteruitgang) → 3; onderzoek of diagnose zonder hulp → 2; anders → 1.
Taken uit de volgende fase verschijnen als "ook relevant" (zie `src/lib/seed.ts`).

## Structuur

- `src/lib/` – types, intake en fasebepaling, takenbibliotheek en seed (Sanne), kennisbank, store (localStorage), tijdlijnupdates (`apply.ts`), JSON-parser en system prompt voor de chat.
- `src/app/api/chat/route.ts` – serverroute naar de Anthropic API.
- `src/components/` – schermen en onderdelen.

## Beperkingen

Prototype: geen medisch of juridisch advies, geen echte persoonsgegevens (alleen lokale opslag), bedragen voor experts zijn placeholders.
