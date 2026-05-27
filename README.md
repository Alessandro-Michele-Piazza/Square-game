Da zero a Full-Stack: ecco Square Games 🎮

Sono felice di presentare Square Games, il mio progetto web che unisce gaming, community e sviluppo full-stack.

Non è solo una vetrina di videogiochi: è una piattaforma interattiva dove l'utente può autenticarsi, gestire il profilo, pubblicare recensioni, salvare titoli nei preferiti e creare la propria Want to play list.

Cosa ho imparato e implementato in questo progetto (stato attuale):

🔹 Frontend dinamico con React 19 + Vite 8
Routing strutturato con React Router 7 (layout annidati, route lazy e loader per pagina) per una navigazione veloce e scalabile.

🔹 Architettura data-driven lato codice
I fetch principali passano dai loader in `src/router/loader.jsx`, con:

- filtri cumulativi (genere, piattaforma, metacritic)
- paginazione via query param
- fallback intelligenti su piattaforme RAWG (`platforms` / `parent_platforms`)

🔹 Backend & Database con Supabase
Autenticazione, profili e persistenza dati utente su PostgreSQL.
Tabelle usate nell'app: `profiles`, `favorites`, `want_to_play`, `reviews`.

🔹 Context e stato autenticazione
`UserContext` centralizza sessione, login/register/logout, sincronizzazione profilo e update dati utente con listener realtime su auth state.

🔹 Integrazione API RAWG
Catalogo giochi sempre aggiornato con ricerca, filtri per genere/developer/publisher/piattaforma e detail page completa (dettagli, trailer, screenshot).

🔹 UI/UX responsive in CSS puro
Design mobile-first, animazioni AOS, reset automatico dello scroll su cambio route e componenti modulari per mantenere il codice pulito e riusabile.

🔹 Cloud Storage per avatar
Upload avatar su Supabase Storage con signed URL per accesso sicuro alle immagini profilo.

🔹 Deploy pronto produzione
Deploy su Netlify con redirect SPA, caching ottimizzato per asset statici e build pipeline Vite.

Stack principale:

- React
- React Router
- Vite
- Supabase (Auth + Postgres + Storage)
- RAWG API
- CSS + AOS + React Icons

Setup locale veloce:

1. `npm install`
2. Configura il file `.env` con:
   - `VITE_RAWG_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. `npm run dev`

Build e qualità codice:

- `npm run lint`
- `npm run build`
- `npm run preview`

🚀 Guarda il codice su GitHub:
https://github.com/Alessandro-Michele-Piazza/Square-game

Sono aperto a feedback, curiosità o nuove opportunità.

#WebDevelopment #ReactJS #Supabase #FullStack #Gaming #CSS #Coding #AlessandroPiazza

<img width="1080" height="auto" alt="preview1_sito_square_games" src="https://github.com/user-attachments/assets/86ce3ed4-2c4f-482e-93e0-4774b8f1e218" />


<img width="1080" height="auto" alt="preview2_sito_square_games" src="https://github.com/user-attachments/assets/1cc78a50-a138-437d-bb56-fa30c50ec93e" />


<img width="1080" height="auto" alt="preview3_sito_square_games" src="https://github.com/user-attachments/assets/c178b476-4ef1-4ab6-acd1-a3375fc3b5c1" />

